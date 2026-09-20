"use client";

import { useSiteData } from "@/lib/useSiteData";
import { GitHubIcon, PullRequestIcon } from "./icons";

export default function OssWindow() {
  const site = useSiteData();

  if (!site) {
    return <p className="p-4 text-white/50 text-sm">Loading...</p>;
  }

  const byRepo = new Map<string, { repoUrl: string; prs: { number: string; url: string }[] }>();
  for (const c of site.oss) {
    const entry = byRepo.get(c.repo) ?? { repoUrl: c.repoUrl, prs: [] };
    entry.prs.push({ number: c.prNumber, url: c.prUrl });
    byRepo.set(c.repo, entry);
  }

  return (
    <div className="p-3 space-y-2.5">
      {Array.from(byRepo.entries()).map(([repo, { repoUrl, prs }]) => (
        <div
          key={repo}
          className="rounded-lg bg-white/5 border border-white/10 p-3 hover:bg-white/[0.08] hover:border-white/15 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="shrink-0 w-9 h-9 rounded-full border border-white/10 flex items-center justify-center bg-gradient-to-br from-cyan-400/20 to-purple-400/20 text-cyan-300">
              <GitHubIcon className="w-4.5 h-4.5" />
            </span>

            <div className="min-w-0 flex-1 flex items-center justify-between gap-2">
              <a
                href={repoUrl}
                target="_blank"
                rel="noreferrer"
                className="group/repo inline-flex items-center gap-1.5 min-w-0 text-sm font-semibold text-white hover:text-cyan-300 transition-colors"
              >
                <span className="truncate">{repo}</span>
                <span className="text-[10px] text-white/30 group-hover/repo:text-cyan-300 opacity-0 group-hover/repo:opacity-100 transition-opacity shrink-0">
                  ↗
                </span>
              </a>
              <span className="shrink-0 text-[10px] font-medium text-white/40 tabular-nums">
                {prs.length} PR{prs.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-2.5 pl-12">
            {prs.map((pr) => (
              <a
                key={pr.url}
                href={pr.url}
                target="_blank"
                rel="noreferrer"
                className="group/pr inline-flex items-center gap-1.5 rounded-full bg-cyan-400/10 hover:bg-cyan-400/20 border border-cyan-400/25 hover:border-cyan-400/60 pl-2 pr-2.5 py-1 text-[11px] font-medium text-cyan-300 hover:text-cyan-200 shadow-sm hover:shadow-cyan-400/10 hover:-translate-y-0.5 transition-all"
              >
                <PullRequestIcon className="w-3 h-3 opacity-70 group-hover/pr:opacity-100" />
                #{pr.number}
              </a>
            ))}
          </div>
        </div>
      ))}

      {site.oss.length === 0 && (
        <p className="text-white/40 text-sm text-center py-6">No open source contributions added yet.</p>
      )}
    </div>
  );
}
