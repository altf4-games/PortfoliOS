"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useDragControls } from "motion/react";
import { useAppStore, type WindowId } from "@/store/useAppStore";
import { APP_META, appName } from "@/apps/meta";
import { APP_COMPONENTS } from "@/apps/registry";
import { GoldenIcon } from "@/themes/golden/icons";
import { resolveWallpaper } from "@/lib/wallpapers";
import { useSiteData } from "@/lib/useSiteData";
import { useClock } from "@/components/os/useClock";
import Toasts from "@/components/os/Toasts";
import Effects from "@/components/os/Effects";

// One phone OS, in the same design language as the Golden Gate desktop. It shares the
// desktop's window store: the "open app" is the top of windowOrder, so an app opening
// another app (About → Resume) pushes onto a natural back stack.

const DOCK: WindowId[] = ["about", "projects", "resume", "terminal"];
const GRID = APP_META.map((a) => a.id).filter((id) => !DOCK.includes(id));

function StatusBar({ dark }: { dark?: boolean }) {
  const now = useClock();
  return (
    <div className={`absolute top-0 inset-x-0 z-50 h-12 px-7 flex items-center justify-between text-[15px] font-semibold ${dark ? "text-black" : "text-white"}`} style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <span className="tabular-nums">{now ? now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }).replace(/\s?[AP]M/i, "") : ""}</span>
      <span className="flex items-center gap-1.5">
        <svg viewBox="0 0 18 12" className="w-[18px] h-3" fill="currentColor">
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
          <rect x="10" y="3" width="3" height="9" rx="1" />
          <rect x="15" y="0" width="3" height="12" rx="1" />
        </svg>
        <svg viewBox="0 0 26 12" className="w-[25px] h-3">
          <rect x=".5" y=".5" width="22" height="11" rx="3" fill="none" stroke="currentColor" opacity=".4" />
          <rect x="2" y="2" width="16" height="8" rx="1.6" fill="currentColor" />
          <path d="M24 4v4" stroke="currentColor" strokeWidth="1.4" opacity=".4" strokeLinecap="round" />
        </svg>
      </span>
    </div>
  );
}

function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const now = useClock();
  return (
    <motion.div
      className="absolute inset-0 z-40 touch-none"
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0.6, bottom: 0 }}
      onDragEnd={(_, info) => {
        if (info.offset.y < -80 || info.velocity.y < -400) onUnlock();
      }}
      onClick={onUnlock}
      exit={{ y: "-100%", transition: { duration: 0.35, ease: [0.3, 0, 0.2, 1] } }}
    >
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute top-[13%] inset-x-0 text-center text-white">
        <div className="text-[19px] font-medium">{now?.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</div>
        <div className="text-[88px] font-semibold leading-none tracking-tight tabular-nums mt-1">
          {now ? now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }).replace(/\s?[AP]M/i, "") : ""}
        </div>
      </div>
      <div className="absolute bottom-36 inset-x-4">
        <div className="rounded-[22px] bg-[#1c1c1e]/80 backdrop-blur-xl px-4 py-3 text-white flex gap-3">
          <span className="w-9 h-9 rounded-[9px] shrink-0 overflow-hidden">
            <GoldenIcon id="about" className="w-full h-full" />
          </span>
          <div className="min-w-0">
            <div className="flex justify-between text-[13px]">
              <span className="font-semibold">PortfoliOS</span>
              <span className="text-white/50">now</span>
            </div>
            <div className="text-[14px] leading-snug">Pradyum&apos;s portfolio is ready. Swipe up to look around.</div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-10 inset-x-0 text-center text-white/80 text-[14px]">Swipe up to open</div>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-36 h-[5px] rounded-full bg-white" />
    </motion.div>
  );
}

function AppView({ id, origin, onBack, onHome }: { id: WindowId; origin: { x: number; y: number }; onBack: () => void; onHome: () => void }) {
  const App = APP_COMPONENTS[id];
  const controls = useDragControls();
  return (
    <motion.div
      key={id}
      initial={{ scale: 0.2, opacity: 0, borderRadius: 40 }}
      animate={{ scale: 1, opacity: 1, borderRadius: 0 }}
      exit={{ scale: 0.2, opacity: 0, borderRadius: 40, transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] } }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={{ transformOrigin: `${origin.x}px ${origin.y}px` }}
      drag="y"
      dragListener={false}
      dragControls={controls}
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={{ top: 0.5, bottom: 0 }}
      onDragEnd={(_, info) => {
        if (info.offset.y < -90 || info.velocity.y < -500) onHome();
      }}
      className="absolute inset-0 z-30 bg-[#1c1c1e] flex flex-col overflow-hidden"
    >
      <div className="shrink-0 pt-12" style={{ paddingTop: "max(3rem, env(safe-area-inset-top))" }}>
        <div className="h-11 px-2 flex items-center relative">
          <button onClick={onBack} className="flex items-center gap-0.5 text-[#0a84ff] text-[17px] px-2 py-1">
            <svg viewBox="0 0 12 20" className="w-3 h-5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 2 2 10l8 8" />
            </svg>
            Back
          </button>
          <span className="absolute left-1/2 -translate-x-1/2 text-[17px] font-semibold text-white">{appName(id, "golden")}</span>
        </div>
      </div>
      <div data-theme="golden" className="flex-1 min-h-0 overflow-hidden phone-app">
        <App />
      </div>
      <div className="shrink-0 h-7 flex items-center justify-center touch-none" onPointerDown={(e) => controls.start(e)} onClick={onHome}>
        <div className="w-36 h-[5px] rounded-full bg-white/80" />
      </div>
    </motion.div>
  );
}

