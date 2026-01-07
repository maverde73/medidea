# Test Piano: Permessi e Ruoli (ACL)

## Informazioni Generali

- **Area**: Access Control List - Role-Based Permissions
- **Ruoli coinvolti**: admin, tecnico, user
- **Priorità**: 🔴 Critica (Security)
- **Tempo stimato**: ~60 minuti
- **Prerequisiti**: Utenti di tutti e 3 i ruoli creati

## Matrice Permessi Completa

| Risorsa | Operazione | admin | tecnico | user |
|---------|-----------|-------|---------|------|
| **Clienti** |
| | GET (lista) | ✅ | ✅ | ✅ |
| | GET (singolo) | ✅ | ✅ | ✅ |
| | POST (crea) | ✅ | ✅ | ❌ |
| | PUT (modifica) | ✅ | ✅ | ❌ |
| | DELETE | ✅ | ❌ | ❌ |
| **Attività** |
| | GET (lista) | ✅ | ✅ | ✅ |
| | GET (singolo) | ✅ | ✅ | ✅ |
| | POST (crea) | ✅ | ✅ | ❌ |
| | PUT (modifica) | ✅ | ✅ | ❌ |
| | DELETE | ✅ | ❌ | ❌ |
| **Stati Attività** |
| | APERTO → CHIUSO | ✅ | ❌ | ❌ |
| | CHIUSO → RIAPERTO | ✅ | ✅ | ❌ |
| | RIAPERTO → CHIUSO | ✅ | ❌ | ❌ |
| **Apparecchiature** |
| | GET (lista) | ✅ | ✅ | ✅ |
| | GET (singolo) | ✅ | ✅ | ✅ |
| | POST (crea) | ✅ | ✅ | ❌ |
| | PUT (modifica) | ✅ | ✅ | ❌ |
| | DELETE | ✅ | ❌ | ❌ |
| **Interventi** |
| | GET (lista) | ✅ | ✅ | ✅ |
| | POST (crea) | ✅ | ✅ | ❌ |
| **Allegati** |
| | GET (lista) | ✅ | ✅ | ✅ |
| | GET (download) | ✅ | ✅ | ✅ |
| | POST (upload) | ✅ | ✅ | ❌ |
| | DELETE | ✅ | ❌ | ❌ |
| **Utenti** |
| | GET (lista) | ✅ | ❌ | ❌ |
| | POST (crea) | ✅ | ❌ | ❌ |
| | PUT (modifica) | ✅ | ❌ | ❌ |
| | DELETE | ✅ | ❌ | ❌ |
| **Lookup Tables** |
| | GET | ✅ | ✅ | ✅ |
| | POST/PUT/DELETE | ✅ | ? | ❌ |

---

## Test Cases

### Clienti - Permessi

#### TC-PERM-01 - Admin: CRUD Completo Clienti

**Passi**:
1. Login admin
2. GET `/api/clienti` → ✅ 200
3. POST `/api/clienti` → ✅ 201
4. PUT `/api/clienti/[id]` → ✅ 200
5. DELETE `/api/clienti/[id]` → ✅ 200

---

#### TC-PERM-02 - Tecnico: CRUD Parziale Clienti

**Passi**:
1. Login tecnico
2. GET → ✅ 200
3. POST → ✅ 201
4. PUT → ✅ 200
5. DELETE → ❌ 403

---

#### TC-PERM-03 - User: Solo Lettura Clienti

**Passi**:
1. Login user
2. GET → ✅ 200
3. POST → ❌ 403
4. PUT → ❌ 403
5. DELETE → ❌ 403

---

### Attività - Permessi

#### TC-PERM-04 - Admin: CRUD Completo Attività

**Passi**:
1. Login admin
2. GET → ✅ 200
3. POST → ✅ 201
4. PUT → ✅ 200
5. DELETE → ✅ 200

---

#### TC-PERM-05 - Tecnico: CRUD Parziale Attività

**Passi**:
1. Login tecnico
2. GET → ✅ 200
3. POST → ✅ 201
4. PUT → ✅ 200
5. DELETE → ❌ 403

---

#### TC-PERM-06 - User: Solo Lettura Attività

**Passi**:
1. Login user
2. GET → ✅ 200
3. POST/PUT/DELETE → ❌ 403

---

### Stati Attività - Permessi (CRITICO)

#### TC-PERM-07 - Admin: Tutte le Transizioni

**Passi**:
1. APERTO → CHIUSO → ✅ 200
2. CHIUSO → RIAPERTO → ✅ 200
3. RIAPERTO → CHIUSO → ✅ 200

---

#### TC-PERM-08 - Tecnico: Solo CHIUSO → RIAPERTO

**Passi**:
1. APERTO → CHIUSO → ❌ 403
2. CHIUSO → RIAPERTO → ✅ 200
3. RIAPERTO → CHIUSO → ❌ 403

---

