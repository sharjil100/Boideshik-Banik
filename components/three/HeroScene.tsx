"use client";

import { useCallback, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";
import { CATEGORIES, CONTAINER_DIMS } from "@/lib/catalogue";
import { Container } from "./Container";
import { Sea } from "./Sea";
import { SkyDome } from "./SkyDome";
import { Wordmark } from "./Wordmark";

const { height: CH } = CONTAINER_DIMS;

/**
 * Stack layout — three across the bottom, two bridging the gaps above,
 * echoing the arrangement in the logo. The group is yawed so we read a
 * three-quarter view: long side plus one door end.
 */
const BOTTOM_Y = -3.35;
const TOP_Y = BOTTOM_Y + CH + 0.06; // 6mm of air, as a real stack sits

const LAYOUT: [number, number, number][] = [
  [-6.25, BOTTOM_Y, 0],
  [0, BOTTOM_Y, 0],
  [6.25, BOTTOM_Y, 0],
  [-3.12, TOP_Y, 0],
  [3.12, TOP_Y, 0],
];

/**
 * Per-container misalignment, in radians, plus a small lateral nudge.
 *
 * Hand-tuned rather than random so the composition is stable between loads.
 * A crane driver lands a box within a few centimetres and a degree or two,
 * never dead square — and a perfectly aligned stack is one of the louder
 * tells that a scene was generated. The top row sits skewed slightly more,
 * as boxes stacked on boxes do.
 */
const TILT: [number, number, number][] = [
  [0.004, -0.010, -0.005],
  [-0.003, 0.006, 0.004],
  [0.005, 0.013, -0.007],
  [-0.006, -0.017, 0.009],
  [0.007, 0.011, -0.010],
];

const NUDGE: [number, number][] = [
  [0.02, -0.03],
  [-0.03, 0.02],
  [0.04, 0.03],
  [-0.02, -0.04],
  [0.03, 0.02],
];

type Props = {
  wordmarkText: string;
  wordmarkFont: string;
  wordmarkTracking: number;
  hovered: number | null;
  onHover: (index: number | null) => void;
  onSelect: (index: number) => void;
  /** 0 dawn → 1 midday → 2 dusk. */
  mood?: number;
};

export function HeroScene({
  wordmarkText,
  wordmarkFont,
  wordmarkTracking,
  hovered,
  onHover,
  onSelect,
  mood = 0,
}: Props) {
  const { camera } = useThree();

  const pointer = useRef({ x: 0, y: 0 });
  const shake = useRef(0);
  const clock = useRef(0);

  const basePos = useMemo(() => new THREE.Vector3(0, 0.4, 18), []);
  const lookTarget = useMemo(() => new THREE.Vector3(0, -0.4, 0), []);
  const scratch = useMemo(() => new THREE.Vector3(), []);

  // Each landing kicks the camera. The kick is additive so the two
  // containers that land close together compound, as they would.
  const handleLand = useCallback(() => {
    shake.current = Math.min(shake.current + 0.34, 0.7);
  }, []);

  useFrame((state, delta) => {
    const d = Math.min(delta, 0.05);
    clock.current += d;

    // Normalised pointer, eased. state.pointer is already -1..1.
    pointer.current.x += (state.pointer.x - pointer.current.x) * Math.min(1, d * 3.2);
    pointer.current.y += (state.pointer.y - pointer.current.y) * Math.min(1, d * 3.2);

    // Idle drift keeps the frame alive when the pointer is still — without
    // it the hero looks frozen the moment you stop moving the mouse.
    const driftX = Math.sin(clock.current * 0.21) * 0.35;
    const driftY = Math.cos(clock.current * 0.17) * 0.22;

    // Moving the camera (rather than sliding layers) is what makes the
    // parallax genuine: the containers actually rotate against the sky.
    scratch.set(
      basePos.x + pointer.current.x * 2.1 + driftX,
      basePos.y - pointer.current.y * 1.15 + driftY,
      basePos.z,
    );

    if (shake.current > 0.001) {
      shake.current *= Math.exp(-d * 7.5);
      const s = shake.current;
      scratch.x += (Math.random() - 0.5) * s;
      scratch.y += (Math.random() - 0.5) * s * 1.35;
    }

    camera.position.copy(scratch);
    camera.lookAt(lookTarget);
    // Slight counter-roll — the camera banks into the movement.
    camera.rotation.z = -pointer.current.x * 0.012;
  });

  return (
    <>
      <SkyDome mood={mood} />
      <Sea mood={mood} />

      {/* Painted steel needs something to reflect. Without an environment
          map the specular term has nothing to sample and the panels render
          flat and dead — the single biggest tell that a render is CG.
          Built from Lightformers rather than an HDRI so it ships with no
          asset and no network request. */}
      <Environment resolution={128} frames={1}>
        <color attach="background" args={["#0a1526"]} />
        {/* Warm sun card, camera left — the dominant highlight. */}
        <Lightformer
          form="rect"
          intensity={4}
          color="#ffd7a3"
          position={[-6, 4, 5]}
          scale={[10, 10, 1]}
          target={[0, 0, 0]}
        />
        {/* Cool sky card behind, for the rim along the top rails. */}
        <Lightformer
          form="rect"
          intensity={1.6}
          color="#9cc2ff"
          position={[6, 3, -7]}
          scale={[12, 12, 1]}
          target={[0, 0, 0]}
        />
        {/* Dim ground bounce, so undersides aren't pure black. */}
        <Lightformer
          form="rect"
          intensity={0.5}
          color="#40506b"
          position={[0, -6, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[20, 20, 1]}
        />
      </Environment>

      {/* Dawn key, low and warm, from camera left. The shadow frustum has to
          be sized to the stack by hand — the default is far too small and
          silently drops every shadow. */}
      <directionalLight
        position={[-9, 11, 8]}
        intensity={2.4}
        color="#ffd7a3"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-camera-near={0.5}
        shadow-camera-far={60}
        shadow-bias={-0.0006}
        shadow-normalBias={0.02}
      />
      {/* Cool rim from behind picks the container edges off the sky. */}
      <directionalLight position={[7, 4, -10]} intensity={1.15} color="#8fb8ff" />
      {/* Sky/ground bounce. */}
      <hemisphereLight args={["#7ea2d4", "#2d2418", 0.55]} />

      <group position={[0, 1.45, -5]}>
        <Wordmark
          text={wordmarkText}
          fontFamily={wordmarkFont}
          tracking={wordmarkTracking}
          width={17.5}
          color="#f6f3ec"
        />
      </group>

      <group rotation={[0, -0.3, 0]} position={[0, 0, 0.5]}>
        {CATEGORIES.map((cat, i) => (
          <Container
            key={cat.id}
            color={cat.color}
            code={cat.code}
            seed={i * 9173 + 41}
            position={[
              LAYOUT[i][0] + NUDGE[i][0],
              LAYOUT[i][1],
              LAYOUT[i][2] + NUDGE[i][1],
            ]}
            rotation={TILT[i]}
            dropDelay={0.35 + i * 0.22}
            hovered={hovered === i}
            onHover={(h) => onHover(h ? i : null)}
            onSelect={() => onSelect(i)}
            onLand={handleLand}
          />
        ))}
      </group>
    </>
  );
}
