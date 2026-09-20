"use client";

import { ReactNode } from "react";
import { useIsMobile, useOrientation } from "@/lib/useIsMobile";

/**
 * On phones held in portrait, this rotates the whole app 90deg via CSS and
 * swaps the viewport dimensions so the 3D scene always renders "landscape",
 * without needing the Screen Orientation Lock API (which iOS Safari doesn't
 * support for arbitrary pages).
 */
export default function ForceLandscape({ children }: { children: ReactNode }) {
  const isMobile = useIsMobile();
  const orientation = useOrientation();
  const shouldRotate = isMobile && orientation === "portrait";

  if (!shouldRotate) {
    // Establishes the same "real viewport size" container the rotated path below
    // does, so children can size themselves with `h-full` in both cases instead of
    // `h-dvh` — which would ignore the rotated container's swapped dimensions and
    // size against the true (unrotated) device height, pushing content off-canvas.
    return <div className="w-full h-dvh">{children}</div>;
  }

  return (
    <div className="landscape-rotate-outer">
      <div className="landscape-rotate-inner">{children}</div>
    </div>
  );
}
