/**
 * Business logic for attività state transitions
 */

import { StatoAttivitaType } from "./validators/attivita";

/**
 * State transition rules based on PRD
 */
export interface StateTransitionRule {
  from: StatoAttivitaType;
  to: StatoAttivitaType;
  allowed: boolean;
  requiresDataChiusura: boolean;
  description: string;
}

/**
 * State transition matrix
 */
export const STATE_TRANSITIONS: StateTransitionRule[] = [
  // APERTO -> CHIUSO
  {
    from: "APERTO",
    to: "CHIUSO",
    allowed: true,
    requiresDataChiusura: true,
    description: "Chiusura normale di un'attività aperta",
  },
  // CHIUSO -> RIAPERTO
  {
    from: "CHIUSO",
    to: "RIAPERTO",
    allowed: true,
    requiresDataChiusura: false,
    description: "Riapertura di un'attività chiusa",
  },
  // RIAPERTO -> CHIUSO
  {
    from: "RIAPERTO",
    to: "CHIUSO",
    allowed: true,
    requiresDataChiusura: true,
    description: "Chiusura di un'attività riaperta",
  },
  // Same state (no change)
  {
    from: "APERTO",
    to: "APERTO",
    allowed: false,
    requiresDataChiusura: false,
    description: "Nessun cambiamento di stato",
  },
  {
    from: "CHIUSO",
    to: "CHIUSO",
    allowed: false,
    requiresDataChiusura: false,
    description: "Nessun cambiamento di stato",
  },
  {
    from: "RIAPERTO",
    to: "RIAPERTO",
    allowed: false,
    requiresDataChiusura: false,
    description: "Nessun cambiamento di stato",
  },
  // Invalid transitions
  {
    from: "APERTO",
    to: "RIAPERTO",
    allowed: false,
    requiresDataChiusura: false,
    description: "Non si può riaprire un'attività già aperta",
  },
  {
    from: "CHIUSO",
    to: "APERTO",
    allowed: false,
    requiresDataChiusura: false,
    description: "Non si può passare da CHIUSO ad APERTO direttamente",
  },
  {
    from: "RIAPERTO",
    to: "APERTO",
    allowed: false,
    requiresDataChiusura: false,
    description: "Non si può passare da RIAPERTO ad APERTO",
  },
];

/**
 * Validate a state transition
 * @param currentState Current state of the attività
 * @param newState Desired new state
 * @param hasDataChiusura Whether data_chiusura is provided
 * @returns Validation result with error message if invalid
 */
export function validateStateTransition(
  currentState: StatoAttivitaType,
  newState: StatoAttivitaType,
  hasDataChiusura: boolean = false
): { valid: boolean; error?: string } {
  // Find the transition rule
  const rule = STATE_TRANSITIONS.find(
    (r) => r.from === currentState && r.to === newState
  );

  if (!rule) {
    return {
      valid: false,
      error: `Transizione di stato non definita: ${currentState} -> ${newState}`,
    };
  }

  if (!rule.allowed) {
    return {
      valid: false,
      error: `Transizione non consentita: ${rule.description}`,
    };
  }

  if (rule.requiresDataChiusura && !hasDataChiusura) {
    return {
      valid: false,
      error: `La transizione ${currentState} -> ${newState} richiede data_chiusura`,
    };
  }

  return { valid: true };
}

/**
 * Get allowed transitions for a given state
 * @param currentState Current state
 * @returns Array of allowed target states
 */
export function getAllowedTransitions(
  currentState: StatoAttivitaType
): StatoAttivitaType[] {
  return STATE_TRANSITIONS.filter(
    (r) => r.from === currentState && r.allowed
  ).map((r) => r.to);
}

/**
 * Validate role permissions for state transition
 * @param userRole User's role
 * @param transition Transition being attempted
 * @returns True if user has permission
 */
export function canUserTransitionState(
  userRole: "admin" | "tecnico",
  currentState: StatoAttivitaType,
  newState: StatoAttivitaType
): boolean {
  // Admin can do any allowed transition
  if (userRole === "admin") {
    return true;
  }

  // Tecnico can open and reopen, but only admin can close
  if (newState === "CHIUSO") {
    return false; // Only admin can close
  }

  return true; // Tecnico can do other transitions
}
