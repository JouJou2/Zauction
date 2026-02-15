-- Zauction Railway schema sync (idempotent)
-- Run this once in Railway Postgres SQL editor.

BEGIN;

-- Needed for gen_random_uuid() used by live_auction_notifications
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =========================================================
-- Enums (create only if missing)
-- =========================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserRole') THEN
        CREATE TYPE "UserRole" AS ENUM ('user', 'admin');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'UserStatus') THEN
        CREATE TYPE "UserStatus" AS ENUM ('pending', 'approved', 'rejected', 'suspended');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'AuctionStatus') THEN
        CREATE TYPE "AuctionStatus" AS ENUM ('upcoming', 'active', 'ended');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'LotStatus') THEN
        CREATE TYPE "LotStatus" AS ENUM ('active', 'sold', 'unsold', 'withdrawn');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MediaType') THEN
        CREATE TYPE "MediaType" AS ENUM ('image', 'video');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'BidStatus') THEN
        CREATE TYPE "BidStatus" AS ENUM ('active', 'outbid', 'winning', 'won', 'lost');
    END IF;
END $$;

-- =========================================================
-- Required columns that were missing in some deployments
-- =========================================================
ALTER TABLE IF EXISTS users
    ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

ALTER TABLE IF EXISTS auctions
    ADD COLUMN IF NOT EXISTS image_data TEXT;

ALTER TABLE IF EXISTS lots
    ADD COLUMN IF NOT EXISTS image_data TEXT;

-- Prisma expects TEXT for these two
ALTER TABLE IF EXISTS lot_media
    ALTER COLUMN url TYPE TEXT;

ALTER TABLE IF EXISTS lot_media
    ALTER COLUMN thumbnail_url TYPE TEXT;

-- =========================================================
-- live_auction_notifications table used by notifier service
-- =========================================================
CREATE TABLE IF NOT EXISTS live_auction_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auction_id UUID UNIQUE NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================
-- Important indexes / unique constraints (idempotent)
-- =========================================================
CREATE UNIQUE INDEX IF NOT EXISTS users_email_key ON users(email);
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS users_status_idx ON users(status);
CREATE INDEX IF NOT EXISTS users_role_idx ON users(role);

CREATE INDEX IF NOT EXISTS auctions_status_idx ON auctions(status);
CREATE INDEX IF NOT EXISTS auctions_end_date_idx ON auctions(end_date);
CREATE INDEX IF NOT EXISTS auctions_featured_idx ON auctions(featured);

CREATE UNIQUE INDEX IF NOT EXISTS lots_auction_id_lot_number_key ON lots(auction_id, lot_number);
CREATE INDEX IF NOT EXISTS lots_auction_id_idx ON lots(auction_id);
CREATE INDEX IF NOT EXISTS lots_status_idx ON lots(status);
CREATE INDEX IF NOT EXISTS lots_current_bid_idx ON lots(current_bid);

CREATE INDEX IF NOT EXISTS lot_media_lot_id_idx ON lot_media(lot_id);
CREATE INDEX IF NOT EXISTS lot_media_lot_id_display_order_idx ON lot_media(lot_id, display_order);

CREATE INDEX IF NOT EXISTS bids_lot_id_idx ON bids(lot_id);
CREATE INDEX IF NOT EXISTS bids_user_id_idx ON bids(user_id);
CREATE INDEX IF NOT EXISTS bids_created_at_idx ON bids(created_at DESC);
CREATE INDEX IF NOT EXISTS bids_lot_id_created_at_idx ON bids(lot_id, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS watchlist_user_id_lot_id_key ON watchlist(user_id, lot_id);
CREATE INDEX IF NOT EXISTS watchlist_user_id_idx ON watchlist(user_id);
CREATE INDEX IF NOT EXISTS watchlist_lot_id_idx ON watchlist(lot_id);

-- =========================================================
-- Foreign keys (add only if missing)
-- =========================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'auctions_created_by_fkey') THEN
        ALTER TABLE auctions
            ADD CONSTRAINT auctions_created_by_fkey
            FOREIGN KEY (created_by) REFERENCES users(id)
            ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lots_auction_id_fkey') THEN
        ALTER TABLE lots
            ADD CONSTRAINT lots_auction_id_fkey
            FOREIGN KEY (auction_id) REFERENCES auctions(id)
            ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lot_media_lot_id_fkey') THEN
        ALTER TABLE lot_media
            ADD CONSTRAINT lot_media_lot_id_fkey
            FOREIGN KEY (lot_id) REFERENCES lots(id)
            ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bids_lot_id_fkey') THEN
        ALTER TABLE bids
            ADD CONSTRAINT bids_lot_id_fkey
            FOREIGN KEY (lot_id) REFERENCES lots(id)
            ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'bids_user_id_fkey') THEN
        ALTER TABLE bids
            ADD CONSTRAINT bids_user_id_fkey
            FOREIGN KEY (user_id) REFERENCES users(id)
            ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'watchlist_user_id_fkey') THEN
        ALTER TABLE watchlist
            ADD CONSTRAINT watchlist_user_id_fkey
            FOREIGN KEY (user_id) REFERENCES users(id)
            ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'watchlist_lot_id_fkey') THEN
        ALTER TABLE watchlist
            ADD CONSTRAINT watchlist_lot_id_fkey
            FOREIGN KEY (lot_id) REFERENCES lots(id)
            ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

COMMIT;

-- Optional cleanup if you accidentally created a standalone table named "phone"
-- DROP TABLE IF EXISTS phone;
