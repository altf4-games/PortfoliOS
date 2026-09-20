"use client";

import { useAppStore, WindowId } from "@/store/useAppStore";
import WindowFrame from "./WindowFrame";
import Terminal from "./Terminal";
import ProjectsWindow from "./ProjectsWindow";
import HackathonsWindow from "./HackathonsWindow";
import SettingsWindow from "./SettingsWindow";

const ICONS: { id: WindowId; label: string; icon: string }[] = [
  { id: "terminal", label: "Terminal", icon: "⌘" },
  { id: "projects", label: "Projects", icon: "⌘" },
  { id: "hackathons", label: "Hackathons", icon: "◈" },
  { id: "settings", label: "Settings", icon: "⚙" },
];

export default function Desktop() {
  const openWindows = useAppStore((s) => s.openWindows);
  const openWindow = useAppStore((s) => s.openWindow);

  return (
    <div className="absolute inset-0 flex flex-col pointer-events-none">
      {/* Desktop icons */}
      <div className="p-4 flex flex-col gap-4 w-20">
        {ICONS.map((icon) => (
          <button
            key={icon.id}
            onClick={() => openWindow(icon.id)}
            className="pointer-events-auto flex flex-col items-center gap-1 text-white/80 hover:text-white text-[11px]"
          >
            <span className="w-10 h-10 flex items-center justify-center rounded-md bg-white/10 backdrop-blur border border-white/10 text-lg">
              {icon.icon}
            </span>
            {icon.label}
          </button>
        ))}
      </div>

      {/* Windows area */}
      <div className="flex-1 relative px-4 pb-16">
        <div className="pointer-events-none absolute inset-4 grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-[minmax(0,1fr)]">
          {openWindows.includes("terminal") && (
            <WindowFrame id="terminal" title="terminal — PortfoliOS" className="max-h-[480px]">
              <Terminal />
            </WindowFrame>
          )}
          {openWindows.includes("projects") && (
            <WindowFrame id="projects" title="projects" className="max-h-[480px]">
              <ProjectsWindow />
            </WindowFrame>
          )}
          {openWindows.includes("hackathons") && (
            <WindowFrame id="hackathons" title="hackathons" className="max-h-[480px]">
              <HackathonsWindow />
            </WindowFrame>
          )}
          {openWindows.includes("settings") && (
            <WindowFrame id="settings" title="settings" className="max-h-[480px]">
              <SettingsWindow />
            </WindowFrame>
          )}
        </div>
      </div>

      {/* Taskbar */}
      <div className="pointer-events-auto h-12 flex items-center justify-between px-4 bg-black/60 backdrop-blur-xl border-t border-white/10 text-white/70 text-xs font-mono">
        <span>PortfoliOS</span>
        <span>Press Esc to explore the room</span>
      </div>
    </div>
  );
}
