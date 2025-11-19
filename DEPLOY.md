# Medidea - Deployment Guide

## Deploy completato con successo! ✅

### URL Produzione
**https://medidea.cirrosi.workers.dev**

---

## Credenziali di accesso

### Utente Admin
- **Email**: `admin@medidea.local`
- **Password**: `admin123`

⚠️ **IMPORTANTE**: Cambiare la password dopo il primo accesso!

---

## Risorse Cloudflare configurate

### 1. Cloudflare Workers
- **Nome Worker**: medidea
- **URL**: https://medidea.cirrosi.workers.dev
- **Version ID**: 4bfd7318-b5c8-4130-9853-f9cc7c84a18e

### 2. D1 Database
- **Nome**: medidea-db
- **ID**: a1de6fa4-c485-4b6d-bb9a-8f9bf34c3482
- **Tabelle create**: 6 (clienti, attivita, interventi_attivita, apparecchiature, allegati, users)
- **Stato**: Production ready

### 3. R2 Storage
- **Nome Bucket**: medidea-storage
- **Uso**: Storage PDF e allegati
- **Stato**: Attivo

### 4. Secrets configurati
- **JWT_SECRET**: ✅ Configurato (generato con OpenSSL)

---

## Comandi utili per gestione

### Deploy aggiornamenti
```bash
npm run deploy
```

### Build locale per test
```bash
npm run pages:build
npm run preview
```

### Gestione database D1

#### Eseguire query sul database remoto
```bash
wrangler d1 execute medidea-db --remote --command="SELECT * FROM users"
```

#### Applicare migrazioni
```bash
wrangler d1 execute medidea-db --remote --file=db/migrations/NOME_FILE.sql
```

#### Backup database
```bash
wrangler d1 export medidea-db --remote --output=backup-$(date +%Y%m%d).sql
```

### Gestione secrets
```bash
# Visualizzare secrets configurati
wrangler secret list

# Aggiungere/modificare un secret
echo "VALORE_SECRET" | wrangler secret put NOME_SECRET

# Rimuovere un secret
wrangler secret delete NOME_SECRET
```

### Logs in real-time
```bash
wrangler tail
```

---

## Prossimi passi consigliati

### 1. Sicurezza
- [ ] Cambiare la password admin dopo il primo login
- [ ] Creare utenti tecnici con ruolo 'tecnico'
- [ ] Configurare policy CORS se necessario
- [ ] Abilitare 2FA per utenti admin (feature futura)

### 2. Dati iniziali
- [ ] Inserire clienti reali nel database
- [ ] Configurare apparecchiature esistenti
- [ ] Importare attività storiche se disponibili

### 3. Monitoraggio
- [ ] Configurare alerting su Cloudflare Dashboard
- [ ] Monitorare utilizzo D1 database
- [ ] Verificare limiti R2 storage

### 4. Custom Domain (opzionale)
Per configurare un dominio personalizzato:
1. Vai su Cloudflare Dashboard → Workers & Pages
2. Seleziona il worker "medidea"
3. Vai su Settings → Triggers → Custom Domains
4. Aggiungi il tuo dominio (es. medidea.tuodominio.it)

---

## Struttura API disponibili

### Autenticazione
- `POST /api/auth/login` - Login utente
- `GET /api/auth/me` - Informazioni utente corrente

### Attività
- `GET /api/attivita` - Lista attività (con filtri)
- `POST /api/attivita` - Crea nuova attività
- `GET /api/attivita/:id` - Dettaglio attività
- `PATCH /api/attivita/:id` - Aggiorna attività
- `POST /api/attivita/:id/stato` - Cambia stato attività
- `GET /api/attivita/:id/interventi` - Lista interventi

### Apparecchiature
- `GET /api/apparecchiature` - Lista apparecchiature
- `POST /api/apparecchiature` - Crea apparecchiatura
- `GET /api/apparecchiature/:id` - Dettaglio apparecchiatura
- `PATCH /api/apparecchiature/:id` - Aggiorna apparecchiatura

### Allegati PDF
- `POST /api/allegati/upload` - Carica PDF su R2
- `GET /api/allegati/:id` - Download PDF (signed URL)
- `DELETE /api/allegati/:id` - Elimina allegato (solo admin)

### Utility
- `GET /api/health` - Health check
- `GET /api/db/test` - Test connessione database

---

## Troubleshooting

### L'applicazione non risponde
```bash
# Verifica lo stato del worker
wrangler tail

# Redeploy
npm run deploy
```

### Errori di autenticazione
```bash
# Verifica che il JWT_SECRET sia configurato
wrangler secret list

# Se mancante, riconfiguralo
echo "x0mtrzm8ZiuqgoDF7eprwGxXLXyEKszyp2Pf4n3QpEs=" | wrangler secret put JWT_SECRET
```

### Database non risponde
```bash
# Verifica connessione
wrangler d1 execute medidea-db --remote --command="SELECT 1"

# Verifica tabelle
wrangler d1 execute medidea-db --remote --command="SELECT name FROM sqlite_master WHERE type='table'"
```

---

## Limiti del piano Free Cloudflare

- **Workers**: 100,000 richieste/giorno
- **D1**: 5 GB storage, 5M row reads/day, 100K row writes/day
- **R2**: 10 GB storage, 1M Class A operations/month, 10M Class B operations/month

Per aumentare i limiti, considera l'upgrade a piano Workers Paid ($5/month).

---

## Contatti e supporto

- **Repository**: /home/mverde/src/valerio/medidea
- **Cloudflare Dashboard**: https://dash.cloudflare.com
- **Account ID**: 6fb9e31b45f9da41895a71693ef0367c

---

**Data deploy**: 2025-11-19
**Versione**: 0.1.0
