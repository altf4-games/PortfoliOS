"use client";

import { useEffect, useRef } from "react";
import { useAppStore } from "@/store/useAppStore";

// One shared audio graph: <audio> → analyser → gain → speakers. The analyser sits before
// the gain so the Music app's visualizer still moves while volume is 0 (the default).
export const audioBus: {
  el: HTMLAudioElement | null;
  ctx: AudioContext | null;
  analyser: AnalyserNode | null;
  gain: GainNode | null;
} = { el: null, ctx: null, analyser: null, gain: null };

function ensureGraph() {
  if (audioBus.ctx || !audioBus.el) return;
  try {
    const ctx = new AudioContext();
    const src = ctx.createMediaElementSource(audioBus.el);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 128;
    analyser.smoothingTimeConstant = 0.8;
    const gain = ctx.createGain();
    gain.gain.value = useAppStore.getState().volume;
    src.connect(analyser);
    analyser.connect(gain);
    gain.connect(ctx.destination);
    audioBus.el.volume = 1;
    Object.assign(audioBus, { ctx, analyser, gain });
  } catch {
    // Web Audio unavailable; fall back to the element's own volume.
  }
}

export default function AudioManager() {
  const volume = useAppStore((s) => s.volume);
  const playing = useAppStore((s) => s.musicPlaying);
  const setPlaying = useAppStore((s) => s.setMusicPlaying);
  const ref = useRef<HTMLAudioElement | null>(null);
  const prevVolume = useRef(volume);

  useEffect(() => {
    audioBus.el = ref.current;
  }, []);

  useEffect(() => {
    if (audioBus.gain) audioBus.gain.gain.value = volume;
    else if (ref.current) ref.current.volume = volume;
    // Raising the volume from 0 is a clear "I want sound" gesture: start the music.
    if (prevVolume.current === 0 && volume > 0 && !useAppStore.getState().musicPlaying) setPlaying(true);
    prevVolume.current = volume;
  }, [volume, setPlaying]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (playing) {
      ensureGraph();
      audioBus.ctx?.resume().catch(() => {});
      el.play().catch(() => setPlaying(false));
    } else {
      el.pause();
    }
  }, [playing, setPlaying]);

  return <audio ref={ref} src="/audio/lofi.mp3" loop preload="none" />;
}
