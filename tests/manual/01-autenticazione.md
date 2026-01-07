# Test Piano: Autenticazione

## Informazioni Generali

- **Area**: Authentication & Session Management
- **Ruoli coinvolti**: admin, tecnico, user
- **Priorità**: 🔴 Critica
- **Prerequisiti**:
  - Database seeded con utente admin
  - Applicazione in esecuzione su http://localhost:3000
  - Browser pulito (cache e localStorage vuoti)
- **Tempo stimato**: ~30 minuti

## Dati di Test

### Credenziali Valide

| Ruolo | Email | Password |
|-------|-------|----------|
| Admin | admin@medidea.local | admin123 |
| Tecnico | tecnico@medidea.local | tecnico123 |
| User | user@medidea.local | user123 |

**Note**: L'utente admin esiste sempre. Tecnico e User possono essere creati dall'admin.

### Credenziali Invalide

| Scenario | Email | Password |
|----------|-------|----------|
| Email errata | wrong@email.com | admin123 |
| Password errata | admin@medidea.local | wrongpassword |
| Email non esistente | notexist@test.com | anypassword |

---

## Scenari di Test

### TC-AUTH-01 - Login con Credenziali Admin Valide

**Obiettivo**: Verificare che un utente admin possa autenticarsi correttamente

**Prerequisiti**:
- Nessun utente loggato
- Database contiene utente admin

**Dati di Test**:
| Campo | Valore |
|-------|--------|
| Email | admin@medidea.local |
| Password | admin123 |
| Ruolo Atteso | admin |

**Passi**:

1. Navigare alla pagina di login
   - **Azione**: Aprire browser e visitare `http://localhost:3000/login`
   - **Risultato Atteso**:
     - Pagina login caricata correttamente
     - Form visibile con campi "Email" e "Password"
     - Pulsante "Login" visibile

2. Inserire credenziali admin
   - **Azione**: Digitare `admin@medidea.local` nel campo Email
   - **Azione**: Digitare `admin123` nel campo Password
   - **Risultato Atteso**: Campi compilati correttamente, nessun errore di validazione

3. Submit del form
   - **Azione**: Click su pulsante "Login" (o premere Enter)
   - **Risultato Atteso**:
     - Chiamata `POST /api/auth/login` visibile nel Network tab
     - Response HTTP 200
     - Response body contiene: `{ token: "...", user: { email, role: "admin", ... } }`
     - Redirect automatico a `/` (homepage)

4. Verifica sessione salvata
   - **Azione**: Aprire DevTools → Application → Local Storage
   - **Risultato Atteso**:
     - Token JWT salvato in localStorage (chiave: probabilmente "token" o "auth_token")
     - Token ha formato JWT (tre parti separate da punti)

5. Verifica UI autenticata
   - **Azione**: Osservare header/navbar della pagina
   - **Risultato Atteso**:
     - Nome utente o email visibile (es: "Admin")
     - Menu di logout visibile
     - Dashboard caricata correttamente

6. Verifica accesso funzionalità admin
   - **Azione**: Navigare a `/utenti`
   - **Risultato Atteso**:
     - Pagina utenti accessibile (HTTP 200)
     - Nessun errore 403 Forbidden

**Risultato Atteso Finale**:
- Utente autenticato come admin
- Token JWT salvato in localStorage
- Dashboard visibile con nome utente nell'header
- Accesso completo a tutte le funzionalità admin

**Criteri di Pass/Fail**:
- ✅ **Pass**: Login successo, token salvato, redirect a dashboard, accesso admin OK
- ❌ **Fail**: Errore login, no token, no redirect, errore 403 su /utenti, crash

**Note**:
- Verificare in Network tab che la password NON sia visibile in chiaro (deve essere nel body POST)
- Token JWT dovrebbe avere expiry 24h (verificabile decodificando il token su jwt.io)
- Screenshot atteso: Dashboard con header "Benvenuto Admin" o simile

---

### TC-AUTH-02 - Login con Credenziali Tecnico Valide

**Obiettivo**: Verificare che un utente tecnico possa autenticarsi correttamente

**Prerequisiti**:
- Utente tecnico creato in database (email: tecnico@medidea.local, password: tecnico123, role: tecnico)
- Nessun utente loggato

**Dati di Test**:
| Campo | Valore |
|-------|--------|
| Email | tecnico@medidea.local |
| Password | tecnico123 |
| Ruolo Atteso | tecnico |

**Passi**:

1. Navigare a `/login`
   - **Azione**: Visitare http://localhost:3000/login
   - **Risultato Atteso**: Form login visibile

2. Inserire credenziali tecnico
   - **Azione**: Email = `tecnico@medidea.local`, Password = `tecnico123`
   - **Risultato Atteso**: Campi compilati

