"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";
import ForceLandscape from "@/components/ForceLandscape";
import Desktop from "@/components/os/Desktop";
import AudioManager from "@/components/AudioManager";

const SceneCanvas = dynamic(() => import("@/components/scene/SceneCanvas"), { ssr: false });

export default function Home() {
  const mode = useAppStore((s) => s.mode);
  const toggleMode = useAppStore((s) => s.toggleMode);
  const disable3D = useAppStore((s) => s.disable3D);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        toggleMode();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggleMode]);

  return (
    <ForceLandscape>
      <main className="relative w-full h-dvh overflow-hidden bg-black select-none">
        <AudioManager />
        {!disable3D && <SceneCanvas />}

        {mode === "explore" && !disable3D && (
          <button
            onClick={toggleMode}
            className="absolute bottom-4 right-4 z-10 pointer-events-auto text-xs font-mono text-white/70 bg-black/50 border border-white/10 rounded-full px-3 py-1.5 backdrop-blur"
          >
            Esc to return to desktop
          </button>
        )}

        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            mode === "os" ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <Desktop />
        </div>
      </main>
    </ForceLandscape>
  );
}
