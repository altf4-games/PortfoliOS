// Plain data about each app, with no React imports, so the store can use it too.
// Every theme renders the same apps; only the chrome around them changes.

export type WindowId =
  | "about"
  | "projects"
  | "experience"
  | "oss"
  | "trophies"
  | "games"
  | "research"
  | "stats"
  | "resume"
  | "files"
  | "terminal"
  | "music"
  | "arcade"
  | "settings";

export interface AppMeta {
  id: WindowId;
  title: string;
  // Per-theme display names where the convention differs (e.g. Files vs. Finder).
  names?: Partial<Record<"golden" | "retro" | "hypr", string>>;
  size: { width: number; height: number };
  keywords: string[];
  inDock: boolean;
}

export const APP_META: AppMeta[] = [
  { id: "about", title: "About Me", size: { width: 560, height: 520 }, keywords: ["profile", "bio", "contact", "who"], inDock: true },
  { id: "projects", title: "Projects", size: { width: 760, height: 560 }, keywords: ["github", "repos", "milan", "wayfinder", "namegate", "work"], inDock: true },
  { id: "experience", title: "Experience", size: { width: 620, height: 520 }, keywords: ["work", "job", "barclays", "intern", "career", "education"], inDock: true },
  { id: "oss", title: "Open Source", size: { width: 600, height: 520 }, keywords: ["pull requests", "prs", "contributions", "microsoft", "ultralytics"], inDock: true },
  { id: "trophies", title: "Trophy Case", size: { width: 560, height: 520 }, keywords: ["hackathons", "awards", "wins", "achievements", "ethglobal"], inDock: true },
  { id: "games", title: "Games", size: { width: 760, height: 560 }, keywords: ["itch", "steam", "horror", "fragments of fear", "unity"], inDock: true },
  { id: "stats", title: "Stats", size: { width: 680, height: 540 }, keywords: ["leetcode", "codechef", "codeforces", "github", "competitive"], inDock: true },
  { id: "research", title: "Research", size: { width: 520, height: 400 }, keywords: ["paper", "publication", "springer", "copyright", "dataset"], inDock: false },
  { id: "resume", title: "Resume", names: { golden: "Preview", retro: "Resume Viewer" }, size: { width: 640, height: 720 }, keywords: ["cv", "pdf", "download"], inDock: true },
  { id: "files", title: "Files", names: { golden: "Finder", retro: "My Computer", hypr: "thunar" }, size: { width: 680, height: 460 }, keywords: ["folders", "browse", "explorer"], inDock: true },
  { id: "terminal", title: "Terminal", names: { retro: "Command Prompt", hypr: "kitty" }, size: { width: 660, height: 440 }, keywords: ["shell", "cli", "command", "zsh"], inDock: true },
  { id: "music", title: "Music", size: { width: 380, height: 520 }, keywords: ["lofi", "audio", "player", "sound"], inDock: true },
  { id: "arcade", title: "Stacker", size: { width: 420, height: 600 }, keywords: ["game", "play", "arcade", "fun"], inDock: true },
  { id: "settings", title: "Settings", names: { golden: "System Settings", retro: "Control Panel" }, size: { width: 620, height: 540 }, keywords: ["theme", "wallpaper", "volume", "preferences"], inDock: true },
];

export const APP_BY_ID = Object.fromEntries(APP_META.map((a) => [a.id, a])) as Record<WindowId, AppMeta>;

export function appName(id: WindowId, theme: "golden" | "retro" | "hypr"): string {
  const meta = APP_BY_ID[id];
  return meta.names?.[theme] ?? meta.title;
}