3. Submit login
   - **Azione**: Click "Login"
   - **Risultato Atteso**:
     - POST /api/auth/login HTTP 200
     - Response: `{ token, user: { role: "tecnico", ... } }`
     - Redirect a `/`

4. Verifica sessione
   - **Azione**: Check localStorage
   - **Risultato Atteso**: Token salvato

5. Verifica accesso limitato
   - **Azione**: Navigare a `/utenti`
   - **Risultato Atteso**:
     - **Errore 403 Forbidden** (tecnico NON può gestire utenti)
     - Messaggio: "Accesso negato" o simile

6. Verifica accesso permesso
   - **Azione**: Navigare a `/attivita`
   - **Risultato Atteso**:
     - HTTP 200
     - Lista attività visibile (tecnico PUÒ vedere attività)

**Risultato Atteso Finale**:
- Utente autenticato come tecnico
- Accesso a funzionalità tecnico (clienti, attività, apparecchiature)
- Accesso NEGATO a funzionalità admin (gestione utenti)

**Criteri di Pass/Fail**:
- ✅ **Pass**: Login OK, token salvato, errore 403 su /utenti, accesso OK a /attivita
- ❌ **Fail**: Login fallito, tecnico può accedere a /utenti, no redirect

---

### TC-AUTH-03 - Login con Credenziali User Valide

**Obiettivo**: Verificare che un utente standard possa autenticarsi con accesso read-only

**Prerequisiti**:
- Utente user creato (email: user@medidea.local, password: user123, role: user)

**Dati di Test**:
| Campo | Valore |
|-------|--------|
| Email | user@medidea.local |
| Password | user123 |
| Ruolo Atteso | user |

**Passi**:

1-4. [Ripetere passi 1-4 di TC-AUTH-02 con credenziali user]

5. Verifica accesso read-only
   - **Azione**: Tentare di creare nuovo cliente (click "Nuovo Cliente")
   - **Risultato Atteso**:
     - Pulsante "Nuovo Cliente" NON visibile, oppure
     - Errore 403 se si tenta di accedere a `/clienti/new`

6. Verifica lettura consentita
   - **Azione**: Navigare a `/clienti`
   - **Risultato Atteso**:
     - HTTP 200
     - Lista clienti visibile (user PUÒ leggere)
     - Nessun pulsante "Elimina" o "Modifica" visibile

**Risultato Atteso Finale**:
- User autenticato
- Accesso read-only a tutti i dati
- Nessuna operazione di scrittura permessa

**Criteri di Pass/Fail**:
- ✅ **Pass**: Login OK, user può leggere ma non scrivere/modificare/eliminare
- ❌ **Fail**: User può creare/modificare/eliminare risorse

---

### TC-AUTH-04 - Login con Email Errata

**Obiettivo**: Verificare gestione errore per email non esistente

**Dati di Test**:
| Campo | Valore |
|-------|--------|
| Email | wrong@email.com |
| Password | admin123 |

**Passi**:

1. Navigare a `/login`
2. Inserire email errata: `wrong@email.com`
3. Inserire password: `admin123`
4. Click "Login"
   - **Risultato Atteso**:
     - POST /api/auth/login HTTP 401 Unauthorized
     - Nessun redirect
     - Messaggio errore visibile: "Credenziali non valide" o simile
     - Nessun token salvato in localStorage

**Risultato Atteso Finale**:
- Login fallito
- Utente rimane sulla pagina di login
- Messaggio errore chiaro e user-friendly

**Criteri di Pass/Fail**:
- ✅ **Pass**: Errore gestito, messaggio chiaro, no token salvato
- ❌ **Fail**: Login successo (BUG CRITICO!), crash, no messaggio errore

---

### TC-AUTH-05 - Login con Password Errata

**Obiettivo**: Verificare gestione errore per password errata

**Dati di Test**:
| Campo | Valore |
|-------|--------|
| Email | admin@medidea.local |
| Password | wrongpassword |

**Passi**:

1-4. [Simile a TC-AUTH-04]
   - **Risultato Atteso**:
     - POST /api/auth/login HTTP 401
     - Messaggio: "Credenziali non valide"
     - No token, no redirect

**Criteri di Pass/Fail**:
- ✅ **Pass**: Errore gestito correttamente
- ❌ **Fail**: Login successo, password non verificata (BUG CRITICO!)

---

### TC-AUTH-06 - Login con Account Disabilitato

**Obiettivo**: Verificare che account disabilitato (active=0) non possa accedere

**Prerequisiti**:
- Creare utente con active=0 tramite database o admin UI

**Dati di Test**:
| Campo | Valore |
|-------|--------|
| Email | disabled@medidea.local |
| Password | password123 |
| Active | 0 |

**Passi**:

