import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware";

/**
 * GET /api/utenti
 * List all utenti
 * Requires authentication
 */
export const GET = withAuth(async (request, { user }) => {
  try {
    // In development mode, return mock response
    if (process.env.NODE_ENV === "development") {
      const mockUtenti = [
        {
          id: 1,
          email: "admin@medidea.local",
          nome: "Admin",
          cognome: "User",
          role: "admin",
          active: true,
          last_login: "2025-01-19T10:30:00Z",
          created_at: "2025-01-01T00:00:00Z",
          updated_at: "2025-01-19T10:30:00Z",
        },
        {
          id: 2,
          email: "tecnico@medidea.local",
          nome: "Mario",
          cognome: "Rossi",
          role: "tecnico",
          active: true,
          last_login: "2025-01-18T15:20:00Z",
          created_at: "2025-01-05T09:00:00Z",
          updated_at: "2025-01-18T15:20:00Z",
        },
        {
          id: 3,
          email: "user@medidea.local",
          nome: "Giulia",
          cognome: "Bianchi",
          role: "user",
          active: false,
          last_login: null,
          created_at: "2025-01-10T14:00:00Z",
          updated_at: "2025-01-10T14:00:00Z",
        },
      ];

      return NextResponse.json({
        success: true,
        data: mockUtenti,
      });
    }

    // Production code would query database here
    return NextResponse.json(
      { error: "Endpoint not fully implemented" },
      { status: 501 }
    );
  } catch (error) {
    console.error("Error listing utenti:", error);
    return NextResponse.json(
      {
        error: "Errore nel recupero degli utenti",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
});

/**
 * POST /api/utenti
 * Create a new utente
 * Requires authentication (admin only)
 */
export const POST = withAuth(async (request, { user }) => {
  try {
    const body = await request.json() as {
      email?: string;
      password?: string;
      nome?: string;
      cognome?: string;
      role?: string;
      active?: boolean;
    };

    // Validate required fields
    if (!body.email || !body.email.trim()) {
      return NextResponse.json(
        { error: "Email obbligatoria" },
        { status: 400 }
      );
    }

    if (!body.password || body.password.length < 8) {
      return NextResponse.json(
        { error: "Password deve essere di almeno 8 caratteri" },
        { status: 400 }
      );
    }

    if (!body.nome || !body.nome.trim()) {
      return NextResponse.json(
        { error: "Nome obbligatorio" },
        { status: 400 }
      );
    }

    if (!body.cognome || !body.cognome.trim()) {
      return NextResponse.json(
        { error: "Cognome obbligatorio" },
        { status: 400 }
      );
    }

    const validRoles = ["admin", "user", "tecnico"];
    if (!body.role || !validRoles.includes(body.role)) {
      return NextResponse.json(
        { error: "Ruolo non valido" },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: "Email non valida" },
        { status: 400 }
      );
    }

    // In development mode, return mock response
    if (process.env.NODE_ENV === "development") {
      const mockUtente = {
        id: Math.floor(Math.random() * 1000) + 10,
        email: body.email,
        nome: body.nome,
        cognome: body.cognome,
        role: body.role,
        active: body.active !== undefined ? body.active : true,
        last_login: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return NextResponse.json(
        {
          success: true,
          data: mockUtente,
          message: "Utente creato con successo",
        },
        { status: 201 }
      );
    }

    // Production code would query database here
    // TODO: Hash password with bcrypt before storing
    return NextResponse.json(
      { error: "Endpoint not fully implemented" },
      { status: 501 }
    );
  } catch (error) {
    console.error("Error creating utente:", error);
    return NextResponse.json(
      {
        error: "Errore nella creazione dell'utente",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
});
