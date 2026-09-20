"use client";

import { useSiteData } from "@/lib/useSiteData";
import { GitHubIcon } from "./icons";

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
          className="flex items-start gap-3 rounded-lg bg-white/5 border border-white/10 p-3 hover:bg-white/[0.08] hover:border-white/15 transition-colors"
        >
          <span className="shrink-0 w-9 h-9 rounded-full border border-white/10 flex items-center justify-center bg-gradient-to-br from-cyan-400/20 to-purple-400/20 text-cyan-300">
            <GitHubIcon className="w-4.5 h-4.5" />
          </span>

          <div className="min-w-0 flex-1">
            <a
              href={repoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm font-semibold text-white underline decoration-white/30 underline-offset-2 hover:decoration-cyan-300 hover:text-cyan-300 transition-colors cursor-pointer"
            >
              {repo}
              <span className="text-[11px]">↗</span>
            </a>
            <div className="mt-1.5 space-y-1">
              {prs.map((pr) => (
                <a
                  key={pr.url}
                  href={pr.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-md bg-cyan-400/5 hover:bg-cyan-400/15 border border-cyan-400/20 hover:border-cyan-400/50 px-2.5 py-1.5 text-[12px] text-cyan-300 hover:text-cyan-200 underline decoration-cyan-300/40 hover:decoration-cyan-200 underline-offset-2 transition-colors cursor-pointer"
                >
                  <span>Pull Request #{pr.number}</span>
                  <span className="text-cyan-300/60">↗</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      ))}

      {site.oss.length === 0 && (
        <p className="text-white/40 text-sm text-center py-6">No open source contributions added yet.</p>
      )}
    </div>
  );
}
