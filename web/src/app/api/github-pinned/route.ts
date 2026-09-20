import { NextResponse } from "next/server";
import { fetchPinnedRepos } from "@/lib/github";
import { getSiteData } from "@/lib/content";

export const revalidate = 3600;

export async function GET() {
  const site = await getSiteData();
  const repos = await fetchPinnedRepos(site.profile.githubUsername);
  const included = site.projectOverrides.included;

  // An empty include list means "show everything GitHub has pinned"; once populated,
  // it acts as an allowlist rather than a list of names to hide.
  const filtered = included.length === 0 ? repos : repos.filter((r) => included.includes(r.name));
  const combined = [...filtered, ...site.projectOverrides.custom.map((c) => ({
    name: c.name,
    description: c.description,
    html_url: c.html_url,
    language: c.language ?? null,
    stargazers_count: 0,
    forks_count: 0,
    updated_at: new Date().toISOString(),
    fork: false,
    homepage: c.homepage ?? null,
    pinned: true,
  }))];

  return NextResponse.json(combined);
}