1. Login con utente disabilitato
   - **Risultato Atteso**:
     - HTTP 401 o 403
     - Messaggio: "Account disabilitato" o "Accesso negato"
     - No token

**Criteri di Pass/Fail**:
- ✅ **Pass**: Login negato per account disabilitato
- ❌ **Fail**: Utente disabilitato può accedere (BUG CRITICO!)

---

### TC-AUTH-07 - Persistenza Sessione dopo Refresh

**Obiettivo**: Verificare che la sessione persista dopo refresh pagina

**Prerequisiti**:
- Utente loggato (qualsiasi ruolo)

**Passi**:

1. Login con admin (TC-AUTH-01)
2. Verificare che dashboard sia visibile
3. Refresh pagina (F5 o Ctrl+R)
   - **Risultato Atteso**:
     - Pagina ricarica
     - Utente rimane loggato (nessun redirect a /login)
     - Dashboard visibile come prima
     - Token ancora presente in localStorage

4. Navigare a pagina diversa (es: `/clienti`)
5. Tornare alla homepage `/`
   - **Risultato Atteso**: Utente ancora loggato

**Criteri di Pass/Fail**:
- ✅ **Pass**: Sessione persiste dopo refresh e navigazione
- ❌ **Fail**: Utente viene sloggato al refresh, token perso

---

### TC-AUTH-08 - Logout e Redirect

**Obiettivo**: Verificare funzionalità logout

**Prerequisiti**:
- Utente loggato

**Passi**:

1. Login come admin
2. Click pulsante "Logout" nell'header
   - **Risultato Atteso**:
     - Token rimosso da localStorage
     - Redirect automatico a `/login`
     - Messaggio "Logout effettuato" (opzionale)

3. Tentare di navigare a `/` senza login
   - **Risultato Atteso**:
     - Redirect automatico a `/login`

**Criteri di Pass/Fail**:
- ✅ **Pass**: Logout funziona, token cancellato, redirect OK
- ❌ **Fail**: Token non cancellato, utente rimane loggato, no redirect

---

### TC-AUTH-09 - Accesso Pagina Protetta senza Login

**Obiettivo**: Verificare protezione pagine autenticate

**Prerequisiti**:
- Nessun utente loggato
- localStorage vuoto

**Passi**:

1. Navigare direttamente a `/clienti` (pagina protetta)
   - **Risultato Atteso**:
     - Redirect automatico a `/login`
     - URL finale: `/login` o `/login?redirect=/clienti`

2. Navigare a `/attivita`
   - **Risultato Atteso**: Redirect a `/login`

3. Navigare a `/utenti`
   - **Risultato Atteso**: Redirect a `/login`

**Criteri di Pass/Fail**:
- ✅ **Pass**: Tutte le pagine protette redirect a /login se non autenticati
- ❌ **Fail**: Pagine protette accessibili senza login (BUG CRITICO!)

---

### TC-AUTH-10 - Token Expiry dopo 24h

**Obiettivo**: Verificare che token JWT scada dopo 24 ore (se testabile)

**Note**: Test difficile da eseguire manualmente (richiede 24h). Alternative:

**Opzione A - Manuale con attesa**:
1. Login
2. Attendere 24h
3. Tentare operazione (es: GET /api/clienti)
   - **Risultato Atteso**: HTTP 401, redirect a /login

**Opzione B - Forzatura con token modificato**:
1. Login e ottenere token
2. Modificare manualmente il token in localStorage (cambiare exp claim)
3. Tentare operazione
   - **Risultato Atteso**: HTTP 401

**Criteri di Pass/Fail**:
- ✅ **Pass**: Token scaduto viene rigettato, utente deve rifare login
- ❌ **Fail**: Token scaduto ancora valido (BUG SICUREZZA!)
- ⏭️ **Skipped**: Se non testabile manualmente

---

## Execution Log

| Test ID | Data | Tester | Risultato | Note |
|---------|------|--------|-----------|------|
| TC-AUTH-01 | | | | |
| TC-AUTH-02 | | | | |
| TC-AUTH-03 | | | | |
| TC-AUTH-04 | | | | |
| TC-AUTH-05 | | | | |
| TC-AUTH-06 | | | | |
| TC-AUTH-07 | | | | |
| TC-AUTH-08 | | | | |
| TC-AUTH-09 | | | | |
| TC-AUTH-10 | | | | |

## Summary

- **Totale Test Cases**: 10
- **Pass**:
- **Fail**:
- **Blocked**:
- **Skipped**:
- **Pass Rate**: %

## Note Generali

- La sicurezza dell'autenticazione è CRITICA per l'applicazione
- Zero fallimenti accettati su test AUTH
- Bug su autenticazione sono automaticamente severity: CRITICAL
- Testare sempre con browser in incognito mode per evitare cache issues
