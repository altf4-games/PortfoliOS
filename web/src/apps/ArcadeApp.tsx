"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAppStore, type ThemeId } from "@/store/useAppStore";
import { discoverEgg } from "@/lib/eggs";

// Stacker: drop the sliding block onto the tower; whatever overhangs is sliced off.
// Original one-button game, themed per desktop.
const W = 360;
const H = 540;
const BLOCK_H = 22;
const BEST_KEY = "portfolios-stacker-best";

interface Block {
  x: number;
  w: number;
  color: string;
}
interface Debris {
  x: number;
  y: number;
  w: number;
  vy: number;
  color: string;
}

const PALETTES: Record<ThemeId, (i: number) => string> = {
  golden: (i) => ["#0a84ff", "#30d158", "#ffd60a", "#ff9f0a", "#ff453a", "#bf5af2", "#64d2ff"][i % 7],
  retro: (i) => ["#ff0000", "#ffff00", "#00ff00", "#00ffff", "#0000ff", "#ff00ff"][i % 6],
  hypr: (i) => ["#89dceb", "#89b4fa", "#cba6f7", "#f5c2e7", "#f38ba8", "#fab387", "#f9e2af", "#a6e3a1"][i % 8],
};
const BG: Record<ThemeId, string> = {
  golden: "#1c1c1e",
  retro: "#000080",
  hypr: "#1e1e2e",
};

export default function ArcadeApp() {
  const theme = useAppStore((s) => s.theme);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<"ready" | "playing" | "over">("ready");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(() => {
    if (typeof window === "undefined") return 0;
    return Number(localStorage.getItem(BEST_KEY) ?? 0);
  });

  const game = useRef({
    stack: [] as Block[],
    moving: { x: 0, w: 200, color: "" } as Block,
    dir: 1,
    speed: 2.2,
    debris: [] as Debris[],
    cam: 0,
  });

  const reset = useCallback(() => {
    const pal = PALETTES[theme];
    game.current = {
      stack: [{ x: (W - 200) / 2, w: 200, color: pal(0) }],
      moving: { x: 0, w: 200, color: pal(1) },
      dir: 1,
      speed: 2.2,
      debris: [],
      cam: 0,
    };
    setScore(0);
  }, [theme]);

  // reset() only seeds the mutable game ref and score; running it once on mount is the
  // intent, not a cascading-render pattern.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => reset(), [reset]);

  const drop = useCallback(() => {
    if (state === "ready" || state === "over") {
      reset();
      setState("playing");
      return;
    }
    const g = game.current;
    const top = g.stack[g.stack.length - 1];
    const left = Math.max(top.x, g.moving.x);
    const right = Math.min(top.x + top.w, g.moving.x + g.moving.w);
    const overlap = right - left;
    const y = H - (g.stack.length + 1) * BLOCK_H;
    if (overlap <= 0) {
      g.debris.push({ x: g.moving.x, y, w: g.moving.w, vy: 0, color: g.moving.color });
      setState("over");
      const s = g.stack.length - 1;
      if (s > best) {
        setBest(s);
        try {
          localStorage.setItem(BEST_KEY, String(s));
        } catch {}
      }
      return;
    }
    // Near-perfect drops snap and keep their width, a small reward for precision.
    const perfect = Math.abs(g.moving.x - top.x) < 3;
    const placed = perfect ? { ...top, color: g.moving.color } : { x: left, w: overlap, color: g.moving.color };
    if (!perfect) {
      const cutX = g.moving.x < top.x ? g.moving.x : right;
      const cutW = g.moving.w - overlap;
      g.debris.push({ x: cutX, y, w: cutW, vy: 0, color: g.moving.color });
    }
    g.stack.push(placed);
    const s = g.stack.length - 1;
    setScore(s);
    if (s >= 15) discoverEgg("arcade-15");
    g.speed = Math.min(7, 2.2 + s * 0.18);
    g.dir = s % 2 ? -1 : 1;
    g.moving = { x: g.dir === 1 ? -placed.w : W, w: placed.w, color: PALETTES[theme](s + 1) };
  }, [state, best, reset, theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    let raf = 0;
    const loop = () => {
      const g = game.current;
      if (state === "playing") {
        g.moving.x += g.speed * g.dir;
        if (g.moving.x + g.moving.w > W + 40 && g.dir === 1) g.dir = -1;
        if (g.moving.x < -40 && g.dir === -1) g.dir = 1;
      }
      const targetCam = Math.max(0, g.stack.length * BLOCK_H - H * 0.55);
      g.cam += (targetCam - g.cam) * 0.1;

      ctx.fillStyle = BG[theme];
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.translate(0, g.cam);
      const drawBlock = (b: { x: number; w: number; color: string }, y: number) => {
        ctx.fillStyle = b.color;
        ctx.fillRect(Math.round(b.x), Math.round(y), Math.round(b.w), BLOCK_H - (theme === "retro" ? 0 : 2));
        if (theme === "retro") {
          ctx.strokeStyle = "#000";
          ctx.strokeRect(Math.round(b.x) + 0.5, Math.round(y) + 0.5, Math.round(b.w) - 1, BLOCK_H - 1);
        }
      };
      g.stack.forEach((b, i) => drawBlock(b, H - (i + 1) * BLOCK_H));
      if (state === "playing") drawBlock(g.moving, H - (g.stack.length + 1) * BLOCK_H);
      g.debris = g.debris.filter((d) => d.y - g.cam < H + 40);
      for (const d of g.debris) {
        d.vy += 0.5;
        d.y += d.vy;
        ctx.globalAlpha = 0.85;
        drawBlock(d, d.y);
        ctx.globalAlpha = 1;
      }
      ctx.restore();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [state, theme]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" && document.activeElement?.closest("[data-arcade]")) {
        e.preventDefault();
        drop();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drop]);

  const font = theme === "retro" ? "var(--font-pixelify)" : theme === "hypr" ? "var(--font-jetbrains)" : "var(--font-geist-sans)";

  return (
    <div data-arcade tabIndex={0} className="ui-app relative h-full flex items-center justify-center outline-none select-none" style={{ background: BG[theme] }} onPointerDown={drop}>
      <canvas ref={canvasRef} width={W} height={H} className={`max-h-full max-w-full ${theme === "retro" ? "pixelated" : ""}`} style={{ aspectRatio: `${W}/${H}` }} />
      <div className="absolute top-4 inset-x-0 text-center pointer-events-none text-white" style={{ fontFamily: font }}>
        <div className="text-5xl font-bold tabular-nums">{score}</div>
        <div className="text-[11px] opacity-60 mt-1">best {best}</div>
      </div>
      {state !== "playing" && (
        <div className="absolute inset-x-0 bottom-16 text-center text-white pointer-events-none" style={{ fontFamily: font }}>
          <div className="text-2xl font-bold">{state === "over" ? "Tower toppled" : "Stacker"}</div>
          <div className="text-[13px] opacity-75 mt-1">Click, tap, or press Space {state === "over" ? "to retry" : "to start"}</div>
          <div className="text-[11px] opacity-50 mt-2">Reach 15 for a surprise.</div>
        </div>
      )}
    </div>
  );
}
