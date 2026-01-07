# Test Piano: Dashboard Gerarchica

## Informazioni Generali

- **Area**: Dashboard Homepage (Gerarchia Clienti → Apparecchiature → Attività)
- **Ruoli coinvolti**: Tutti (autenticati)
- **Priorità**: 🟢 Accessoria
- **Tempo stimato**: ~35 minuti
- **Prerequisiti**: Database con clienti, apparecchiature, attività variati

---

## Scenari di Test

### TC-DASH-01 - Visualizza Stats Cards

**Passi**:
1. Navigare a `/` (dashboard)
2. Verificare 3 stats cards:
   - **Totale Clienti** (con apparecchiature)
   - **Totale Apparecchiature**
   - **Totale Attività**
   - **Risultato Atteso**: Numeri corretti, aggiornati

---

### TC-DASH-02 - Verifica Conteggio Clienti con Apparecchiature

**Passi**:
1. Creare scenario test:
   - Cliente A con 2 apparecchiature
   - Cliente B con 1 apparecchiatura
   - Cliente C senza apparecchiature
2. Verificare stats card "Clienti"
   - **Risultato Atteso**: Mostra 2 (solo A e B, C escluso)

---

### TC-DASH-03 - Verifica Totale Apparecchiature

**Passi**:
1. Con scenario sopra
   - **Risultato Atteso**: Totale = 3 apparecchiature

---

### TC-DASH-04 - Verifica Totale Attività

**Passi**:
1. Scenario: 2 attività aperte, 1 chiusa
   - **Risultato Atteso**: Totale = 3

---

### TC-DASH-05 - Lista Clienti Collapsible (Tutto Chiuso Default)

**Passi**:
1. Caricare dashboard con 5+ clienti
   - **Risultato Atteso**:
     - Lista clienti visibile
     - Tutti i clienti CHIUSI di default (performance)
     - Icona chevron-right visibile

---

### TC-DASH-06 - Espandi Singolo Cliente

**Passi**:
1. Click su header cliente (o chevron)
   - **Risultato Atteso**:
     - Cliente espanso
     - Gruppi apparecchiature visibili
     - Icona cambia a chevron-down

---

### TC-DASH-07 - Verifica Gruppi Apparecchiature per Attività

**Prerequisiti**:
- Cliente con 3 apparecchiature:
  - App 1 → Attività A
  - App 2 → Attività A (stessa)
  - App 3 → Nessuna attività

**Passi**:
1. Espandere cliente
   - **Risultato Atteso**:
     - **2 gruppi**:
       1. "Attività #A" con 2 apparecchiature (App 1, App 2)
       2. "Senza Attività" con 1 apparecchiatura (App 3)

---

### TC-DASH-08 - Verifica Gruppo "Senza Attività"

**Passi**:
1. Verificare apparecchiature orfane
   - **Risultato Atteso**:
     - Gruppo "Senza Attività" visibile
     - Icona diversa (Package invece di Activity)
     - Sfondo grigio

---

### TC-DASH-09 - Verifica Colore Sfondo per Stato

**Passi**:
1. Scenario:
   - Attività APERTO
   - Attività CHIUSO
   - Attività RIAPERTO
2. Verificare colori:
   - **APERTO**: sfondo verde chiaro (bg-green-50)
   - **RIAPERTO**: sfondo verde chiaro
   - **CHIUSO**: sfondo grigio
   - **Senza Attività**: sfondo grigio chiaro

---

### TC-DASH-10 - Click Nome Cliente → Redirect

**Passi**:
1. Click su nome cliente
   - **Risultato Atteso**: Redirect a `/clienti/[id]`

---

### TC-DASH-11 - Click Apparecchiatura → Redirect

**Passi**:
1. Espandere cliente e gruppo
2. Click su apparecchiatura
   - **Risultato Atteso**: Redirect a `/apparecchiature/[id]`

---

### TC-DASH-12 - Click Attività → Redirect

**Passi**:
1. Click su header "Attività #123"
   - **Risultato Atteso**: Redirect a `/attivita/123`

---

### TC-DASH-13 - Ricerca Cliente per Nome

**Passi**:
1. Digitare "Ospedale" nel search box
   - **Risultato Atteso**:
     - Lista filtrata mostra solo clienti con "Ospedale" nel nome
     - Altri clienti nascosti (filtro client-side)

---

### TC-DASH-14 - Ricerca Cliente Inesistente (Empty State)

**Passi**:
1. Digitare "NonEsiste123"
   - **Risultato Atteso**:
     - Messaggio "Nessun cliente trovato con i criteri di ricerca"
     - Lista vuota

---

### TC-DASH-15 - Verifica Raggruppamento Multiplo

**Scenario Complesso**:
- Cliente "Ospedale"
  - App 1 (ECG SN001) → Attività 10
  - App 2 (ECG SN002) → Attività 10 (stessa)
  - App 3 (Vent SN010) → Attività 20
  - App 4 (Def SN050) → Nessuna attività

**Passi**:
1. Espandere cliente
   - **Risultato Atteso**: **3 gruppi**:
     1. "Attività #10" → App 1, App 2
     2. "Attività #20" → App 3
     3. "Senza Attività" → App 4

---

### TC-DASH-16 - Performance con Molti Clienti (50+)

**Prerequisiti**: Database con 50+ clienti

**Passi**:
1. Caricare dashboard
   - **Risultato Atteso**:
     - Caricamento veloce (< 2s)
     - Tutti clienti chiusi di default
     - Nessun lag nell'espansione singolo cliente

---

## Execution Log

| Test ID | Data | Tester | Risultato | Note |
|---------|------|--------|-----------|------|
| TC-DASH-01 | | | | |
| TC-DASH-02 | | | | |
| TC-DASH-03 | | | | |
| TC-DASH-04 | | | | |
| TC-DASH-05 | | | | |
| TC-DASH-06 | | | | |
| TC-DASH-07 | | | | |
| TC-DASH-08 | | | | |
| TC-DASH-09 | | | | |
| TC-DASH-10 | | | | |
| TC-DASH-11 | | | | |
| TC-DASH-12 | | | | |
| TC-DASH-13 | | | | |
| TC-DASH-14 | | | | |
| TC-DASH-15 | | | | |
| TC-DASH-16 | | | | |

## Summary

- **Totale Test Cases**: 16
- **Pass**:
- **Fail**:
- **Pass Rate**: %

## Note

- Dashboard è homepage principale: UX critica
- Raggruppamento corretto essenziale per usabilità
- Performance importante con dataset grandi
