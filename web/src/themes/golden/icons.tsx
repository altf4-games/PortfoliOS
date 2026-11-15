import { GLYPHS } from "@/apps/glyphs";
import type { WindowId } from "@/apps/meta";

// Original artwork, not Apple's icons.
const TILES: Record<WindowId, { bg: string; fg?: string }> = {
  about: { bg: "#8e8e93" },
  projects: { bg: "#0a84ff" },
  experience: { bg: "#5e5ce6" },
  oss: { bg: "#1c1c1e" },
  trophies: { bg: "#ffd60a", fg: "#3a2a00" },
  games: { bg: "#ff453a" },
  stats: { bg: "#30d158" },
  research: { bg: "#64d2ff", fg: "#00314a" },
  resume: { bg: "#f2f2f7", fg: "#ff453a" },
  files: { bg: "#3a9bff" },
  terminal: { bg: "#1c1c1e", fg: "#e5e5ea" },
  music: { bg: "#ff375f" },
  arcade: { bg: "#ff9f0a" },
  settings: { bg: "#636366" },
};

// Flat rounded-square tiles with a white line glyph, in macOS system colors.
export function GoldenIcon({ id, className }: { id: WindowId; className?: string }) {
  const tile = TILES[id];
  const fg = tile.fg ?? "#fff";
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <rect x="2" y="2" width="60" height="60" rx="14" fill={tile.bg} />
      <rect x="2.5" y="2.5" width="59" height="59" rx="13.5" fill="none" stroke="#000" strokeOpacity="0.12" />
      <g transform="translate(14 14) scale(1.5)" fill="none" stroke={fg} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" style={{ color: fg }}>
        {GLYPHS[id]}
      </g>
    </svg>
  );
}
