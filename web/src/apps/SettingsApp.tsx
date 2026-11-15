"use client";

import { useRef, useState } from "react";
import { useAppStore, type ThemeId } from "@/store/useAppStore";
import { WALLPAPERS, DEFAULT_WALLPAPER } from "@/lib/wallpapers";
import { EGGS } from "@/lib/eggs";
import { AppBody, Section } from "./ui";
import { useIsMobile } from "@/lib/useIsMobile";

const MAX_CUSTOM_WALLPAPER_BYTES = 4 * 1024 * 1024;

export const THEME_INFO: Record<ThemeId, { name: string; blurb: string }> = {
  golden: { name: "Golden Gate", blurb: "Liquid Glass, macOS 27 style" },
  retro: { name: "Retro 98", blurb: "Beveled pixels and a Start menu" },
  hypr: { name: "Hyprland", blurb: "Tiling WM, riced to perfection" },
};

function ThemePreview({ id }: { id: ThemeId }) {
  const thumb = WALLPAPERS[id].find((w) => w.id === DEFAULT_WALLPAPER[id])!;
  return (
    <div className={`relative aspect-[16/10] overflow-hidden bg-cover bg-center ${id === "retro" ? "pixelated" : ""}`} style={{ backgroundImage: `url(${thumb.thumb})` }}>
      {id === "golden" && (
        <>
          <div className="absolute top-0 inset-x-0 h-[7%] bg-black/30 backdrop-blur" />
          <div className="absolute left-[14%] top-[18%] w-[52%] h-[48%] rounded-[6px] bg-black/35 backdrop-blur border border-white/20" />
          <div className="absolute bottom-[5%] left-1/2 -translate-x-1/2 w-[52%] h-[12%] rounded-[8px] bg-white/25 backdrop-blur border border-white/30" />
        </>
      )}
      {id === "retro" && (
        <>
          <div className="absolute left-[18%] top-[16%] w-[54%] h-[52%] bg-[#c0c0c0] border-2 border-t-white border-l-white border-r-black border-b-black">
            <div className="h-[16%] bg-[#000080]" />
          </div>
          <div className="absolute bottom-0 inset-x-0 h-[10%] bg-[#c0c0c0] border-t-2 border-white" />
        </>
      )}
      {id === "hypr" && (
        <>
          <div className="absolute top-[4%] inset-x-[3%] h-[8%] rounded bg-[#11111b]/80" />
          <div className="absolute left-[3%] top-[16%] w-[46%] bottom-[4%] rounded-md bg-[#1e1e2e]/80 ring-1 ring-[#89b4fa]" />
          <div className="absolute right-[3%] top-[16%] w-[46%] h-[38%] rounded-md bg-[#1e1e2e]/80 ring-1 ring-white/10" />
          <div className="absolute right-[3%] bottom-[4%] w-[46%] h-[38%] rounded-md bg-[#1e1e2e]/80 ring-1 ring-white/10" />
        </>
      )}
    </div>
  );
}

