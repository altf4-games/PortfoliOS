export interface Wallpaper {
  id: string;
  name: string;
  url: string;
}

export const WALLPAPERS: Wallpaper[] = [
  { id: "minimal-gradient", name: "Minimal Gradient", url: "/wallpapers/minimal-gradient.webp" },
  { id: "wallpaper-1", name: "Skyline", url: "/wallpapers/wallpaper-1.webp" },
  { id: "wallpaper-2", name: "Dusk", url: "/wallpapers/wallpaper-2.webp" },
  { id: "cyberpunk", name: "Cyberpunk", url: "/wallpapers/cyberpunk.webp" },
  { id: "ink-wave", name: "Ink Wave", url: "/wallpapers/ink-wave.webp" },
  { id: "japan", name: "Japan", url: "/wallpapers/japan.webp" },
  { id: "ign-colorful", name: "Colorful", url: "/wallpapers/ign-colorful.webp" },
];

export const DEFAULT_WALLPAPER_ID = "minimal-gradient";

export function resolveWallpaperUrl(wallpaperId: string, customWallpaper: string | null): string {
  return customWallpaper ?? WALLPAPERS.find((w) => w.id === wallpaperId)?.url ?? WALLPAPERS[0].url;
}
