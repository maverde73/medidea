# Test Piano: Gestione Clienti

## Informazioni Generali

- **Area**: Clienti CRUD Operations
- **Ruoli coinvolti**: admin, tecnico, user
- **Priorità**: 🟡 Core
- **Prerequisiti**:
  - Database seeded o vuoto (secondo test)
  - Utenti di tutti i ruoli creati
- **Tempo stimato**: ~35 minuti

## Dati di Test

### Clienti Valid

| Nome | Indirizzo | Contatti |
|------|-----------|----------|
| Ospedale San Raffaele | Via Olgettina 60, Milano | 02-12345678, info@osr.it |
| Clinica Privata Roma | Via Nazionale 10, Roma | 06-98765432 |
| ASL Torino | Corso Regina 123, Torino | 011-5556677 |

### Dati Invalid

| Scenario | Nome | Motivo |
|----------|------|--------|
| Nome vuoto | "" | Obbligatorio |
| Nome NULL | null | Obbligatorio |
| Nome duplicato | "Ospedale San Raffaele" | UNIQUE constraint |

---

## Scenari di Test

### TC-CLI-01 - Visualizza Lista Clienti (GET)

**Obiettivo**: Verificare lettura lista clienti

**Prerequisiti**:
- Database con almeno 3 clienti
- Loggato (qualsiasi ruolo)

**Passi**:

1. Navigare a `/clienti`
   - **Risultato Atteso**:
     - HTTP 200
     - Lista clienti visibile
     - Ogni cliente mostra: nome, indirizzo, contatti

2. Verificare API call
   - **Azione**: DevTools → Network → GET `/api/clienti`
   - **Risultato Atteso**:
     - HTTP 200
     - Response JSON array:
       ```json
       [
         {
           "id": 1,
           "nome": "Ospedale San Raffaele",
           "indirizzo": "...",
           "contatti": "...",
           "created_at": "...",
           "updated_at": "..."
         },
         ...
       ]
       ```

**Criteri Pass/Fail**:
- ✅ Pass: Lista visibile, dati corretti
- ❌ Fail: Errore, lista vuota quando clienti esistono, dati mancanti

---

### TC-CLI-02 - Crea Nuovo Cliente con Tutti i Campi

**Obiettivo**: Creare cliente con dati completi

**Prerequisiti**:
- Loggato come admin o tecnico
- Nome cliente non esistente

**Dati Test**:
| Campo | Valore |
|-------|--------|
| Nome | Policlinico Milano |
| Indirizzo | Viale della Repubblica 100, Milano |
| Contatti | 02-11223344, segreteria@policlinico.it |

**Passi**:

1. Navigare a `/clienti/new`
   - **Risultato Atteso**: Form creazione visibile con campi: Nome, Indirizzo, Contatti

2. Compilare tutti i campi
   - **Azione**: Inserire dati test sopra
   - **Risultato Atteso**: Campi compilati, nessun errore di validazione

3. Submit form
   - **Azione**: Click "Salva" o "Crea Cliente"
   - **Risultato Atteso**:
     - POST `/api/clienti` HTTP 201 Created
     - Response: nuovo cliente con ID assegnato
     - Redirect a `/clienti` o `/clienti/[new_id]`

4. Verifica cliente creato
   - **Azione**: Cercare "Policlinico Milano" nella lista
   - **Risultato Atteso**: Cliente visibile con tutti i dati corretti

**Criteri Pass/Fail**:
- ✅ Pass: Cliente creato, dati salvati correttamente
- ❌ Fail: Errore, dati mancanti/errati, no redirect

---

### TC-CLI-03 - Crea Cliente con Solo Nome (Campi Opzionali Vuoti)

**Obiettivo**: Verificare che solo Nome è obbligatorio

**Dati Test**:
| Campo | Valore |
|-------|--------|
| Nome | Cliente Test Minimo |
| Indirizzo | (vuoto) |
| Contatti | (vuoto) |

**Passi**:

1. Creare cliente con solo nome
   - **Azione**: POST `/api/clienti` con `{ "nome": "Cliente Test Minimo" }`
   - **Risultato Atteso**:
     - HTTP 201
     - Cliente creato con `indirizzo` = null, `contatti` = null

**Criteri Pass/Fail**:
- ✅ Pass: Cliente creato con campi opzionali null
- ❌ Fail: Errore su campi opzionali vuoti

---

### TC-CLI-04 - Crea Cliente con Nome Duplicato (ERRORE)

**Obiettivo**: Verificare UNIQUE constraint su nome

