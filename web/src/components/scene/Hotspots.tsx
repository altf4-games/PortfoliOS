"use client";

import { useEffect, useState } from "react";
import { Html, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useAppStore, type WindowId } from "@/store/useAppStore";
import { discoverEgg } from "@/lib/eggs";
import { CAMERA_POSITION } from "./CameraRig";

// Markers are defined by the direction you'd look from the chair (yaw/pitch, same space
// as the camera rig). At load each direction is raycast against the room so the marker
// sits on whatever surface is there, without hand-placing world coordinates in a model
// whose meshes were merged.
interface HotspotDef {
  key: string;
  yaw: number;
  pitch: number;
  label: string;
  app?: WindowId;
  secret?: boolean;
}

// Angles measured from the chair with the desk at yaw 1.5.
const HOTSPOTS: HotspotDef[] = [
  { key: "monitor", yaw: 1.59, pitch: -0.105, label: "Use the computer", app: "about" },
  { key: "tv", yaw: 1.5, pitch: 0.42, label: "Games", app: "games" },
  { key: "poster", yaw: 2.05, pitch: -0.14, label: "Projects", app: "projects" },
  { key: "laptop", yaw: 0.97, pitch: -0.25, label: "Terminal", app: "terminal" },
  { key: "keyboard", yaw: 1.71, pitch: -0.47, label: "Play Stacker", app: "arcade" },
  { key: "speaker", yaw: 1.85, pitch: -0.34, label: "Music", app: "music" },
  { key: "ceiling", yaw: 2.6, pitch: 1.35, label: "?", secret: true },
];

export default function Hotspots() {
  const { scene } = useGLTF("/models/gaming_room.glb");
  const mode = useAppStore((s) => s.mode);
  const phase = useAppStore((s) => s.phase);
  const [points, setPoints] = useState<{ def: HotspotDef; pos: THREE.Vector3 }[]>([]);

  useEffect(() => {
    const ray = new THREE.Raycaster();
    const found: { def: HotspotDef; pos: THREE.Vector3 }[] = [];
    for (const def of HOTSPOTS) {
      const dir = new THREE.Vector3(0, 0, -1).applyEuler(new THREE.Euler(def.pitch, def.yaw, 0, "YXZ"));
      ray.set(CAMERA_POSITION, dir);
      const hit = ray.intersectObject(scene, true)[0];
      const dist = hit ? Math.max(0.6, hit.distance * 0.92) : 3;
      found.push({ def, pos: CAMERA_POSITION.clone().addScaledVector(dir, dist) });
    }
    // Raycasting is a one-off measurement against the loaded model; storing it is fine.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPoints(found);
  }, [scene]);

  if (mode !== "explore" || phase !== "ready") return null;

  return (
    <>
      {points.map(({ def, pos }) => (
        <Html key={def.key} position={pos} center zIndexRange={[20, 10]}>
          <button
            onClick={() => {
              const s = useAppStore.getState();
              if (def.secret) {
                discoverEgg("room-secret");
                s.pushToast({ icon: "egg", title: "You looked up.", body: "Most people never do." });
                return;
              }
              if (def.app) {
                s.setMode("os");
                setTimeout(() => s.openWindow(def.app!), 500);
              }
            }}
            className={`group relative flex items-center ${def.secret ? "opacity-30 hover:opacity-100" : ""}`}
          >
            <span className="relative flex h-5 w-5 items-center justify-center">
              <span className={`relative inline-flex rounded-full ${def.secret ? "h-2.5 w-2.5 bg-white/70" : "h-3 w-3 bg-white ring-[3px] ring-black/60"}`} />
            </span>
            {!def.secret && (
              <span className="ml-2 whitespace-nowrap rounded-md bg-black/80 px-2.5 py-1 text-[12px] font-medium text-white opacity-0 translate-x-[-4px] group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                {def.label}
              </span>
            )}
          </button>
        </Html>
      ))}
    </>
  );
}
