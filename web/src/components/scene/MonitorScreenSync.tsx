"use client";

import { useEffect } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useAppStore } from "@/store/useAppStore";
import { resolveWallpaper } from "@/lib/wallpapers";

// The room glb merged desk/monitor/chair into whole-room meshes, so the monitor screen is
// targeted by material. "Material.012" is the largest landscape-shaped emissive texture.
// If the wrong surface lights up, inspect the glb (https://gltf.report) and swap the name.
const MONITOR_MATERIAL_NAME = "Material.012";
// The wall TV (a 1024x1024 emissive stretched to ~2.5:1) shows the Steam art for
// Fragments of Fear, pre-squashed so it lands at the right aspect.
const TV_MATERIAL_NAME = "Material.010";
const TV_TEXTURE = "/scene/tv-fragments-of-fear.webp";

function applyEmissive(scene: THREE.Object3D, name: string, texture: THREE.Texture, intensity: number) {
  scene.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (!mesh.isMesh) return;
    const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    for (const mat of mats) {
      if (mat instanceof THREE.MeshStandardMaterial && mat.name === name) {
        if (mat.emissiveMap && mat.emissiveMap !== texture) mat.emissiveMap.dispose();
        mat.emissiveMap = texture;
        mat.emissive.set(0xffffff);
        mat.emissiveIntensity = intensity;
        mat.needsUpdate = true;
      }
    }
  });
}

export default function MonitorScreenSync() {
  const { scene } = useGLTF("/models/gaming_room.glb");
  const theme = useAppStore((s) => s.theme);
  const wallpapers = useAppStore((s) => s.wallpapers);
  const custom = useAppStore((s) => s.customWallpaper);

  useEffect(() => {
    const wp = resolveWallpaper(theme, wallpapers, custom);
    let cancelled = false;
    new THREE.TextureLoader().load(wp.thumb, (texture) => {
      if (cancelled) return;
      texture.colorSpace = THREE.SRGBColorSpace;
      // These screen UVs are authored upside-down relative to the glTF convention.
      texture.flipY = true;
      if (wp.pixel) {
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        texture.generateMipmaps = false;
      }
      applyEmissive(scene, MONITOR_MATERIAL_NAME, texture, 1.15);
    });
    return () => {
      cancelled = true;
    };
  }, [scene, theme, wallpapers, custom]);

  useEffect(() => {
    new THREE.TextureLoader().load(TV_TEXTURE, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.flipY = true;
      applyEmissive(scene, TV_MATERIAL_NAME, texture, 0.9);
    });
  }, [scene]);

  return null;
}
