"use client";

import type { ReactNode } from "react";
import { useAppStore } from "@/store/useAppStore";

export function AppBody({ children, className = "", pad = true }: { children: ReactNode; className?: string; pad?: boolean }) {
  const theme = useAppStore((s) => s.theme);
  return (
    <div className={`ui-app h-full overflow-auto ${theme === "retro" ? "retro-scroll" : "thin-scroll"} ${pad ? "p-5" : ""} ${className}`}>
      {children}
    </div>
  );
}

export function Section({ title, children, className = "", right }: { title: string; children: ReactNode; className?: string; right?: ReactNode }) {
  return (
    <section className={`space-y-2.5 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="ui-section-title">{title}</h3>
        {right}
      </div>
      {children}
    </section>
  );
}

export function Skeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2.5 animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="ui-card h-14" style={{ opacity: 1 - i * 0.18 }} />
      ))}
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="ui-faint text-sm text-center py-8">{children}</p>;
}

export function ExtIcon({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
      <path d="M6 3.5H3.5v9h9V10M9 3h4v4M13 3 7.5 8.5" />
    </svg>
  );
}

export function StarIcon({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="currentColor" aria-hidden="true">
      <path d="M8 1.2l2 4.3 4.7.6-3.4 3.2.9 4.6L8 11.6l-4.2 2.3.9-4.6L1.3 6.1 6 5.5l2-4.3Z" />
    </svg>
  );
}

// A row of key figures in one grouped box, separated by hairlines, like an info panel.
export function Stats({ items }: { items: [ReactNode, string][] }) {
  return (
    <div className="ui-card flex">
      {items.map(([value, label], i) => (
        <div key={label} className="flex-1 min-w-0 px-3 py-2.5" style={i ? { borderLeft: "1px solid var(--ui-border)" } : undefined}>
          <div className="text-[17px] font-semibold tabular-nums leading-tight">{value}</div>
          <div className="text-[11px] ui-muted mt-0.5 truncate">{label}</div>
        </div>
      ))}
    </div>
  );
}

// GitHub's language colors for the handful that show up in these repos.
export const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  "C#": "#178600",
  "C++": "#f34b7d",
  C: "#555555",
  Dart: "#00B4AB",
  Go: "#00ADD8",
  Java: "#b07219",
  Solidity: "#AA6746",
  HTML: "#e34c26",
  CSS: "#563d7c",
  ShaderLab: "#222c37",
  Kotlin: "#A97BFF",
  Rust: "#dea584",
};

export function timeAgo(iso: string | null): string {
  if (!iso) return "";
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days < 1) return "today";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}
