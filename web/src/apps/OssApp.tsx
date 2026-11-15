"use client";

import { useFetch } from "@/lib/useFetch";
import type { MergedPr } from "@/lib/types";
import { PullRequestIcon } from "@/components/os/icons";
import { AppBody, Empty, ExtIcon, Skeleton, StarIcon, Stats, timeAgo } from "./ui";

function formatStars(n: number | null) {
  if (n == null) return null;
  return n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n);
}

export default function OssApp() {
  const { data: prs, error } = useFetch<MergedPr[]>("/api/github-prs");

  if (!prs) {
    return <AppBody>{error ? <Empty>Couldn&apos;t reach GitHub.</Empty> : <Skeleton lines={4} />}</AppBody>;
  }

  const byRepo = new Map<string, MergedPr[]>();
  for (const pr of prs) byRepo.set(pr.repo, [...(byRepo.get(pr.repo) ?? []), pr]);
  const orgs = new Set(prs.map((p) => p.repo.split("/")[0]));
  const lines = prs.reduce((s, p) => s + (p.additions ?? 0) + (p.deletions ?? 0), 0);
  // Biggest projects first: stars when known, otherwise PR count.
  const groups = [...byRepo.entries()].sort(
    (a, b) => (b[1][0].repoStars ?? 0) - (a[1][0].repoStars ?? 0) || b[1].length - a[1].length
  );

  return (
    <AppBody className="space-y-5">
      <Stats
        items={[
          [prs.length, "merged PRs"],
          [orgs.size, "organizations"],
          [lines ? `${(lines / 1000).toFixed(1)}k` : byRepo.size, lines ? "lines changed" : "repositories"],
        ]}
      />
      <p className="text-[11px] ui-faint -mt-2">Pulled live from GitHub · refreshed hourly</p>

      {groups.length === 0 && <Empty>No merged pull requests yet.</Empty>}

      <div className="space-y-3">
        {groups.map(([repo, list]) => {
          const head = list[0];
          return (
            <div key={repo} className="ui-card p-3.5">
              <div className="flex items-center gap-3">
                {head.ownerAvatar && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={head.ownerAvatar} alt="" width={32} height={32} className="w-8 h-8 rounded-md shrink-0" />
                )}
                <a href={head.repoUrl} target="_blank" rel="noreferrer" className="min-w-0 flex-1 group">
                  <div className="font-semibold text-sm truncate group-hover:underline">{repo}</div>
                  <div className="text-[11px] ui-faint flex items-center gap-2">
                    {head.repoStars != null && (
                      <span className="inline-flex items-center gap-1">
                        <StarIcon /> {formatStars(head.repoStars)}
                      </span>
                    )}
                    <span>
                      {list.length} PR{list.length === 1 ? "" : "s"}
                    </span>
                  </div>
                </a>
              </div>
              <ul className="mt-2.5 space-y-1">
                {list.map((pr) => (
                  <li key={pr.url}>
                    <a
                      href={pr.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2.5 px-2 py-1.5 -mx-1 rounded-md hover:bg-[var(--ui-card-hover)] group"
                    >
                      <PullRequestIcon className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-[13px] flex-1 min-w-0 truncate group-hover:underline">{pr.title}</span>
                      {pr.additions != null && (
                        <span className="text-[11px] tabular-nums shrink-0 ui-mono">
                          <span style={{ color: "#3fb950" }}>+{pr.additions}</span>{" "}
                          <span style={{ color: "#f85149" }}>−{pr.deletions}</span>
                        </span>
                      )}
                      <span className="text-[11px] ui-faint shrink-0 tabular-nums">#{pr.number}</span>
                      <span className="text-[11px] ui-faint shrink-0 w-14 text-right">{timeAgo(pr.mergedAt)}</span>
                      <ExtIcon className="w-3 h-3 ui-faint opacity-0 group-hover:opacity-100 shrink-0" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </AppBody>
  );
}