**Prerequisiti**:
- Cliente "Ospedale San Raffaele" già esistente

**Passi**:

1. Tentare creazione con nome duplicato
   - **Azione**: POST `/api/clienti` con `{ "nome": "Ospedale San Raffaele" }`
   - **Risultato Atteso**:
     - HTTP 400 Bad Request o 409 Conflict
     - Error message: "Nome cliente già esistente" o simile

**Criteri Pass/Fail**:
- ✅ Pass: Errore gestito, duplicato bloccato
- ❌ Fail: Cliente duplicato creato (BUG!)

---

### TC-CLI-05 - Crea Cliente con Nome Vuoto (ERRORE)

**Obiettivo**: Verificare validazione campo obbligatorio Nome

**Passi**:

1. Tentare creazione senza nome
   - **Azione**: POST `/api/clienti` con `{ "nome": "" }` o `{}`
   - **Risultato Atteso**:
     - HTTP 400
     - Error: "Nome è obbligatorio" o "nome is required"

**Criteri Pass/Fail**:
- ✅ Pass: Validazione blocca creazione
- ❌ Fail: Cliente creato con nome vuoto/null

---

### TC-CLI-06 - Visualizza Dettagli Singolo Cliente

**Obiettivo**: Visualizzare pagina dettaglio cliente

**Prerequisiti**:
- Cliente esistente (id noto)

**Passi**:

1. Navigare a `/clienti/[id]`
   - **Risultato Atteso**:
     - HTTP 200
     - Pagina dettaglio con:
       - Nome cliente
       - Indirizzo
       - Contatti
       - Lista apparecchiature associate (se esistono)
       - Lista attività associate (se esistono)

2. Verificare API call
   - **Azione**: GET `/api/clienti/[id]`
   - **Risultato Atteso**:
     - HTTP 200
     - Response JSON con dettagli cliente

**Criteri Pass/Fail**:
- ✅ Pass: Dettagli visibili e corretti
- ❌ Fail: Errore 404, dati mancanti

---

### TC-CLI-07 - Modifica Cliente Esistente

**Obiettivo**: Aggiornare dati cliente

**Prerequisiti**:
- Cliente esistente
- Loggato come admin o tecnico

**Passi**:

1. Aprire modifica cliente
   - **Azione**: Navigare a `/clienti/[id]` → click "Modifica"
   - **Risultato Atteso**: Form pre-compilato con dati attuali

2. Modificare indirizzo
   - **Azione**: Cambiare `indirizzo` = "Nuovo Indirizzo 123"
   - **Azione**: Click "Salva"
   - **Risultato Atteso**:
     - PUT `/api/clienti/[id]` HTTP 200
     - Response: cliente aggiornato

3. Verifica modifica
   - **Azione**: Ricaricare pagina o GET `/api/clienti/[id]`
   - **Risultato Atteso**: Indirizzo aggiornato visibile

**Criteri Pass/Fail**:
- ✅ Pass: Modifica salvata correttamente
- ❌ Fail: Modifica non salvata, dati errati

---

### TC-CLI-08 - Elimina Cliente senza Apparecchiature/Attività (SUCCESS)

**Obiettivo**: Eliminare cliente "pulito" (senza relazioni)

**Prerequisiti**:
- Cliente senza apparecchiature né attività
- Loggato come admin

**Passi**:

1. Eliminare cliente
   - **Azione**: Click "Elimina" su cliente → Conferma
   - **Risultato Atteso**:
     - DELETE `/api/clienti/[id]` HTTP 200 o 204
     - Response: `{ "success": true }` o simile

2. Verifica eliminazione
   - **Azione**: GET `/api/clienti/[id]`
   - **Risultato Atteso**: HTTP 404 Not Found

3. Verifica lista aggiornata
   - **Azione**: GET `/api/clienti`
   - **Risultato Atteso**: Cliente non più nella lista

**Criteri Pass/Fail**:
- ✅ Pass: Cliente eliminato correttamente
- ❌ Fail: Cliente ancora esistente, errore

---

### TC-CLI-09 - Elimina Cliente con Apparecchiature (ERRORE FK)

**Obiettivo**: Verificare protezione Foreign Key

**Prerequisiti**:
- Cliente con almeno 1 apparecchiatura associata
- Loggato come admin

**Passi**:

1. Tentare eliminazione
   - **Azione**: DELETE `/api/clienti/[id]`
   - **Risultato Atteso**:
     - HTTP 400 o 409 Conflict
     - Error: "Impossibile eliminare cliente con apparecchiature" o "Foreign key constraint"

