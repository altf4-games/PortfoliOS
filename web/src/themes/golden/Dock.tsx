"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { useAppStore, type WindowId } from "@/store/useAppStore";
import { APP_META, appName } from "@/apps/meta";
import { GoldenIcon } from "./icons";

// Layout constants, kept in sync with the Tailwind classes below (px-2.5, gap-1.5,
// pt-2/pb-1, the 1px separator with mx-1 and the 4px running dot).
const PAD_X = 10;
const GAP = 6;
const SEP = 1 + 8;
const CHROME_Y = 8 + 4 + 8;

// Magnification is computed from the *unmagnified* layout: each icon's resting center is
// known from its index, so sizes depend only on the cursor's x. Measuring live rects of
// growing icons (what a spring on getBoundingClientRect does) feeds back on itself and
// can stall or jitter; this way it is deterministic on every browser and display.
function magnified(distance: number, base: number, max: number) {
  const range = base * 3;
  const d = Math.abs(distance);
  if (d >= range) return base;
  const f = Math.cos((d / range) * (Math.PI / 2));
  return base + (max - base) * f * f;
}

function DockItem({ size, label, onClick, running, children }: { size: number; label: string; onClick: () => void; running?: boolean; children: React.ReactNode }) {
  const [bounce, setBounce] = useState(0);
  return (
    <button
      onClick={() => {
        if (!running) setBounce((b) => b + 1);
        onClick();
      }}
      aria-label={label}
      className="group relative flex flex-col items-center justify-end shrink-0"
      style={{ width: size, transition: "width 120ms cubic-bezier(.2,.8,.2,1)" }}
    >
      <span className="pointer-events-none absolute -top-10 px-2.5 py-1 text-[12px] text-white/90 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity glass" style={{ borderRadius: 8 }}>
        {label}
      </span>
      <motion.span
        key={bounce}
        animate={bounce ? { y: [0, -22, 0, -10, 0] } : undefined}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="block w-full"
      >
        {children}
      </motion.span>
      <span className={`mt-1 w-1 h-1 rounded-full bg-white/85 transition-opacity ${running ? "opacity-100" : "opacity-0"}`} />
    </button>
  );
}

function ExploreGlyph() {
  return (
    <svg viewBox="0 0 64 64" className="w-full h-auto">
      <rect x="2" y="2" width="60" height="60" rx="14" fill="#48484a" />
      <path d="M32 14 48 23v18l-16 9-16-9V23l16-9Z" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinejoin="round" />
      <path d="M16 23l16 9 16-9M32 32v18" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinejoin="round" />
    </svg>
  );
}

export default function Dock() {
  const windows = useAppStore((s) => s.windows);
  const openWindow = useAppStore((s) => s.openWindow);
  const setMode = useAppStore((s) => s.setMode);
  const disable3D = useAppStore((s) => s.disable3D);
  const dockSize = useAppStore((s) => s.dockSize);
  const dockMagnify = useAppStore((s) => s.dockMagnify);

  const wrapRef = useRef<HTMLDivElement>(null);
  // Cursor x plus the shelf's horizontal midline, both captured in the event handler.
  const [hover, setHover] = useState<{ x: number; mid: number } | null>(null);
  const [vw, setVw] = useState(1440);

  useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const apps = APP_META.filter((a) => a.inDock);
  const showExplore = !disable3D;
  const count = apps.length + (showExplore ? 1 : 0);
  const sepW = showExplore ? SEP + GAP : 0;

  // Shrink to fit narrow windows, the way macOS does when the Dock runs out of room.
  const fit = Math.floor((vw - 48 - 2 * PAD_X - sepW - (count - 1) * GAP) / count);
  const base = Math.max(28, Math.min(dockSize, fit));
  const max = dockMagnify ? Math.round(Math.min(base * 1.7, 128)) : base;
  const restWidth = 2 * PAD_X + count * base + (count - 1) * GAP + sepW;

  const sizeAt = (i: number) => {
    if (!hover || max === base) return base;
    const center = hover.mid - restWidth / 2 + PAD_X + i * (base + GAP) + base / 2 + (i >= apps.length ? sepW : 0);
    return magnified(hover.x - center, base, max);
  };

  function track(x: number | null) {
    const wrap = wrapRef.current?.getBoundingClientRect();
    const next = x === null || !wrap ? null : { x, mid: wrap.left + wrap.width / 2 };
    setHover(next);
  }

  return (
    <div ref={wrapRef} className="pointer-events-none absolute bottom-2 inset-x-0 z-[900] flex justify-center">
      {/* The shelf stays at the resting height; magnified icons rise out of it. */}
      <div
        onMouseMove={(e) => track(e.clientX)}
        onMouseLeave={() => track(null)}
        className="pointer-events-auto flex items-end gap-1.5 px-2.5 pt-2 pb-1 glass-light"
        style={{ borderRadius: Math.round(base * 0.42) + 2, height: base + CHROME_Y }}
      >
        {apps.map((a, i) => (
          <DockItem key={a.id} size={sizeAt(i)} label={appName(a.id, "golden")} running={Boolean(windows[a.id as WindowId])} onClick={() => openWindow(a.id)}>
            <GoldenIcon id={a.id} className="w-full h-auto" />
          </DockItem>
        ))}
        {showExplore && (
          <>
            <div className="w-px self-stretch my-2 mx-1 bg-white/25 shrink-0" />
            <DockItem size={sizeAt(apps.length)} label="Explore Room (Esc)" onClick={() => setMode("explore")}>
              <ExploreGlyph />
            </DockItem>
          </>
        )}
      </div>
    </div>
  );
}
