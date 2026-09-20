import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_WALLPAPER_ID } from "@/lib/wallpapers";

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
}

let stagger = 0;

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      mode: "os",
      setMode: (mode) => set({ mode }),
      toggleMode: () => set((s) => ({ mode: s.mode === "os" ? "explore" : "os" })),

      volume: 0.5,
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
          const margin = 24;
          const maximizedRect: Rect = {
            x: margin,
            y: 44,
            width: viewport.width - margin * 2,
            height: viewport.height - 44 - 100,
          };
          return {
            windows: {
              ...s.windows,
              [id]: { ...win, ...maximizedRect, maximized: true, prevRect: { x: win.x, y: win.y, width: win.width, height: win.height } },
            },
          };
        }),

      moveWindow: (id, x, y) =>
        set((s) => {
          const win = s.windows[id];
          if (!win) return {};
          return { windows: { ...s.windows, [id]: { ...win, x, y } } };
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
