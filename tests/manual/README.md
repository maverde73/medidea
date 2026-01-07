# Piani di Test Manuali - Medidea

## Panoramica

Questa directory contiene piani di test manuali dettagliati per l'applicazione **Medidea** - sistema di gestione richieste di servizio e manutenzione apparecchiature medicali.

I piani sono destinati a **tester umani** per verificare sistematicamente tutte le funzionalità dell'applicazione prima del rilascio in produzione.

## Struttura dei Test

| File | Area Funzionale | Test Cases | Priorità |
|------|-----------------|------------|----------|
| [01-autenticazione.md](./01-autenticazione.md) | Login, logout, gestione sessione | 10 | 🔴 Critica |
| [02-clienti.md](./02-clienti.md) | CRUD clienti | 13 | 🟡 Core |
| [03-apparecchiature.md](./03-apparecchiature.md) | CRUD apparecchiature | 13 | 🟡 Core |
| [04-attivita-crud.md](./04-attivita-crud.md) | CRUD attività base | 14 | 🟡 Core |
| [05-attivita-stati.md](./05-attivita-stati.md) | State machine e transizioni | 16 | 🔴 Critica |
| [06-interventi.md](./06-interventi.md) | Interventi su attività | 10 | 🟡 Core |
| [07-allegati.md](./07-allegati.md) | Upload/download/delete file | 18 | 🟡 Core |
| [08-utenti.md](./08-utenti.md) | Gestione utenti (admin only) | 14 | 🟢 Accessoria |
| [09-dashboard.md](./09-dashboard.md) | Dashboard gerarchica | 16 | 🟢 Accessoria |
| [10-filtri-ricerca.md](./10-filtri-ricerca.md) | Filtri avanzati e ricerca | 21 | 🟢 Accessoria |
| [11-lookup-tables.md](./11-lookup-tables.md) | Gestione tabelle configurazione | vari | 🟢 Accessoria |
| [12-permessi-ruoli.md](./12-permessi-ruoli.md) | Test ACL e autorizzazioni | ~60 | 🔴 Critica |
| [99-edge-cases.md](./99-edge-cases.md) | Edge cases e scenari limite | 20 | ⚪ Edge |

**Totale**: ~200+ test cases

## Setup Ambiente di Test

### Prerequisiti

1. **Database Seeded**:
   ```bash
   # Database locale con dati di test
   wrangler d1 execute medidea-db-dev --local --file=./db/seed_v3.sql
   ```

2. **Applicazione in Esecuzione**:
   ```bash
   npm run dev
   # Apri browser: http://localhost:3000
   ```

3. **Browser Consigliato**: Chrome/Edge (per DevTools completi)

4. **File di Test**: Prepara i file PDF per test upload (vedi sezione Dati di Test)

### Dati di Test Standard

#### Utenti

| Email | Password | Ruolo | Nome | Cognome |
|-------|----------|-------|------|---------|
| admin@medidea.local | admin123 | admin | Admin | Sistema |
| tecnico@medidea.local | tecnico123 | tecnico | Mario | Rossi |
| user@medidea.local | user123 | user | Luigi | Bianchi |

**Note**: L'utente admin esiste sempre in dev mode. Gli altri utenti possono essere creati tramite l'interfaccia admin.

#### Clienti di Test

| Nome | Indirizzo | Contatti |
|------|-----------|----------|
| Ospedale San Raffaele | Via Olgettina 60, Milano | 02-1234567 |
| Clinica Privata Roma | Via Nazionale 10, Roma | 06-7654321 |
| ASL Torino | Corso Regina 123, Torino | 011-9876543 |

#### Modelli Apparecchiature

| Nome | Descrizione |
|------|-------------|
| Monitor ECG-2000 | Monitor cardiaco professionale |
| Ventilatore MED-500 | Ventilatore polmonare |
| Defibrillatore DEF-X | Defibrillatore automatico |

#### File di Test per Upload

Prepara questi file nella directory `tests/manual/test-files/`:

| Nome File | Tipo | Dimensione | Uso |
|-----------|------|-----------|-----|
| test-valid.pdf | PDF | 2 MB | Upload valido |
| test-large.pdf | PDF | 12 MB | Test limite dimensione (>10MB) |
| test-invalid.docx | DOCX | 1 MB | Tipo file non permesso |
| test-invalid.jpg | JPG | 500 KB | Tipo file non permesso |

