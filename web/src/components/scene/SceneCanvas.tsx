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
      <ambientLight intensity={0.6} />
      <hemisphereLight intensity={0.5} groundColor="#222" />
      <Suspense fallback={null}>
        <RoomModel />
      </Suspense>
      <CameraRig />
    </Canvas>
  );
}
