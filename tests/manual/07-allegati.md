# Test Piano: Gestione Allegati (File Upload/Download)

## Informazioni Generali

- **Area**: File Attachments (R2 Storage)
- **Ruoli coinvolti**: admin, tecnico, user
- **Priorità**: 🟡 Core
- **Tempo stimato**: ~40 minuti
- **File necessari**: test-valid.pdf (2MB), test-large.pdf (12MB), test-invalid.docx, test-invalid.jpg

## Dati di Test

### Tipi Riferimento
- `attivita`: allegati per attività
- `apparecchiatura`: allegati per apparecchiature
- `intervento`: allegati per interventi

---

## Test Cases Upload

### TC-ALL-01 - Upload PDF Valido per Attività

**Passi**:
1. POST `/api/allegati/upload`
   - Form Data:
     - `file`: test-valid.pdf (2MB)
     - `tipo_riferimento`: "attivita"
     - `id_riferimento`: [id_attivita]
     - `note`: "Preventivo"
   - **Risultato Atteso**:
     - HTTP 201
     - Response: allegato creato con chiave R2, metadata salvato

---

### TC-ALL-02 - Upload PDF per Apparecchiatura

**Passi**:
1. POST con `tipo_riferimento` = "apparecchiatura"
   - **Risultato Atteso**: HTTP 201, allegato associato ad apparecchiatura

---

### TC-ALL-03 - Upload PDF per Intervento

**Passi**:
1. POST con `tipo_riferimento` = "intervento"
   - **Risultato Atteso**: HTTP 201

---

### TC-ALL-04 - Upload PDF con Note/Categoria

**Passi**:
1. POST con `note` = "Documentazione tecnica"
   - **Risultato Atteso**: Note salvate nel campo note

---

### TC-ALL-05 - Upload File NON-PDF (ERRORE)

**Passi**:
1. POST con test-invalid.docx
   - **Risultato Atteso**:
     - HTTP 400 Bad Request
     - Error: "Solo file PDF permessi"

2. Ripetere con test-invalid.jpg
   - **Risultato Atteso**: HTTP 400

---

### TC-ALL-06 - Upload File > 10MB (ERRORE)

**Passi**:
1. POST con test-large.pdf (12MB)
   - **Risultato Atteso**:
     - HTTP 400 o 413 Payload Too Large
     - Error: "File troppo grande (max 10MB)"

---

### TC-ALL-07 - Upload senza tipo_riferimento (ERRORE)

**Passi**:
1. POST senza campo `tipo_riferimento`
   - **Risultato Atteso**: HTTP 400, error validation

---

### TC-ALL-08 - Upload con id_riferimento Inesistente

**Passi**:
1. POST con `id_riferimento` = 99999 (non esiste)
   - **Risultato Atteso**:
     - Verificare comportamento: potrebbe essere HTTP 400 o permesso (orphan allegato)
     - **Preferibilmente**: HTTP 400 con validazione FK

---

## Test Cases Download

### TC-ALL-09 - Visualizza Lista Allegati per Attività

**Passi**:
1. GET `/api/allegati?tipo_riferimento=attivita&id_riferimento=[id]`
   - **Risultato Atteso**:
     - HTTP 200
     - Array allegati con metadata: nome_file, dimensione, data_caricamento, note

---

### TC-ALL-10 - Filtra Allegati per Categoria (note)

**Passi**:
1. GET con `note=Preventivo`
   - **Risultato Atteso**: Solo allegati con note="Preventivo"

---

### TC-ALL-11 - Download File PDF

**Passi**:
1. GET `/api/download/[chiave_r2]`
   - **Risultato Atteso**:
     - HTTP 200
     - Content-Type: application/pdf
     - File scaricato correttamente
     - Nome file corretto

---

### TC-ALL-12 - Verifica Metadata Salvato

**Passi**:
1. Dopo upload, GET dettagli allegato
   - **Risultato Atteso**: Metadata include:
     - nome_file_originale
     - dimensione_bytes (corretto)
     - mime_type = "application/pdf"
     - chiave_r2 (unique)

---

## Test Cases Delete

### TC-ALL-13 - Admin: Elimina Allegato

**Passi**:
1. Login admin
2. DELETE `/api/allegati/[id]`
   - **Risultato Atteso**:
     - HTTP 200
     - Allegato eliminato da D1
     - File eliminato da R2

---

### TC-ALL-14 - Tecnico: Elimina Allegato (ERRORE 403)

**Passi**:
1. Login tecnico
2. DELETE allegato
   - **Risultato Atteso**: HTTP 403 Forbidden (solo admin può eliminare)

---

### TC-ALL-15 - User: Elimina Allegato (ERRORE 403)

**Passi**:
1. Login user
2. DELETE allegato
   - **Risultato Atteso**: HTTP 403

---

## Test Cases Permessi

### TC-ALL-16 - Admin Può Uploadare

**Passi**:
1. Login admin
2. POST upload
   - **Risultato Atteso**: HTTP 201, permesso

---

### TC-ALL-17 - Tecnico Può Uploadare

**Passi**:
1. Login tecnico
2. POST upload
   - **Risultato Atteso**: HTTP 201, permesso

---

### TC-ALL-18 - User NON Può Uploadare (ERRORE 403)

**Passi**:
1. Login user
2. POST upload
   - **Risultato Atteso**: HTTP 403 Forbidden

---

## Execution Log

| Test ID | Data | Tester | Risultato | Note |
|---------|------|--------|-----------|------|
| TC-ALL-01 | | | | |
| TC-ALL-02 | | | | |
| TC-ALL-03 | | | | |
| TC-ALL-04 | | | | |
| TC-ALL-05 | | | | |
| TC-ALL-06 | | | | |
| TC-ALL-07 | | | | |
| TC-ALL-08 | | | | |
| TC-ALL-09 | | | | |
| TC-ALL-10 | | | | |
| TC-ALL-11 | | | | |
| TC-ALL-12 | | | | |
| TC-ALL-13 | | | | |
| TC-ALL-14 | | | | |
| TC-ALL-15 | | | | |
| TC-ALL-16 | | | | |
| TC-ALL-17 | | | | |
| TC-ALL-18 | | | | |

## Summary

- **Totale Test Cases**: 18
- **Pass**:
- **Fail**:
- **Pass Rate**: %

## Note

- Testare con file PDF reali, non dummy
- Verificare che file venga effettivamente salvato su R2 e sia scaricabile
- Importante testare limiti dimensione e tipo file (sicurezza)