Puoi creare file dummy con:
```bash
# PDF valido 2MB
dd if=/dev/zero of=test-valid.pdf bs=1M count=2

# PDF grande 12MB
dd if=/dev/zero of=test-large.pdf bs=1M count=12

# Altri file
touch test-invalid.docx test-invalid.jpg
```

## Ordine di Esecuzione Consigliato

### Fase 1: Test Critici (Priorità 🔴)
Eseguire SEMPRE prima del rilascio:

1. **01-autenticazione.md** - Verifica accesso e sicurezza base
2. **05-attivita-stati.md** - State machine critico per business logic
3. **12-permessi-ruoli.md** - Sicurezza e controllo accessi

**Criterio di pass**: 100% dei test PASS, zero errori critici

### Fase 2: Test Core (Priorità 🟡)
Funzionalità principali dell'applicazione:

4. **02-clienti.md** - CRUD clienti
5. **03-apparecchiature.md** - CRUD apparecchiature
6. **04-attivita-crud.md** - CRUD attività
7. **06-interventi.md** - Gestione interventi
8. **07-allegati.md** - Upload/download file

**Criterio di pass**: >= 95% test PASS

### Fase 3: Test Accessori (Priorità 🟢)
Funzionalità UI e gestione:

9. **09-dashboard.md** - Dashboard gerarchica
10. **10-filtri-ricerca.md** - Filtri e ricerca avanzata
11. **08-utenti.md** - Gestione utenti (admin)
12. **11-lookup-tables.md** - Tabelle configurazione

**Criterio di pass**: >= 90% test PASS

### Fase 4: Edge Cases (Priorità ⚪)
Scenari limite e corner cases:

13. **99-edge-cases.md** - Edge cases vari

**Criterio di pass**: Nessun crash o errore critico

## Convenzioni

### Nomenclatura Test Cases

Ogni test case ha un ID univoco nel formato:

```
TC-[AREA]-[NUM]
```

**Area Codes**:
- `AUTH`: Autenticazione
- `CLI`: Clienti
- `APP`: Apparecchiature
- `ATT`: Attività CRUD
- `STA`: Stati/Transizioni
- `INT`: Interventi
- `ALL`: Allegati
- `USR`: Utenti
- `DASH`: Dashboard
- `FLT`: Filtri e ricerca
- `MOD`: Modelli apparecchiature
- `REP`: Reparti
- `PERM`: Permessi
- `EDGE`: Edge cases

**Esempi**:
- `TC-AUTH-01`: Primo test di autenticazione
- `TC-STA-04`: Quarto test sugli stati delle attività
- `TC-PERM-25`: Test permessi #25

### Struttura Test Case

Ogni test case include:

1. **Obiettivo**: Cosa stiamo testando
2. **Prerequisiti**: Condizioni iniziali richieste
3. **Dati di Test**: Valori specifici da usare (in tabelle)
4. **Passi**: Sequenza dettagliata Azione → Risultato Atteso
5. **Risultato Atteso Finale**: Stato finale del sistema
6. **Criteri di Pass/Fail**: Condizioni chiare per successo/fallimento
7. **Note**: Informazioni aggiuntive, screenshot attesi, riferimenti

### Risultati Test

Usa questi simboli per registrare i risultati:

- ✅ **Pass**: Test superato, comportamento conforme
- ❌ **Fail**: Test fallito, comportamento non conforme
- ⚠️ **Blocked**: Test bloccato da bug o dipendenze
- ⏭️ **Skipped**: Test saltato (motivare)
- 🔄 **Retest**: Da ritestare dopo fix

## Tracking Esecuzione

### Template Execution Log

Ogni piano include una sezione "Execution Log" alla fine del file:

```markdown
## Execution Log

| Test ID | Data | Tester | Risultato | Note |
|---------|------|--------|-----------|------|
| TC-XXX-01 | 2024-06-15 | Mario | ✅ Pass | - |
| TC-XXX-02 | 2024-06-15 | Mario | ❌ Fail | Bug #123: descrizione |
| TC-XXX-03 | 2024-06-15 | Mario | ⚠️ Blocked | Attesa fix bug #123 |
```

