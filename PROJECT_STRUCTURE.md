# Project Structure - Medidea

Documentazione completa della struttura del progetto Medidea.

## Overview

Medidea è un'applicazione Next.js 15 deployata su Cloudflare Pages con database D1 (SQLite) e storage R2 per file.

## Directory Structure

```
medidea/
├── .github/                    # GitHub workflows e configurazioni
├── .open-next/                 # Build output OpenNext (generato)
├── .next/                      # Build output Next.js (generato)
├── .wrangler/                  # Cache Wrangler (generato)
├── app/                        # Next.js App Router
│   ├── api/                   # API Routes
│   │   ├── db/                # Database endpoints
│   │   │   └── test/          # DB connection test
│   │   ├── download/          # File download
│   │   │   └── [key]/         # Dynamic route per key
│   │   ├── health/            # Health check
│   │   └── upload/            # File upload
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Homepage
├── components/                 # React components
├── db/                        # Database files
│   ├── migrations/            # SQL migrations
│   │   └── 0001_initial_schema.sql
│   ├── README.md             # Database documentation
│   ├── schema.sql            # Complete database schema
│   └── seed.sql              # Sample data
├── lib/                       # Utilities and helpers
│   ├── db.ts                 # Database client wrapper
│   ├── env.ts                # Environment types
│   └── storage.ts            # R2 storage client
├── node_modules/              # Dependencies (gitignored)
├── public/                    # Static assets
├── storage/                   # Storage documentation
│   └── README.md
├── .dev.vars                  # Local environment variables (gitignored)
├── .env                       # Environment variables (gitignored)
├── .eslintrc.json             # ESLint configuration
├── .gitignore                 # Git ignore rules
├── CLAUDE.md                  # AI assistant instructions
├── DEPLOYMENT.md              # Deployment guide
├── next.config.ts             # Next.js configuration
├── open-next.config.ts        # OpenNext adapter config
├── package.json               # Dependencies and scripts
├── package-lock.json          # Dependency lock file
├── postcss.config.mjs         # PostCSS configuration
├── PROJECT_STRUCTURE.md       # This file
├── README.md                  # Main README
├── spec_app_cloudflare.md     # Application specification
├── tailwind.config.ts         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
└── wrangler.toml              # Cloudflare Workers configuration
```

## Key Directories

### `/app` - Next.js Application

#### App Router
- **`layout.tsx`**: Root layout con metadata e font
- **`page.tsx`**: Homepage con navigazione

#### API Routes (`/app/api`)

Tutte le API routes sono serverless functions eseguite su Cloudflare Workers:

- **`/api/health`**: Health check endpoint
  - `GET /api/health` - Ritorna status applicazione

- **`/api/db/test`**: Database connectivity test
  - `GET /api/db/test` - Verifica connessione D1

- **`/api/upload`**: File upload
  - `POST /api/upload` - Upload file su R2

- **`/api/download/[key]`**: File download
  - `GET /api/download/{key}` - Download file da R2

### `/components` - React Components

Directory per componenti React riutilizzabili:
- Layout components
- UI components
- Form components
- etc.

### `/db` - Database

#### Files
- **`schema.sql`**: Schema completo database con tutte le tabelle
- **`migrations/`**: SQL migrations ordinate per numero
- **`seed.sql`**: Dati di esempio per sviluppo
- **`README.md`**: Documentazione database completa

#### Schema Tables
1. **clienti**: Anagrafica clienti
2. **attivita**: Attività e richieste
3. **interventi_attivita**: Storico interventi
4. **apparecchiature**: Gestione apparecchiature
5. **allegati**: Metadata file PDF su R2

### `/lib` - Library & Utilities

#### Core Files

**`db.ts`** - Database Client
```typescript
import { createDatabaseClient, queries } from "@/lib/db";

const db = createDatabaseClient(env);
const clients = await db.query(queries.getClients);
```

**`storage.ts`** - R2 Storage Client
```typescript
import { createStorageClient } from "@/lib/storage";

const storage = createStorageClient(env);
await storage.upload(key, data, { contentType: "application/pdf" });
```

**`env.ts`** - Environment Types
```typescript
export interface Env {
  DB: D1Database;
  STORAGE: R2Bucket;
  JWT_SECRET: string;
}
```

### `/storage` - Storage Documentation

Documentazione completa per R2 storage:
- Setup bucket
- Upload/Download
- CORS configuration
- Best practices

### `/public` - Static Assets

File statici serviti direttamente:
- Images
- Fonts
- Icons
- etc.

## Configuration Files

### `package.json`

Scripts disponibili:

