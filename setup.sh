#!/bin/bash
# AI Resume Screening System — Quick Setup Script
# Run: bash setup.sh

echo ""
echo "🤖 AI Resume Screening System — Setup"
echo "======================================"

# Check Python
if ! command -v python3 &> /dev/null; then
  echo "❌ Python 3 not found. Install from https://python.org"
  exit 1
fi

# Check MongoDB
if ! command -v mongod &> /dev/null; then
  echo "⚠️  MongoDB not found. Please install MongoDB from https://mongodb.com"
  echo "   Or use MongoDB Atlas cloud instance and update MONGODB_URI in .env"
fi

# Backend setup
echo ""
echo "📦 Setting up backend..."
python3 -m venv venv
source venv/bin/activate 2>/dev/null || venv\\Scripts\\activate

pip install -r requirements.txt -q
python -m spacy download en_core_web_sm -q

# Copy .env if not exists
if [ ! -f .env ]; then
  cp .env.example .env
  echo "✅ Created .env file — add your ANTHROPIC_API_KEY to it"
fi

# Create uploads folder
mkdir -p uploads

# Frontend setup
echo ""
echo "📦 Setting up frontend..."
cd frontend
npm install --silent
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "To run the project:"
echo "  1. Start MongoDB: mongod (or use MongoDB Atlas)"
echo "  2. Edit .env and add your ANTHROPIC_API_KEY and MONGODB_URI"
echo "  2. Terminal 1: cd backend && python app.py"
echo "  3. Terminal 2: cd frontend && npm start"
echo ""
echo "  Backend:  http://localhost:5000"
echo "  Frontend: http://localhost:3000"
echo ""
