# Quick Start Guide

Get the NestJS Resume Builder API running in 5 minutes.

## Prerequisites

- Node.js 22.x or higher
- PostgreSQL database (or Supabase account)
- npm or yarn

## Quick Setup

### 1. Install Dependencies

```bash
cd resumeBuilderBackend-nestjs
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Required
DATABASE_URL=postgresql://user:password@localhost:5432/resume_builder
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000

# Optional
PORT=3001
NODE_ENV=development
LOG_LEVEL=info
```

### 3. Setup Database

```bash
# Generate Prisma client
npm run prisma:generate

# Apply migrations
npm run prisma:migrate
```

### 4. Start Development Server

```bash
npm run start:dev
```

The API will be available at:
- **API**: http://localhost:3001
- **Swagger Docs**: http://localhost:3001/api/docs

## Test the API

### Health Check

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "database": "connected"
}
```

### Sign Up

```bash
curl -X POST http://localhost:3001/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User"
  }'
```

### Sign In

```bash
curl -X POST http://localhost:3001/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Save the `access_token` from the response.

### Create Resume

```bash
curl -X POST http://localhost:3001/resumes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "title": "My Resume",
    "templateId": "modern",
    "content": {
      "personalInfo": {
        "fullName": "John Doe",
        "email": "john@example.com"
      }
    }
  }'
```

### List Resumes

```bash
curl http://localhost:3001/resumes \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Using Swagger UI

1. Open http://localhost:3001/api/docs
2. Click "Authorize" button
3. Enter your access token: `Bearer YOUR_ACCESS_TOKEN`
4. Try out the endpoints interactively

## Common Commands

```bash
# Development
npm run start:dev          # Start with hot reload
npm run start:debug        # Start with debugger

# Build
npm run build              # Build for production
npm run start:prod         # Start production server

# Database
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Run migrations
npm run prisma:studio      # Open Prisma Studio
npm run prisma:push        # Push schema changes

# Testing
npm test                   # Run tests
npm run test:watch         # Run tests in watch mode
npm run test:cov           # Run tests with coverage

# Code Quality
npm run lint               # Lint code
npm run format             # Format code
```

## Troubleshooting

### Port Already in Use

Change the port in `.env`:
```env
PORT=3002
```

### Database Connection Error

1. Check `DATABASE_URL` in `.env`
2. Ensure PostgreSQL is running
3. Test connection: `npm run prisma:studio`

### Prisma Client Not Generated

```bash
npm run prisma:generate
```

### Module Not Found

```bash
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

1. ✅ API is running
2. 📖 Read [README.md](./README.md) for detailed documentation
3. 🔄 Check [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) if migrating from serverless
4. 📊 Review [COMPARISON.md](./COMPARISON.md) for architecture comparison
5. 🚀 Deploy to production (see README.md)

## Production Deployment

### Using Docker

```bash
# Build image
docker build -t resume-builder-api .

# Run container
docker run -p 3001:3001 --env-file .env resume-builder-api
```

### Using PM2

```bash
# Build
npm run build

# Start with PM2
pm2 start dist/main.js --name resume-builder-api

# Monitor
pm2 logs resume-builder-api
```

### Using Cloud Platforms

Deploy to:
- **Railway**: Connect GitHub repo, auto-deploy
- **Render**: Connect GitHub repo, auto-deploy
- **Heroku**: `git push heroku main`
- **AWS**: EC2, ECS, or Elastic Beanstalk
- **Google Cloud**: Cloud Run or App Engine

## Support

- 📖 [Full Documentation](./README.md)
- 🔄 [Migration Guide](./MIGRATION_GUIDE.md)
- 📊 [Architecture Comparison](./COMPARISON.md)
- 🐛 [Report Issues](https://github.com/your-repo/issues)

## Success! 🎉

Your NestJS Resume Builder API is now running. Visit http://localhost:3001/api/docs to explore the API.
