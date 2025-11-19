# Deployment Guide - Medidea

Guida step-by-step per il deployment dell'applicazione Medidea su Cloudflare Pages.

## Prerequisiti

- Account Cloudflare attivo
- Wrangler CLI installato (`npm install -g wrangler`)
- Repository Git configurato
- Node.js 18+ installato localmente

## Step 1: Setup Account Cloudflare

### Login con Wrangler

```bash
wrangler login
```

Questo aprirà il browser per autenticarti con il tuo account Cloudflare.

### Verifica Account

```bash
wrangler whoami
```

## Step 2: Creazione Database D1

### Crea Database Produzione

```bash
# Crea database di produzione
wrangler d1 create medidea-db

# Salva l'output - vedrai qualcosa come:
# database_id: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### Crea Database Sviluppo (Opzionale)

```bash
wrangler d1 create medidea-db-dev
```

### Aggiorna wrangler.toml

Apri `wrangler.toml` e aggiorna i `database_id`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "medidea-db"
database_id = "INSERISCI_QUI_IL_DATABASE_ID_DI_PRODUZIONE"

[env.development.d1_databases]
binding = "DB"
database_name = "medidea-db-dev"
database_id = "INSERISCI_QUI_IL_DATABASE_ID_DI_SVILUPPO"
```

### Applica Schema Database

```bash
# Produzione
wrangler d1 execute medidea-db --remote --file=./db/schema.sql

# Sviluppo (opzionale)
wrangler d1 execute medidea-db-dev --local --file=./db/schema.sql
```

### (Opzionale) Carica Dati di Test

```bash
# Solo per ambiente di sviluppo
wrangler d1 execute medidea-db-dev --local --file=./db/seed.sql
```

## Step 3: Creazione Bucket R2

### Crea Bucket Produzione

```bash
wrangler r2 bucket create medidea-storage
```

### Crea Bucket Sviluppo (Opzionale)

```bash
wrangler r2 bucket create medidea-storage-dev
```

### Verifica Configurazione

I bindings R2 sono già configurati in `wrangler.toml`. Verifica che i nomi corrispondano:

```toml
[[r2_buckets]]
binding = "STORAGE"
bucket_name = "medidea-storage"

[env.development.r2_buckets]
binding = "STORAGE"
bucket_name = "medidea-storage-dev"
```

## Step 4: Configurazione Variabili Ambiente

### Variabili di Produzione

Imposta le variabili sensibili tramite Wrangler:

```bash
# JWT Secret per autenticazione
wrangler secret put JWT_SECRET
# Quando richiesto, inserisci un valore sicuro (es: stringa random lunga)

# URL base API (se necessario)
wrangler secret put API_BASE_URL
# Inserisci: https://medidea.pages.dev (o il tuo dominio custom)
```

### Variabili di Sviluppo

Le variabili locali sono già configurate in `.dev.vars` (non committare questo file!).

## Step 5: Build e Deploy

### Build Locale (Verifica)

```bash
# Build Next.js
npm run build

# Build per Cloudflare Pages
npm run pages:build
```

Se non ci sono errori, procedi al deploy.

### Deploy su Cloudflare Pages

#### Opzione A: Deploy tramite Wrangler (Consigliato per primo deploy)

```bash
# Deploy diretto
npm run deploy

# Oppure
wrangler pages deploy
```

#### Opzione B: Deploy tramite Git (Consigliato per CI/CD)