2. Verifica cliente NON eliminato
   - **Azione**: GET `/api/clienti/[id]`
   - **Risultato Atteso**: HTTP 200, cliente ancora esistente

**Criteri Pass/Fail**:
- ✅ Pass: Eliminazione bloccata, FK protetto
- ❌ Fail: Cliente eliminato con apparecchiature (BUG CRITICO!)

---

### TC-CLI-10 - Ricerca Cliente per Nome

**Obiettivo**: Filtro ricerca nella lista clienti

**Prerequisiti**:
- Lista clienti con almeno 3 voci

**Passi**:

1. Usare campo ricerca
   - **Azione**: Digitare "Ospedale" nel search box
   - **Risultato Atteso**:
     - Lista filtrata mostra solo "Ospedale San Raffaele"
     - Altri clienti nascosti

2. Ricerca parziale (case insensitive)
   - **Azione**: Digitare "osp" (minuscolo)
   - **Risultato Atteso**: Trova "Ospedale..." (case insensitive)

3. Ricerca nessun risultato
   - **Azione**: Digitare "NonEsiste"
   - **Risultato Atteso**: "Nessun cliente trovato" o lista vuota

**Criteri Pass/Fail**:
- ✅ Pass: Ricerca funziona, filtro corretto, case insensitive
- ❌ Fail: Ricerca non funziona, risultati errati

---

### TC-CLI-11 - Permessi: Tecnico Può Creare Cliente

**Obiettivo**: Verificare permesso creazione per tecnico

**Prerequisiti**:
- Loggato come tecnico

**Passi**:

1. Tentare creazione
   - **Azione**: POST `/api/clienti` con dati validi
   - **Risultato Atteso**: HTTP 201, cliente creato

**Criteri Pass/Fail**:
- ✅ Pass: Tecnico può creare clienti
- ❌ Fail: Errore 403 (tecnico dovrebbe poter creare!)

---

### TC-CLI-12 - Permessi: User NON Può Creare Cliente

**Obiettivo**: Verificare blocco creazione per user

**Prerequisiti**:
- Loggato come user

**Passi**:

1. Tentare creazione
   - **Azione**: POST `/api/clienti` con dati validi
   - **Risultato Atteso**:
     - HTTP 403 Forbidden
     - Error: "Accesso negato" o "Insufficient permissions"

2. Verifica UI
   - **Azione**: Navigare a `/clienti`
   - **Risultato Atteso**: Pulsante "Nuovo Cliente" NON visibile o disabilitato

**Criteri Pass/Fail**:
- ✅ Pass: User bloccato, errore 403
- ❌ Fail: User può creare (BUG SICUREZZA!)

---

### TC-CLI-13 - Permessi: Solo Admin Può Eliminare Cliente

**Obiettivo**: Verificare permesso eliminazione

**Passi**:

1. Tecnico tenta eliminazione
   - **Prerequisiti**: Loggato come tecnico
   - **Azione**: DELETE `/api/clienti/[id]`
   - **Risultato Atteso**: HTTP 403

2. Admin esegue eliminazione
   - **Prerequisiti**: Loggato come admin
   - **Azione**: DELETE `/api/clienti/[id]` (cliente senza apparecchiature)
   - **Risultato Atteso**: HTTP 200, cliente eliminato

**Criteri Pass/Fail**:
- ✅ Pass: Solo admin può eliminare
- ❌ Fail: Tecnico può eliminare, user può eliminare

---

## Execution Log

| Test ID | Data | Tester | Risultato | Note |
|---------|------|--------|-----------|------|
| TC-CLI-01 | | | | |
| TC-CLI-02 | | | | |
| TC-CLI-03 | | | | |
| TC-CLI-04 | | | | |
| TC-CLI-05 | | | | |
| TC-CLI-06 | | | | |
| TC-CLI-07 | | | | |
| TC-CLI-08 | | | | |
| TC-CLI-09 | | | | |
| TC-CLI-10 | | | | |
| TC-CLI-11 | | | | |
| TC-CLI-12 | | | | |
| TC-CLI-13 | | | | |

## Summary

- **Totale Test Cases**: 13
- **Pass**:
- **Fail**:
- **Blocked**:
- **Pass Rate**: %

## Note

- Clienti sono entity base, prerequisito per apparecchiature e attività
- FK constraints critici: proteggere da eliminazioni accidentali
- Ricerca deve supportare case insensitive per UX migliore
