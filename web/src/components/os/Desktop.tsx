"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import WallpaperLayer from "./WallpaperLayer";
import MenuBar from "./MenuBar";
import Dock from "./Dock";
import DesktopIcons from "./DesktopIcons";
import WindowFrame from "./WindowFrame";
import Terminal from "./Terminal";
import ProjectsWindow from "./ProjectsWindow";
import HackathonsWindow from "./HackathonsWindow";
import OssWindow from "./OssWindow";
import SettingsWindow from "./SettingsWindow";
import { TerminalIcon } from "./icons";

// Desktop-only: mobile gets MobileTerminalApp instead (see app/page.tsx), so nothing here
// needs to account for a phone-sized viewport.
export default function Desktop() {
  const windowOrder = useAppStore((s) => s.windowOrder);
  const windows = useAppStore((s) => s.windows);
  const syncWindowsToViewport = useAppStore((s) => s.syncWindowsToViewport);

  // The store's default window (terminal, open on load) is sized before any component can
  // check the real viewport. Reconcile it -- and anything opened since -- against whatever
  // the browser window actually is, on mount and on resize.
  useEffect(() => {
    function sync() {
      syncWindowsToViewport({ width: window.innerWidth, height: window.innerHeight });
    }
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, [syncWindowsToViewport]);

  const anyMaximized = windowOrder.some((id) => windows[id]?.maximized);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <WallpaperLayer />
      <div className="absolute inset-0 bg-black/10" />

      {/* Every layer below shares the same full-viewport coordinate space, so window
          positions (and "maximize") line up with real screen dimensions instead of a
          flex-offset sub-region. */}
      <MenuBar />
      <DesktopIcons />

      <div className="absolute inset-0 pointer-events-none">
        {windowOrder.includes("terminal") && (
          <WindowFrame id="terminal" title="terminal — zsh" icon={<TerminalIcon className="w-3.5 h-3.5" />}>
            <Terminal />
          </WindowFrame>
        )}
        {windowOrder.includes("projects") && (
          <WindowFrame id="projects" title="Projects">
            <ProjectsWindow />
          </WindowFrame>
        )}
        {windowOrder.includes("hackathons") && (
          <WindowFrame id="hackathons" title="Hackathons">
            <HackathonsWindow />
          </WindowFrame>
        )}
        {windowOrder.includes("oss") && (
          <WindowFrame id="oss" title="Open Source">
            <OssWindow />
          </WindowFrame>
        )}
        {windowOrder.includes("settings") && (
          <WindowFrame id="settings" title="Settings">
            <SettingsWindow />
          </WindowFrame>
        )}
      </div>

      {!anyMaximized && <Dock />}

      {!anyMaximized && (
        <p className="pointer-events-none absolute bottom-3 left-4 z-40 text-[11px] text-white/50 font-mono">
          Press <kbd className="px-1 py-0.5 rounded bg-white/10 border border-white/15 text-white/70">Esc</kbd> to
          explore the room
        </p>
      )}
    </div>
  );
}
