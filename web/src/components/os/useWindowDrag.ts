"use client";

import { useRef, useState } from "react";
import { useAppStore, type WindowId } from "@/store/useAppStore";

// Shared pointer handling for free-floating window themes (Golden Gate, Retro 98).
// Hyprland tiles windows, so it doesn't use this.
export function useWindowDrag(id: WindowId, opts: { minY: number; maxYInset: number }) {
  const moveWindow = useAppStore((s) => s.moveWindow);
  const resizeWindow = useAppStore((s) => s.resizeWindow);
  const focusWindow = useAppStore((s) => s.focusWindow);
  const toggleMaximizeWindow = useAppStore((s) => s.toggleMaximizeWindow);
  const [active, setActive] = useState<null | "drag" | "resize">(null);
  const raf = useRef(0);

  function onTitlePointerDown(e: React.PointerEvent) {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest("button,a,input")) return;
    const win = useAppStore.getState().windows[id];
    if (!win) return;
    focusWindow(id);
    const start = { x: e.clientX, y: e.clientY, ox: win.x, oy: win.y };
    let restored = false;
    setActive("drag");

    function onMove(ev: PointerEvent) {
      const cur = useAppStore.getState().windows[id];
      if (!cur) return;
      // Dragging a maximized window un-maximizes it under the cursor, like macOS.
      if (cur.maximized && !restored) {
        if (Math.abs(ev.clientY - start.y) < 6 && Math.abs(ev.clientX - start.x) < 6) return;
        restored = true;
        toggleMaximizeWindow(id, { width: window.innerWidth, height: window.innerHeight });
        const after = useAppStore.getState().windows[id]!;
        start.ox = ev.clientX - after.width / 2;
        start.oy = opts.minY;
        start.x = ev.clientX;
        start.y = ev.clientY;
      }
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        const w = useAppStore.getState().windows[id];
        if (!w) return;
        const nx = Math.min(window.innerWidth - 80, Math.max(-w.width + 120, start.ox + ev.clientX - start.x));
        const ny = Math.min(window.innerHeight - opts.maxYInset, Math.max(opts.minY, start.oy + ev.clientY - start.y));
        moveWindow(id, nx, ny);
      });
    }
    function onUp() {
      setActive(null);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  function onResizePointerDown(e: React.PointerEvent, edges: { x: boolean; y: boolean }) {
    e.stopPropagation();
    e.preventDefault();
    const win = useAppStore.getState().windows[id];
    if (!win || win.maximized) return;
    focusWindow(id);
    const start = { x: e.clientX, y: e.clientY, w: win.width, h: win.height };
    setActive("resize");
    function onMove(ev: PointerEvent) {
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        resizeWindow(id, edges.x ? start.w + ev.clientX - start.x : start.w, edges.y ? start.h + ev.clientY - start.y : start.h);
      });
    }
    function onUp() {
      setActive(null);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    }
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  return { onTitlePointerDown, onResizePointerDown, active };
}
