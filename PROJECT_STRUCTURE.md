# Project Structure

Complete NestJS Resume Builder Backend structure.

## Directory Tree

```
resumeBuilderBackend-nestjs/
├── src/
│   ├── common/                          # Shared utilities
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts # Global error handling
│   │   ├── guards/
│   │   │   └── auth.guard.ts            # Authentication guard
│   │   ├── interceptors/
│   │   │   └── logging.interceptor.ts   # Request logging
│   │   └── prisma/
│   │       ├── prisma.module.ts         # Prisma module
│   │       └── prisma.service.ts        # Prisma service
│   │
│   ├── modules/                         # Feature modules
│   │   ├── auth/                        # Authentication
│   │   │   ├── dto/
│   │   │   │   └── auth.dto.ts          # Auth DTOs
│   │   │   ├── auth.controller.ts       # Auth endpoints
│   │   │   ├── auth.module.ts           # Auth module
│   │   │   └── auth.service.ts          # Auth business logic
│   │   │
│   │   ├── users/                       # User management
│   │   │   ├── users.controller.ts      # User endpoints
│   │   │   ├── users.module.ts          # User module
│   │   │   └── users.service.ts         # User business logic
│   │   │
│   │   ├── resumes/                     # Resume CRUD
│   │   │   ├── dto/
│   │   │   │   └── resume.dto.ts        # Resume DTOs
│   │   │   ├── resumes.controller.ts    # Resume endpoints
│   │   │   ├── resumes.module.ts        # Resume module
│   │   │   └── resumes.service.ts       # Resume business logic
│   │   │
│   │   ├── versions/                    # Version control
│   │   │   ├── versions.controller.ts   # Version endpoints
│   │   │   ├── versions.module.ts       # Version module
│   │   │   └── versions.service.ts      # Version business logic
│   │   │
│   │   ├── sharing/                     # Public sharing
│   │   │   ├── sharing.controller.ts    # Sharing endpoints
│   │   │   ├── sharing.module.ts        # Sharing module
│   │   │   └── sharing.service.ts       # Sharing business logic
│   │   │
│   │   ├── export/                      # PDF export
│   │   │   ├── export.controller.ts     # Export endpoints
│   │   │   ├── export.module.ts         # Export module
│   │   │   └── export.service.ts        # PDF generation
│   │   │
│   │   └── health/                      # Health checks
│   │       ├── health.controller.ts     # Health endpoint
│   │       └── health.module.ts         # Health module
│   │
│   ├── app.module.ts                    # Root module
│   └── main.ts                          # Application entry
│
├── prisma/
│   └── schema.prisma                    # Database schema
│
├── scripts/
│   └── setup.sh                         # Setup script
│
├── test/                                # E2E tests
│
├── .dockerignore                        # Docker ignore
├── .env.example                         # Environment template
├── .eslintrc.js                         # ESLint config
├── .gitignore                           # Git ignore
├── .prettierrc                          # Prettier config
├── COMPARISON.md                        # Serverless vs NestJS
├── Dockerfile                           # Docker config
├── MIGRATION_GUIDE.md                   # Migration guide
├── nest-cli.json                        # NestJS CLI config
├── package.json                         # Dependencies
├── PROJECT_STRUCTURE.md                 # This file
├── QUICKSTART.md                        # Quick start guide
├── README.md                            # Main documentation
└── tsconfig.json                        # TypeScript config
```

## Module Overview

### 1. Auth Module (`src/modules/auth/`)

**Purpose**: User authentication and session management

**Endpoints**:
- `POST /auth/signup` - Register new user
- `POST /auth/signin` - Login user
- `POST /auth/signout` - Logout user
- `POST /auth/reset-password` - Request password reset
- `GET /auth/session` - Get current session
- `POST /auth/refresh` - Refresh access token
- `GET /auth/oauth/:provider` - OAuth sign in
- `GET /auth/oauth/callback` - OAuth callback

**Features**:
- Supabase Auth integration
- JWT token management
- OAuth support (Google, GitHub)
- Email verification
- Password reset

