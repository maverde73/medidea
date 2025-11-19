# R2 Storage Setup Guide

Questa guida spiega come configurare e gestire lo storage R2 per i file PDF e allegati di Medidea.

## Cos'è R2?

Cloudflare R2 è un servizio di object storage compatibile con S3, ideale per archiviare file statici come PDF, immagini e documenti.

## Setup Iniziale

### 1. Crea bucket R2

#### Sviluppo (per test locali)
```bash
# Crea bucket di sviluppo
wrangler r2 bucket create medidea-storage-dev

# Output esempio:
# ✅ Created bucket 'medidea-storage-dev' with default storage class set to Standard.
```

#### Produzione
```bash
# Crea bucket di produzione
wrangler r2 bucket create medidea-storage

# Output esempio:
# ✅ Created bucket 'medidea-storage' with default storage class set to Standard.
```

### 2. Verifica configurazione in wrangler.toml

I bindings R2 sono già configurati in `wrangler.toml`:

```toml
# Development
[env.development.r2_buckets]
binding = "STORAGE"
bucket_name = "medidea-storage-dev"

# Production
[env.production.r2_buckets]
binding = "STORAGE"
bucket_name = "medidea-storage"
```

### 3. (Opzionale) Configura CORS

Se l'applicazione frontend necessita di accesso diretto a R2:

```bash
# File cors-config.json
{
  "AllowedOrigins": ["https://medidea.pages.dev", "https://www.tuodominio.com"],
  "AllowedMethods": ["GET", "PUT", "POST"],
  "AllowedHeaders": ["*"],
  "ExposeHeaders": ["ETag"],
  "MaxAgeSeconds": 3000
}

# Applica configurazione CORS
wrangler r2 bucket cors put medidea-storage --rules cors-config.json
```

## Comandi Utili

### Gestione Files

```bash
# Lista files nel bucket (sviluppo)
wrangler r2 object list medidea-storage-dev

# Upload file manuale (per test)
wrangler r2 object put medidea-storage-dev/test.pdf --file=./test.pdf

# Download file
wrangler r2 object get medidea-storage-dev/test.pdf --file=./downloaded.pdf

# Elimina file
wrangler r2 object delete medidea-storage-dev/test.pdf
```

### Informazioni Bucket

```bash
# Informazioni sul bucket
wrangler r2 bucket info medidea-storage-dev

# Lista tutti i bucket
wrangler r2 bucket list
```

## Uso nel Codice

### Upload File

```typescript
import { createStorageClient } from "@/lib/storage";

export async function POST(request: NextRequest) {
  // Ottieni file da form data
  const formData = await request.formData();
  const file = formData.get("file") as File;

  // Crea client storage
  const storage = createStorageClient(env);

  // Genera chiave univoca
  const key = storage.generateKey(file.name, "attivita/123");

  // Upload file
  const buffer = await file.arrayBuffer();
  await storage.upload(key, buffer, {
    contentType: file.type,
    customMetadata: {
      originalName: file.name,
      uploadedBy: "user123",
    },
  });

  return NextResponse.json({ key });
}
```

### Download File

```typescript
import { createStorageClient } from "@/lib/storage";

export async function GET(request: NextRequest) {
  const key = "attivita/123/document.pdf";

  const storage = createStorageClient(env);
  const object = await storage.download(key);

  if (!object) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return new NextResponse(object.body, {
    headers: {
      "Content-Type": object.httpMetadata?.contentType || "application/pdf",
      "Content-Disposition": `attachment; filename="${key.split("/").pop()}"`,
    },
  });
}
```

### Delete File

```typescript
const storage = createStorageClient(env);
await storage.delete("attivita/123/old-document.pdf");
```

### List Files

```typescript
const storage = createStorageClient(env);
const result = await storage.list({
  prefix: "attivita/123/",
  limit: 100,
});

console.log(result.objects); // Array di R2Object
```

## Struttura Organizzazione Files

Organizza i file in cartelle logiche:

```
medidea-storage/
├── attivita/
│   ├── {id_attivita}/
│   │   ├── preventivo_{timestamp}.pdf
│   │   ├── accettazione_{timestamp}.pdf
│   │   └── altro_{timestamp}.pdf
├── apparecchiature/
│   ├── {id_apparecchiatura}/
│   │   ├── test_elettrico_{timestamp}.pdf
│   │   ├── test_funzionale_{timestamp}.pdf
│   │   └── certificazione_{timestamp}.pdf
└── temp/
    └── {uploads_temporanei}
```

## Sicurezza

### Validazione File

Sempre validare file prima dell'upload:

```typescript
import { validateFileSize, validateFileType } from "@/lib/storage";

// Verifica dimensione (max 10MB)
if (!validateFileSize(file.size)) {
  return NextResponse.json({ error: "File troppo grande" }, { status: 400 });
}

// Verifica tipo file
const allowedTypes = ["pdf", "jpg", "png"];
if (!validateFileType(file.name, allowedTypes)) {
  return NextResponse.json({ error: "Tipo file non permesso" }, { status: 400 });
}
```

### Signed URLs (Futuro)

Per accesso temporaneo sicuro:

```typescript
// Genera URL firmato valido per 1 ora
const signedUrl = await env.STORAGE.createSignedUrl(key, {
  expiresIn: 3600,
});
```

## Best Practices

1. **Nomenclatura Chiavi**: Usa chiavi descrittive e organizzate
   - ✅ `attivita/123/preventivo_20251118.pdf`
   - ❌ `file1.pdf`

2. **Metadata**: Salva sempre metadata utili
   ```typescript
   customMetadata: {
     originalName: file.name,
     uploadedBy: userId,
     uploadedAt: new Date().toISOString(),
     category: "preventivo",
   }
   ```

3. **Cleanup**: Elimina file obsoleti periodicamente

4. **Backup**: Considera replica su secondo bucket per backup

5. **Monitoraggio**: Traccia usage con analytics Cloudflare

## Troubleshooting

### Errore: "Bucket not found"
Verifica che il bucket sia stato creato e che il nome in `wrangler.toml` corrisponda.

### File non trovato dopo upload
Controlla la chiave usata - R2 è case-sensitive.

### CORS errors
Verifica configurazione CORS del bucket e origins permessi.

### Upload fails in development
R2 bindings non sono disponibili in `next dev`. Usa `wrangler pages dev` per test locali o deploy su staging.

## Limiti e Costi

- **Free Tier**: 10 GB storage, 1 milione di Class A operations/mese
- **Limiti**: Max 5 TB per object, nessun limite bucket
- **Prezzi**: $0.015/GB storage dopo free tier

## Risorse

- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [R2 API Reference](https://developers.cloudflare.com/r2/api/workers/)
- [Wrangler R2 Commands](https://developers.cloudflare.com/workers/wrangler/commands/#r2)
