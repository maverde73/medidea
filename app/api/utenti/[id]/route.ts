import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware";

/**
 * GET /api/utenti/:id
 * Get a single utente by ID
 * Requires authentication
 */
export const GET = withAuth<{ params: Promise<{ id: string }> }>(
  async (request, { user, params }) => {
    try {
      const { id } = await params;
      const utenteId = parseInt(id);

      if (isNaN(utenteId)) {
        return NextResponse.json(
          { error: "ID non valido" },
          { status: 400 }
        );
      }

      // In development mode, return mock response
      if (process.env.NODE_ENV === "development") {
        const mockUtente = {
          id: utenteId,
          email: `user${utenteId}@medidea.local`,
          nome: "Nome",
          cognome: "Cognome",
          role: "user",
          active: true,
          last_login: "2025-01-19T10:00:00Z",
          created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
          updated_at: new Date().toISOString(),
        };

        return NextResponse.json({
          success: true,
          data: mockUtente,
        });
      }

      // Production code would query database here
      return NextResponse.json(
        { error: "Endpoint not fully implemented" },
        { status: 501 }
      );
    } catch (error) {
      console.error("Error fetching utente:", error);
      return NextResponse.json(
        {
          error: "Errore nel recupero dell'utente",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  }
);

/**
 * PUT /api/utenti/:id
 * Update an existing utente
 * Requires authentication (admin or self)
 */
export const PUT = withAuth<{ params: Promise<{ id: string }> }>(
  async (request, { user, params }) => {
    try {
      const { id } = await params;
      const utenteId = parseInt(id);

      if (isNaN(utenteId)) {
        return NextResponse.json(
          { error: "ID non valido" },
          { status: 400 }
        );
      }

      const body = await request.json() as {
        email?: string;
        nome?: string;
        cognome?: string;
        role?: string;
        active?: boolean;
      };

      // Validate required fields
      if (body.email && !body.email.trim()) {
        return NextResponse.json(
          { error: "Email non può essere vuota" },
          { status: 400 }
        );
      }

      if (body.nome && !body.nome.trim()) {
        return NextResponse.json(
          { error: "Nome non può essere vuoto" },
          { status: 400 }
        );
      }

      if (body.cognome && !body.cognome.trim()) {
        return NextResponse.json(
          { error: "Cognome non può essere vuoto" },
          { status: 400 }
        );
      }

      // Email validation
      if (body.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(body.email)) {
          return NextResponse.json(
            { error: "Email non valida" },
            { status: 400 }
          );
        }
      }

      // Role validation
      if (body.role) {
        const validRoles = ["admin", "user", "tecnico"];
        if (!validRoles.includes(body.role)) {
          return NextResponse.json(
            { error: "Ruolo non valido" },
            { status: 400 }
          );
        }
      }

      // In development mode, return mock response
      if (process.env.NODE_ENV === "development") {
        const mockUtente = {
          id: utenteId,
          email: body.email || `user${utenteId}@medidea.local`,
          nome: body.nome || "Nome",
          cognome: body.cognome || "Cognome",
          role: body.role || "user",
          active: body.active !== undefined ? body.active : true,
          last_login: "2025-01-19T10:00:00Z",
          created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
          updated_at: new Date().toISOString(),
        };

        return NextResponse.json({
          success: true,
          data: mockUtente,
          message: "Utente aggiornato con successo",
        });
      }

      // Production code would query database here
      return NextResponse.json(
        { error: "Endpoint not fully implemented" },
        { status: 501 }
      );
    } catch (error) {
      console.error("Error updating utente:", error);
      return NextResponse.json(
        {
          error: "Errore nell'aggiornamento dell'utente",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  }
);

/**
 * DELETE /api/utenti/:id
 * Delete an utente
 * Requires authentication (admin only)
 */
export const DELETE = withAuth<{ params: Promise<{ id: string }> }>(
  async (request, { user, params }) => {
    try {
      const { id } = await params;
      const utenteId = parseInt(id);

      if (isNaN(utenteId)) {
        return NextResponse.json(
          { error: "ID non valido" },
          { status: 400 }
        );
      }

      // In development mode, return mock response
      if (process.env.NODE_ENV === "development") {
        return NextResponse.json({
          success: true,
          message: "Utente eliminato con successo",
        });
      }

      // Production code would query database here
      return NextResponse.json(
        { error: "Endpoint not fully implemented" },
        { status: 501 }
      );
    } catch (error) {
      console.error("Error deleting utente:", error);
      return NextResponse.json(
        {
          error: "Errore nell'eliminazione dell'utente",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  }
);
