import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_WALLPAPER_ID } from "@/lib/wallpapers";
import { getEffectiveViewport } from "@/lib/useIsMobile";

export type Mode = "os" | "explore";
export type WindowId = "terminal" | "projects" | "hackathons" | "settings";

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const DEFAULT_RECTS: Record<WindowId, Rect> = {
  terminal: { x: 80, y: 72, width: 620, height: 420 },
  projects: { x: 160, y: 110, width: 640, height: 460 },
  hackathons: { x: 220, y: 90, width: 480, height: 440 },
  settings: { x: 260, y: 130, width: 420, height: 380 },
};

interface WindowState extends Rect {
  minimized: boolean;
  maximized: boolean;
  prevRect?: Rect;
}

interface AppState {
  mode: Mode;
  setMode: (mode: Mode) => void;
  toggleMode: () => void;

  volume: number; // 0..1
  setVolume: (v: number) => void;
  disable3D: boolean;
  setDisable3D: (v: boolean) => void;

  wallpaperId: string;
  customWallpaper: string | null;
  setWallpaperId: (id: string) => void;
  setCustomWallpaper: (dataUrl: string | null) => void;

  windowOrder: WindowId[];
  windows: Partial<Record<WindowId, WindowState>>;
  focusedWindow: WindowId | null;

  openWindow: (id: WindowId) => void;
  closeWindow: (id: WindowId) => void;
  focusWindow: (id: WindowId) => void;
  minimizeWindow: (id: WindowId) => void;
  toggleMaximizeWindow: (id: WindowId, viewport: { width: number; height: number }) => void;
  moveWindow: (id: WindowId, x: number, y: number) => void;
  resizeWindow: (id: WindowId, width: number, height: number) => void;
  syncWindowsToViewport: (viewport: { width: number; height: number }) => void;
}

export const MIN_WINDOW_WIDTH = 320;
export const MIN_WINDOW_HEIGHT = 240;

// Matches the breakpoint in lib/useIsMobile.ts. A floating draggable/resizable window
// manager doesn't translate to a phone screen, so windows there open maximized instead
// of at the desktop-sized defaults below (which easily overflow a ~375px-wide viewport).
function isMobileViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 900px), (pointer: coarse)").matches;
}

function maximizedRectFor(viewport: { width: number; height: number }): Rect {
  const topInset = 32;
  // Desktop hides the dock entirely while a window is maximized, so it can use the full
  // remaining height; mobile keeps the dock visible (it's the only way to switch apps or
  // get back to Explore mode there, since windows are always maximized), so it needs
  // room reserved at the bottom instead of the window extending underneath it.
  const bottomInset = isMobileViewport() ? 84 : 0;
  return { x: 0, y: topInset, width: viewport.width, height: viewport.height - topInset - bottomInset };
}

