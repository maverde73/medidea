# Analisi Requisiti Cliente vs Sistema Attuale

## Sommario Esecutivo

Il cliente ha fornito un documento con le specifiche attese per la gestione delle attività/interventi. Questo documento confronta ogni requisito con lo stato attuale del sistema Medidea e propone i passaggi implementativi necessari.

---

## 1. Mappatura Requisiti → Sistema Attuale

| # | Requisito Cliente | Campo DB Attuale | Stato | Gap |
|---|-------------------|------------------|-------|-----|
| 1 | Numero intervento (codice personalizzato) | `id` (auto) | ⚠️ | Manca campo per codice custom (es. "1212DL") |
| 2 | Data intervento | `data_chiusura` | ⚠️ | Usiamo data chiusura, manca "data intervento" esplicita |
| 3 | Cliente, Indirizzo | `id_cliente` → `clienti.nome/indirizzo` | ✅ | OK |
| 4 | Global Service (flag) | - | ❌ | **Mancante** |
| 5 | Cliente Finale (se global service) | - | ❌ | **Mancante** |
| 6 | Reparto | `reparto` + tabella `reparti` | ✅ | OK |
| 7 | Sorgente Richiesta | `modalita_apertura_richiesta` | ✅ | OK |
| 8 | Data Richiesta | `data_apertura_richiesta` | ✅ | OK |
| 9 | N° Preventivo | `numero_preventivo` | ✅ | OK |
| 10 | Data Preventivo | `data_preventivo` | ✅ | OK |
| 11 | Sorgente Ordine | - | ❌ | **Mancante** |
| 12 | Data Ordine | `data_accettazione_preventivo` | ⚠️ | Riutilizzabile ma nome non chiaro |
| 13 | N° Contratto Manutenzione | - | ❌ | **Mancante** |
| 14 | Data Contratto | - | ❌ | **Mancante** |
| 15 | Apparecchiature (multiple) | `id_apparecchiatura` (singolo) | ❌ | **Solo 1 apparecchiatura per attività** |
| 16 | Modello, Inventario, Seriale | `apparecchiature.*` | ✅ | OK |
| 17 | Guasto Segnalato | `descrizione_richiesta` | ✅ | OK |
| 18 | Modalità intervento (garanzia/contratto/...) | - | ❌ | **Mancante** |
| 19 | Tipo Apparecchiature (multiselezione) | - | ❌ | **Mancante** |
| 20 | Tipo intervento (multiselezione) | - | ❌ | **Mancante** |
| 21 | Descrizione intervento | `interventi_attivita.descrizione_intervento` | ✅ | OK |
| 22 | Ricambi (codice, descrizione, seriale) | - | ❌ | **Mancante** |
| 23 | Ore di lavoro | - | ❌ | **Mancante** |
| 24 | Ore viaggio | - | ❌ | **Mancante** |
| 25 | Intervento chiuso (Si/No) | `stato` (APERTO/CHIUSO) | ✅ | OK |
| 26 | Data Chiusura | `data_chiusura` | ✅ | OK |
| 27 | Tecnico | `id_tecnico` → `tecnici` | ✅ | OK |

### Riepilogo Gap

| Categoria | Gap Identificati |
|-----------|------------------|
| **Critici** | Multi-apparecchiatura, Ricambi, Tipi intervento |
| **Importanti** | Ore lavoro/viaggio, Global Service, Contratto |
| **Minori** | Numero verbale custom, Sorgente ordine |

---

## 2. Piano Implementativo Dettagliato

### Fase 1: Schema Database

#### 1.1 Nuovi Campi Tabella `attivita`

```sql
-- Migrazione: 0009_client_requirements.sql

-- Numero verbale personalizzato
ALTER TABLE attivita ADD COLUMN numero_verbale TEXT;

-- Global Service
ALTER TABLE attivita ADD COLUMN global_service INTEGER DEFAULT 0; -- 0=No, 1=Sì
ALTER TABLE attivita ADD COLUMN id_cliente_finale INTEGER REFERENCES clienti(id);

-- Ordine
ALTER TABLE attivita ADD COLUMN sorgente_ordine TEXT; -- Email, Telefono, etc.
ALTER TABLE attivita ADD COLUMN data_ordine TEXT;

-- Contratto Manutenzione
ALTER TABLE attivita ADD COLUMN numero_contratto TEXT;
ALTER TABLE attivita ADD COLUMN data_contratto TEXT;

-- Data intervento esplicita
ALTER TABLE attivita ADD COLUMN data_intervento TEXT;

-- Ore lavoro
ALTER TABLE attivita ADD COLUMN ore_lavoro REAL;
ALTER TABLE attivita ADD COLUMN ore_viaggio REAL;

-- Tipi (JSON per multiselezione)
ALTER TABLE attivita ADD COLUMN modalita_intervento TEXT; -- Es: 'fuori_contratto'
ALTER TABLE attivita ADD COLUMN tipi_apparecchiatura_json TEXT; -- Es: '["EM Generico","Monitor"]'
ALTER TABLE attivita ADD COLUMN tipi_intervento_json TEXT; -- Es: '["Elettronico","Componenti"]'
```

