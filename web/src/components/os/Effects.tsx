"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { useAppStore } from "@/store/useAppStore";
import { useSiteData } from "@/lib/useSiteData";

function useCanvasLoop(draw: (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => void, init?: (w: number, h: number) => void) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    const resize = () => {
      c.width = window.innerWidth;
      c.height = window.innerHeight;
      init?.(c.width, c.height);
    };
    resize();
    window.addEventListener("resize", resize);
    let raf = 0;
    const loop = (t: number) => {
      draw(ctx, c.width, c.height, t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
    // draw/init are module-stable closures per effect instance
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return ref;
}

function Matrix({ onExit }: { onExit: () => void }) {
  const cols = useRef<number[]>([]);
  const ref = useCanvasLoop(
    (ctx, w, h) => {
      ctx.fillStyle = "rgba(0,0,0,0.08)";
      ctx.fillRect(0, 0, w, h);
      ctx.font = "16px monospace";
      cols.current.forEach((y, i) => {
        const ch = String.fromCharCode(0x30a0 + Math.floor(Math.random() * 96));
        ctx.fillStyle = Math.random() > 0.97 ? "#d9ffe0" : "#22e06b";
        ctx.fillText(ch, i * 16, y * 16);
        cols.current[i] = y * 16 > h && Math.random() > 0.975 ? 0 : y + 1;
      });
    },
    (w) => {
      cols.current = Array.from({ length: Math.ceil(w / 16) }, () => Math.floor(Math.random() * -50));
    }
  );
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[2500] bg-black cursor-pointer" onClick={onExit}>
      <canvas ref={ref} className="absolute inset-0" />
      <div className="absolute bottom-6 inset-x-0 text-center text-[#22e06b] font-mono text-sm opacity-70">Wake up, visitor… (click to exit)</div>
    </motion.div>
  );
}

function Screensaver({ onExit }: { onExit: () => void }) {
  const stars = useRef<{ x: number; y: number; z: number }[]>([]);
  const ref = useCanvasLoop(
    (ctx, w, h) => {
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.fillRect(0, 0, w, h);
      for (const s of stars.current) {
        s.z -= 6;
        if (s.z <= 1) {
          s.x = (Math.random() - 0.5) * w;
          s.y = (Math.random() - 0.5) * h;
          s.z = w;
        }
        const k = 260 / s.z;
        const x = s.x * k + w / 2;
        const y = s.y * k + h / 2;
        const r = Math.max(0.5, (1 - s.z / w) * 3);
        ctx.fillStyle = `rgba(255,${200 + Math.floor((1 - s.z / w) * 55)},180,${1 - s.z / w})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    (w, h) => {
      stars.current = Array.from({ length: 600 }, () => ({ x: (Math.random() - 0.5) * w, y: (Math.random() - 0.5) * h, z: Math.random() * w }));
    }
  );
  useEffect(() => {
    const exit = () => onExit();
    const t = setTimeout(() => {
      window.addEventListener("pointermove", exit, { once: true });
      window.addEventListener("keydown", exit, { once: true });
      window.addEventListener("pointerdown", exit, { once: true });
    }, 400);
    return () => {
      clearTimeout(t);
      window.removeEventListener("pointermove", exit);
      window.removeEventListener("keydown", exit);
      window.removeEventListener("pointerdown", exit);
    };
  }, [onExit]);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 1.5 } }} exit={{ opacity: 0 }} className="absolute inset-0 z-[2500] bg-black">
      <canvas ref={ref} className="absolute inset-0" />
      <motion.div className="absolute text-white/80 font-semibold text-lg tracking-widest" animate={{ x: ["10vw", "70vw", "30vw", "10vw"], y: ["20vh", "60vh", "80vh", "20vh"] }} transition={{ duration: 24, repeat: Infinity, ease: "linear" }}>
        PortfoliOS
      </motion.div>
    </motion.div>
  );
}

function Confetti() {
  const parts = useRef<{ x: number; y: number; vx: number; vy: number; r: number; c: string; a: number; va: number }[]>([]);
  const ref = useCanvasLoop(
    (ctx, w, h) => {
      ctx.clearRect(0, 0, w, h);
      for (const p of parts.current) {
        p.vy += 0.12;
        p.x += p.vx;
        p.y += p.vy;
        p.a += p.va;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.a);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
        ctx.restore();
      }
    },
    (w, h) => {
      const colors = ["#ffb547", "#ff5a36", "#5ac8fa", "#34c759", "#cba6f7", "#f5c2e7", "#ffe07a"];
      parts.current = Array.from({ length: 220 }, () => ({
        x: w / 2 + (Math.random() - 0.5) * 200,
        y: h * 0.55,
        vx: (Math.random() - 0.5) * 18,
        vy: -Math.random() * 16 - 6,
        r: 3 + Math.random() * 5,
        c: colors[Math.floor(Math.random() * colors.length)],
        a: Math.random() * 6,
        va: (Math.random() - 0.5) * 0.3,
      }));
    }
  );
  return <canvas ref={ref} className="absolute inset-0 z-[2600] pointer-events-none" />;
}

function Crash({ onExit }: { onExit: () => void }) {
  useEffect(() => {
    const t = setTimeout(() => {
      window.addEventListener("keydown", onExit, { once: true });
      window.addEventListener("pointerdown", onExit, { once: true });
    }, 500);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onExit);
      window.removeEventListener("pointerdown", onExit);
    };
  }, [onExit]);
  return (
    <div className="absolute inset-0 z-[2800] bg-[#0000aa] text-white flex items-center justify-center p-10" style={{ fontFamily: "var(--font-pixelify)" }}>
      <div className="max-w-2xl text-[18px] leading-relaxed">
        <div className="text-center mb-6">
          <span className="bg-[#aaaaaa] text-[#0000aa] px-2">PortfoliOS</span>
        </div>
        <p>A fatal exception 0xALTF4 has occurred at 0028:C0FFEE42 in VXD PORTFOLIO(01). The current application will be terminated.</p>
        <p className="mt-4">* Press any key to restart PortfoliOS.</p>
        <p>* Press CTRL+ALT+DEL to hire the developer. You will lose any unsaved doubts about his skills.</p>
        <p className="mt-8 text-center">Press any key to continue _</p>
      </div>
    </div>
  );
}

function HireLetter({ onExit }: { onExit: () => void }) {
  const site = useSiteData();
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[2550] bg-black/50 backdrop-blur-sm flex items-center justify-center p-6" onClick={onExit}>
      <motion.div
        initial={{ y: 40, rotate: -3, opacity: 0 }}
        animate={{ y: 0, rotate: -1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
        className="w-full max-w-md bg-[#fbf8f1] text-[#222] p-8 shadow-2xl rounded-sm"
        style={{ fontFamily: "Georgia, serif" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-[11px] tracking-[0.3em] text-[#999]">OFFER OF EMPLOYMENT</div>
        <h2 className="text-2xl mt-2">Dear Recruiter,</h2>
        <p className="mt-4 text-[15px] leading-relaxed">
          Congratulations! You have been selected to hire <b>{site?.profile.name ?? "Pradyum Mistry"}</b>. Benefits include full-stack range, shipped games played by millions, merged PRs at Microsoft and Ultralytics, and a portfolio with three operating systems.
        </p>
        <p className="mt-4 text-[15px]">Please sign below and send it over.</p>
        <div className="mt-6 flex items-end justify-between gap-4">
          <div className="border-b border-[#222] flex-1 pb-1 italic text-[#777]">your signature</div>
          {site && (
            <a href={site.profile.linkedinUrl} target="_blank" rel="noreferrer" className="px-4 py-2 bg-[#222] text-white text-sm rounded-sm hover:bg-black">
              Reach out →
            </a>
          )}
        </div>
      </motion.div>
      <Confetti />
    </motion.div>
  );
}

export default function Effects() {
  const effect = useAppStore((s) => s.effect);
  const setEffect = useAppStore((s) => s.setEffect);
  const setPhase = useAppStore((s) => s.setPhase);
  const closeAll = useAppStore((s) => s.closeAll);
  const clear = () => setEffect(null);

  useEffect(() => {
    if (effect === "konami") {
      const t = setTimeout(() => setEffect(null), 4500);
      return () => clearTimeout(t);
    }
    if (effect === "barrel") {
      const t = setTimeout(() => setEffect(null), 1400);
      return () => clearTimeout(t);
    }
    if (effect === "meltdown") {
      const t = setTimeout(() => setEffect(null), 4200);
      return () => clearTimeout(t);
    }
  }, [effect, setEffect]);

  if (effect === "matrix") return <Matrix onExit={clear} />;
  if (effect === "screensaver") return <Screensaver onExit={clear} />;
  if (effect === "konami") return <Confetti />;
  if (effect === "hire") return <HireLetter onExit={clear} />;
  if (effect === "crash")
    return (
      <Crash
        onExit={() => {
          setEffect(null);
          closeAll();
          setPhase("boot");
        }}
      />
    );
  if (effect === "meltdown")
    return (
      <motion.div className="absolute inset-0 z-[2400] pointer-events-none flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: [0, 0, 1, 1, 0] }} transition={{ duration: 4.2, times: [0, 0.35, 0.45, 0.85, 1] }}>
        <div className="bg-black/80 text-[#ff5555] font-mono px-8 py-6 rounded-lg text-center">
          <div className="text-xl font-bold">Kernel panic: not syncing: / deleted</div>
          <div className="text-white/70 mt-2 text-sm">Just kidding. Restoring from backup…</div>
        </div>
      </motion.div>
    );
  return null;
}
