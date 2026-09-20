"use client";

import { useSiteData } from "@/lib/useSiteData";
import { GitHubIcon, LinkedInIcon, ItchIcon, ResumeIcon, SteamIcon } from "./icons";

export default function DesktopIcons() {
  const site = useSiteData();
  if (!site) return null;

  const shortcuts = [
    { label: "Resume", href: site.profile.resumeUrl, icon: <ResumeIcon className="w-6 h-6" /> },
    { label: "GitHub", href: site.profile.githubUrl, icon: <GitHubIcon className="w-6 h-6" /> },
    { label: "LinkedIn", href: site.profile.linkedinUrl, icon: <LinkedInIcon className="w-6 h-6" /> },
    { label: "Itch.io", href: site.profile.itchUrl, icon: <ItchIcon className="w-6 h-6" /> },
    { label: "Steam", href: site.profile.steamUrl, icon: <SteamIcon className="w-6 h-6" /> },
  ];

  return (
    <div className="pointer-events-none absolute top-9 right-2 max-[900px]:top-8 flex flex-col max-[900px]:flex-row max-[900px]:flex-wrap gap-3 max-[900px]:gap-2 items-end max-[900px]:justify-end max-[900px]:w-44">
      {shortcuts.map((s) => (
        <a
          key={s.label}
          href={s.href}
          target="_blank"
          rel="noreferrer"
          className="pointer-events-auto group flex flex-col items-center gap-1 w-16 max-[900px]:w-11 text-center"
        >
          <span className="w-12 h-12 max-[900px]:w-9 max-[900px]:h-9 flex items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-white group-hover:bg-white/20 transition-colors shadow-lg">
            {s.icon}
          </span>
          <span className="text-[11px] max-[900px]:hidden text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            {s.label}
          </span>
        </a>
      ))}
    </div>
  );
}
