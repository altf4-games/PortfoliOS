"use client";

import { useEffect, useState } from "react";
import type { GithubRepo } from "@/lib/types";

export default function ProjectsWindow() {
  const [repos, setRepos] = useState<GithubRepo[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/github-pinned")
      .then((r) => r.json())
      .then((d: GithubRepo[]) => {
        if (!cancelled) setRepos(d);
      })
      .catch(() => setRepos([]));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-white">
      {!repos && <p className="text-white/50 text-sm col-span-2">Loading pinned projects...</p>}
      {repos?.length === 0 && <p className="text-white/50 text-sm col-span-2">No projects found.</p>}
      {repos?.map((repo) => (
        <a
          key={repo.name}
          href={repo.html_url}
          target="_blank"
          rel="noreferrer"
          className="block rounded-md border border-white/10 bg-white/5 hover:bg-white/10 transition-colors p-3"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm truncate">{repo.name}</h3>
            {repo.language && (
              <span className="text-[10px] uppercase tracking-wide text-cyan-300/80">{repo.language}</span>
            )}
          </div>
          <p className="text-xs text-white/60 mt-1 line-clamp-2">{repo.description || "No description"}</p>
          <div className="flex gap-3 mt-2 text-[11px] text-white/40">
            <span>★ {repo.stargazers_count}</span>
            <span>⑂ {repo.forks_count}</span>
          </div>
        </a>
      ))}
    </div>
  );
}
