import { useEffect, useState } from "react";

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px), (pointer: coarse)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isMobile;
}

export function useOrientation(): "portrait" | "landscape" {
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");

  useEffect(() => {
    const mq = window.matchMedia("(orientation: landscape)");
    const update = () => setOrientation(mq.matches ? "landscape" : "portrait");
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return orientation;
}

/**
 * On mobile+portrait, ForceLandscape rotates the page 90deg via CSS and swaps the
 * container to width:100vh/height:100vw, so everything inside actually renders in a
 * landscape-shaped box even though window.innerWidth/innerHeight still report the
 * real (portrait) device viewport. Anything sizing itself against the viewport outside
 * of pure CSS (window rects, the "maximize" calculation) needs this swapped size
 * instead of the raw one, or it inverts width and height on exactly that case.
 */
export function getEffectiveViewport(): { width: number; height: number } {
  if (typeof window === "undefined") return { width: 0, height: 0 };
  const isMobile = window.matchMedia("(max-width: 900px), (pointer: coarse)").matches;
  const isPortrait = window.matchMedia("(orientation: landscape)").matches === false;
  if (isMobile && isPortrait) {
    return { width: window.innerHeight, height: window.innerWidth };
  }
  return { width: window.innerWidth, height: window.innerHeight };
}
