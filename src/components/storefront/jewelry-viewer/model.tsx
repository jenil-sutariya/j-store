"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useGLTF, Center } from "@react-three/drei";
import {
  GEMSTONE_MATERIALS,
  METAL_MATERIALS,
  DEFAULT_METAL_MESH_MATCHES,
  DEFAULT_GEMSTONE_MESH_MATCHES,
} from "@/lib/jewelry-materials";
import type { Gemstone, MetalType } from "@/generated/prisma/enums";

const TARGET_SIZE = 2.4;

function matchesAny(name: string, patterns: string[]) {
  const lower = name.toLowerCase();
  return patterns.some((pattern) => lower.includes(pattern));
}

export function JewelryModel({
  url,
  metal,
  gemstone,
  metalMeshMatches = DEFAULT_METAL_MESH_MATCHES,
  gemstoneMeshMatches = DEFAULT_GEMSTONE_MESH_MATCHES,
}: {
  url: string;
  metal: MetalType;
  gemstone: Gemstone;
  metalMeshMatches?: string[];
  gemstoneMeshMatches?: string[];
}) {
  const { scene } = useGLTF(url);

  // Clone per-instance so material overrides on one viewer never leak into
  // drei's shared GLTF cache (which is reused across every mount of this URL).
  const cloned = useMemo(() => scene.clone(true), [scene]);

  const metalMaterial = useMemo(() => {
    const config = METAL_MATERIALS[metal];
    return new THREE.MeshStandardMaterial({
      color: config.color,
      metalness: config.metalness,
      roughness: config.roughness,
      envMapIntensity: 1.4,
    });
  }, [metal]);

  const gemstoneMaterial = useMemo(() => {
    const config = GEMSTONE_MATERIALS[gemstone];
    return new THREE.MeshPhysicalMaterial({
      color: config.color,
      ior: config.ior,
      transmission: config.transmission,
      roughness: config.roughness,
      thickness: 1.2,
      clearcoat: 1,
      metalness: 0,
    });
  }, [gemstone]);

  useEffect(() => {
    cloned.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      child.castShadow = true;
      child.receiveShadow = true;

      if (matchesAny(child.name, metalMeshMatches)) {
        child.material = metalMaterial;
      } else if (matchesAny(child.name, gemstoneMeshMatches)) {
        child.material = gemstoneMaterial;
      }
    });
  }, [cloned, metalMaterial, gemstoneMaterial, metalMeshMatches, gemstoneMeshMatches]);

  // Normalize scale so any incoming model — whatever units it was authored
  // in — reads at a consistent size in the viewer.
  const scale = useMemo(() => {
    const box = new THREE.Box3().setFromObject(cloned);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDimension = Math.max(size.x, size.y, size.z) || 1;
    return TARGET_SIZE / maxDimension;
  }, [cloned]);

  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    // Deliberately not disposing `child.geometry`: `.clone(true)` only deep-clones
    // the Object3D hierarchy, not the underlying BufferGeometry, so every clone of
    // this URL (including drei's own cached scene) still shares the same geometry
    // instances. Disposing them here would free the GPU buffers for every other
    // mount of this model too. Only the materials we created ourselves are ours
    // to dispose.
    return () => {
      metalMaterial.dispose();
      gemstoneMaterial.dispose();
    };
  }, [cloned, metalMaterial, gemstoneMaterial]);

  return (
    <Center>
      <group ref={groupRef} scale={scale}>
        <primitive object={cloned} />
      </group>
    </Center>
  );
}

JewelryModel.preload = (url: string) => useGLTF.preload(url);
