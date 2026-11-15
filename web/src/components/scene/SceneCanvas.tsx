"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PerformanceMonitor, Sparkles } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { useAppStore, type ThemeId } from "@/store/useAppStore";
import RoomModel from "./RoomModel";
import CameraRig, { CAMERA_POSITION } from "./CameraRig";
import MonitorScreenSync from "./MonitorScreenSync";
import Hotspots from "./Hotspots";

// Each desktop tints the room: warm Golden Gate dusk, a cozy CRT-era glow, or riced
// neon for Hyprland (with a slow RGB cycle on the accent light).
const LIGHTS: Record<ThemeId, { key: string; rim: string; fog: string; keyI: number; rimI: number }> = {
  golden: { key: "#ffb066", rim: "#4d7cff", fog: "#07060a", keyI: 6.5, rimI: 2.6 },
  retro: { key: "#ffe2a8", rim: "#3fd0c9", fog: "#06080a", keyI: 6, rimI: 2.2 },
  hypr: { key: "#cba6f7", rim: "#89dceb", fog: "#05050c", keyI: 5.5, rimI: 3.4 },
};

function ThemeLights() {
  const theme = useAppStore((s) => s.theme);
  const key = useRef<THREE.PointLight>(null);
  const rim = useRef<THREE.PointLight>(null);
  const target = LIGHTS[theme];
  const keyColor = useRef(new THREE.Color(target.key));
  const rimColor = useRef(new THREE.Color(target.rim));

  useFrame((state, dt) => {
    const k = 1 - Math.pow(0.02, dt); // frame-rate independent ease
    if (theme === "hypr") rimColor.current.setHSL((state.clock.elapsedTime * 0.05) % 1, 0.7, 0.62);
    else rimColor.current.lerp(new THREE.Color(target.rim), k);
    keyColor.current.lerp(new THREE.Color(target.key), k);
    if (key.current) {
      key.current.color.copy(keyColor.current);
      key.current.intensity = THREE.MathUtils.lerp(key.current.intensity, target.keyI + Math.sin(state.clock.elapsedTime * 1.7) * 0.15, k);
    }
    if (rim.current) {
      rim.current.color.copy(rimColor.current);
      rim.current.intensity = THREE.MathUtils.lerp(rim.current.intensity, target.rimI, k);
    }
    state.scene.fog?.color.lerp(new THREE.Color(target.fog), k);
  });

  return (
    <>
      <ambientLight intensity={0.2} />
      <hemisphereLight intensity={0.16} groundColor="#0d0d12" />
      <pointLight ref={key} position={[1.5, 2.4, -8.6]} intensity={target.keyI} distance={9} decay={2} color={target.key} />
      <pointLight ref={rim} position={[-6, 3, -6]} intensity={target.rimI} distance={12} decay={2} color={target.rim} />
      <directionalLight position={[2, 12, 3]} intensity={0.35} color="#cfd8ff" />
      {/* Desk lamp above the monitors, and a dim fill so the rest of the room reads. */}
      <pointLight position={[-7.6, 12.6, -9.3]} intensity={3.2} distance={6} decay={2} color="#ffd2a1" />
      <pointLight position={[-5.2, 13.2, -8.4]} intensity={2.2} distance={14} decay={2} color="#9fb4ff" />
    </>
  );
}

export default function SceneCanvas() {
  const mode = useAppStore((s) => s.mode);
  const phase = useAppStore((s) => s.phase);
  const theme = useAppStore((s) => s.theme);
  const [fx, setFx] = useState(true);
  const [dpr, setDpr] = useState(1.5);

  // Once the desktop fully covers the room, stop rendering it entirely: no point burning
  // GPU on frames nobody can see. The delay lets the zoom-in finish under the fade.
  const covered = (phase === "ready" || phase === "boot") && mode === "os";
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (!covered) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPaused(false);
      return;
    }
    const t = setTimeout(() => setPaused(true), 1400);
    return () => clearTimeout(t);
  }, [covered]);

  return (
    <Canvas
      className="!absolute inset-0"
      frameloop={paused ? "never" : "always"}
      gl={{ antialias: false, powerPreference: "high-performance", stencil: false }}
      camera={{ fov: 78, near: 0.05, far: 100, position: CAMERA_POSITION.toArray() }}
      dpr={dpr}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.15;
      }}
    >
      <PerformanceMonitor
        onDecline={() => {
          setFx(false);
          setDpr(1);
        }}
        onIncline={() => setDpr(1.75)}
        flipflops={3}
        onFallback={() => setFx(false)}
      />
      <color attach="background" args={[LIGHTS[theme].fog]} />
      <fogExp2 attach="fog" args={[LIGHTS[theme].fog, 0.042]} />
      <ThemeLights />

      <Suspense fallback={null}>
        <RoomModel />
        <MonitorScreenSync />
        <Hotspots />
      </Suspense>
      {/* Dust drifting through the lamp light. */}
      <Sparkles count={70} scale={[4, 2.5, 4]} position={[CAMERA_POSITION.x - 1.4, CAMERA_POSITION.y + 0.3, CAMERA_POSITION.z]} size={1.2} speed={0.2} opacity={0.35} color="#ffe2c0" />
      <CameraRig />

      {fx && (
        <EffectComposer multisampling={4}>
          <Bloom mipmapBlur intensity={0.45} luminanceThreshold={0.75} luminanceSmoothing={0.2} />
          <Vignette offset={0.28} darkness={0.62} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
