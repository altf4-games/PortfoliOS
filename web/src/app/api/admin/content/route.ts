import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSiteData } from "@/lib/content";
import { writeContentOverride, isKvConfigured } from "@/lib/kv";
import type { SiteData } from "@/lib/types";

// The proxy also gates /api/admin/*, but proxy is meant for redirects, not as the sole
// authorization layer, so every handler here re-checks the session itself.

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getSiteData();
  return NextResponse.json({ data, kvConfigured: isKvConfigured() });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as SiteData;

  if (!body?.profile || !Array.isArray(body.hackathons)) {
    return NextResponse.json({ error: "Malformed site data payload." }, { status: 400 });
  }

  try {
    await writeContentOverride(body);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to save.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
