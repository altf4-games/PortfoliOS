"use client";

import { useSiteData } from "@/lib/useSiteData";
import { AppBody, Empty, Section, Skeleton } from "./ui";

export default function ExperienceApp() {
  const site = useSiteData();

  if (!site) {
    return (
      <AppBody>
        <Skeleton lines={3} />
      </AppBody>
    );
  }

  return (
    <AppBody className="space-y-7">
      <Section title="Work">
        {site.experience.length === 0 && <Empty>No experience added yet.</Empty>}
        <ol className="relative ml-2">
          <div className="absolute left-[5px] top-2 bottom-2 w-px" style={{ background: "var(--ui-border)" }} />
          {site.experience.map((e, i) => (
            <li key={e.id} className="relative pl-7 pb-5 last:pb-0">
              <span
                className="absolute left-0 top-[7px] w-[11px] h-[11px] rounded-full"
                style={{
                  background: i === 0 ? "var(--ui-accent)" : "var(--ui-faint)",
                }}
              />
              <div className="ui-card p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                  <h3 className="ui-heading text-[15px]">{e.role}</h3>
                  <span className="text-[11px] ui-faint tabular-nums">{e.period}</span>
                </div>
                <p className="text-[13px] ui-muted mt-0.5">
                  {e.org}
                  {e.location && <span className="ui-faint font-normal"> · {e.location}</span>}
                </p>
                {e.bullets && e.bullets.length > 0 && (
                  <ul className="mt-2.5 space-y-1 text-[13px] leading-relaxed list-disc pl-5 marker:text-[var(--ui-faint)]">
                    {e.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Education">
        {site.education.map((e) => (
          <div key={e.id} className="ui-card p-4">
            <h3 className="ui-heading text-[15px]">{e.degree}</h3>
            <p className="text-[13px] ui-muted mt-0.5">{e.institution}</p>
            <p className="text-[12px] ui-faint mt-1">
              {e.period}
              {e.detail ? ` · ${e.detail}` : ""}
            </p>
          </div>
        ))}
      </Section>

      <Section title="Skills">
        <div className="flex flex-wrap gap-1.5">
          {site.skills.map((s) => (
            <span key={s} className="ui-chip">
              {s}
            </span>
          ))}
        </div>
      </Section>
    </AppBody>
  );
}
