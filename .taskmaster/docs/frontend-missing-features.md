# PRD - Funzionalità Frontend Mancanti Medidea

## 1. Panoramica

Il frontend attuale dell'applicazione Medidea implementa solo la visualizzazione base delle liste di attività e apparecchiature. Mancano completamente le funzionalità CRUD (Create, Read, Update, Delete), la gestione degli allegati PDF, la gestione degli interventi, i filtri avanzati e la dashboard con indicatori.

Tutte le API backend necessarie sono già implementate e funzionanti. Questo documento descrive le funzionalità frontend da implementare per completare l'applicazione secondo le specifiche originali (spec_app_cloudflare.md).

---

## 2. Form Creazione Attività

### 2.1 Descrizione
Pagina con form completo per l'inserimento di una nuova attività giornaliera. Accessibile dalla homepage o dalla lista attività tramite pulsante "Nuova Attività".

### 2.2 Campi del Form
**Dati Cliente:**
- Dropdown selezione cliente esistente (con ricerca)
- Link "Nuovo cliente" per apertura modal creazione cliente veloce

**Dati Apparecchiatura:**
- Modello (text input, obbligatorio)
- Seriale (text input, opzionale)
- Codice inventario cliente (text input, opzionale)

**Apertura Richiesta:**
- Modalità apertura richiesta (text input)
- Data apertura richiesta (date picker, obbligatorio)

**Preventivo:**
- Numero preventivo (text input)
- Data preventivo (date picker)
- Upload PDF preventivo (file input, opzionale)

**Accettazione:**
- Numero accettazione preventivo (text input)
- Data accettazione preventivo (date picker)
- Upload PDF accettazione (file input, opzionale)

**Note:**
- Note generali (textarea, opzionale)

### 2.3 Validazioni
- Cliente obbligatorio
- Modello obbligatorio
- Data apertura obbligatoria
- Validazione formato date
- Validazione tipo file PDF (max 10MB)

### 2.4 Integrazione API
- POST /api/attivita per creazione
- POST /api/allegati/upload per PDF (se presenti)
- GET /api/clienti per dropdown (da implementare se non esiste)

### 2.5 UX
- Loading state durante submit
- Messaggi successo/errore
- Redirect a pagina dettaglio dopo creazione
- Possibilità di salvare come bozza

---

## 3. Pagina Dettaglio Attività

### 3.1 Descrizione
Pagina dedicata `/attivita/[id]` che mostra tutti i dettagli di un'attività esistente, permette modifica, gestione interventi e allegati, e cambio stato.

### 3.2 Sezioni della Pagina

#### 3.2.1 Header con Badge Stato
- Titolo: Modello + Seriale
- Badge stato (APERTO verde, CHIUSO grigio, RIAPERTO giallo)
- Pulsanti azioni: Modifica, Chiudi/Riapri, Elimina

#### 3.2.2 Scheda Riepilogativa Dati
Card con tutti i campi dell'attività in formato read-only o edit mode:
- Cliente (con link a dettaglio cliente se esistente)
- Modello, seriale, codice inventario
- Modalità apertura e data
- Dati preventivo (numero, data)
- Dati accettazione (numero, data)
- Date apertura e chiusura
- Note generali

#### 3.2.3 Sezione Interventi
**Timeline Verticale** che mostra tutti gli interventi con:
- Data intervento (formattata)
- Operatore
- Descrizione completa
- Icona timeline

**Form Aggiungi Intervento** (collapsabile o in modal):
- Data intervento (date picker, default oggi)
- Operatore (text input, default utente corrente)
- Descrizione intervento (textarea, obbligatorio)
- Pulsante "Aggiungi Intervento"

#### 3.2.4 Sezione Allegati PDF
**Lista Allegati** con card per ogni file:
- Nome file originale
- Data caricamento
- Dimensione file
- Pulsante Download
- Pulsante Elimina (con conferma)

**Form Upload Nuovo Allegato:**
- File input con drag & drop
- Preview nome file selezionato
- Note allegato (opzionale)
- Pulsante "Carica PDF"
- Progress bar durante upload

### 3.3 Integrazione API
- GET /api/attivita/:id - dettagli attività
- PATCH /api/attivita/:id - modifica dati
- PUT /api/attivita/:id/stato - cambio stato
- GET /api/attivita/:id/interventi - lista interventi
- POST /api/attivita/:id/interventi - nuovo intervento
- POST /api/allegati/upload - upload PDF
- GET /api/download/[key] - download PDF
- DELETE /api/allegati/:id - eliminazione allegato

### 3.4 Logiche Business
- Se attività CHIUSA, mostrare pulsante "Riapri"
- Se attività APERTA/RIAPERTA, mostrare pulsante "Chiudi" (con campo data chiusura obbligatorio)
- Non permettere modifica se attività CHIUSA (tranne riapertura)
- Conferma prima di eliminare attività o allegati

