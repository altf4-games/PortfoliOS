import { NextRequest, NextResponse } from "next/server";
import { getSiteData } from "@/lib/content";
import { writeContentOverride, isKvConfigured } from "@/lib/kv";
import type { SiteData } from "@/lib/types";

// Auth is enforced by middleware for every /api/admin/* route.

export async function GET() {
  const data = await getSiteData();
  return NextResponse.json({ data, kvConfigured: isKvConfigured() });
}

export async function PUT(req: NextRequest) {
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
