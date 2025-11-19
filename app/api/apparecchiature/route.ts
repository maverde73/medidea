import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware";
import {
  CreateApparecchiaturaSchema,
  ApparecchiaturaFiltersSchema,
} from "@/lib/validators/apparecchiature";
import { ZodError } from "zod";

export const GET = withAuth(async (request, { user }) => {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    const filters = ApparecchiaturaFiltersSchema.parse(params);

    if (process.env.NODE_ENV === "development") {
      const mockData = [
        {
          id: 1,
          id_cliente: 1,
          modello: "Stampante HP LaserJet Pro",
          seriale: "SN123456",
          data_test_funzionali: "2025-01-10T10:00:00Z",
          data_test_elettrici: "2025-01-10T11:00:00Z",
          note: "Apparecchiatura testata e funzionante",
          created_at: "2025-01-10T10:00:00Z",
          updated_at: "2025-01-10T10:00:00Z",
        },
      ];

      let filtered = mockData;
      if (filters.id_cliente) {
        filtered = filtered.filter((a) => a.id_cliente === filters.id_cliente);
      }
      if (filters.modello) {
        filtered = filtered.filter((a) =>
          a.modello.toLowerCase().includes(filters.modello!.toLowerCase())
        );
      }

      return NextResponse.json({
        success: true,
        data: filtered,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total: filtered.length,
          total_pages: Math.ceil(filtered.length / filters.limit),
        },
      });
    }

    return NextResponse.json(
      { error: "Endpoint not fully implemented" },
      { status: 501 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Filtri non validi",
          details: error.issues.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    console.error("Error listing apparecchiature:", error);
    return NextResponse.json(
      {
        error: "Errore nel recupero delle apparecchiature",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
});

export const POST = withAuth(async (request, { user }) => {
  try {
    const body = await request.json();
    const validatedData = CreateApparecchiaturaSchema.parse(body);

    if (process.env.NODE_ENV === "development") {
      const mockApparecchiatura = {
        id: Math.floor(Math.random() * 1000) + 1,
        ...validatedData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return NextResponse.json(
        {
          success: true,
          data: mockApparecchiatura,
          message: "Apparecchiatura creata con successo (mock)",
        },
        { status: 201 }
      );
    }

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

    console.error("Error creating apparecchiatura:", error);
    return NextResponse.json(
      {
        error: "Errore nella creazione dell'apparecchiatura",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
});
