"use client";

import { useMemo } from "react";
import { APP_META, appName, type WindowId } from "@/apps/meta";
import { useAppStore, type ThemeId } from "@/store/useAppStore";
import { useSiteData } from "./useSiteData";
import { discoverEgg } from "./eggs";

export interface SearchResult {
  key: string;
  label: string;
  sub: string;
  app?: WindowId;
  run: () => void;
}

// One search index for Spotlight (Golden Gate), the Start menu's Find (Retro), and the
// rofi-style launcher (Hyprland): apps, content, and a few system actions.
export function useSearch(query: string): SearchResult[] {
  const site = useSiteData();
  const theme = useAppStore((s) => s.theme);

  return useMemo(() => {
    const s = useAppStore.getState();
    const q = query.trim().toLowerCase();
    const results: SearchResult[] = [];

    if (q === "do a barrel roll") {
      results.push({
        key: "barrel",
        label: "Do a barrel roll",
        sub: "Press Enter",
        run: () => {
          s.setEffect("barrel");
          discoverEgg("barrel-roll");
        },
      });
    }

    for (const a of APP_META) {
      const name = appName(a.id, theme);
      const hay = [name, a.title, ...a.keywords].join(" ").toLowerCase();
      if (!q || hay.includes(q)) {
        results.push({ key: `app-${a.id}`, label: name, sub: "Application", app: a.id, run: () => s.openWindow(a.id) });
      }
    }

    if (q && site) {
      for (const c of site.caseStudies) {
        if ([c.name, c.tagline, ...c.tech].join(" ").toLowerCase().includes(q))
          results.push({ key: `cs-${c.id}`, label: c.name, sub: `Project · ${c.tagline}`, app: "projects", run: () => s.openWindow("projects") });
      }
      for (const e of site.experience) {
        if ([e.role, e.org].join(" ").toLowerCase().includes(q))
          results.push({ key: `xp-${e.id}`, label: `${e.role} · ${e.org}`, sub: `Experience · ${e.period}`, app: "experience", run: () => s.openWindow("experience") });
      }
      for (const h of site.hackathons) {
        if ([h.title, h.result].join(" ").toLowerCase().includes(q))
          results.push({ key: `h-${h.id}`, label: h.title, sub: `Trophy · ${h.result}`, app: "trophies", run: () => s.openWindow("trophies") });
      }
      for (const [k, v] of Object.entries(site.techStack)) {
        if (v.toLowerCase().includes(q))
          results.push({ key: `ts-${k}`, label: `${k}: ${v}`, sub: "Tech stack", app: "about", run: () => s.openWindow("about") });
      }
    }

    const themes: [ThemeId, string][] = [
      ["golden", "Golden Gate"],
      ["retro", "Retro 98"],
      ["hypr", "Hyprland"],
    ];
    for (const [id, name] of themes) {
      if (q && (`theme ${name}`.toLowerCase().includes(q) || `switch to ${name}`.toLowerCase().includes(q)) && id !== theme)
        results.push({ key: `theme-${id}`, label: `Switch to ${name}`, sub: "Appearance", app: "settings", run: () => s.setTheme(id) });
    }
    if (q && "explore room 3d".includes(q)) {
      results.push({ key: "explore", label: "Explore the 3D room", sub: "System", run: () => s.setMode("explore") });
    }

    return results.slice(0, q ? 12 : 14);
  }, [query, site, theme]);
}
