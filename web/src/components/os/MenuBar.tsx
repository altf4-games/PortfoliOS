"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";

const APP_NAMES: Record<string, string> = {
  terminal: "Terminal",
  projects: "Projects",
  hackathons: "Hackathons",
  settings: "Settings",
};

export default function MenuBar() {
  const focusedWindow = useAppStore((s) => s.focusedWindow);
  // Starts null on both server and client render so hydration matches; the real
  // clock value only exists after mount, which is an intentional exception to the
  // no-setState-in-effect rule (a live clock cannot be known at render time).
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="pointer-events-auto h-7 flex items-center justify-between px-4 bg-black/40 backdrop-blur-2xl border-b border-white/10 text-[13px] text-white/90 select-none">
      <div className="flex items-center gap-4">
        <span className="font-semibold">◆</span>
        <span className="font-semibold">{focusedWindow ? APP_NAMES[focusedWindow] : "PortfoliOS"}</span>
      </div>
      <div className="flex items-center gap-3 text-white/70 tabular-nums">
        {now && (
          <span>
            {now.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}{" "}
            {now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
          </span>
        )}
      </div>
    </div>
  );
}
