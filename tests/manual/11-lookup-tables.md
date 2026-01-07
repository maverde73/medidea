# Test Piano: Tabelle Lookup (Configurazione)

## Informazioni Generali

- **Area**: Lookup/Configuration Tables
- **Ruoli coinvolti**: admin, tecnico (da verificare per tabella)
- **Priorità**: 🟢 Accessoria
- **Tempo stimato**: ~30 minuti

## Tabelle da Testare

1. **Modelli Apparecchiature** (`/api/modelli`)
2. **Reparti** (`/api/reparti`)
3. **Modalità Apertura** (`/api/modalita-apertura`)
4. **Ricambi** (`/api/ricambi`)
5. Altri (tipi intervento, tipi apparecchiatura, ecc.)

---

## Template Test CRUD per Ogni Tabella

### Modelli Apparecchiature

#### TC-MOD-01 - Visualizza Lista Modelli

**Passi**:
1. GET `/api/modelli`
   - **Risultato Atteso**: HTTP 200, array modelli

---

#### TC-MOD-02 - Crea Nuovo Modello

**Dati Test**:
```json
{
  "nome": "Defibrillatore XYZ-500",
  "descrizione": "Defibrillatore automatico esterno"
}
```

**Passi**:
1. POST `/api/modelli`
   - **Risultato Atteso**: HTTP 201, modello creato

---

#### TC-MOD-03 - Crea Modello con Nome Duplicato (ERRORE)

**Passi**:
1. POST con nome esistente
   - **Risultato Atteso**: HTTP 400, UNIQUE constraint error

---

#### TC-MOD-04 - Modifica Modello

**Passi**:
1. PUT `/api/modelli/[id]`
   - **Risultato Atteso**: HTTP 200, modello aggiornato

---

#### TC-MOD-05 - Elimina Modello senza Apparecchiature

**Passi**:
1. DELETE modello non usato
   - **Risultato Atteso**: HTTP 200, eliminazione OK

---

#### TC-MOD-06 - Elimina Modello con Apparecchiature (FK Constraint)

**Passi**:
1. DELETE modello in uso
   - **Risultato Atteso**:
     - HTTP 400 o 409
     - Error: FK constraint (protezione eliminazione)

---

### Reparti

#### TC-REP-01 - Visualizza Lista Reparti

**Passi**:
1. GET `/api/reparti`
   - **Risultato Atteso**: HTTP 200

---

#### TC-REP-02 - Crea Nuovo Reparto

**Dati Test**:
```json
{
  "nome": "Cardiologia",
  "descrizione": "Reparto cardiologia"
}
```

**Passi**:
1. POST `/api/reparti`
   - **Risultato Atteso**: HTTP 201

---

#### TC-REP-03 - CRUD Completo Reparto

**Passi**:
1. POST (crea)
2. GET (leggi)
3. PUT (modifica)
4. DELETE (elimina)
   - **Risultato Atteso**: Tutti i passi OK

---

### Modalità Apertura

#### TC-MOA-01 - Visualizza Lista

**Passi**:
1. GET `/api/modalita-apertura`
   - **Risultato Atteso**: HTTP 200

---

#### TC-MOA-02 - Crea Nuova Modalità

**Dati Test**:
```json
{
  "descrizione": "Email automatica"
}
```

**Passi**:
1. POST `/api/modalita-apertura`
   - **Risultato Atteso**: HTTP 201

---

#### TC-MOA-03 - CRUD Completo

**Passi**:
1-4. [Ripetere pattern CRUD come TC-REP-03]

---

### Ricambi

#### TC-RIC-01 - Visualizza Lista Ricambi

**Passi**:
1. GET `/api/ricambi`
   - **Risultato Atteso**: HTTP 200

---

#### TC-RIC-02 - Crea Nuovo Ricambio

**Passi**:
1. POST con dati ricambio
   - **Risultato Atteso**: HTTP 201

---

#### TC-RIC-03 - CRUD Completo

**Passi**:
1-4. [Pattern CRUD standard]

---

## Execution Log

| Test ID | Data | Tester | Risultato | Note |
|---------|------|--------|-----------|------|
| TC-MOD-01 | | | | |
| TC-MOD-02 | | | | |
| TC-MOD-03 | | | | |
| TC-MOD-04 | | | | |
| TC-MOD-05 | | | | |
| TC-MOD-06 | | | | |
| TC-REP-01 | | | | |
| TC-REP-02 | | | | |
| TC-REP-03 | | | | |
| TC-MOA-01 | | | | |
| TC-MOA-02 | | | | |
| TC-MOA-03 | | | | |
| TC-RIC-01 | | | | |
| TC-RIC-02 | | | | |
| TC-RIC-03 | | | | |

## Summary

- **Totale Test Cases**: ~15-20 (dipende da tabelle)
- **Pass**:
- **Fail**:
- **Pass Rate**: %

## Note

- Tabelle lookup sono fondamentali per configurazione sistema
- UNIQUE constraints importanti per integrità dati
- FK constraints proteggono da eliminazioni accidentali
