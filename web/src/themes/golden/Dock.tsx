"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "motion/react";
import { useAppStore, type WindowId } from "@/store/useAppStore";
import { APP_META, appName } from "@/apps/meta";
import { GoldenIcon } from "./icons";

const BASE = 52;
const MAX = 84;
const RANGE = 150;

function DockItem({ mouseX, label, onClick, running, children }: { mouseX: MotionValue<number>; label: string; onClick: () => void; running?: boolean; children: React.ReactNode }) {
  const ref = useRef<HTMLButtonElement>(null);
  const [bounce, setBounce] = useState(0);
  const distance = useTransform(mouseX, (x) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r || !isFinite(x)) return RANGE + 1;
    return x - (r.left + r.width / 2);
  });
  const sizeRaw = useTransform(distance, [-RANGE, 0, RANGE], [BASE, MAX, BASE], { clamp: true });
  const size = useSpring(sizeRaw, { stiffness: 380, damping: 26, mass: 0.2 });

  return (
    <motion.button
      ref={ref}
      onClick={() => {
        if (!running) setBounce((b) => b + 1);
        onClick();
      }}
      aria-label={label}
      className="group relative flex flex-col items-center justify-end"
      style={{ width: size }}
    >
      <span className="pointer-events-none absolute -top-10 px-2.5 py-1 rounded-lg text-[12px] text-white/90 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity glass" style={{ borderRadius: 8 }}>
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
    </motion.button>
  );
}

export default function Dock() {
  const windows = useAppStore((s) => s.windows);
  const openWindow = useAppStore((s) => s.openWindow);
  const setMode = useAppStore((s) => s.setMode);
  const disable3D = useAppStore((s) => s.disable3D);
  const mouseX = useMotionValue(Infinity);

  const items = APP_META.filter((a) => a.inDock);

  return (
    <div className="pointer-events-none absolute bottom-2 inset-x-0 z-[900] flex justify-center">
      <motion.div
        onMouseMove={(e) => mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="pointer-events-auto flex items-end gap-1.5 px-2.5 pt-2 pb-1 glass-light"
        style={{ borderRadius: 24 }}
      >
        {items.map((a) => (
          <DockItem key={a.id} mouseX={mouseX} label={appName(a.id, "golden")} running={Boolean(windows[a.id as WindowId])} onClick={() => openWindow(a.id)}>
            <GoldenIcon id={a.id} className="w-full h-auto" />
          </DockItem>
        ))}
        {!disable3D && (
          <>
            <div className="w-px self-stretch my-2 mx-1 bg-white/25" />
            <DockItem mouseX={mouseX} label="Explore Room (Esc)" onClick={() => setMode("explore")}>
              <svg viewBox="0 0 64 64" className="w-full h-auto">
                <rect x="2" y="2" width="60" height="60" rx="14" fill="#48484a" />
                <path d="M32 14 48 23v18l-16 9-16-9V23l16-9Z" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinejoin="round" />
                <path d="M16 23l16 9 16-9M32 32v18" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinejoin="round" />
              </svg>
            </DockItem>
          </>
        )}
      </motion.div>
    </div>
  );
}
