/**
 * Validation schemas for interventi endpoints
 */

import { z } from "zod";

/**
 * Schema for creating a new intervento
 */
export const CreateInterventoSchema = z.object({
  data_intervento: z.string().datetime({
    message: "Data intervento deve essere in formato ISO 8601",
  }),
  descrizione_intervento: z.string().optional(),
  operatore: z.string().optional(),
});

/**
 * Schema for updating an existing intervento
 */
export const UpdateInterventoSchema = z.object({
  data_intervento: z.string().datetime().optional(),
  descrizione_intervento: z.string().optional(),
  operatore: z.string().optional(),
});

/**
 * Tipo TypeScript per un nuovo intervento
 */
export type CreateInterventoInput = z.infer<typeof CreateInterventoSchema>;

/**
 * Tipo TypeScript per l'aggiornamento di un intervento
 */
export type UpdateInterventoInput = z.infer<typeof UpdateInterventoSchema>;

/**
 * Interfaccia completa per un intervento dal database
 */
export interface Intervento {
  id: number;
  id_attivita: number;
  data_intervento: string;
  descrizione_intervento: string | null;
  operatore: string | null;
  created_at: string;
  updated_at: string;
}
