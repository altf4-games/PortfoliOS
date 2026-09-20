"use client";

import { ReactNode } from "react";
import { useAppStore, WindowId } from "@/store/useAppStore";
import { TerminalIcon, ProjectsIcon, TrophyIcon, GearIcon } from "./icons";

const DOCK_ITEMS: { id: WindowId; label: string; icon: ReactNode }[] = [
  { id: "terminal", label: "Terminal", icon: <TerminalIcon className="w-6 h-6" /> },
  { id: "projects", label: "Projects", icon: <ProjectsIcon className="w-6 h-6" /> },
  { id: "hackathons", label: "Hackathons", icon: <TrophyIcon className="w-6 h-6" /> },
  { id: "settings", label: "Settings", icon: <GearIcon className="w-6 h-6" /> },
];

export default function Dock() {
  const windows = useAppStore((s) => s.windows);
  const openWindow = useAppStore((s) => s.openWindow);

  return (
    <div className="pointer-events-none absolute bottom-3 left-0 right-0 z-40 flex justify-center">
      <div className="pointer-events-auto flex items-end gap-2 px-3 py-2 rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/15 shadow-2xl">
        {DOCK_ITEMS.map((item) => {
          const isOpen = Boolean(windows[item.id]);
          return (
            <button
              key={item.id}
              onClick={() => openWindow(item.id)}
              title={item.label}
              className="group relative flex flex-col items-center"
            >
              <span className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-b from-white/15 to-white/5 border border-white/10 text-white group-hover:scale-110 group-hover:-translate-y-1 transition-transform duration-150 shadow-lg">
                {item.icon}
              </span>
              <span
                className={`mt-1 w-1 h-1 rounded-full transition-opacity ${
                  isOpen ? "bg-white opacity-90" : "opacity-0"
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
