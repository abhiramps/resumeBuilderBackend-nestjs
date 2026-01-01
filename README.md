# Resume Builder NestJS Backend

NestJS migration of the Resume Builder serverless backend application.

## Features

- **Modern Architecture**: Built with NestJS framework following best practices
- **Type Safety**: Full TypeScript support with strict mode
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Supabase Auth integration
- **API Documentation**: Auto-generated Swagger/OpenAPI docs
- **Validation**: Class-validator for request validation
- **Security**: Helmet, CORS, authentication guards
- **Modular Design**: Feature-based module structure

## Tech Stack

- **Framework**: NestJS 10.x
- **Runtime**: Node.js 22.x
- **Language**: TypeScript 5.x
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma 7.x
- **Auth**: Supabase Auth
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI
- **PDF Generation**: Puppeteer + Chromium

## Project Structure

```
src/
├── common/                 # Shared utilities
│   ├── filters/           # Exception filters
│   ├── guards/            # Authentication guards
│   ├── interceptors/      # Logging interceptors
│   └── prisma/            # Prisma service
├── modules/               # Feature modules
│   ├── auth/             # Authentication
│   ├── users/            # User management
│   ├── resumes/          # Resume CRUD
│   ├── versions/         # Version control
│   ├── sharing/          # Public sharing
│   ├── export/           # PDF export
│   └── health/           # Health checks
├── app.module.ts         # Root module
└── main.ts               # Application entry
```

## Getting Started

### Prerequisites

- Node.js 22.x or higher
- PostgreSQL database (or Supabase account)
- npm or yarn

### Installation

1. Clone the repository and navigate to the NestJS backend:

```bash
cd resumeBuilderBackend-nestjs
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
NODE_ENV=development
PORT=3001

DATABASE_URL=postgresql://user:password@localhost:5432/resume_builder
DIRECT_URL=postgresql://user:password@localhost:5432/resume_builder

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

JWT_SECRET=your-jwt-secret

STRIPE_SECRET_KEY=sk_test_your-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

FRONTEND_URL=http://localhost:3000

LOG_LEVEL=info
```

4. Generate Prisma client:

```bash
npm run prisma:generate
```

5. Run database migrations:

```bash
npm run prisma:migrate
```

### Development

Start the development server:

```bash
npm run start:dev
```

The API will be available at:
- **API**: http://localhost:3001
- **Swagger Docs**: http://localhost:3001/api/docs

### Production

Build the application:

```bash
npm run build
```

Start the production server:

```bash
npm run start:prod
```

## API Endpoints

### Authentication
- `POST /auth/signup` - Sign up a new user
- `POST /auth/signin` - Sign in an existing user
- `POST /auth/signout` - Sign out current user
- `POST /auth/reset-password` - Request password reset
- `GET /auth/session` - Get current session
- `POST /auth/refresh` - Refresh access token

### Users
- `GET /users/me` - Get current user profile
- `PUT /users/me` - Update current user profile
- `DELETE /users/me` - Delete current user account
- `GET /users/me/stats` - Get user statistics

### Resumes
- `POST /resumes` - Create a new resume
- `GET /resumes` - List all resumes
- `GET /resumes/search` - Search resumes
- `GET /resumes/:id` - Get resume by ID
- `PUT /resumes/:id` - Update resume
- `DELETE /resumes/:id` - Delete resume
- `POST /resumes/:id/duplicate` - Duplicate resume
- `GET /resumes/:id/export` - Export resume
- `POST /resumes/import` - Import resume
- `POST /resumes/export` - Bulk export resumes

### Versions
- `GET /resumes/:resumeId/versions` - List all versions
- `POST /resumes/:resumeId/versions` - Create a new version
- `GET /resumes/:resumeId/versions/:versionId` - Get specific version
- `POST /resumes/:resumeId/versions/:versionId/restore` - Restore version

### Sharing
- `POST /resumes/:id/share` - Share a resume publicly
- `POST /resumes/:id/unshare` - Unshare a resume
- `GET /resumes/:id/analytics` - Get resume analytics
- `GET /public/:slug` - Get public resume by slug

### Export
- `POST /resumes/export` - Export resume as PDF

### Health
- `GET /health` - Health check endpoint

## Database

### Prisma Commands

```bash
# Generate Prisma client
npm run prisma:generate

# Push schema changes to database
npm run prisma:push

# Create a new migration
npm run prisma:migrate

# Open Prisma Studio
npm run prisma:studio

# Seed the database
npm run prisma:seed
```

## Testing

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run test coverage
npm run test:cov

# Run e2e tests
npm run test:e2e
```

## Linting & Formatting

```bash
# Lint code
npm run lint

# Format code
npm run format
```

## Migration from Serverless

This NestJS application is a direct migration from the serverless Express backend. Key differences:

### Architecture Changes
- **Serverless Handlers** → **NestJS Controllers**
- **Express Middleware** → **NestJS Guards/Interceptors**
- **Service Classes** → **Injectable Services**
- **Manual Validation** → **Class-validator DTOs**

### Benefits
- Better code organization with modules
- Built-in dependency injection
- Auto-generated API documentation
- Type-safe request/response handling
- Easier testing with NestJS testing utilities
- Better error handling with exception filters

### Compatibility
- Same database schema (Prisma)
- Same authentication (Supabase)
- Same API endpoints
- Same business logic

## Deployment

### Traditional Server

1. Build the application:
```bash
npm run build
```

2. Start with PM2:
```bash
pm2 start dist/main.js --name resume-builder-api
```

### Docker

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["node", "dist/main"]
```

### Cloud Platforms

- **AWS**: Deploy to EC2, ECS, or Elastic Beanstalk
- **Google Cloud**: Deploy to Cloud Run or App Engine
- **Azure**: Deploy to App Service
- **Heroku**: Direct deployment with Procfile
- **Railway/Render**: One-click deployment

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (development/production) | Yes |
| `PORT` | Server port | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_KEY` | Supabase anon key | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `STRIPE_SECRET_KEY` | Stripe secret key | Yes |
| `FRONTEND_URL` | Frontend application URL | Yes |

## Contributing

1. Follow the existing code structure
2. Use TypeScript strict mode
3. Add proper validation with DTOs
4. Document API endpoints with Swagger decorators
5. Write tests for new features
6. Follow NestJS best practices

## License

ISC
