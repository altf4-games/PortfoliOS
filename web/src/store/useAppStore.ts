import { create } from "zustand";
import { persist } from "zustand/middleware";
import { APP_BY_ID, type WindowId } from "@/apps/meta";
import { DEFAULT_WALLPAPER, type ThemeId } from "@/lib/wallpapers";

export type { WindowId } from "@/apps/meta";
export type { ThemeId } from "@/lib/wallpapers";

export type Mode = "os" | "explore";
// loading: 3D assets downloading. intro: camera fly-in. boot: theme boot screen. ready: desktop.
export type Phase = "loading" | "intro" | "boot" | "ready";
export type Overlay = null | "spotlight" | "control" | "start" | "launcher" | "logo-menu";
export type Effect = null | "matrix" | "meltdown" | "barrel" | "konami" | "crash" | "screensaver" | "hire";

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface WindowState extends Rect {
  minimized: boolean;
  maximized: boolean;
  prevRect?: Rect;
}

export interface Toast {
  id: number;
  title: string;
  body?: string;
  icon?: string;
}

interface AppState {
  phase: Phase;
  setPhase: (p: Phase) => void;
  mode: Mode;
  setMode: (mode: Mode) => void;
  toggleMode: () => void;

  theme: ThemeId;
  setTheme: (t: ThemeId) => void;
  themesVisited: ThemeId[];

  volume: number; // 0..1
  setVolume: (v: number) => void;
  musicPlaying: boolean;
  setMusicPlaying: (v: boolean) => void;
  disable3D: boolean;
  setDisable3D: (v: boolean) => void;
  glassOpacity: number; // 0..1, Golden Gate's Liquid Glass slider
  setGlassOpacity: (v: number) => void;
  crt: boolean;
  setCrt: (v: boolean) => void;
  devHud: boolean;
  setDevHud: (v: boolean) => void;

  wallpapers: Record<ThemeId, string>;
  customWallpaper: string | null;
  setWallpaper: (theme: ThemeId, id: string) => void;
  setCustomWallpaper: (dataUrl: string | null) => void;

  eggs: string[];
  findEgg: (id: string) => boolean; // returns true if newly found

  overlay: Overlay;
  setOverlay: (o: Overlay) => void;
  toggleOverlay: (o: Exclude<Overlay, null>) => void;
  effect: Effect;
  setEffect: (e: Effect) => void;
  toasts: Toast[];
  pushToast: (t: Omit<Toast, "id">) => void;
  dismissToast: (id: number) => void;

  windowOrder: WindowId[];
  windows: Partial<Record<WindowId, WindowState>>;
  focusedWindow: WindowId | null;

  // Hyprland-style workspaces. Every window belongs to one; other themes ignore this.
  activeWorkspace: number;
  windowWorkspace: Partial<Record<WindowId, number>>;
  setWorkspace: (n: number) => void;
  moveToWorkspace: (id: WindowId, n: number) => void;

  openWindow: (id: WindowId) => void;
  closeWindow: (id: WindowId) => void;
  closeAll: () => void;
  focusWindow: (id: WindowId) => void;
  minimizeWindow: (id: WindowId) => void;
  toggleMaximizeWindow: (id: WindowId, viewport: { width: number; height: number }) => void;
  moveWindow: (id: WindowId, x: number, y: number) => void;
  resizeWindow: (id: WindowId, width: number, height: number) => void;
  syncWindowsToViewport: (viewport: { width: number; height: number }) => void;
}

export const MIN_WINDOW_WIDTH = 320;
export const MIN_WINDOW_HEIGHT = 240;

// Insets differ per theme (menu bar on top vs. taskbar at the bottom), so callers pass
// the usable area; this default fits Golden Gate's 30px menu bar.
export function maximizedRectFor(viewport: { width: number; height: number }, theme: ThemeId = "golden"): Rect {
  if (theme === "retro") return { x: 0, y: 0, width: viewport.width, height: viewport.height - 36 };
  return { x: 0, y: 30, width: viewport.width, height: viewport.height - 30 };
}

