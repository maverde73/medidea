# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Task Master AI Instructions
**Import Task Master's development workflow commands and guidelines, treat as if import is in the main CLAUDE.md file.**
@./.taskmaster/CLAUDE.md

## Project Overview

Medidea is a Next.js 15 application for managing medical equipment service requests and maintenance. It runs on Cloudflare Pages with:
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2 for file attachments
- **Runtime**: Cloudflare Workers with OpenNext
- **Authentication**: JWT-based auth with bcrypt password hashing

## Essential Commands

### Development

```bash
# Start development server with Turbopack
npm run dev

# Build for production (Next.js build)
npm run build

# Build for Cloudflare Pages deployment
npm run pages:build

# Preview Cloudflare Pages build locally
npm run preview

# Deploy to Cloudflare Pages
npm run deploy

# Lint code
npm run lint
```

### Database Operations

```bash
# Apply schema to local database
wrangler d1 execute medidea-db-dev --local --file=./db/schema.sql

# Apply schema to production database
wrangler d1 execute medidea-db --remote --file=./db/schema.sql

# Run a migration
wrangler d1 execute medidea-db-dev --local --file=./db/migrations/NNNN_description.sql

# Query database (local)
wrangler d1 execute medidea-db-dev --local --command="SELECT * FROM clienti"

# Query database (production)
wrangler d1 execute medidea-db --remote --command="SELECT * FROM attivita WHERE stato='APERTO'"

# Load seed data (development only)
wrangler d1 execute medidea-db-dev --local --file=./db/seed_v3.sql

# List all tables
wrangler d1 execute medidea-db-dev --local --command="SELECT name FROM sqlite_master WHERE type='table'"
```

### Testing

```bash
# Run end-to-end tests with Playwright
npm run test:e2e

# Run tests in UI mode
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed
```

## Architecture

### Application Structure

```
app/
├── api/                    # API routes (Next.js Route Handlers)
│   ├── auth/              # Authentication endpoints (login, me)
│   ├── clienti/           # Client management
│   ├── attivita/          # Activity/service request management
│   ├── apparecchiature/   # Equipment management
│   ├── allegati/          # File attachment handling
│   ├── utenti/            # User management
│   └── [various]/         # Other domain-specific endpoints
├── (pages)/               # UI pages matching API structure
│   ├── clienti/
│   ├── attivita/
│   ├── apparecchiature/
│   └── ...
└── page.tsx               # Dashboard homepage

lib/
├── auth.ts                # JWT auth utilities (generateToken, verifyToken, hashPassword)
├── db.ts                  # D1 database client wrapper
├── storage.ts             # R2 storage client wrapper
├── middleware.ts          # Auth middleware (withAuth HOF for API routes)
├── acl.ts                 # Access control logic
├── error-handler.ts       # Centralized error handling
├── rate-limit.ts          # Rate limiting utilities
└── validators/            # Zod schemas for request validation

components/ui/             # Reusable UI components
├── AppLayout.tsx          # Main application layout with sidebar
├── Header.tsx             # Top navigation bar
├── Sidebar.tsx            # Left navigation menu
├── FileUploader.tsx       # Drag-and-drop file upload
└── ...                    # Other UI components

db/
├── schema.sql             # Database schema definition
├── seed_v3.sql            # Latest seed data for development
├── migrations/            # Database migrations (numbered SQL files)
└── README.md              # Comprehensive database documentation
```

### Database Schema

Core tables:
- **clienti**: Client/customer records
- **attivita**: Service requests/activities (main workflow entity)
- **interventi_attivita**: Intervention history for each activity
- **apparecchiature**: Equipment registry with test dates
- **allegati**: File attachment metadata (files stored in R2)
- **utenti**: User accounts with role-based access (admin/tecnico/user)
- **rubrica**: Contact directory with technician assignments

See `/home/mverde/src/valerio/medidea/db/README.md` for complete schema reference and field definitions.

### Authentication & Authorization

**JWT-based authentication** with three roles:
- `admin`: Full access to all resources
- `tecnico`: Can manage activities and equipment
- `user`: Read-only access

**API Route Protection Pattern**:
```typescript
import { withAuth } from "@/lib/middleware";

// Require authentication only
export const GET = withAuth(async (request, { user }) => {
  // user.role, user.email, user.userId available
  return NextResponse.json({ data });
});

// Require specific role
export const DELETE = withAuth(
  async (request, { user }) => {
    return NextResponse.json({ success: true });
  },
  { requiredRole: "admin" }
);

// Dynamic routes with params
export const GET = withAuth<{ params: Promise<{ id: string }> }>(
  async (request, { user, params }) => {
    const { id } = await params;
    return NextResponse.json({ id, user });
  }
);
```

**Client-side auth**: Token stored in `localStorage`, sent via `Authorization: Bearer <token>` header.

### Cloudflare Integration

