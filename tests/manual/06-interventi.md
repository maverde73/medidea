# Test Piano: Interventi su Attività

## Informazioni Generali

- **Area**: Interventi (History Log per Attività)
- **Ruoli coinvolti**: admin, tecnico
- **Priorità**: 🟡 Core
- **Tempo stimato**: ~25 minuti

## Dati di Test

```json
{
  "data_intervento": "2024-06-15",
  "descrizione_intervento": "Sostituzione componente X",
  "operatore": "Mario Rossi"
}
```

---

## Scenari di Test

### TC-INT-01 - Visualizza Lista Interventi per Attività

**Passi**:
1. GET `/api/attivita/[id]/interventi`
   - **Risultato Atteso**: HTTP 200, array interventi ordinati per data DESC

---

### TC-INT-02 - Crea Intervento con data_intervento

**Passi**:
1. POST `/api/attivita/[id]/interventi`
   ```json
   {
     "data_intervento": "2024-06-15",
     "descrizione_intervento": "Test intervento"
   }
   ```
   - **Risultato Atteso**: HTTP 201, intervento creato

---

### TC-INT-03 - Crea Intervento con Descrizione

**Passi**:
1. POST con descrizione dettagliata
   - **Risultato Atteso**: Descrizione salvata correttamente

---

### TC-INT-04 - Crea Intervento senza Operatore (Default)

**Passi**:
1. POST senza campo `operatore`
   - **Risultato Atteso**:
     - HTTP 201
     - `operatore` = email utente loggato (default automatico)

---

### TC-INT-05 - Crea Intervento con Operatore Personalizzato

**Passi**:
1. POST con `operatore` = "Tecnico Esterno XYZ"
   - **Risultato Atteso**: Operatore personalizzato salvato

---

### TC-INT-06 - Crea Intervento senza data_intervento (ERRORE)

**Passi**:
1. POST senza `data_intervento`
   - **Risultato Atteso**:
     - HTTP 400 Bad Request
     - Error: "data_intervento obbligatoria"

---

### TC-INT-07 - Ordine Cronologico Interventi

**Prerequisiti**:
- Attività con 3+ interventi con date diverse

**Passi**:
1. GET lista interventi
   - **Risultato Atteso**: Ordinati per data DESC (più recente prima)

---

### TC-INT-08 - Cascata Delete: Elimina Attività → Elimina Interventi

**Passi**:
1. Creare attività con 2 interventi
2. DELETE attività
3. Verificare interventi eliminati
   - **Risultato Atteso**: Interventi non più esistono (CASCADE DELETE)

---

### TC-INT-09 - Permessi: Tecnico Può Creare Interventi

**Passi**:
1. Login tecnico
2. POST intervento
   - **Risultato Atteso**: HTTP 201, permesso

---

### TC-INT-10 - Permessi: User NON Può Creare Interventi

**Passi**:
1. Login user
2. POST intervento
   - **Risultato Atteso**: HTTP 403 Forbidden

---

## Execution Log

| Test ID | Data | Tester | Risultato | Note |
|---------|------|--------|-----------|------|
| TC-INT-01 | | | | |
| TC-INT-02 | | | | |
| TC-INT-03 | | | | |
| TC-INT-04 | | | | |
| TC-INT-05 | | | | |
| TC-INT-06 | | | | |
| TC-INT-07 | | | | |
| TC-INT-08 | | | | |
| TC-INT-09 | | | | |
| TC-INT-10 | | | | |

## Summary

- **Totale Test Cases**: 10
- **Pass**:
- **Fail**:
- **Pass Rate**: %
