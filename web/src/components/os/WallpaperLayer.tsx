"use client";

import { useAppStore } from "@/store/useAppStore";
import { WALLPAPERS } from "@/lib/wallpapers";

export default function WallpaperLayer() {
  const wallpaperId = useAppStore((s) => s.wallpaperId);
  const customWallpaper = useAppStore((s) => s.customWallpaper);

  const url = customWallpaper ?? WALLPAPERS.find((w) => w.id === wallpaperId)?.url ?? WALLPAPERS[0].url;

  return (
    <div
      className="absolute inset-0 bg-cover bg-center"
      style={{ backgroundImage: `url(${url})` }}
    />
  );
}
