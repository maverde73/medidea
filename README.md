# Medidea

Sistema di gestione attività giornaliere e apparecchiature mediche.

## Status

🚀 Deployed on Cloudflare Pages

## Stack Tecnologico

- **Frontend**: Next.js 15 con App Router
- **Styling**: Tailwind CSS
- **Runtime**: Cloudflare Workers (Edge Runtime)
- **Database**: Cloudflare D1 (SQLite)
- **Storage**: Cloudflare R2
- **Deployment**: Cloudflare Pages

## Sviluppo Locale

### Prerequisiti

- Node.js 18+ (consigliato v22)
- npm 9+
- Account Cloudflare (per deployment)

### Setup

1. Installa le dipendenze:
```bash
npm install
```

2. Configura le variabili ambiente locali:
```bash
cp .dev.vars.example .dev.vars
# Modifica .dev.vars con i tuoi valori
```

3. Avvia il server di sviluppo Next.js:
```bash
npm run dev
```

L'applicazione sarà disponibile su http://localhost:3000

### Build e Preview Cloudflare

1. Build per Cloudflare Pages:
```bash
npm run pages:build
```

2. Preview locale con Wrangler:
```bash
npm run preview
```

## Configurazione Database D1

### Creare il database locale

```bash
# Crea database di sviluppo
wrangler d1 create medidea-db-dev

# Aggiorna il database_id in wrangler.toml [env.development.d1_databases]
```

### Eseguire migrazioni

```bash
# Applicare schema al database locale
wrangler d1 execute medidea-db-dev --local --file=./db/schema.sql
```

### Query di test

```bash
# Query locale
wrangler d1 execute medidea-db-dev --local --command="SELECT * FROM clienti"
```

## Configurazione Storage R2

### Creare bucket R2

```bash
# Crea bucket di sviluppo
wrangler r2 bucket create medidea-storage-dev

# Aggiorna il bucket_name in wrangler.toml [env.development.r2_buckets]
```

## Deployment

### Deploy su Cloudflare Pages

```bash
# Build e deploy
npm run deploy

# Oppure usa Wrangler direttamente
wrangler pages deploy
```

### Configurare segreti di produzione

```bash
# Imposta segreti per produzione
wrangler secret put JWT_SECRET
wrangler secret put API_BASE_URL
```

## Struttura Progetto

```
medidea/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # React components
├── lib/                   # Utility functions e helpers
│   └── env.ts            # Environment types
├── public/               # Static assets
├── .dev.vars            # Variabili ambiente locali (non committare)
├── wrangler.toml        # Configurazione Cloudflare Workers
├── open-next.config.ts  # Configurazione OpenNext adapter
└── next.config.ts       # Configurazione Next.js
```

## API Routes

### Health Check

```
GET /api/health
```

Verifica lo stato dell'applicazione.

Response:
```json
{
  "status": "ok",
  "runtime": "cloudflare",
  "timestamp": "2025-11-18T22:00:00.000Z",
  "environment": "production"
}
```

## Comandi Utili

```bash
# Sviluppo
npm run dev              # Dev server Next.js con Turbopack
npm run build           # Build production Next.js
npm run start           # Start production server

# Cloudflare
npm run pages:build     # Build per Cloudflare Pages
npm run preview         # Preview locale con Wrangler
npm run deploy          # Deploy su Cloudflare

# Linting
npm run lint            # Esegui ESLint
```

## Documentazione

- [Next.js Documentation](https://nextjs.org/docs)
- [Cloudflare Pages](https://developers.cloudflare.com/pages/)
- [Cloudflare D1](https://developers.cloudflare.com/d1/)
- [Cloudflare R2](https://developers.cloudflare.com/r2/)
- [OpenNext Cloudflare](https://opennext.js.org/cloudflare)

## Licenza

Privato