1. **Collega Repository su Cloudflare Dashboard:**
   - Vai su [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Seleziona **Workers & Pages**
   - Clicca **Create Application** > **Pages** > **Connect to Git**
   - Autorizza GitHub/GitLab e seleziona il repository

2. **Configurazione Build:**
   ```
   Build command: npm run pages:build
   Build output directory: .open-next/worker-cloudflare
   Root directory: /
   ```

3. **Variabili Ambiente:**
   - Aggiungi le stesse variabili configurate con `wrangler secret`
   - `JWT_SECRET`: il tuo secret
   - `API_BASE_URL`: URL della tua app

4. **Deploy automatico:**
   - Ogni push su `main` triggererà un deploy automatico
   - I preview deployments saranno creati per le PR

## Step 6: Verifica Deploy

### Health Check

Una volta deployato, verifica che l'applicazione sia online:

```bash
curl https://medidea.pages.dev/api/health
```

Dovresti ricevere:
```json
{
  "status": "ok",
  "runtime": "cloudflare",
  "timestamp": "2025-11-18T...",
  "environment": "production"
}
```

### Test Database

```bash
curl https://medidea.pages.dev/api/db/test
```

### Test Upload (se configurato)

```bash
curl -X POST https://medidea.pages.dev/api/upload \
  -F "file=@test.pdf"
```

## Step 7: Configurazione Dominio Custom (Opzionale)

### Aggiungi Dominio

1. Vai su Cloudflare Dashboard > Workers & Pages > `medidea`
2. Clicca **Custom domains**
3. Clicca **Set up a custom domain**
4. Inserisci il tuo dominio (es: `app.medidea.com`)
5. Segui le istruzioni per configurare DNS

### Aggiorna Variabili

Aggiorna `API_BASE_URL` con il nuovo dominio:

```bash
wrangler secret put API_BASE_URL
# Inserisci: https://app.medidea.com
```

## Troubleshooting Deployment

### Errore: "database not found"

Assicurati di aver:
1. Creato il database D1 con `wrangler d1 create`
2. Aggiornato `database_id` in `wrangler.toml`
3. Applicato lo schema con `wrangler d1 execute`

### Errore: "bucket not found"

Assicurati di aver:
1. Creato il bucket R2 con `wrangler r2 bucket create`
2. Verificato che `bucket_name` in `wrangler.toml` corrisponda

### Build fallisce localmente

```bash
# Pulisci cache e node_modules
rm -rf .next .open-next node_modules package-lock.json

# Reinstalla dipendenze
npm install

# Riprova build
npm run pages:build
```

### Deploy fallisce su Cloudflare

1. Controlla i log nel dashboard Cloudflare
2. Verifica che tutte le variabili ambiente siano configurate
3. Verifica che i bindings D1 e R2 siano corretti

### API routes non funzionano

1. Verifica che le route siano in `app/api/*`
2. Controlla che NON abbiano `export const runtime = "edge"`
3. Verifica che il build Pages sia completato senza errori

## Monitoring e Logs

### Visualizza Logs in Tempo Reale

```bash
wrangler pages deployment tail
```

### Visualizza Logs Storici

Vai su Cloudflare Dashboard > Workers & Pages > `medidea` > **Logs**

### Analytics

Vai su Cloudflare Dashboard > Workers & Pages > `medidea` > **Analytics** per:
- Request count
- Error rate
- Response times
- Bandwidth usage

## Rollback

### Rollback a Deployment Precedente

1. Vai su Cloudflare Dashboard
2. Workers & Pages > `medidea` > **Deployments**
3. Trova il deployment funzionante
4. Clicca **...** > **Rollback to this deployment**

### Rollback via CLI

```bash
# Lista deployments
wrangler pages deployment list

# Rollback a deployment specifico
wrangler pages deployment rollback <deployment-id>
```

## CI/CD Best Practices

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '22'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run pages:build

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          command: pages deploy
```

### Configurazione Secrets

Aggiungi i seguenti secrets al tuo repository:
- `CLOUDFLARE_API_TOKEN`: Token API da Cloudflare Dashboard

## Costi Stimati

### Free Tier Cloudflare

- **Pages**: Unlimited requests
- **D1**: 10 GB storage, 1M reads/giorno
- **R2**: 10 GB storage, 1M Class A operations/mese
- **Workers**: 100,000 requests/giorno

### Per Applicazione Produzione Media

Stima costi mensili per ~10,000 utenti/mese:
- Pages: $0 (incluso in free tier)
- D1: $0 - $5/mese
- R2: $0 - $10/mese (dipende da storage PDF)
- **Totale**: $0 - $15/mese

## Prossimi Passi

1. ✅ Deploy completato
2. ⬜ Configurare autenticazione utenti (JWT)
3. ⬜ Implementare CRUD per clienti
4. ⬜ Implementare CRUD per attività
5. ⬜ Implementare upload PDF reale
6. ⬜ Configurare backup automatici D1
7. ⬜ Setup monitoring e alerting

## Supporto

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [OpenNext Cloudflare](https://opennext.js.org/cloudflare)
