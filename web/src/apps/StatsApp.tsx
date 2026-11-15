"use client";

import { useFetch } from "@/lib/useFetch";
import { useSiteData } from "@/lib/useSiteData";
import type { CodingStats } from "@/lib/types";
import { AppBody, Section, Skeleton, Stats } from "./ui";

function Bar({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-[12px] mb-1">
        <span className="ui-muted">{label}</span>
        <span className="tabular-nums font-medium">{value}</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--ui-card-hover)" }}>
        <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${Math.min(100, (value / Math.max(total, 1)) * 100)}%`, background: color }} />
      </div>
    </div>
  );
}

function Heatmap({ weeks }: { weeks: { days: { date: string; count: number }[] }[] }) {
  const max = Math.max(1, ...weeks.flatMap((w) => w.days.map((d) => d.count)));
  return (
    <div className="flex gap-[3px] overflow-x-auto pb-1 thin-scroll">
      {weeks.map((w, i) => (
        <div key={i} className="flex flex-col gap-[3px]">
          {w.days.map((d) => {
            const t = d.count / max;
            return (
              <div
                key={d.date}
                title={`${d.count} on ${d.date}`}
                className="w-[10px] h-[10px] rounded-[2px]"
                style={{
                  background: d.count === 0 ? "var(--ui-card-hover)" : `color-mix(in srgb, var(--ui-accent) ${Math.round(30 + t * 70)}%, transparent)`,
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default function StatsApp() {
  const { data } = useFetch<CodingStats>("/api/stats");
  const site = useSiteData();
  const p = site?.profile;

  if (!data) {
    return (
      <AppBody>
        <Skeleton lines={5} />
      </AppBody>
    );
  }

  const { github, leetcode, codechef, codeforces } = data;

  return (
    <AppBody className="space-y-6">
      {github && (
        <Section title="GitHub" right={p && <a className="text-xs ui-accent hover:underline" href={p.githubUrl} target="_blank" rel="noreferrer">@{p.githubUsername}</a>}>
          <Stats
            items={[
              [github.publicRepos, "public repos"],
              [github.totalStars, "stars earned"],
              [github.contributions?.total ?? github.followers, github.contributions ? "contributions (1y)" : "followers"],
            ]}
          />
          {github.contributions && (
            <div className="ui-card p-3">
              <Heatmap weeks={github.contributions.weeks} />
            </div>
          )}
        </Section>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {leetcode && (
          <Section title="LeetCode">
            <a href={`https://leetcode.com/u/${p?.leetcodeUsername}`} target="_blank" rel="noreferrer" className="ui-card block p-4 space-y-3">
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-3xl ui-heading tabular-nums">{leetcode.total}</div>
                  <div className="text-[11px] ui-muted">problems solved</div>
                </div>
                {leetcode.rating && (
                  <div className="text-right">
                    <div className="text-lg font-semibold tabular-nums">{leetcode.rating}</div>
                    <div className="text-[11px] ui-muted">
                      contest rating{leetcode.topPercentage ? ` · top ${leetcode.topPercentage}%` : ""}
                    </div>
                  </div>
                )}
              </div>
              <Bar label="Easy" value={leetcode.easy} total={leetcode.total} color="#00b8a3" />
              <Bar label="Medium" value={leetcode.medium} total={leetcode.total} color="#ffc01e" />
              <Bar label="Hard" value={leetcode.hard} total={leetcode.total} color="#ff375f" />
            </a>
          </Section>
        )}

        <div className="space-y-4">
          {codechef && (
            <Section title="CodeChef">
              <a href={`https://www.codechef.com/users/${p?.codechefUsername}`} target="_blank" rel="noreferrer" className="ui-card block p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl ui-heading tabular-nums">{codechef.rating ?? "—"}</div>
                    <div className="text-[11px] ui-muted">rating{codechef.highest ? ` · peak ${codechef.highest}` : ""}</div>
                  </div>
                  {codechef.stars && (
                    <div className="text-lg ui-muted">
                      {"★".repeat(codechef.stars)}
                    </div>
                  )}
                </div>
              </a>
            </Section>
          )}
          {codeforces && (
            <Section title="Codeforces">
              <a href={`https://codeforces.com/profile/${p?.codeforcesUsername}`} target="_blank" rel="noreferrer" className="ui-card block p-4">
                <div className="text-3xl ui-heading tabular-nums">{codeforces.rating ?? "—"}</div>
                <div className="text-[11px] ui-muted capitalize">
                  {codeforces.rank}
                  {codeforces.maxRating ? ` · peak ${codeforces.maxRating}` : ""}
                </div>
              </a>
            </Section>
          )}
          {!codeforces && (
            <Section title="Codeforces">
              <div className="ui-card p-4">
                <div className="text-xl ui-heading">Expert</div>
                <div className="text-[11px] ui-muted">rank</div>
              </div>
            </Section>
          )}
        </div>
      </div>
      <p className="text-[11px] ui-faint">Fetched live from each platform and cached for a few hours.</p>
    </AppBody>
  );
}
