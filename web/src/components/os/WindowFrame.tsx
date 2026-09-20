"use client";

import { ReactNode, useRef } from "react";
import { useAppStore, WindowId } from "@/store/useAppStore";

export default function WindowFrame({
  id,
  title,
  icon,
  children,
}: {
  id: WindowId;
  title: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  const win = useAppStore((s) => s.windows[id]);
  const zIndex = useAppStore((s) => s.windowOrder.indexOf(id));
  const focused = useAppStore((s) => s.focusedWindow === id);

  const closeWindow = useAppStore((s) => s.closeWindow);
  const focusWindow = useAppStore((s) => s.focusWindow);
  const minimizeWindow = useAppStore((s) => s.minimizeWindow);
  const toggleMaximizeWindow = useAppStore((s) => s.toggleMaximizeWindow);
  const moveWindow = useAppStore((s) => s.moveWindow);

  const dragState = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);

  if (!win || win.minimized) return null;

  function onTitleBarPointerDown(e: React.PointerEvent) {
    if ((e.target as HTMLElement).closest("button")) return;
    focusWindow(id);
    dragState.current = { startX: e.clientX, startY: e.clientY, originX: win!.x, originY: win!.y };

    function onMove(ev: PointerEvent) {
      if (!dragState.current) return;
      const dx = ev.clientX - dragState.current.startX;
      const dy = ev.clientY - dragState.current.startY;
      moveWindow(id, Math.max(0, dragState.current.originX + dx), Math.max(28, dragState.current.originY + dy));
    }
    function onUp() {
      dragState.current = null;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  return (
    <div
      onMouseDown={() => focusWindow(id)}
      className={`pointer-events-auto absolute flex flex-col rounded-xl border overflow-hidden transition-shadow ${
        focused ? "border-white/15 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)]" : "border-white/10 shadow-xl"
      }`}
      style={{
        left: win.x,
        top: win.y,
        width: win.width,
        height: win.height,
        zIndex: 100 + zIndex,
        background: "rgba(28, 28, 32, 0.72)",
        backdropFilter: "blur(24px)",
      }}
    >
      <div
        onPointerDown={onTitleBarPointerDown}
        className="flex items-center gap-2 px-3 h-9 shrink-0 bg-white/[0.04] border-b border-white/10 cursor-default select-none"
      >
        <div className="flex items-center gap-[7px] group">
          <button
            onClick={() => closeWindow(id)}
            aria-label="Close"
            className="w-3 h-3 rounded-full bg-[#ff5f57] flex items-center justify-center text-transparent group-hover:text-black/50 text-[8px] leading-none"
          >
            ✕
          </button>
          <button
            onClick={() => minimizeWindow(id)}
            aria-label="Minimize"
            className="w-3 h-3 rounded-full bg-[#febc2e] flex items-center justify-center text-transparent group-hover:text-black/50 text-[8px] leading-none"
          >
            −
          </button>
          <button
            onClick={() => toggleMaximizeWindow(id, { width: window.innerWidth, height: window.innerHeight })}
            aria-label="Maximize"
            className="w-3 h-3 rounded-full bg-[#28c840] flex items-center justify-center text-transparent group-hover:text-black/50 text-[8px] leading-none"
          >
            ⤢
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center gap-1.5 text-[12px] text-white/60 font-medium truncate px-8">
          {icon}
          <span className="truncate">{title}</span>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-auto">{children}</div>
    </div>
  );
}
