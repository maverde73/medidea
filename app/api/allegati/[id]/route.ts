import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware";
import { IdParamSchema } from "@/lib/validators/attivita";
import { ZodError } from "zod";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createDatabaseClient } from "@/lib/db";
import { createStorageClient } from "@/lib/storage";

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

      const { env } = getCloudflareContext();
      const db = createDatabaseClient(env);
      const storage = createStorageClient(env);

      // Get allegato metadata from D1
      const allegato = await db.queryFirst<{
        id: number;
        chiave_r2: string;
        nome_file_originale: string;
        mime_type: string;
      }>(
        "SELECT * FROM allegati WHERE id = ?",
        [allegatoId]
      );

      if (!allegato) {
        return NextResponse.json(
          { error: "Allegato non trovato" },
          { status: 404 }
        );
      }

      // Download file from R2
      const object = await storage.download(allegato.chiave_r2);

      if (!object) {
        return NextResponse.json(
          { error: "File non trovato in storage" },
          { status: 404 }
        );
      }

      // Stream the file as response
      return new NextResponse(object.body, {
        headers: {
          "Content-Type": allegato.mime_type || "application/octet-stream",
          "Content-Disposition": `attachment; filename="${allegato.nome_file_originale}"`,
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

      const { env } = getCloudflareContext();
      const db = createDatabaseClient(env);
      const storage = createStorageClient(env);

      // Get allegato to get R2 key
      const allegato = await db.queryFirst<{ chiave_r2: string }>(
        "SELECT chiave_r2 FROM allegati WHERE id = ?",
        [allegatoId]
      );

      if (!allegato) {
        return NextResponse.json(
          { error: "Allegato non trovato" },
          { status: 404 }
        );
      }

      // Delete from R2
      await storage.delete(allegato.chiave_r2);

      // Delete from D1
      await db.execute("DELETE FROM allegati WHERE id = ?", [allegatoId]);

      return NextResponse.json({
        success: true,
        message: "Allegato eliminato con successo",
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
