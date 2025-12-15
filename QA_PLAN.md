# QA Plan - Medidea Application

Questo documento definisce il piano di Quality Assurance (QA) per l'applicazione Medidea. Include una lista strutturata di scenari di test manuali per verificare le funzionalità dell'applicazione Next.js full-stack deployata su Cloudflare Workers.

## Contesto
L'applicazione gestisce attività di manutenzione/assistenza tecnica, anagrafiche clienti, apparecchiature e utenti. Include funzionalità di upload file, export dati e gestione tabelle di lookup.

---

## Elenco Funzionalità

1.  **Autenticazione & Sicurezza**
2.  **Dashboard**
3.  **Gestione Attività**
4.  **Gestione Apparecchiature**
5.  **Gestione Clienti**
6.  **Gestione Utenti**
7.  **Registro & Export**
8.  **Impostazioni (Tabelle di Lookup)**

---

## Scenari di Test

### 1. Autenticazione & Sicurezza
**Scopo**: Verificare che solo gli utenti autorizzati possano accedere all'applicazione.
**Entrypoint**: `/login`

*   **Login Corretto (Happy Path)** [x]
    *   Inserire email e password corrette.
    *   Verificare reindirizzamento alla Dashboard.
    *   Verificare presenza del token in localStorage.
*   **Login con Credenziali Errate** [x]
    *   Inserire email non registrata o password errata.
    *   Verificare messaggio di errore visibile.
*   **Validazione Form Login** [ ]
    *   Provare il login lasciando i campi vuoti.
    *   Verificare messaggi di validazione (es. "Email obbligatoria").
*   **Accesso a Route Protetta senza Login** [ ]
    *   Cancellare il token (o usare finestra incognito).
    *   Navigare direttamente a `/attivita`.
    *   Verificare reindirizzamento automatico a `/login`.
*   **Logout** [x]
    *   Cliccare sul pulsante di logout (se presente) o cancellare token.
    *   Verificare reindirizzamento al login e impossibilità di accedere alle pagine protette.

### 2. Dashboard
**Scopo**: Visualizzare una panoramica dello stato del sistema.
**Entrypoint**: `/` (Home)

*   **Caricamento Dati**
    *   Accedere alla dashboard.
    *   Verificare che i KPI/statistiche vengano caricati correttamente.
    *   Verificare assenza di errori in console.
*   **Stato Loading**
    *   Verificare presenza di indicatori di caricamento (spinner/skeleton) durante il fetch dei dati.

### 3. Gestione Attività
**Scopo**: Gestire il ciclo di vita delle richieste di assistenza.
**Entrypoint**: `/attivita`, `/attivita/new`, `/attivita/[id]`

#### 3.1 Lista Attività
*   **Visualizzazione Lista**
    *   Verificare che la lista mostri le attività esistenti.
    *   Verificare la presenza di colonne chiave (ID, Cliente, Stato, Data).
*   **Navigazione Dettaglio**
    *   Cliccare su una riga o pulsante dettaglio.
    *   Verificare apertura della pagina di dettaglio corretta (`/attivita/[id]`).

#### 3.2 Creazione Attività
*   **Creazione Attività (Happy Path)** [x]
    *   Cliccare su "Nuova Attività".
    *   Compilare tutti i campi obbligatori (Cliente, Modello, Data, Reparto, Urgenza).
    *   Cliccare su Salva.
    *   Verificare reindirizzamento alla lista o dettaglio.
    *   Verificare presenza della nuova attività in lista.ggio di successo e presenza nella lista.
*   **Validazione Campi Obbligatori**
    *   Provare a salvare senza compilare i campi richiesti.
    *   Verificare messaggi di errore sui campi specifici.
*   **Creazione Automatica Apparecchiatura**
    *   Creare un'attività per una nuova apparecchiatura (se il flusso lo prevede).
    *   Verificare che l'apparecchiatura venga creata nel sistema.

#### 3.3 Modifica Attività
*   **Aggiornamento Dati**
    *   Modificare campi testuali e dropdown (es. cambiare Stato da APERTO a CHIUSO).
    *   Salvare.
    *   Ricaricare la pagina e verificare che le modifiche siano persistite.
*   **Gestione Date**
    *   Inserire date valide.
    *   Cancellare una data (lasciare vuoto).
    *   Verificare che il salvataggio avvenga correttamente (la data diventa NULL nel DB).
*   **Annullamento Modifiche**
    *   Modificare un campo, cliccare "Annulla" (se presente) o navigare indietro.
    *   Verificare che i dati non siano cambiati.

