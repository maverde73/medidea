# Test Piano: Attività - Stati e Transizioni

## Informazioni Generali

- **Area**: Activity State Machine & Transitions
- **Ruoli coinvolti**: admin, tecnico
- **Priorità**: 🔴 Critica (Business Logic Core)
- **Prerequisiti**:
  - Database seeded con clienti e apparecchiature
  - Utenti admin e tecnico creati
  - Familiarità con state machine delle attività
- **Tempo stimato**: ~45 minuti

## State Machine Diagram

```
APERTO (stato iniziale)
   │
   ├──[admin]──> CHIUSO (richiede data_chiusura)
   │                │
   │                └──[admin/tecnico]──> RIAPERTO
   │                                          │
   │                                          └──[admin]──> CHIUSO
   │
   └──[INVALID]──> RIAPERTO (non permesso diretto)
```

## Matrice Transizioni

| Da → A | APERTO | CHIUSO | RIAPERTO | Ruolo Richiesto |
|--------|--------|--------|----------|-----------------|
| **APERTO** | ❌ ERRORE | ✅ | ❌ ERRORE | admin |
| **CHIUSO** | ❌ ERRORE | ❌ ERRORE | ✅ | admin, tecnico |
| **RIAPERTO** | ❌ ERRORE | ✅ | ❌ ERRORE | admin |

## Regole di Transizione

1. **APERTO → CHIUSO**:
   - Solo admin
   - Richiede `data_chiusura` NOT NULL

2. **CHIUSO → RIAPERTO**:
   - admin o tecnico
   - `data_chiusura` può rimanere o essere rimosso

3. **RIAPERTO → CHIUSO**:
   - Solo admin
   - Richiede `data_chiusura` NOT NULL

4. **Transizioni NON Permesse**:
   - Stesso stato → stesso stato
   - APERTO → RIAPERTO (diretto)
   - CHIUSO → APERTO
   - RIAPERTO → APERTO

---

## Scenari di Test

### TC-STA-01 - Stato Iniziale APERTO alla Creazione

**Obiettivo**: Verificare che nuove attività abbiano stato = APERTO di default

**Prerequisiti**:
- Cliente esistente
- Loggato come admin o tecnico

**Passi**:

1. Creare nuova attività
   - **Azione**: POST /api/attivita con dati minimi:
     ```json
     {
       "id_cliente": 1,
       "descrizione_richiesta": "Test attività"
     }
     ```
   - **Risultato Atteso**:
     - HTTP 201 Created
     - Response body include: `"stato": "APERTO"`
     - `data_chiusura`: null

2. Verificare in database
   - **Azione**: Query `SELECT stato FROM attivita WHERE id = [new_id]`
   - **Risultato Atteso**: `stato = "APERTO"`

**Criteri di Pass/Fail**:
- ✅ **Pass**: Stato iniziale sempre APERTO
- ❌ **Fail**: Stato diverso o NULL

---

### TC-STA-02 - GET Allowed Transitions da APERTO (Admin)

**Obiettivo**: Verificare che admin veda transizione CHIUSO da APERTO

**Prerequisiti**:
- Attività con stato APERTO
- Loggato come admin

**Passi**:

1. Ottenere transizioni consentite
   - **Azione**: GET `/api/attivita/[id]/stato`
   - **Risultato Atteso**:
     ```json
     {
       "current_state": "APERTO",
       "allowed_transitions": ["CHIUSO"]
     }
     ```

**Criteri di Pass/Fail**:
- ✅ **Pass**: Admin vede ["CHIUSO"] come unica transizione permessa
- ❌ **Fail**: Transizioni mancanti o errate

---

### TC-STA-03 - GET Allowed Transitions da APERTO (Tecnico)

**Obiettivo**: Verificare che tecnico NON veda transizione CHIUSO da APERTO

**Prerequisiti**:
- Attività APERTO
- Loggato come tecnico

**Passi**:

1. GET `/api/attivita/[id]/stato`
   - **Risultato Atteso**:
     ```json
     {
       "current_state": "APERTO",
       "allowed_transitions": []
     }
     ```
     oppure
     ```json
     {
       "current_state": "APERTO",
       "allowed_transitions": ["CHIUSO"],
       "user_allowed_transitions": []
     }
     ```

