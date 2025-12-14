-- Migration: Add descrizione_richiesta to attivita table
-- Description: Adds a field to describe the reason for the activity opening (e.g. guasto, verifica, controllo)

ALTER TABLE attivita ADD COLUMN descrizione_richiesta TEXT;
