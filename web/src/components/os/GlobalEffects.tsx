"use client";

import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { discoverEgg } from "@/lib/eggs";

const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
const IDLE_MS = 75_000;

// Listeners that aren't tied to any one theme: Konami code, idle screensaver, the
// DevTools greeting, time-of-day and theme-hopping eggs, and the developer HUD.
export default function GlobalEffects() {
  const phase = useAppStore((s) => s.phase);
  const themesVisited = useAppStore((s) => s.themesVisited);
  const devHud = useAppStore((s) => s.devHud);
  const konamiPos = useRef(0);

  useEffect(() => {
    // Styled greeting for anyone who opens DevTools; the code unlocks an egg.
    console.log(
      "%c PortfoliOS %c Hey, fellow developer 👋  Run `unlock altf4` in the terminal.",
      "background:#ff8a3d;color:#000;font-weight:700;padding:4px 8px;border-radius:4px",
      "color:#ffb547;padding:4px"
    );
    const h = new Date().getHours();
    if (h >= 0 && h < 5) {
      const t = setTimeout(() => discoverEgg("night-owl"), 4000);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    if (themesVisited.length >= 3) discoverEgg("theme-hopper");
  }, [themesVisited]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (key === KONAMI[konamiPos.current]) {
        konamiPos.current++;
        if (konamiPos.current === KONAMI.length) {
          konamiPos.current = 0;
          useAppStore.getState().setEffect("konami");
          discoverEgg("konami");
        }
      } else {
        konamiPos.current = key === KONAMI[0] ? 1 : 0;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (phase !== "ready") return;
    let timer: ReturnType<typeof setTimeout>;
    const arm = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const s = useAppStore.getState();
        if (s.mode === "os" && !s.effect && document.visibilityState === "visible") {
          s.setEffect("screensaver");
          discoverEgg("screensaver");
        }
      }, IDLE_MS);
    };
    arm();
    const events = ["pointermove", "pointerdown", "keydown", "wheel"] as const;
    events.forEach((ev) => window.addEventListener(ev, arm, { passive: true }));
    return () => {
      clearTimeout(timer);
      events.forEach((ev) => window.removeEventListener(ev, arm));
    };
  }, [phase]);

  return devHud ? <DevHud /> : null;
}

function DevHud() {
  const [fps, setFps] = useState(0);
  const windows = useAppStore((s) => s.windowOrder.length);
  const theme = useAppStore((s) => s.theme);
  useEffect(() => {
    let frames = 0;
    let last = performance.now();
    let raf = 0;
    const loop = (t: number) => {
      frames++;
      if (t - last > 500) {
        setFps(Math.round((frames * 1000) / (t - last)));
        frames = 0;
        last = t;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div className="absolute z-[2900] left-3 bottom-3 pointer-events-none font-mono text-[11px] leading-tight bg-black/75 text-[#5ef08a] px-2.5 py-1.5 rounded">
      <div>{fps} fps</div>
      <div>{windows} windows · {theme}</div>
      <div>{typeof window !== "undefined" ? `${window.innerWidth}×${window.innerHeight}` : ""}</div>
    </div>
  );
}
