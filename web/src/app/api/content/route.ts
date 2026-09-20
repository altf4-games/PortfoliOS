import { NextResponse } from "next/server";
import { getSiteData } from "@/lib/content";

export const revalidate = 3600;

export async function GET() {
  const data = await getSiteData();
  return NextResponse.json(data);
}
