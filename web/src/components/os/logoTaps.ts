import { useAppStore } from "@/store/useAppStore";
import { discoverEgg } from "@/lib/eggs";

// Seven quick taps on any theme's logo toggles a developer HUD (FPS + window count).
let taps: number[] = [];
export function registerLogoTap() {
  const now = Date.now();
  taps = [...taps.filter((t) => now - t < 2500), now];
  if (taps.length >= 7) {
    taps = [];
    const s = useAppStore.getState();
    s.setDevHud(!s.devHud);
    s.pushToast({ icon: "dev", title: s.devHud ? "Developer mode off" : "You are now a developer!", body: "Developer HUD toggled." });
    discoverEgg("logo-7");
    return true;
  }
  return false;
}
