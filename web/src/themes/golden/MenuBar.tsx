"use client";

import { AnimatePresence, motion } from "motion/react";
import { useAppStore } from "@/store/useAppStore";
import { appName } from "@/apps/meta";
import { BridgeLogo } from "@/apps/glyphs";
import { useClock } from "@/components/os/useClock";
import { registerLogoTap } from "@/components/os/logoTaps";

function MenuItem({ children, onClick, shortcut, disabled }: { children: React.ReactNode; onClick?: () => void; shortcut?: string; disabled?: boolean }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="w-full flex items-center justify-between gap-6 px-2.5 py-[5px] rounded-md text-[13px] text-left text-white/90 enabled:hover:bg-[#0a84ff] enabled:hover:text-white disabled:text-white/35"
    >
      <span>{children}</span>
      {shortcut && <span className="text-white/45 text-[12px]">{shortcut}</span>}
    </button>
  );
}

export default function MenuBar() {
  const focused = useAppStore((s) => s.focusedWindow);
  const overlay = useAppStore((s) => s.overlay);
  const setOverlay = useAppStore((s) => s.setOverlay);
  const toggleOverlay = useAppStore((s) => s.toggleOverlay);
  const openWindow = useAppStore((s) => s.openWindow);
  const setTheme = useAppStore((s) => s.setTheme);
  const setMode = useAppStore((s) => s.setMode);
  const setPhase = useAppStore((s) => s.setPhase);
  const closeAll = useAppStore((s) => s.closeAll);
  const now = useClock();

  return (
    <>
      <div className="absolute top-0 inset-x-0 z-[950] h-[30px] flex items-center justify-between px-3 text-[13px] text-white select-none bg-black/15 backdrop-blur-xl">
        <div className="flex items-center gap-1">
          <button
            aria-label="PortfoliOS menu"
            onClick={() => {
              if (!registerLogoTap()) toggleOverlay("logo-menu");
            }}
            className={`px-2.5 h-[24px] rounded-md flex items-center ${overlay === "logo-menu" ? "bg-white/20" : "hover:bg-white/10"}`}
          >
            <BridgeLogo className="w-[17px] h-[17px]" />
          </button>
          <span className="px-2 font-bold">{focused ? appName(focused, "golden") : "Finder"}</span>
          {["File", "Edit", "View", "Window", "Help"].map((m) => (
            <span key={m} className="px-2 text-white/85 hidden md:inline">
              {m}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1 text-white/90">
          <button onClick={() => toggleOverlay("control")} aria-label="Control Center" className={`px-2 h-[24px] rounded-md ${overlay === "control" ? "bg-white/20" : "hover:bg-white/10"}`}>
            <svg viewBox="0 0 20 20" className="w-4 h-4" fill="currentColor">
              <rect x="2" y="3" width="16" height="6" rx="3" opacity=".9" />
              <circle cx="14.5" cy="6" r="2" fill="#000" opacity=".5" />
              <rect x="2" y="11" width="16" height="6" rx="3" opacity=".9" />
              <circle cx="5.5" cy="14" r="2" fill="#000" opacity=".5" />
            </svg>
          </button>
          <button onClick={() => toggleOverlay("spotlight")} aria-label="Spotlight (⌘K)" className="px-2 h-[24px] rounded-md hover:bg-white/10">
            <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="8.5" cy="8.5" r="5.5" />
              <path d="m13 13 4.5 4.5" strokeLinecap="round" />
            </svg>
          </button>
          <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] mx-1.5" fill="currentColor" aria-hidden="true">
            <path d="M12 18.5a1.6 1.6 0 1 0 0 .01ZM12 13c1.7 0 3.2.7 4.3 1.8l-1.4 1.4a4.1 4.1 0 0 0-5.8 0l-1.4-1.4A6 6 0 0 1 12 13Zm0-4.2c2.9 0 5.5 1.2 7.4 3.1L18 13.3a8.4 8.4 0 0 0-12 0l-1.4-1.4A10.4 10.4 0 0 1 12 8.8Zm0-4.2c4 0 7.7 1.6 10.4 4.3L21 10.3A12.8 12.8 0 0 0 3 10.3L1.6 8.9A14.7 14.7 0 0 1 12 4.6Z" />
          </svg>
          <svg viewBox="0 0 28 14" className="w-[26px] h-[13px] mr-2" aria-hidden="true">
            <rect x=".5" y=".5" width="24" height="13" rx="3.5" fill="none" stroke="currentColor" opacity=".55" />
            <rect x="2.5" y="2.5" width="17" height="9" rx="2" fill="currentColor" />
            <path d="M26 5v4" stroke="currentColor" strokeWidth="1.6" opacity=".55" strokeLinecap="round" />
          </svg>
          {now && (
            <span className="tabular-nums font-medium px-1">
              {now.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}{" "}
              {now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
            </span>
          )}
        </div>
      </div>

      <AnimatePresence>
        {overlay === "logo-menu" && (
          <>
            <div className="absolute inset-0 z-[940]" onPointerDown={() => setOverlay(null)} />
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              transition={{ duration: 0.14 }}
              className="absolute z-[960] top-[33px] left-2 w-60 p-1.5 glass"
              style={{ borderRadius: 12 }}
            >
              <MenuItem onClick={() => openWindow("about")}>About This Portfolio</MenuItem>
              <div className="h-px bg-white/10 my-1 mx-2" />
              <MenuItem onClick={() => openWindow("settings")} shortcut="⌘,">
                System Settings…
              </MenuItem>
              <MenuItem onClick={() => setOverlay("spotlight")} shortcut="⌘K">
                Spotlight Search
              </MenuItem>
              <div className="h-px bg-white/10 my-1 mx-2" />
              <MenuItem onClick={() => setTheme("retro")}>Switch to Retro 98</MenuItem>
              <MenuItem onClick={() => setTheme("hypr")}>Switch to Hyprland</MenuItem>
              <div className="h-px bg-white/10 my-1 mx-2" />
              <MenuItem
                onClick={() => {
                  setOverlay(null);
                  setMode("explore");
                }}
                shortcut="esc"
              >
                Explore the Room
              </MenuItem>
              <MenuItem
                onClick={() => {
                  closeAll();
                  setPhase("boot");
                }}
              >
                Restart…
              </MenuItem>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
