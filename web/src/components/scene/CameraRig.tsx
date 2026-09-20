"use client";
// react-three-fiber intentionally mutates scene-graph objects (camera, meshes) inside
// useFrame every frame instead of using React state, for render-loop performance.
// That's incompatible with the React Compiler's purity/immutability lint rules below.
/* eslint-disable react-hooks/immutability */

import { useRef, useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useAppStore } from "@/store/useAppStore";

// The original Unity scene positioned the camera by hand relative to a prefab whose
// root transform isn't cleanly recoverable from the scene file, so instead of guessing
// world-space numbers we auto-fit a sensible vantage point from the model's own geometry
// at runtime, then this yaw/pitch was found by manually looking around from that point
// until the gaming desk (monitors, PC, hex wall decor) was framed well. TUNE THESE if the
// framing lands awkwardly after any future changes to the room model:
const EYE_HEIGHT_ABOVE_FLOOR = 1.6;
const EXPLORE_YAW = THREE.MathUtils.degToRad(119);
const EXPLORE_PITCH = THREE.MathUtils.degToRad(12);
const OS_YAW = THREE.MathUtils.degToRad(134);
const OS_PITCH = THREE.MathUtils.degToRad(8);
const PITCH_LIMIT = THREE.MathUtils.degToRad(80);

const OS_FOV = 27;
const EXPLORE_FOV = 70;
const TWEEN_DURATION = 1; // seconds, matches Unity's tweenDuration

export default function CameraRig() {
  const { camera, gl } = useThree();
  const mode = useAppStore((s) => s.mode);
  const { scene } = useGLTF("/models/gaming_room.glb");

  const cameraPosition = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    return new THREE.Vector3(center.x, box.min.y + EYE_HEIGHT_ABOVE_FLOOR, center.z);
  }, [scene]);

  const yaw = useRef(EXPLORE_YAW);
  const pitch = useRef(EXPLORE_PITCH);
  const dragging = useRef(false);
  const lastPointer = useRef({ x: 0, y: 0 });

  const tweenStart = useRef(0);
  const tweenFrom = useRef({ yaw: EXPLORE_YAW, pitch: EXPLORE_PITCH, fov: EXPLORE_FOV });
  const tweenTo = useRef({ yaw: OS_YAW, pitch: OS_PITCH, fov: OS_FOV });
  const tweening = useRef(false);

  useEffect(() => {
    camera.position.copy(cameraPosition);
  }, [camera, cameraPosition]);

  useEffect(() => {
    tweenFrom.current = { yaw: yaw.current, pitch: pitch.current, fov: (camera as THREE.PerspectiveCamera).fov };
    tweenTo.current =
      mode === "os"
        ? { yaw: OS_YAW, pitch: OS_PITCH, fov: OS_FOV }
        : { yaw: EXPLORE_YAW, pitch: EXPLORE_PITCH, fov: EXPLORE_FOV };
    tweenStart.current = performance.now();
    tweening.current = true;
  }, [mode, camera]);

  useEffect(() => {
    const canvas = gl.domElement;

    const onPointerDown = (e: PointerEvent) => {
      if (mode !== "explore") return;
      dragging.current = true;
      lastPointer.current = { x: e.clientX, y: e.clientY };
    };
    const onPointerUp = () => {
      dragging.current = false;
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging.current || mode !== "explore") return;
      const dx = e.clientX - lastPointer.current.x;
      const dy = e.clientY - lastPointer.current.y;
      lastPointer.current = { x: e.clientX, y: e.clientY };

      yaw.current -= dx * 0.0035;
      pitch.current = THREE.MathUtils.clamp(pitch.current - dy * 0.0035, -PITCH_LIMIT, PITCH_LIMIT);
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointermove", onPointerMove);
    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, [gl, mode]);

  useFrame(() => {
    const cam = camera as THREE.PerspectiveCamera;

    if (tweening.current) {
      const t = Math.min((performance.now() - tweenStart.current) / (TWEEN_DURATION * 1000), 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic, close to Unity's EaseInOut curve

      yaw.current = THREE.MathUtils.lerp(tweenFrom.current.yaw, tweenTo.current.yaw, eased);
      pitch.current = THREE.MathUtils.lerp(tweenFrom.current.pitch, tweenTo.current.pitch, eased);
      cam.fov = THREE.MathUtils.lerp(tweenFrom.current.fov, tweenTo.current.fov, eased);
      cam.updateProjectionMatrix();

      if (t >= 1) tweening.current = false;
    }

    cam.quaternion.setFromEuler(new THREE.Euler(pitch.current, yaw.current, 0, "YXZ"));
  });

  return null;
}
