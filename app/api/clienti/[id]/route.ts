import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware";

/**
 * GET /api/clienti/:id
 * Get a single cliente by ID
 * Requires authentication
 */
export const GET = withAuth<{ params: Promise<{ id: string }> }>(
  async (request, { user, params }) => {
    try {
      const { id } = await params;
      const clienteId = parseInt(id);

      if (isNaN(clienteId)) {
        return NextResponse.json(
          { error: "ID non valido" },
          { status: 400 }
        );
      }

      // In development mode, return mock response
      if (process.env.NODE_ENV === "development") {
        const mockCliente = {
          id: clienteId,
          nome: `Cliente ${clienteId}`,
          indirizzo: "Via Roma 123, Milano",
          contatti: "email: test@example.com\ntel: 02-1234567",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        return NextResponse.json({
          success: true,
          data: mockCliente,
        });
      }

      // Production code would query database here
      return NextResponse.json(
        { error: "Endpoint not fully implemented" },
        { status: 501 }
      );
    } catch (error) {
      console.error("Error fetching cliente:", error);
      return NextResponse.json(
        {
          error: "Errore nel recupero del cliente",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  }
);

/**
 * PUT /api/clienti/:id
 * Update an existing cliente
 * Requires authentication
 */
export const PUT = withAuth<{ params: Promise<{ id: string }> }>(
  async (request, { user, params }) => {
    try {
      const { id } = await params;
      const clienteId = parseInt(id);

      if (isNaN(clienteId)) {
        return NextResponse.json(
          { error: "ID non valido" },
          { status: 400 }
        );
      }

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
          id: clienteId,
          nome: body.nome,
          indirizzo: body.indirizzo || null,
          contatti: body.contatti || null,
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date().toISOString(),
        };

        return NextResponse.json({
          success: true,
          data: mockCliente,
          message: "Cliente aggiornato con successo",
        });
      }

      // Production code would query database here
      return NextResponse.json(
        { error: "Endpoint not fully implemented" },
        { status: 501 }
      );
    } catch (error) {
      console.error("Error updating cliente:", error);
      return NextResponse.json(
        {
          error: "Errore nell'aggiornamento del cliente",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  }
);

/**
 * DELETE /api/clienti/:id
 * Delete a cliente
 * Requires authentication
 */
export const DELETE = withAuth<{ params: Promise<{ id: string }> }>(
  async (request, { user, params }) => {
    try {
      const { id } = await params;
      const clienteId = parseInt(id);

      if (isNaN(clienteId)) {
        return NextResponse.json(
          { error: "ID non valido" },
          { status: 400 }
        );
      }

      // In development mode, return mock response
      if (process.env.NODE_ENV === "development") {
        return NextResponse.json({
          success: true,
          message: "Cliente eliminato con successo",
        });
      }

      // Production code would query database here
      return NextResponse.json(
        { error: "Endpoint not fully implemented" },
        { status: 501 }
      );
    } catch (error) {
      console.error("Error deleting cliente:", error);
      return NextResponse.json(
        {
          error: "Errore nell'eliminazione del cliente",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  }
);
