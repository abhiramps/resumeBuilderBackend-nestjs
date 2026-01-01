#!/bin/bash

# Resume Builder NestJS Setup Script

set -e

echo "🚀 Setting up Resume Builder NestJS Backend..."

# Check Node.js version
echo "📦 Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ Node.js 18+ is required. Current version: $(node -v)"
  exit 1
fi
echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env exists
if [ ! -f .env ]; then
  echo "📝 Creating .env file from .env.example..."
  cp .env.example .env
  echo "⚠️  Please update .env with your configuration"
else
  echo "✅ .env file already exists"
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run prisma:generate

# Check database connection
echo "🔍 Checking database connection..."
if npm run prisma:push --skip-generate 2>/dev/null; then
  echo "✅ Database connection successful"
else
  echo "⚠️  Database connection failed. Please check your DATABASE_URL in .env"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env with your configuration"
echo "2. Run 'npm run prisma:migrate' to apply migrations"
echo "3. Run 'npm run start:dev' to start the development server"
echo ""
echo "📚 Documentation:"
echo "- README.md - Getting started guide"
echo "- MIGRATION_GUIDE.md - Migration from serverless"
echo "- COMPARISON.md - Serverless vs NestJS comparison"
echo ""
echo "🌐 Once started, visit:"
echo "- API: http://localhost:3001"
echo "- Swagger Docs: http://localhost:3001/api/docs"
