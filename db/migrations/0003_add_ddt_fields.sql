-- Migration: Add DDT (Documento Di Trasporto) fields to attivita table
-- Date: 2025-01-07

-- Add DDT Cliente fields (ritiro - pickup)
ALTER TABLE attivita ADD COLUMN numero_ddt_cliente TEXT;
ALTER TABLE attivita ADD COLUMN data_ddt_cliente TEXT;

-- Add DDT Consegna fields (delivery)
ALTER TABLE attivita ADD COLUMN numero_ddt_consegna TEXT;
ALTER TABLE attivita ADD COLUMN data_ddt_consegna TEXT;

-- Add categoria field to allegati table to categorize attachments
ALTER TABLE allegati ADD COLUMN categoria TEXT;

-- Create index for allegati categoria
CREATE INDEX IF NOT EXISTS idx_allegati_categoria ON allegati(categoria);
