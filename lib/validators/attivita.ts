/**
 * Validation schemas for attivita endpoints
 */

import { z } from "zod";

/**
 * Stati validi per un'attività
 */
export const StatoAttivita = z.enum(["APERTO", "CHIUSO", "RIAPERTO"]);

/**
 * Livelli di urgenza validi
 */
export const UrgenzaAttivita = z.enum(["BASSA", "MEDIA", "ALTA"]);

/**
 * Schema per la creazione di una nuova attività
 */
export const CreateAttivitaSchema = z.object({
  id_cliente: z.number().int().positive({
    message: "ID cliente deve essere un numero positivo",
  }),
  modello: z.string().optional(),
  seriale: z.string().optional(),
  codice_inventario_cliente: z.string().optional(),
  modalita_apertura_richiesta: z.string().optional(),
  data_apertura_richiesta: z
    .string()
    .datetime({ message: "Data apertura deve essere in formato ISO 8601" })
    .optional(),
  numero_preventivo: z.string().optional(),
  data_preventivo: z
    .string()
    .datetime({ message: "Data preventivo deve essere in formato ISO 8601" })
    .optional(),
  numero_accettazione_preventivo: z.string().optional(),
  data_accettazione_preventivo: z
    .string()
    .datetime({
      message: "Data accettazione preventivo deve essere in formato ISO 8601",
    })
    .optional(),
  note_generali: z.string().optional(),
  data_presa_in_carico: z
    .string()
    .datetime({ message: "Data presa in carico deve essere in formato ISO 8601" })
    .optional(),
  reparto: z.string().optional(),
  tecnico: z.string().optional(),
  urgenza: UrgenzaAttivita.optional(),
});

/**
 * Schema per l'aggiornamento di un'attività esistente
 * Tutti i campi sono opzionali
 */
export const UpdateAttivitaSchema = z.object({
  id_cliente: z.number().int().positive().optional(),
  modello: z.string().optional(),
  seriale: z.string().optional(),
  codice_inventario_cliente: z.string().optional(),
  modalita_apertura_richiesta: z.string().optional(),
  data_apertura_richiesta: z.string().datetime().optional(),
  numero_preventivo: z.string().optional(),
  data_preventivo: z.string().datetime().optional(),
  numero_accettazione_preventivo: z.string().optional(),
  data_accettazione_preventivo: z.string().datetime().optional(),
  stato: StatoAttivita.optional(),
  data_chiusura: z.string().datetime().optional(),
  note_generali: z.string().optional(),
  data_presa_in_carico: z.string().datetime().optional(),
  reparto: z.string().optional(),
  tecnico: z.string().optional(),
  urgenza: UrgenzaAttivita.optional(),
});

/**
 * Schema per il parametro ID
 */
export const IdParamSchema = z.object({
  id: z.string().regex(/^\d+$/, {
    message: "ID deve essere un numero",
  }),
});

/**
 * Tipo TypeScript per una nuova attività
 */
export type CreateAttivitaInput = z.infer<typeof CreateAttivitaSchema>;

/**
 * Tipo TypeScript per l'aggiornamento di un'attività
 */
export type UpdateAttivitaInput = z.infer<typeof UpdateAttivitaSchema>;

/**
 * Tipo TypeScript per lo stato attività
 */
export type StatoAttivitaType = z.infer<typeof StatoAttivita>;

/**
 * Tipo TypeScript per l'urgenza attività
 */
export type UrgenzaAttivitaType = z.infer<typeof UrgenzaAttivita>;

/**
 * Tipo TypeScript per il parametro ID
 */
export type IdParam = z.infer<typeof IdParamSchema>;

/**
 * Schema per i filtri di ricerca attività
 */
export const AttivitaFiltersSchema = z.object({
  // Filtro per cliente
  id_cliente: z
    .string()
    .regex(/^\d+$/)
    .transform((val) => parseInt(val))
    .optional(),

  // Filtro per stato
  stato: StatoAttivita.optional(),

  // Filtro per data apertura (range)
  data_apertura_da: z.string().datetime().optional(),
  data_apertura_a: z.string().datetime().optional(),

  // Filtro per data chiusura (range)
  data_chiusura_da: z.string().datetime().optional(),
  data_chiusura_a: z.string().datetime().optional(),

  // Filtro per modello
  modello: z.string().optional(),

  // Filtro per seriale
  seriale: z.string().optional(),

  // Filtro per tecnico
  tecnico: z.string().optional(),

  // Filtro per urgenza
  urgenza: UrgenzaAttivita.optional(),

  // Paginazione
  page: z
    .string()
    .regex(/^\d+$/)
    .transform((val) => parseInt(val))
    .optional()
    .default(1),
  limit: z
    .string()
    .regex(/^\d+$/)
    .transform((val) => Math.min(parseInt(val), 100))
    .optional()
    .default(20),

  // Ordinamento
  sort_by: z
    .enum(["id", "data_apertura_richiesta", "data_chiusura", "created_at"])
    .default("created_at"),
  sort_order: z.enum(["asc", "desc"]).default("desc"),
});

/**
 * Tipo TypeScript per i filtri di ricerca
 */
export type AttivitaFilters = z.infer<typeof AttivitaFiltersSchema>;

/**
 * Schema per la transizione di stato
 */
export const StatoTransitionSchema = z.object({
  nuovo_stato: StatoAttivita,
  data_chiusura: z.string().datetime().optional(),
  note: z.string().optional(),
});

/**
 * Tipo TypeScript per la transizione di stato
 */
export type StatoTransition = z.infer<typeof StatoTransitionSchema>;

/**
 * Interfaccia completa per un'attività dal database
 */
export interface Attivita {
  id: number;
  id_cliente: number;
  modello: string | null;
  seriale: string | null;
  codice_inventario_cliente: string | null;
  modalita_apertura_richiesta: string | null;
  data_apertura_richiesta: string | null;
  numero_preventivo: string | null;
  data_preventivo: string | null;
  numero_accettazione_preventivo: string | null;
  data_accettazione_preventivo: string | null;
  stato: string;
  data_chiusura: string | null;
  note_generali: string | null;
  created_at: string;
  updated_at: string;
  data_presa_in_carico: string | null;
  reparto: string | null;
  tecnico: string | null;
  urgenza: string | null;
}
