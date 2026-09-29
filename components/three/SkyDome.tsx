"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SKY_GLSL } from "@/lib/skyShader";

/**
 * Procedural dawn sky.
 *
 * Deliberately not a CSS gradient: the cloud deck is fbm noise projected
 * onto a virtual plane, so it has real perspective — clouds compress toward
 * the horizon and stretch overhead, and drift independently of the camera.
 *
 * The colour function itself lives in lib/skyShader so the sea can reflect
 * exactly this sky rather than an approximation of it.
 */

const vertexShader = /* glsl */ `
  varying vec3 vDir;
  void main() {
    vDir = normalize(position);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  varying vec3 vDir;
  uniform float uTime;
  uniform float uMood;

  ${SKY_GLSL}

  void main() {
    vec3 col = bb_skyColor(normalize(vDir), uTime, uMood, 6);

    // Dithering — kills the banding a smooth sky always shows on 8-bit
    // displays, which is otherwise the most visible flaw in a gradient.
    col += (bb_hash(gl_FragCoord.xy) - 0.5) / 255.0;

    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

export function SkyDome({ mood = 0 }: { mood?: number }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uMood: { value: mood } }),
    [], // eslint-disable-line react-hooks/exhaustive-deps -- driven in useFrame
  );

  useFrame((_, delta) => {
    if (!matRef.current) return;
    uniforms.uTime.value += delta;
    uniforms.uMood.value += (mood - uniforms.uMood.value) * Math.min(1, delta * 2);
  });

  return (
    <mesh scale={[-1, 1, 1]} renderOrder={-1000}>
      <sphereGeometry args={[400, 48, 32]} />
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        depthWrite={false}
        side={THREE.FrontSide}
        toneMapped={false}
      />
    </mesh>
  );
}
