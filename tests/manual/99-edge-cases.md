# Test Piano: Edge Cases e Scenari Limite

## Informazioni Generali

- **Area**: Corner Cases, Boundary Testing, Unexpected Scenarios
- **Ruoli coinvolti**: Vari
- **Priorità**: ⚪ Edge Cases
- **Tempo stimato**: ~45 minuti

---

## Scenari di Test

### TC-EDGE-01 - Cliente senza Apparecchiature (Dashboard)

**Obiettivo**: Verificare che clienti senza apparecchiature non appaiano in dashboard

**Prerequisiti**:
- Cliente A con 2 apparecchiature
- Cliente B senza apparecchiature

**Passi**:
1. Navigare a dashboard `/`
   - **Risultato Atteso**:
     - Cliente A visibile
     - Cliente B NON visibile (nessuna apparecchiatura)

---

### TC-EDGE-02 - Apparecchiatura senza Attività

**Obiettivo**: Gruppo "Senza Attività" in dashboard

**Passi**:
1. Verificare apparecchiatura orfana
   - **Risultato Atteso**: Gruppo "Senza Attività" visibile con sfondo grigio

---

### TC-EDGE-03 - Attività senza Apparecchiatura

**Obiettivo**: id_apparecchiatura = NULL

**Passi**:
1. Creare attività con `id_apparecchiatura` = null
   - **Risultato Atteso**:
     - Creazione OK
     - Nessun crash
     - Visualizzazione corretta (nessun modello/seriale)

---

### TC-EDGE-04 - Eliminazione Cliente con Attività (FK)

**Passi**:
1. DELETE cliente con attività
   - **Risultato Atteso**: HTTP 400/409, FK constraint blocca eliminazione

---

### TC-EDGE-05 - Eliminazione Apparecchiatura con Attività (FK)

**Passi**:
1. DELETE apparecchiatura in uso
   - **Risultato Atteso**: Verificare comportamento FK (RESTRICT o CASCADE)

---

### TC-EDGE-06 - Cascata Delete Attività → Interventi

**Passi**:
1. DELETE attività con interventi
   - **Risultato Atteso**: Interventi eliminati (ON DELETE CASCADE)

---

### TC-EDGE-07 - Cascata Delete Attività → Allegati

**Passi**:
1. DELETE attività con allegati
   - **Risultato Atteso**: Verificare se allegati eliminati o id_riferimento invalidato

---

### TC-EDGE-08 - Modifica Stato senza data_chiusura Richiesta

**Passi**:
1. CHIUSO senza data_chiusura
   - **Risultato Atteso**: HTTP 400, validazione blocca

---

### TC-EDGE-09 - SQL Injection Tentativo

**Obiettivo**: Sicurezza SQL injection

**Passi**:
1. POST cliente con nome = `"Test'; DROP TABLE clienti; --"`
   - **Risultato Atteso**:
     - Nessun SQL injection
     - Nome salvato come string (escaped)
     - Tabella clienti ancora esiste

---

### TC-EDGE-10 - XSS Tentativo

**Obiettivo**: Sicurezza XSS

**Passi**:
1. POST attività con descrizione = `"<script>alert('XSS')</script>"`
   - **Risultato Atteso**:
     - Stringa salvata ma escaped
     - Nessun script eseguito in UI
     - Testo visualizzato come plain text

---

### TC-EDGE-11 - Token Expiry

**Passi**: [Vedi TC-AUTH-10]

---

### TC-EDGE-12 - Concurrent Edit

**Obiettivo**: 2 user modificano stessa attività

**Passi**:
1. User A apre attività ID=1
2. User B apre attività ID=1
3. User A modifica e salva
4. User B modifica e salva
   - **Risultato Atteso**:
     - Verificare comportamento: last-write-wins?
     - O conflict detection?

---

### TC-EDGE-13 - Upload File con Caratteri Speciali

**Passi**:
1. Upload file "test file (1) [special].pdf"
   - **Risultato Atteso**:
     - Upload OK
     - Nome sanitizzato in R2 key
     - Download funziona

---

### TC-EDGE-14 - Apparecchiatura Duplicata

**Prerequisiti**: App esistente: cliente=1, modello=1, seriale="SN001"

**Passi**:
1. POST con stessi valori
   - **Risultato Atteso**: Verificare logica business (permesso o bloccato?)

---

### TC-EDGE-15 - Dataset Vuoto (Empty State)

**Passi**:
1. Database completamente vuoto
2. Navigare dashboard
   - **Risultato Atteso**:
     - Nessun crash
     - Messaggio "Nessun cliente con apparecchiature"
     - Stats = 0

---

### TC-EDGE-16 - Paginazione con 0 Risultati

**Passi**:
1. GET `/api/attivita?page=999`
   - **Risultato Atteso**:
     - HTTP 200
     - Array vuoto []
     - Metadata corretto

---

### TC-EDGE-17 - Filtro con 0 Risultati

**Passi**:
1. GET con filtro impossibile (es: cliente=99999)
   - **Risultato Atteso**: HTTP 200, array vuoto

---

### TC-EDGE-18 - Modifica Attività Chiusa

**Passi**:
1. PUT su attività con stato=CHIUSO
   - **Risultato Atteso**: Verificare se permesso o bloccato

---

### TC-EDGE-19 - Eliminazione Utente Loggato (Self-Delete)

**Passi**:
1. Admin loggato tenta DELETE se stesso
   - **Risultato Atteso**: Verificare comportamento (bloccato? permesso?)

---

### TC-EDGE-20 - Password con Caratteri Speciali

**Passi**:
1. Creare utente con password = `"P@ssw0rd!#$%^&*()"`
   - **Risultato Atteso**:
     - Creazione OK
     - Login OK con stessa password
     - Password hashed correttamente

---

## Execution Log

| Test ID | Data | Tester | Risultato | Note |
|---------|------|--------|-----------|------|
| TC-EDGE-01 | | | | |
| TC-EDGE-02 | | | | |
| TC-EDGE-03 | | | | |
| TC-EDGE-04 | | | | |
| TC-EDGE-05 | | | | |
| TC-EDGE-06 | | | | |
| TC-EDGE-07 | | | | |
| TC-EDGE-08 | | | | |
| TC-EDGE-09 | | | | |
| TC-EDGE-10 | | | | |
| TC-EDGE-11 | | | | |
| TC-EDGE-12 | | | | |
| TC-EDGE-13 | | | | |
| TC-EDGE-14 | | | | |
| TC-EDGE-15 | | | | |
| TC-EDGE-16 | | | | |
| TC-EDGE-17 | | | | |
| TC-EDGE-18 | | | | |
| TC-EDGE-19 | | | | |
| TC-EDGE-20 | | | | |

## Summary

- **Totale Test Cases**: 20
- **Pass**:
- **Fail**:
- **Pass Rate**: %

## Note

- Edge cases spesso rivelano bug critici
- Importante testare sicurezza (SQL injection, XSS)
- Verificare comportamento con dati vuoti/nulli
- FK constraints essenziali per integrità dati