function Widget() {
  const site = useSiteData();
  const openWindow = useAppStore((s) => s.openWindow);
  if (!site) return <div className="col-span-4 h-[148px] rounded-[22px] bg-[#1c1c1e]/70 backdrop-blur-xl" />;
  return (
    <button onClick={() => openWindow("about")} className="col-span-4 h-[148px] rounded-[22px] bg-[#1c1c1e]/75 backdrop-blur-xl p-4 text-left text-white flex gap-4 items-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={site.profile.avatarUrl} alt="" className="w-[76px] h-[76px] rounded-full object-cover" />
      <div className="min-w-0">
        <div className="text-[19px] font-semibold leading-tight">{site.profile.name}</div>
        <div className="text-[13px] text-white/60 mt-1 leading-snug">{site.profile.tagline}</div>
        <div className="text-[12px] text-white/45 mt-1.5 leading-snug">{site.profile.currently}</div>
      </div>
    </button>
  );
}

export default function PhoneOS() {
  const order = useAppStore((s) => s.windowOrder);
  const openWindow = useAppStore((s) => s.openWindow);
  const closeWindow = useAppStore((s) => s.closeWindow);
  const closeAll = useAppStore((s) => s.closeAll);
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const setPhase = useAppStore((s) => s.setPhase);
  const effect = useAppStore((s) => s.effect);
  const wallpapers = useAppStore((s) => s.wallpapers);
  const custom = useAppStore((s) => s.customWallpaper);
  const [locked, setLocked] = useState(true);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });

  // The phone has a single look, so it always runs the Golden Gate styling.
  useEffect(() => {
    if (theme !== "golden") setTheme("golden");
    setPhase("ready");
    closeAll();
  }, [theme, setTheme, setPhase, closeAll]);

  const current = order.at(-1) ?? null;
  const wp = resolveWallpaper("golden", wallpapers, custom);

  function launch(id: WindowId, e: React.MouseEvent) {
    setOrigin({ x: e.clientX, y: e.clientY });
    openWindow(id);
  }

  return (
    <div className="absolute inset-0 overflow-hidden bg-black text-white" style={{ fontFamily: "var(--font-geist-sans), -apple-system, sans-serif" }}>
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${wp.url})` }} />
      <StatusBar />

      {/* Home screen */}
      {!locked && (
      <motion.div
        className="absolute inset-0 pt-16 px-5 flex flex-col"
        initial={{ opacity: 0, scale: 1.06 }}
        animate={{ scale: current ? 0.94 : 1, opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
        style={{ paddingTop: "max(4rem, calc(env(safe-area-inset-top) + 3rem))" }}
      >
        <div className="grid grid-cols-4 gap-x-4 gap-y-5 mt-2">
          <Widget />
          {GRID.map((id) => (
            <button key={id} onClick={(e) => launch(id, e)} className="flex flex-col items-center gap-1.5 active:opacity-60">
              <GoldenIcon id={id} className="w-full max-w-[64px] h-auto" />
              <span className="text-[11.5px] text-white truncate max-w-full" style={{ textShadow: "0 1px 2px rgba(0,0,0,.6)" }}>
                {appName(id, "golden")}
              </span>
            </button>
          ))}
        </div>
        <div className="mt-auto mb-3 flex justify-center gap-1.5">
          <span className="w-[7px] h-[7px] rounded-full bg-white" />
          <span className="w-[7px] h-[7px] rounded-full bg-white/40" />
        </div>
        <div className="mb-3 rounded-[30px] bg-white/20 backdrop-blur-xl p-3 grid grid-cols-4 gap-4" style={{ marginBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
          {DOCK.map((id) => (
            <button key={id} onClick={(e) => launch(id, e)} className="active:opacity-60">
              <GoldenIcon id={id} className="w-full max-w-[64px] h-auto mx-auto" />
            </button>
          ))}
        </div>
      </motion.div>
      )}

      <AnimatePresence>
        {current && !locked && (
          <AppView
            key={current}
            id={current}
            origin={origin}
            onBack={() => closeWindow(current)}
            onHome={() => closeAll()}
          />
        )}
      </AnimatePresence>
      {current && !locked && <StatusBar />}

      <AnimatePresence>{locked && <LockScreen onUnlock={() => setLocked(false)} />}</AnimatePresence>

      <Toasts />
      <AnimatePresence>{effect && <Effects key={effect} />}</AnimatePresence>
    </div>
  );
}
