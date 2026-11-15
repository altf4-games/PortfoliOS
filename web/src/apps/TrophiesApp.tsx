"use client";

import { useSiteData } from "@/lib/useSiteData";
import { TrophyIcon, MedalIcon } from "@/components/os/icons";
import { AppBody, Empty, ExtIcon, Section, Skeleton } from "./ui";

export default function TrophiesApp() {
  const site = useSiteData();
  if (!site) {
    return (
      <AppBody>
        <Skeleton lines={4} />
      </AppBody>
    );
  }

  const wins = site.hackathons.filter((h) => h.isWinner);
  const placements = site.hackathons.filter((h) => !h.isWinner);

  return (
    <AppBody className="space-y-6">
      <Section title={`Wins · ${wins.length}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {wins.map((h) => (
            <div key={h.id} className="ui-card p-4">
              <div className="flex items-start gap-3">
                <TrophyIcon className="w-5 h-5 shrink-0 mt-0.5 ui-muted" />
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm leading-snug">{h.title}</h3>
                  <p className="text-xs mt-1">{h.result}</p>
                  {h.date && <p className="text-[11px] ui-faint mt-1">{h.date}</p>}
                  {h.url && (
                    <a href={h.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[11px] ui-accent mt-1.5 hover:underline">
                      Details <ExtIcon />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        {wins.length === 0 && <Empty>No wins added yet.</Empty>}
      </Section>

      {placements.length > 0 && (
        <Section title="Placements">
          <div className="space-y-2">
            {placements.map((h) => (
              <div key={h.id} className="ui-card px-4 py-3 flex items-center gap-3">
                <MedalIcon className="w-5 h-5 ui-muted shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{h.title}</div>
                  <div className="text-xs ui-muted">{h.result}</div>
                </div>
                <span className="text-[11px] ui-faint">{h.date}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section title="Achievements">
        <ul className="ui-card">
          {site.achievements.map((a, i) => (
            <li key={a} className="px-3.5 py-2.5 text-[13px]" style={i ? { borderTop: "1px solid var(--ui-border)" } : undefined}>
              {a}
            </li>
          ))}
        </ul>
      </Section>
    </AppBody>
  );
}
