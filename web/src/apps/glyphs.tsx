import type { WindowId } from "./meta";

// Line glyphs on a 24-unit grid, shared by the Golden Gate icons (white on a flat
// tile) and the Hyprland icons (colored glyph, no tile). Retro uses its own pixel art.
export const GLYPHS: Record<WindowId, React.ReactNode> = {
  about: (
    <>
      <circle cx="12" cy="8.5" r="3.6" />
      <path d="M4.8 19.6c1.2-3.6 4-5.4 7.2-5.4s6 1.8 7.2 5.4" />
    </>
  ),
  projects: (
    <>
      <path d="M12 3.5 20.5 8 12 12.5 3.5 8 12 3.5Z" />
      <path d="m3.5 12 8.5 4.5 8.5-4.5" />
      <path d="m3.5 16 8.5 4.5 8.5-4.5" />
    </>
  ),
  experience: (
    <>
      <rect x="3.5" y="7.5" width="17" height="12" rx="2.4" />
      <path d="M8.5 7.5V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1.5M3.5 12.5h17M11 12.5v1.5h2v-1.5" />
    </>
  ),
  oss: (
    <>
      <circle cx="6.5" cy="5.5" r="2.2" />
      <circle cx="6.5" cy="18.5" r="2.2" />
      <circle cx="17.5" cy="12" r="2.2" />
      <path d="M6.5 7.7v8.6M6.5 9c0 2.6 2 3 5 3h3.8" />
    </>
  ),
  trophies: (
    <>
      <path d="M7.5 4h9v4.5a4.5 4.5 0 0 1-9 0V4Z" />
      <path d="M7.5 5.5H4.5a3 3 0 0 0 3 3.6M16.5 5.5h3a3 3 0 0 1-3 3.6M12 13v3.5M8.5 20h7M9.5 20l.6-3.5h3.8l.6 3.5" />
    </>
  ),
  games: (
    <>
      <path d="M7 8h10a4 4 0 0 1 3.9 4.9l-.9 4a2.4 2.4 0 0 1-4.1 1l-2-2.4h-3.8l-2 2.4a2.4 2.4 0 0 1-4.1-1l-.9-4A4 4 0 0 1 7 8Z" />
      <path d="M8 11v3M6.5 12.5h3" />
      <circle cx="15.5" cy="11.6" r=".6" fill="currentColor" />
      <circle cx="17" cy="13.4" r=".6" fill="currentColor" />
    </>
  ),
  stats: (
    <>
      <path d="M4 20h16" />
      <rect x="5.5" y="12" width="3" height="6" rx="1" />
      <rect x="10.5" y="8" width="3" height="10" rx="1" />
      <rect x="15.5" y="4" width="3" height="14" rx="1" />
    </>
  ),
  research: (
    <>
      <path d="M12 6.5C10 5 7.5 4.5 4 4.5v13c3.5 0 6 .5 8 2 2-1.5 4.5-2 8-2v-13c-3.5 0-6 .5-8 2Z" />
      <path d="M12 6.5v13" />
    </>
  ),
  resume: (
    <>
      <path d="M6.5 3.5h7.5l4 4v13h-11.5v-17Z" />
      <path d="M14 3.5v4h4M9.5 11.5h5M9.5 14.5h5M9.5 17.5h3" />
    </>
  ),
  files: (
    <>
      <path d="M3.5 7a2 2 0 0 1 2-2h4l2 2.2h7a2 2 0 0 1 2 2V17.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2V7Z" />
      <path d="M3.5 10h17" />
    </>
  ),
  terminal: (
    <>
      <path d="m6 8 4 4-4 4M12.5 16.5h5.5" />
    </>
  ),
  music: (
    <>
      <path d="M9 17.5V6l10-2v11.5" />
      <circle cx="6.8" cy="17.5" r="2.4" />
      <circle cx="16.8" cy="15.5" r="2.4" />
    </>
  ),
  arcade: (
    <>
      <rect x="7" y="15" width="10" height="4.5" rx="1" />
      <rect x="5.5" y="9.5" width="10" height="4.5" rx="1" />
      <rect x="8.5" y="4" width="10" height="4.5" rx="1" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3.2v2.3M12 18.5v2.3M20.8 12h-2.3M5.5 12H3.2M18.2 5.8l-1.6 1.6M7.4 16.6l-1.6 1.6M18.2 18.2l-1.6-1.6M7.4 7.4 5.8 5.8" />
      <circle cx="12" cy="12" r="6.6" />
    </>
  ),
};

// A Golden Gate tower and cable, the PortfoliOS mark. Original artwork.
export function BridgeLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
      <path d="M7 21V4M17 21V4M7 7h10M7 11h10" />
      <path d="M2 14c2.5-1 4-3.5 5-7 1.8 5 3.5 7 5 7s3.2-2 5-7c1 3.5 2.5 6 5 7" />
      <path d="M1.5 16.5h21" />
    </svg>
  );
}
