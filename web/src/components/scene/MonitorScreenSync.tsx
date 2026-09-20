"use client";

import { useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useAppStore } from "@/store/useAppStore";
import { resolveWallpaperUrl } from "@/lib/wallpapers";

// The room glb's own optimization pass merged the desk/monitor/chair into a couple of
// whole-room meshes, so the monitor screen can't be targeted as a separate object — only
// by its material. Materials came out of the Sketchfab export with generic names
// ("Material.012" etc.), so this name was inferred from being the largest landscape-shaped
// (1024x512) emissive texture, i.e. most likely a photo/UI rather than a small LED accent.
// If this is lighting up the wrong surface, check the material names in the glb (open it in
// https://gltf.report or run `npx @gltf-transform/cli inspect`) and swap the name below.
const MONITOR_MATERIAL_NAME = "Material.012";

export default function MonitorScreenSync() {
  const { scene } = useGLTF("/models/gaming_room.glb");
  const wallpaperId = useAppStore((s) => s.wallpaperId);
  const customWallpaper = useAppStore((s) => s.customWallpaper);

  useEffect(() => {
    const url = resolveWallpaperUrl(wallpaperId, customWallpaper);
    const loader = new THREE.TextureLoader();

    let cancelled = false;
    loader.load(url, (texture) => {
      if (cancelled) return;
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.flipY = false; // match glTF UV convention

      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (!mesh.isMesh) return;
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        for (const mat of materials) {
          if (mat instanceof THREE.MeshStandardMaterial && mat.name === MONITOR_MATERIAL_NAME) {
            mat.emissiveMap = texture;
            mat.emissive.set(0xffffff);
            mat.needsUpdate = true;
          }
        }
      });
    });

    return () => {
      cancelled = true;
    };
  }, [scene, wallpaperId, customWallpaper]);

  return null;
}