let stagger = 0;
let toastId = 0;

function initialRect(id: WindowId): Rect {
  const { width, height } = APP_BY_ID[id].size;
  const vw = typeof window !== "undefined" ? window.innerWidth : 1440;
  const vh = typeof window !== "undefined" ? window.innerHeight : 900;
  stagger = (stagger + 1) % 6;
  const w = Math.min(width, vw - 32);
  const h = Math.min(height, vh - 140);
  return {
    width: w,
    height: h,
    x: Math.max(12, Math.round((vw - w) / 2 - 120 + stagger * 40)),
    y: Math.max(44, Math.round((vh - h) / 2 - 60 + stagger * 28)),
  };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      phase: "loading",
      setPhase: (phase) => set({ phase }),
      mode: "os",
      setMode: (mode) => set({ mode }),
      toggleMode: () => set((s) => ({ mode: s.mode === "os" ? "explore" : "os", overlay: null })),

      theme: "golden",
      setTheme: (theme) =>
        set((s) => ({
          theme,
          overlay: null,
          themesVisited: s.themesVisited.includes(theme) ? s.themesVisited : [...s.themesVisited, theme],
        })),
      themesVisited: ["golden"],

      volume: 0,
      setVolume: (volume) => set({ volume }),
      musicPlaying: false,
      setMusicPlaying: (musicPlaying) => set({ musicPlaying }),
      disable3D: false,
      setDisable3D: (disable3D) => set({ disable3D }),
      glassOpacity: 0.75,
      setGlassOpacity: (glassOpacity) => set({ glassOpacity }),
      crt: false,
      setCrt: (crt) => set({ crt }),
      devHud: false,
      setDevHud: (devHud) => set({ devHud }),

      wallpapers: { ...DEFAULT_WALLPAPER },
      customWallpaper: null,
      setWallpaper: (theme, id) => set((s) => ({ wallpapers: { ...s.wallpapers, [theme]: id } })),
      setCustomWallpaper: (dataUrl) =>
        set((s) => ({
          customWallpaper: dataUrl,
          wallpapers: dataUrl ? { ...s.wallpapers, [s.theme]: "custom" } : s.wallpapers,
        })),

      eggs: [],
      findEgg: (id) => {
        if (get().eggs.includes(id)) return false;
        set((s) => ({ eggs: [...s.eggs, id] }));
        return true;
      },

      overlay: null,
      setOverlay: (overlay) => set({ overlay }),
      toggleOverlay: (o) => set((s) => ({ overlay: s.overlay === o ? null : o })),
      effect: null,
      setEffect: (effect) => set({ effect }),
      toasts: [],
      pushToast: (t) => {
        const id = ++toastId;
        set((s) => ({ toasts: [...s.toasts.slice(-3), { ...t, id }] }));
        setTimeout(() => get().dismissToast(id), 5200);
      },
      dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

      windowOrder: [],
      windows: {},
      focusedWindow: null,

      activeWorkspace: 1,
      windowWorkspace: {},
      setWorkspace: (activeWorkspace) =>
        set((s) => {
          const onWs = s.windowOrder.filter((w) => (s.windowWorkspace[w] ?? 1) === activeWorkspace);
          return { activeWorkspace, focusedWindow: onWs.at(-1) ?? null };
        }),
      moveToWorkspace: (id, n) =>
        set((s) => {
          const windowWorkspace = { ...s.windowWorkspace, [id]: n };
          const remaining = s.windowOrder.filter((w) => w !== id && (windowWorkspace[w] ?? 1) === s.activeWorkspace);
          return { windowWorkspace, focusedWindow: remaining.at(-1) ?? null };
        }),

      openWindow: (id) =>
        set((s) => {
          const existing = s.windows[id];
          if (existing) {
            return {
              windowOrder: [...s.windowOrder.filter((w) => w !== id), id],
              windows: { ...s.windows, [id]: { ...existing, minimized: false } },
              focusedWindow: id,
              activeWorkspace: s.windowWorkspace[id] ?? s.activeWorkspace,
              overlay: null,
            };
          }
          return {
            windowOrder: [...s.windowOrder, id],
            windows: { ...s.windows, [id]: { ...initialRect(id), minimized: false, maximized: false } },
            windowWorkspace: { ...s.windowWorkspace, [id]: s.activeWorkspace },
            focusedWindow: id,
            overlay: null,
          };
        }),

      closeWindow: (id) =>
        set((s) => {
          const windows = { ...s.windows };
          delete windows[id];
          const windowWorkspace = { ...s.windowWorkspace };
          delete windowWorkspace[id];
          const order = s.windowOrder.filter((w) => w !== id);
          const candidates = order.filter((w) => !windows[w]?.minimized && (windowWorkspace[w] ?? 1) === s.activeWorkspace);
          return {
            windows,
            windowWorkspace,
            windowOrder: order,
            focusedWindow: s.focusedWindow === id ? (candidates.at(-1) ?? null) : s.focusedWindow,
          };
        }),

      closeAll: () => set({ windows: {}, windowOrder: [], windowWorkspace: {}, focusedWindow: null, activeWorkspace: 1 }),

      focusWindow: (id) =>
        set((s) =>
          s.focusedWindow === id && s.windowOrder.at(-1) === id
            ? {}
            : { windowOrder: [...s.windowOrder.filter((w) => w !== id), id], focusedWindow: id }
        ),

      minimizeWindow: (id) =>
        set((s) => {
          const win = s.windows[id];
          if (!win) return {};
          const rest = s.windowOrder.filter((w) => w !== id && !s.windows[w]?.minimized);
          return {
            windows: { ...s.windows, [id]: { ...win, minimized: true } },
            focusedWindow: s.focusedWindow === id ? (rest.at(-1) ?? null) : s.focusedWindow,
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
                ...maximizedRectFor(viewport, s.theme),
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
              [id]: { ...win, width: Math.max(MIN_WINDOW_WIDTH, width), height: Math.max(MIN_WINDOW_HEIGHT, height) },
            },
          };
        }),

      syncWindowsToViewport: (viewport) =>
        set((s) => {
          const windows = { ...s.windows };
          for (const id of s.windowOrder) {
            const win = windows[id];
            if (!win) continue;
            if (win.maximized) {
              windows[id] = { ...win, ...maximizedRectFor(viewport, s.theme) };
              continue;
            }
            const width = Math.min(win.width, viewport.width - 16);
            const height = Math.min(win.height, viewport.height - 44);
            const x = Math.min(win.x, Math.max(0, viewport.width - 120));
            const y = Math.min(Math.max(win.y, 28), Math.max(28, viewport.height - 80));
            windows[id] = { ...win, width, height, x, y };
          }
          return { windows };
        }),
    }),
    {
      name: "portfolios-settings",
      version: 2,
      // v1 shipped with music at 12% by default. The revamp starts everyone muted, so
      // reset volume once for returning visitors too; old single-theme wallpaper ids
      // don't map onto the new per-theme sets, so they're dropped.
      migrate: (persisted, version) => {
        const p = (persisted ?? {}) as Record<string, unknown>;
        if (version < 2) {
          return {
            volume: 0,
            disable3D: Boolean(p.disable3D),
            customWallpaper: null,
          };
        }
        return p;
      },
      partialize: (s) => ({
        theme: s.theme,
        themesVisited: s.themesVisited,
        volume: s.volume,
        disable3D: s.disable3D,
        glassOpacity: s.glassOpacity,
        crt: s.crt,
        devHud: s.devHud,
        wallpapers: s.wallpapers,
        customWallpaper: s.customWallpaper,
        eggs: s.eggs,
      }),
    }
  )
);