**Criteri di Pass/Fail**:
- ✅ **Pass**: Tecnico non può chiudere da APERTO (lista vuota o filtrata)
- ❌ **Fail**: Tecnico vede CHIUSO come opzione

---

### TC-STA-04 - Admin: APERTO → CHIUSO (con data_chiusura)

**Obiettivo**: Verificare transizione valida APERTO → CHIUSO

**Prerequisiti**:
- Attività APERTO (id noto)
- Loggato come admin

**Passi**:

1. Eseguire transizione
   - **Azione**: PUT `/api/attivita/[id]/stato`
     ```json
     {
       "nuovo_stato": "CHIUSO",
       "data_chiusura": "2024-06-15"
     }
     ```
   - **Risultato Atteso**:
     - HTTP 200 OK
     - Response: `{ "success": true, "stato": "CHIUSO", "data_chiusura": "2024-06-15" }`

2. Verificare stato aggiornato
   - **Azione**: GET `/api/attivita/[id]`
   - **Risultato Atteso**:
     - `stato`: "CHIUSO"
     - `data_chiusura`: "2024-06-15"

**Criteri di Pass/Fail**:
- ✅ **Pass**: Transizione successo, stato CHIUSO, data salvata
- ❌ **Fail**: Errore, stato non cambiato, data non salvata

---

### TC-STA-05 - Admin: APERTO → CHIUSO senza data_chiusura (ERRORE)

**Obiettivo**: Verificare che chiusura senza data fallisca

**Prerequisiti**:
- Attività APERTO
- Loggato come admin

**Passi**:

1. Tentare chiusura senza data
   - **Azione**: PUT `/api/attivita/[id]/stato`
     ```json
     {
       "nuovo_stato": "CHIUSO"
     }
     ```
     (o con `data_chiusura`: null)
   - **Risultato Atteso**:
     - HTTP 400 Bad Request
     - Error message: "data_chiusura è obbligatoria per stato CHIUSO" o simile

2. Verificare stato non cambiato
   - **Azione**: GET `/api/attivita/[id]`
   - **Risultato Atteso**: `stato` ancora "APERTO"

**Criteri di Pass/Fail**:
- ✅ **Pass**: Errore gestito, stato non cambiato
- ❌ **Fail**: Stato CHIUSO senza data (BUG CRITICO!)

---

### TC-STA-06 - Tecnico: APERTO → CHIUSO (ERRORE 403)

**Obiettivo**: Verificare che tecnico non possa chiudere da APERTO

**Prerequisiti**:
- Attività APERTO
- Loggato come tecnico

**Passi**:

1. Tentare chiusura come tecnico
   - **Azione**: PUT `/api/attivita/[id]/stato`
     ```json
     {
       "nuovo_stato": "CHIUSO",
       "data_chiusura": "2024-06-15"
     }
     ```
   - **Risultato Atteso**:
     - HTTP 403 Forbidden
     - Error: "Solo admin può chiudere attività da APERTO" o simile

2. Verificare stato non cambiato
   - **Azione**: GET `/api/attivita/[id]`
   - **Risultato Atteso**: `stato` ancora "APERTO"

**Criteri di Pass/Fail**:
- ✅ **Pass**: Errore 403, stato non cambiato
- ❌ **Fail**: Tecnico può chiudere (BUG CRITICO SICUREZZA!)

---

### TC-STA-07 - Tentativo APERTO → RIAPERTO (ERRORE Invalid)

**Obiettivo**: Verificare che transizione diretta APERTO → RIAPERTO sia bloccata

**Prerequisiti**:
- Attività APERTO
- Loggato come admin

**Passi**:

1. Tentare transizione invalida
   - **Azione**: PUT `/api/attivita/[id]/stato`
     ```json
     {
       "nuovo_stato": "RIAPERTO"
     }
     ```
   - **Risultato Atteso**:
     - HTTP 400 Bad Request
     - Error: "Transizione non permessa" o "APERTO → RIAPERTO non valida"

**Criteri di Pass/Fail**:
- ✅ **Pass**: Transizione bloccata, errore chiaro
- ❌ **Fail**: Transizione permessa (BUG LOGICA!)