---

## 4. Form Creazione Apparecchiature

### 4.1 Descrizione
Form per inserimento nuova apparecchiatura. Simile al form attività ma più semplice, focalizzato su test elettrici/funzionali.

### 4.2 Campi del Form
**Dati Base:**
- Cliente (dropdown con ricerca, obbligatorio)
- Modello (text input, obbligatorio)
- Seriale (text input, opzionale)

**Test:**
- Data test funzionali (date picker)
- Data test elettrici (date picker)

**Allegati:**
- Upload multiplo PDF (certificazioni, risultati test, foto)
- Possibilità di aggiungere più file contemporaneamente

**Note:**
- Note (textarea, opzionale)

### 4.3 Validazione
- Cliente obbligatorio
- Modello obbligatorio
- Validazione formato date
- Validazione file PDF

### 4.4 Integrazione API
- POST /api/apparecchiature - creazione
- POST /api/allegati/upload - upload PDF multipli

---

## 5. Pagina Dettaglio Apparecchiature

### 5.1 Descrizione
Pagina `/apparecchiature/[id]` per visualizzare e modificare dati apparecchiatura, gestire test e allegati.

### 5.2 Sezioni

#### 5.2.1 Dati Apparecchiatura
Card con:
- Cliente
- Modello
- Seriale
- Note
- Pulsante "Modifica"

#### 5.2.2 Test Elettrici/Funzionali
Card separata con:
- Data ultimo test funzionale
- Data ultimo test elettrico
- Pulsante "Registra Nuovo Test" che apre modal con:
  - Tipo test (dropdown: funzionale/elettrico)
  - Data test
  - Upload certificato PDF
  - Note test

#### 5.2.3 Allegati
Stessa struttura della sezione allegati delle attività:
- Lista allegati con download
- Upload nuovi PDF
- Eliminazione allegati

### 5.3 Integrazione API
- GET /api/apparecchiature/:id
- PATCH /api/apparecchiature/:id
- POST /api/allegati/upload
- GET /api/download/[key]
- DELETE /api/allegati/:id

---

## 6. Filtri Avanzati

### 6.1 Pagina Lista Attività - Filtri Migliorati

#### 6.1.1 Filtri da Aggiungere
Oltre ai filtri esistenti (stato, modello), aggiungere:

**Cliente:**
- Dropdown con ricerca/autocomplete
- Opzione "Tutti i clienti"
- Fetch da GET /api/clienti

**Intervallo Date Apertura:**
- Date picker range (da - a)
- Quick filters: "Ultima settimana", "Ultimo mese", "Ultimo anno"

**Seriale:**
- Text input con ricerca parziale

**Codice Inventario:**
- Text input con ricerca parziale

**Presenza Allegati:**
- Checkbox "Solo attività con allegati"
- Checkbox "Solo attività senza allegati"

**Data Chiusura:**
- Date picker range per attività chiuse

#### 6.1.2 UI Filtri
- Panel filtri collapsabile sulla sinistra o in top bar
- Badge con numero filtri attivi
- Pulsante "Resetta filtri"
- Pulsante "Applica" per eseguire ricerca
- Indicatore "X risultati trovati"

### 6.2 Pagina Lista Apparecchiature - Filtri

#### 6.2.1 Filtri Necessari
- Cliente (dropdown)
- Modello (text input)
- Seriale (text input)
- Test scaduti (checkbox con logica date)
- Presenza allegati

---

## 7. Dashboard Iniziale

### 7.1 Descrizione
Migliorare la homepage attuale aggiungendo indicatori e informazioni utili prima dei pulsanti di navigazione.

### 7.2 Sezione Indicatori (KPI Cards)

**Card Attività:**
- Totale attività
- Attività aperte (in rosso/arancione)
- Attività chiuse ultimo mese
- Attività riaperte (alert se > 0)

**Card Apparecchiature:**
- Totale apparecchiature
- Test in scadenza (entro 30 giorni)
- Apparecchiature senza test

**Card Documenti:**
- Totale allegati
- Spazio utilizzato su R2
- Upload recenti (ultimi 7 giorni)

### 7.3 Sezione Attività Recenti

**Ultimi Interventi:**
- Lista ultimi 5 interventi registrati
- Con: data, attività correlata (link), operatore, snippet descrizione

**Ultime Attività Modificate:**
- Lista ultime 5 attività con modifiche
- Con: modello, seriale, stato, data ultima modifica

### 7.4 Quick Actions
Oltre ai pulsanti esistenti, aggiungere:
- "Nuova Attività" (CTA primario)
- "Nuova Apparecchiatura"
- "Cerca Attività" (con search bar)

### 7.5 Integrazione API
- GET /api/stats/dashboard - endpoint per KPI (da creare)
- GET /api/interventi?limit=5&sort=desc - ultimi interventi
- GET /api/attivita?limit=5&sort=updated_desc - ultime modifiche

