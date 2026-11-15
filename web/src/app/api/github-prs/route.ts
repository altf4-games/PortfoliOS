import { NextResponse } from "next/server";
import { fetchMergedPrs } from "@/lib/github";
import { getSiteData } from "@/lib/content";
import type { MergedPr } from "@/lib/types";

export const revalidate = 3600;

export async function GET() {
  const site = await getSiteData();
  const auto = await fetchMergedPrs(site.profile.githubUsername);

  const hidden = new Set(site.ossHidden.map((u) => u.toLowerCase()));
  const excluded = new Set(site.ossExcludedRepos.map((r) => r.toLowerCase()));
  const seen = new Set<string>();
  const prs: MergedPr[] = [];

  for (const pr of auto) {
    const key = pr.url.toLowerCase();
    if (hidden.has(key) || excluded.has(pr.repo.toLowerCase()) || seen.has(key)) continue;
    seen.add(key);
    prs.push(pr);
  }

  // Manual entries are only for PRs GitHub search misses; skip any it already found.
  for (const c of site.oss) {
    const key = c.prUrl.toLowerCase();
    if (seen.has(key) || hidden.has(key)) continue;
    seen.add(key);
    prs.push({
      repo: c.repo,
      repoUrl: c.repoUrl,
      repoStars: null,
      ownerAvatar: `https://github.com/${c.repo.split("/")[0]}.png?size=64`,
      number: Number(c.prNumber),
      title: `#${c.prNumber}`,
      url: c.prUrl,
      mergedAt: null,
      additions: null,
      deletions: null,
    });
  }

  return NextResponse.json(prs);
}
