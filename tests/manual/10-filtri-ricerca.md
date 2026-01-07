# Test Piano: Filtri e Ricerca Avanzata

## Informazioni Generali

- **Area**: Advanced Filters & Search (principalmente su Attività)
- **Ruoli coinvolti**: Tutti (autenticati)
- **Priorità**: 🟢 Accessoria
- **Tempo stimato**: ~45 minuti
- **Prerequisiti**: Database con attività variegate (clienti, stati, date, urgenze diverse)

---

## Filtri Disponibili (API /api/attivita)

| Filtro | Parametro | Tipo | Esempio |
|--------|-----------|------|---------|
| Cliente | id_cliente | number | `id_cliente=1` |
| Stato | stato | enum | `stato=APERTO` |
| Data Apertura Da | data_apertura_da | date | `data_apertura_da=2024-01-01` |
| Data Apertura A | data_apertura_a | date | `data_apertura_a=2024-12-31` |
| Data Chiusura Da | data_chiusura_da | date | |
| Data Chiusura A | data_chiusura_a | date | |
| Modello | modello | string (LIKE) | `modello=ECG` |
| Descrizione | descrizione_richiesta | string (LIKE) | |
| Seriale | seriale | string (LIKE) | |
| Tecnico | tecnico | string (LIKE) | |
| Urgenza | urgenza | enum | `urgenza=ALTA` |
| Paginazione | page, limit | number | `page=1&limit=10` |
| Ordinamento | sort_by, sort_order | string | `sort_by=data_apertura_richiesta&sort_order=DESC` |

---

## Test Cases

### TC-FLT-01 - Filtra per id_cliente

**Passi**:
1. GET `/api/attivita?id_cliente=1`
   - **Risultato Atteso**: Solo attività del cliente 1

---

### TC-FLT-02 - Filtra per stato APERTO

**Passi**:
1. GET `/api/attivita?stato=APERTO`
   - **Risultato Atteso**: Solo attività con stato="APERTO"

---

### TC-FLT-03 - Filtra per stato CHIUSO

**Passi**:
1. GET con `stato=CHIUSO`
   - **Risultato Atteso**: Solo attività chiuse

---

### TC-FLT-04 - Filtra per stato RIAPERTO

**Passi**:
1. GET con `stato=RIAPERTO`
   - **Risultato Atteso**: Solo attività riaperte

---

### TC-FLT-05 - Filtra per data_apertura_da

**Passi**:
1. GET `/api/attivita?data_apertura_da=2024-06-01`
   - **Risultato Atteso**: Solo attività aperte dal 01/06/2024 in poi

---

### TC-FLT-06 - Filtra per data_apertura_a

**Passi**:
1. GET con `data_apertura_a=2024-06-30`
   - **Risultato Atteso**: Solo attività aperte fino al 30/06/2024

---

### TC-FLT-07 - Filtra per Range Date Apertura (da + a)

**Passi**:
1. GET con `data_apertura_da=2024-06-01&data_apertura_a=2024-06-30`
   - **Risultato Atteso**: Attività aperte in giugno 2024

---

### TC-FLT-08 - Filtra per data_chiusura_da

**Passi**:
1. GET con `data_chiusura_da=2024-05-01`
   - **Risultato Atteso**: Attività chiuse dal 01/05/2024

---

### TC-FLT-09 - Filtra per data_chiusura_a

**Passi**:
1. GET con `data_chiusura_a=2024-05-31`
   - **Risultato Atteso**: Attività chiuse fino al 31/05/2024

---

### TC-FLT-10 - Filtra per Modello (LIKE search)

**Passi**:
1. GET con `modello=ECG`
   - **Risultato Atteso**:
     - Attività con modello contenente "ECG" (es: "Monitor ECG-2000")
     - Case insensitive

---

### TC-FLT-11 - Filtra per Descrizione Richiesta (LIKE)

