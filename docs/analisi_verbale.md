# Analisi Approfondita Documento Operativo Medidea

## 1. Contenuto del Documento Analizzato

**File**: `docs/reference_activity.pdf` (Verbale di Intervento Medidea)
**Data Documento**: 12/12/2025
**Numero Intervento**: 1212DL

### Campi Presenti nel Documento Cartaceo

| Sezione | Campo | Valore Esempio | Note |
|---------|-------|----------------|------|
| **Intestazione** | Ragione Sociale | Medidea Srls | Fisso |
| | Indirizzo | Via Canelli, 21 – 00166 Roma | Fisso |
| | P.Iva | 17349711006 | Fisso |
| | Email | service@medidea.it | Fisso |
| **Identificativi** | Intervento N° | 1212DL | ID univoco verbale |
| | Data Intervento | 12/12/25 | Data di esecuzione |
| **Cliente** | Cliente | CLINICA PIO XI | Nome struttura |
| | Indirizzo | VIA AURELIA 559 ROMA | Indirizzo cliente |
| | Cliente Finale | (vuoto) | Per Global Service |
| | Global Service | SI / NO | Checkbox |
| | Reparto | RIANIMAZIONE | Reparto ospedaliero |
| **Richiesta** | Modalità Richiesta | EMAIL | Come è arrivata la richiesta |
| | Data Richiesta | 03/12/25 | Quando è stata fatta |
| | Preventivo N° | 266 | Numero preventivo |
| | Data Preventivo | 05/12/25 | Data emissione |
| | Ordine | EMAIL | Modalità conferma |
| | Data Ordine | (vuoto) | Non compilato |
| | Contratto N° | (vuoto) | Se in contratto |
| **Apparecchiature** | Modello | POMPA PLUM 360 | **Multiplo** (2 righe) |
| | Inventario | (vuoto) | Codice inventario cliente |
| | N° Serie | 20967578, 20967911 | **Due seriali distinti** |
| **Guasto** | Guasto Segnalato | GUASTO BATTERIA/POMPA | Testo libero |
| **Tipo Intervento** | Checkbox | Varie categorie | Matrice di selezione |
| | - Garanzia/Contratto | fuori contratto ✓ | |
| | - Tipo Apparecchio | EM Generico ✓ | |
| | - Tipo Lavoro | Elettronico ✓, Componenti ✓ | |
| **Descrizione** | Descrizione Intervento | ESEGUITA DIAGNOSI TECNICA, ESEGUITI TEST DI SISTEMA E CONTROLLO FUNZIONI, SOSTITUZIONE BATTERIE E TEST FUNZIONALI | Testo libero dettagliato |
| **Ricambi** | Codice | BT-6CK | Codice parte |
| | Descrizione | BATTERIA RICARICABILE PLUM360 | Nome parte |
| | Seriale | (vuoto) | Se parte serializzata |
| | Quantità | 2 (implicito da righe) | Due batterie sostituite |
| **Tempistiche** | Ore Lavoro | 2 | Ore effettive |
| | Ore Viaggio | (vuoto) | Tempo trasferimento |
| | Intervento Chiuso | SI / NO | Stato finale |
| **Firme** | Nome Tecnico | LUCA DATOLA | Chi ha eseguito |
| | Firma Tecnico | (campo firma) | Firma autografa |
| | Nome Referente | (vuoto) | Chi ha ricevuto |
| | Firma Referente | (campo firma) | Controfirma cliente |

---

## 2. Confronto con Schema Database Attuale

### Tabella `attivita` - Mappatura Campi

| Campo Documento | Campo DB Attuale | Stato | Note |
|-----------------|------------------|-------|------|
| Intervento N° | `id` (auto) | ⚠️ Parziale | L'ID è numerico auto, manca campo per "1212DL" |
| Data Intervento | `data_chiusura` | ✅ OK | Inteso come data esecuzione finale |
| Cliente | `id_cliente` (FK) | ✅ OK | Relazione con tabella `clienti` |
| Reparto | `reparto` | ✅ OK | Ora standardizzato con tabella `reparti` |
| Modalità Richiesta | `modalita_apertura_richiesta` | ✅ OK | Standardizzato con `modalita_apertura` |
| Data Richiesta | `data_apertura_richiesta` | ✅ OK | |
| Preventivo N° | `numero_preventivo` | ✅ OK | |
| Data Preventivo | `data_preventivo` | ✅ OK | |
| Ordine/Accettazione | `numero_accettazione_preventivo` | ✅ OK | |
| Contratto N° | - | ❌ Mancante | **Nuovo campo necessario** |
| Modello Apparecchiatura | `id_apparecchiatura` → `modelli_apparecchiature` | ✅ OK | Via JOIN |
| N° Serie | `apparecchiature.seriale` | ✅ OK | |
| Inventario Cliente | `codice_inventario_cliente` | ✅ OK | |
| Guasto Segnalato | `descrizione_richiesta` | ✅ OK | |
| Tipo Intervento (checkbox) | - | ❌ Mancante | **Matrice da digitalizzare** |
| Descrizione Intervento | `interventi_attivita.descrizione_intervento` | ✅ OK | Via tabella interventi |
| Codice Ricambi | - | ❌ Mancante | **Tabella ricambi necessaria** |
| Ore Lavoro | - | ❌ Mancante | **Campo ore/costi** |
| Ore Viaggio | - | ❌ Mancante | **Campo ore/costi** |
| Intervento Chiuso | `stato` (APERTO/CHIUSO) | ✅ OK | |
| Nome Tecnico | `id_tecnico` (FK) | ✅ OK | Via tabella `tecnici` |
| Firma Tecnico | - | ❌ Mancante | Firma digitale |
| Firma Referente | - | ❌ Mancante | Firma cliente |

