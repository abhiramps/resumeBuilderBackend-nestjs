# Migration Guide: Serverless to NestJS

This guide explains how to migrate from the serverless Express backend to the new NestJS application.

## Overview

The NestJS application maintains 100% API compatibility with the serverless version while providing better structure, maintainability, and developer experience.

## Key Differences

### 1. Architecture

**Serverless (Old)**
```
src/
├── handlers/          # Lambda handlers
├── services/          # Business logic
├── middleware/        # Express middleware
├── utils/             # Utilities
└── validators/        # Joi schemas
```

**NestJS (New)**
```
src/
├── common/            # Shared utilities
│   ├── guards/       # Auth guards
│   ├── filters/      # Exception filters
│   └── interceptors/ # Logging
├── modules/           # Feature modules
│   ├── auth/
│   ├── resumes/
│   └── ...
└── main.ts
```

### 2. Request Handling

**Serverless (Old)**
```typescript
// Handler with serverless-http
import serverless from 'serverless-http';
import express from 'express';

const app = express();
router.post('/resumes', authenticate, validateRequest(schema), async (req, res, next) => {
  try {
    const resume = await resumeService.create(req.user.id, req.body);
    res.status(201).json({ data: resume });
  } catch (error) {
    next(error);
  }
});

export const handler = serverless(app);
```

**NestJS (New)**
```typescript
// Controller with decorators
@Controller('resumes')
@UseGuards(AuthGuard)
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) {}

  @Post()
  async create(@Req() req: any, @Body() createResumeDto: CreateResumeDto) {
    const resume = await this.resumesService.create(req.user.id, createResumeDto);
    return { data: resume };
  }
}
```

### 3. Validation

**Serverless (Old)**
```typescript
// Joi validation middleware
import Joi from 'joi';

export const createResumeSchema = Joi.object({
  title: Joi.string().required(),
  templateId: Joi.string().required(),
  content: Joi.object().required(),
});

router.post('/resumes', validateRequest(createResumeSchema), handler);
```

**NestJS (New)**
```typescript
// Class-validator DTOs
import { IsString, IsObject } from 'class-validator';

export class CreateResumeDto {
  @IsString()
  title: string;

  @IsString()
  templateId: string;

  @IsObject()
  content: any;
}

// Automatically validated
@Post()
async create(@Body() createResumeDto: CreateResumeDto) {
  // ...
}
```

### 4. Dependency Injection

**Serverless (Old)**
```typescript
// Manual instantiation
const resumeService = new ResumeService();
const authService = new AuthService();
```

**NestJS (New)**
```typescript
// Automatic DI
@Injectable()
export class ResumesService {
  constructor(private prisma: PrismaService) {}
}

// Injected automatically
@Controller('resumes')
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) {}
}
```

### 5. Error Handling

**Serverless (Old)**
```typescript
// Custom error classes + middleware
export class NotFoundError extends Error {
  statusCode = 404;
}

app.use(errorHandler);
```

**NestJS (New)**
```typescript
// Built-in HTTP exceptions
throw new NotFoundException('Resume not found');
throw new ForbiddenException('Access denied');
throw new BadRequestException('Invalid data');
```

## Migration Steps

### Step 1: Set Up NestJS Project

```bash
cd resumeBuilderBackend-nestjs
npm install
cp .env.example .env
# Edit .env with your configuration
```

### Step 2: Copy Database Schema

The Prisma schema is already copied. Generate the client:

```bash
npm run prisma:generate
```

### Step 3: Update Environment Variables

Both applications use the same environment variables. Copy from your existing `.env`:

```bash
cp ../resumeBuilderBackend/.env .env
```

### Step 4: Test Locally

Start the NestJS server:

```bash
npm run start:dev
```

Test endpoints:
```bash
# Health check
curl http://localhost:3001/health

# Sign in (use existing credentials)
curl -X POST http://localhost:3001/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'
```

### Step 5: Update Frontend Configuration

Update your frontend API base URL to point to the NestJS server:

```typescript
// Before (serverless)
const API_URL = 'https://your-api-gateway.amazonaws.com/dev';

// After (NestJS)
const API_URL = 'http://localhost:3001'; // or your deployed URL
```

