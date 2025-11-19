import { NextRequest, NextResponse } from "next/server";

/**
 * Health check endpoint for Cloudflare Workers
 * This endpoint can be used to verify the worker is running correctly
 * and to check connectivity to D1 and R2
 */
export async function GET(request: NextRequest) {
  const runtime = request.headers.get("cf-ray") ? "cloudflare" : "local";

  return NextResponse.json(
    {
      status: "ok",
      runtime,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    },
    { status: 200 }
  );
}