**Passi**:
1. GET con `descrizione_richiesta=manutenzione`
   - **Risultato Atteso**: Attività con "manutenzione" in descrizione

---

### TC-FLT-12 - Filtra per Seriale (LIKE)

**Passi**:
1. GET con `seriale=SN001`
   - **Risultato Atteso**: Attività con apparecchiatura seriale SN001

---

### TC-FLT-13 - Filtra per Tecnico (LIKE)

**Passi**:
1. GET con `tecnico=Mario`
   - **Risultato Atteso**: Attività con tecnico contenente "Mario"

---

### TC-FLT-14 - Filtra per Urgenza

**Passi**:
1. GET con `urgenza=ALTA`
   - **Risultato Atteso**: Solo urgenza ALTA
2. Ripetere con MEDIA, BASSA

---

### TC-FLT-15 - Combina Multipli Filtri

**Passi**:
1. GET con `id_cliente=1&stato=APERTO&urgenza=ALTA`
   - **Risultato Atteso**:
     - Attività cliente 1
     - Stato APERTO
     - Urgenza ALTA
     - Tutti i filtri applicati (AND logic)

---

### TC-FLT-16 - Ordinamento per data_apertura DESC (Default)

**Passi**:
1. GET `/api/attivita` (senza sort params)
   - **Risultato Atteso**:
     - Ordinato per data_apertura_richiesta DESC
     - Attività più recenti prima

---

### TC-FLT-17 - Ordinamento per data_apertura ASC

**Passi**:
1. GET con `sort_by=data_apertura_richiesta&sort_order=ASC`
   - **Risultato Atteso**: Attività più vecchie prime

---

### TC-FLT-18 - Ordinamento per Altri Campi

**Passi**:
1. GET con `sort_by=stato&sort_order=ASC`
   - **Risultato Atteso**: Ordinato alfabeticamente per stato
2. Ripetere con altri campi (cliente, urgenza, ecc.)

---

### TC-FLT-19 - Paginazione: Default (page=1, limit=10)

**Prerequisiti**: Database con 20+ attività

**Passi**:
1. GET `/api/attivita`
   - **Risultato Atteso**:
     - Ritorna max 10 attività
     - Metadata paginazione (total, page, limit)

---

### TC-FLT-20 - Paginazione: page=2

**Passi**:
1. GET con `page=2&limit=10`
   - **Risultato Atteso**: Attività 11-20

---

### TC-FLT-21 - Paginazione: limit Personalizzato

**Passi**:
1. GET con `limit=20`
   - **Risultato Atteso**: Max 20 attività per pagina
2. Ripetere con `limit=50`
   - **Risultato Atteso**: Max 50 attività

---

## Execution Log

| Test ID | Data | Tester | Risultato | Note |
|---------|------|--------|-----------|------|
| TC-FLT-01 | | | | |
| TC-FLT-02 | | | | |
| TC-FLT-03 | | | | |
| TC-FLT-04 | | | | |
| TC-FLT-05 | | | | |
| TC-FLT-06 | | | | |
| TC-FLT-07 | | | | |
| TC-FLT-08 | | | | |
| TC-FLT-09 | | | | |
| TC-FLT-10 | | | | |
| TC-FLT-11 | | | | |
| TC-FLT-12 | | | | |
| TC-FLT-13 | | | | |
| TC-FLT-14 | | | | |
| TC-FLT-15 | | | | |
| TC-FLT-16 | | | | |
| TC-FLT-17 | | | | |
| TC-FLT-18 | | | | |
| TC-FLT-19 | | | | |
| TC-FLT-20 | | | | |
| TC-FLT-21 | | | | |

## Summary

- **Totale Test Cases**: 21
- **Pass**:
- **Fail**:
- **Pass Rate**: %

## Note

- Filtri critici per usabilità con dataset grandi
- LIKE search deve essere case insensitive
- Paginazione essenziale per performance
- Combinazione filtri deve usare AND logic
