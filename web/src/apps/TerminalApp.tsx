"use client";

import { useEffect, useRef, useState } from "react";
import { useAppStore, type ThemeId } from "@/store/useAppStore";
import { useSiteData } from "@/lib/useSiteData";
import { fetchCached } from "@/lib/useFetch";
import { discoverEgg, EGGS } from "@/lib/eggs";
import { APP_META, appName, type WindowId } from "./meta";
import type { GithubRepo, ItchGame, MergedPr } from "@/lib/types";

const HISTORY_KEY = "portfolios-terminal-history";
const FORTUNES = [
  "Code is like humor. When you have to explain it, it's bad.",
  "First, solve the problem. Then, write the code.",
  "Make it work, make it right, make it fast.",
  "The best error message is the one that never shows up.",
  "Weeks of coding can save you hours of planning.",
  "There are 10 kinds of people: those who read binary and those who don't.",
  "It works on my machine. Ship the machine.",
  "Alt+F4 is the fastest way to win any argument.",
];

const COMMANDS = [
  "help", "clear", "about", "whoami", "neofetch", "education", "experience", "skills", "techstack",
  "achievements", "hackathons", "oss", "projects", "games", "stats", "resume", "github", "linkedin",
  "open", "theme", "explore", "eggs", "fortune", "cowsay", "matrix", "hire-me", "sudo", "unlock",
  "history", "reboot", "exit", "uname", "date", "uptime", "hostname", "pwd", "ls", "cat", "echo", "cd", "vim",
];

const FILES: Record<string, string> = {
  "resume.pdf": "[binary] Try `resume` or `open resume` instead.",
  "readme.md": "# PortfoliOS\nThree desktops, one phone, one 3D room.\nType `help` to look around, `eggs` to go hunting.",
  ".secrets": "cat: .secrets: Is a directory. Try the Files app with hidden files shown.",
  "todo.txt": "- [x] ship PortfoliOS v3\n- [ ] sleep",
};

interface Line {
  text: string;
  kind: "out" | "echo" | "accent" | "err" | "dim";
}

const PROMPTS: Record<ThemeId, { user: string; path: string; sym: string }> = {
  golden: { user: "pradyum@golden-gate", path: "~", sym: "%" },
  retro: { user: "", path: "C:\\PORTFOLIO", sym: ">" },
  hypr: { user: "pradyum", path: "~", sym: "❯" },
};

const NEOFETCH_ART = [
  "    |‾|       |‾|    ",
  "  __|_|_______|_|__  ",
  "    | |\\     /| |    ",
  "    | | \\   / | |    ",
  "____|_|__\\_/__|_|____",
  "~~~~~~~~~~~~~~~~~~~~~",
];

