"use client";

import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { WindowId } from "./meta";

function Loading() {
  return <div className="ui-app h-full flex items-center justify-center text-sm ui-faint animate-pulse">Loading…</div>;
}

// Each app is its own chunk, loaded the first time its window opens.
export const APP_COMPONENTS: Record<WindowId, ComponentType> = {
  about: dynamic(() => import("./AboutApp"), { loading: Loading }),
  projects: dynamic(() => import("./ProjectsApp"), { loading: Loading }),
  experience: dynamic(() => import("./ExperienceApp"), { loading: Loading }),
  oss: dynamic(() => import("./OssApp"), { loading: Loading }),
  trophies: dynamic(() => import("./TrophiesApp"), { loading: Loading }),
  games: dynamic(() => import("./GamesApp"), { loading: Loading }),
  stats: dynamic(() => import("./StatsApp"), { loading: Loading }),
  research: dynamic(() => import("./ResearchApp"), { loading: Loading }),
  resume: dynamic(() => import("./ResumeApp"), { loading: Loading }),
  files: dynamic(() => import("./FilesApp"), { loading: Loading }),
  terminal: dynamic(() => import("./TerminalApp"), { loading: Loading }),
  music: dynamic(() => import("./MusicApp"), { loading: Loading }),
  arcade: dynamic(() => import("./ArcadeApp"), { loading: Loading }),
  settings: dynamic(() => import("./SettingsApp"), { loading: Loading }),
};