let stagger = 0;

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      mode: "os",
      setMode: (mode) => set({ mode }),
      toggleMode: () => set((s) => ({ mode: s.mode === "os" ? "explore" : "os" })),

      volume: 0.12,
      setVolume: (volume) => set({ volume }),
      disable3D: false,
      setDisable3D: (disable3D) => set({ disable3D }),

      wallpaperId: DEFAULT_WALLPAPER_ID,
      customWallpaper: null,
      setWallpaperId: (id) => set({ wallpaperId: id, customWallpaper: null }),
      setCustomWallpaper: (dataUrl) => set({ customWallpaper: dataUrl }),

      windowOrder: ["terminal"],
      windows: {
        terminal: { ...DEFAULT_RECTS.terminal, minimized: false, maximized: false },
      },
      focusedWindow: "terminal",

      openWindow: (id) =>
        set((s) => {
          const existing = s.windows[id];
          if (existing) {
            return {
              windowOrder: [...s.windowOrder.filter((w) => w !== id), id],
              windows: { ...s.windows, [id]: { ...existing, minimized: false } },
              focusedWindow: id,
            };
          }
          if (isMobileViewport()) {
            const rect = maximizedRectFor(getEffectiveViewport());
            return {
              windowOrder: [...s.windowOrder, id],
              windows: { ...s.windows, [id]: { ...rect, minimized: false, maximized: true } },
              focusedWindow: id,
            };
          }
          stagger = (stagger + 1) % 6;
          const base = DEFAULT_RECTS[id];
          const rect = { ...base, x: base.x + stagger * 24, y: base.y + stagger * 24 };
          return {
            windowOrder: [...s.windowOrder, id],
            windows: { ...s.windows, [id]: { ...rect, minimized: false, maximized: false } },
            focusedWindow: id,
          };
        }),

      closeWindow: (id) =>
        set((s) => {
          const windows = { ...s.windows };
          delete windows[id];
          const order = s.windowOrder.filter((w) => w !== id);
          return {
            windows,
            windowOrder: order,
            focusedWindow: get().focusedWindow === id ? (order.at(-1) ?? null) : get().focusedWindow,
          };
        }),

      focusWindow: (id) =>
        set((s) => ({
          windowOrder: [...s.windowOrder.filter((w) => w !== id), id],
          focusedWindow: id,
        })),

      minimizeWindow: (id) =>
        set((s) => {
          const win = s.windows[id];
          if (!win) return {};
          return {
            windows: { ...s.windows, [id]: { ...win, minimized: true } },
            focusedWindow: get().focusedWindow === id ? null : get().focusedWindow,
          };
        }),

      toggleMaximizeWindow: (id, viewport) =>
        set((s) => {
          const win = s.windows[id];
          if (!win) return {};
          if (win.maximized && win.prevRect) {
            return { windows: { ...s.windows, [id]: { ...win, ...win.prevRect, maximized: false } } };
          }
          return {
            windows: {
              ...s.windows,
              [id]: {
                ...win,
                ...maximizedRectFor(viewport),
                maximized: true,
                prevRect: { x: win.x, y: win.y, width: win.width, height: win.height },
              },
            },
          };
        }),

      moveWindow: (id, x, y) =>
        set((s) => {
          const win = s.windows[id];
          if (!win) return {};
          return { windows: { ...s.windows, [id]: { ...win, x, y } } };
        }),

      resizeWindow: (id, width, height) =>
        set((s) => {
          const win = s.windows[id];
          if (!win || win.maximized) return {};
          return {
            windows: {
              ...s.windows,
              [id]: {
                ...win,
                width: Math.max(MIN_WINDOW_WIDTH, width),
                height: Math.max(MIN_WINDOW_HEIGHT, height),
              },
            },
          };
        }),

      // Called on mount and on viewport/orientation changes. The store's initial state
      // (the terminal window that's open by default) is set once at module load, before
      // any component can check the real viewport, so it always starts at the desktop
      // size — this reconciles it (and anything else open) against whatever screen it's
      // actually running on: maximized on mobile, clamped to fit otherwise.
      syncWindowsToViewport: (viewport) =>
        set((s) => {
          const mobile = isMobileViewport();
          const windows = { ...s.windows };
          for (const id of s.windowOrder) {
            const win = windows[id];
            if (!win) continue;
            if (mobile) {
              if (!win.maximized) {
                windows[id] = { ...win, ...maximizedRectFor(viewport), maximized: true, prevRect: win };
              }
            } else if (!win.maximized) {
              const width = Math.min(win.width, viewport.width - 16);
              const height = Math.min(win.height, viewport.height - 44);
              const x = Math.min(win.x, Math.max(0, viewport.width - 120));
              const y = Math.min(Math.max(win.y, 28), Math.max(28, viewport.height - 80));
              windows[id] = { ...win, width, height, x, y };
            }
          }
          return { windows };
        }),
    }),
    {
      name: "portfolios-settings",
      partialize: (s) => ({
        volume: s.volume,
        disable3D: s.disable3D,
        wallpaperId: s.wallpaperId,
        customWallpaper: s.customWallpaper,
      }),
    }
  )
);
