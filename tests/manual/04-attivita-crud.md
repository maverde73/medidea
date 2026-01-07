# Test Piano: Attività - CRUD Operations

## Informazioni Generali

- **Area**: Attività CRUD (escluso state machine - vedi 05-attivita-stati.md)
- **Ruoli coinvolti**: admin, tecnico, user
- **Priorità**: 🟡 Core
- **Tempo stimato**: ~40 minuti

## Dati di Test

### Attività Base
```json
{
  "id_cliente": 1,
  "id_modello": 1,
  "seriale": "SN001",
  "descrizione_richiesta": "Manutenzione ordinaria monitor ECG",
  "urgenza": "MEDIA"
}
```

---

## Scenari di Test

### TC-ATT-01 - Visualizza Lista Attività (Tutte)

**Passi**:
1. GET `/api/attivita`
   - **Risultato Atteso**:
     - HTTP 200
     - Array attività con join: cliente, modello, tecnico
     - Default: limit=10, page=1

---

### TC-ATT-02 - Crea Attività con Apparecchiatura Esistente

**Dati Test**:
```json
{
  "id_cliente": 1,
  "id_apparecchiatura": 1,
  "descrizione_richiesta": "Riparazione schermo",
  "urgenza": "ALTA"
}
```

**Passi**:
1. POST `/api/attivita`
   - **Risultato Atteso**:
     - HTTP 201
     - Attività creata con id_apparecchiatura = 1
     - stato = "APERTO"

---

### TC-ATT-03 - Crea Attività senza Apparecchiatura

**Dati Test**:
```json
{
  "id_cliente": 1,
  "descrizione_richiesta": "Richiesta generica",
  "urgenza": "BASSA"
}
```

**Passi**:
1. POST senza id_apparecchiatura
   - **Risultato Atteso**:
     - HTTP 201
     - id_apparecchiatura = null
     - stato = "APERTO"

---

### TC-ATT-04 - Crea Attività con Auto-Create Apparecchiatura

**Dati Test**:
```json
{
  "id_cliente": 1,
  "id_modello": 1,
  "seriale": "SN_NEW_AUTO",
  "descrizione_richiesta": "Test auto-create"
}
```

**Passi**:
1. POST con id_modello e seriale (no id_apparecchiatura)
   - **Risultato Atteso**:
     - HTTP 201
     - Sistema crea automaticamente apparecchiatura se non esiste
     - Attività linkato a nuova apparecchiatura

---

### TC-ATT-05 - Verifica Auto-Create Apparecchiatura (Non Duplica)

**Prerequisiti**:
- Apparecchiatura esistente: cliente=1, modello=1, seriale="SN001"

**Passi**:
1. POST attività con stesso cliente, modello, seriale
   - **Risultato Atteso**:
     - Sistema trova apparecchiatura esistente
     - NON crea duplicato
     - Attività linkato a apparecchiatura esistente

---

### TC-ATT-06 - Crea Attività con Tutti i Campi Opzionali

**Dati Test**: Compilare tutti i campi disponibili (preventivo, accettazione, reparto, tecnico, ecc.)

**Passi**:
1. POST con dati completi
   - **Risultato Atteso**: HTTP 201, tutti i campi salvati

---

### TC-ATT-07 - Visualizza Dettagli Attività con Join

**Passi**:
1. GET `/api/attivita/[id]`
   - **Risultato Atteso**:
     - HTTP 200
     - Dati attività + cliente + modello + tecnico (join)
     - Lista interventi
     - Lista allegati

---

### TC-ATT-08 - Modifica descrizione_richiesta

**Passi**:
1. PUT `/api/attivita/[id]`
   ```json
   {
     "descrizione_richiesta": "Descrizione aggiornata"
   }
   ```
   - **Risultato Atteso**: HTTP 200, descrizione salvata

---

### TC-ATT-09 - Modifica Urgenza

**Passi**:
1. PUT con `urgenza` = "ALTA" / "MEDIA" / "BASSA"
   - **Risultato Atteso**: Urgenza aggiornata

---

### TC-ATT-10 - Modifica Dati Preventivo

**Passi**:
1. PUT con numero_preventivo e data_preventivo
   - **Risultato Atteso**: Campi salvati

---

### TC-ATT-11 - Modifica Tecnico Assegnato

**Passi**:
1. PUT con `id_tecnico` = [id_tecnico_valido]
   - **Risultato Atteso**: Tecnico assegnato correttamente

---

### TC-ATT-12 - Elimina Attività (Verifica Cascata)

**Passi**:
1. Creare attività con:
   - Intervento
   - Allegato
2. DELETE `/api/attivita/[id]`
   - **Risultato Atteso**:
     - HTTP 200
     - Attività eliminata
     - **Interventi eliminati** (CASCADE)
     - **Allegati eliminati o id_riferimento invalidato** (verificare)

---

### TC-ATT-13 - Permessi: Tecnico Può Creare Attività

**Passi**:
1. Login tecnico
2. POST `/api/attivita`
   - **Risultato Atteso**: HTTP 201, creazione permessa

---

### TC-ATT-14 - Permessi: User NON Può Creare Attività

**Passi**:
1. Login user
2. POST `/api/attivita`
   - **Risultato Atteso**: HTTP 403 Forbidden

---

## Execution Log

| Test ID | Data | Tester | Risultato | Note |
|---------|------|--------|-----------|------|
| TC-ATT-01 | | | | |
| TC-ATT-02 | | | | |
| TC-ATT-03 | | | | |
| TC-ATT-04 | | | | |
| TC-ATT-05 | | | | |
| TC-ATT-06 | | | | |
| TC-ATT-07 | | | | |
| TC-ATT-08 | | | | |
| TC-ATT-09 | | | | |
| TC-ATT-10 | | | | |
| TC-ATT-11 | | | | |
| TC-ATT-12 | | | | |
| TC-ATT-13 | | | | |
| TC-ATT-14 | | | | |

## Summary

- **Totale Test Cases**: 14
- **Pass**:
- **Fail**:
- **Pass Rate**: %

## Note

- Auto-create apparecchiatura è feature importante: testare bene duplicati
- Cascata delete interventi critico: verificare comportamento
