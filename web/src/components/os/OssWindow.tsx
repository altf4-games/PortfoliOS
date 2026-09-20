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
              className="text-sm font-semibold text-white leading-snug hover:underline"
            >
              {repo}
            </a>
            <div className="flex flex-wrap gap-x-2 gap-y-1 mt-1.5">
              {prs.map((pr) => (
                <a
                  key={pr.url}
                  href={pr.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-cyan-300/90 hover:text-cyan-200 transition-colors"
                >
                  #{pr.number}
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
