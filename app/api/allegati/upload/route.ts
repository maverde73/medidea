import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware";
import {
  UploadAllegatoSchema,
  isPDF,
  isValidFileSize,
  generateR2Key,
} from "@/lib/validators/allegati";
import { ZodError } from "zod";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createDatabaseClient } from "@/lib/db";
import { createStorageClient } from "@/lib/storage";

/**
 * POST /api/allegati/upload
 * Upload a PDF file to R2 and save metadata to D1
 * Requires authentication
 */
export const POST = withAuth(async (request, { user }) => {
  try {
    const formData = await request.formData();

    // Get file from form data
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json(
        { error: "Nessun file fornito" },
        { status: 400 }
      );
    }

    // Get and validate metadata
    const tipo_riferimento = formData.get("tipo_riferimento") as string;
    const id_riferimento = parseInt(formData.get("id_riferimento") as string);
    const note = formData.get("note") as string | null;

    const validatedData = UploadAllegatoSchema.parse({
      tipo_riferimento,
      id_riferimento,
      note: note || undefined,
    });

    // Validate file is PDF
    if (!isPDF(file.type, file.name)) {
      return NextResponse.json(
        { error: "Solo file PDF sono permessi" },
        { status: 400 }
      );
    }

    // Validate file size
    if (!isValidFileSize(file.size)) {
      return NextResponse.json(
        { error: "File troppo grande (max 10MB)" },
        { status: 400 }
      );
    }

    // Generate unique R2 key
    const r2Key = generateR2Key(
      validatedData.tipo_riferimento,
      validatedData.id_riferimento,
      file.name
    );

    const { env } = getCloudflareContext();
    const storage = createStorageClient(env);
    const db = createDatabaseClient(env);

    // Upload file to R2
    const fileBuffer = await file.arrayBuffer();
    await storage.upload(r2Key, fileBuffer, {
      contentType: file.type,
      customMetadata: {
        originalName: file.name,
        uploadedBy: user.email,
        tipo_riferimento: validatedData.tipo_riferimento,
        id_riferimento: validatedData.id_riferimento.toString(),
      },
    });

    // Save metadata to D1
    const result = await db.execute(
      `INSERT INTO allegati (
        tipo_riferimento, id_riferimento, nome_file_originale,
        chiave_r2, mime_type, dimensione_bytes, note, data_caricamento, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), datetime('now'))`,
      [
        validatedData.tipo_riferimento,
        validatedData.id_riferimento,
        file.name,
        r2Key,
        file.type,
        file.size,
        validatedData.note || null,
      ]
    );

    // Fetch the created allegato
    const allegato = await db.queryFirst(
      "SELECT * FROM allegati WHERE id = ?",
      [result.meta.last_row_id]
    );

    return NextResponse.json(
      {
        success: true,
        data: allegato,
        message: "File caricato con successo",
      },
      { status: 201 }
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

    console.error("Error uploading file:", error);
    return NextResponse.json(
      {
        error: "Errore durante l'upload del file",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
});
