"use client";

import { motion } from "motion/react";
import { useAppStore, MIN_WINDOW_HEIGHT, MIN_WINDOW_WIDTH, type WindowId } from "@/store/useAppStore";
import { APP_COMPONENTS } from "@/apps/registry";
import { appName } from "@/apps/meta";
import { useWindowDrag } from "@/components/os/useWindowDrag";
import { PixelIcon } from "./icons";

function TitleButton({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button aria-label={label} onClick={onClick} className="bevel-out w-[18px] h-[16px] flex items-center justify-center active:shadow-[inset_1px_1px_#0a0a0a,inset_-1px_-1px_#fff]">
      {children}
    </button>
  );
}

export default function RetroWindow({ id }: { id: WindowId }) {
  const win = useAppStore((s) => s.windows[id]);
  const z = useAppStore((s) => s.windowOrder.indexOf(id));
  const focused = useAppStore((s) => s.focusedWindow === id);
  const closeWindow = useAppStore((s) => s.closeWindow);
  const minimizeWindow = useAppStore((s) => s.minimizeWindow);
  const focusWindow = useAppStore((s) => s.focusWindow);
  const toggleMaximize = useAppStore((s) => s.toggleMaximizeWindow);
  const { onTitlePointerDown, onResizePointerDown } = useWindowDrag(id, { minY: 0, maxYInset: 60 });

  if (!win) return null;
  const App = APP_COMPONENTS[id];
  const maximize = () => toggleMaximize(id, { width: window.innerWidth, height: window.innerHeight });

  return (
    <motion.div
      // 98-era windows didn't animate much: a quick, stepped "pop" reads right.
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.12, ease: (t) => Math.round(t * 4) / 4 }}
      onPointerDown={() => focusWindow(id)}
      className="absolute pointer-events-auto bevel-out p-[3px] flex flex-col"
      style={{
        left: win.x,
        top: win.y,
        width: win.width,
        height: win.height,
        minWidth: MIN_WINDOW_WIDTH,
        minHeight: MIN_WINDOW_HEIGHT,
        zIndex: 10 + z,
        display: win.minimized ? "none" : "flex",
        fontFamily: "var(--font-pixelify)",
      }}
    >
      <div
        onPointerDown={onTitlePointerDown}
        onDoubleClick={(e) => !(e.target as HTMLElement).closest("button") && maximize()}
        className="h-[22px] shrink-0 flex items-center gap-1.5 pl-1 pr-[2px] select-none"
        style={{ background: focused ? "#000080" : "#808080" }}
      >
        <PixelIcon id={id} className="w-4 h-4 pixelated shrink-0" />
        <span className={`flex-1 truncate text-[13px] font-bold ${focused ? "text-white" : "text-[#c0c0c0]"}`}>{appName(id, "retro")}</span>
        <TitleButton label="Minimize" onClick={() => minimizeWindow(id)}>
          <span className="block w-[7px] h-[2px] bg-black mt-[6px]" />
        </TitleButton>
        <TitleButton label="Maximize" onClick={maximize}>
          <span className="block w-[9px] h-[8px] border border-black border-t-2" />
        </TitleButton>
        <span className="w-[2px]" />
        <TitleButton label="Close" onClick={() => closeWindow(id)}>
          <svg viewBox="0 0 8 7" className="w-[8px] h-[7px]" shapeRendering="crispEdges">
            <path d="M0 0h2v1h1v1h2V1h1V0h2v1H7v1H6v1H5v1h1v1h1v1h1v1H6V6H5V5H3v1H2v1H0V6h1V5h1V4h1V3H2V2H1V1H0z" fill="#000" />
          </svg>
        </TitleButton>
      </div>
      <div data-theme="retro" className="flex-1 min-h-0 mt-[2px] overflow-hidden bg-[#c0c0c0]">
        <App />
      </div>
      {!win.maximized && (
        <div onPointerDown={(e) => onResizePointerDown(e, { x: true, y: true })} className="absolute right-[3px] bottom-[3px] w-3.5 h-3.5 cursor-nwse-resize">
          <svg viewBox="0 0 12 12" className="w-full h-full" shapeRendering="crispEdges">
            <path d="M11 1v1h-1v1H9v1H8v1H7v1H6v1H5v1H4v1H3v1H2v1H1v1" stroke="#fff" fill="none" />
            <path d="M11 4v1h-1v1H9v1H8v1H7v1H6v1H5v1H4" stroke="#808080" fill="none" />
            <path d="M11 7v1h-1v1H9v1H8v1H7" stroke="#808080" fill="none" />
          </svg>
        </div>
      )}
    </motion.div>
  );
}
