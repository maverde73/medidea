-- Migration: 0009_client_requirements.sql
-- Implements client requirements for enhanced activity management

-- ============================================
-- PARTE 1: Nuovi campi tabella attivita
-- ============================================

-- Numero verbale personalizzato (es. "1212DL")
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

-- ============================================
-- PARTE 2: Tabella Multi-Apparecchiature
-- ============================================

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
CREATE INDEX IF NOT EXISTS idx_attivita_app ON attivita_apparecchiature(id_attivita);

-- ============================================
-- PARTE 3: Tabelle Ricambi
-- ============================================

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
CREATE INDEX IF NOT EXISTS idx_attivita_ricambi ON attivita_ricambi(id_attivita);

-- ============================================
-- PARTE 4: Tabelle Lookup
-- ============================================

-- Modalità intervento (selezione singola)
CREATE TABLE IF NOT EXISTS modalita_intervento (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  codice TEXT NOT NULL UNIQUE,
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

-- ============================================
-- PARTE 5: Seed Dati Lookup
-- ============================================

-- Modalità intervento
INSERT INTO modalita_intervento (codice, descrizione, ordine) VALUES
('garanzia', 'Intervento in garanzia', 1),
('contratto', 'Intervento in contratto', 2),
('fuori_contratto', 'Intervento fuori contratto', 3),
('supporto_casa_madre', 'Supporto casa madre', 4),
('supporto_vendite', 'Supporto vendite', 5);

-- Tipi apparecchiatura
INSERT INTO tipi_apparecchiatura (codice, descrizione, ordine) VALUES
('tavolo_operatorio', 'Tavolo Operatorio', 1),
('stativo_pensile', 'Stativo Pensile', 2),
('lampada_scialitica', 'Lampada Scialitica', 3),
('letto_degenza', 'Letto Degenza', 4),
('defibrillatore', 'Defibrillatore', 5),
('arredi', 'Arredi', 6),
('monitor', 'Monitor', 7),
('em_generico', 'EM Generico', 8),
('elettrocardiografo', 'Elettrocardiografo', 9),
('ventilatore', 'Ventilatore', 10);

-- Tipi intervento
INSERT INTO tipi_intervento (codice, descrizione, ordine) VALUES
('meccanico', 'Meccanico', 1),
('elettronico', 'Elettronico', 2),
('componenti', 'Componenti', 3),
('software', 'Software', 4),
('aggiornamento', 'Aggiornamento', 5),
('altro', 'Altro', 6),
('formazione', 'Formazione', 7),
('verifiche_elettriche', 'Verifiche Elettriche', 8),
('funzionali', 'Funzionali', 9);

-- Seed ricambi comuni (opzionale, può essere rimosso)
INSERT INTO ricambi (codice, descrizione, prezzo_unitario) VALUES
('BT-6CK', 'Batteria Ricaricabile Plum 360', 150.00),
('FLT-001', 'Filtro Aria Standard', 25.00),
('CBL-PWR', 'Cavo Alimentazione', 35.00);
