import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware";

/**
 * GET /api/clienti
 * List all clienti
 * Requires authentication
 */
export const GET = withAuth(async (request, { user }) => {
  try {
    // In development mode, return mock response
    if (process.env.NODE_ENV === "development") {
      const mockClienti = [
        {
          id: 1,
          nome: "Cliente Test 1",
          indirizzo: "Via Roma 123, Milano",
          contatti: "email: test1@example.com\ntel: 02-1234567",
          created_at: "2025-01-10T10:00:00Z",
          updated_at: "2025-01-10T10:00:00Z",
        },
        {
          id: 2,
          nome: "Cliente Test 2",
          indirizzo: "Corso Italia 45, Torino",
          contatti: "email: test2@example.com",
          created_at: "2025-01-12T14:30:00Z",
          updated_at: "2025-01-12T14:30:00Z",
        },
      ];

      return NextResponse.json({
        success: true,
        data: mockClienti,
      });
    }

    // Production code would query database here
    return NextResponse.json(
      { error: "Endpoint not fully implemented" },
      { status: 501 }
    );
  } catch (error) {
    console.error("Error listing clienti:", error);
    return NextResponse.json(
      {
        error: "Errore nel recupero dei clienti",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
});

/**
 * POST /api/clienti
 * Create a new cliente
 * Requires authentication
 */
export const POST = withAuth(async (request, { user }) => {
  try {
    const body = await request.json() as {
      nome?: string;
      indirizzo?: string;
      contatti?: string;
    };

    if (!body.nome || body.nome.trim() === "") {
      return NextResponse.json(
        { error: "Nome obbligatorio" },
        { status: 400 }
      );
    }

    // In development mode, return mock response
    if (process.env.NODE_ENV === "development") {
      const mockCliente = {
        id: Math.floor(Math.random() * 1000) + 3,
        nome: body.nome,
        indirizzo: body.indirizzo || null,
        contatti: body.contatti || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return NextResponse.json(
        {
          success: true,
          data: mockCliente,
          message: "Cliente creato con successo",
        },
        { status: 201 }
      );
    }

    // Production code would query database here
    return NextResponse.json(
      { error: "Endpoint not fully implemented" },
      { status: 501 }
    );
  } catch (error) {
    console.error("Error creating cliente:", error);
    return NextResponse.json(
      {
        error: "Errore nella creazione del cliente",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
});
