"use client";

import { useSiteData } from "@/lib/useSiteData";
import { BriefcaseIcon } from "./icons";

export default function ExperienceWindow() {
  const site = useSiteData();

  if (!site) {
    return <p className="p-4 text-white/50 text-sm">Loading...</p>;
  }

  return (
    <div className="p-3 space-y-2.5">
      {site.experience.map((e) => (
        <div
          key={e.id}
          className="flex items-start gap-3 rounded-lg bg-white/5 border border-white/10 p-3 hover:bg-white/[0.08] hover:border-white/15 transition-colors"
        >
          <span className="shrink-0 w-9 h-9 rounded-full border border-white/10 flex items-center justify-center bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 text-emerald-300">
            <BriefcaseIcon className="w-4.5 h-4.5" />
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold text-white leading-snug">{e.role}</h3>
              <span className="shrink-0 text-[11px] text-white/40 pt-0.5">{e.period}</span>
            </div>
            <p className="text-xs mt-1 font-medium text-emerald-300/90">{e.org}</p>
          </div>
        </div>
      ))}

      {site.experience.length === 0 && (
        <p className="text-white/40 text-sm text-center py-6">No experience added yet.</p>
      )}
    </div>
  );
}
