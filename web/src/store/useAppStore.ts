import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Mode = "os" | "explore";
export type WindowId = "terminal" | "projects" | "hackathons" | "settings" | "about";

interface AppState {
  mode: Mode;
  setMode: (mode: Mode) => void;
  toggleMode: () => void;

  volume: number; // 0..1
  setVolume: (v: number) => void;
  disable3D: boolean;
  setDisable3D: (v: boolean) => void;

  openWindows: WindowId[];
  openWindow: (id: WindowId) => void;
  closeWindow: (id: WindowId) => void;
  focusedWindow: WindowId | null;
  focusWindow: (id: WindowId) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      mode: "os",
      setMode: (mode) => set({ mode }),
      toggleMode: () =>
        set((s) => ({ mode: s.mode === "os" ? "explore" : "os" })),

      volume: 0.5,
      setVolume: (volume) => set({ volume }),
      disable3D: false,
      setDisable3D: (disable3D) => set({ disable3D }),

      openWindows: ["terminal"],
      openWindow: (id) =>
        set((s) =>
          s.openWindows.includes(id)
            ? { focusedWindow: id }
            : { openWindows: [...s.openWindows, id], focusedWindow: id }
        ),
      closeWindow: (id) =>
        set((s) => ({
          openWindows: s.openWindows.filter((w) => w !== id),
          focusedWindow: get().focusedWindow === id ? null : get().focusedWindow,
        })),
      focusedWindow: "terminal",
      focusWindow: (id) => set({ focusedWindow: id }),
    }),
    {
      name: "portfolios-settings",
      partialize: (s) => ({ volume: s.volume, disable3D: s.disable3D }),
    }
  )
);
