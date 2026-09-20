"use client";

import { useSiteData } from "@/lib/useSiteData";

export default function HackathonsWindow() {
  const site = useSiteData();

  return (
    <div className="p-3 text-white">
      {!site && <p className="text-white/50 text-sm">Loading...</p>}
      <ol className="relative border-l border-white/10 ml-2 space-y-4">
        {site?.hackathons.map((h) => (
          <li key={h.id} className="ml-4">
            <div className="absolute w-2 h-2 rounded-full bg-cyan-400 -translate-x-[4.5px] mt-1.5" />
            <time className="text-[11px] text-white/40">{h.date}</time>
            <h3 className="text-sm font-semibold">{h.title}</h3>
            <p className="text-xs text-cyan-300/80">{h.result}</p>
            {h.url && (
              <a href={h.url} target="_blank" rel="noreferrer" className="text-[11px] text-white/50 underline">
                View
              </a>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
