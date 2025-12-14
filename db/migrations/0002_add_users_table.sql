-- Migration 0002: Add users table for authentication
-- Created: 2025-11-19
-- Description: Create users table with authentication and role management

CREATE TABLE IF NOT EXISTS utenti (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  nome TEXT NOT NULL,
  cognome TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'tecnico', -- 'admin' or 'tecnico'
  active BOOLEAN NOT NULL DEFAULT 1,
  last_login TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Index for faster email lookup during login
CREATE INDEX IF NOT EXISTS idx_utenti_email ON utenti(email);
CREATE INDEX IF NOT EXISTS idx_utenti_role ON utenti(role);
CREATE INDEX IF NOT EXISTS idx_utenti_active ON utenti(active);
