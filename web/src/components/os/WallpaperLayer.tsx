"use client";

import { useAppStore } from "@/store/useAppStore";
import { resolveWallpaperUrl } from "@/lib/wallpapers";

export default function WallpaperLayer() {
  const wallpaperId = useAppStore((s) => s.wallpaperId);
  const customWallpaper = useAppStore((s) => s.customWallpaper);
  const url = resolveWallpaperUrl(wallpaperId, customWallpaper);

  return <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${url})` }} />;
}