### 2. Users Module (`src/modules/users/`)

**Purpose**: User profile and account management

**Endpoints**:
- `GET /users/me` - Get current user
- `PUT /users/me` - Update profile
- `DELETE /users/me` - Delete account
- `GET /users/me/stats` - Get user statistics

**Features**:
- Profile management
- Usage statistics
- Subscription info
- Account deletion

### 3. Resumes Module (`src/modules/resumes/`)

**Purpose**: Resume CRUD operations

**Endpoints**:
- `POST /resumes` - Create resume
- `GET /resumes` - List resumes
- `GET /resumes/search` - Search resumes
- `GET /resumes/:id` - Get resume
- `PUT /resumes/:id` - Update resume
- `DELETE /resumes/:id` - Delete resume
- `POST /resumes/:id/duplicate` - Duplicate resume
- `GET /resumes/:id/export` - Export resume
- `POST /resumes/import` - Import resume
- `POST /resumes/export` - Bulk export

**Features**:
- Full CRUD operations
- Search functionality
- Pagination
- Soft delete
- Import/Export
- Subscription limits

### 4. Versions Module (`src/modules/versions/`)

**Purpose**: Resume version control

**Endpoints**:
- `GET /resumes/:resumeId/versions` - List versions
- `POST /resumes/:resumeId/versions` - Create version
- `GET /resumes/:resumeId/versions/:versionId` - Get version
- `POST /resumes/:resumeId/versions/:versionId/restore` - Restore version

**Features**:
- Version history
- Version snapshots
- Version restore
- Change tracking

### 5. Sharing Module (`src/modules/sharing/`)

**Purpose**: Public resume sharing

**Endpoints**:
- `POST /resumes/:id/share` - Share resume
- `POST /resumes/:id/unshare` - Unshare resume
- `GET /resumes/:id/analytics` - Get analytics
- `GET /public/:slug` - View public resume

**Features**:
- Public URL generation
- View tracking
- Analytics
- Access control

### 6. Export Module (`src/modules/export/`)

**Purpose**: PDF generation

**Endpoints**:
- `POST /resumes/export` - Generate PDF

**Features**:
- PDF generation with Puppeteer
- Chromium integration
- Custom styling
- Export tracking

### 7. Health Module (`src/modules/health/`)

**Purpose**: System health monitoring

**Endpoints**:
- `GET /health` - Health check

**Features**:
- Database connectivity check
- System status
- Uptime monitoring

## Common Utilities

### Guards (`src/common/guards/`)

**AuthGuard**: Validates JWT tokens and authenticates requests

```typescript
@UseGuards(AuthGuard)
@Controller('resumes')
export class ResumesController {}
```

### Filters (`src/common/filters/`)

**HttpExceptionFilter**: Global error handling and formatting

```typescript
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // Format error response
  }
}
```

### Interceptors (`src/common/interceptors/`)

**LoggingInterceptor**: Request/response logging

```typescript
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    // Log request details
  }
}
```

### Prisma (`src/common/prisma/`)

**PrismaService**: Database connection and query execution

```typescript
@Injectable()
export class PrismaService extends PrismaClient {
  // Singleton Prisma client
}
```

## Data Transfer Objects (DTOs)

### Auth DTOs (`src/modules/auth/dto/`)

- `SignUpDto` - User registration
- `SignInDto` - User login
- `ResetPasswordDto` - Password reset
- `RefreshTokenDto` - Token refresh

### Resume DTOs (`src/modules/resumes/dto/`)

- `CreateResumeDto` - Create resume
- `UpdateResumeDto` - Update resume
- `ListResumesQueryDto` - List query params
- `SearchResumesQueryDto` - Search query params

## Configuration Files

### TypeScript (`tsconfig.json`)

- Strict mode enabled
- Path aliases configured
- ES2021 target
- CommonJS modules

### NestJS (`nest-cli.json`)

- Source root: `src`
- Webpack enabled
- Auto-delete output directory

### ESLint (`.eslintrc.js`)

