import { NextResponse } from "next/server";
import { fetchItchGames } from "@/lib/itch";
import { getSiteData } from "@/lib/content";

export const revalidate = 86400;

export async function GET() {
  const site = await getSiteData();
  const games = await fetchItchGames(site.profile.itchUrl);
  return NextResponse.json(games);
}
