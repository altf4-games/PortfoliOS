"use client";

import { motion } from "motion/react";
import { TRACKS } from "@/lib/music";
import { useAppStore, type ThemeId } from "@/store/useAppStore";
import { WALLPAPERS, DEFAULT_WALLPAPER } from "@/lib/wallpapers";

function Tile({ children, className = "", onClick, active }: { children: React.ReactNode; className?: string; onClick?: () => void; active?: boolean }) {
  return (
    <button onClick={onClick} className={`glass-light p-3 text-left transition-colors ${active ? "!bg-white/85 !text-black" : "text-white"} ${className}`} style={{ borderRadius: 18 }}>
      {children}
    </button>
  );
}

export default function ControlCenter() {
  const setOverlay = useAppStore((s) => s.setOverlay);
  const volume = useAppStore((s) => s.volume);
  const setVolume = useAppStore((s) => s.setVolume);
  const glass = useAppStore((s) => s.glassOpacity);
  const setGlass = useAppStore((s) => s.setGlassOpacity);
  const playing = useAppStore((s) => s.musicPlaying);
  const setPlaying = useAppStore((s) => s.setMusicPlaying);
  const trackIndex = useAppStore((s) => s.trackIndex);
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const setMode = useAppStore((s) => s.setMode);
  const disable3D = useAppStore((s) => s.disable3D);
  const wallpapers = useAppStore((s) => s.wallpapers);
  const setWallpaper = useAppStore((s) => s.setWallpaper);

  function nextWallpaper() {
    const list = WALLPAPERS[theme];
    const i = list.findIndex((w) => w.id === (wallpapers[theme] ?? DEFAULT_WALLPAPER[theme]));
    setWallpaper(theme, list[(i + 1) % list.length].id);
  }

  const themes: [ThemeId, string][] = [
    ["golden", "Golden Gate"],
    ["retro", "Retro 98"],
    ["hypr", "Hyprland"],
  ];

  return (
    <>
      <div className="absolute inset-0 z-[940]" onPointerDown={() => setOverlay(null)} />
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -6, transition: { duration: 0.12 } }}
        transition={{ type: "spring", stiffness: 520, damping: 34 }}
        className="absolute z-[960] top-[36px] right-2 w-[340px] p-3 glass grid grid-cols-2 gap-2.5"
        style={{ borderRadius: 26, transformOrigin: "top right" }}
      >
        <Tile onClick={() => setPlaying(!playing)} active={playing}>
          <div className="text-[18px] leading-5">{playing ? "❚❚" : "▶"}</div>
          <div className="text-[12px] font-semibold mt-1 truncate">{TRACKS[trackIndex % TRACKS.length].title}</div>
          <div className="text-[11px] opacity-60">{playing ? "Playing" : "Paused"}</div>
        </Tile>
        <Tile onClick={nextWallpaper}>
          <svg viewBox="0 0 20 20" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="2.5" y="4" width="15" height="12" rx="2" /><path d="m2.5 13 4-4 3 3 2-2 6 5" /></svg>
          <div className="text-[12px] font-semibold mt-1">Wallpaper</div>
          <div className="text-[11px] opacity-60">Tap for next</div>
        </Tile>

        <div className="col-span-2 glass-light p-3 text-white" style={{ borderRadius: 18 }}>
          <div className="text-[12px] font-semibold mb-2">Sound</div>
          <input type="range" min={0} max={1} step={0.01} value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="w-full accent-white" />
        </div>
        <div className="col-span-2 glass-light p-3 text-white" style={{ borderRadius: 18 }}>
          <div className="text-[12px] font-semibold mb-2">Liquid Glass</div>
          <input type="range" min={0.1} max={0.95} step={0.01} value={glass} onChange={(e) => setGlass(Number(e.target.value))} className="w-full accent-white" />
        </div>

        <div className="col-span-2 glass-light p-2 text-white grid grid-cols-3 gap-1.5" style={{ borderRadius: 18 }}>
          {themes.map(([id, name]) => (
            <button key={id} onClick={() => setTheme(id)} className={`py-2 rounded-xl text-[11px] font-semibold ${theme === id ? "bg-white text-black" : "hover:bg-white/10"}`}>
              {name}
            </button>
          ))}
        </div>
        {!disable3D && (
          <Tile
            className="col-span-2"
            onClick={() => {
              setOverlay(null);
              setMode("explore");
            }}
          >
            <div className="text-[12px] font-semibold">Explore the 3D room →</div>
            <div className="text-[11px] opacity-60">Or press Esc anytime</div>
          </Tile>
        )}
      </motion.div>
    </>
  );
}
