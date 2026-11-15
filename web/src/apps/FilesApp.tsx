"use client";

import { useEffect, useRef, useState } from "react";
import { useAppStore, type ThemeId } from "@/store/useAppStore";
import { useSiteData } from "@/lib/useSiteData";
import { useFetch } from "@/lib/useFetch";
import type { ItchGame } from "@/lib/types";
import { discoverEgg } from "@/lib/eggs";
import { APP_META, appName, type WindowId } from "./meta";
import { AppIcon } from "./AppIcon";
import { PixelIcon } from "@/themes/retro/icons";

type Item =
  | { kind: "app"; name: string; app: WindowId }
  | { kind: "folder"; name: string; folder: string }
  | { kind: "link"; name: string; href: string }
  | { kind: "text"; name: string; body: string };

function KindIcon({ kind, theme, className }: { kind: "folder" | "link" | "text"; theme: ThemeId; className?: string }) {
  if (theme === "retro") return <PixelIcon id={kind === "text" ? "file" : kind} className={`pixelated ${className}`} />;
  const hypr = theme === "hypr";
  if (kind === "folder") {
    return (
      <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
        <path d="M4 12a4 4 0 0 1 4-4h10l4 4h18a4 4 0 0 1 4 4v20a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V12Z" fill={hypr ? "none" : "#2f8cff"} stroke={hypr ? "#89b4fa" : "none"} strokeWidth="2" />
        {!hypr && <path d="M4 17h40v19a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V17Z" fill="#5eb0ff" />}
      </svg>
    );
  }
  if (kind === "link") {
    return (
      <svg viewBox="0 0 48 48" className={className} aria-hidden="true" fill="none" stroke={hypr ? "#94e2d5" : "#fff"} strokeWidth="3" strokeLinecap="round">
        {!hypr && <rect x="4" y="4" width="40" height="40" rx="10" fill="#34c3ff" stroke="none" />}
        <path d="M21 27a6 6 0 0 0 8.5 0l5-5a6 6 0 0 0-8.5-8.5l-1.5 1.5M27 21a6 6 0 0 0-8.5 0l-5 5a6 6 0 0 0 8.5 8.5l1.5-1.5" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path d="M11 4h18l10 10v30H11V4Z" fill={hypr ? "none" : "#f4f4f6"} stroke={hypr ? "#bac2de" : "#c9c9cf"} strokeWidth="2" />
      <path d="M29 4v10h10" fill="none" stroke={hypr ? "#bac2de" : "#c9c9cf"} strokeWidth="2" />
      <path d="M17 22h14M17 27h14M17 32h9" stroke={hypr ? "#6c7086" : "#a0a0a8"} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function FilesApp() {
  const theme = useAppStore((s) => s.theme);
  const openWindow = useAppStore((s) => s.openWindow);
  const site = useSiteData();
  const games = useFetch<ItchGame[]>("/api/games").data;
  const [folder, setFolder] = useState("Applications");
  const [selected, setSelected] = useState<string | null>(null);
  const [showHidden, setShowHidden] = useState(false);
  const [preview, setPreview] = useState<Extract<Item, { kind: "text" }> | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const coarse = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

  const p = site?.profile;
  const tree: Record<string, Item[]> = {
    Applications: APP_META.filter((a) => a.id !== "files").map((a) => ({ kind: "app", name: appName(a.id, theme), app: a.id })),
    Documents: [
      { kind: "app", name: "Resume.pdf", app: "resume" },
      { kind: "app", name: "About Me.txt", app: "about" },
      { kind: "app", name: "Experience.md", app: "experience" },
      { kind: "app", name: "Publications", app: "research" },
      {
        kind: "text",
        name: "todo.txt",
        body: "- [x] ship PortfoliOS v3\n- [x] three desktops, one phone\n- [ ] sleep\n- [ ] find all 14 easter eggs (try the terminal: `eggs`)",
      },
    ],
    Projects: [
      ...(site?.caseStudies ?? []).map((c): Item => ({ kind: "app", name: c.name, app: "projects" })),
      { kind: "app", name: "Open Source", app: "oss" },
      ...(p ? [{ kind: "link", name: "All repositories", href: `${p.githubUrl}?tab=repositories` } as Item] : []),
    ],
    Games: [
      ...(p ? [{ kind: "link", name: "Fragments of Fear (Steam)", href: p.steamUrl } as Item] : []),
      ...(games ?? []).map((g): Item => ({ kind: "link", name: `${g.title}.exe`, href: g.url })),
      { kind: "app", name: "Stacker", app: "arcade" },
    ],
    Links: p
      ? ([
          { kind: "link", name: "GitHub", href: p.githubUrl },
          { kind: "link", name: "LinkedIn", href: p.linkedinUrl },
          { kind: "link", name: "itch.io", href: p.itchUrl },
          { kind: "link", name: "Steam", href: p.steamUrl },
          { kind: "link", name: "ORCID", href: p.orcidUrl },
        ].filter((l) => l.href) as Item[])
      : [],
    ".secrets": [
      {
        kind: "text",
        name: "README.secret",
        body: "You found the hidden folder.\n\nMost people never press ⌘⇧. or tick 'Show hidden files'.\nThe ones who do tend to read source code for fun.\n\nIf that's you, we should talk.\n— Pradyum",
      },
      { kind: "text", name: "passwords.txt", body: "hunter2\n\n(nice try)" },
      { kind: "text", name: "konami.txt", body: "↑ ↑ ↓ ↓ ← → ← → B A" },
    ],
  };

  const folders = Object.keys(tree).filter((f) => showHidden || !f.startsWith("."));
  const items = tree[folder] ?? [];

  useEffect(() => {
    if (folder === ".secrets") discoverEgg("secret-file");
  }, [folder]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === "." || e.key === ">")) {
        e.preventDefault();
        setShowHidden((v) => !v);
      }
    }
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, []);

  function open(item: Item) {
    if (item.kind === "app") openWindow(item.app);
    else if (item.kind === "folder") setFolder(item.folder);
    else if (item.kind === "link") window.open(item.href, "_blank", "noopener");
    else setPreview(item);
  }

  const retro = theme === "retro";

  return (
    <div ref={rootRef} tabIndex={-1} className="ui-app relative h-full flex flex-col outline-none">
      {/* toolbar */}
      <div className={`flex items-center gap-2 px-3 py-2 shrink-0 ${retro ? "" : "border-b"}`} style={{ borderColor: "var(--ui-border)" }}>
        <span className="text-[13px] font-semibold flex-1 truncate">{retro ? `C:\\PORTFOLIO\\${folder.toUpperCase()}` : folder}</span>
        <label className="flex items-center gap-1.5 text-[12px] ui-muted cursor-pointer select-none">
          <input type="checkbox" checked={showHidden} onChange={(e) => setShowHidden(e.target.checked)} />
          Show hidden files
        </label>
      </div>
      <div className="flex flex-1 min-h-0">
        {/* sidebar */}
        <nav className={`w-40 shrink-0 p-2 space-y-0.5 overflow-auto ${retro ? "bevel-in bg-white m-1 mr-0" : "border-r"}`} style={{ borderColor: "var(--ui-border)" }}>
          {folders.map((f) => (
            <button
              key={f}
              onClick={() => {
                setFolder(f);
                setSelected(null);
              }}
              className={`w-full flex items-center gap-2 px-2 py-1.5 text-[13px] text-left ${retro ? "" : "rounded-md"}`}
              style={
                folder === f
                  ? { background: retro ? "#000080" : "color-mix(in srgb, var(--ui-accent) 22%, transparent)", color: retro ? "#fff" : undefined }
                  : undefined
              }
            >
              <KindIcon kind="folder" theme={theme} className="w-4 h-4 shrink-0" />
              <span className="truncate">{f}</span>
            </button>
          ))}
        </nav>
        {/* grid */}
        <div
          className={`flex-1 min-w-0 overflow-auto p-3 ${retro ? "bevel-in bg-white m-1 retro-scroll" : "thin-scroll"}`}
          onClick={() => setSelected(null)}
        >
          <div className="grid grid-cols-[repeat(auto-fill,minmax(92px,1fr))] gap-1">
            {items.map((item) => {
              const isSel = selected === item.name;
              return (
                <button
                  key={item.name}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (coarse) open(item);
                    else setSelected(item.name);
                  }}
                  onDoubleClick={() => open(item)}
                  onKeyDown={(e) => e.key === "Enter" && open(item)}
                  className="flex flex-col items-center gap-1.5 p-2 text-center"
                >
                  <span className={`w-12 h-12 flex items-center justify-center ${isSel && !retro ? "rounded-lg bg-white/10" : ""}`}>
                    {item.kind === "app" ? (
                      <AppIcon id={item.app} className="w-11 h-11" />
                    ) : (
                      <KindIcon kind={item.kind} theme={theme} className="w-10 h-10" />
                    )}
                  </span>
                  <span
                    className={`text-[11px] leading-tight line-clamp-2 px-1 ${retro ? "" : "rounded"}`}
                    style={isSel ? { background: retro ? "#000080" : "var(--ui-accent)", color: retro ? "#fff" : "var(--ui-accent-fg)" } : undefined}
                  >
                    {item.name}
                  </span>
                </button>
              );
            })}
          </div>
          {items.length === 0 && <p className="ui-faint text-sm text-center py-10">This folder is empty.</p>}
        </div>
      </div>
      <div className={`px-3 py-1 text-[11px] ui-faint shrink-0 ${retro ? "bevel-thin-in mx-1 mb-1" : "border-t"}`} style={{ borderColor: "var(--ui-border)" }}>
        {items.length} item{items.length === 1 ? "" : "s"}
        {!coarse && " · double-click to open"}
      </div>

      {preview && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 p-6" onClick={() => setPreview(null)}>
          <div
            className={`w-full max-w-md p-4 ${retro ? "bevel-out" : "ui-card"}`}
            style={retro ? undefined : { background: "rgba(24,24,28,.96)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[13px] font-semibold">{preview.name}</span>
              <button className="ui-btn !py-0.5 !px-2 !text-xs" onClick={() => setPreview(null)}>
                Close
              </button>
            </div>
            <pre className={`text-[12px] whitespace-pre-wrap ui-mono p-3 ${retro ? "bevel-in bg-white" : "rounded-md bg-black/30"}`}>{preview.body}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
