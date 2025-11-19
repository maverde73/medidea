import { NextRequest, NextResponse } from "next/server";

/**
 * File download endpoint
 * Downloads files from R2 storage by key
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

    // In development, return mock response
    if (process.env.NODE_ENV === "development") {
      return NextResponse.json(
        {
          message: "File download endpoint ready",
          note: "R2 storage will be available when deployed to Cloudflare",
          requestedKey: key,
        },
        { status: 200 }
      );
    }

    // Production code would download from R2 here
    // const storage = createStorageClient(env);
    // const object = await storage.download(key);
    //
    // if (!object) {
    //   return NextResponse.json({ error: "File not found" }, { status: 404 });
    // }
    //
    // return new NextResponse(object.body, {
    //   headers: {
    //     "Content-Type": object.httpMetadata?.contentType || "application/octet-stream",
    //     "Content-Disposition": `attachment; filename="${key.split("/").pop()}"`,
    //   },
    // });

    return NextResponse.json(
      { error: "Download not implemented" },
      { status: 501 }
    );
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
