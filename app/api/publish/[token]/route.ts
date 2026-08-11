import { NextRequest, NextResponse } from "next/server";

const ORIGIN = process.env.API_ORIGIN || "http://178.88.115.213:9101";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const body = await req.text();
    const r = await fetch(`${ORIGIN}/publish/${params.token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
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
