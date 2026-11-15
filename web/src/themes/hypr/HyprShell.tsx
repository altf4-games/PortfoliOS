"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useAppStore, type WindowId } from "@/store/useAppStore";
import { APP_COMPONENTS } from "@/apps/registry";
import { APP_META, appName } from "@/apps/meta";
import { useSearch } from "@/lib/search";
import { EGGS } from "@/lib/eggs";
import WallpaperLayer from "@/components/os/WallpaperLayer";
import { useClock } from "@/components/os/useClock";
import { registerLogoTap } from "@/components/os/logoTaps";
import { HyprIcon } from "./icons";
import { BridgeLogo } from "@/apps/glyphs";

const GAP_OUT = 10;
const GAP_IN = 8;
const BAR_H = 34;
const WORKSPACES = [1, 2, 3, 4, 5];

interface R {
  x: number;
  y: number;
  w: number;
  h: number;
}

// Hyprland's default "dwindle" layout: each new window splits the previous one's area
// along its longer side.
function dwindle(count: number, area: R): R[] {
  if (count === 0) return [];
  const rects: R[] = [area];
  for (let i = 1; i < count; i++) {
    const r = rects[i - 1];
    if (r.w >= r.h) {
      const w = (r.w - GAP_IN) / 2;
      rects[i - 1] = { ...r, w };
      rects[i] = { x: r.x + w + GAP_IN, y: r.y, w, h: r.h };
    } else {
      const h = (r.h - GAP_IN) / 2;
      rects[i - 1] = { ...r, h };
      rects[i] = { x: r.x, y: r.y + h + GAP_IN, w: r.w, h };
    }
  }
  return rects;
}

function useViewport() {
  const [vp, setVp] = useState({ w: 1440, h: 900 });
  useEffect(() => {
    const u = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    u();
    window.addEventListener("resize", u);
    return () => window.removeEventListener("resize", u);
  }, []);
  return vp;
}

function Waybar({ fullscreen }: { fullscreen: boolean }) {
  const active = useAppStore((s) => s.activeWorkspace);
  const setWorkspace = useAppStore((s) => s.setWorkspace);
  const windowWorkspace = useAppStore((s) => s.windowWorkspace);
  const focused = useAppStore((s) => s.focusedWindow);
  const toggleOverlay = useAppStore((s) => s.toggleOverlay);
  const volume = useAppStore((s) => s.volume);
  const setVolume = useAppStore((s) => s.setVolume);
  const playing = useAppStore((s) => s.musicPlaying);
  const eggs = useAppStore((s) => s.eggs.length);
  const now = useClock(1000);
  const [cpu, setCpu] = useState(7);
  useEffect(() => {
    const id = setInterval(() => setCpu(4 + Math.round(Math.random() * 14)), 2000);
    return () => clearInterval(id);
  }, []);

  const occupied = new Set(Object.values(windowWorkspace));
  if (fullscreen) return null;

  return (
    <div
      className="absolute z-[950] flex items-center justify-between text-[12.5px] text-[#cdd6f4] select-none"
      style={{ top: GAP_OUT, left: GAP_OUT, right: GAP_OUT, height: BAR_H, fontFamily: "var(--font-jetbrains)" }}
    >
      <div className="flex items-center h-full rounded-lg bg-[#1e1e2e] border border-[#313244] px-1">
        <button
          onClick={() => {
            if (!registerLogoTap()) toggleOverlay("launcher");
          }}
          className="px-2.5 h-full text-[#89b4fa] flex items-center"
          aria-label="Launcher"
        >
          <BridgeLogo className="w-4 h-4" />
        </button>
        {WORKSPACES.map((n) => (
          <button
            key={n}
            onClick={() => setWorkspace(n)}
            className={`mx-0.5 h-[22px] rounded-md transition-all ${n === active ? "w-8 bg-[#89b4fa] text-[#11111b] font-bold" : `w-6 ${occupied.has(n) ? "text-[#cdd6f4]" : "text-[#585b70]"} hover:bg-[#313244]`}`}
          >
            {n}
          </button>
        ))}
      </div>

      <div className="hidden md:flex items-center h-full rounded-lg bg-[#1e1e2e] border border-[#313244] px-4 text-[#a6adc8] max-w-[40vw]">
        <span className="truncate">{focused ? `${appName(focused, "hypr")} — ${APP_META.find((a) => a.id === focused)?.title.toLowerCase()}` : "desktop"}</span>
      </div>

      <div className="flex items-center h-full rounded-lg bg-[#1e1e2e] border border-[#313244] divide-x divide-[#313244]">
        {playing && <span className="px-3 text-[#f5c2e7]">♪ lo-fi</span>}
        <span className="px-3 text-[#94e2d5]">cpu {cpu}%</span>
        <span className="px-3 text-[#f9e2af]">eggs {eggs}/{EGGS.length}</span>
        <button className="px-3 text-[#fab387]" onClick={() => setVolume(volume > 0 ? 0 : 0.3)} title="Toggle volume">
          vol {Math.round(volume * 100)}%
        </button>
        <span className="px-3 text-[#89b4fa] tabular-nums">
          {now ? now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }) : "--:--"}
        </span>
      </div>
    </div>
  );
}