### Report Finali

Al termine dell'esecuzione, genera report in `tests/manual/reports/`:

1. **test-execution-summary-YYYY-MM-DD.md**: Riepilogo complessivo
2. **bugs-found-YYYY-MM-DD.md**: Lista bug trovati con severity

**Template Summary Report**:
```markdown
# Test Execution Summary - [Data]

## Statistiche Globali
- **Test Eseguiti**: X/200
- **Pass Rate**: Y%
- **Bug Trovati**: Z (X critical, Y high, Z medium, W low)

## Per Area
| Piano | Test Cases | Pass | Fail | Blocked | Pass Rate |
|-------|-----------|------|------|---------|-----------|
| ...   | ...       | ...  | ...  | ...     | ...       |

## Bug Critici
[Lista bug con severity Critical/High che bloccano il rilascio]

## Raccomandazioni
[Go/No-Go per rilascio, azioni richieste]
```

## Metriche di Qualità Target

| Metrica | Target | Descrizione |
|---------|--------|-------------|
| **Copertura Funzionale** | 100% | Tutte le funzionalità CRUD coperte |
| **Pass Rate (Critici)** | 100% | Zero fallimenti in test priorità 🔴 |
| **Pass Rate (Core)** | >= 95% | Max 5% fallimenti in test priorità 🟡 |
| **Pass Rate (Globale)** | >= 90% | Tutti i test inclusi |
| **Bug Critical** | 0 | Nessun bug che blocca funzionalità core |
| **Bug High** | < 3 | Max 2 bug che impattano usabilità |

### Bug Severity Classification

| Severity | Descrizione | Esempi |
|----------|-------------|--------|
| 🔴 **Critical** | Blocca funzionalità core, no workaround | Login non funziona, dati persi, crash app |
| 🟠 **High** | Impatta usabilità, workaround complesso | Filtri non funzionano, errori non gestiti |
| 🟡 **Medium** | Impatta UX, workaround semplice | Validazione mancante, UI glitch |
| 🟢 **Low** | Cosmetico, nessun impatto funzionale | Typo, allineamento, colore |

## Best Practices Testing

### Prima di Iniziare
1. ✅ Leggi completamente il piano di test
2. ✅ Verifica setup ambiente (DB seeded, app running)
3. ✅ Prepara dati di test e file necessari
4. ✅ Pulisci cache browser e localStorage

### Durante l'Esecuzione
1. ✅ Segui i passi nell'ordine specificato
2. ✅ Documenta OGNI deviazione dal risultato atteso
3. ✅ Fai screenshot per bug trovati
4. ✅ Annota tempo di esecuzione per ogni test
5. ✅ Usa browser DevTools per verificare chiamate API

### Dopo l'Esecuzione
1. ✅ Compila Execution Log con risultati
2. ✅ Crea issue per ogni bug trovato
3. ✅ Aggiorna il summary report
4. ✅ Comunica risultati al team

### Tools Utili

**Browser DevTools**:
- **Network Tab**: Verifica chiamate API, status code, payload
- **Console Tab**: Verifica errori JavaScript
- **Application Tab**: Controlla localStorage per token JWT
- **Performance Tab**: Verifica tempi di caricamento

**Comandi utili**:
```bash
# Verifica stato database
wrangler d1 execute medidea-db-dev --local --command="SELECT COUNT(*) FROM clienti"

# Reset database a stato pulito
wrangler d1 execute medidea-db-dev --local --file=./db/schema.sql
wrangler d1 execute medidea-db-dev --local --file=./db/seed_v3.sql

# Verifica logs applicazione
npm run dev
# Vedi console per errori server-side
```

## Contatti e Supporto

Per domande o problemi durante l'esecuzione dei test:

- **Developer Lead**: [Contatto]
- **QA Lead**: [Contatto]
- **Issue Tracker**: GitHub Issues

## Changelog

| Data | Versione | Modifiche |
|------|----------|-----------|
| 2024-06-15 | 1.0 | Creazione iniziale piani di test |

---

**Note**: Questi piani di test sono living documents. Aggiorna e migliora dopo ogni ciclo di testing.
