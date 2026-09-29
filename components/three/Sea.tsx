"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { SKY_GLSL } from "@/lib/skyShader";

/**
 * Open sea beneath the stack.
 *
 * Reflections are done against the sky function rather than with a planar
 * reflection pass. A true mirror means re-rendering the whole scene into a
 * second target every frame — roughly double the cost, and this site's
 * audience is largely on mid-range Android. Sampling the shared sky shader
 * along the reflected ray costs a few instructions and, for open water with
 * nothing tall nearby, is nearly indistinguishable.
 *
 * Because it reflects the *same* function the dome draws, the water picks up
 * the real clouds, the real sun, and stays in step when the mood grades.
 */

const SEA_Y = -6.6;
const SIZE = 700;
const SEGMENTS = 128;

const vertexShader = /* glsl */ `
  uniform float uTime;
  varying vec3 vWorld;

  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);

    // Three crossed swells at different headings. Real sea is never a
    // single wave train, and the interference is what stops it reading
    // as corrugated iron.
    float t = uTime;
    world.y += sin(world.x * 0.12 + t * 0.55) * 0.14;
    world.y += sin(world.z * 0.17 - t * 0.42) * 0.10;
    world.y += sin((world.x + world.z) * 0.09 + t * 0.31) * 0.08;

    vWorld = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform float uMood;
  varying vec3 vWorld;

  ${SKY_GLSL}

  /** Surface normal from finite differences of a scrolling fbm height field. */
  vec3 waterNormal(vec2 p, float t) {
    vec2 drift = vec2(t * 0.05, t * 0.032);
    float e = 0.4;
    float h0 = bb_fbm(p * 0.22 + drift, 4);
    float hx = bb_fbm((p + vec2(e, 0.0)) * 0.22 + drift, 4);
    float hz = bb_fbm((p + vec2(0.0, e)) * 0.22 + drift, 4);
    return normalize(vec3((h0 - hx) * 1.6, 1.0, (h0 - hz) * 1.6));
  }

  void main() {
    vec3 toEye = cameraPosition - vWorld;
    float dist = length(toEye);
    vec3 V = toEye / dist;

    // Chop has to fade out with distance or it aliases into shimmering
    // noise — the single ugliest artefact in procedural water.
    float detail = 1.0 - smoothstep(28.0, 240.0, dist);
    vec3 N = normalize(mix(vec3(0.0, 1.0, 0.0), waterNormal(vWorld.xz, uTime), detail));

    vec3 R = reflect(-V, N);
    R.y = abs(R.y); // a perturbed normal at a grazing angle can dip below

    vec3 refl = bb_skyColor(R, uTime, uMood, 3);

    // Schlick: water is almost a mirror at grazing angles, barely
    // reflective looking straight down.
    float f = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 5.0);
    f = mix(0.03, 1.0, f);

    vec3 deep = mix(vec3(0.010, 0.040, 0.080), vec3(0.020, 0.070, 0.120), uMood * 0.4);
    vec3 col = mix(deep, refl, f);

    // Specular glint off the sun, only where there's chop to catch it.
    vec3 sunDir = bb_sunDirection(uMood);
    col += vec3(1.0, 0.88, 0.66) * pow(max(dot(R, sunDir), 0.0), 380.0) * 2.2 * detail;

    // Dissolve the far edge of the plane into the sky, so the geometry's
    // boundary is never visible and the horizon line comes for free.
    vec3 viewDir = normalize(vWorld - cameraPosition);
    vec3 horizonDir = normalize(vec3(viewDir.x, 0.015, viewDir.z));
    col = mix(col, bb_skyColor(horizonDir, uTime, uMood, 3),
              smoothstep(120.0, 330.0, dist));

    col += (bb_hash(gl_FragCoord.xy) - 0.5) / 255.0;

    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;

export function Sea({ mood = 0 }: { mood?: number }) {
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
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, SEA_Y, 0]}>
      <planeGeometry args={[SIZE, SIZE, SEGMENTS, SEGMENTS]} />
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        toneMapped={false}
      />
    </mesh>
  );
}
