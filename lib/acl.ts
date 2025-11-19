/**
 * Access Control List (ACL) utilities
 */

import { JWTPayload } from "./auth";
import { TipoRiferimentoType } from "./validators/allegati";

/**
 * Check if user can access allegato based on tipo_riferimento
 * @param user Authenticated user
 * @param tipoRiferimento Type of reference (attivita, apparecchiatura, intervento)
 * @param idRiferimento ID of the reference
 * @returns True if user has access
 */
export async function canAccessAllegato(
  user: JWTPayload,
  tipoRiferimento: TipoRiferimentoType,
  idRiferimento: number
): Promise<{ allowed: boolean; reason?: string }> {
  // Admin can access everything
  if (user.role === "admin") {
    return { allowed: true };
  }

  // For now, all authenticated users (tecnico and admin) can access
  // In production, this would query D1 to check specific permissions
  // based on the tipo_riferimento and id_riferimento

  // Example production logic:
  // if (tipoRiferimento === "attivita") {
  //   // Check if user is assigned to this attività
  //   const assigned = await checkUserAssignedToAttivita(user.userId, idRiferimento);
  //   if (!assigned) {
  //     return { allowed: false, reason: "User not assigned to this attività" };
  //   }
  // }

  return { allowed: true };
}

/**
 * Check if user can upload allegato
 * @param user Authenticated user
 * @returns True if user can upload
 */
export function canUploadAllegato(user: JWTPayload): boolean {
  // Both admin and tecnico can upload
  return user.role === "admin" || user.role === "tecnico";
}

/**
 * Check if user can delete allegato
 * @param user Authenticated user
 * @returns True if user can delete
 */
export function canDeleteAllegato(user: JWTPayload): boolean {
  // Only admin can delete
  return user.role === "admin";
}
