# Setup Cloudflare Pages - Guida Passo per Passo

## Passo 1: Accedi a Cloudflare Pages
1. Vai su https://dash.cloudflare.com
2. Clicca su "Workers & Pages" nel menu laterale sinistro
3. Clicca sul tab "Pages" in alto

## Passo 2: Crea Nuovo Progetto Pages (o riconfigura quello esistente)
Se vedi già un progetto "medidea" con "No Git connection":
- Clicca sui tre puntini (...) accanto al progetto
- Seleziona "Settings" 
- Vai su "Builds & deployments"
- Clicca "Configure Production deployments"

OPPURE se il progetto non è configurato correttamente, meglio ricominciare:
- Clicca "Create application"
- Seleziona "Pages"
- Clicca "Connect to Git"

## Passo 3: Seleziona Repository
- Dovresti vedere "maverde73/medidea" nella lista
- Clicca sul repository per selezionarlo
- Clicca "Begin setup"

## Passo 4: Configura Build Settings
Inserisci questi valori ESATTI:

**Project name:** medidea

**Production branch:** master

**Framework preset:** Next.js (seleziona dal dropdown)

**Build command:** 
```
npm run pages:build
```

**Build output directory:** 
```
.open-next/assets
```

**Root directory:** (lascia vuoto)

## Passo 5: Environment Variables
Clicca su "Environment variables (advanced)" e aggiungi:

**Variable name:** NODE_VERSION
**Value:** 18

## Passo 6: Salva e Deploy
- Scorri in basso fino al pulsante "Save and Deploy"
- Clicca il pulsante
- Il primo deployment dovrebbe partire automaticamente

## Passo 7: Verifica Deployment
Dovresti vedere:
- Una schermata con il deployment in corso
- Lo stato del build (Building, Deploying, Success)
- Tempo stimato: 2-5 minuti per il primo deploy

Se vedi errori durante il build, copiami l'intero log per analizzarlo.

## Dopo il Primo Deploy
Una volta completato il deployment, dovremo:
1. Configurare i bindings per D1 database
2. Configurare i bindings per R2 storage
3. Aggiungere JWT_SECRET come environment variable
4. Verificare che l'app funzioni correttamente
