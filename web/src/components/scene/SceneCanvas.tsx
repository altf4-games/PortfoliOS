"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import RoomModel from "./RoomModel";
import CameraRig from "./CameraRig";

export default function SceneCanvas() {
  return (
    <Canvas
      className="!absolute inset-0"
      gl={{ antialias: true, powerPreference: "high-performance" }}
      camera={{ fov: 70, near: 0.05, far: 100 }}
      dpr={[1, 1.75]}
    >
      <color attach="background" args={["#050506"]} />

      {/* Room materials are metallic/roughness PBR, so plain ambient light alone left
          metal surfaces (PC case, monitor frames) rendering pure black. A real-time
          HDRI environment map (drei's <Environment>) fixes that but forces a PMREM
          cubemap render pass that crashed WebGL in testing and is heavy on low-end
          phones anyway — the thing this migration exists to avoid — so this uses a
          plain multi-light rig instead: brighter ambient/hemisphere fill plus a few
          directional lights angled to catch metal surfaces from different sides. */}
      <ambientLight intensity={0.55} />
      <hemisphereLight intensity={0.5} groundColor="#1a1a1f" />
      <directionalLight position={[6, 10, 4]} intensity={1.3} color="#fff2e0" />
      <directionalLight position={[-8, 4, -6]} intensity={0.5} color="#7ec8ff" />
      <directionalLight position={[0, 6, -10]} intensity={0.4} color="#ffffff" />

      <Suspense fallback={null}>
        <RoomModel />
      </Suspense>
      <CameraRig />
    </Canvas>
  );
}
