-- Tabella tecnici
CREATE TABLE IF NOT EXISTS tecnici (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  cognome TEXT NOT NULL,
  id_utente INTEGER UNIQUE, -- Link opzionale 1:1 con un utente
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(id_utente) REFERENCES utenti(id) ON DELETE SET NULL
);

-- Indici per tecnici
CREATE INDEX IF NOT EXISTS idx_tecnici_utente ON tecnici(id_utente);

-- Aggiunta colonna id_tecnico alla tabella attivita
ALTER TABLE attivita ADD COLUMN id_tecnico INTEGER REFERENCES tecnici(id) ON DELETE SET NULL;

-- Indice per la nuova colonna
CREATE INDEX IF NOT EXISTS idx_attivita_tecnico ON attivita(id_tecnico);
