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

      // In development mode, return mock response
      if (process.env.NODE_ENV === "development") {
        // Mock current state (in production, this would come from database)
        const currentState: StatoAttivitaType = "APERTO";

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
        if (
          !canUserTransitionState(
            user.role,
            currentState,
            transitionData.nuovo_stato
          )
        ) {
          return NextResponse.json(
            {
              error: "Permessi insufficienti per questa transizione di stato",
              details:
                user.role === "tecnico"
                  ? "Solo gli admin possono chiudere le attività"
                  : undefined,
            },
            { status: 403 }
          );
        }

        const mockUpdatedAttivita = {
          id: attivitaId,
          id_cliente: 1,
          modello: "Modello Test",
          seriale: "SN123456",
          codice_inventario_cliente: "INV001",
          modalita_apertura_richiesta: "Email",
          data_apertura_richiesta: "2025-01-15T10:00:00Z",
          numero_preventivo: "PREV001",
          data_preventivo: "2025-01-16T14:00:00Z",
          numero_accettazione_preventivo: "ACC001",
          data_accettazione_preventivo: "2025-01-17T09:00:00Z",
          stato: transitionData.nuovo_stato,
          data_chiusura: transitionData.data_chiusura || null,
          note_generali: transitionData.note || "Note di test",
          created_at: "2025-01-15T10:00:00Z",
          updated_at: new Date().toISOString(),
        };

        return NextResponse.json({
          success: true,
          data: mockUpdatedAttivita,
          message: `Stato cambiato da ${currentState} a ${transitionData.nuovo_stato}`,
        });
      }

      // Production code would query database here
      // const env = process.env as unknown as Env;
      // const db = new DatabaseClient(env.DB);
      //
      // // Get current attività state
      // const attivita = await db.queryFirst<{ stato: string }>(
      //   "SELECT stato FROM attivita WHERE id = ?",
      //   [attivitaId]
      // );
      //
      // if (!attivita) {
      //   return NextResponse.json(
      //     { error: "Attività non trovata" },
      //     { status: 404 }
      //   );
      // }
      //
      // const currentState = attivita.stato as StatoAttivitaType;
      //
      // // Validate the state transition
      // const validationResult = validateStateTransition(
      //   currentState,
      //   transitionData.nuovo_stato,
      //   !!transitionData.data_chiusura
      // );
      //
      // if (!validationResult.valid) {
      //   return NextResponse.json(
      //     { error: validationResult.error },
      //     { status: 400 }
      //   );
      // }
      //
      // // Check user permissions
      // if (!canUserTransitionState(user.role, currentState, transitionData.nuovo_stato)) {
      //   return NextResponse.json(
      //     {
      //       error: "Permessi insufficienti per questa transizione di stato",
      //       details: user.role === "tecnico" ? "Solo gli admin possono chiudere le attività" : undefined,
      //     },
      //     { status: 403 }
      //   );
      // }
      //
      // // Update the state
      // const updateFields = ["stato = ?"];
      // const updateValues = [transitionData.nuovo_stato];
      //
      // if (transitionData.data_chiusura) {
      //   updateFields.push("data_chiusura = ?");
      //   updateValues.push(transitionData.data_chiusura);
      // }
      //
      // if (transitionData.note) {
      //   updateFields.push("note_generali = ?");
      //   updateValues.push(transitionData.note);
      // }
      //
      // await db.execute(
      //   `UPDATE attivita SET ${updateFields.join(", ")}, updated_at = datetime('now') WHERE id = ?`,
      //   [...updateValues, attivitaId]
      // );
      //
      // // Fetch updated attività
      // const updatedAttivita = await db.queryFirst(
      //   "SELECT * FROM attivita WHERE id = ?",
      //   [attivitaId]
      // );
      //
      // return NextResponse.json({
      //   success: true,
      //   data: updatedAttivita,
      //   message: `Stato cambiato da ${currentState} a ${transitionData.nuovo_stato}`,
      // });

      return NextResponse.json(
        { error: "Endpoint not fully implemented" },
        { status: 501 }
      );
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

      // In development mode, return mock response
      if (process.env.NODE_ENV === "development") {
        const currentState: StatoAttivitaType = "APERTO";
        const allowedTransitions = getAllowedTransitions(currentState);

        // Filter by user permissions
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
      }

      // Production code would query database here
      // const env = process.env as unknown as Env;
      // const db = new DatabaseClient(env.DB);
      //
      // const attivita = await db.queryFirst<{ stato: string }>(
      //   "SELECT stato FROM attivita WHERE id = ?",
      //   [attivitaId]
      // );
      //
      // if (!attivita) {
      //   return NextResponse.json(
      //     { error: "Attività non trovata" },
      //     { status: 404 }
      //   );
      // }
      //
      // const currentState = attivita.stato as StatoAttivitaType;
      // const allowedTransitions = getAllowedTransitions(currentState);
      //
      // const userAllowedTransitions = allowedTransitions.filter((newState) =>
      //   canUserTransitionState(user.role, currentState, newState)
      // );
      //
      // return NextResponse.json({
      //   success: true,
      //   data: {
      //     id: attivitaId,
      //     current_state: currentState,
      //     allowed_transitions: userAllowedTransitions,
      //     user_role: user.role,
      //   },
      // });

      return NextResponse.json(
        { error: "Endpoint not fully implemented" },
        { status: 501 }
      );
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
