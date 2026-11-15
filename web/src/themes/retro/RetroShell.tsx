"use client";

import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { useAppStore, type ThemeId } from "@/store/useAppStore";
import { APP_META, appName, type WindowId } from "@/apps/meta";
import { useSearch } from "@/lib/search";
import { discoverEgg } from "@/lib/eggs";
import WallpaperLayer from "@/components/os/WallpaperLayer";
import DesktopIcons from "@/components/os/DesktopIcons";
import { useClock } from "@/components/os/useClock";
import { registerLogoTap } from "@/components/os/logoTaps";
import RetroWindow from "./RetroWindow";
import { PixelIcon } from "./icons";

function StartItem({ icon, children, onClick, arrow }: { icon?: React.ReactNode; children: React.ReactNode; onClick?: () => void; arrow?: boolean }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-2.5 pl-1.5 pr-3 h-8 text-left text-[14px] hover:bg-[#000080] hover:text-white group">
      <span className="w-6 h-6 flex items-center justify-center shrink-0">{icon}</span>
      <span className="flex-1 truncate">{children}</span>
      {arrow && <span className="text-[10px]">▶</span>}
    </button>
  );
}

function StartMenu() {
  const openWindow = useAppStore((s) => s.openWindow);
  const setOverlay = useAppStore((s) => s.setOverlay);
  const setTheme = useAppStore((s) => s.setTheme);
  const setEffect = useAppStore((s) => s.setEffect);
  const setMode = useAppStore((s) => s.setMode);
  const disable3D = useAppStore((s) => s.disable3D);
  const [sub, setSub] = useState<null | "programs" | "theme" | "find">(null);
  const [q, setQ] = useState("");
  const results = useSearch(q);

  const go = (id: WindowId) => {
    setOverlay(null);
    openWindow(id);
  };
  const themes: [ThemeId, string][] = [
    ["golden", "Golden Gate"],
    ["hypr", "Hyprland"],
  ];

  return (
    <>
      <div className="absolute inset-0 z-[940]" onPointerDown={() => setOverlay(null)} />
      <div className="absolute z-[960] left-[2px] bottom-[36px] flex bevel-out p-[3px] select-none" style={{ fontFamily: "var(--font-pixelify)" }}>
        <div className="w-8 relative overflow-hidden bg-[#808080]">
          <span className="absolute bottom-2 left-1/2 origin-bottom-left -rotate-90 whitespace-nowrap text-white text-[20px] font-bold translate-x-[10px]">
            Portfoli<span className="font-normal">OS 98</span>
          </span>
        </div>
        <div className="w-56 py-0.5 relative">
          <StartItem icon={<PixelIcon id="folder" className="w-6 h-6 pixelated" />} arrow onClick={() => setSub(sub === "programs" ? null : "programs")}>
            Programs
          </StartItem>
          <StartItem icon={<PixelIcon id="resume" className="w-6 h-6 pixelated" />} onClick={() => go("resume")}>
            Documents
          </StartItem>
          <StartItem icon={<PixelIcon id="settings" className="w-6 h-6 pixelated" />} onClick={() => go("settings")}>
            Control Panel
          </StartItem>
          <StartItem icon={<PixelIcon id="link" className="w-6 h-6 pixelated" />} arrow onClick={() => setSub(sub === "find" ? null : "find")}>
            Find
          </StartItem>
          <StartItem icon={<PixelIcon id="logo" className="w-6 h-6 pixelated" />} arrow onClick={() => setSub(sub === "theme" ? null : "theme")}>
            Switch Desktop
          </StartItem>
          <StartItem icon={<PixelIcon id="terminal" className="w-6 h-6 pixelated" />} onClick={() => go("terminal")}>
            Run…
          </StartItem>
          {!disable3D && (
            <StartItem
              icon={<PixelIcon id="games" className="w-6 h-6 pixelated" />}
              onClick={() => {
                setOverlay(null);
                setMode("explore");
              }}
            >
              Explore Room
            </StartItem>
          )}
          <div className="h-[2px] my-1 mx-1 bevel-thin-in" />
          <StartItem
            icon={<PixelIcon id="files" className="w-6 h-6 pixelated" />}
            onClick={() => {
              setOverlay(null);
              setEffect("crash");
              discoverEgg("crash");
            }}
          >
            Shut Down…
          </StartItem>

          {sub && (
            <div className="absolute left-full top-0 ml-[1px] bevel-out p-[3px] w-60 max-h-[70vh] overflow-auto retro-scroll">
              {sub === "programs" &&
                APP_META.map((a) => (
                  <StartItem key={a.id} icon={<PixelIcon id={a.id} className="w-5 h-5 pixelated" />} onClick={() => go(a.id)}>
                    {appName(a.id, "retro")}
                  </StartItem>
                ))}
              {sub === "theme" &&
                themes.map(([id, name]) => (
                  <StartItem key={id} onClick={() => setTheme(id)}>
                    {name}
                  </StartItem>
                ))}
              {sub === "find" && (
                <div className="p-1.5 space-y-1">
                  <input
                    autoFocus
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && results[0]) {
                        setOverlay(null);
                        results[0].run();
                      }
                    }}
                    placeholder="Find files or apps…"
                    className="w-full bevel-in bg-white px-1.5 py-1 text-[13px] outline-none"
                  />
                  {results.slice(0, 8).map((r) => (
                    <button
                      key={r.key}
                      onClick={() => {
                        setOverlay(null);
                        r.run();
                      }}
                      className="w-full text-left px-1.5 py-1 text-[13px] hover:bg-[#000080] hover:text-white truncate"
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function Taskbar() {
  const overlay = useAppStore((s) => s.overlay);
  const toggleOverlay = useAppStore((s) => s.toggleOverlay);
  const order = useAppStore((s) => s.windowOrder);
  const windows = useAppStore((s) => s.windows);
  const focused = useAppStore((s) => s.focusedWindow);
  const openWindow = useAppStore((s) => s.openWindow);
  const minimizeWindow = useAppStore((s) => s.minimizeWindow);
  const volume = useAppStore((s) => s.volume);
  const setVolume = useAppStore((s) => s.setVolume);
  const now = useClock();
  // Taskbar buttons keep opening order, not focus order, so they don't jump around.
  const opened = APP_META.map((a) => a.id).filter((id) => order.includes(id));

  return (
    <div className="absolute bottom-0 inset-x-0 z-[950] h-[36px] bevel-out flex items-center gap-1 px-[3px] select-none" style={{ fontFamily: "var(--font-pixelify)", boxShadow: "inset 0 1px #dfdfdf, inset 0 2px #fff" }}>
      <button
        onClick={() => {
          if (!registerLogoTap()) toggleOverlay("start");
        }}
        className={`h-[28px] px-1.5 flex items-center gap-1.5 font-bold text-[15px] ${overlay === "start" ? "bevel-in" : "bevel-out"}`}
      >
        <PixelIcon id="logo" className="w-5 h-5 pixelated" />
        Start
      </button>
      <div className="w-[2px] h-[26px] bevel-thin-in mx-1" />
      <div className="flex-1 flex gap-1 min-w-0">
        {opened.map((id) => {
          const active = focused === id && !windows[id]?.minimized;
          return (
            <button
              key={id}
              onClick={() => (active ? minimizeWindow(id) : openWindow(id))}
              className={`h-[28px] w-44 min-w-0 px-1.5 flex items-center gap-1.5 text-[13px] text-left ${active ? "bevel-in font-bold" : "bevel-out"}`}
              style={active ? { background: "repeating-conic-gradient(#c0c0c0 0% 25%, #fff 0% 50%) 0 0 / 2px 2px" } : undefined}
            >
              <PixelIcon id={id} className="w-4 h-4 pixelated shrink-0" />
              <span className="truncate">{appName(id, "retro")}</span>
            </button>
          );
        })}
      </div>
      <div className="h-[28px] bevel-thin-in flex items-center gap-2 px-2.5 text-[13px]">
        <button onClick={() => setVolume(volume > 0 ? 0 : 0.3)} title={volume > 0 ? "Mute" : "Unmute"} className="leading-none">
          <svg viewBox="0 0 16 16" className="w-4 h-4" shapeRendering="crispEdges">
            <path d="M2 6h3l4-4h1v12H9l-4-4H2z" fill="#000" />
            {volume > 0 ? <path d="M12 5h1v1h1v4h-1v1h-1z" fill="#000" /> : <path d="M11 6h1v1h1V6h1v1h-1v1h1v1h-1V8h-1v1h-1V8h1V7h-1z" fill="#c00" />}
          </svg>
        </button>
        {now && <span className="tabular-nums">{now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}</span>}
      </div>
    </div>
  );
}

export default function RetroShell() {
  const windows = useAppStore((s) => s.windows);
  const overlay = useAppStore((s) => s.overlay);
  const crt = useAppStore((s) => s.crt);

  return (
    <div className="absolute inset-0 overflow-hidden text-black" style={{ fontFamily: "var(--font-pixelify)" }}>
      <WallpaperLayer />
      <DesktopIcons side="left" />
      <div className="absolute inset-0 pointer-events-none">
        <AnimatePresence>
          {APP_META.filter((a) => windows[a.id]).map((a) => (
            <RetroWindow key={a.id} id={a.id} />
          ))}
        </AnimatePresence>
      </div>
      <Taskbar />
      {overlay === "start" && <StartMenu />}
      {crt && <div className="absolute inset-0 z-[1400] pointer-events-none crt-overlay" />}
    </div>
  );
}
