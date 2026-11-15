"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion, type TargetAndTransition } from "motion/react";
import { useAppStore, type ThemeId } from "@/store/useAppStore";
import BootScreen from "./BootScreen";
import Effects from "./Effects";
import Toasts from "./Toasts";
import GoldenShell from "@/themes/golden/GoldenShell";

// Golden Gate is the default and ships in the main bundle; the other desktops load on
// first switch so the default experience doesn't pay for them.
const RetroShell = dynamic(() => import("@/themes/retro/RetroShell"), { ssr: false });
const HyprShell = dynamic(() => import("@/themes/hypr/HyprShell"), { ssr: false });

const WELCOME: Record<ThemeId, string> = {
  golden: "Press ⌘K to search everything, or Esc to explore the room.",
  retro: "Double-click an icon, or try the Start menu.",
  hypr: "Alt+Enter terminal · Alt+D launcher · Alt+1-5 workspaces.",
};

// First boot opens About Me and the Terminal side by side, with the terminal focused so a
// visitor can start typing straight away. Hyprland tiles them itself.
function openStartupWindows() {
  const s = useAppStore.getState();
  s.openWindow("about");
  s.openWindow("terminal");
  if (s.theme === "hypr") return;
  const { windows } = useAppStore.getState();
  const about = windows.about;
  const term = windows.terminal;
  if (!about || !term) return;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const gap = 24;
  const top = s.theme === "retro" ? 24 : 56;
  const bottom = s.theme === "retro" ? 48 : 110;
  const total = about.width + gap + term.width;
  const aboutX = total + 32 <= vw ? Math.round((vw - total) / 2) : 16;
  const termX = total + 32 <= vw ? aboutX + about.width + gap : Math.max(16, vw - term.width - 16);
  const aboutY = Math.max(top, Math.round((vh - about.height) / 2 - 30));
  const termY = Math.min(Math.max(top, aboutY + 40), Math.max(top, vh - bottom - term.height));
  s.moveWindow("about", aboutX, aboutY);
  s.moveWindow("terminal", termX, termY);
}

export default function Desktop() {
  const theme = useAppStore((s) => s.theme);
  const phase = useAppStore((s) => s.phase);
  const setPhase = useAppStore((s) => s.setPhase);
  const effect = useAppStore((s) => s.effect);
  const syncWindowsToViewport = useAppStore((s) => s.syncWindowsToViewport);
  const [switching, setSwitching] = useState<ThemeId | null>(null);
  const prevTheme = useRef(theme);
  const firstReady = useRef(true);

  useEffect(() => {
    const sync = () => syncWindowsToViewport({ width: window.innerWidth, height: window.innerHeight });
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, [syncWindowsToViewport, theme]);

  // Theme switches play the new theme's (short) boot sequence over the swap.
  useEffect(() => {
    if (prevTheme.current !== theme && phase === "ready") {
      setSwitching(theme);
    }
    prevTheme.current = theme;
  }, [theme, phase]);

  const onBootDone = useCallback(() => {
    setPhase("ready");
    if (firstReady.current) {
      firstReady.current = false;
      const s = useAppStore.getState();
      if (s.windowOrder.length === 0) openStartupWindows();
      setTimeout(() => s.pushToast({ icon: "hi", title: "Welcome to PortfoliOS", body: WELCOME[s.theme] }), 900);
    }
  }, [setPhase]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const s = useAppStore.getState();
      if (s.phase !== "ready") return;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        s.toggleOverlay(s.theme === "golden" ? "spotlight" : s.theme === "retro" ? "start" : "launcher");
        return;
      }
      if (e.key === "Escape") {
        if (s.effect) {
          if (s.effect !== "crash") s.setEffect(null);
          return;
        }
        e.preventDefault();
        if (s.overlay) s.setOverlay(null);
        else if (!s.disable3D) s.toggleMode();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const transform: TargetAndTransition =
    effect === "barrel"
      ? { rotate: [0, 360], transition: { duration: 1.2, ease: [0.6, 0, 0.3, 1] as const } }
      : effect === "meltdown"
        ? { y: [0, 0, "110vh", "110vh", 0], rotate: [0, -2, 8, 8, 0], transition: { duration: 4.2, times: [0, 0.1, 0.4, 0.85, 1], ease: "easeInOut" } }
        : { rotate: 0, y: 0 };

  return (
    <div className="absolute inset-0 overflow-hidden" data-shell={theme}>
      <motion.div
        className="absolute inset-0"
        animate={transform}
        style={{ filter: effect === "konami" ? "hue-rotate(0deg)" : undefined, animation: effect === "konami" ? "konami-hue 1.2s linear infinite" : undefined }}
      >
        {theme === "golden" && <GoldenShell />}
        {theme === "retro" && <RetroShell />}
        {theme === "hypr" && <HyprShell />}
      </motion.div>
      <style>{`@keyframes konami-hue{to{filter:hue-rotate(360deg)}}`}</style>

      <Toasts />
      <AnimatePresence>{effect && <Effects key={effect} />}</AnimatePresence>

      <AnimatePresence>
        {phase === "boot" && <BootScreen key="boot" theme={theme} onDone={onBootDone} />}
        {switching && phase === "ready" && <BootScreen key={`switch-${switching}`} theme={switching} quick onDone={() => setSwitching(null)} />}
      </AnimatePresence>
    </div>
  );
}
