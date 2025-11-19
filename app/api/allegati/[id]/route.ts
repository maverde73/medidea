import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware";
import { IdParamSchema } from "@/lib/validators/attivita";
import { ZodError } from "zod";

/**
 * GET /api/allegati/:id
 * Get allegato metadata and generate signed download URL
 * Requires authentication
 */
export const GET = withAuth<{ params: Promise<{ id: string }> }>(
  async (request, { user, params }) => {
    try {
      const { id } = await params;

      // Validate ID parameter
      const validatedParams = IdParamSchema.parse({ id });
      const allegatoId = parseInt(validatedParams.id);

      // In development mode, return mock response
      if (process.env.NODE_ENV === "development") {
        const mockAllegato = {
          id: allegatoId,
          tipo_riferimento: "attivita",
          id_riferimento: 1,
          nome_file_originale: "documento_test.pdf",
          chiave_r2: "attivita/1/1234567890-abc123.pdf",
          mime_type: "application/pdf",
          dimensione_bytes: 524288,
          data_caricamento: "2025-01-15T10:00:00Z",
          note: "Documento di test",
          created_at: "2025-01-15T10:00:00Z",
          updated_at: "2025-01-15T10:00:00Z",
        };

        // Generate mock signed URL (valid for 1 hour)
        const expiresAt = new Date(Date.now() + 3600000).toISOString();
        const mockSignedUrl = `https://storage.example.com/${mockAllegato.chiave_r2}?expires=${expiresAt}&signature=mock-signature`;

        return NextResponse.json({
          success: true,
          data: {
            allegato: mockAllegato,
            download_url: mockSignedUrl,
            expires_at: expiresAt,
          },
        });
      }

      // Production code would query D1 and generate signed R2 URL
      // const env = process.env as unknown as Env;
      // const db = new DatabaseClient(env.DB);
      // const storage = new StorageClient(env.STORAGE);
      //
      // // Get allegato metadata from D1
      // const allegato = await db.queryFirst(
      //   "SELECT * FROM allegati WHERE id = ?",
      //   [allegatoId]
      // );
      //
      // if (!allegato) {
      //   return NextResponse.json(
      //     { error: "Allegato non trovato" },
      //     { status: 404 }
      //   );
      // }
      //
      // // TODO: Check ACL based on tipo_riferimento and user permissions
      // // For now, all authenticated users can download
      //
      // // Generate signed URL (valid for 1 hour)
      // const signedUrl = await storage.getSignedUrl(allegato.chiave_r2, {
      //   expiresIn: 3600, // 1 hour
      // });
      //
      // const expiresAt = new Date(Date.now() + 3600000).toISOString();
      //
      // return NextResponse.json({
      //   success: true,
      //   data: {
      //     allegato,
      //     download_url: signedUrl,
      //     expires_at: expiresAt,
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

      console.error("Error fetching allegato:", error);
      return NextResponse.json(
        {
          error: "Errore nel recupero dell'allegato",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  }
);

/**
 * DELETE /api/allegati/:id
 * Delete allegato from R2 and D1
 * Requires authentication (admin only)
 */
export const DELETE = withAuth<{ params: Promise<{ id: string }> }>(
  async (request, { user, params }) => {
    try {
      const { id } = await params;

      // Only admins can delete
      if (user.role !== "admin") {
        return NextResponse.json(
          { error: "Solo gli admin possono eliminare allegati" },
          { status: 403 }
        );
      }

      // Validate ID parameter
      const validatedParams = IdParamSchema.parse({ id });
      const allegatoId = parseInt(validatedParams.id);

      // In development mode, return mock response
      if (process.env.NODE_ENV === "development") {
        return NextResponse.json({
          success: true,
          message: "Allegato eliminato con successo (mock)",
        });
      }

      // Production code would delete from R2 and D1
      // const env = process.env as unknown as Env;
      // const db = new DatabaseClient(env.DB);
      // const storage = new StorageClient(env.STORAGE);
      //
      // // Get allegato to get R2 key
      // const allegato = await db.queryFirst(
      //   "SELECT chiave_r2 FROM allegati WHERE id = ?",
      //   [allegatoId]
      // );
      //
      // if (!allegato) {
      //   return NextResponse.json(
      //     { error: "Allegato non trovato" },
      //     { status: 404 }
      //   );
      // }
      //
      // // Delete from R2
      // await storage.delete(allegato.chiave_r2);
      //
      // // Delete from D1
      // await db.execute("DELETE FROM allegati WHERE id = ?", [allegatoId]);
      //
      // return NextResponse.json({
      //   success: true,
      //   message: "Allegato eliminato con successo",
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

      console.error("Error deleting allegato:", error);
      return NextResponse.json(
        {
          error: "Errore nell'eliminazione dell'allegato",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  },
  { requiredRole: "admin" }
);