---

### TC-STA-08 - Tentativo APERTO → APERTO (ERRORE Stesso Stato)

**Obiettivo**: Verificare che transizione a stesso stato sia bloccata

**Passi**:

1. Tentare transizione a stesso stato
   - **Azione**: PUT `/api/attivita/[id]/stato`
     ```json
     {
       "nuovo_stato": "APERTO"
     }
     ```
   - **Risultato Atteso**:
     - HTTP 400
     - Error: "Stato già APERTO" o "Transizione a stesso stato non permessa"

**Criteri di Pass/Fail**:
- ✅ **Pass**: Errore gestito
- ❌ **Fail**: Transizione permessa (spreco di risorse)

---

### TC-STA-09 - GET Allowed Transitions da CHIUSO

**Obiettivo**: Verificare che da CHIUSO si può andare solo a RIAPERTO

**Prerequisiti**:
- Attività CHIUSO
- Loggato come admin o tecnico

**Passi**:

1. GET `/api/attivita/[id]/stato`
   - **Risultato Atteso**:
     ```json
     {
       "current_state": "CHIUSO",
       "allowed_transitions": ["RIAPERTO"]
     }
     ```

**Criteri di Pass/Fail**:
- ✅ **Pass**: Unica transizione possibile è RIAPERTO
- ❌ **Fail**: Altre transizioni disponibili

---

### TC-STA-10 - Admin: CHIUSO → RIAPERTO

**Obiettivo**: Verificare riapertura attività chiusa (admin)

**Prerequisiti**:
- Attività CHIUSO (con data_chiusura)
- Loggato come admin

**Passi**:

1. Riaprire attività
   - **Azione**: PUT `/api/attivita/[id]/stato`
     ```json
     {
       "nuovo_stato": "RIAPERTO"
     }
     ```
   - **Risultato Atteso**:
     - HTTP 200
     - Response: `{ "stato": "RIAPERTO" }`

2. Verificare data_chiusura
   - **Azione**: GET `/api/attivita/[id]`
   - **Risultato Atteso**:
     - `stato`: "RIAPERTO"
     - `data_chiusura`: potrebbe essere null o mantenuta (verificare logica business)

**Criteri di Pass/Fail**:
- ✅ **Pass**: Stato RIAPERTO, transizione OK
- ❌ **Fail**: Errore, stato non cambiato

---

### TC-STA-11 - Tecnico: CHIUSO → RIAPERTO

**Obiettivo**: Verificare che tecnico PUÒ riaprire attività chiusa

**Prerequisiti**:
- Attività CHIUSO
- Loggato come tecnico

**Passi**:

1. Riaprire come tecnico
   - **Azione**: PUT `/api/attivita/[id]/stato` → "RIAPERTO"
   - **Risultato Atteso**:
     - HTTP 200
     - Stato cambiato a RIAPERTO

**Criteri di Pass/Fail**:
- ✅ **Pass**: Tecnico può riaprire attività chiuse
- ❌ **Fail**: Errore 403 (tecnico dovrebbe poter riaprire!)

---

### TC-STA-12 - Tentativo CHIUSO → APERTO (ERRORE Invalid)

**Obiettivo**: Verificare che non si possa tornare da CHIUSO ad APERTO

**Passi**:

1. Tentare CHIUSO → APERTO
   - **Azione**: PUT `/api/attivita/[id]/stato` → "APERTO"
   - **Risultato Atteso**:
     - HTTP 400
     - Error: "Transizione non permessa"

**Criteri di Pass/Fail**:
- ✅ **Pass**: Transizione bloccata
- ❌ **Fail**: Transizione permessa (BUG!)

---

### TC-STA-13 - GET Allowed Transitions da RIAPERTO (Admin)

**Obiettivo**: Verificare che da RIAPERTO admin può chiudere di nuovo

**Prerequisiti**:
- Attività RIAPERTO
- Loggato come admin

**Passi**:

1. GET `/api/attivita/[id]/stato`
   - **Risultato Atteso**:
     ```json
     {
       "current_state": "RIAPERTO",
       "allowed_transitions": ["CHIUSO"]
     }
     ```

