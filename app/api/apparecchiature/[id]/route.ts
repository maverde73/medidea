import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware";
import { IdParamSchema } from "@/lib/validators/attivita";
import { UpdateApparecchiaturaSchema } from "@/lib/validators/apparecchiature";
import { ZodError } from "zod";

export const GET = withAuth<{ params: Promise<{ id: string }> }>(
  async (request, { user, params }) => {
    try {
      const { id } = await params;
      const validatedParams = IdParamSchema.parse({ id });
      const apparecchiaturaId = parseInt(validatedParams.id);

      if (process.env.NODE_ENV === "development") {
        const mockData = {
          id: apparecchiaturaId,
          id_cliente: 1,
          modello: "Stampante HP LaserJet Pro",
          seriale: "SN123456",
          data_test_funzionali: "2025-01-10T10:00:00Z",
          data_test_elettrici: "2025-01-10T11:00:00Z",
          note: "Apparecchiatura testata e funzionante",
          created_at: "2025-01-10T10:00:00Z",
          updated_at: "2025-01-10T10:00:00Z",
        };

        return NextResponse.json({
          success: true,
          data: mockData,
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
            error: "ID non valido",
            details: error.issues.map((e) => ({
              field: e.path.join("."),
              message: e.message,
            })),
          },
          { status: 400 }
        );
      }

      console.error("Error fetching apparecchiatura:", error);
      return NextResponse.json(
        {
          error: "Errore nel recupero dell'apparecchiatura",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  }
);

export const PATCH = withAuth<{ params: Promise<{ id: string }> }>(
  async (request, { user, params }) => {
    try {
      const { id } = await params;
      const validatedParams = IdParamSchema.parse({ id });
      const apparecchiaturaId = parseInt(validatedParams.id);

      const body = await request.json();
      const validatedData = UpdateApparecchiaturaSchema.parse(body);

      if (Object.keys(validatedData).length === 0) {
        return NextResponse.json(
          { error: "Nessun campo da aggiornare" },
          { status: 400 }
        );
      }

      if (process.env.NODE_ENV === "development") {
        const mockUpdated = {
          id: apparecchiaturaId,
          id_cliente: 1,
          modello: "Stampante HP LaserJet Pro",
          ...validatedData,
          updated_at: new Date().toISOString(),
        };

        return NextResponse.json({
          success: true,
          data: mockUpdated,
          message: "Apparecchiatura aggiornata con successo (mock)",
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
            error: "Dati non validi",
            details: error.issues.map((e) => ({
              field: e.path.join("."),
              message: e.message,
            })),
          },
          { status: 400 }
        );
      }

      console.error("Error updating apparecchiatura:", error);
      return NextResponse.json(
        {
          error: "Errore nell'aggiornamento dell'apparecchiatura",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  }
);
