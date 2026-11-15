"use client";

import { useSiteData } from "@/lib/useSiteData";
import { useFetch } from "@/lib/useFetch";
import { useAppStore } from "@/store/useAppStore";
import type { MergedPr } from "@/lib/types";
import { GitHubIcon, LinkedInIcon, ItchIcon, SteamIcon } from "@/components/os/icons";
import { AppBody, Section, Skeleton, Stats } from "./ui";

export default function AboutApp() {
  const site = useSiteData();
  const prs = useFetch<MergedPr[]>("/api/github-prs").data;
  const openWindow = useAppStore((s) => s.openWindow);
  const theme = useAppStore((s) => s.theme);

  if (!site) {
    return (
      <AppBody>
        <Skeleton lines={4} />
      </AppBody>
    );
  }

  const p = site.profile;
  const edu = site.education[0];
  const links = [
    { label: "GitHub", href: p.githubUrl, icon: <GitHubIcon className="w-4 h-4" /> },
    { label: "LinkedIn", href: p.linkedinUrl, icon: <LinkedInIcon className="w-4 h-4" /> },
    { label: "itch.io", href: p.itchUrl, icon: <ItchIcon className="w-4 h-4" /> },
    { label: "Steam", href: p.steamUrl, icon: <SteamIcon className="w-4 h-4" /> },
  ].filter((l) => l.href);

  const orgs = prs ? new Set(prs.map((pr) => pr.repo.split("/")[0])).size : null;

  return (
    <AppBody className="space-y-6">
      <header className="flex items-center gap-5">
        <div className="relative shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={p.avatarUrl}
            alt={p.name}
            width={88}
            height={88}
            className={`relative w-[88px] h-[88px] object-cover ${theme === "retro" ? "bevel-in p-0.5 bg-white pixelated" : "rounded-full border border-[var(--ui-border)]"}`}
          />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl ui-heading leading-tight">{p.name}</h1>
          <p className="ui-muted text-sm mt-0.5">{p.tagline}</p>
          <p className="ui-faint text-xs mt-1">
            {p.currently}
            {p.location ? ` · ${p.location}` : ""}
          </p>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        <button className="ui-btn ui-btn-primary" onClick={() => openWindow("resume")}>
          View Resume
        </button>
        {links.map((l) => (
          <a key={l.label} className="ui-btn" href={l.href} target="_blank" rel="noreferrer">
            {l.icon}
            {l.label}
          </a>
        ))}
        {p.email && (
          <a className="ui-btn" href={`mailto:${p.email}`}>
            Email
          </a>
        )}
      </div>

      <p className="text-[14px] leading-relaxed">{p.about}</p>

      <Stats
        items={[
          [edu?.detail?.match(/[\d.]+/)?.[0] ?? "—", "CGPA"],
          [prs ? prs.length : "…", orgs ? `merged PRs, ${orgs} orgs` : "merged PRs"],
          ["200K+", "game downloads"],
          [String(site.hackathons.filter((h) => h.isWinner).length), "hackathon wins"],
        ]}
      />

      <Section title="Tech stack">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Object.entries(site.techStack).map(([k, v]) => (
            <div key={k} className="ui-card px-3 py-2">
              <div className="text-[11px] ui-faint">{k}</div>
              <div className="text-[13px] mt-0.5">{v}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Education">
        {site.education.map((e) => (
          <div key={e.id} className="ui-card px-4 py-3">
            <div className="flex justify-between gap-3">
              <div className="font-semibold text-sm">{e.degree}</div>
              {e.detail && <span className="ui-chip shrink-0">{e.detail}</span>}
            </div>
            <div className="ui-muted text-xs mt-1">
              {e.institution} · {e.period}
            </div>
          </div>
        ))}
      </Section>
    </AppBody>
  );
}
