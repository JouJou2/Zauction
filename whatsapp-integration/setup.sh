#!/bin/bash

echo "🚀 Setting up FREE WhatsApp Integration..."
echo ""

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Create .env file
if [ ! -f .env ]; then
  echo "📝 Creating .env file..."
  cp .env.example .env
fi

# Go back to root
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install

cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎉 Next steps:"
echo "1. Start backend:  cd backend && npm start"
echo "2. Start frontend: cd frontend && npm start"
echo "3. Scan QR code with WhatsApp to connect"
echo ""
echo "💰 Cost: $0.00 forever!"