#### 3.4 Gestione File (Allegati)
*   **Upload PDF**
    *   Caricare un file PDF valido (< 10MB).
    *   Verificare che il file appaia nella lista allegati.
*   **Upload File Non Valido**
    *   Provare a caricare un file non PDF (es. .jpg, .txt).
    *   Verificare messaggio di errore.
*   **Upload File Troppo Grande**
    *   Provare a caricare un PDF > 10MB.
    *   Verificare messaggio di errore.
*   **Download File**
    *   Cliccare su un allegato esistente.
    *   Verificare che il file venga scaricato/aperto correttamente.
*   **Eliminazione File**
    *   Eliminare un allegato.
    *   Verificare conferma eliminazione e rimozione dalla lista.

#### 3.5 Eliminazione Attività
*   **Creazione Nuovo Utente** [x]
    *   Cliccare su "Nuovo Utente".
    *   Compilare form (Email, Password, Ruolo, Nome, Cognome).
    *   Salvare e verificare presenza in lista.mento alla lista e assenza dell'attività eliminata.

### 4. Gestione Apparecchiature
**Scopo**: Gestire l'inventario delle macchine/strumenti.
**Entrypoint**: `/apparecchiature`

*   **CRUD Base**
    *   Testare Creazione, Lettura, Aggiornamento ed Eliminazione come per le Attività.
*   **Validazione Specifica**
    *   Verificare obbligatorietà del campo "Modello".
    *   Verificare formati date per test funzionali/elettrici.

### 5. Gestione Clienti
**Scopo**: Gestire l'anagrafica clienti.
**Entrypoint**: `/clienti`

*   **CRUD Base** [x]
    *   Testare Creazione, Lettura, Aggiornamento ed Eliminazione.
*   **Ricerca** [x]
    *   Se presente barra di ricerca, provare a cercare per nome cliente.

### 6. Gestione Utenti
**Scopo**: Gestire gli accessi al sistema.
**Entrypoint**: `/utenti`

*   **CRUD Base**
    *   Testare Creazione, Lettura, Aggiornamento ed Eliminazione.
*   **Gestione Ruoli**
    *   Se applicabile, assegnare ruoli diversi e verificare (lato backend/frontend) se i permessi cambiano.

### 7. Registro & Export
**Scopo**: Consultazione tabellare e reportistica.
**Entrypoint**: `/registro`

*   **Filtri**
    *   Filtrare per Cliente (ricerca parziale).
    *   **Visualizzazione Lista** [x]
    *   Verificare caricamento tabella.
    *   Verificare presenza colonne corrette.
*   **Filtri** [x]
    *   Filtrare per data (da/a).
    *   Filtrare per cliente.
    *   Verificare aggiornamento lista.
*   **Export Excel** [x]
    *   Cliccare su "Esporta Excel".
    *   Verificare download del file (o assenza errori).
    *   Verificare che le colonne corrispondano a quelle a video e che i dati siano corretti (date formattate, caratteri speciali).
    *   Verificare export con dataset vuoto (dovrebbe generare file con sole intestazioni o gestire l'errore).

### 8. Impostazioni (Tabelle di Lookup)
**Scopo**: Configurare valori dinamici per le dropdown.
**Entrypoint**: `/impostazioni/tabelle`

*   **Navigazione Tab** [x]
    *   Cliccare su "Reparti" e "Modalità Apertura" nella sidebar o nei tab.
    *   Verificare cambio URL e contenuto lista.
*   **CRUD Reparti** [x]
    *   Aggiungere un nuovo Reparto.
    *   Modificare il nome di un Reparto esistente.
    *   Eliminare un Reparto.
*   **CRUD Modalità Apertura** [x]
    *   Eseguire operazioni CRUD analoghe per Modalità Apertura.
*   **Verifica Integrazione**
    *   Dopo aver aggiunto un nuovo Reparto/Modalità, andare in "Nuova Attività".
    *   Verificare che il nuovo valore sia selezionabile nella dropdown corrispondente.

---

## Note Generali & Edge Cases

*   **Gestione Errori Backend**
    *   Simulare errore 500 (es. spegnendo DB locale o mockando errore).
    *   Verificare che l'utente veda un messaggio di errore comprensibile (es. Toast o Alert) e non crash dell'app.
*   **Refresh Pagina**
    *   Premere F5 in varie pagine (dettaglio, form compilato a metà).
    *   Verificare mantenimento stato (es. auth) o gestione corretta (es. perdita dati form non salvati è accettabile ma va notata).
*   **Responsive**
    *   Verificare layout su mobile (apertura menu laterale, tabelle scrollabili).