#### 1.2 Tabella Multi-Apparecchiature

```sql
-- Relazione N:M tra attività e apparecchiature
CREATE TABLE IF NOT EXISTS attivita_apparecchiature (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_attivita INTEGER NOT NULL,
  id_apparecchiatura INTEGER NOT NULL,
  note TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY(id_attivita) REFERENCES attivita(id) ON DELETE CASCADE,
  FOREIGN KEY(id_apparecchiatura) REFERENCES apparecchiature(id) ON DELETE RESTRICT,
  UNIQUE(id_attivita, id_apparecchiatura)
);
CREATE INDEX idx_attivita_app ON attivita_apparecchiature(id_attivita);
```

#### 1.3 Tabelle Ricambi

```sql
-- Anagrafica ricambi
CREATE TABLE IF NOT EXISTS ricambi (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  codice TEXT NOT NULL UNIQUE,
  descrizione TEXT NOT NULL,
  prezzo_unitario REAL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Ricambi usati per attività
CREATE TABLE IF NOT EXISTS attivita_ricambi (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_attivita INTEGER NOT NULL,
  id_ricambio INTEGER NOT NULL,
  quantita INTEGER DEFAULT 1,
  seriale TEXT, -- Seriale specifico se il ricambio è serializzato
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY(id_attivita) REFERENCES attivita(id) ON DELETE CASCADE,
  FOREIGN KEY(id_ricambio) REFERENCES ricambi(id) ON DELETE RESTRICT
);
CREATE INDEX idx_attivita_ricambi ON attivita_ricambi(id_attivita);
```

#### 1.4 Tabelle Lookup per Multiselezione

```sql
-- Modalità intervento (selezione singola)
CREATE TABLE IF NOT EXISTS modalita_intervento (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  codice TEXT NOT NULL UNIQUE, -- 'garanzia', 'contratto', 'fuori_contratto'...
  descrizione TEXT NOT NULL,
  ordine INTEGER DEFAULT 0
);

-- Tipi apparecchiatura (per categorizzazione)
CREATE TABLE IF NOT EXISTS tipi_apparecchiatura (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  codice TEXT NOT NULL UNIQUE,
  descrizione TEXT NOT NULL,
  ordine INTEGER DEFAULT 0
);

-- Tipi intervento (per categorizzazione lavoro)
CREATE TABLE IF NOT EXISTS tipi_intervento (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  codice TEXT NOT NULL UNIQUE,
  descrizione TEXT NOT NULL,
  ordine INTEGER DEFAULT 0
);
```

---

### Fase 2: Seed Dati Lookup

```sql
-- Modalità intervento
INSERT INTO modalita_intervento (codice, descrizione) VALUES
('garanzia', 'Intervento in garanzia'),
('contratto', 'Intervento in contratto'),
('fuori_contratto', 'Intervento fuori contratto'),
('supporto_casa_madre', 'Supporto casa madre'),
('supporto_vendite', 'Supporto vendite');

-- Tipi apparecchiatura
INSERT INTO tipi_apparecchiatura (codice, descrizione) VALUES
('tavolo_operatorio', 'Tavolo Operatorio'),
('stativo_pensile', 'Stativo Pensile'),
('lampada_scialitica', 'Lampada Scialitica'),
('letto_degenza', 'Letto Degenza'),
('defibrillatore', 'Defibrillatore'),
('arredi', 'Arredi'),
('monitor', 'Monitor'),
('em_generico', 'EM Generico'),
('elettrocardiografo', 'Elettrocardiografo'),
('ventilatore', 'Ventilatore');

-- Tipi intervento
INSERT INTO tipi_intervento (codice, descrizione) VALUES
('meccanico', 'Meccanico'),
('elettronico', 'Elettronico'),
('componenti', 'Componenti'),
('software', 'Software'),
('aggiornamento', 'Aggiornamento'),
('altro', 'Altro'),
('formazione', 'Formazione'),
('verifiche_elettriche', 'Verifiche Elettriche'),
('funzionali', 'Funzionali');
```

---

### Fase 3: API Endpoints

| Endpoint | Metodo | Descrizione | Priorità |
|----------|--------|-------------|----------|
| `/api/attivita` | PATCH | Aggiornare per nuovi campi | Alta |
| `/api/attivita/[id]/apparecchiature` | GET/POST/DELETE | Gestione multi-apparecchiature | Alta |
| `/api/attivita/[id]/ricambi` | GET/POST/DELETE | Gestione ricambi | Alta |
| `/api/ricambi` | GET/POST | Anagrafica ricambi | Media |
| `/api/modalita-intervento` | GET | Lista modalità | Bassa |
| `/api/tipi-apparecchiatura` | GET | Lista tipi | Bassa |
| `/api/tipi-intervento` | GET | Lista tipi | Bassa |

---

