# Test Piano: Gestione Apparecchiature

## Informazioni Generali

- **Area**: Apparecchiature CRUD
- **Ruoli coinvolti**: admin, tecnico, user
- **Priorità**: 🟡 Core
- **Tempo stimato**: ~35 minuti

## Dati di Test

### Modelli Apparecchiature
| ID | Nome | Descrizione |
|----|------|-------------|
| 1 | Monitor ECG-2000 | Monitor cardiaco professionale |
| 2 | Ventilatore MED-500 | Ventilatore polmonare |

### Apparecchiature Test
| Cliente | Modello | Seriale | Data Test Funz. | Data Test Elett. |
|---------|---------|---------|-----------------|------------------|
| Ospedale SR | ECG-2000 | SN001 | 2024-01-15 | 2024-01-15 |
| Clinica Roma | Ventilatore | SN010 | 2024-03-01 | 2024-03-01 |

---

## Scenari di Test

### TC-APP-01 - Visualizza Lista Apparecchiature

**Passi**:
1. GET `/api/apparecchiature`
   - **Risultato Atteso**: HTTP 200, array apparecchiature con join modelli e clienti

**Criteri Pass/Fail**:
- ✅ Pass: Lista visibile, dati corretti con modello e cliente
- ❌ Fail: Errore, dati mancanti

---

### TC-APP-02 - Filtra Apparecchiature per Cliente

**Passi**:
1. GET `/api/apparecchiature?id_cliente=1`
   - **Risultato Atteso**: Solo apparecchiature del cliente 1

**Criteri Pass/Fail**:
- ✅ Pass: Filtro funziona correttamente
- ❌ Fail: Filtro non funziona, dati errati

---

### TC-APP-03 - Filtra per Modello

**Passi**:
1. GET `/api/apparecchiature?id_modello=1`
   - **Risultato Atteso**: Solo apparecchiature ECG-2000

---

### TC-APP-04 - Crea Apparecchiatura (Tutti Campi)

**Dati Test**:
```json
{
  "id_cliente": 1,
  "id_modello": 1,
  "seriale": "SN999",
  "data_test_funzionali": "2024-06-01",
  "data_test_elettrici": "2024-06-01",
  "note": "Apparecchiatura test completa"
}
```

**Passi**:
1. POST `/api/apparecchiature`
   - **Risultato Atteso**: HTTP 201, apparecchiatura creata con ID

**Criteri Pass/Fail**:
- ✅ Pass: Creazione successo, tutti i campi salvati
- ❌ Fail: Errore, dati non salvati

---

### TC-APP-05 - Crea Apparecchiatura (Solo Campi Obbligatori)

**Dati Test**:
```json
{
  "id_cliente": 1,
  "id_modello": 1
}
```

**Passi**:
1. POST con campi obbligatori
   - **Risultato Atteso**: HTTP 201, campi opzionali = null

**Criteri Pass/Fail**:
- ✅ Pass: Creazione OK con campi opzionali null
- ❌ Fail: Errore su campi opzionali

---

### TC-APP-06 - Crea Apparecchiatura con Seriale Duplicato

**Prerequisiti**:
- Apparecchiatura esistente: id_cliente=1, id_modello=1, seriale="SN001"

**Passi**:
1. POST con stessi valori
   - **Risultato Atteso**:
     - **Comportamento da verificare**: potrebbe essere permesso (stesso modello, stesso cliente, stessa seriale = duplicato?)
     - O HTTP 400 se constraint UNIQUE

**Criteri Pass/Fail**:
- ✅ Pass: Comportamento consistente con business logic
- ❌ Fail: Bug o comportamento inatteso

**Note**: Verificare se duplicati sono permessi o no per business.

---

### TC-APP-07 - Visualizza Dettagli Apparecchiatura

**Passi**:
1. GET `/api/apparecchiature/[id]`
   - **Risultato Atteso**:
     - HTTP 200
     - Dettagli completi: cliente, modello, seriale, date test, note
     - Lista attività associate (se esistono)

---

### TC-APP-08 - Modifica Date Test

**Passi**:
1. PUT `/api/apparecchiature/[id]`
   ```json
   {
     "data_test_funzionali": "2024-07-01",
     "data_test_elettrici": "2024-07-01"
   }
   ```
   - **Risultato Atteso**: HTTP 200, date aggiornate

---

### TC-APP-09 - Modifica Note Apparecchiatura

**Passi**:
1. PUT con `note` = "Nuove note aggiunte"
   - **Risultato Atteso**: Note salvate correttamente

---

### TC-APP-10 - Elimina Apparecchiatura senza Attività

**Passi**:
1. DELETE `/api/apparecchiature/[id]` (apparecchiatura non usata)
   - **Risultato Atteso**: HTTP 200, eliminazione OK

---

### TC-APP-11 - Elimina Apparecchiatura con Attività

**Passi**:
1. DELETE apparecchiatura con attività associate
   - **Risultato Atteso**:
     - Verifica comportamento: FK constraint o CASCADE delete
     - Se RESTRICT: HTTP 400, eliminazione bloccata
     - Se CASCADE: HTTP 200, attività eliminate o id_apparecchiatura = null

**Note**: Verificare schema database per comportamento FK.

---

### TC-APP-12 - Permessi: Tecnico Può Gestire Apparecchiature

**Passi**:
1. Login tecnico
2. POST `/api/apparecchiature` con dati validi
   - **Risultato Atteso**: HTTP 201, creazione permessa
3. PUT `/api/apparecchiature/[id]`
   - **Risultato Atteso**: HTTP 200, modifica permessa

---

### TC-APP-13 - Permessi: User NON Può Creare/Modificare

**Passi**:
1. Login user
2. POST `/api/apparecchiature`
   - **Risultato Atteso**: HTTP 403 Forbidden
3. PUT `/api/apparecchiature/[id]`
   - **Risultato Atteso**: HTTP 403

---

## Execution Log

| Test ID | Data | Tester | Risultato | Note |
|---------|------|--------|-----------|------|
| TC-APP-01 | | | | |
| TC-APP-02 | | | | |
| TC-APP-03 | | | | |
| TC-APP-04 | | | | |
| TC-APP-05 | | | | |
| TC-APP-06 | | | | |
| TC-APP-07 | | | | |
| TC-APP-08 | | | | |
| TC-APP-09 | | | | |
| TC-APP-10 | | | | |
| TC-APP-11 | | | | |
| TC-APP-12 | | | | |
| TC-APP-13 | | | | |

## Summary

- **Totale Test Cases**: 13
- **Pass**:
- **Fail**:
- **Pass Rate**: %
