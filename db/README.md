# Database Setup Guide

Questa guida spiega come configurare e gestire il database D1 per Medidea.

## Struttura Database

Il database utilizza Cloudflare D1 (SQLite) e include le seguenti tabelle:

- **clienti**: Anagrafica clienti
- **attivita**: Attività e richieste di intervento
- **interventi_attivita**: Storico interventi per ogni attività
- **apparecchiature**: Gestione apparecchiature e test
- **allegati**: Metadata dei file PDF salvati su R2

## Setup Iniziale

### 1. Crea il database D1

#### Sviluppo (locale)
```bash
# Crea database di sviluppo
wrangler d1 create medidea-db-dev

# Output esempio:
# ✅ Successfully created DB 'medidea-db-dev'
# database_id: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

#### Produzione
```bash
# Crea database di produzione
wrangler d1 create medidea-db

# Output esempio:
# ✅ Successfully created DB 'medidea-db'
# database_id: yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy
```

### 2. Aggiorna wrangler.toml

Copia i `database_id` ottenuti e aggiornali in `wrangler.toml`:

```toml
# Development
[env.development.d1_databases]
binding = "DB"
database_name = "medidea-db-dev"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  # <- Inserisci qui

# Production
[env.production.d1_databases]
binding = "DB"
database_name = "medidea-db"
database_id = "yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy"  # <- Inserisci qui
```

### 3. Applica lo schema

#### Locale (sviluppo)
```bash
# Applica schema al database locale
wrangler d1 execute medidea-db-dev --local --file=./db/schema.sql

# Oppure usa la migrazione
wrangler d1 execute medidea-db-dev --local --file=./db/migrations/0001_initial_schema.sql
```

#### Remoto (produzione)
```bash
# Applica schema al database remoto
wrangler d1 execute medidea-db --remote --file=./db/schema.sql
```

### 4. (Opzionale) Carica dati di esempio

```bash
# Solo per sviluppo - carica dati di test
wrangler d1 execute medidea-db-dev --local --file=./db/seed.sql
```

## Comandi Utili

### Query Database

```bash
# Lista tutte le tabelle (locale)
wrangler d1 execute medidea-db-dev --local --command="SELECT name FROM sqlite_master WHERE type='table'"

# Query clienti (locale)
wrangler d1 execute medidea-db-dev --local --command="SELECT * FROM clienti"

# Query con produzione
wrangler d1 execute medidea-db --remote --command="SELECT COUNT(*) as total FROM attivita"
```

### Backup e Restore

```bash
# Esporta dati (locale)
wrangler d1 export medidea-db-dev --local --output=backup.sql

# Importa dati (locale)
wrangler d1 execute medidea-db-dev --local --file=backup.sql
```

### Migrazioni

Per creare una nuova migrazione:

1. Crea un nuovo file in `db/migrations/` con formato `NNNN_description.sql`
2. Scrivi le modifiche SQL necessarie
3. Applica la migrazione:

```bash
# Locale
wrangler d1 execute medidea-db-dev --local --file=./db/migrations/NNNN_description.sql

# Remoto
wrangler d1 execute medidea-db --remote --file=./db/migrations/NNNN_description.sql
```

## Uso nel Codice

### Accesso al database nelle API Routes

```typescript
import { createDatabaseClient, queries } from "@/lib/db";

export async function GET(request: NextRequest) {
  // Il binding DB è disponibile tramite getRequestContext
  const db = createDatabaseClient(env);

  // Esegui query
  const clients = await db.query(queries.getClients);

  return NextResponse.json({ clients });
}
```

### Query personalizzate

```typescript
// Usa il client wrapper
const result = await db.query<Cliente>(
  "SELECT * FROM clienti WHERE id = ?",
  [clientId]
);

// Oppure usa il raw D1
const raw = db.getRaw();
const result = await raw.prepare("SELECT * FROM clienti").all();
```

## Schema Reference

### Tabella: clienti
```sql
id                INTEGER PRIMARY KEY
nome              TEXT NOT NULL
indirizzo         TEXT
contatti          TEXT
created_at        TEXT (auto)
updated_at        TEXT (auto)
```

### Tabella: attivita
```sql
id                                    INTEGER PRIMARY KEY
id_cliente                            INTEGER (FK -> clienti)
modello                               TEXT
seriale                               TEXT
codice_inventario_cliente             TEXT
modalita_apertura_richiesta           TEXT
data_apertura_richiesta               TEXT
numero_preventivo                     TEXT
data_preventivo                       TEXT
numero_accettazione_preventivo        TEXT
data_accettazione_preventivo          TEXT
stato                                 TEXT (DEFAULT 'APERTO')
data_chiusura                         TEXT
note_generali                         TEXT
created_at                            TEXT (auto)
updated_at                            TEXT (auto)
```

### Tabella: interventi_attivita
```sql
id                      INTEGER PRIMARY KEY
id_attivita             INTEGER (FK -> attivita)
data_intervento         TEXT NOT NULL
descrizione_intervento  TEXT
operatore               TEXT
created_at              TEXT (auto)
updated_at              TEXT (auto)
```

### Tabella: apparecchiature
```sql
id                      INTEGER PRIMARY KEY
id_cliente              INTEGER (FK -> clienti)
modello                 TEXT NOT NULL
seriale                 TEXT
data_test_funzionali    TEXT
data_test_elettrici     TEXT
note                    TEXT
created_at              TEXT (auto)
updated_at              TEXT (auto)
```

### Tabella: allegati
```sql
id                      INTEGER PRIMARY KEY
tipo_riferimento        TEXT NOT NULL
id_riferimento          INTEGER NOT NULL
nome_file_originale     TEXT NOT NULL
chiave_r2               TEXT UNIQUE
mime_type               TEXT
dimensione_bytes        INTEGER
data_caricamento        TEXT
note                    TEXT
created_at              TEXT (auto)
updated_at              TEXT (auto)
```

## Troubleshooting

### Errore: "database not found"
Assicurati di aver creato il database con `wrangler d1 create` e aggiornato `wrangler.toml`.

### Errore: "table already exists"
Lo schema usa `CREATE TABLE IF NOT EXISTS`, quindi è safe eseguirlo più volte.

### Query lente
Verifica che gli indici siano stati creati correttamente:
```bash
wrangler d1 execute medidea-db-dev --local --command="SELECT * FROM sqlite_master WHERE type='index'"
```

## Risorse

- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/commands/#d1)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
