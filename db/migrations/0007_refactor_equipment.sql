-- Create modelli_apparecchiature table
CREATE TABLE IF NOT EXISTS modelli_apparecchiature (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL UNIQUE,
  descrizione TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Populate modelli_apparecchiature from existing equipment
INSERT OR IGNORE INTO modelli_apparecchiature (nome)
SELECT DISTINCT modello FROM apparecchiature WHERE modello IS NOT NULL AND modello != '';

-- Populate from activities if not already present
INSERT OR IGNORE INTO modelli_apparecchiature (nome)
SELECT DISTINCT modello FROM attivita WHERE modello IS NOT NULL AND modello != '';

-- Add id_modello to apparecchiature
ALTER TABLE apparecchiature ADD COLUMN id_modello INTEGER REFERENCES modelli_apparecchiature(id);

-- Update apparecchiature with id_modello
UPDATE apparecchiature 
SET id_modello = (SELECT id FROM modelli_apparecchiature WHERE nome = apparecchiature.modello);

-- Add id_apparecchiatura to attivita
ALTER TABLE attivita ADD COLUMN id_apparecchiatura INTEGER REFERENCES apparecchiature(id);

-- Update attivita with id_apparecchiatura
-- This tries to match by model and serial. 
-- Note: This might not match everything if serials are missing or inconsistent.
UPDATE attivita 
SET id_apparecchiatura = (
  SELECT id FROM apparecchiature 
  WHERE modello = attivita.modello 
  AND (seriale = attivita.seriale OR (seriale IS NULL AND attivita.seriale IS NULL))
  AND id_cliente = attivita.id_cliente
  LIMIT 1
);

-- Create indices for new columns
CREATE INDEX IF NOT EXISTS idx_apparecchiature_modello_id ON apparecchiature(id_modello);
CREATE INDEX IF NOT EXISTS idx_attivita_apparecchiatura_id ON attivita(id_apparecchiatura);
