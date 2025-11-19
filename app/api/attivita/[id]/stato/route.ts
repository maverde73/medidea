import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware";
import {
  StatoTransitionSchema,
  IdParamSchema,
  StatoAttivitaType,
} from "@/lib/validators/attivita";
import {
  validateStateTransition,
  canUserTransitionState,
  getAllowedTransitions,
} from "@/lib/attivita-state";
import { ZodError } from "zod";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createDatabaseClient } from "@/lib/db";

/**
 * PUT /api/attivita/:id/stato
 * Change the state of an attività
 * Requires authentication
 */
export const PUT = withAuth<{ params: Promise<{ id: string }> }>(
  async (request, { user, params }) => {
    try {
      const { id } = await params;

      // Validate ID parameter
      const validatedParams = IdParamSchema.parse({ id });
      const attivitaId = parseInt(validatedParams.id);

      const body = await request.json();

      // Validate state transition data
      const transitionData = StatoTransitionSchema.parse(body);

      const { env } = getCloudflareContext();
      const db = createDatabaseClient(env);

      // Get current attività state
      const attivita = await db.queryFirst<{ stato: string }>(
        "SELECT stato FROM attivita WHERE id = ?",
        [attivitaId]
      );

      if (!attivita) {
        return NextResponse.json(
          { error: "Attività non trovata" },
          { status: 404 }
        );
      }

      const currentState = attivita.stato as StatoAttivitaType;

      // Validate the state transition
      const validationResult = validateStateTransition(
        currentState,
        transitionData.nuovo_stato,
        !!transitionData.data_chiusura
      );

      if (!validationResult.valid) {
        return NextResponse.json(
          { error: validationResult.error },
          { status: 400 }
        );
      }

      // Check user permissions
      if (!canUserTransitionState(user.role, currentState, transitionData.nuovo_stato)) {
        return NextResponse.json(
          {
            error: "Permessi insufficienti per questa transizione di stato",
            details: user.role === "tecnico" ? "Solo gli admin possono chiudere le attività" : undefined,
          },
          { status: 403 }
        );
      }

      // Update the state
      const updateFields = ["stato = ?"];
      const updateValues = [transitionData.nuovo_stato];

      if (transitionData.data_chiusura) {
        updateFields.push("data_chiusura = ?");
        updateValues.push(transitionData.data_chiusura);
      }

      if (transitionData.note) {
        updateFields.push("note_generali = ?");
        updateValues.push(transitionData.note);
      }

      await db.execute(
        `UPDATE attivita SET ${updateFields.join(", ")}, updated_at = datetime('now') WHERE id = ?`,
        [...updateValues, attivitaId]
      );

      // Fetch updated attività
      const updatedAttivita = await db.queryFirst(
        "SELECT * FROM attivita WHERE id = ?",
        [attivitaId]
      );

      return NextResponse.json({
        success: true,
        data: updatedAttivita,
        message: `Stato cambiato da ${currentState} a ${transitionData.nuovo_stato}`,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            error: "Dati non validi",
            details: error.issues.map((e) => ({
              field: e.path.join("."),
              message: e.message,
            })),
          },
          { status: 400 }
        );
      }

      console.error("Error changing stato:", error);
      return NextResponse.json(
        {
          error: "Errore nel cambio di stato",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  }
);

/**
 * GET /api/attivita/:id/stato
 * Get allowed state transitions for an attività
 * Requires authentication
 */
export const GET = withAuth<{ params: Promise<{ id: string }> }>(
  async (request, { user, params }) => {
    try {
      const { id } = await params;

      // Validate ID parameter
      const validatedParams = IdParamSchema.parse({ id });
      const attivitaId = parseInt(validatedParams.id);

      const { env } = getCloudflareContext();
      const db = createDatabaseClient(env);

      const attivita = await db.queryFirst<{ stato: string }>(
        "SELECT stato FROM attivita WHERE id = ?",
        [attivitaId]
      );

      if (!attivita) {
        return NextResponse.json(
          { error: "Attività non trovata" },
          { status: 404 }
        );
      }

      const currentState = attivita.stato as StatoAttivitaType;
      const allowedTransitions = getAllowedTransitions(currentState);

      const userAllowedTransitions = allowedTransitions.filter((newState) =>
        canUserTransitionState(user.role, currentState, newState)
      );

      return NextResponse.json({
        success: true,
        data: {
          id: attivitaId,
          current_state: currentState,
          allowed_transitions: userAllowedTransitions,
          user_role: user.role,
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            error: "ID non valido",
            details: error.issues.map((e) => ({
              field: e.path.join("."),
              message: e.message,
            })),
          },
          { status: 400 }
        );
      }

      console.error("Error fetching stato info:", error);
      return NextResponse.json(
        {
          error: "Errore nel recupero delle informazioni di stato",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  }
);
