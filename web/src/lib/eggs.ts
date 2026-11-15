import { useAppStore } from "@/store/useAppStore";

export interface EggDef {
  id: string;
  name: string;
  hint: string;
}

export const EGGS: EggDef[] = [
  { id: "konami", name: "Old-school cheat", hint: "↑↑↓↓←→←→BA" },
  { id: "rm-rf", name: "Root of all evil", hint: "Some commands should never be run as root." },
  { id: "logo-7", name: "Developer mode", hint: "Persistence is key. Seven taps, to be exact." },
  { id: "crash", name: "Fatal exception", hint: "Try shutting down the retro machine." },
  { id: "matrix", name: "Follow the white rabbit", hint: "There is no spoon. There is a terminal." },
  { id: "secret-file", name: "Hidden files", hint: "Dotfiles are hidden for a reason." },
  { id: "arcade-15", name: "Skyscraper", hint: "Stack higher than 15." },
  { id: "room-secret", name: "Look up", hint: "Explore the room. Really explore it." },
  { id: "devtools", name: "View source", hint: "Developers open the console first." },
  { id: "barrel-roll", name: "Barrel roll", hint: "Do a barrel roll. Just ask." },
  { id: "theme-hopper", name: "Distro hopper", hint: "Try every look." },
  { id: "screensaver", name: "AFK", hint: "Walk away for a minute." },
  { id: "hire-me", name: "Recruiter mode", hint: "There's a command for the people who matter most." },
  { id: "night-owl", name: "Night owl", hint: "Visit when you should be asleep." },
];

export const EGG_BY_ID = Object.fromEntries(EGGS.map((e) => [e.id, e])) as Record<string, EggDef>;

// Call from anywhere (event handlers, effects). Shows a toast the first time only.
export function discoverEgg(id: string) {
  const s = useAppStore.getState();
  if (!s.findEgg(id)) return;
  const found = useAppStore.getState().eggs.length;
  s.pushToast({
    icon: "egg",
    title: `Easter egg found · ${found}/${EGGS.length}`,
    body: EGG_BY_ID[id]?.name ?? id,
  });
}