#### TC-PERM-09 - User: Nessuna Transizione

**Passi**:
1. Qualsiasi PUT `/api/attivita/[id]/stato` → ❌ 403

---

### Apparecchiature - Permessi

#### TC-PERM-10 - Admin: CRUD Completo

**Passi**: [Pattern simile a TC-PERM-01]

---

#### TC-PERM-11 - Tecnico: CRUD Parziale

**Passi**: [Pattern simile a TC-PERM-02]

---

#### TC-PERM-12 - User: Solo Lettura

**Passi**: [Pattern simile a TC-PERM-03]

---

### Interventi - Permessi

#### TC-PERM-13 - Admin: Può Creare

**Passi**:
1. POST `/api/attivita/[id]/interventi` → ✅ 201

---

#### TC-PERM-14 - Tecnico: Può Creare

**Passi**:
1. POST → ✅ 201

---

#### TC-PERM-15 - User: NON Può Creare

**Passi**:
1. POST → ❌ 403

---

### Allegati - Permessi

#### TC-PERM-16 - Admin: Upload e Delete

**Passi**:
1. POST upload → ✅ 201
2. DELETE → ✅ 200

---

#### TC-PERM-17 - Tecnico: Upload OK, Delete NO

**Passi**:
1. POST upload → ✅ 201
2. DELETE → ❌ 403

---

#### TC-PERM-18 - User: Solo Download

**Passi**:
1. GET lista → ✅ 200
2. GET download → ✅ 200
3. POST upload → ❌ 403
4. DELETE → ❌ 403

---

### Utenti - Permessi (Admin Only)

#### TC-PERM-19 - Admin: CRUD Completo Utenti

**Passi**:
1. GET/POST/PUT/DELETE → ✅ Tutti 200/201

---

#### TC-PERM-20 - Tecnico: Nessun Accesso Utenti

**Passi**:
1. GET `/api/utenti` → ❌ 403
2. POST/PUT/DELETE → ❌ 403

---

#### TC-PERM-21 - User: Nessun Accesso Utenti

**Passi**:
1. Tutte le operazioni → ❌ 403

---

## Test Incrociati (Cross-Feature)

### TC-PERM-22 - User: Lettura Ovunque

**Obiettivo**: Verificare che user può leggere tutte le risorse ma non scrivere

**Passi**:
1. Login user
2. GET `/api/clienti` → ✅ 200
3. GET `/api/attivita` → ✅ 200
4. GET `/api/apparecchiature` → ✅ 200
5. GET `/api/allegati?...` → ✅ 200
6. POST qualsiasi risorsa → ❌ 403

---

### TC-PERM-23 - Tecnico: Operativo ma Non Admin

**Obiettivo**: Tecnico può lavorare ma non gestire sistema

**Passi**:
1. Login tecnico
2. POST `/api/clienti` → ✅ 201 (può creare)
3. POST `/api/attivita` → ✅ 201 (può creare)
4. DELETE `/api/clienti/[id]` → ❌ 403 (non può eliminare)
5. GET `/api/utenti` → ❌ 403 (non può gestire utenti)
6. PUT `/api/attivita/[id]/stato` CHIUSO → ❌ 403 (non può chiudere da APERTO)

---

## Execution Log

| Test ID | Data | Tester | Risultato | Note |
|---------|------|--------|-----------|------|
| TC-PERM-01 | | | | |
| TC-PERM-02 | | | | |
| TC-PERM-03 | | | | |
| TC-PERM-04 | | | | |
| TC-PERM-05 | | | | |
| TC-PERM-06 | | | | |
| TC-PERM-07 | | | | |
| TC-PERM-08 | | | | |
| TC-PERM-09 | | | | |
| TC-PERM-10 | | | | |
| TC-PERM-11 | | | | |
| TC-PERM-12 | | | | |
| TC-PERM-13 | | | | |
| TC-PERM-14 | | | | |
| TC-PERM-15 | | | | |
| TC-PERM-16 | | | | |
| TC-PERM-17 | | | | |
| TC-PERM-18 | | | | |
| TC-PERM-19 | | | | |
| TC-PERM-20 | | | | |
| TC-PERM-21 | | | | |
| TC-PERM-22 | | | | |
| TC-PERM-23 | | | | |

## Summary

- **Totale Test Cases**: ~23 (+ varianti)
- **Pass**:
- **Fail**:
- **Pass Rate**: %

## Note Critiche

⚠️ **SICUREZZA CRITICA**
- Zero fallimenti accettati su permessi
- Qualsiasi bug permessi = severity CRITICAL
- User NON deve MAI poter scrivere
- Tecnico NON deve MAI accedere a gestione utenti
- Admin unico con full access

**Testing Tips**:
- Usare 3 browser diversi (o incognito tabs) per 3 ruoli
- Testare SEMPRE con tutti e 3 i ruoli
- Verificare sia lato API che lato UI (pulsanti nascosti/disabilitati)
