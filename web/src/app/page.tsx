"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useProgress } from "@react-three/drei";
import { useAppStore } from "@/store/useAppStore";
import { useIsMobile } from "@/lib/useIsMobile";
import Desktop from "@/components/os/Desktop";
import AudioManager from "@/components/AudioManager";
import GlobalEffects from "@/components/os/GlobalEffects";
import { BridgeLogo } from "@/apps/glyphs";

const SceneCanvas = dynamic(() => import("@/components/scene/SceneCanvas"), { ssr: false });
const PhoneOS = dynamic(() => import("@/components/phone/PhoneOS"), { ssr: false });

const INTRO_KEY = "portfolios-intro-seen";

function LoadingScreen() {
  const { progress } = useProgress();
  return (
    <motion.div exit={{ opacity: 0, transition: { duration: 0.8 } }} className="absolute inset-0 z-[4000] bg-black flex flex-col items-center justify-center text-white">
      <BridgeLogo className="w-14 h-14 opacity-90" />
      <div className="mt-8 w-56 h-[3px] rounded-full bg-white/15 overflow-hidden">
        <div className="h-full bg-white transition-[width] duration-300" style={{ width: `${Math.max(4, progress)}%` }} />
      </div>
      <div className="mt-3 text-[11px] text-white/40 font-mono tabular-nums">loading the room · {Math.round(progress)}%</div>
    </motion.div>
  );
}

function ExploreHud() {
  const setMode = useAppStore((s) => s.setMode);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0, transition: { delay: 0.6 } }}
      exit={{ opacity: 0 }}
      className="absolute bottom-5 inset-x-0 z-20 flex justify-center pointer-events-none"
    >
      <div className="pointer-events-auto flex items-center gap-4 rounded-full bg-black/55 backdrop-blur-xl border border-white/10 px-5 py-2.5 text-[12px] text-white/75">
        <span>Drag to look</span>
        <span className="text-white/25">·</span>
        <span>Scroll to zoom</span>
        <span className="text-white/25">·</span>
        <span>Click the glowing markers</span>
        <button onClick={() => setMode("os")} className="ml-1 rounded-full bg-white text-black font-semibold px-3 py-1 hover:bg-white/85">
          Back to desktop <kbd className="ml-1 text-black/50">esc</kbd>
        </button>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const mode = useAppStore((s) => s.mode);
  const phase = useAppStore((s) => s.phase);
  const setPhase = useAppStore((s) => s.setPhase);
  const disable3D = useAppStore((s) => s.disable3D);
  const isMobile = useIsMobile();
  const { progress, active } = useProgress();

  // Without the 3D room there's nothing to load or fly through: go straight to boot.
  useEffect(() => {
    if (phase === "loading" && (disable3D || isMobile)) setPhase("boot");
  }, [phase, disable3D, isMobile, setPhase]);

  useEffect(() => {
    if (phase !== "loading" || disable3D || isMobile) return;
    if (progress >= 100 && !active) {
      const t = setTimeout(() => {
        let seen = false;
        try {
          seen = sessionStorage.getItem(INTRO_KEY) === "1";
          sessionStorage.setItem(INTRO_KEY, "1");
        } catch {}
        setPhase(seen ? "boot" : "intro");
      }, 300);
      return () => clearTimeout(t);
    }
  }, [phase, progress, active, disable3D, isMobile, setPhase]);

  if (isMobile) {
    return (
      <main className="relative w-full h-dvh overflow-hidden bg-black select-none">
        <AudioManager />
        <PhoneOS />
      </main>
    );
  }

  const showDesktop = phase === "boot" || (phase === "ready" && mode === "os");

  return (
    <main className="relative w-full h-dvh overflow-hidden bg-black select-none">
      <AudioManager />
      <GlobalEffects />
      {!disable3D && <SceneCanvas />}

      <AnimatePresence>{phase === "loading" && !disable3D && <LoadingScreen key="loading" />}</AnimatePresence>
      <AnimatePresence>{phase === "ready" && mode === "explore" && !disable3D && <ExploreHud key="hud" />}</AnimatePresence>

      {phase === "intro" && (
        <button onClick={() => setPhase("boot")} className="absolute z-30 bottom-6 right-6 text-[12px] text-white/60 hover:text-white bg-black/40 backdrop-blur rounded-full px-4 py-1.5 border border-white/10">
          Skip intro →
        </button>
      )}

      <div
        className={`absolute inset-0 transition-[opacity,transform] duration-700 ease-out ${
          showDesktop ? "opacity-100 scale-100" : "opacity-0 scale-[1.03] pointer-events-none invisible"
        }`}
      >
        {phase !== "loading" && phase !== "intro" && <Desktop />}
      </div>
    </main>
  );
}
