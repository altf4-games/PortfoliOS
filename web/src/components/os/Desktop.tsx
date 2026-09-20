"use client";

import { useAppStore } from "@/store/useAppStore";
import { useIsMobile } from "@/lib/useIsMobile";
import WallpaperLayer from "./WallpaperLayer";
import MenuBar from "./MenuBar";
import Dock from "./Dock";
import DesktopIcons from "./DesktopIcons";
import WindowFrame from "./WindowFrame";
import Terminal from "./Terminal";
import ProjectsWindow from "./ProjectsWindow";
import HackathonsWindow from "./HackathonsWindow";
import SettingsWindow from "./SettingsWindow";
import { TerminalIcon } from "./icons";

export default function Desktop() {
  const windowOrder = useAppStore((s) => s.windowOrder);
  const windows = useAppStore((s) => s.windows);
  const toggleMode = useAppStore((s) => s.toggleMode);
  const isMobile = useIsMobile();

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
        {windowOrder.includes("settings") && (
          <WindowFrame id="settings" title="Settings">
            <SettingsWindow />
          </WindowFrame>
        )}
      </div>

      {!anyMaximized && <Dock />}

      {!anyMaximized &&
        (isMobile ? (
          <button
            onClick={toggleMode}
            className="pointer-events-auto absolute bottom-20 right-4 z-40 flex items-center gap-1.5 rounded-full bg-black/50 border border-white/15 backdrop-blur-xl px-3.5 py-2 text-xs text-white/90 shadow-lg"
          >
            Explore the room
          </button>
        ) : (
          <p className="pointer-events-none absolute bottom-3 left-4 z-40 text-[11px] text-white/50 font-mono">
            Press <kbd className="px-1 py-0.5 rounded bg-white/10 border border-white/15 text-white/70">Esc</kbd> to
            explore the room
          </p>
        ))}
    </div>
  );
}