**Criteri di Pass/Fail**:
- ✅ **Pass**: Admin vede CHIUSO come opzione
- ❌ **Fail**: Nessuna transizione disponibile

---

### TC-STA-14 - Admin: RIAPERTO → CHIUSO (con data_chiusura)

**Obiettivo**: Verificare nuova chiusura da RIAPERTO

**Prerequisiti**:
- Attività RIAPERTO
- Loggato come admin

**Passi**:

1. Chiudere di nuovo
   - **Azione**: PUT `/api/attivita/[id]/stato`
     ```json
     {
       "nuovo_stato": "CHIUSO",
       "data_chiusura": "2024-06-20"
     }
     ```
   - **Risultato Atteso**:
     - HTTP 200
     - Stato CHIUSO, data_chiusura aggiornata

**Criteri di Pass/Fail**:
- ✅ **Pass**: Chiusura successo
- ❌ **Fail**: Errore, stato non cambiato

---

### TC-STA-15 - Tecnico: RIAPERTO → CHIUSO (ERRORE 403)

**Obiettivo**: Verificare che tecnico non possa chiudere da RIAPERTO

**Prerequisiti**:
- Attività RIAPERTO
- Loggato come tecnico

**Passi**:

1. Tentare chiusura
   - **Azione**: PUT `/api/attivita/[id]/stato` → "CHIUSO" con data_chiusura
   - **Risultato Atteso**:
     - HTTP 403
     - Error: "Solo admin può chiudere"

**Criteri di Pass/Fail**:
- ✅ **Pass**: Errore 403
- ❌ **Fail**: Tecnico può chiudere (BUG!)

---

### TC-STA-16 - Ciclo Completo: APERTO → CHIUSO → RIAPERTO → CHIUSO

**Obiettivo**: Verificare workflow completo multi-transizione

**Prerequisiti**:
- Nuova attività APERTO
- Loggato come admin

**Passi**:

1. Stato iniziale
   - **Verifica**: `stato` = "APERTO"

2. Prima chiusura (APERTO → CHIUSO)
   - **Azione**: PUT stato → "CHIUSO" con data_chiusura = "2024-06-15"
   - **Verifica**: `stato` = "CHIUSO", `data_chiusura` = "2024-06-15"

3. Riapertura (CHIUSO → RIAPERTO)
   - **Azione**: PUT stato → "RIAPERTO"
   - **Verifica**: `stato` = "RIAPERTO"

4. Seconda chiusura (RIAPERTO → CHIUSO)
   - **Azione**: PUT stato → "CHIUSO" con data_chiusura = "2024-06-20"
   - **Verifica**: `stato` = "CHIUSO", `data_chiusura` = "2024-06-20" (aggiornata)

**Risultato Atteso Finale**:
- Ciclo completo funzionante
- Tutte le transizioni eseguite correttamente
- Date chiusura aggiornate appropriatamente

**Criteri di Pass/Fail**:
- ✅ **Pass**: Tutte le 3 transizioni OK, stati corretti, date salvate
- ❌ **Fail**: Qualsiasi errore in una delle transizioni

---

## Execution Log

| Test ID | Data | Tester | Risultato | Note |
|---------|------|--------|-----------|------|
| TC-STA-01 | | | | |
| TC-STA-02 | | | | |
| TC-STA-03 | | | | |
| TC-STA-04 | | | | |
| TC-STA-05 | | | | |
| TC-STA-06 | | | | |
| TC-STA-07 | | | | |
| TC-STA-08 | | | | |
| TC-STA-09 | | | | |
| TC-STA-10 | | | | |
| TC-STA-11 | | | | |
| TC-STA-12 | | | | |
| TC-STA-13 | | | | |
| TC-STA-14 | | | | |
| TC-STA-15 | | | | |
| TC-STA-16 | | | | |

## Summary

- **Totale Test Cases**: 16
- **Pass**:
- **Fail**:
- **Blocked**:
- **Pass Rate**: %

## Note Critiche

⚠️ **ATTENZIONE**: Lo state machine delle attività è CORE BUSINESS LOGIC
- Zero fallimenti accettati
- Qualsiasi bug è severity: CRITICAL
- Testare tutte le transizioni e tutti i ruoli
- Verificare sempre sia lato permessi che lato validazione dati