```json
{
  "dev": "next dev --turbopack",        // Dev server Next.js
  "build": "next build",                // Build Next.js
  "start": "next start",                // Start production server
  "lint": "next lint",                  // Run ESLint
  "pages:build": "opennextjs-cloudflare build",  // Build Cloudflare
  "preview": "...",                     // Preview locale Cloudflare
  "deploy": "..."                       // Deploy su Cloudflare
}
```

### `next.config.ts`

Configurazione Next.js:
- Output: standalone
- Images: unoptimized (per Cloudflare)
- Headers: security headers
- outputFileTracingRoot: workspace root

### `open-next.config.ts`

Configurazione OpenNext adapter:
- Default wrapper: cloudflare-node
- Middleware wrapper: cloudflare-edge
- Cache: dummy (stateless)

### `wrangler.toml`

Configurazione Cloudflare:

```toml
name = "medidea"
compatibility_date = "2024-12-01"
compatibility_flags = ["nodejs_compat"]

[[d1_databases]]
binding = "DB"
database_name = "medidea-db"
database_id = "TBD"

[[r2_buckets]]
binding = "STORAGE"
bucket_name = "medidea-storage"
```

### `tsconfig.json`

TypeScript configuration:
- Target: ES2022
- Module: esnext
- Strict mode enabled
- Path aliases: `@/*` -> `*`

### `tailwind.config.ts`

Tailwind CSS configuration:
- Content paths per purging
- Theme extensions
- Custom colors

## Development Workflow

### Local Development

```bash
# Start Next.js dev server
npm run dev

# Application runs on http://localhost:3000
```

### Building

```bash
# Build Next.js
npm run build

# Build for Cloudflare
npm run pages:build

# Output in .open-next/worker-cloudflare/
```

### Testing Locally

```bash
# Preview Cloudflare build locally
npm run preview

# Uses wrangler pages dev
```

## Environment Variables

### Development (`.dev.vars`)

```bash
JWT_SECRET=dev-secret-change-in-production
API_BASE_URL=http://localhost:3000
```

### Production (Cloudflare)

Set via `wrangler secret put`:
- `JWT_SECRET`
- `API_BASE_URL`

## Bindings

### D1 Database

Access via `env.DB`:

```typescript
const result = await env.DB
  .prepare("SELECT * FROM clienti")
  .all();
```

### R2 Storage

Access via `env.STORAGE`:

```typescript
const object = await env.STORAGE
  .get("path/to/file.pdf");
```

## API Conventions

### Request/Response Format

```typescript
// Success
{
  status: "ok",
  data: {...},
  timestamp: "2025-11-18T..."
}

// Error
{
  status: "error",
  error: "Error message",
  message: "Detailed message",
  timestamp: "2025-11-18T..."
}
```

### HTTP Status Codes

- `200 OK`: Success
- `400 Bad Request`: Invalid input
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Database Conventions

### Naming

- Tables: lowercase, plural (es: `clienti`, `attivita`)
- Columns: snake_case (es: `id_cliente`, `data_apertura_richiesta`)
- Primary keys: `id` (INTEGER AUTOINCREMENT)
- Foreign keys: `id_{table}` (es: `id_cliente`)

### Timestamps

All tables include:
- `created_at TEXT DEFAULT (datetime('now'))`
- `updated_at TEXT DEFAULT (datetime('now'))`

## File Organization

### R2 Storage Structure

```
medidea-storage/
├── attivita/
│   └── {id}/
│       ├── preventivo_{timestamp}_{random}.pdf
│       └── accettazione_{timestamp}_{random}.pdf
├── apparecchiature/
│   └── {id}/
│       └── test_{timestamp}_{random}.pdf
└── temp/
    └── {temporary_uploads}
```

## Security

### File Validation

- Max file size: 10MB
- Allowed types: PDF, JPG, PNG
- Filename sanitization
- MIME type verification

### Database

- Foreign key constraints
- Input sanitization
- Prepared statements

### API

- CORS headers
- Rate limiting (Cloudflare)
- Security headers

## Performance

### Caching

- Static assets: CDN cached
- API routes: no cache (dynamic)
- Database queries: no cache (always fresh)

### Optimization

- Image optimization disabled (Cloudflare handles it)
- Code splitting automatic
- Turbopack in development

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment guide.

## Future Enhancements

1. **Authentication**: JWT-based auth
2. **CRUD Operations**: Full CRUD for all entities
3. **Real-time**: WebSocket updates
4. **Analytics**: User analytics dashboard
5. **Backup**: Automated database backups
6. **Monitoring**: Error tracking e alerting

## Resources

- [Next.js 15 Docs](https://nextjs.org/docs)
- [Cloudflare Pages](https://developers.cloudflare.com/pages/)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
- [Cloudflare R2](https://developers.cloudflare.com/r2/)
- [OpenNext Cloudflare](https://opennext.js.org/cloudflare)