### Step 6: Deploy

Choose your deployment method:

#### Option A: Traditional Server (EC2, VPS)

```bash
npm run build
pm2 start dist/main.js --name resume-builder-api
```

#### Option B: Docker

```bash
docker build -t resume-builder-api .
docker run -p 3001:3001 --env-file .env resume-builder-api
```

#### Option C: Cloud Platform

Deploy to Railway, Render, Heroku, or any Node.js hosting platform.

## API Compatibility

All endpoints remain the same:

| Endpoint | Method | Serverless | NestJS | Status |
|----------|--------|------------|--------|--------|
| `/auth/signup` | POST | ✅ | ✅ | Compatible |
| `/auth/signin` | POST | ✅ | ✅ | Compatible |
| `/resumes` | GET | ✅ | ✅ | Compatible |
| `/resumes` | POST | ✅ | ✅ | Compatible |
| `/resumes/:id` | GET | ✅ | ✅ | Compatible |
| `/resumes/:id` | PUT | ✅ | ✅ | Compatible |
| `/resumes/:id` | DELETE | ✅ | ✅ | Compatible |
| `/resumes/export` | POST | ✅ | ✅ | Compatible |
| `/public/:slug` | GET | ✅ | ✅ | Compatible |

## Testing Migration

### 1. Run Both Servers

```bash
# Terminal 1: Serverless
cd resumeBuilderBackend
npm run dev

# Terminal 2: NestJS
cd resumeBuilderBackend-nestjs
npm run start:dev
```

### 2. Compare Responses

```bash
# Test serverless
curl http://localhost:3000/health

# Test NestJS
curl http://localhost:3001/health
```

### 3. Integration Tests

Run the same test suite against both:

```bash
# Serverless
cd resumeBuilderBackend
npm test

# NestJS
cd resumeBuilderBackend-nestjs
npm test
```

## Rollback Plan

If you need to rollback:

1. Keep the serverless deployment active during migration
2. Use feature flags or routing to gradually shift traffic
3. Monitor error rates and performance
4. Switch DNS/load balancer back to serverless if needed

## Benefits of NestJS

### Developer Experience
- ✅ Better code organization with modules
- ✅ Built-in dependency injection
- ✅ Auto-generated API documentation (Swagger)
- ✅ Type-safe decorators
- ✅ Better testing utilities

### Performance
- ✅ No cold starts (traditional server)
- ✅ Connection pooling
- ✅ Better caching strategies
- ✅ WebSocket support (future)

### Maintainability
- ✅ Clear separation of concerns
- ✅ Easier to add new features
- ✅ Better error handling
- ✅ Standardized patterns

### Cost
- ✅ Potentially lower costs (no Lambda invocations)
- ✅ Predictable pricing
- ✅ Better resource utilization

## Troubleshooting

### Issue: Database Connection Errors

**Solution**: Ensure `DATABASE_URL` is correctly set and Prisma client is generated:
```bash
npm run prisma:generate
```

### Issue: Authentication Fails

**Solution**: Verify Supabase credentials:
```bash
# Check .env
echo $SUPABASE_URL
echo $SUPABASE_KEY
```

### Issue: PDF Export Not Working

**Solution**: Ensure Chromium is installed:
```bash
npm install @sparticuz/chromium puppeteer-core
```

### Issue: Port Already in Use

**Solution**: Change the port in `.env`:
```env
PORT=3002
```

## Next Steps

1. ✅ Complete migration to NestJS
2. ⏳ Add comprehensive tests
3. ⏳ Set up CI/CD pipeline
4. ⏳ Add monitoring and logging
5. ⏳ Implement caching layer
6. ⏳ Add rate limiting
7. ⏳ Set up staging environment

## Support

For issues or questions:
1. Check the README.md
2. Review NestJS documentation: https://docs.nestjs.com
3. Check existing serverless implementation for reference

## Conclusion

The NestJS migration provides a modern, maintainable architecture while maintaining full API compatibility. The migration can be done gradually with minimal risk.
