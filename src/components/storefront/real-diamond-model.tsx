"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useGLTF, Center, Float } from "@react-three/drei";

const DEFAULT_MODEL_URL = "/models/diamond/diamonds.glb";
const TARGET_SIZE = 1.3;

export function RealDiamondModel({
  url = DEFAULT_MODEL_URL,
  position,
  speed = 1.5,
  scale: scaleMultiplier = 1,
  float = true,
}: {
  url?: string;
  position: [number, number, number];
  speed?: number;
  scale?: number;
  /** Set false for a static background piece that doesn't bob/rotate on its own. */
  float?: boolean;
}) {
  const { scene } = useGLTF(url);
  const cloned = useMemo(() => scene.clone(true), [scene]);

  // The instance-owned materials this component created (via .clone()) —
  // tracked so we fade only these in, and only dispose these on unmount.
  const ownMaterials = useRef<THREE.Material[]>([]);

  useEffect(() => {
    const owned: THREE.Material[] = [];

    cloned.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;

      // Keep the model's own authored material (color, roughness, textures —
      // whatever was baked into the GLB) instead of replacing it with a flat
      // custom one. A previous version here forced every mesh to one uniform
      // MeshPhysicalMaterial, which is what washed the color out — the
      // original material already looks right, we were just discarding it.
      //
      // Still clone it per-instance: materials from useGLTF's cache are
      // shared across every mount of this URL, so mutating opacity on the
      // shared original for a fade-in would bleed into every other instance
      // (and, disposing it on unmount would break them — the same class of
      // bug as the geometry-disposal issue elsewhere in this file).
      const material = Array.isArray(child.material) ? child.material[0] : child.material;
      if (!material) return;

      const instanceMaterial = material.clone();
      instanceMaterial.transparent = true;
      instanceMaterial.opacity = 0;
      if ("flatShading" in instanceMaterial) {
        (instanceMaterial as THREE.MeshStandardMaterial).flatShading = true;
        instanceMaterial.needsUpdate = true;
      }

      child.material = instanceMaterial;
      owned.push(instanceMaterial);
    });

    ownMaterials.current = owned;

    return () => {
      owned.forEach((material) => material.dispose());
    };
  }, [cloned]);

  const scale = useMemo(() => {
    const box = new THREE.Box3().setFromObject(cloned);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDimension = Math.max(size.x, size.y, size.z) || 1;
    return (TARGET_SIZE / maxDimension) * scaleMultiplier;
  }, [cloned, scaleMultiplier]);

  // Fade in over ~0.7s instead of popping in the instant the model finishes
  // loading — the abrupt pop is part of what read as "not smooth".
  const fadeStart = useRef<number | null>(null);
  useFrame((state) => {
    if (fadeStart.current === null) fadeStart.current = state.clock.elapsedTime;
    const elapsed = state.clock.elapsedTime - fadeStart.current;
    const opacity = Math.min(1, elapsed / 0.7);
    ownMaterials.current.forEach((material) => {
      material.opacity = opacity;
    });
  });

  const content = (
    <group position={position}>
      <Center>
        <primitive object={cloned} scale={scale} />
      </Center>
    </group>
  );

  if (!float) return content;

  return (
    <Float speed={speed} rotationIntensity={1.2} floatIntensity={1.5}>
      {content}
    </Float>
  );
}

RealDiamondModel.preload = (url: string = DEFAULT_MODEL_URL) => useGLTF.preload(url);
