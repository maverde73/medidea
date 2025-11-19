/**
 * Validation schemas for allegati (attachments) endpoints
 */

import { z } from "zod";

/**
 * Tipi di riferimento supportati
 */
export const TipoRiferimento = z.enum(["attivita", "apparecchiatura", "intervento"]);

/**
 * Schema per upload allegato
 */
export const UploadAllegatoSchema = z.object({
  tipo_riferimento: TipoRiferimento,
  id_riferimento: z.number().int().positive(),
  note: z.string().optional(),
});

/**
 * Schema per metadati allegato
 */
export const AllegatoMetadataSchema = z.object({
  nome_file_originale: z.string(),
  mime_type: z.string(),
  dimensione_bytes: z.number().int().positive(),
});

/**
 * Tipo TypeScript per upload allegato
 */
export type UploadAllegatoInput = z.infer<typeof UploadAllegatoSchema>;

/**
 * Tipo TypeScript per metadati allegato
 */
export type AllegatoMetadata = z.infer<typeof AllegatoMetadataSchema>;

/**
 * Tipo TypeScript per tipo riferimento
 */
export type TipoRiferimentoType = z.infer<typeof TipoRiferimento>;

/**
 * Interfaccia completa per un allegato dal database
 */
export interface Allegato {
  id: number;
  tipo_riferimento: string;
  id_riferimento: number;
  nome_file_originale: string;
  chiave_r2: string;
  mime_type: string | null;
  dimensione_bytes: number | null;
  data_caricamento: string;
  note: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Validate file is PDF
 */
export function isPDF(mimeType: string, fileName: string): boolean {
  return (
    mimeType === "application/pdf" ||
    fileName.toLowerCase().endsWith(".pdf")
  );
}

/**
 * Validate file size (max 10MB)
 */
export function isValidFileSize(sizeBytes: number, maxSizeMB: number = 10): boolean {
  const maxBytes = maxSizeMB * 1024 * 1024;
  return sizeBytes <= maxBytes;
}

/**
 * Generate unique R2 key for file
 */
export function generateR2Key(
  tipoRiferimento: TipoRiferimentoType,
  idRiferimento: number,
  originalFileName: string
): string {
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 15);
  const extension = originalFileName.split('.').pop() || 'pdf';
  return `${tipoRiferimento}/${idRiferimento}/${timestamp}-${randomId}.${extension}`;
}
