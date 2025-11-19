import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createStorageClient } from "@/lib/storage";

/**
 * File download endpoint
 * Downloads files from R2 storage by key
 * NOTE: This is a direct R2 key access. For most use cases, use /api/allegati/:id instead
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;

    if (!key) {
      return NextResponse.json(
        { error: "No file key provided" },
        { status: 400 }
      );
    }

    const { env } = getCloudflareContext();
    const storage = createStorageClient(env);

    const object = await storage.download(key);

    if (!object) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    return new NextResponse(object.body, {
      headers: {
        "Content-Type": object.httpMetadata?.contentType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${key.split("/").pop()}"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Download failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
