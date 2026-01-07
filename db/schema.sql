-- Medidea Database Schema for Cloudflare D1
-- Based on specification from spec_app_cloudflare.md

-- Tabella clienti
CREATE TABLE IF NOT EXISTS clienti (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  indirizzo TEXT,
  contatti TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Tabella modelli_apparecchiature
CREATE TABLE IF NOT EXISTS modelli_apparecchiature (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL UNIQUE,
  descrizione TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Tabella attivita
CREATE TABLE IF NOT EXISTS attivita (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_cliente INTEGER NOT NULL,
  id_apparecchiatura INTEGER,
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
  descrizione_richiesta TEXT,
  data_presa_in_carico TEXT,
  reparto TEXT,
  tecnico TEXT,
  id_tecnico INTEGER,
  urgenza TEXT,
  numero_ddt_cliente TEXT,
  data_ddt_cliente TEXT,
  numero_ddt_consegna TEXT,
  data_ddt_consegna TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(id_cliente) REFERENCES clienti(id) ON DELETE RESTRICT,
  FOREIGN KEY(id_tecnico) REFERENCES tecnici(id) ON DELETE SET NULL,
  FOREIGN KEY(id_apparecchiatura) REFERENCES apparecchiature(id) ON DELETE SET NULL
);

-- Indici per attivita
CREATE INDEX IF NOT EXISTS idx_attivita_cliente ON attivita(id_cliente);
CREATE INDEX IF NOT EXISTS idx_attivita_stato ON attivita(stato);
CREATE INDEX IF NOT EXISTS idx_attivita_data_apertura ON attivita(data_apertura_richiesta);
CREATE INDEX IF NOT EXISTS idx_attivita_apparecchiatura ON attivita(id_apparecchiatura);

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

-- Indici per interventi_attivita
CREATE INDEX IF NOT EXISTS idx_interventi_attivita ON interventi_attivita(id_attivita);
CREATE INDEX IF NOT EXISTS idx_interventi_data ON interventi_attivita(data_intervento);

-- Tabella apparecchiature
CREATE TABLE IF NOT EXISTS apparecchiature (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_cliente INTEGER NOT NULL,
  id_modello INTEGER NOT NULL,
  seriale TEXT,
  data_test_funzionali TEXT,
  data_test_elettrici TEXT,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(id_cliente) REFERENCES clienti(id) ON DELETE RESTRICT,
  FOREIGN KEY(id_modello) REFERENCES modelli_apparecchiature(id) ON DELETE RESTRICT
);

-- Indici per apparecchiature
CREATE INDEX IF NOT EXISTS idx_apparecchiature_cliente ON apparecchiature(id_cliente);
CREATE INDEX IF NOT EXISTS idx_apparecchiature_modello ON apparecchiature(id_modello);

-- Tabella allegati
CREATE TABLE IF NOT EXISTS allegati (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tipo_riferimento TEXT NOT NULL, -- 'attivita', 'apparecchiatura', 'intervento'
  id_riferimento INTEGER NOT NULL,
  nome_file_originale TEXT NOT NULL,
  chiave_r2 TEXT NOT NULL UNIQUE,
  mime_type TEXT,
  dimensione_bytes INTEGER,
  data_caricamento TEXT NOT NULL DEFAULT (datetime('now')),
  note TEXT,
  categoria TEXT, -- 'ddt_cliente', 'ddt_consegna', 'altro'
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indici per allegati
CREATE INDEX IF NOT EXISTS idx_allegati_riferimento ON allegati(tipo_riferimento, id_riferimento);
CREATE INDEX IF NOT EXISTS idx_allegati_chiave_r2 ON allegati(chiave_r2);
CREATE INDEX IF NOT EXISTS idx_allegati_categoria ON allegati(categoria);

-- Tabella utenti
CREATE TABLE IF NOT EXISTS utenti (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  nome TEXT NOT NULL,
  cognome TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user', -- 'admin', 'user', 'tecnico'
  active INTEGER NOT NULL DEFAULT 1, -- 0 = inactive, 1 = active
  last_login TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indici per utenti
CREATE INDEX IF NOT EXISTS idx_utenti_email ON utenti(email);
CREATE INDEX IF NOT EXISTS idx_utenti_role ON utenti(role);
CREATE INDEX IF NOT EXISTS idx_utenti_active ON utenti(active);

-- Tabella tecnici
CREATE TABLE IF NOT EXISTS tecnici (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  cognome TEXT NOT NULL,
  id_utente INTEGER UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(id_utente) REFERENCES utenti(id) ON DELETE SET NULL
);

-- Tabella reparti
CREATE TABLE IF NOT EXISTS reparti (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL UNIQUE,
  descrizione TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Tabella modalita_apertura
CREATE TABLE IF NOT EXISTS modalita_apertura (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  descrizione TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
