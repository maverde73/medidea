import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createDatabaseClient } from "@/lib/db";

/**
 * DELETE /api/allegati/[id]
 * Delete an attachment
 */
export const DELETE = withAuth(async (request, context) => {
  const { params, user } = context as any;
  try {
    const id = parseInt(params.id as string);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID non valido" }, { status: 400 });
    }

    const { env } = getCloudflareContext();
    const db = createDatabaseClient(env);

    // Get attachment info first
    const allegato = await db.queryFirst(
      "SELECT * FROM allegati WHERE id = ?",
      [id]
    );

    if (!allegato) {
      return NextResponse.json({ error: "Allegato non trovato" }, { status: 404 });
    }

    // Delete from R2
    await env.STORAGE.delete(allegato.chiave_r2);

    // Delete from D1
    await db.execute("DELETE FROM allegati WHERE id = ?", [id]);

    return NextResponse.json({
      success: true,
      message: "Allegato eliminato con successo"
    });

  } catch (error) {
    console.error("Error deleting attachment:", error);
    return NextResponse.json(
      {
        error: "Errore durante l'eliminazione",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
});

/**
 * GET /api/allegati/[id]
 * Download an attachment
 */
export const GET = withAuth(async (request, context) => {
  const { params, user } = context as any;
  try {
    const id = parseInt(params.id as string);
    if (isNaN(id)) {
      return NextResponse.json({ error: "ID non valido" }, { status: 400 });
    }

    const { env } = getCloudflareContext();
    const db = createDatabaseClient(env);

    const allegato = await db.queryFirst(
      "SELECT * FROM allegati WHERE id = ?",
      [id]
    );

    if (!allegato) {
      return NextResponse.json({ error: "Allegato non trovato" }, { status: 404 });
    }

    // Get from R2
    const object = await env.STORAGE.get(allegato.chiave_r2);

    if (!object) {
      return NextResponse.json({ error: "File non trovato nello storage" }, { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    headers.set("Content-Disposition", `attachment; filename="${allegato.nome_file_originale}"`);

    return new NextResponse(object.body, {
      headers,
    });

  } catch (error) {
    console.error("Error downloading attachment:", error);
    return NextResponse.json(
      {
        error: "Errore durante il download",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
});
