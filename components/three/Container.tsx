"use client";

import { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  doorPanel,
  endPanel,
  floorGeometry,
  frameGeometry,
  roofPanel,
  sidePanels,
} from "@/lib/containerGeometry";
import {
  doorTextures,
  endTextures,
  roofTextures,
  sideTextures,
  weatheredPaint,
} from "@/lib/containerTextures";

/**
 * Geometry and the two shared materials are identical across the fleet, so
 * they're built once and reused — only the paint differs per container.
 *
 * Built lazily rather than at module scope: this file is a client module,
 * but Next still evaluates it on the server during SSR, and doing real
 * geometry work there is both wasted and a source of bundling failures.
 * The component itself never runs on the server, since r3f's Canvas
 * renders nothing until it mounts.
 */
type SharedGeometry = {
  sides: THREE.BufferGeometry;
  end: THREE.BufferGeometry;
  door: THREE.BufferGeometry;
  roof: THREE.BufferGeometry;
  floor: THREE.BufferGeometry;
  frame: THREE.BufferGeometry;
};

let geometryCache: SharedGeometry | null = null;

function sharedGeometry(): SharedGeometry {
  if (!geometryCache) {
    geometryCache = {
      sides: sidePanels(),
      end: endPanel(),
      door: doorPanel(),
      roof: roofPanel(),
      floor: floorGeometry(),
      frame: frameGeometry(),
    };
  }
  return geometryCache;
}

let sharedMaterialCache: {
  frame: THREE.MeshStandardMaterial;
  floor: THREE.MeshStandardMaterial;
} | null = null;

function sharedMaterials() {
  if (!sharedMaterialCache) {
    sharedMaterialCache = {
      // Frame steel: darker, rougher and far more metallic than painted skin.
      frame: new THREE.MeshStandardMaterial({
        color: "#23272d",
        roughness: 0.62,
        metalness: 0.72,
      }),
      floor: new THREE.MeshStandardMaterial({
        color: "#171a1e",
        roughness: 0.9,
        metalness: 0.1,
      }),
    };
  }
  return sharedMaterialCache;
}

export type ContainerProps = {
  color: string;
  code: string;
  seed: number;
  position: [number, number, number];
  /** Resting orientation. Small non-zero pitch/roll is what stops a stack
      looking like it was placed by a script rather than by a crane driver. */
  rotation?: [number, number, number];
  dropDelay?: number;
  hovered?: boolean;
  onHover?: (hovering: boolean) => void;
  onSelect?: () => void;
  onLand?: () => void;
};

export function Container({
  color,
  code,
  seed,
  position,
  rotation = [0, 0, 0],
  dropDelay = 0,
  hovered = false,
  onHover,
  onSelect,
  onLand,
}: ContainerProps) {
  const group = useRef<THREE.Group>(null);
  const elapsed = useRef(0);
  const landed = useRef(false);

  // Canvas textures need the DOM, so they're built after mount rather than
  // during render — this component is inside a Canvas and never renders on
  // the server, but an effect makes that guarantee explicit.
  const [materials, setMaterials] = useState<THREE.MeshStandardMaterial[] | null>(
    null,
  );

  useEffect(() => {
    const paint = weatheredPaint(color);

    // roughness stays at 1 so the map drives it entirely; metalness is low
    // because a container's skin is painted steel — a dielectric.
    const skin = (t: { map: THREE.Texture; roughnessMap: THREE.Texture }) =>
      new THREE.MeshStandardMaterial({
        map: t.map,
        roughnessMap: t.roughnessMap,
        roughness: 1,
        metalness: 0.12,
        envMapIntensity: 0.85,
      });

    const made = [
      skin(sideTextures(paint, code, seed)),
      skin(endTextures(paint, seed)),
      skin(doorTextures(paint, seed)),
      skin(roofTextures(paint, seed)),
    ];
    setMaterials(made);

    return () => {
      made.forEach((m) => {
        m.map?.dispose();
        m.roughnessMap?.dispose();
        m.dispose();
      });
    };
  }, [color, code, seed]);

  const DROP_HEIGHT = 22;
  const FALL_TIME = 0.95;

  useFrame((_, delta) => {
    if (!group.current) return;
    const d = Math.min(delta, 0.05);
    elapsed.current += d;

    const t = (elapsed.current - dropDelay) / FALL_TIME;

    if (t < 0) {
      group.current.position.y = position[1] + DROP_HEIGHT;
      group.current.visible = false;
      return;
    }
    group.current.visible = true;

    if (t < 1) {
      // Quadratic fall = constant gravity. An ease-out here would read as a
      // balloon settling rather than nine tonnes of steel.
      group.current.position.y = position[1] + DROP_HEIGHT * (1 - t * t);
      group.current.scale.setScalar(1);
    } else {
      if (!landed.current) {
        landed.current = true;
        onLand?.();
      }
      const s = t - 1;
      const decay = Math.exp(-s * 9);
      const osc = Math.sin(s * 34) * decay;
      group.current.position.y = position[1] + osc * 0.055;
      group.current.scale.set(1 + osc * 0.012, 1 - osc * 0.022, 1 + osc * 0.012);
    }

    const targetZ = position[2] + (hovered ? 0.55 : 0);
    const targetX = position[0] + (hovered ? 0.12 : 0);
    const k = Math.min(1, d * 7);
    group.current.position.z += (targetZ - group.current.position.z) * k;
    group.current.position.x += (targetX - group.current.position.x) * k;
  });

  if (!materials) return null;
  const [sideMat, endMat, doorMat, roofMat] = materials;
  const GEO = sharedGeometry();
  const shared = sharedMaterials();

  return (
    <group
      ref={group}
      position={[position[0], position[1] + DROP_HEIGHT, position[2]]}
      rotation={rotation}
      visible={false}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover?.(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onHover?.(false);
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.();
      }}
    >
      <mesh geometry={GEO.sides} material={sideMat} castShadow receiveShadow />
      <mesh geometry={GEO.end} material={endMat} castShadow receiveShadow />
      <mesh geometry={GEO.door} material={doorMat} castShadow receiveShadow />
      <mesh geometry={GEO.roof} material={roofMat} castShadow receiveShadow />
      <mesh geometry={GEO.floor} material={shared.floor} castShadow receiveShadow />
      <mesh geometry={GEO.frame} material={shared.frame} castShadow receiveShadow />
    </group>
  );
}
