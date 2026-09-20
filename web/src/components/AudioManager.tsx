"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";

export default function AudioManager() {
  const volume = useAppStore((s) => s.volume);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    // Browsers block audio with sound until a user gesture, so start playback on
    // the first interaction anywhere on the page instead of trying (and failing)
    // to autoplay on load.
    function startOnFirstInteraction() {
      audioRef.current?.play().catch(() => {});
      window.removeEventListener("pointerdown", startOnFirstInteraction);
      window.removeEventListener("keydown", startOnFirstInteraction);
    }
    window.addEventListener("pointerdown", startOnFirstInteraction);
    window.addEventListener("keydown", startOnFirstInteraction);
    return () => {
      window.removeEventListener("pointerdown", startOnFirstInteraction);
      window.removeEventListener("keydown", startOnFirstInteraction);
    };
  }, []);

  return <audio ref={audioRef} src="/audio/lofi.mp3" loop preload="auto" />;
}
