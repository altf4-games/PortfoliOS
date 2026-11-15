"use client";

import { useState } from "react";
import { useAppStore, type ThemeId, type WindowId } from "@/store/useAppStore";
import { AppIcon } from "@/apps/AppIcon";

export interface DesktopShortcut {
  label: string;
  app: WindowId;
}

const SHORTCUTS: Record<ThemeId, DesktopShortcut[]> = {
  golden: [
    { label: "Resume.pdf", app: "resume" },
    { label: "About Me", app: "about" },
    { label: "Projects", app: "projects" },
    { label: "Games", app: "games" },
    { label: "Terminal", app: "terminal" },
  ],
  retro: [
    { label: "My Computer", app: "files" },
    { label: "About Me", app: "about" },
    { label: "Projects", app: "projects" },
    { label: "Resume.doc", app: "resume" },
    { label: "Experience", app: "experience" },
    { label: "Games", app: "games" },
    { label: "Command Prompt", app: "terminal" },
    { label: "Stacker", app: "arcade" },
  ],
  hypr: [],
};

// Click selects, double-click opens; matches both macOS and 98 conventions.
export default function DesktopIcons({ side }: { side: "left" | "right" }) {
  const theme = useAppStore((s) => s.theme);
  const openWindow = useAppStore((s) => s.openWindow);
  const [selected, setSelected] = useState<string | null>(null);
  const retro = theme === "retro";

  return (
    <div
      className={`absolute z-[1] flex flex-col flex-wrap gap-1 ${side === "right" ? "right-3 items-end" : "left-2 items-start"}`}
      style={{ top: retro ? 8 : 42, bottom: retro ? 44 : 100 }}
      onPointerDown={(e) => e.target === e.currentTarget && setSelected(null)}
    >
      {SHORTCUTS[theme].map((s) => {
        const sel = selected === s.label;
        return (
          <button
            key={s.label}
            onClick={() => setSelected(s.label)}
            onDoubleClick={() => {
              setSelected(null);
              openWindow(s.app);
            }}
            className={`flex flex-col items-center gap-1 p-1.5 w-[84px] ${retro ? "" : "rounded-lg"}`}
            style={sel && !retro ? { background: "rgba(255,255,255,.14)" } : undefined}
          >
            <span className={`flex items-center justify-center ${retro ? "w-9 h-9" : "w-14 h-14"}`} style={sel && retro ? { filter: "url(#retro-select)" } : undefined}>
              <AppIcon id={s.app} className={retro ? "w-8 h-8" : "w-[54px] h-[54px]"} />
            </span>
            <span
              className={`text-[12px] leading-tight px-1 text-center ${retro ? "" : "rounded font-medium"}`}
              style={
                retro
                  ? { color: "#fff", background: sel ? "#000080" : "transparent", outline: sel ? "1px dotted #fff" : "none", fontFamily: "var(--font-pixelify)" }
                  : { color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,.8)", background: sel ? "#0a62d6" : "transparent" }
              }
            >
              {s.label}
            </span>
          </button>
        );
      })}
      {retro && (
        <svg width="0" height="0" className="absolute">
          <filter id="retro-select">
            <feColorMatrix type="matrix" values="0.5 0 0 0 0  0 0.5 0 0 0  0 0 0.5 0 0.5  0 0 0 1 0" />
          </filter>
        </svg>
      )}
    </div>
  );
}
