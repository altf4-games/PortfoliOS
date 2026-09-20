"use client";

import Terminal from "./Terminal";

// The floating-window desktop and the 3D Explore mode both fit poorly on a phone screen (the
// desktop needed windows to auto-maximize, and Explore mode needed the whole page rotated
// into landscape via CSS -- fragile and not a great experience either way). Mobile now gets
// a single, permanent terminal-only view instead: no dock, no other windows, no Explore mode,
// and no way to switch out of it.
export default function MobileTerminalApp() {
  return (
    <div className="absolute inset-0 flex flex-col bg-[#0a0a0c]">
      <div className="h-9 shrink-0 flex items-center justify-center border-b border-white/10 bg-black/40 text-[12px] text-white/60 font-mono">
        pradyum@altf4-os — terminal
      </div>
      <div className="flex-1 min-h-0">
        <Terminal />
      </div>
    </div>
  );
}
