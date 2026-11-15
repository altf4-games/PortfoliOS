import { GLYPHS } from "@/apps/glyphs";
import type { WindowId } from "@/apps/meta";

// Catppuccin Mocha accents, one per app, like a riced icon theme.
export const HYPR_COLORS: Record<WindowId, string> = {
  about: "#f5c2e7",
  projects: "#89b4fa",
  experience: "#cba6f7",
  oss: "#a6e3a1",
  trophies: "#f9e2af",
  games: "#f38ba8",
  stats: "#94e2d5",
  research: "#74c7ec",
  resume: "#fab387",
  files: "#89dceb",
  terminal: "#a6e3a1",
  music: "#eba0ac",
  arcade: "#fab387",
  settings: "#bac2de",
};

export function HyprIcon({ id, className }: { id: WindowId; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke={HYPR_COLORS[id]}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: HYPR_COLORS[id] }}
      aria-hidden="true"
    >
      {GLYPHS[id]}
    </svg>
  );
}
