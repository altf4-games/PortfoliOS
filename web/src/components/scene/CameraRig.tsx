"use client";
// react-three-fiber mutates the camera inside useFrame every frame instead of using React
// state, for render-loop performance; that conflicts with the React Compiler's
// immutability lint rule.
/* eslint-disable react-hooks/immutability */

import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useAppStore } from "@/store/useAppStore";

// Found by sitting in the live scene and walking the camera to the gaming chair. The desk
// is at yaw ~1.5; the main monitor's center is at yaw 1.59 / pitch -0.105, and FOV 20
// fills the screen with it. TUNE THESE if the room model changes.
export const CAMERA_POSITION = new THREE.Vector3(-5.75, 10.95, -9.15);
const PITCH_LIMIT = THREE.MathUtils.degToRad(80);

interface Pose {
  yaw: number;
  pitch: number;
  fov: number;
}
const OS: Pose = { yaw: 1.59, pitch: -0.105, fov: 20 };
const EXPLORE: Pose = { yaw: 1.5, pitch: 0, fov: 70 };
// Intro: start looking across the room, sweep toward the desk, then push in on the monitor.
const INTRO_START: Pose = { yaw: 3.1, pitch: 0.06, fov: 76 };
const INTRO_MID: Pose = { yaw: 1.8, pitch: -0.03, fov: 56 };
const INTRO_SEG1 = 2.6;
const INTRO_SEG2 = 1.5;

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

export default function CameraRig() {
  const { camera, gl } = useThree();
  const mode = useAppStore((s) => s.mode);
  const phase = useAppStore((s) => s.phase);

  const pose = useRef<Pose>({ ...INTRO_START });
  const tween = useRef<{ from: Pose; to: Pose; start: number; dur: number; ease: (t: number) => number } | null>(null);
  const introStart = useRef(0);
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const userFov = useRef(EXPLORE.fov);

  useEffect(() => {
    camera.position.copy(CAMERA_POSITION);
  }, [camera]);

  // Phase/mode drive where the camera wants to be.
  useEffect(() => {
    if (phase === "loading") {
      pose.current = { ...INTRO_START };
      tween.current = null;
      return;
    }
    if (phase === "intro") {
      introStart.current = performance.now();
      tween.current = null;
      return;
    }
    const target = mode === "explore" && phase === "ready" ? { ...EXPLORE, fov: userFov.current } : OS;
    tween.current = { from: { ...pose.current }, to: target, start: performance.now(), dur: phase === "boot" ? 0.9 : 1.1, ease: easeOut };
  }, [mode, phase]);

  useEffect(() => {
    const canvas = gl.domElement;
    const canControl = () => useAppStore.getState().mode === "explore" && useAppStore.getState().phase === "ready";
    const down = (e: PointerEvent) => {
      if (!canControl()) return;
      dragging.current = true;
      tween.current = null;
      last.current = { x: e.clientX, y: e.clientY };
    };
    const up = () => (dragging.current = false);
    const move = (e: PointerEvent) => {
      if (!dragging.current || !canControl()) return;
      pose.current.yaw -= (e.clientX - last.current.x) * 0.0035;
      pose.current.pitch = THREE.MathUtils.clamp(pose.current.pitch - (e.clientY - last.current.y) * 0.0035, -PITCH_LIMIT, PITCH_LIMIT);
      last.current = { x: e.clientX, y: e.clientY };
    };
    const wheel = (e: WheelEvent) => {
      if (!canControl()) return;
      userFov.current = THREE.MathUtils.clamp(userFov.current + e.deltaY * 0.03, 32, 85);
      tween.current = null;
    };
    const key = (e: KeyboardEvent) => {
      if (!canControl()) return;
      const step = 0.08;
      if (e.key === "ArrowLeft") pose.current.yaw += step;
      else if (e.key === "ArrowRight") pose.current.yaw -= step;
      else if (e.key === "ArrowUp") pose.current.pitch = Math.min(PITCH_LIMIT, pose.current.pitch + step);
      else if (e.key === "ArrowDown") pose.current.pitch = Math.max(-PITCH_LIMIT, pose.current.pitch - step);
      else return;
      tween.current = null;
    };
    canvas.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointermove", move);
    canvas.addEventListener("wheel", wheel, { passive: true });
    window.addEventListener("keydown", key);
    return () => {
      canvas.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointermove", move);
      canvas.removeEventListener("wheel", wheel);
      window.removeEventListener("keydown", key);
    };
  }, [gl]);

  useFrame((state) => {
    const cam = camera as THREE.PerspectiveCamera;
    const { phase: ph, mode: md, setPhase } = useAppStore.getState();
    const now = performance.now();
    const p = pose.current;

    if (ph === "loading") {
      // A slow idle drift behind the loading screen.
      p.yaw = INTRO_START.yaw + Math.sin(state.clock.elapsedTime * 0.2) * 0.05;
    } else if (ph === "intro") {
      const t = (now - introStart.current) / 1000;
      const lerpPose = (a: Pose, b: Pose, k: number) => {
        p.yaw = THREE.MathUtils.lerp(a.yaw, b.yaw, k);
        p.pitch = THREE.MathUtils.lerp(a.pitch, b.pitch, k);
        p.fov = THREE.MathUtils.lerp(a.fov, b.fov, k);
      };
      if (t < INTRO_SEG1) lerpPose(INTRO_START, INTRO_MID, easeInOut(t / INTRO_SEG1));
      else if (t < INTRO_SEG1 + INTRO_SEG2) lerpPose(INTRO_MID, OS, easeInOut((t - INTRO_SEG1) / INTRO_SEG2));
      else {
        lerpPose(INTRO_MID, OS, 1);
        setPhase("boot");
      }
    } else if (tween.current) {
      const tw = tween.current;
      const k = Math.min((now - tw.start) / (tw.dur * 1000), 1);
      const e = tw.ease(k);
      p.yaw = THREE.MathUtils.lerp(tw.from.yaw, tw.to.yaw, e);
      p.pitch = THREE.MathUtils.lerp(tw.from.pitch, tw.to.pitch, e);
      p.fov = THREE.MathUtils.lerp(tw.from.fov, tw.to.fov, e);
      if (k >= 1) tween.current = null;
    } else if (md === "explore" && ph === "ready") {
      p.fov = THREE.MathUtils.lerp(p.fov, userFov.current, 0.12);
    }

    // A whisper of handheld sway in explore so the room never feels frozen.
    const sway = md === "explore" && ph === "ready" && !dragging.current ? Math.sin(state.clock.elapsedTime * 0.6) * 0.004 : 0;
    if (Math.abs(cam.fov - p.fov) > 0.001) {
      cam.fov = p.fov;
      cam.updateProjectionMatrix();
    }
    cam.quaternion.setFromEuler(new THREE.Euler(p.pitch + sway, p.yaw + sway * 0.5, 0, "YXZ"));
  });

  return null;
}
