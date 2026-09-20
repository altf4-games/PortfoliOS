"use client";

import { ReactNode, useRef } from "react";
import { useAppStore, WindowId, MIN_WINDOW_WIDTH, MIN_WINDOW_HEIGHT } from "@/store/useAppStore";
import { getEffectiveViewport } from "@/lib/useIsMobile";

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
  const resizeWindow = useAppStore((s) => s.resizeWindow);

  const dragState = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);
  const resizeState = useRef<{ startX: number; startY: number; originW: number; originH: number } | null>(null);

  if (!win || win.minimized) return null;

  function onTitleBarPointerDown(e: React.PointerEvent) {
    if (win!.maximized) return;
    if ((e.target as HTMLElement).closest("button")) return;
    focusWindow(id);
    dragState.current = { startX: e.clientX, startY: e.clientY, originX: win!.x, originY: win!.y };

    function onMove(ev: PointerEvent) {
      if (!dragState.current) return;
      const dx = ev.clientX - dragState.current.startX;
      const dy = ev.clientY - dragState.current.startY;
      const viewport = getEffectiveViewport();
      const maxX = viewport.width - 80;
      const maxY = viewport.height - 40;
      moveWindow(
        id,
        Math.min(maxX, Math.max(-win!.width + 120, dragState.current.originX + dx)),
        Math.min(maxY, Math.max(28, dragState.current.originY + dy))
      );
    }
    function onUp() {
      dragState.current = null;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  function onResizeHandlePointerDown(e: React.PointerEvent) {
    e.stopPropagation();
    focusWindow(id);
    resizeState.current = { startX: e.clientX, startY: e.clientY, originW: win!.width, originH: win!.height };

    function onMove(ev: PointerEvent) {
      if (!resizeState.current) return;
      const dx = ev.clientX - resizeState.current.startX;
      const dy = ev.clientY - resizeState.current.startY;
      resizeWindow(id, resizeState.current.originW + dx, resizeState.current.originH + dy);
    }
    function onUp() {
      resizeState.current = null;
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
      } ${win.maximized ? "!rounded-none" : ""}`}
      style={{
        left: win.x,
        top: win.y,
        width: win.width,
        height: win.height,
        minWidth: MIN_WINDOW_WIDTH,
        minHeight: MIN_WINDOW_HEIGHT,
        zIndex: 1 + zIndex,
        background: "rgba(28, 28, 32, 0.72)",
        backdropFilter: "blur(24px)",
      }}
    >
      <div
        onPointerDown={onTitleBarPointerDown}
        className={`flex items-center gap-2 px-3 h-9 shrink-0 bg-white/[0.04] border-b border-white/10 select-none ${
          win.maximized ? "cursor-default" : "cursor-grab active:cursor-grabbing"
        }`}
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
            onClick={() => toggleMaximizeWindow(id, getEffectiveViewport())}
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

      {!win.maximized && (
        <div
          onPointerDown={onResizeHandlePointerDown}
          className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize touch-none"
        >
          <svg viewBox="0 0 16 16" className="w-full h-full text-white/25">
            <path d="M14 14 L14 9 M14 14 L9 14 M14 5 L5 14" stroke="currentColor" strokeWidth="1.4" fill="none" />
          </svg>
        </div>
      )}
    </div>
  );
}