---

## 8. Gestione Clienti

### 8.1 Descrizione
Attualmente i clienti sono referenziati ma non c'è UI per gestirli. Necessaria pagina dedicata.

### 8.2 Lista Clienti

Pagina `/clienti` con:
- Tabella clienti (nome, indirizzo, contatti)
- Ricerca per nome
- Pulsante "Nuovo Cliente"
- Click su riga apre dettaglio

### 8.3 Form Creazione/Modifica Cliente

**Campi:**
- Nome (obbligatorio)
- Indirizzo
- Contatti (email, telefono)

**Modal o pagina separata**

### 8.4 Dettaglio Cliente

Pagina `/clienti/[id]` con:
- Dati cliente
- Lista attività collegate
- Lista apparecchiature collegate
- Pulsanti: Modifica, Elimina (con validazione se ha attività)

### 8.5 Integrazione API
- GET /api/clienti - lista
- POST /api/clienti - creazione
- GET /api/clienti/:id - dettaglio
- PATCH /api/clienti/:id - modifica
- DELETE /api/clienti/:id - eliminazione (da implementare backend se non esiste)

---

## 9. Componenti UI Riutilizzabili

### 9.1 FileUploader Component
Componente React per upload file con:
- Drag & drop area
- File input button
- Preview file selezionati
- Progress bar upload
- Validazione tipo/dimensione
- Gestione errori

**Props:**
- accept (default: 'application/pdf')
- maxSize (default: 10MB)
- multiple (default: false)
- onUploadComplete(fileInfo)
- onError(error)

### 9.2 FileList Component
Componente per mostrare lista allegati:
- Card per ogni file
- Download button
- Delete button (con conferma)
- Icona tipo file
- Formattazione dimensione

**Props:**
- files: Array
- onDownload(fileId)
- onDelete(fileId)
- readOnly (default: false)

### 9.3 AttivitaStatusBadge Component
Badge riutilizzabile per stati:
- Colori: APERTO (verde), CHIUSO (grigio), RIAPERTO (giallo)
- Props: status

### 9.4 DateRangePicker Component
Selector range date con:
- Two date pickers (from-to)
- Quick filters preset
- Clear button

### 9.5 ClientSelector Component
Dropdown clienti con:
- Ricerca/autocomplete
- Fetch lazy da API
- Opzione "Tutti"
- Link "Nuovo cliente" inline

### 9.6 InterventoTimeline Component
Timeline verticale per interventi:
- Card per ogni intervento
- Icona timeline
- Formattazione date
- Props: interventi array

### 9.7 LoadingSpinner Component
Spinner riutilizzabile per stati loading

### 9.8 ErrorAlert Component
Alert per messaggi errore con:
- Tipo (error, warning, success, info)
- Titolo
- Messaggio
- Dismissible

---

## 10. Navigazione e Layout

### 10.1 Navigation Bar
Aggiungere navigation bar persistente con:
- Logo/Nome app
- Link principali:
  - Dashboard
  - Attività
  - Apparecchiature
  - Clienti
- User menu dropdown (destra):
  - Nome utente
  - Ruolo
  - Logout

### 10.2 Breadcrumbs
Aggiungere breadcrumb navigation:
- Home > Attività > Dettaglio #123
- Cliccabili per navigazione rapida

### 10.3 Layout Responsive
- Mobile-first design
- Burger menu su mobile
- Filtri in drawer/modal su mobile
- Tabelle scrollabili orizzontalmente

---

## 11. Stati e Feedback

### 11.1 Loading States
Implementare per:
- Caricamento liste
- Submit form
- Upload file
- Download file

### 11.2 Empty States
Messaggi custom quando liste vuote:
- "Nessuna attività trovata. Crea la tua prima attività!"
- Con pulsante CTA per creazione

### 11.3 Error States
Gestione errori:
- Errori API (con retry)
- Errori validazione form
- Errori upload file
- 404 per risorse non trovate

### 11.4 Success Feedback
Toast/notifications per:
- Creazione successo
- Modifica salvata
- Upload completato
- Eliminazione confermata

---

## 12. Ottimizzazioni e Performance

### 12.1 Data Fetching
- Implementare caching con SWR o React Query
- Revalidazione automatica
- Optimistic updates per UX migliore

### 12.2 Lazy Loading
- Code splitting per route
- Lazy load componenti pesanti
- Infinite scroll per liste lunghe

### 12.3 Form State Management
- Gestione stato form con React Hook Form o Formik
- Validazione real-time
- Dirty state tracking

---

## 13. Accessibilità

### 13.1 Requisiti A11y
- Keyboard navigation completa
- ARIA labels su tutti i controlli
- Focus management appropriato
- Contrast ratio WCAG AA
- Screen reader friendly

