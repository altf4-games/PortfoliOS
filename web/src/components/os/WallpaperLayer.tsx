"use client";

import { AnimatePresence, motion } from "motion/react";
import { useAppStore } from "@/store/useAppStore";
import { resolveWallpaper } from "@/lib/wallpapers";

// Crossfades on change. Pixel-art wallpapers are tiny PNGs scaled up with nearest-neighbor
// so they stay crisp at any resolution.
export default function WallpaperLayer() {
  const theme = useAppStore((s) => s.theme);
  const wallpapers = useAppStore((s) => s.wallpapers);
  const custom = useAppStore((s) => s.customWallpaper);
  const wp = resolveWallpaper(theme, wallpapers, custom);

  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      <AnimatePresence initial={false}>
        <motion.div
          key={wp.url}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
          className={`absolute inset-0 bg-cover bg-center ${wp.pixel ? "pixelated" : ""}`}
          style={{ backgroundImage: `url(${wp.url})` }}
        />
      </AnimatePresence>
    </div>
  );
}
