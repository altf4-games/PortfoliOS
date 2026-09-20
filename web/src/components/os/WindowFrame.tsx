"use client";

import { ReactNode } from "react";
import { useAppStore, WindowId } from "@/store/useAppStore";

export default function WindowFrame({
  id,
  title,
  children,
  className = "",
}: {
  id: WindowId;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  const closeWindow = useAppStore((s) => s.closeWindow);
  const focusWindow = useAppStore((s) => s.focusWindow);
  const focused = useAppStore((s) => s.focusedWindow === id);

  return (
    <div
      onMouseDown={() => focusWindow(id)}
      className={`pointer-events-auto flex flex-col rounded-lg border border-white/10 bg-black/70 backdrop-blur-xl shadow-2xl overflow-hidden ${
        focused ? "ring-1 ring-cyan-400/40" : ""
      } ${className}`}
    >
      <div className="flex items-center justify-between px-3 py-2 bg-white/5 border-b border-white/10 cursor-default select-none">
        <span className="text-xs font-mono text-white/70 tracking-wide">{title}</span>
        <button
          onClick={() => closeWindow(id)}
          aria-label={`Close ${title}`}
          className="w-5 h-5 rounded-full bg-red-500/80 hover:bg-red-500 transition-colors flex items-center justify-center text-[10px] text-black/70"
        >
          ✕
        </button>
      </div>
      <div className="flex-1 min-h-0 overflow-auto">{children}</div>
    </div>
  );
}