### 13.2 Semantic HTML
- Uso corretto tag semantici
- Form labels appropriate
- Heading hierarchy corretta

---

## 14. Testing

### 14.1 Test da Implementare
- Unit tests per componenti UI
- Integration tests per form submission
- E2E tests per flussi principali:
  - Creazione attività completa
  - Upload e download PDF
  - Gestione interventi
  - Compilazione campi DDT in creazione attività
  - Upload file DDT con categoria corretta
  - Visualizzazione file DDT filtrati per categoria
  - Modifica campi DDT in attività esistente

### 14.2 Test Cases DDT

**Scenario 1: Creazione attività con DDT completo**
1. Compilare form nuova attività
2. Inserire numero DDT Cliente: "DDT-2024-001"
3. Inserire data DDT Cliente: 15/01/2024
4. Inserire numero DDT Consegna: "DDT-2024-002"
5. Inserire data DDT Consegna: 20/01/2024
6. Salvare attività
7. Verificare che i campi DDT siano salvati
8. Nella pagina dettaglio, caricare PDF nella sezione "DDT Cliente"
9. Verificare che il file appaia solo nella sezione "DDT Cliente"
10. Verificare badge "DDT Cliente" sul file
11. Caricare PDF nella sezione "DDT Consegna"
12. Verificare che il file appaia solo nella sezione "DDT Consegna"
13. Verificare badge "DDT Consegna" sul file

**Scenario 2: Modifica DDT attività esistente**
1. Aprire attività esistente
2. Click su "Modifica"
3. Modificare numero DDT Cliente
4. Salvare modifiche
5. Verificare che la modifica sia persistita
6. Ricaricare pagina e verificare che i dati DDT siano corretti

**Scenario 3: Upload DDT senza campi**
1. Creare attività senza compilare campi DDT
2. Salvare attività
3. Nella pagina dettaglio, verificare sezioni DDT vuote
4. Upload file PDF in sezione DDT Cliente
5. Verificare che file venga salvato con categoria corretta
6. Verificare che non sia necessario compilare numero/data DDT per upload

**Scenario 4: Download e eliminazione file DDT**
1. Aprire attività con file DDT caricati
2. Click su download file DDT Cliente
3. Verificare download corretto
4. Click su elimina file DDT Cliente (con conferma)
5. Verificare che file sia rimosso solo dalla sezione corretta
6. Verificare che file DDT Consegna rimanga intatto

---

## 15. Riepilogo Priorità

### Alta Priorità (MVP)
1. Form creazione attività
2. Pagina dettaglio attività con interventi
3. Upload/download PDF
4. Form creazione apparecchiature
5. Gestione clienti base

### Media Priorità
6. Filtri avanzati completi
7. Dashboard con KPI
8. Pagina dettaglio apparecchiature
9. Componenti UI riutilizzabili

### Bassa Priorità
10. Grafici dashboard
11. Export Excel/CSV
12. Test E2E completi
13. Performance optimizations avanzate

---

## 16. Note Tecniche

### 16.1 Stack Tecnologico Raccomandato
- React Hook Form per gestione form
- SWR o React Query per data fetching
- Headless UI o Radix UI per componenti base
- date-fns per manipolazione date
- react-dropzone per file upload

### 16.2 Struttura Cartelle Suggerita
```
app/
├── (dashboard)/
│   ├── page.tsx                 # Dashboard
│   ├── attivita/
│   │   ├── page.tsx            # Lista attività
│   │   ├── new/
│   │   │   └── page.tsx        # Form nuova attività
│   │   └── [id]/
│   │       ├── page.tsx        # Dettaglio attività
│   │       └── edit/
│   │           └── page.tsx    # Modifica attività
│   ├── apparecchiature/
│   │   ├── page.tsx
│   │   ├── new/
│   │   │   └── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   └── clienti/
│       ├── page.tsx
│       ├── new/
│       │   └── page.tsx
│       └── [id]/
│           └── page.tsx
├── components/
│   ├── ui/                      # Componenti base riutilizzabili
│   ├── forms/                   # Form components
│   ├── layout/                  # Layout components
│   └── features/                # Feature-specific components
└── lib/
    ├── hooks/                   # Custom hooks
    ├── utils/                   # Utilities
    └── api/                     # API client functions
```

---

## 17. Conclusione

Questo documento elenca tutte le funzionalità frontend mancanti necessarie per completare l'applicazione Medidea secondo le specifiche originali. Le API backend sono già implementate e testate, quindi l'implementazione frontend può procedere in parallelo su diverse funzionalità.

La priorità dovrebbe essere data alle funzionalità MVP (creazione, dettaglio, allegati) per rendere l'applicazione funzionalmente completa, seguita dai miglioramenti UX (filtri avanzati, dashboard) e infine dalle ottimizzazioni.
