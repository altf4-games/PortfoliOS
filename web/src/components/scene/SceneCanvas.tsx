"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import RoomModel from "./RoomModel";
import CameraRig from "./CameraRig";
import MonitorScreenSync from "./MonitorScreenSync";

export default function SceneCanvas() {
  return (
    <Canvas
      className="!absolute inset-0"
      gl={{ antialias: true, powerPreference: "high-performance" }}
      camera={{ fov: 70, near: 0.05, far: 100 }}
      dpr={[1, 1.75]}
      onCreated={({ gl }) => {
        gl.toneMappingExposure = 1.1;
      }}
    >
      <color attach="background" args={["#050507"]} />
      <fogExp2 attach="fog" args={["#050507", 0.045]} />

      {/* Room materials are metallic/roughness PBR, so plain ambient light alone left
          metal surfaces (PC case, monitor frames) rendering pure black. A real-time
          HDRI environment map (drei's <Environment>) fixes that but forces a PMREM
          cubemap render pass that crashed WebGL in testing and is heavy on low-end
          phones anyway — the thing this migration exists to avoid — so this is a plain
          light rig instead, tuned for a moody "gaming den" feel rather than an evenly
          lit showroom: low ambient fill, a warm point light standing in for the desk
          lamp/monitor glow, and a cool rim light for contrast, with fog to keep distant
          unlit corners fading into darkness instead of looking flatly grey. */}
      <ambientLight intensity={0.22} />
      <hemisphereLight intensity={0.18} groundColor="#0d0d12" />
      <pointLight position={[1.5, 2.4, -8.6]} intensity={6} distance={9} decay={2} color="#ffb066" />
      <pointLight position={[-6, 3, -6]} intensity={2.5} distance={12} decay={2} color="#4d7cff" />
      <directionalLight position={[2, 12, 3]} intensity={0.35} color="#cfd8ff" />

      <Suspense fallback={null}>
        <RoomModel />
        <MonitorScreenSync />
      </Suspense>
      <CameraRig />
    </Canvas>
  );
}
