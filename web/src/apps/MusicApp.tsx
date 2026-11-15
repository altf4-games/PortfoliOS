"use client";

import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { audioBus } from "@/components/AudioManager";

function fmt(t: number) {
  if (!isFinite(t)) return "0:00";
  return `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
}

export default function MusicApp() {
  const playing = useAppStore((s) => s.musicPlaying);
  const setPlaying = useAppStore((s) => s.setMusicPlaying);
  const volume = useAppStore((s) => s.volume);
  const setVolume = useAppStore((s) => s.setVolume);
  const theme = useAppStore((s) => s.theme);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [time, setTime] = useState({ cur: 0, dur: 0 });

  useEffect(() => {
    const id = setInterval(() => {
      const el = audioBus.el;
      if (el) setTime({ cur: el.currentTime, dur: el.duration });
    }, 500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    const data = new Uint8Array(64);
    const styles = getComputedStyle(canvas);
    const accent = styles.getPropertyValue("--ui-fg").trim() || "#fff";
    const draw = (t: number) => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);
      const analyser = audioBus.analyser;
      if (analyser && playing) analyser.getByteFrequencyData(data);
      const bars = 32;
      const bw = width / bars;
      for (let i = 0; i < bars; i++) {
        // Idle shimmer when nothing is playing, real spectrum when it is.
        const v = playing && analyser ? data[i] / 255 : 0.08 + 0.05 * Math.sin(t / 600 + i * 0.5);
        const h = Math.max(3, v * height);
        ctx.fillStyle = accent;
        ctx.globalAlpha = 0.85;
        if (theme === "retro") ctx.fillRect(Math.round(i * bw), Math.round(height - h), Math.ceil(bw - 2), Math.ceil(h));
        else {
          ctx.beginPath();
          ctx.roundRect(i * bw + 1.5, height - h, bw - 3, h, 3);
          ctx.fill();
        }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [playing, theme]);

  const retro = theme === "retro";

  return (
    <div className="ui-app h-full flex flex-col p-5 gap-4">
      <div
        className={`relative aspect-square w-full max-w-[240px] mx-auto overflow-hidden ${retro ? "bevel-in" : "rounded-xl"}`}
        style={{ background: retro ? "#000" : "#2c2c2e" }}
      >
        <div
          className="absolute inset-[14%] rounded-full border border-white/10"
          style={{ background: "#111", animation: playing ? "spin 4s linear infinite" : undefined }}
        >
          <div className="absolute inset-[12%] rounded-full border border-white/5" />
          <div className="absolute inset-[24%] rounded-full border border-white/5" />
          <div className="absolute inset-[36%] rounded-full" style={{ background: "var(--ui-accent)" }}>
            <div className="absolute inset-[42%] rounded-full bg-[#111]" />
          </div>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>

      <div className="text-center">
        <div className="ui-heading text-[16px]">Late Night Lo-fi</div>
        <div className="ui-muted text-[13px]">PortfoliOS Radio</div>
      </div>

      <canvas ref={canvasRef} width={320} height={56} className="w-full h-14" />

      <div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--ui-card-hover)" }}>
          <div className="h-full" style={{ width: `${time.dur ? (time.cur / time.dur) * 100 : 0}%`, background: "var(--ui-fg)" }} />
        </div>
        <div className="flex justify-between text-[11px] ui-faint mt-1 tabular-nums">
          <span>{fmt(time.cur)}</span>
          <span>{fmt(time.dur)}</span>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={() => {
            if (!playing && volume === 0) setVolume(0.3);
            setPlaying(!playing);
          }}
          className="ui-btn !w-12 !h-12 !p-0 !rounded-full text-lg"
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? "❚❚" : "▶"}
        </button>
      </div>

      <label className="flex items-center gap-3 text-[12px] ui-muted">
        <svg viewBox="0 0 16 16" className="w-4 h-4" fill="currentColor"><path d="M3 6h2l3-3v10L5 10H3z" /></svg>
        <input type="range" min={0} max={1} step={0.01} value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="flex-1" style={{ accentColor: "var(--ui-accent)" }} />
        <svg viewBox="0 0 16 16" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M3 6h2l3-3v10L5 10H3z" fill="currentColor" stroke="none" /><path d="M10.5 5.5a3.5 3.5 0 0 1 0 5M12.5 3.5a6.5 6.5 0 0 1 0 9" /></svg>
      </label>
      {volume === 0 && <p className="text-[11px] ui-faint text-center -mt-2">Muted by default. Press play or raise the volume.</p>}
    </div>
  );
}
