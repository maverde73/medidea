-- Create reparti table
CREATE TABLE IF NOT EXISTS reparti (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL UNIQUE,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Create modalita_apertura table
CREATE TABLE IF NOT EXISTS modalita_apertura (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  descrizione TEXT NOT NULL UNIQUE,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Insert default values for reparti
INSERT INTO reparti (nome) VALUES ('Laboratorio'), ('Magazzino'), ('Ufficio Tecnico');

-- Insert default values for modalita_apertura
INSERT INTO modalita_apertura (descrizione) VALUES ('Email'), ('Telefono'), ('Portale Web'), ('Visita in loco');