### Gap Critico: Multi-Apparecchiatura
Il documento mostra **2 apparecchiature** (stessi modello, seriali diversi) nella stessa attività.
- **Attuale**: `id_apparecchiatura` è **singolo** (1 attività = 1 apparecchiatura)
- **Necessario**: Tabella ponte `attivita_apparecchiature` (N:M)

---

## 3. Proposte di Miglioramento Dettagliate

### A. Nuovo Campo: Numero Verbale Esterno
```sql
ALTER TABLE attivita ADD COLUMN numero_verbale TEXT;
-- Es: "1212DL"
```
Permette di mantenere la numerazione cartacea storica.

### B. Nuovo Campo: Numero Contratto
```sql
ALTER TABLE attivita ADD COLUMN numero_contratto TEXT;
ALTER TABLE attivita ADD COLUMN data_contratto TEXT;
```
Per gestire interventi in contratto di manutenzione.

### C. Digitalizzazione Tipo Intervento (Checkbox Matrix)
Creare tabella lookup e campo JSON:
```sql
CREATE TABLE tipi_intervento (
  id INTEGER PRIMARY KEY,
  categoria TEXT, -- 'copertura', 'apparecchio', 'lavoro'
  valore TEXT,    -- 'garanzia', 'contratto', 'fuori_contratto'...
  attivo INTEGER DEFAULT 1
);

ALTER TABLE attivita ADD COLUMN tipi_intervento_json TEXT;
-- Es: '{"copertura":"fuori_contratto","apparecchio":"EM Generico","lavoro":["Elettronico","Componenti"]}'
```

### D. Gestione Multi-Apparecchiatura
```sql
CREATE TABLE attivita_apparecchiature (
  id INTEGER PRIMARY KEY,
  id_attivita INTEGER NOT NULL,
  id_apparecchiatura INTEGER NOT NULL,
  note TEXT,
  FOREIGN KEY(id_attivita) REFERENCES attivita(id) ON DELETE CASCADE,
  FOREIGN KEY(id_apparecchiatura) REFERENCES apparecchiature(id) ON DELETE RESTRICT
);

-- Rimuovere o deprecare attivita.id_apparecchiatura
```

### E. Gestione Ricambi
```sql
CREATE TABLE ricambi (
  id INTEGER PRIMARY KEY,
  codice TEXT NOT NULL UNIQUE,
  descrizione TEXT,
  prezzo_unitario REAL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE attivita_ricambi (
  id INTEGER PRIMARY KEY,
  id_attivita INTEGER NOT NULL,
  id_ricambio INTEGER NOT NULL,
  quantita INTEGER DEFAULT 1,
  seriale_ricambio TEXT, -- se il ricambio è serializzato
  FOREIGN KEY(id_attivita) REFERENCES attivita(id),
  FOREIGN KEY(id_ricambio) REFERENCES ricambi(id)
);
```

### F. Gestione Ore Lavoro
```sql
ALTER TABLE attivita ADD COLUMN ore_lavoro REAL;
ALTER TABLE attivita ADD COLUMN ore_viaggio REAL;
-- Oppure aggregare da interventi:
ALTER TABLE interventi_attivita ADD COLUMN ore_intervento REAL;
ALTER TABLE interventi_attivita ADD COLUMN ore_viaggio REAL;
```

### G. Firme Digitali
```sql
ALTER TABLE attivita ADD COLUMN firma_tecnico_base64 TEXT;
ALTER TABLE attivita ADD COLUMN firma_referente_base64 TEXT;
ALTER TABLE attivita ADD COLUMN nome_referente TEXT;
ALTER TABLE attivita ADD COLUMN data_firma TEXT;
```
Con componente frontend per acquisizione firma touch.

---

## 4. Priorità di Implementazione

| Priorità | Miglioria | Complessità | Valore Business |
|----------|-----------|-------------|-----------------|
| 🔴 Alta | Multi-Apparecchiatura | Media | Allinea al workflow reale |
| 🔴 Alta | Numero Verbale | Bassa | Tracciabilità storica |
| 🟡 Media | Gestione Ricambi | Alta | Tracciabilità costi/magazzino |
| 🟡 Media | Ore Lavoro | Bassa | Analisi produttività |
| 🟡 Media | Tipo Intervento (checkbox) | Media | Report statistici |
| 🟢 Bassa | Firme Digitali | Media | Paperless completo |
| 🟢 Bassa | Global Service | Bassa | Caso specifico |

---

## 5. Azioni Immediate (Senza Modifiche Schema)

1. **Campo `numero_preventivo`**: Usarlo per memorizzare "1212DL" se non si vuole aggiungere campo
2. **Campo `note_generali`**: Strutturare con template per ore lavoro/viaggio
3. **Allegati**: Caricare sempre il PDF originale come allegato all'attività
4. **Descrizione Intervento**: Includere codici ricambi nel testo

---

*Documento generato dall'analisi di `reference_activity.pdf` - 16 Dicembre 2025*
