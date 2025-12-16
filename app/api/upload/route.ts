import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createDatabaseClient } from "@/lib/db";

/**
 * POST /api/upload
 * Handle file uploads to R2 and save metadata to D1
 */
export const POST = withAuth(async (request, { user }) => {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const tipoRiferimento = formData.get("tipo_riferimento") as string | null;
    const idRiferimento = formData.get("id_riferimento") as string | null;
    const note = formData.get("note") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "Nessun file fornito" },
        { status: 400 }
      );
    }

    if (!tipoRiferimento || !idRiferimento) {
      return NextResponse.json(
        { error: "Dati di riferimento mancanti" },
        { status: 400 }
      );
    }

    // Validate file size (e.g., 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File troppo grande. Dimensione massima 10MB" },
        { status: 400 }
      );
    }

    const { env } = getCloudflareContext();

    // Upload to R2
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 15);
    const key = `uploads/${tipoRiferimento}/${idRiferimento}/${timestamp}-${randomSuffix}-${file.name}`;

    await env.STORAGE.put(key, file.stream(), {
      httpMetadata: {
        contentType: file.type,
      },
    });

    // Save metadata to D1
    const db = createDatabaseClient(env);
    const result = await db.query(
      `INSERT INTO allegati (
        tipo_riferimento, id_riferimento, nome_file_originale, 
        chiave_r2, mime_type, dimensione_bytes, note,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now')) RETURNING *`,
      [
        tipoRiferimento,
        parseInt(idRiferimento),
        file.name,
        key,
        file.type,
        file.size,
        note || null
      ]
    );

    return NextResponse.json({
      success: true,
      data: result[0],
      message: "File caricato con successo"
    }, { status: 201 });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        error: "Errore durante il caricamento",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
});
