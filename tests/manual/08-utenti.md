# Test Piano: Gestione Utenti

## Informazioni Generali

- **Area**: User Management (Admin Only)
- **Ruoli coinvolti**: admin
- **Priorità**: 🟢 Accessoria
- **Tempo stimato**: ~30 minuti
- **IMPORTANTE**: Tutti i test SOLO per ruolo admin

## Dati di Test

### Utenti da Creare
| Email | Password | Ruolo | Nome | Cognome |
|-------|----------|-------|------|---------|
| test.admin@test.com | SecurePass123! | admin | Test | Admin |
| test.tecnico@test.com | TecnicoPass1! | tecnico | Marco | Bianchi |
| test.user@test.com | UserPass1! | user | Giulia | Verdi |

---

## Scenari di Test

### TC-USR-01 - Visualizza Lista Utenti (Admin Only)

**Prerequisiti**: Login admin

**Passi**:
1. GET `/api/utenti`
   - **Risultato Atteso**:
     - HTTP 200
     - Array utenti con email, nome, cognome, role, active

---

### TC-USR-02 - Crea Utente con role=admin

**Passi**:
1. POST `/api/utenti`
   ```json
   {
     "email": "test.admin@test.com",
     "password": "SecurePass123!",
     "nome": "Test",
     "cognome": "Admin",
     "role": "admin"
   }
   ```
   - **Risultato Atteso**:
     - HTTP 201
     - Password hashed (non plain text in risposta)

---

### TC-USR-03 - Crea Utente con role=tecnico

**Passi**:
1. POST con `role` = "tecnico"
   - **Risultato Atteso**: HTTP 201

---

### TC-USR-04 - Crea Utente con role=user

**Passi**:
1. POST con `role` = "user"
   - **Risultato Atteso**: HTTP 201

---

### TC-USR-05 - Crea Utente con Email Duplicata (ERRORE)

**Prerequisiti**: Utente con email="test@test.com" esiste

**Passi**:
1. POST con stessa email
   - **Risultato Atteso**:
     - HTTP 400 o 409 Conflict
     - Error: "Email già esistente" (UNIQUE constraint)

---

### TC-USR-06 - Crea Utente con Email Invalida (ERRORE)

**Passi**:
1. POST con `email` = "invalid-email" (no @)
   - **Risultato Atteso**: HTTP 400, validation error

---

### TC-USR-07 - Verifica Password Hashing

**Passi**:
1. Dopo creazione utente, GET utente
2. Verificare che password NON sia visibile in plain text
   - **Risultato Atteso**:
     - Campo `password` non presente in response, oppure
     - Campo `password_hash` con hash bcrypt

---

### TC-USR-08 - Visualizza Dettagli Utente

**Passi**:
1. GET `/api/utenti/[id]`
   - **Risultato Atteso**: HTTP 200, dettagli utente senza password

---

### TC-USR-09 - Modifica Nome/Cognome Utente

**Passi**:
1. PUT `/api/utenti/[id]`
   ```json
   {
     "nome": "Nome Modificato",
     "cognome": "Cognome Modificato"
   }
   ```
   - **Risultato Atteso**: HTTP 200, dati aggiornati

---

### TC-USR-10 - Modifica Role Utente

**Passi**:
1. PUT con `role` = "admin" (cambia da tecnico a admin)
   - **Risultato Atteso**: Role aggiornato

---

### TC-USR-11 - Disabilita Utente (active=0)

**Passi**:
1. PUT con `active` = 0
   - **Risultato Atteso**: Utente disabilitato
2. Tentare login con utente disabilitato
   - **Risultato Atteso**: Login fallisce (vedi TC-AUTH-06)

---

### TC-USR-12 - Elimina Utente

**Passi**:
1. DELETE `/api/utenti/[id]`
   - **Risultato Atteso**:
     - HTTP 200
     - Utente eliminato

---

### TC-USR-13 - Permessi: Tecnico NON Può Accedere a /utenti

**Prerequisiti**: Login tecnico

**Passi**:
1. GET `/api/utenti`
   - **Risultato Atteso**: HTTP 403 Forbidden

2. Navigare a `/utenti` (UI)
   - **Risultato Atteso**: Redirect o errore 403

---

### TC-USR-14 - Permessi: User NON Può Accedere a /utenti

**Prerequisiti**: Login user

**Passi**:
1. GET `/api/utenti`
   - **Risultato Atteso**: HTTP 403

---

## Execution Log

| Test ID | Data | Tester | Risultato | Note |
|---------|------|--------|-----------|------|
| TC-USR-01 | | | | |
| TC-USR-02 | | | | |
| TC-USR-03 | | | | |
| TC-USR-04 | | | | |
| TC-USR-05 | | | | |
| TC-USR-06 | | | | |
| TC-USR-07 | | | | |
| TC-USR-08 | | | | |
| TC-USR-09 | | | | |
| TC-USR-10 | | | | |
| TC-USR-11 | | | | |
| TC-USR-12 | | | | |
| TC-USR-13 | | | | |
| TC-USR-14 | | | | |

## Summary

- **Totale Test Cases**: 14
- **Pass**:
- **Fail**:
- **Pass Rate**: %

## Note

- Password hashing è CRITICO per sicurezza
- Email UNIQUE constraint deve essere applicato
- Solo admin deve poter gestire utenti
