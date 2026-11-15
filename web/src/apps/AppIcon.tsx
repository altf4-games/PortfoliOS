"use client";

import { useAppStore } from "@/store/useAppStore";
import { GoldenIcon } from "@/themes/golden/icons";
import { PixelIcon } from "@/themes/retro/icons";
import { HyprIcon } from "@/themes/hypr/icons";
import type { WindowId } from "./meta";

// The current theme's icon for an app. Used inside apps (Files, Spotlight results, etc.)
// so they pick up the right look without knowing which theme is active.
export function AppIcon({ id, className }: { id: WindowId; className?: string }) {
  const theme = useAppStore((s) => s.theme);
  if (theme === "retro") return <PixelIcon id={id} className={`pixelated ${className ?? ""}`} />;
  if (theme === "hypr") return <HyprIcon id={id} className={className} />;
  return <GoldenIcon id={id} className={className} />;
}
