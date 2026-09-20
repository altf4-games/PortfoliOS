"use client";

import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useSiteData } from "@/lib/useSiteData";

const PROMPT = "pradyum@altf4-os:~$";
const HISTORY_KEY = "portfolios-terminal-history";
const FORTUNES = [
  "Code is like humor. When you have to explain it, it's bad.",
  "First, solve the problem. Then, write the code.",
  "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
  "The best error message is the one that never shows up.",
  "Simplicity is the soul of efficiency.",
  "Make it work, make it right, make it fast.",
  "Programming isn't about what you know; it's about what you can figure out.",
];

interface Line {
  text: string;
  kind: "output" | "echo";
}

export default function Terminal() {
  const site = useSiteData();
  const toggleMode = useAppStore((s) => s.toggleMode);
  const openWindow = useAppStore((s) => s.openWindow);

  const [lines, setLines] = useState<Line[]>([
    { text: "===========================================", kind: "output" },
    { text: "       Welcome to PortfoliOS Terminal      ", kind: "output" },
    { text: "===========================================", kind: "output" },
    { text: "Type 'help' for available commands.", kind: "output" },
    { text: "", kind: "output" },
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      return saved ? JSON.parse(saved) : [];
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

  function print(text = "") {
    setLines((prev) => [...prev, { text, kind: "output" }]);
  }

  function run(raw: string) {
    const command = raw.trim().toLowerCase();
    setLines((prev) => [...prev, { text: `${PROMPT} ${raw}`, kind: "echo" }]);

    if (!command) return;

    const nextHistory = [command, ...history.filter((h) => h !== command)].slice(0, 10);
    setHistory(nextHistory);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
    } catch {}

    switch (command) {
      case "help":
        print("Available commands:");
        print("-------------------");
        print("help        - Display this help message");
        print("clear       - Clear the terminal screen");
        print("about       - Learn about me");
        print("education   - View my educational background");
        print("experience  - View my work experience");
        print("skills      - View my technical skills");
        print("achievements - View my achievements");
        print("hackathons  - View hackathon wins");
        print("projects    - Open the projects window");
        print("linkedin    - Open my LinkedIn profile");
        print("github      - Open my GitHub profile");
        print("resume      - Open my resume");
        print("whoami      - Display user identity");
        print("techstack   - View complete tech stack");
        print("fortune     - Get a random developer quote");
        print("sudo        - Attempt elevated permissions");
        print("escape      - Toggle between OS and Explore mode (or press Escape)");
        print("");
        print("System Commands:");
        print("-------------------");
        print("uname | date | uptime | hostname | pwd | ls | cat | echo [text]");
        break;
      case "clear":
        setLines([]);
        return;
      case "about":
        print(site?.profile.about ?? "Loading...");
        break;
      case "education":
        print("Education:");
        print("-------------------");
        site?.education.forEach((e) => {
          print(e.degree);
          print(e.institution);
          print(e.period);
          if (e.detail) print(e.detail);
          print("");
        });
        break;
      case "experience":
        print("Work Experience:");
        print("-------------------");
        site?.experience.forEach((e, i) => {
          print(e.role);
          print(e.org);
          print(e.period);
          if (i < (site?.experience.length ?? 0) - 1) print("");
        });
        break;
      case "skills":
        print("Core Technical Skills:");
        print("-------------------");
        site?.skills.forEach((s) => print(`→ ${s}`));
        break;
      case "achievements":
        print("Achievements:");
        print("-------------------");
        site?.achievements.forEach((a) => print(`- ${a}`));
        break;
      case "hackathons":
        print("Hackathon Wins:");
        print("-------------------");
        site?.hackathons.forEach((h) => print(`${h.date} - ${h.title}: ${h.result}`));
        openWindow("hackathons");
        break;
      case "projects":
        print("Opening projects window...");
        openWindow("projects");
        break;
      case "linkedin":
        print("Opening LinkedIn profile...");
        if (site) window.open(site.profile.linkedinUrl, "_blank");
        break;
      case "github":
        print("Opening GitHub profile...");
        if (site) window.open(site.profile.githubUrl, "_blank");
        break;
      case "resume":
        print("Opening resume...");
        if (site) window.open(site.profile.resumeUrl, "_blank");
        break;
      case "whoami":
        print(site?.profile.whoami ?? "Loading...");
        break;
      case "techstack":
        print("Complete Tech Stack:");
        print("-------------------");
        if (site) {
          Object.entries(site.techStack).forEach(([k, v]) => print(`${k}: ${v}`));
        }
        break;
      case "fortune":
        print(FORTUNES[Math.floor(Math.random() * FORTUNES.length)]);
        break;
      case "sudo":
        print("Access denied. Permission required.");
        print("Nice try though!");
        break;
      case "reboot":
        print("Initiating system reboot...");
        setTimeout(() => window.location.reload(), 900);
        break;
      case "escape":
        toggleMode();
        return;
      case "uname":
      case "version":
        print("PortfoliOS v2.0.0 (web)");
        print("Kernel: Next.js / React Three Fiber");
        print("Architecture: wasm-free");
        break;
      case "date":
        print(new Date().toString());
        break;
      case "uptime": {
        const seconds = Math.floor(performance.now() / 1000);
        print(`System uptime: ${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m ${seconds % 60}s`);
        break;
      }
      case "hostname":
        print(site?.profile.hostname ?? "portfolios.local");
        break;
      case "pwd":
        print("/home/pradyum");
        break;
      case "ls":
        print("Desktop/     Documents/   Downloads/");
        print("Pictures/    Projects/    Music/");
        print("Videos/      portfolio/   resume.pdf");
        break;
      case "cat":
        print("cat: missing file operand");
        print("Try 'resume' to view resume instead");
        break;
      default:
        if (command.startsWith("echo ")) {
          print(raw.trim().slice(5));
        } else {
          print("Unknown command. Type 'help' for a list of available commands.");
        }
    }
    print("");
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    run(input);
    setInput("");
    setHistoryIndex(-1);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      const next = Math.min(historyIndex + 1, history.length - 1);
      setHistoryIndex(next);
      setInput(history[next]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = historyIndex - 1;
      if (next < 0) {
        setHistoryIndex(-1);
        setInput("");
      } else {
        setHistoryIndex(next);
        setInput(history[next]);
      }
    }
  }

  return (
    <div
      className="flex flex-col h-full font-mono text-sm text-green-400 p-3"
      onClick={() => inputRef.current?.focus()}
    >
      <div ref={scrollRef} className="flex-1 overflow-y-auto whitespace-pre-wrap break-words">
        {lines.map((l, i) => (
          <div key={i} className={l.kind === "echo" ? "text-white" : ""}>
            {l.text}
          </div>
        ))}
      </div>
      <form onSubmit={onSubmit} className="flex items-center gap-2 pt-1 shrink-0">
        <span className="text-white shrink-0">{PROMPT}</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          autoFocus
          spellCheck={false}
          autoComplete="off"
          className="flex-1 bg-transparent outline-none text-green-400 caret-green-400"
        />
      </form>
    </div>
  );
}
