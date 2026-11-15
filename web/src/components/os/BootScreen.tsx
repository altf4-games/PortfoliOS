"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import type { ThemeId } from "@/store/useAppStore";
import { BridgeLogo } from "@/apps/glyphs";
import { PixelIcon } from "@/themes/retro/icons";

const POST_LINES = [
  "PRADYUM BIOS v3.0  (C) 2026 altf4 games",
  "",
  "CPU : Brain @ 4.0GHz (caffeinated)",
  "Memory Test : 655360K OK",
  "",
  "Detecting drives ...",
  "  Primary Master   : PORTFOLIO HDD 98",
  "  Primary Slave    : GAMES.ISO",
  "",
  "Press DEL to enter SETUP. Or don't.",
];

const SYSTEMD = [
  "Starting PortfoliOS kernel 6.11-zen ...",
  "Mounting /home/pradyum ...",
  "Started Network Manager.",
  "Started GitHub API sync (merged PRs).",
  "Reached target Graphical Interface.",
  "Started Hyprland compositor.",
  "Started waybar.",
  "Started hyprpaper.",
  "Reached target Portfolio.",
];

// Each theme's boot sequence. `quick` is the shortened version played on theme switches.
export default function BootScreen({ theme, quick, onDone }: { theme: ThemeId; quick?: boolean; onDone: () => void }) {
  const [step, setStep] = useState(0);
  const total = quick ? 1100 : theme === "retro" ? 3000 : 2200;

  useEffect(() => {
    const t = setTimeout(onDone, total);
    const s = setInterval(() => setStep((v) => v + 1), quick ? 60 : theme === "retro" ? 130 : 150);
    return () => {
      clearTimeout(t);
      clearInterval(s);
    };
  }, [onDone, total, quick, theme]);

  if (theme === "retro") {
    const postDone = quick || step > POST_LINES.length + 4;
    return (
      <motion.div exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="absolute inset-0 z-[3000] bg-black" style={{ fontFamily: "var(--font-pixelify)" }}>
        {!postDone ? (
          <div className="p-8 text-[#c0c0c0] text-[17px] leading-relaxed whitespace-pre">{POST_LINES.slice(0, step).join("\n")}</div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: "#000" }}>
            <div className="flex items-center gap-4">
              <PixelIcon id="logo" className="w-20 h-20 pixelated" />
              <div className="text-white">
                <div className="text-[15px] tracking-[0.3em] opacity-80">PRADYUM&apos;S</div>
                <div className="text-5xl font-bold leading-none">
                  PortfoliOS<span className="text-[#c0c0c0]"> 98</span>
                </div>
              </div>
            </div>
            <div className="mt-14 w-64 h-4 bevel-in bg-black overflow-hidden relative">
              <div className="absolute inset-y-0.5 flex gap-1 animate-[retro-bar_1.2s_linear_infinite]">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-4 h-full bg-[#000080]" />
                ))}
              </div>
            </div>
            <style>{`@keyframes retro-bar{from{transform:translateX(-120px)}to{transform:translateX(280px)}}`}</style>
          </div>
        )}
      </motion.div>
    );
  }

  if (theme === "hypr") {
    return (
      <motion.div exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="absolute inset-0 z-[3000] bg-[#11111b] p-8 text-[13px] text-[#cdd6f4] overflow-hidden" style={{ fontFamily: "var(--font-jetbrains)" }}>
        {SYSTEMD.slice(0, Math.min(step, SYSTEMD.length)).map((l) => (
          <div key={l}>
            <span className="text-[#a6e3a1]">[  OK  ]</span> {l}
          </div>
        ))}
        {step > SYSTEMD.length && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl font-bold text-[#cdd6f4]">hyprland</div>
              <div className="text-[#6c7086] mt-2">pradyum@portfolios · tty1</div>
            </div>
          </motion.div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="absolute inset-0 z-[3000] bg-black flex flex-col items-center justify-center">
      <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
        <BridgeLogo className="w-20 h-20 text-white" />
      </motion.div>
      <div className="mt-12 w-48 h-[5px] rounded-full bg-white/20 overflow-hidden">
        <motion.div className="h-full bg-white rounded-full" initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: total / 1000 - 0.2, ease: [0.4, 0, 0.6, 1] }} />
      </div>
    </motion.div>
  );
}
