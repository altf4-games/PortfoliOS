"use client";

import { useAppStore } from "@/store/useAppStore";

export default function SettingsWindow() {
  const volume = useAppStore((s) => s.volume);
  const setVolume = useAppStore((s) => s.setVolume);
  const disable3D = useAppStore((s) => s.disable3D);
  const setDisable3D = useAppStore((s) => s.setDisable3D);

  return (
    <div className="p-4 text-white space-y-5 text-sm">
      <div>
        <label className="flex justify-between mb-1 text-white/70">
          <span>Volume</span>
          <span>{Math.round(volume * 100)}%</span>
        </label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="w-full accent-cyan-400"
        />
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={disable3D}
          onChange={(e) => setDisable3D(e.target.checked)}
          className="accent-cyan-400"
        />
        <span>Disable 3D (OS-only mode, better for low-end devices)</span>
      </label>
    </div>
  );
}
