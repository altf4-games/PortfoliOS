"use client";

import { useSiteData } from "@/lib/useSiteData";
import { TrophyIcon, MedalIcon } from "./icons";

export default function HackathonsWindow() {
  const site = useSiteData();

  if (!site) {
    return <p className="p-4 text-white/50 text-sm">Loading...</p>;
  }

  return (
    <div className="p-3 space-y-2.5">
      {site.hackathons.map((h) => {
        // Older saved data may predate this field; default to a win so nothing changes
        // for anyone who hasn't touched their hackathons since.
        const isWinner = h.isWinner ?? true;
        return (
          <div
            key={h.id}
            className="flex items-start gap-3 rounded-lg bg-white/5 border border-white/10 p-3 hover:bg-white/[0.08] hover:border-white/15 transition-colors"
          >
            <span
              className={`shrink-0 w-9 h-9 rounded-full border border-white/10 flex items-center justify-center ${
                isWinner
                  ? "bg-gradient-to-br from-amber-400/20 to-cyan-400/20 text-amber-300"
                  : "bg-gradient-to-br from-slate-300/20 to-blue-400/20 text-slate-300"
              }`}
            >
              {isWinner ? <TrophyIcon className="w-4.5 h-4.5" /> : <MedalIcon className="w-4.5 h-4.5" />}
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-white leading-snug">{h.title}</h3>
                <time className="shrink-0 text-[11px] text-white/40 pt-0.5">{h.date}</time>
              </div>
              <p className={`text-xs mt-1 font-medium ${isWinner ? "text-amber-300/90" : "text-slate-300/90"}`}>
                {h.result}
              </p>
              {h.url && (
                <a
                  href={h.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block mt-1.5 text-[11px] text-white/50 hover:text-white transition-colors"
                >
                  View details →
                </a>
              )}
            </div>
          </div>
        );
      })}

      {site.hackathons.length === 0 && (
        <p className="text-white/40 text-sm text-center py-6">No hackathon wins added yet.</p>
      )}
    </div>
  );
}