**Environment Bindings** (available in API routes via `getRequestContext()`):
```typescript
interface CloudflareEnv {
  DB: D1Database;        // Database binding
  STORAGE: R2Bucket;     // File storage binding
  JWT_SECRET: string;    // Environment variable
  API_BASE_URL: string;  // Environment variable
}
```

**Accessing bindings in API routes**:
```typescript
import { getRequestContext } from "@cloudflare/next-on-pages";
import { createDatabaseClient } from "@/lib/db";
import { createStorageClient } from "@/lib/storage";

export async function GET(request: NextRequest) {
  const { env } = await getRequestContext();

  const db = createDatabaseClient(env);
  const storage = createStorageClient(env);

  const clients = await db.query("SELECT * FROM clienti");
  // ...
}
```

**Environment Configuration**:
- `.dev.vars`: Local development secrets (git-ignored)
- `wrangler.toml`: Cloudflare bindings and configuration
- Database IDs and bucket names configured per environment (preview/production)

### File Upload Flow

1. Client uploads file to `/api/upload` endpoint
2. File stored in R2 with generated unique key
3. Metadata saved to `allegati` table with reference to parent entity
4. Download via `/api/download/[id]` endpoint
5. Files linked to entities via `tipo_riferimento` (e.g., "attivita", "apparecchiatura") and `id_riferimento`

### State Management

- Client-side state uses React hooks (`useState`, `useEffect`)
- No global state library (Redux/Zustand) currently used
- Authentication token managed via `localStorage`
- Activity status tracked in `lib/attivita-state.ts` (workflow state machine)

## Development Guidelines

### Adding New API Endpoints

1. Create route handler in `app/api/[resource]/route.ts` or `app/api/[resource]/[id]/route.ts`
2. Use `withAuth` middleware for protected routes
3. Create database client via `createDatabaseClient(env)`
4. Use prepared statements with parameter binding to prevent SQL injection
5. Validate request bodies using Zod schemas from `lib/validators/`
6. Return consistent error responses via `lib/error-handler.ts`

### Database Migrations

1. Create new file: `db/migrations/NNNN_description.sql` (increment NNNN)
2. Write SQL statements (use `IF NOT EXISTS` where appropriate)
3. Test locally: `wrangler d1 execute medidea-db-dev --local --file=./db/migrations/NNNN_description.sql`
4. Apply to production: `wrangler d1 execute medidea-db --remote --file=./db/migrations/NNNN_description.sql`
5. Update `db/schema.sql` to reflect current state

### TypeScript Path Aliases

Use `@/` prefix for imports from project root:
```typescript
import { withAuth } from "@/lib/middleware";
import { Button } from "@/components/ui/button";
```

### Cloudflare Pages Build Process

The `pages:build` script:
1. Runs `opennextjs-cloudflare build` to generate Cloudflare-compatible output
2. Patches worker with `scripts/patch-worker.js`
3. Copies assets to `.open-next/assets/` directory
4. Output is ready for `wrangler pages deploy`

**Note**: Images are unoptimized (`unoptimized: true` in next.config.ts) for Cloudflare compatibility.

### Security Considerations

- JWT secrets must be set in Cloudflare dashboard or `.dev.vars` (never commit to git)
- Passwords hashed with bcrypt (10 salt rounds)
- All API routes should use `withAuth` unless intentionally public
- SQL injection prevented via D1 prepared statements with parameter binding
- File uploads validated for size (10MB max) and type
- HTTPS enforced in production via middleware
- Security headers set: X-Frame-Options, CSP, HSTS, X-Content-Type-Options

### Common Patterns

**Database query pattern**:
```typescript
const db = createDatabaseClient(env);
const results = await db.query<Cliente>("SELECT * FROM clienti WHERE id = ?", [id]);
const cliente = await db.queryFirst<Cliente>("SELECT * FROM clienti WHERE id = ?", [id]);
```

**File upload pattern**:
```typescript
const storage = createStorageClient(env);
const key = storage.generateKey(filename, "attivita");
await storage.upload(key, fileBuffer, {
  contentType: "application/pdf",
  customMetadata: { originalName: filename }
});
```

**Error handling pattern**:
```typescript
import { handleApiError } from "@/lib/error-handler";

try {
  // API logic
} catch (error) {
  return handleApiError(error);
}
```

## Troubleshooting

### Build Failures

- Check TypeScript errors: `npx tsc --noEmit`
- Ensure `@cloudflare/workers-types` is installed
- Verify `next.config.ts` has correct OpenNext initialization

### Database Connection Issues

- Verify `wrangler.toml` has correct `database_id`
- Check binding name matches (`DB` in code and config)
- Use `--local` flag for development, `--remote` for production

### Authentication Not Working

- Verify `JWT_SECRET` is set in `.dev.vars` or Cloudflare dashboard
- Check token format in Authorization header: `Bearer <token>`
- Ensure token hasn't expired (default 24h)

### File Upload Failures

- Check R2 bucket binding in `wrangler.toml`
- Verify file size under 10MB limit
- Ensure allowed file type (see `lib/storage.ts`)