export default function TerminalApp() {
  const site = useSiteData();
  const theme = useAppStore((s) => s.theme);
  const openWindow = useAppStore((s) => s.openWindow);
  const closeWindow = useAppStore((s) => s.closeWindow);
  const setTheme = useAppStore((s) => s.setTheme);
  const setMode = useAppStore((s) => s.setMode);
  const setEffect = useAppStore((s) => s.setEffect);
  const eggs = useAppStore((s) => s.eggs);

  const [lines, setLines] = useState<Line[]>([
    { text: "PortfoliOS 3.0 — type 'help' to see what you can do.", kind: "accent" },
    { text: "", kind: "out" },
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]");
    } catch {
      return [];
    }
  });
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [lines]);

  const prompt = PROMPTS[theme];
  const promptText = theme === "retro" ? `${prompt.path}${prompt.sym}` : `${prompt.user} ${prompt.path} ${prompt.sym}`;

  function out(text = "", kind: Line["kind"] = "out") {
    setLines((prev) => [...prev, { text, kind }]);
  }
  function outMany(texts: string[], kind: Line["kind"] = "out") {
    setLines((prev) => [...prev, ...texts.map((text) => ({ text, kind }))]);
  }
  function heading(t: string) {
    out(t, "accent");
  }

  function resolveApp(name: string): WindowId | null {
    const n = name.toLowerCase();
    const hit = APP_META.find(
      (a) => a.id === n || a.title.toLowerCase() === n || appName(a.id, theme).toLowerCase() === n || a.keywords.includes(n)
    );
    return hit?.id ?? null;
  }

  function run(raw: string) {
    const trimmed = raw.trim();
    setLines((prev) => [...prev, { text: `${promptText} ${raw}`, kind: "echo" }]);
    if (!trimmed) return;

    const nextHistory = [trimmed, ...history.filter((h) => h !== trimmed)].slice(0, 30);
    setHistory(nextHistory);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
    } catch {}

    const lower = trimmed.toLowerCase();
    const [cmd, ...args] = lower.split(/\s+/);
    const arg = args.join(" ");

    if (lower === "do a barrel roll") {
      setEffect("barrel");
      discoverEgg("barrel-roll");
      return;
    }
    if (/^sudo\s+rm\s+-(rf|fr)\s+(\/|~|\*|\/\*)\s*$/.test(lower)) {
      out("[sudo] password for pradyum: ********", "dim");
      out("Removing / ...", "err");
      setTimeout(() => setEffect("meltdown"), 600);
      discoverEgg("rm-rf");
      return;
    }

    switch (cmd) {
      case "help":
        heading("About me");
        outMany([
          "  about · whoami · neofetch · education · experience · skills · techstack",
          "  achievements · hackathons · oss · projects · games · stats · resume",
        ]);
        heading("System");
        outMany([
          "  open <app>      open any app (e.g. open games)",
          "  theme <name>    golden · retro · hypr",
          "  explore         step into the 3D room (or press Esc)",
          "  eggs            easter egg progress",
          "  github · linkedin · fortune · cowsay <msg> · history · reboot · exit",
          "  ls · cat <file> · pwd · cd · echo · date · uptime · uname · hostname",
        ]);
        out("Tab completes commands. ↑/↓ walks history.", "dim");
        break;
      case "clear":
        setLines([]);
        return;
      case "about":
        out(site?.profile.about ?? "Loading...");
        break;
      case "whoami":
        out(site?.profile.whoami ?? "Loading...");
        break;
      case "neofetch": {
        const info = [
          `${"pradyum"}@${site?.profile.hostname ?? "portfolios"}`,
          "-----------------------",
          `OS: PortfoliOS 3.0 (${theme === "golden" ? "Golden Gate" : theme === "retro" ? "Retro 98" : "Hyprland"})`,
          "Host: K.J. Somaiya College of Engineering",
          `Uptime: ${Math.floor(performance.now() / 60000)} mins`,
          "Shell: portfolio-sh 3.0",
          "Langs: C++, C#, Go, Python, TypeScript",
          "Stack: React, Next.js, FastAPI, Flutter",
          "Engines: Unity, Unreal",
          `Eggs: ${eggs.length}/${EGGS.length}`,
        ];
        const rows = Math.max(NEOFETCH_ART.length, info.length);
        for (let i = 0; i < rows; i++) {
          out(`${(NEOFETCH_ART[i] ?? "").padEnd(24)}${info[i] ?? ""}`, i === 0 ? "accent" : "out");
        }
        break;
      }
      case "education":
        heading("Education");
        site?.education.forEach((e) => outMany([`  ${e.degree}`, `  ${e.institution} · ${e.period}${e.detail ? ` · ${e.detail}` : ""}`]));
        break;
      case "experience":
        heading("Experience");
        site?.experience.forEach((e) => {
          out(`  ${e.role} @ ${e.org}  (${e.period})`);
          e.bullets?.forEach((b) => out(`    • ${b}`, "dim"));
        });
        openWindow("experience");
        break;
      case "skills":
        heading("Skills");
        site?.skills.forEach((s) => out(`  → ${s}`));
        break;
      case "techstack":
        heading("Tech stack");
        if (site) Object.entries(site.techStack).forEach(([k, v]) => out(`  ${k.padEnd(13)} ${v}`));
        break;
      case "achievements":
        heading("Achievements");
        site?.achievements.forEach((a) => out(`  - ${a}`));
        break;
      case "hackathons":
        heading("Hackathons");
        site?.hackathons.forEach((h) => out(`  ${h.isWinner ? "[win]" : "[top]"} ${h.title}: ${h.result}`));
        openWindow("trophies");
        break;
      case "oss":
        out("Querying GitHub for merged pull requests...", "dim");
        fetchCached<MergedPr[]>("/api/github-prs").then((prs) => {
          heading(`${prs.length} merged PRs`);
          prs.forEach((pr) => out(`  ${pr.repo}#${pr.number}  ${pr.title}`));
          out("");
        });
        openWindow("oss");
        return;
      case "projects":
        out("Fetching pinned projects...", "dim");
        fetchCached<GithubRepo[]>("/api/github-pinned").then((repos) => {
          heading("Projects");
          site?.caseStudies.forEach((c) => out(`  * ${c.name}: ${c.tagline}`));
          repos.forEach((r) => out(`  ${r.name}${r.language ? ` (${r.language})` : ""}${r.description ? ` — ${r.description}` : ""}`));
          out("");
        });
        openWindow("projects");
        return;
      case "games":
        fetchCached<ItchGame[]>("/api/games").then((games) => {
          heading(`${games.length + 1} games`);
          out("  Fragments of Fear (Steam)");
          games.slice(0, 12).forEach((g) => out(`  ${g.title}`));
          if (games.length > 12) out(`  …and ${games.length - 12} more`, "dim");
          out("");
        });
        openWindow("games");
        return;
      case "stats":
        openWindow("stats");
        out("Opening Stats...");
        break;
      case "resume":
        openWindow("resume");
        out("Opening resume...");
        break;
      case "github":
        if (site) window.open(site.profile.githubUrl, "_blank");
        out("Opening GitHub...");
        break;
      case "linkedin":
        if (site) window.open(site.profile.linkedinUrl, "_blank");
        out("Opening LinkedIn...");
        break;
      case "open": {
        const id = resolveApp(arg);
        if (!arg) out("usage: open <app>. Apps: " + APP_META.map((a) => a.id).join(", "), "dim");
        else if (id) {
          openWindow(id);
          out(`Opening ${appName(id, theme)}...`);
        } else out(`open: no app named '${arg}'`, "err");
        break;
      }
      case "theme":
        if (arg === "golden" || arg === "retro" || arg === "hypr") {
          out(`Switching to ${arg}...`);
          setTimeout(() => setTheme(arg), 300);
        } else out("usage: theme golden | retro | hypr", "dim");
        break;
      case "explore":
      case "escape":
        setMode("explore");
        return;
      case "eggs": {
        heading(`Easter eggs: ${eggs.length}/${EGGS.length}`);
        EGGS.forEach((e) => out(eggs.includes(e.id) ? `  [x] ${e.name}` : `  [ ] ??? — ${e.hint}`, eggs.includes(e.id) ? "out" : "dim"));
        break;
      }
      case "fortune":
        out(FORTUNES[Math.floor(Math.random() * FORTUNES.length)]);
        break;
      case "cowsay": {
        const msg = raw.trim().slice(6).trim() || "moo. hire pradyum.";
        outMany([` ${"_".repeat(msg.length + 2)}`, `< ${msg} >`, ` ${"-".repeat(msg.length + 2)}`, "        \\   ^__^", "         \\  (oo)\\_______", "            (__)\\       )\\/\\", "                ||----w |", "                ||     ||"]);
        break;
      }
      case "matrix":
        setEffect("matrix");
        discoverEgg("matrix");
        return;
      case "hire-me":
      case "hire":
        setEffect("hire");
        discoverEgg("hire-me");
        out("Generating offer letter...", "accent");
        break;
      case "unlock":
        if (arg === "altf4") {
          out("Access granted. You read the console. Respect.", "accent");
          discoverEgg("devtools");
        } else out("unlock: invalid code. (Developers know where to look.)", "err");
        break;
      case "sudo":
        out("pradyum is not in the sudoers file. This incident will be reported.", "err");
        break;
      case "history":
        history.slice().reverse().forEach((h, i) => out(`  ${String(i + 1).padStart(3)}  ${h}`));
        break;
      case "reboot":
        out("Rebooting...", "dim");
        setTimeout(() => window.location.reload(), 700);
        break;
      case "exit":
        out("logout");
        setTimeout(() => closeWindow("terminal"), 300);
        break;
      case "uname":
        out(`PortfoliOS 3.0.0 ${theme} next.js react-three-fiber x86_64`);
        break;
      case "date":
        out(new Date().toString());
        break;
      case "uptime": {
        const s = Math.floor(performance.now() / 1000);
        out(`up ${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m ${s % 60}s`);
        break;
      }
      case "hostname":
        out(site?.profile.hostname ?? "portfolios.local");
        break;
      case "pwd":
        out(theme === "retro" ? "C:\\PORTFOLIO" : "/home/pradyum");
        break;
      case "cd":
        out(arg === ".secrets" ? "cd: permission denied (try the Files app 👀)" : "cd: this is a portfolio, not a filesystem. Try `open files`.", "dim");
        break;
      case "ls":
        out(args.includes("-a") || args.includes("-la") ? ".  ..  .secrets  readme.md  resume.pdf  todo.txt" : "readme.md  resume.pdf  todo.txt");
        break;
      case "cat":
        if (!arg) out("cat: missing file operand", "err");
        else out(FILES[arg] ?? `cat: ${arg}: No such file or directory`, FILES[arg] ? "out" : "err");
        break;
      case "vim":
      case "nvim":
      case "emacs":
        out("You are now trapped. Just kidding: there's no way in, so there's no way out to forget.", "dim");
        break;
      case "echo":
        out(raw.trim().slice(5));
        break;
      default:
        out(`command not found: ${cmd}. Type 'help'.`, "err");
    }
    out("");
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!history.length) return;
      const next = Math.min(historyIndex + 1, history.length - 1);
      setHistoryIndex(next);
      setInput(history[next]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = historyIndex - 1;
      setHistoryIndex(Math.max(-1, next));
      setInput(next < 0 ? "" : history[next]);
    } else if (e.key === "Tab") {
      e.preventDefault();
      const parts = input.split(" ");
      if (parts.length === 1) {
        const matches = COMMANDS.filter((c) => c.startsWith(parts[0].toLowerCase()));
        if (matches.length === 1) setInput(matches[0] + " ");
        else if (matches.length > 1) out(matches.join("  "), "dim");
      } else if (parts[0] === "open" || parts[0] === "theme") {
        const pool = parts[0] === "open" ? APP_META.map((a) => a.id as string) : ["golden", "retro", "hypr"];
        const matches = pool.filter((c) => c.startsWith(parts[1].toLowerCase()));
        if (matches.length === 1) setInput(`${parts[0]} ${matches[0]}`);
        else if (matches.length > 1) out(matches.join("  "), "dim");
      }
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  }

  const palette =
    theme === "retro"
      ? { bg: "#000", fg: "#c0c0c0", accent: "#fff", err: "#ff5555", dim: "#808080", prompt: "#c0c0c0", font: "var(--font-pixelify)" }
      : theme === "hypr"
        ? { bg: "transparent", fg: "#cdd6f4", accent: "#89dceb", err: "#f38ba8", dim: "#6c7086", prompt: "#a6e3a1", font: "var(--font-jetbrains)" }
        : { bg: "transparent", fg: "#e8e8ea", accent: "#e8e8ea", err: "#ff6b6b", dim: "rgba(255,255,255,.45)", prompt: "#e8e8ea", font: "var(--font-geist-mono)" };

  return (
    <div
      className="flex flex-col h-full text-[13px] p-3 leading-[1.55]"
      style={{ background: palette.bg, color: palette.fg, fontFamily: palette.font }}
      onClick={() => {
        if (!window.getSelection()?.toString()) inputRef.current?.focus();
      }}
    >
      <div ref={scrollRef} className={`flex-1 overflow-y-auto whitespace-pre-wrap break-words ${theme === "retro" ? "retro-scroll" : "thin-scroll"}`}>
        {lines.map((l, i) => (
          <div
            key={i}
            style={{
              color:
                l.kind === "accent" ? palette.accent : l.kind === "err" ? palette.err : l.kind === "dim" ? palette.dim : l.kind === "echo" ? palette.fg : undefined,
              opacity: l.kind === "echo" ? 0.95 : 1,
            }}
          >
            {l.text || " "}
          </div>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          run(input);
          setInput("");
          setHistoryIndex(-1);
        }}
        className="flex items-center gap-2 pt-1 shrink-0"
      >
        <span className="shrink-0" style={{ color: palette.prompt }}>
          {theme === "hypr" ? (
            <>
              <span style={{ color: "#cba6f7" }}>{prompt.user}</span> <span style={{ color: "#89b4fa" }}>{prompt.path}</span>{" "}
              <span style={{ color: "#a6e3a1" }}>{prompt.sym}</span>
            </>
          ) : (
            promptText
          )}
        </span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          autoFocus
          spellCheck={false}
          autoComplete="off"
          autoCapitalize="off"
          aria-label="Terminal input"
          className="flex-1 bg-transparent outline-none min-w-0"
          style={{ color: palette.fg, caretColor: palette.accent }}
        />
      </form>
    </div>
  );
}
