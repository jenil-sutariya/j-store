"use client";

import { Suspense, useRef, type RefObject } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";
import { RealDiamondModel } from "./real-diamond-model";
import { ModelErrorBoundary } from "./jewelry-viewer/error-boundary";

const DIAMOND_2_URL = "/models/diamond/diamonds2.glb";
const CAMERA_START_Z = 8;
const CAMERA_END_Z = 4.5;

function PointerGroup({ children }: { children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);
  const pointer = useRef({ x: 0, y: 0 });

  useFrame((state) => {
    pointer.current.x = state.pointer.x;
    pointer.current.y = state.pointer.y;
    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        pointer.current.x * 0.3,
        0.03,
      );
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        -pointer.current.y * 0.15,
        0.03,
      );
    }
  });

  return <group ref={groupRef}>{children}</group>;
}

/**
 * Dollies the camera in as the page scrolls, instead of CSS-scaling a flat
 * image of the scene. Reads `scrollProgressRef` directly in the render loop
 * (no React state), and lerps toward the target every frame on top of the
 * spring-smoothed value already coming from the DOM side — two layers of
 * damping, which is what makes this read as smooth rather than tied 1:1 to
 * scroll position.
 */
function ScrollDolly({ scrollProgressRef }: { scrollProgressRef?: RefObject<number> }) {
  useFrame((state) => {
    const progress = scrollProgressRef?.current ?? 0;
    const targetZ = THREE.MathUtils.lerp(CAMERA_START_Z, CAMERA_END_Z, progress);
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetZ, 0.08);
  });
  return null;
}

function SceneContent({ scrollProgressRef }: { scrollProgressRef?: RefObject<number> }) {
  return (
    <>
      <ScrollDolly scrollProgressRef={scrollProgressRef} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 6, 5]} intensity={2} />
      <directionalLight position={[-6, 2, 3]} intensity={0.9} color="#ffe9c2" />
      <directionalLight position={[0, -4, -4]} intensity={0.5} color="#cfe0ff" />
      <pointLight position={[0, 1, 4]} intensity={1} distance={10} />
      <Environment preset="studio" resolution={128} />

      {/*
        Stable background piece: no Float (doesn't bob/rotate on its own),
        outside PointerGroup (doesn't follow the cursor either), and sat
        further back (negative z) and larger than the other two. As the
        camera dollies in on scroll, this is the one that grows into
        prominence fastest since it's dead-center in frame. Pulled down in Y
        so it sits under the "Explore Collection" link instead of behind the
        headline.
      */}
      <RealDiamondModel url={DIAMOND_2_URL} position={[0, -3.2, -4]} scale={2.4} float={false} />

      <PointerGroup>
        {/*
          Both pushed toward the camera (positive z) and further out to the
          sides, clear of where the big centered headline sits — previously
          one diamond sat at z=-0.4 (behind the other, further from camera)
          which is what made it read as "low visibility": it wasn't behind
          any UI layer, it was behind the scene's own other objects.
        */}
        <RealDiamondModel position={[-2.6, 0.7, 2]} speed={1.2} scale={1.35} />
        <RealDiamondModel position={[2.5, -0.5, 1.5]} speed={1.6} scale={0.95} />
      </PointerGroup>
    </>
  );
}

export function JewelryScene({
  scrollProgressRef,
}: {
  scrollProgressRef?: RefObject<number>;
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, CAMERA_START_Z], fov: 42 }}
      dpr={1}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
    >
      <ModelErrorBoundary fallback={null}>
        <Suspense fallback={null}>
          <SceneContent scrollProgressRef={scrollProgressRef} />
        </Suspense>
      </ModelErrorBoundary>
    </Canvas>
  );
}

if (typeof window !== "undefined") {
  RealDiamondModel.preload();
  RealDiamondModel.preload(DIAMOND_2_URL);
}

export default JewelryScene;
