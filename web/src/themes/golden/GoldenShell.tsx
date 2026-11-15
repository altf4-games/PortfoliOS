"use client";

import { AnimatePresence } from "motion/react";
import { useAppStore } from "@/store/useAppStore";
import { APP_META } from "@/apps/meta";
import WallpaperLayer from "@/components/os/WallpaperLayer";
import DesktopIcons from "@/components/os/DesktopIcons";
import MenuBar from "./MenuBar";
import Dock from "./Dock";
import GoldenWindow from "./GoldenWindow";
import Spotlight from "./Spotlight";
import ControlCenter from "./ControlCenter";

export default function GoldenShell() {
  const windows = useAppStore((s) => s.windows);
  const focused = useAppStore((s) => s.focusedWindow);
  const focusedMax = useAppStore((s) => (s.focusedWindow ? s.windows[s.focusedWindow]?.maximized : false));
  const overlay = useAppStore((s) => s.overlay);
  const glass = useAppStore((s) => s.glassOpacity);

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ ["--glass-alpha" as string]: glass }}>
      <WallpaperLayer />
      <DesktopIcons side="right" />
      <div className="absolute inset-0 pointer-events-none">
        <AnimatePresence>
          {/* Stable DOM order (z-index handles stacking) so focusing a window never
              re-parents it, which would reload iframes like the resume viewer. */}
          {APP_META.filter((a) => windows[a.id]).map((a) => (
            <GoldenWindow key={a.id} id={a.id} />
          ))}
        </AnimatePresence>
      </div>
      <MenuBar />
      {!(focused && focusedMax) && <Dock />}
      <AnimatePresence>
        {overlay === "spotlight" && <Spotlight key="spot" />}
        {overlay === "control" && <ControlCenter key="cc" />}
      </AnimatePresence>
    </div>
  );
}
