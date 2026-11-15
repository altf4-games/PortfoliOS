"use client";

import { AnimatePresence, motion } from "motion/react";
import { useAppStore } from "@/store/useAppStore";
import { BridgeLogo } from "@/apps/glyphs";


export default function Toasts() {
  const toasts = useAppStore((s) => s.toasts);
  const dismiss = useAppStore((s) => s.dismissToast);
  const theme = useAppStore((s) => s.theme);

  const pos = theme === "retro" ? "bottom-12 right-3" : theme === "hypr" ? "top-14 right-4" : "top-10 right-3";

  return (
    <div className={`absolute z-[1500] ${pos} flex flex-col gap-2 w-[340px] max-w-[calc(100vw-24px)] pointer-events-none`}>
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.button
            layout
            key={t.id}
            onClick={() => dismiss(t.id)}
            initial={theme === "retro" ? { opacity: 0, y: 20 } : { opacity: 0, x: 60, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: theme === "retro" ? 0 : 60, transition: { duration: 0.18 } }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className={`pointer-events-auto text-left flex items-start gap-3 p-3 ${
              theme === "retro"
                ? "bevel-out text-black"
                : theme === "hypr"
                  ? "rounded-md bg-[#1e1e2e] border-2 border-[#89b4fa] text-[#cdd6f4]"
                  : "glass text-white"
            }`}
            style={{
              borderRadius: theme === "golden" ? 18 : undefined,
              background: theme === "golden" ? "rgba(44,44,48,.92)" : undefined,
              fontFamily: theme === "retro" ? "var(--font-pixelify)" : theme === "hypr" ? "var(--font-jetbrains)" : undefined,
            }}
          >
            <span className={`shrink-0 w-9 h-9 flex items-center justify-center ${theme === "golden" ? "rounded-[9px] bg-[#3a3a3c]" : ""}`}>
              <BridgeLogo className="w-5 h-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-[13px] font-semibold">{t.title}</span>
              {t.body && <span className={`block text-[12px] ${theme === "retro" ? "" : "opacity-70"}`}>{t.body}</span>}
            </span>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
