"use client";

import { Suspense, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, ContactShadows, OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { JewelryModel } from "./model";
import { ModelErrorBoundary } from "./error-boundary";
import type { Gemstone, MetalType } from "@/generated/prisma/enums";

const IDLE_AUTOROTATE_DELAY_MS = 2500;

function Loader() {
  return (
    <mesh>
      <sphereGeometry args={[0.001]} />
      <meshBasicMaterial visible={false} />
    </mesh>
  );
}

function Scene({
  modelUrl,
  metal,
  gemstone,
  controlsRef,
  onModelError,
}: {
  modelUrl: string;
  metal: MetalType;
  gemstone: Gemstone;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  onModelError: () => void;
}) {
  const [autoRotate, setAutoRotate] = useState(true);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleInteractionStart() {
    setAutoRotate(false);
    if (idleTimer.current) clearTimeout(idleTimer.current);
  }

  function handleInteractionEnd() {
    idleTimer.current = setTimeout(() => setAutoRotate(true), IDLE_AUTOROTATE_DELAY_MS);
  }

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 6, 4]} intensity={2} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-4, 2, -3]} intensity={0.5} />
      <Environment preset="studio" />
      {/*
        fallback must stay valid inside the R3F tree (no DOM elements) — the
        actual placeholder UI is rendered outside the Canvas, by ProductVisual,
        once onError flips modelErrored and unmounts the whole viewer.
      */}
      <ModelErrorBoundary fallback={null} onError={onModelError}>
        <Suspense fallback={<Loader />}>
          <JewelryModel url={modelUrl} metal={metal} gemstone={gemstone} />
        </Suspense>
      </ModelErrorBoundary>
      <ContactShadows position={[0, -1.15, 0]} opacity={0.45} blur={2.4} scale={6} far={2} />
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enablePan={false}
        minDistance={2.5}
        maxDistance={6}
        autoRotate={autoRotate}
        autoRotateSpeed={1.2}
        onStart={handleInteractionStart}
        onEnd={handleInteractionEnd}
      />
    </>
  );
}

export function JewelryViewerCanvas({
  modelUrl,
  metal,
  gemstone,
  onModelError,
}: {
  modelUrl: string;
  metal: MetalType;
  gemstone: Gemstone;
  onModelError?: () => void;
}) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  return (
    <div className="relative h-full w-full">
      <Canvas
        shadows
        camera={{ position: [0, 0.4, 4.2], fov: 38 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
      >
        <Scene
          modelUrl={modelUrl}
          metal={metal}
          gemstone={gemstone}
          controlsRef={controlsRef}
          onModelError={onModelError ?? (() => {})}
        />
      </Canvas>
      <button
        type="button"
        onClick={() => controlsRef.current?.reset()}
        className="absolute bottom-3 right-3 rounded-md border bg-background/90 px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur hover:bg-muted"
      >
        Reset view
      </button>
    </div>
  );
}

export default JewelryViewerCanvas;
