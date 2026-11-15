"use client";

import { motion } from "motion/react";
import { useAppStore, MIN_WINDOW_HEIGHT, MIN_WINDOW_WIDTH, type WindowId } from "@/store/useAppStore";
import { APP_COMPONENTS } from "@/apps/registry";
import { appName } from "@/apps/meta";
import { useWindowDrag } from "@/components/os/useWindowDrag";

const SPRING = { type: "spring", stiffness: 420, damping: 34, mass: 0.8 } as const;

export default function GoldenWindow({ id }: { id: WindowId }) {
  const win = useAppStore((s) => s.windows[id]);
  const z = useAppStore((s) => s.windowOrder.indexOf(id));
  const focused = useAppStore((s) => s.focusedWindow === id);
  const glass = useAppStore((s) => s.glassOpacity);
  const closeWindow = useAppStore((s) => s.closeWindow);
  const minimizeWindow = useAppStore((s) => s.minimizeWindow);
  const focusWindow = useAppStore((s) => s.focusWindow);
  const toggleMaximize = useAppStore((s) => s.toggleMaximizeWindow);
  const { onTitlePointerDown, onResizePointerDown, active } = useWindowDrag(id, { minY: 30, maxYInset: 60 });

  if (!win) return null;
  const App = APP_COMPONENTS[id];
  const maximize = () => toggleMaximize(id, { width: window.innerWidth, height: window.innerHeight });
  // Minimize flies the window toward the Dock (bottom center) and keeps it mounted so its
  // state (terminal scrollback, game progress) survives.
  const dockDx = typeof window !== "undefined" ? window.innerWidth / 2 - (win.x + win.width / 2) : 0;
  const dockDy = typeof window !== "undefined" ? window.innerHeight - win.y - 40 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.86, y: 24 }}
      animate={
        win.minimized
          ? { opacity: 0, scale: 0.12, x: dockDx, y: dockDy, transition: { duration: 0.42, ease: [0.4, 0, 0.2, 1] } }
          : { opacity: 1, scale: 1, x: 0, y: 0, transition: SPRING }
      }
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.16, ease: "easeIn" } }}
      onPointerDown={() => focusWindow(id)}
      className="absolute pointer-events-auto flex flex-col overflow-hidden glass-window"
      style={{
        left: win.x,
        top: win.y,
        width: win.width,
        height: win.height,
        minWidth: MIN_WINDOW_WIDTH,
        minHeight: MIN_WINDOW_HEIGHT,
        zIndex: 10 + z,
        borderRadius: win.maximized ? 0 : 16,
        pointerEvents: win.minimized ? "none" : "auto",
        transition: active ? "none" : "left .38s cubic-bezier(.2,.9,.2,1), top .38s cubic-bezier(.2,.9,.2,1), width .38s cubic-bezier(.2,.9,.2,1), height .38s cubic-bezier(.2,.9,.2,1), border-radius .3s",
        boxShadow: focused ? "0 22px 70px rgba(0,0,0,.55), 0 0 0 .5px rgba(0,0,0,.6)" : "0 10px 30px rgba(0,0,0,.35), 0 0 0 .5px rgba(0,0,0,.5)",
      }}
    >
      {/* Unified toolbar: traffic lights and title share one band, like Golden Gate. */}
      <div
        onPointerDown={onTitlePointerDown}
        onDoubleClick={(e) => !(e.target as HTMLElement).closest("button") && maximize()}
        className="flex items-center gap-3 px-4 h-[46px] shrink-0 select-none"
      >
        <div className="flex items-center gap-2 group">
          {[
            { c: "#ff5f57", label: "Close", g: "×", on: () => closeWindow(id) },
            { c: "#febc2e", label: "Minimize", g: "−", on: () => minimizeWindow(id) },
            { c: "#28c840", label: "Zoom", g: "+", on: maximize },
          ].map((b) => (
            <button
              key={b.label}
              aria-label={b.label}
              onClick={b.on}
              className="w-[13px] h-[13px] rounded-full flex items-center justify-center text-[10px] leading-none font-bold text-black/0 group-hover:text-black/55 transition-colors"
              style={{ background: focused ? b.c : "rgba(255,255,255,.22)", boxShadow: "inset 0 0 0 .5px rgba(0,0,0,.25)" }}
            >
              {b.g}
            </button>
          ))}
        </div>
        <span className={`text-[13px] font-semibold truncate ${focused ? "text-white/90" : "text-white/45"}`}>{appName(id, "golden")}</span>
      </div>
      <div
        data-theme="golden"
        className="flex-1 min-h-0 overflow-hidden"
        style={{ background: `rgba(28,28,31,${0.86 + glass * 0.13})` }}
      >
        <App />
      </div>

      {!win.maximized && (
        <>
          <div onPointerDown={(e) => onResizePointerDown(e, { x: true, y: false })} className="absolute top-3 right-0 bottom-3 w-1.5 cursor-ew-resize" />
          <div onPointerDown={(e) => onResizePointerDown(e, { x: false, y: true })} className="absolute left-3 right-3 bottom-0 h-1.5 cursor-ns-resize" />
          <div onPointerDown={(e) => onResizePointerDown(e, { x: true, y: true })} className="absolute right-0 bottom-0 w-4 h-4 cursor-nwse-resize" />
        </>
      )}
    </motion.div>
  );
}
