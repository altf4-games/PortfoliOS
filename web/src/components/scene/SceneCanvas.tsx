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
        gl.toneMappingExposure = 1.35;
      }}
    >
      <color attach="background" args={["#0a0a0d"]} />

      {/* Room materials are metallic/roughness PBR, so plain ambient light alone left
          metal surfaces (PC case, monitor frames) rendering pure black. A real-time
          HDRI environment map (drei's <Environment>) fixes that but forces a PMREM
          cubemap render pass that crashed WebGL in testing and is heavy on low-end
          phones anyway — the thing this migration exists to avoid — so this uses a
          plain multi-light rig instead: brighter ambient/hemisphere fill, an overhead
          "room light" key, and a couple of horizontal fills so no side of the room
          reads as pure black regardless of which way the camera is facing. */}
      <ambientLight intensity={0.75} />
      <hemisphereLight intensity={0.6} groundColor="#26262e" />
      <directionalLight position={[2, 12, 3]} intensity={1.4} color="#fff6e8" />
      <directionalLight position={[10, 3, 6]} intensity={0.55} color="#ffe9c7" />
      <directionalLight position={[-10, 4, -8]} intensity={0.55} color="#bcd7ff" />
      <directionalLight position={[0, 2, -10]} intensity={0.4} color="#ffffff" />

      <Suspense fallback={null}>
        <RoomModel />
        <MonitorScreenSync />
      </Suspense>
      <CameraRig />
    </Canvas>
  );
}