- TypeScript parser
- Prettier integration
- Recommended rules

### Prettier (`.prettierrc`)

- Single quotes
- Trailing commas
- 100 character line width
- 2 space indentation

### Docker (`Dockerfile`)

- Multi-stage build
- Node.js 22 Alpine
- Production optimized
- Prisma client included

## Environment Variables

Required variables in `.env`:

```env
# Application
NODE_ENV=development
PORT=3001

# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# Supabase
SUPABASE_URL=https://...
SUPABASE_KEY=...
SUPABASE_SERVICE_KEY=...

# JWT
JWT_SECRET=...

# Stripe
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...

# Frontend
FRONTEND_URL=http://localhost:3000

# Logging
LOG_LEVEL=info
```

## Database Schema

### Models

1. **User** - User accounts and profiles
2. **Resume** - Resume documents
3. **ResumeVersion** - Version history
4. **Subscription** - User subscriptions
5. **Payment** - Payment records

### Relationships

```
User (1) ─── (N) Resume
Resume (1) ─── (N) ResumeVersion
User (1) ─── (N) Subscription
User (1) ─── (N) Payment
Subscription (1) ─── (N) Payment
```

## API Documentation

### Swagger/OpenAPI

Automatically generated at `/api/docs`

**Features**:
- Interactive API explorer
- Request/response schemas
- Authentication support
- Try it out functionality

### Decorators Used

```typescript
@ApiTags('resumes')           // Group endpoints
@ApiOperation({ summary })    // Describe endpoint
@ApiBearerAuth()             // Require auth
@ApiProperty()               // Document DTO fields
```

## Testing Structure

```
test/
├── unit/                    # Unit tests
│   ├── auth.service.spec.ts
│   ├── resumes.service.spec.ts
│   └── ...
├── integration/             # Integration tests
│   ├── auth.e2e-spec.ts
│   ├── resumes.e2e-spec.ts
│   └── ...
└── jest-e2e.json           # E2E test config
```

## Scripts

### Development

```bash
npm run start:dev           # Hot reload
npm run start:debug         # With debugger
```

### Production

```bash
npm run build               # Build
npm run start:prod          # Start
```

### Database

```bash
npm run prisma:generate     # Generate client
npm run prisma:migrate      # Run migrations
npm run prisma:studio       # Open Studio
```

### Testing

```bash
npm test                    # Unit tests
npm run test:e2e           # E2E tests
npm run test:cov           # Coverage
```

### Code Quality

```bash
npm run lint               # Lint
npm run format             # Format
```

## Key Features

### 1. Type Safety

- Full TypeScript support
- Strict mode enabled
- Prisma generated types
- DTO validation

### 2. Security

- Helmet middleware
- CORS configuration
- Authentication guards
- Input validation
- SQL injection prevention

### 3. Performance

- Connection pooling
- No cold starts
- Efficient queries
- Caching ready

### 4. Developer Experience

- Hot reload
- Auto-generated docs
- Easy debugging
- Clear error messages

### 5. Maintainability

- Modular architecture
- Dependency injection
- Separation of concerns
- Consistent patterns

## Next Steps

1. ✅ Project structure created
2. ⏳ Install dependencies: `npm install`
3. ⏳ Configure environment: `cp .env.example .env`
4. ⏳ Generate Prisma client: `npm run prisma:generate`
5. ⏳ Run migrations: `npm run prisma:migrate`
6. ⏳ Start development: `npm run start:dev`
7. ⏳ Visit Swagger docs: http://localhost:3001/api/docs

## Documentation

- **README.md** - Main documentation
- **QUICKSTART.md** - Quick start guide
- **MIGRATION_GUIDE.md** - Migration from serverless
- **COMPARISON.md** - Architecture comparison
- **PROJECT_STRUCTURE.md** - This file

## Support

For questions or issues:
1. Check the documentation
2. Review NestJS docs: https://docs.nestjs.com
3. Check Prisma docs: https://www.prisma.io/docs
4. Review existing serverless implementation
