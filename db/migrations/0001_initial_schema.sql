-- Migration 0001: Initial Schema
-- Created: 2025-11-18
-- Description: Create initial database schema for Medidea

-- Tabella clienti
CREATE TABLE IF NOT EXISTS clienti (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  indirizzo TEXT,
  contatti TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Tabella attivita
CREATE TABLE IF NOT EXISTS attivita (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_cliente INTEGER NOT NULL,
  modello TEXT,
  seriale TEXT,
  codice_inventario_cliente TEXT,
  modalita_apertura_richiesta TEXT,
  data_apertura_richiesta TEXT,
  numero_preventivo TEXT,
  data_preventivo TEXT,
  numero_accettazione_preventivo TEXT,
  data_accettazione_preventivo TEXT,
  stato TEXT NOT NULL DEFAULT 'APERTO',
  data_chiusura TEXT,
  note_generali TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(id_cliente) REFERENCES clienti(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_attivita_cliente ON attivita(id_cliente);
CREATE INDEX IF NOT EXISTS idx_attivita_stato ON attivita(stato);
CREATE INDEX IF NOT EXISTS idx_attivita_data_apertura ON attivita(data_apertura_richiesta);

-- Tabella interventi_attivita
CREATE TABLE IF NOT EXISTS interventi_attivita (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_attivita INTEGER NOT NULL,
  data_intervento TEXT NOT NULL,
  descrizione_intervento TEXT,
  operatore TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(id_attivita) REFERENCES attivita(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_interventi_attivita ON interventi_attivita(id_attivita);
CREATE INDEX IF NOT EXISTS idx_interventi_data ON interventi_attivita(data_intervento);

-- Tabella apparecchiature
CREATE TABLE IF NOT EXISTS apparecchiature (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_cliente INTEGER NOT NULL,
  modello TEXT NOT NULL,
  seriale TEXT,
  data_test_funzionali TEXT,
  data_test_elettrici TEXT,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(id_cliente) REFERENCES clienti(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_apparecchiature_cliente ON apparecchiature(id_cliente);
CREATE INDEX IF NOT EXISTS idx_apparecchiature_modello ON apparecchiature(modello);

-- Tabella allegati
CREATE TABLE IF NOT EXISTS allegati (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tipo_riferimento TEXT NOT NULL,
  id_riferimento INTEGER NOT NULL,
  nome_file_originale TEXT NOT NULL,
  chiave_r2 TEXT NOT NULL UNIQUE,
  mime_type TEXT,
  dimensione_bytes INTEGER,
  data_caricamento TEXT NOT NULL DEFAULT (datetime('now')),
  note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_allegati_riferimento ON allegati(tipo_riferimento, id_riferimento);
CREATE INDEX IF NOT EXISTS idx_allegati_chiave_r2 ON allegati(chiave_r2);
