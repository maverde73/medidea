-- Migration 0008: Cleanup schema by removing obsolete columns
-- Created: 2025-12-16
-- Description: Drop modello column from apparecchiature and modello/seriale from attivita

PRAGMA foreign_keys=OFF;

-- 1. Fix apparecchiature
CREATE TABLE new_apparecchiature (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_cliente INTEGER NOT NULL REFERENCES clienti(id),
  id_modello INTEGER REFERENCES modelli_apparecchiature(id),
  seriale TEXT,
  data_test_funzionali TEXT,
  data_test_elettrici TEXT,
  note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO new_apparecchiature (id, id_cliente, id_modello, seriale, data_test_funzionali, data_test_elettrici, note, created_at, updated_at)
SELECT id, id_cliente, id_modello, seriale, data_test_funzionali, data_test_elettrici, note, created_at, updated_at
FROM apparecchiature;

DROP TABLE apparecchiature;
ALTER TABLE new_apparecchiature RENAME TO apparecchiature;

CREATE INDEX IF NOT EXISTS idx_apparecchiature_modello_id ON apparecchiature(id_modello);

-- 2. Fix attivita
CREATE TABLE new_attivita (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  id_cliente INTEGER NOT NULL REFERENCES clienti(id),
  id_apparecchiatura INTEGER REFERENCES apparecchiature(id),
  id_tecnico INTEGER REFERENCES tecnici(id),
  codice_inventario_cliente TEXT,
  modalita_apertura_richiesta TEXT,
  data_apertura_richiesta TEXT,
  descrizione_richiesta TEXT,
  numero_preventivo TEXT,
  data_preventivo TEXT,
  numero_accettazione_preventivo TEXT,
  data_accettazione_preventivo TEXT,
  stato TEXT NOT NULL DEFAULT 'APERTO',
  data_chiusura TEXT,
  note_generali TEXT,
  data_presa_in_carico TEXT,
  reparto TEXT,
  tecnico TEXT,
  urgenza TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO new_attivita (id, id_cliente, id_apparecchiatura, id_tecnico, codice_inventario_cliente, modalita_apertura_richiesta, data_apertura_richiesta, descrizione_richiesta, numero_preventivo, data_preventivo, numero_accettazione_preventivo, data_accettazione_preventivo, stato, data_chiusura, note_generali, data_presa_in_carico, reparto, tecnico, urgenza, created_at, updated_at)
SELECT id, id_cliente, id_apparecchiatura, id_tecnico, codice_inventario_cliente, modalita_apertura_richiesta, data_apertura_richiesta, descrizione_richiesta, numero_preventivo, data_preventivo, numero_accettazione_preventivo, data_accettazione_preventivo, stato, data_chiusura, note_generali, data_presa_in_carico, reparto, tecnico, urgenza, created_at, updated_at
FROM attivita;

DROP TABLE attivita;
ALTER TABLE new_attivita RENAME TO attivita;

CREATE INDEX IF NOT EXISTS idx_attivita_apparecchiatura_id ON attivita(id_apparecchiatura);

PRAGMA foreign_keys=ON;
