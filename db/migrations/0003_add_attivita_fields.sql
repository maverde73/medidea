-- Migration: Add new fields to attivita table
-- Description: Adds data_presa_in_carico, reparto, tecnico, urgenza columns

-- Add data_presa_in_carico column
ALTER TABLE attivita ADD COLUMN data_presa_in_carico TEXT;

-- Add reparto column
ALTER TABLE attivita ADD COLUMN reparto TEXT;

-- Add tecnico column
ALTER TABLE attivita ADD COLUMN tecnico TEXT;

-- Add urgenza column
ALTER TABLE attivita ADD COLUMN urgenza TEXT;

-- Create index for urgenza filtering
CREATE INDEX IF NOT EXISTS idx_attivita_urgenza ON attivita(urgenza);

-- Create index for tecnico filtering
CREATE INDEX IF NOT EXISTS idx_attivita_tecnico ON attivita(tecnico);
