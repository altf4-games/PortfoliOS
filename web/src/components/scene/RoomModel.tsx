"use client";

import { useGLTF } from "@react-three/drei";

export default function RoomModel() {
  const { scene } = useGLTF("/models/gaming_room.glb");
  return <primitive object={scene} dispose={null} />;
}

useGLTF.preload("/models/gaming_room.glb");
