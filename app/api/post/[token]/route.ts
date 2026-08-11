import { NextRequest, NextResponse } from "next/server";

// Server-side proxy to the VPS backend (http). The browser only talks to this
// Vercel route over https, so there's no mixed-content block. Set the VPS base
// in Vercel env as API_ORIGIN (server-only, no NEXT_PUBLIC_ prefix).
const ORIGIN = process.env.API_ORIGIN || "http://178.88.115.213:9101";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const r = await fetch(`${ORIGIN}/api/post/${params.token}`, {
      cache: "no-store",
    });
    const data = await r.json();
    return NextResponse.json(data, { status: r.status });
  } catch {
    return NextResponse.json(
      { ok: false, error: "backend_unreachable" },
      { status: 502 }
    );
  }
}
