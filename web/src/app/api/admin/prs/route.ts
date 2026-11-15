import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getSiteData } from "@/lib/content";
import { fetchMergedPrs } from "@/lib/github";

// Unfiltered auto-fetched PR list, so the admin can choose which ones to hide.
export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const site = await getSiteData();
  return NextResponse.json(await fetchMergedPrs(site.profile.githubUsername));
}
