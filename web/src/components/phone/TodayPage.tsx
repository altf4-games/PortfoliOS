"use client";

import { useAppStore, type WindowId } from "@/store/useAppStore";
import { useFetch } from "@/lib/useFetch";
import { ALBUM, TRACKS } from "@/lib/music";
import type { CodingStats, MergedPr } from "@/lib/types";

// The phone's second home page: live widgets in the same frosted style as the profile
// widget on page one. Each one opens its full app.

const CARD = "rounded-[22px] bg-[#1c1c1e]/75 backdrop-blur-xl text-white text-left overflow-hidden";

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-[11px] font-semibold uppercase tracking-wide text-white/50">{children}</div>;
}

function NowPlaying({ open }: { open: (id: WindowId) => void }) {
  const playing = useAppStore((s) => s.musicPlaying);
  const setPlaying = useAppStore((s) => s.setMusicPlaying);
  const volume = useAppStore((s) => s.volume);
  const setVolume = useAppStore((s) => s.setVolume);
  const trackIndex = useAppStore((s) => s.trackIndex);
  const setTrack = useAppStore((s) => s.setTrack);
  const track = TRACKS[trackIndex % TRACKS.length];

  return (
    <div className={`${CARD} col-span-2 p-4 flex items-center gap-4`}>
      <button onClick={() => open("music")} className="flex-1 min-w-0 text-left">
        <Label>{playing ? "Now playing" : "Music"}</Label>
        <div className="text-[17px] font-semibold mt-1 truncate">{track.title}</div>
        <div className="text-[13px] text-white/55 truncate">
          {ALBUM.artist} · {ALBUM.title}
        </div>
      </button>
      <button
        aria-label={playing ? "Pause" : "Play"}
        onClick={() => {
          if (!playing && volume === 0) setVolume(0.3);
          setPlaying(!playing);
        }}
        className="w-11 h-11 rounded-full bg-white text-black flex items-center justify-center shrink-0 active:opacity-70"
      >
        {playing ? (
          <svg viewBox="0 0 16 16" className="w-4 h-4" fill="currentColor"><path d="M4 3h3v10H4zM9 3h3v10H9z" /></svg>
        ) : (
          <svg viewBox="0 0 16 16" className="w-4 h-4 ml-0.5" fill="currentColor"><path d="M4 2.5v11l9-5.5z" /></svg>
        )}
      </button>
      <button aria-label="Next track" onClick={() => setTrack((trackIndex + 1) % TRACKS.length)} className="w-9 h-9 flex items-center justify-center shrink-0 text-white/80 active:opacity-60">
        <svg viewBox="0 0 16 16" className="w-4 h-4" fill="currentColor"><path d="M11 3h2v10h-2zM2 3v10l8-5z" /></svg>
      </button>
    </div>
  );
}

function StatsWidget({ open }: { open: (id: WindowId) => void }) {
  const { data } = useFetch<CodingStats>("/api/stats");
  const rows: [string, string][] = [
    ["LeetCode", data?.leetcode ? `${data.leetcode.total} solved` : "–"],
    ["Codeforces", data?.codeforces?.rank ? data.codeforces.rank.replace(/^\w/, (c) => c.toUpperCase()) : "Expert"],
    ["CodeChef", data?.codechef?.stars ? `${data.codechef.stars}★` : "4★"],
  ];
  return (
    <button onClick={() => open("stats")} className={`${CARD} aspect-square p-4 flex flex-col`}>
      <Label>Coding</Label>
      <div className="mt-auto space-y-1.5">
        {rows.map(([k, v]) => (
          <div key={k}>
            <div className="text-[11px] text-white/50 leading-none">{k}</div>
            <div className="text-[15px] font-semibold leading-tight">{v}</div>
          </div>
        ))}
      </div>
    </button>
  );
}

function OssWidget({ open }: { open: (id: WindowId) => void }) {
  const { data } = useFetch<MergedPr[]>("/api/github-prs");
  const latest = data?.[0];
  return (
    <button onClick={() => open("oss")} className={`${CARD} aspect-square p-4 flex flex-col`}>
      <Label>Open source</Label>
      <div className="text-[34px] font-semibold leading-none mt-2 tabular-nums">{data ? data.length : "–"}</div>
      <div className="text-[12px] text-white/55">merged PRs</div>
      {latest && (
        <div className="mt-auto">
          <div className="text-[11px] text-white/50 truncate">{latest.repo}</div>
          <div className="text-[12.5px] leading-snug line-clamp-2">{latest.title}</div>
        </div>
      )}
    </button>
  );
}

function GameWidget({ open }: { open: (id: WindowId) => void }) {
  return (
    <button onClick={() => open("games")} className={`${CARD} col-span-2 relative h-[132px]`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/games/fragments-of-fear.webp" alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-x-0 bottom-0 px-4 py-2.5 bg-black/60 backdrop-blur-md">
        <div className="text-[11px] text-white/60">Out now on Steam</div>
        <div className="text-[15px] font-semibold">Fragments of Fear</div>
      </div>
    </button>
  );
}

export default function TodayPage({ open }: { open: (id: WindowId) => void }) {
  return (
    <div className="grid grid-cols-2 gap-4 mt-2">
      <NowPlaying open={open} />
      <StatsWidget open={open} />
      <OssWidget open={open} />
      <GameWidget open={open} />
    </div>
  );
}