export default function SettingsApp() {
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const volume = useAppStore((s) => s.volume);
  const setVolume = useAppStore((s) => s.setVolume);
  const disable3D = useAppStore((s) => s.disable3D);
  const setDisable3D = useAppStore((s) => s.setDisable3D);
  const glassOpacity = useAppStore((s) => s.glassOpacity);
  const setGlassOpacity = useAppStore((s) => s.setGlassOpacity);
  const crt = useAppStore((s) => s.crt);
  const setCrt = useAppStore((s) => s.setCrt);
  const dockSize = useAppStore((s) => s.dockSize);
  const setDockSize = useAppStore((s) => s.setDockSize);
  const dockMagnify = useAppStore((s) => s.dockMagnify);
  const setDockMagnify = useAppStore((s) => s.setDockMagnify);
  const wallpapers = useAppStore((s) => s.wallpapers);
  const setWallpaper = useAppStore((s) => s.setWallpaper);
  const customWallpaper = useAppStore((s) => s.customWallpaper);
  const setCustomWallpaper = useAppStore((s) => s.setCustomWallpaper);
  const eggs = useAppStore((s) => s.eggs);
  const isMobile = useIsMobile();

  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const retro = theme === "retro";
  const current = wallpapers[theme] ?? DEFAULT_WALLPAPER[theme];

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    if (file.size > MAX_CUSTOM_WALLPAPER_BYTES) {
      setUploadError("Image too large. Keep it under 4MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setCustomWallpaper(reader.result as string);
    reader.readAsDataURL(file);
  }

  const selectedRing = (on: boolean) =>
    retro ? (on ? "outline outline-2 outline-[#000080] outline-offset-1" : "") : on ? "ring-2 ring-[var(--ui-accent)] ring-offset-2 ring-offset-transparent" : "ring-1 ring-white/10 hover:ring-white/30";

  return (
    <AppBody className="space-y-7">
      {!isMobile && (
      <Section title="Appearance">
        <div className="grid grid-cols-3 gap-3">
          {(Object.keys(THEME_INFO) as ThemeId[]).map((id) => (
            <button key={id} onClick={() => setTheme(id)} className="text-left group">
              <div className={`overflow-hidden ${retro ? "bevel-in p-0.5" : "rounded-xl"} ${selectedRing(theme === id)} transition-shadow`}>
                <ThemePreview id={id} />
              </div>
              <div className="mt-1.5 text-[13px] font-semibold">{THEME_INFO[id].name}</div>
              <div className="text-[11px] ui-muted leading-tight">{THEME_INFO[id].blurb}</div>
            </button>
          ))}
        </div>
        {theme === "golden" && (
          <label className="ui-card flex items-center gap-4 px-4 py-3">
            <span className="text-[13px] w-28 shrink-0">Glass opacity</span>
            <span className="text-[11px] ui-faint">Clear</span>
            <input type="range" min={0.1} max={0.95} step={0.01} value={glassOpacity} onChange={(e) => setGlassOpacity(Number(e.target.value))} className="flex-1" style={{ accentColor: "var(--ui-accent)" }} />
            <span className="text-[11px] ui-faint">Frosted</span>
          </label>
        )}
        {theme === "golden" && (
          <div className="ui-card divide-y divide-white/[0.06]">
            <label className="flex items-center gap-4 px-4 py-3">
              <span className="text-[13px] w-28 shrink-0">Dock size</span>
              <span className="text-[11px] ui-faint">Small</span>
              <input type="range" min={36} max={80} step={1} value={dockSize} onChange={(e) => setDockSize(Number(e.target.value))} className="flex-1" style={{ accentColor: "var(--ui-accent)" }} />
              <span className="text-[11px] ui-faint">Large</span>
            </label>
            <label className="flex items-center gap-3 px-4 py-3 cursor-pointer">
              <input type="checkbox" checked={dockMagnify} onChange={(e) => setDockMagnify(e.target.checked)} style={{ accentColor: "var(--ui-accent)" }} />
              <span className="text-[13px]">Magnification</span>
            </label>
          </div>
        )}
        {theme === "retro" && (
          <label className="ui-card flex items-center gap-3 px-4 py-3 cursor-pointer">
            <input type="checkbox" checked={crt} onChange={(e) => setCrt(e.target.checked)} />
            <span className="text-[13px]">CRT scanlines</span>
          </label>
        )}
      </Section>
      )}

      <Section title={`Wallpaper · ${THEME_INFO[theme].name}`}>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
          {WALLPAPERS[theme].map((wp) => (
            <button key={wp.id} onClick={() => setWallpaper(theme, wp.id)} title={wp.author ? `${wp.name} · Photo by ${wp.author} on Unsplash` : wp.name}>
              <div
                className={`aspect-video bg-cover bg-center ${wp.pixel ? "pixelated" : ""} ${retro ? "" : "rounded-lg"} ${selectedRing(current === wp.id)} transition-shadow`}
                style={{ backgroundImage: `url(${wp.thumb})` }}
              />
              <div className="text-[11px] mt-1 truncate">{wp.name}</div>
            </button>
          ))}
          <button onClick={() => fileRef.current?.click()} title="Upload your own">
            <div
              className={`aspect-video flex items-center justify-center text-lg bg-cover bg-center ${retro ? "bevel-in bg-white" : "rounded-lg bg-white/5 border border-dashed border-white/25"} ${current === "custom" ? selectedRing(true) : ""}`}
              style={customWallpaper ? { backgroundImage: `url(${customWallpaper})` } : undefined}
            >
              {!customWallpaper && "+"}
            </div>
            <div className="text-[11px] mt-1">Custom…</div>
          </button>
        </div>
        <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
        {uploadError && <p className="text-xs" style={{ color: "#ff6b6b" }}>{uploadError}</p>}
        <p className="text-[11px] ui-faint">Photos from Unsplash. Hover a wallpaper to see the photographer. Custom uploads stay in this browser.</p>
      </Section>

      <Section title="Sound">
        <label className="ui-card flex items-center gap-4 px-4 py-3">
          <span className="text-[13px] w-28 shrink-0">Music volume</span>
          <input type="range" min={0} max={1} step={0.01} value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="flex-1" style={{ accentColor: "var(--ui-accent)" }} />
          <span className="text-[12px] tabular-nums w-10 text-right ui-muted">{Math.round(volume * 100)}%</span>
        </label>
      </Section>

      {!isMobile && (
      <Section title="Performance">
        <label className="ui-card flex items-center gap-3 px-4 py-3 cursor-pointer">
          <input type="checkbox" checked={disable3D} onChange={(e) => setDisable3D(e.target.checked)} />
          <span className="text-[13px]">Disable the 3D room (faster on low-end devices)</span>
        </label>
      </Section>
      )}

      <Section title={`Easter eggs · ${eggs.length}/${EGGS.length}`}>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--ui-card-hover)" }}>
          <div className="h-full transition-[width] duration-700" style={{ width: `${(eggs.length / EGGS.length) * 100}%`, background: "var(--ui-accent)" }} />
        </div>
        <p className="text-[12px] ui-muted">
          {eggs.length === EGGS.length ? "You found every single one. Impressive." : "Hints live in the terminal: run `eggs`."}
        </p>
      </Section>
    </AppBody>
  );
}
