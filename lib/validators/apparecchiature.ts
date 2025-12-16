/**
 * Validation schemas for apparecchiature endpoints
 */

import { z } from "zod";

/**
 * Schema for creating apparecchiatura
 */
export const CreateApparecchiaturaSchema = z.object({
  id_cliente: z.number().int().positive(),
  id_modello: z.number().int().positive("Modello obbligatorio"),
  seriale: z.string().optional(),
  data_test_funzionali: z.string().datetime().optional(),
  data_test_elettrici: z.string().datetime().optional(),
  note: z.string().optional(),
});

/**
 * Schema for updating apparecchiatura
 */
export const UpdateApparecchiaturaSchema = z.object({
  id_cliente: z.number().int().positive().optional(),
  id_modello: z.number().int().positive().optional(),
  seriale: z.string().optional(),
  data_test_funzionali: z.string().datetime().optional(),
  data_test_elettrici: z.string().datetime().optional(),
  note: z.string().optional(),
});

/**
 * Schema for filters
 */
export const ApparecchiaturaFiltersSchema = z.object({
  id_cliente: z
    .string()
    .regex(/^\d+$/)
    .transform((val) => parseInt(val))
    .optional(),
  modello: z.string().optional(),
  seriale: z.string().optional(),
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
  sort_by: z
    .enum(["id", "modello", "seriale", "created_at"])
    .default("created_at"),
  sort_order: z.enum(["asc", "desc"]).default("desc"),
});

export type CreateApparecchiaturaInput = z.infer<typeof CreateApparecchiaturaSchema>;
export type UpdateApparecchiaturaInput = z.infer<typeof UpdateApparecchiaturaSchema>;
export type ApparecchiaturaFilters = z.infer<typeof ApparecchiaturaFiltersSchema>;

export interface Apparecchiatura {
  id: number;
  id_cliente: number;
  modello: string;
  seriale: string | null;
  data_test_funzionali: string | null;
  data_test_elettrici: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}
