"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { useAppStore } from "@/store/useAppStore";
import { useSearch } from "@/lib/search";
import { GoldenIcon } from "./icons";

export default function Spotlight() {
  const setOverlay = useAppStore((s) => s.setOverlay);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const results = useSearch(q);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => inputRef.current?.focus(), []);

  function run(i: number) {
    const r = results[i];
    if (!r) return;
    setOverlay(null);
    r.run();
  }

  return (
    <>
      <motion.div className="absolute inset-0 z-[980]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onPointerDown={() => setOverlay(null)} />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: -8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.12 } }}
        transition={{ type: "spring", stiffness: 500, damping: 34 }}
        className="absolute z-[990] left-1/2 top-[18%] -translate-x-1/2 w-[min(640px,92vw)] glass overflow-hidden"
        style={{ borderRadius: 22 }}
      >
        <div className="flex items-center gap-3 px-5 h-[58px]">
          <svg viewBox="0 0 20 20" className="w-5 h-5 text-white/55 shrink-0" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="8.5" cy="8.5" r="5.5" />
            <path d="m13 13 4.5 4.5" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setSel(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setSel((s) => Math.min(s + 1, results.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSel((s) => Math.max(s - 1, 0));
              } else if (e.key === "Enter") run(sel);
              else if (e.key === "Escape") {
                e.stopPropagation();
                setOverlay(null);
              }
            }}
            placeholder="Spotlight Search"
            className="flex-1 bg-transparent outline-none text-[21px] text-white placeholder:text-white/40 font-light"
            spellCheck={false}
          />
        </div>
        {results.length > 0 && (
          <div className="border-t border-white/10 max-h-[50vh] overflow-auto thin-scroll p-2">
            {!q && <div className="px-3 pt-1 pb-1.5 text-[11px] font-semibold text-white/40">Applications</div>}
            {results.map((r, i) => (
              <button
                key={r.key}
                onMouseEnter={() => setSel(i)}
                onClick={() => run(i)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left ${i === sel ? "bg-[#0a84ff]" : ""}`}
              >
                {r.app ? (
                  <GoldenIcon id={r.app} className="w-8 h-8 shrink-0" />
                ) : (
                  <span className="w-8 h-8 rounded-lg bg-white/15 shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="text-[14px] text-white truncate">{r.label}</div>
                  <div className={`text-[12px] truncate ${i === sel ? "text-white/80" : "text-white/45"}`}>{r.sub}</div>
                </div>
              </button>
            ))}
          </div>
        )}
        {q && results.length === 0 && <div className="border-t border-white/10 px-5 py-4 text-[13px] text-white/50">No results. Try “games”, “barclays”, or “retro”.</div>}
      </motion.div>
    </>
  );
}
