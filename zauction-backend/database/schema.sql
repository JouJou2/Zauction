-- Zauction Database Schema for Supabase PostgreSQL
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_role ON users(role);

-- =====================================================
-- AUCTIONS TABLE
-- =====================================================
CREATE TABLE auctions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  location VARCHAR(255),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  buyers_premium DECIMAL(5,2) DEFAULT 25.00,
  image_url VARCHAR(500),
  featured BOOLEAN DEFAULT FALSE,
  status VARCHAR(20) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'ended')),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_auctions_status ON auctions(status);
CREATE INDEX idx_auctions_end_date ON auctions(end_date);
CREATE INDEX idx_auctions_featured ON auctions(featured);

-- =====================================================
-- LOTS TABLE
-- =====================================================
CREATE TABLE lots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auction_id UUID REFERENCES auctions(id) ON DELETE CASCADE,
  lot_number INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  condition VARCHAR(100),
  provenance TEXT,
  estimate_low DECIMAL(10,2),
  estimate_high DECIMAL(10,2),
  starting_bid DECIMAL(10,2) NOT NULL,
  reserve_price DECIMAL(10,2),
  current_bid DECIMAL(10,2),
  bid_increment DECIMAL(10,2) DEFAULT 100.00,
  bid_count INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'sold', 'unsold', 'withdrawn')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(auction_id, lot_number)
);

CREATE INDEX idx_lots_auction ON lots(auction_id);
CREATE INDEX idx_lots_status ON lots(status);
CREATE INDEX idx_lots_current_bid ON lots(current_bid);

-- =====================================================
-- LOT MEDIA TABLE
-- =====================================================
CREATE TABLE lot_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lot_id UUID REFERENCES lots(id) ON DELETE CASCADE,
  media_type VARCHAR(20) CHECK (media_type IN ('image', 'video')),
  url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_lot_media_lot ON lot_media(lot_id);
CREATE INDEX idx_lot_media_order ON lot_media(lot_id, display_order);

-- =====================================================
-- BIDS TABLE
-- =====================================================
CREATE TABLE bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lot_id UUID REFERENCES lots(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'outbid', 'winning', 'won', 'lost')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_bids_lot ON bids(lot_id);
CREATE INDEX idx_bids_user ON bids(user_id);
CREATE INDEX idx_bids_created ON bids(created_at DESC);
CREATE INDEX idx_bids_lot_created ON bids(lot_id, created_at DESC);

-- =====================================================
-- WATCHLIST TABLE
-- =====================================================
CREATE TABLE watchlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  lot_id UUID REFERENCES lots(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lot_id)
);

CREATE INDEX idx_watchlist_user ON watchlist(user_id);
CREATE INDEX idx_watchlist_lot ON watchlist(lot_id);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_auctions_updated_at BEFORE UPDATE ON auctions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lots_updated_at BEFORE UPDATE ON lots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update lot bid count and current bid
CREATE OR REPLACE FUNCTION update_lot_on_bid()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE lots
  SET 
    current_bid = NEW.amount,
    bid_count = bid_count + 1,
    updated_at = NOW()
  WHERE id = NEW.lot_id;
  
  -- Mark previous bids as outbid
  UPDATE bids
  SET status = 'outbid'
  WHERE lot_id = NEW.lot_id 
    AND id != NEW.id
    AND status = 'winning';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update lot when bid is placed
CREATE TRIGGER update_lot_after_bid AFTER INSERT ON bids
  FOR EACH ROW EXECUTE FUNCTION update_lot_on_bid();

-- =====================================================
-- SEED DATA (Admin User)
-- =====================================================
-- Password: admin123 (hashed with bcrypt)
INSERT INTO users (email, password_hash, full_name, role, status)
VALUES (
  'admin@zauction.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqGOqOqOqO',
  'Admin User',
  'admin',
  'approved'
);

-- =====================================================
-- ROW LEVEL SECURITY (Optional but recommended)
-- =====================================================
-- Enable RLS on tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;

-- Policies (basic examples - adjust as needed)
-- Users can read their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Everyone can view active auctions
CREATE POLICY "Anyone can view auctions" ON auctions
  FOR SELECT USING (true);

-- Everyone can view lots
CREATE POLICY "Anyone can view lots" ON lots
  FOR SELECT USING (true);

-- Users can view their own bids
CREATE POLICY "Users can view own bids" ON bids
  FOR SELECT USING (auth.uid() = user_id);

-- Users can view their own watchlist
CREATE POLICY "Users can view own watchlist" ON watchlist
  FOR SELECT USING (auth.uid() = user_id);
