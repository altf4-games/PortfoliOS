"use client";

import { useSiteData } from "@/lib/useSiteData";
import { useFetch } from "@/lib/useFetch";
import type { GithubRepo } from "@/lib/types";
import { AppBody, Empty, ExtIcon, LANG_COLORS, Section, Skeleton, StarIcon } from "./ui";

export default function ProjectsApp() {
  const site = useSiteData();
  const { data: repos, error } = useFetch<GithubRepo[]>("/api/github-pinned");

  return (
    <AppBody className="space-y-7">
      <Section title="Featured">
        {!site && <Skeleton lines={2} />}
        <div className="grid gap-3">
          {site?.caseStudies.map((c) => (
            <article key={c.id} className="ui-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="ui-heading text-[16px] leading-tight">{c.name}</h3>
                  <p className="ui-muted text-[13px] mt-0.5">{c.tagline}</p>
                </div>
                {c.award && <span className="text-[12px] ui-muted">{c.award}</span>}
              </div>
              <ul className="mt-3 space-y-1 text-[13px] leading-relaxed list-disc pl-5 marker:text-[var(--ui-faint)]">
                {c.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
              <div className="flex flex-wrap items-center gap-1.5 mt-3">
                {c.tech.map((t) => (
                  <span key={t} className="ui-chip">
                    {t}
                  </span>
                ))}
                {(c.url || c.repoUrl) && (
                  <a href={c.url || c.repoUrl} target="_blank" rel="noreferrer" className="ml-auto text-xs ui-accent inline-flex items-center gap-1 hover:underline">
                    Open <ExtIcon />
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      </Section>

      <Section title="Pinned on GitHub" right={site && <a className="text-xs ui-accent hover:underline" href={site.profile.githubUrl} target="_blank" rel="noreferrer">All repos →</a>}>
        {!repos && !error && <Skeleton lines={3} />}
        {repos?.length === 0 && <Empty>No pinned repositories.</Empty>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {repos?.map((repo) => (
            <a key={repo.html_url} href={repo.html_url} target="_blank" rel="noreferrer" className="ui-card block p-3.5 group">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-semibold text-sm truncate group-hover:underline">{repo.name}</h4>
                <ExtIcon className="w-3 h-3 ui-faint shrink-0" />
              </div>
              <p className="ui-muted text-xs mt-1.5 line-clamp-2 min-h-[2.5em]">{repo.description || "No description"}</p>
              <div className="flex items-center gap-3 mt-2.5 text-[11px] ui-faint">
                {repo.language && (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: LANG_COLORS[repo.language] ?? "#888" }} />
                    {repo.language}
                  </span>
                )}
                <span className="inline-flex items-center gap-1">
                  <StarIcon /> {repo.stargazers_count}
                </span>
                {repo.homepage && <span className="ui-accent">live</span>}
              </div>
            </a>
          ))}
        </div>
      </Section>
    </AppBody>
  );
}