function Launcher() {
  const setOverlay = useAppStore((s) => s.setOverlay);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const results = useSearch(q);

  function run(i: number) {
    const r = results[i];
    if (!r) return;
    setOverlay(null);
    r.run();
  }

  return (
    <>
      <div className="absolute inset-0 z-[980]" onPointerDown={() => setOverlay(null)} />
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.1 } }}
        transition={{ duration: 0.14 }}
        className="absolute z-[990] left-1/2 top-[20%] -translate-x-1/2 w-[min(560px,92vw)] rounded-lg bg-[#1e1e2e] border-2 border-[#89b4fa] text-[#cdd6f4] overflow-hidden"
        style={{ fontFamily: "var(--font-jetbrains)" }}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#313244]">
          <span className="text-[#89b4fa] font-bold">drun</span>
          <input
            autoFocus
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setSel(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown" || (e.key === "Tab" && !e.shiftKey)) {
                e.preventDefault();
                setSel((s) => Math.min(s + 1, results.length - 1));
              } else if (e.key === "ArrowUp" || (e.key === "Tab" && e.shiftKey)) {
                e.preventDefault();
                setSel((s) => Math.max(s - 1, 0));
              } else if (e.key === "Enter") run(sel);
              else if (e.key === "Escape") {
                e.stopPropagation();
                setOverlay(null);
              }
            }}
            placeholder="search…"
            className="flex-1 bg-transparent outline-none text-[14px] placeholder:text-[#585b70]"
            spellCheck={false}
          />
        </div>
        <div className="max-h-[46vh] overflow-auto thin-scroll py-1">
          {results.map((r, i) => (
            <button
              key={r.key}
              onMouseEnter={() => setSel(i)}
              onClick={() => run(i)}
              className={`w-full flex items-center gap-3 px-4 py-1.5 text-left text-[13px] ${i === sel ? "bg-[#313244]" : ""}`}
            >
              {r.app ? <HyprIcon id={r.app} className="w-4 h-4 shrink-0" /> : <span className="w-4 shrink-0 text-[#585b70]">›</span>}
              <span className={`truncate ${i === sel ? "text-[#89b4fa]" : ""}`}>{r.label}</span>
              <span className="ml-auto text-[11px] text-[#585b70] truncate max-w-[40%]">{r.sub}</span>
            </button>
          ))}
          {results.length === 0 && <div className="px-4 py-3 text-[13px] text-[#585b70]">no matches</div>}
        </div>
      </motion.div>
    </>
  );
}

function EmptyWorkspace({ ws }: { ws: number }) {
  const now = useClock(1000);
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ fontFamily: "var(--font-jetbrains)" }}>
      <div className="text-center text-[#cdd6f4]">
        <div className="text-7xl font-bold tabular-nums">
          {now ? now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: false }) : "--:--"}
        </div>
        <div className="mt-2 text-[#a6adc8] text-sm">workspace {ws} is empty</div>
        <div className="mt-8 inline-grid grid-cols-[auto_auto] gap-x-6 gap-y-1.5 text-left text-[12.5px] rounded-lg bg-[#1e1e2e]/90 border border-[#313244] px-5 py-4">
          {[
            ["alt + enter", "terminal"],
            ["alt + d", "app launcher"],
            ["alt + q", "close window"],
            ["alt + f", "fullscreen"],
            ["alt + 1-5", "switch workspace"],
            ["alt + shift + 1-5", "move window"],
            ["alt + arrows", "move focus"],
            ["esc", "explore the room"],
          ].map(([k, v]) => (
            <div key={k} className="contents">
              <span className="text-[#89b4fa]">{k}</span>
              <span className="text-[#a6adc8]">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HyprWindow({ id, rect, visible, offset, focused }: { id: WindowId; rect: R | null; visible: boolean; offset: number; focused: boolean }) {
  const focusWindow = useAppStore((s) => s.focusWindow);
  const closeWindow = useAppStore((s) => s.closeWindow);
  const App = APP_COMPONENTS[id];
  const r = rect ?? { x: 0, y: 0, w: 400, h: 300 };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: visible ? 1 : 0, scale: 1, x: r.x + offset, y: r.y, width: r.w, height: r.h }}
      exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.14 } }}
      transition={{ type: "spring", stiffness: 380, damping: 36, mass: 0.9 }}
      onPointerDown={() => focusWindow(id)}
      className={`group absolute left-0 top-0 rounded-[10px] p-[2px] ${focused ? "hypr-border-active" : "bg-[#45475a]"}`}
      style={{ pointerEvents: visible ? "auto" : "none", zIndex: focused ? 20 : 10 }}
    >
      <div data-theme="hypr" className="relative w-full h-full rounded-[8px] overflow-hidden bg-[#1e1e2e]/[0.92] backdrop-blur-md">
        <App />
        <button
          onClick={() => closeWindow(id)}
          aria-label="Close"
          className="absolute top-1.5 right-1.5 w-5 h-5 rounded text-[12px] leading-none text-[#585b70] opacity-0 group-hover:opacity-100 hover:bg-[#f38ba8] hover:text-[#11111b] transition-opacity"
        >
          ×
        </button>
      </div>
    </motion.div>
  );
}

