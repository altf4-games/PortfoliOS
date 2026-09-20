"use client";

import { useRef, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { WALLPAPERS } from "@/lib/wallpapers";

const MAX_CUSTOM_WALLPAPER_BYTES = 4 * 1024 * 1024;

export default function SettingsWindow() {
  const volume = useAppStore((s) => s.volume);
  const setVolume = useAppStore((s) => s.setVolume);
  const disable3D = useAppStore((s) => s.disable3D);
  const setDisable3D = useAppStore((s) => s.setDisable3D);

  const wallpaperId = useAppStore((s) => s.wallpaperId);
  const customWallpaper = useAppStore((s) => s.customWallpaper);
  const setWallpaperId = useAppStore((s) => s.setWallpaperId);
  const setCustomWallpaper = useAppStore((s) => s.setCustomWallpaper);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);

    if (file.size > MAX_CUSTOM_WALLPAPER_BYTES) {
      setUploadError("Image too large — keep it under 4MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setCustomWallpaper(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div className="p-4 text-white space-y-6 text-sm">
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

      <div className="space-y-2">
        <span className="text-white/70">Wallpaper</span>
        <div className="grid grid-cols-4 gap-2">
          {WALLPAPERS.map((wp) => (
            <button
              key={wp.id}
              onClick={() => setWallpaperId(wp.id)}
              title={wp.name}
              className={`aspect-video rounded-md bg-cover bg-center border-2 transition-colors ${
                !customWallpaper && wallpaperId === wp.id ? "border-cyan-400" : "border-transparent hover:border-white/30"
              }`}
              style={{ backgroundImage: `url(${wp.url})` }}
            />
          ))}
          <button
            onClick={() => fileInputRef.current?.click()}
            title="Upload custom wallpaper"
            className={`aspect-video rounded-md border-2 flex items-center justify-center text-white/60 text-lg bg-white/5 ${
              customWallpaper ? "border-cyan-400" : "border-dashed border-white/20 hover:border-white/40"
            }`}
            style={customWallpaper ? { backgroundImage: `url(${customWallpaper})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
          >
            {!customWallpaper && "+"}
          </button>
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={onFileChange} className="hidden" />
        {uploadError && <p className="text-xs text-red-400">{uploadError}</p>}
        <p className="text-xs text-white/40">Custom wallpaper is stored locally in this browser only.</p>
      </div>
    </div>
  );
}