### Fase 4: Componenti UI

#### 4.1 Form Attività (Nuove Sezioni)

```
┌─────────────────────────────────────────────────────────────┐
│ SEZIONE: IDENTIFICATIVI                                     │
├─────────────────────────────────────────────────────────────┤
│ Numero Verbale: [________] (opzionale, es. "1212DL")        │
│ Data Intervento: [📅]                                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ SEZIONE: GLOBAL SERVICE                                     │
├─────────────────────────────────────────────────────────────┤
│ [☐] Global Service                                          │
│ └─ Cliente Finale: [Dropdown clienti] (se spuntato)         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ SEZIONE: ORDINE E CONTRATTO                                 │
├─────────────────────────────────────────────────────────────┤
│ Sorgente Ordine: [Email ▼]  Data Ordine: [📅]               │
│ N° Contratto: [________]    Data Contratto: [📅]            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ SEZIONE: APPARECCHIATURE (multiple)                         │
├─────────────────────────────────────────────────────────────┤
│ [+ Aggiungi Apparecchiatura]                                │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ POMPA PLUM 360 | SN: 20967578 | Inv: INV-001    [🗑️] │   │
│ │ POMPA PLUM 360 | SN: 20967911 | Inv: INV-002    [🗑️] │   │
│ └───────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ SEZIONE: CLASSIFICAZIONE INTERVENTO                         │
├─────────────────────────────────────────────────────────────┤
│ Modalità: (○) Garanzia (○) Contratto (●) Fuori Contratto    │
│           (○) Supporto Casa Madre (○) Supporto Vendite      │
│                                                             │
│ Tipo Apparecchiatura: [☐] Tavolo Op. [☑] EM Generico [☐]... │
│ Tipo Intervento: [☑] Elettronico [☑] Componenti [☐] ...     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ SEZIONE: RICAMBI UTILIZZATI                                 │
├─────────────────────────────────────────────────────────────┤
│ [+ Aggiungi Ricambio]                                       │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ BT-6CK | BATTERIA RICARICABILE PLUM360 | Qty: 2  [🗑️]│   │
│ └───────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ SEZIONE: TEMPISTICHE                                        │
├─────────────────────────────────────────────────────────────┤
│ Ore Lavoro: [2.0]    Ore Viaggio: [0.5]                     │
└─────────────────────────────────────────────────────────────┘
```

#### 4.2 Nuovi Componenti React

| Componente | Descrizione | File |
|------------|-------------|------|
| `MultiEquipmentSelector` | Gestione lista apparecchiature | `components/ui/MultiEquipmentSelector.tsx` |
| `SparePartsManager` | Gestione ricambi con autocomplete | `components/ui/SparePartsManager.tsx` |
| `InterventionTypeSelector` | Checkbox multiselezione tipi | `components/ui/InterventionTypeSelector.tsx` |
| `GlobalServiceToggle` | Toggle + selezione cliente finale | `components/ui/GlobalServiceToggle.tsx` |

---

### Fase 5: Priorità Implementazione

| Priorità | Task | Effort | Valore |
|----------|------|--------|--------|
| 🔴 P1 | Multi-Apparecchiature | 3 giorni | Alto |
| 🔴 P1 | Gestione Ricambi | 3 giorni | Alto |
| 🟡 P2 | Tipi Intervento (checkbox) | 2 giorni | Medio |
| 🟡 P2 | Ore Lavoro/Viaggio | 1 giorno | Medio |
| 🟡 P2 | Global Service + Cliente Finale | 1 giorno | Medio |
| 🟢 P3 | Numero Verbale Custom | 0.5 giorni | Basso |
| 🟢 P3 | Contratto Manutenzione | 0.5 giorni | Basso |
| 🟢 P3 | Sorgente/Data Ordine | 0.5 giorni | Basso |

**Totale Stimato**: ~12 giorni lavorativi

---

## 3. Azioni Immediate (Zero Modifiche Schema)

Se non si può modificare subito lo schema:

1. **Multi-apparecchiature**: Usare `note_generali` per elencare seriali aggiuntivi
2. **Ricambi**: Documentare in `descrizione_intervento` con formato strutturato
3. **Ore**: Aggiungere in `note_generali` come "Ore: 2 lavoro + 0.5 viaggio"
4. **Tipi intervento**: Prefissare descrizione con tag tipo "[ELETTRONICO][COMPONENTI]"

---

## 4. Validazione Requisiti

Dopo l'implementazione, checklist di verifica:

- [ ] Numero verbale visualizzato in lista e dettaglio
- [ ] Global Service attiva selezione cliente finale
- [ ] Possibile aggiungere 2+ apparecchiature a 1 attività
- [ ] Possibile selezionare multipli tipi intervento
- [ ] Ricambi salvati con codice, descrizione, quantità
- [ ] Ore lavoro/viaggio sommabili per report
- [ ] Export Excel include tutti i nuovi campi
- [ ] PDF verbale generato con layout cliente

---

*Documento generato il 17 Dicembre 2025*