export default function HyprShell() {
  const windows = useAppStore((s) => s.windows);
  const order = useAppStore((s) => s.windowOrder);
  const windowWorkspace = useAppStore((s) => s.windowWorkspace);
  const active = useAppStore((s) => s.activeWorkspace);
  const focused = useAppStore((s) => s.focusedWindow);
  const overlay = useAppStore((s) => s.overlay);
  const vp = useViewport();
  const [fullscreen, setFullscreen] = useState<WindowId | null>(null);

  // Tile in opening order (windowWorkspace keys keep insertion order), not focus order,
  // so focusing a window doesn't reshuffle the layout.
  const opened = useMemo(() => (Object.keys(windowWorkspace) as WindowId[]).filter((id) => windows[id] && !windows[id]!.minimized), [windowWorkspace, windows]);

  const rects = useMemo(() => {
    const top = GAP_OUT + BAR_H + GAP_OUT;
    const area: R = { x: GAP_OUT, y: top, w: vp.w - GAP_OUT * 2, h: vp.h - top - GAP_OUT };
    const full: R = { x: 0, y: 0, w: vp.w, h: vp.h };
    const out: Partial<Record<WindowId, R>> = {};
    for (const ws of WORKSPACES) {
      const list = opened.filter((id) => (windowWorkspace[id] ?? 1) === ws);
      dwindle(list.length, area).forEach((r, i) => (out[list[i]] = r));
    }
    if (fullscreen && out[fullscreen]) out[fullscreen] = full;
    return out;
  }, [opened, windowWorkspace, vp, fullscreen]);

  const fsActive = fullscreen !== null && windows[fullscreen] !== undefined && (windowWorkspace[fullscreen] ?? 1) === active;

  // Keybinds. Alt stands in for Super, which browsers and OSes swallow.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!e.altKey) return;
      const s = useAppStore.getState();
      if (s.phase !== "ready") return;
      const digit = e.code.match(/^Digit([1-5])$/)?.[1];
      if (digit) {
        e.preventDefault();
        if (e.shiftKey && s.focusedWindow) s.moveToWorkspace(s.focusedWindow, Number(digit));
        else s.setWorkspace(Number(digit));
        return;
      }
      if (e.code === "Enter") {
        e.preventDefault();
        s.openWindow("terminal");
      } else if (e.code === "KeyD" || e.code === "Space") {
        e.preventDefault();
        s.toggleOverlay("launcher");
      } else if (e.code === "KeyQ" && s.focusedWindow) {
        e.preventDefault();
        s.closeWindow(s.focusedWindow);
      } else if (e.code === "KeyF" && s.focusedWindow) {
        e.preventDefault();
        const f = s.focusedWindow;
        setFullscreen((cur) => (cur === f ? null : f));
      } else if (e.code === "KeyE") {
        e.preventDefault();
        s.openWindow("files");
      } else if (e.code.startsWith("Arrow") && s.focusedWindow) {
        e.preventDefault();
        const cur = rects[s.focusedWindow];
        if (!cur) return;
        const cx = cur.x + cur.w / 2;
        const cy = cur.y + cur.h / 2;
        let best: WindowId | null = null;
        let bestD = Infinity;
        for (const id of opened) {
          if (id === s.focusedWindow || (s.windowWorkspace[id] ?? 1) !== s.activeWorkspace) continue;
          const r = rects[id];
          if (!r) continue;
          const dx = r.x + r.w / 2 - cx;
          const dy = r.y + r.h / 2 - cy;
          const ok = e.code === "ArrowLeft" ? dx < -1 : e.code === "ArrowRight" ? dx > 1 : e.code === "ArrowUp" ? dy < -1 : dy > 1;
          const d = Math.hypot(dx, dy);
          if (ok && d < bestD) {
            bestD = d;
            best = id;
          }
        }
        if (best) s.focusWindow(best);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [rects, opened]);

  const onActive = opened.filter((id) => (windowWorkspace[id] ?? 1) === active);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <WallpaperLayer />
      {onActive.length === 0 && <EmptyWorkspace ws={active} />}
      <div className="absolute inset-0">
        <AnimatePresence>
          {APP_META.filter((a) => windows[a.id] && order.includes(a.id)).map((a) => {
            const ws = windowWorkspace[a.id] ?? 1;
            const visible = ws === active && !windows[a.id]!.minimized && (!fsActive || fullscreen === a.id);
            // Windows on other workspaces slide off to the side they live on.
            const offset = ws === active ? 0 : (ws > active ? 1 : -1) * vp.w;
            return <HyprWindow key={a.id} id={a.id} rect={rects[a.id] ?? null} visible={visible} offset={offset} focused={focused === a.id} />;
          })}
        </AnimatePresence>
      </div>
      <Waybar fullscreen={fsActive} />
      <AnimatePresence>{overlay === "launcher" && <Launcher key="launcher" />}</AnimatePresence>
    </div>
  );
}
