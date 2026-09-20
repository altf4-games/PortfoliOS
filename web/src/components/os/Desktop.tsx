"use client";

import { useAppStore } from "@/store/useAppStore";
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

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden">
      <WallpaperLayer />
      <div className="absolute inset-0 bg-black/10" />

      <div className="relative z-10">
        <MenuBar />
      </div>

      <DesktopIcons />

      <div className="relative flex-1">
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

      <Dock />
    </div>
  );
}
