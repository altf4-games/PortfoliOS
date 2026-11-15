import { NextResponse } from "next/server";
import { getSiteData } from "@/lib/content";
import { fetchGithubStats } from "@/lib/github";
import { fetchCodechef, fetchCodeforces, fetchLeetcode } from "@/lib/stats";
import type { CodingStats } from "@/lib/types";

export const revalidate = 3600;

export async function GET() {
  const { profile } = await getSiteData();
  const [github, leetcode, codechef, codeforces] = await Promise.all([
    fetchGithubStats(profile.githubUsername),
    fetchLeetcode(profile.leetcodeUsername),
    fetchCodechef(profile.codechefUsername),
    fetchCodeforces(profile.codeforcesUsername),
  ]);
  const stats: CodingStats = { github, leetcode, codechef, codeforces };
  return NextResponse.json(stats);
}
