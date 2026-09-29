"use client";

import { useMemo, useRef, type MutableRefObject } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import {
  PALLET_DECK,
  palletGeometry,
  rackFloor,
  rackInterior,
} from "@/lib/containerGeometry";
import {
  PRODUCTS,
  aspectOf,
  displayWidth,
  textureUrl,
} from "@/lib/products";

/* --- staging ----------------------------------------------------- */

const SPACING = 1.55; // metres between products down the corridor
const PRODUCT_Z = -0.5;
const CAM_Z = 1.15; // just inside the near wall — the container is 2.44 wide
const CAM_Y = -0.5;
const LOOK_Y = -0.72;
const FLOOR_Y = -1.295;
const DECK_Y = FLOOR_Y + 0.02 + PALLET_DECK;
const CORRIDOR = SPACING * (PRODUCTS.length + 4);

/** Soft radial blob, used as a fake contact shadow under each product. */
function contactShadowTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(0,0,0,0.72)");
  g.addColorStop(0.45, "rgba(0,0,0,0.34)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.NoColorSpace;
  return tex;
}

type Props = {
  /** Continuous scroll position, in product indices. Driven outside React
      so dragging doesn't re-render the tree sixty times a second. */
  positionRef: MutableRefObject<number>;
};

export function RackScene({ positionRef }: Props) {
  const { camera } = useThree();

  const textures = useTexture(PRODUCTS.map(textureUrl));
  const cardRefs = useRef<(THREE.Mesh | null)[]>([]);
  const shadowRefs = useRef<(THREE.Mesh | null)[]>([]);
  const spotRef = useRef<THREE.SpotLight>(null);
  const spotTarget = useRef<THREE.Object3D>(null);

  const geometry = useMemo(
    () => ({
      interior: rackInterior(CORRIDOR),
      floor: rackFloor(CORRIDOR),
      pallet: palletGeometry(),
    }),
    [],
  );

  const shadowTex = useMemo(contactShadowTexture, []);

  // Sizes are stable, so compute them once rather than per frame.
  const layout = useMemo(
    () =>
      PRODUCTS.map((p, i) => {
        const w = displayWidth(p);
        const h = w / aspectOf(p);
        return { x: i * SPACING, w, h, y: DECK_Y + h / 2 };
      }),
    [],
  );

  const tint = useMemo(() => new THREE.Color(), []);
  const dim = useMemo(() => new THREE.Color("#46536b"), []);
  const full = useMemo(() => new THREE.Color("#ffffff"), []);

  textures.forEach((t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
  });

  useFrame((_, delta) => {
    const d = Math.min(delta, 0.05);
    const pos = positionRef.current;
    const camX = pos * SPACING;

    camera.position.set(camX, CAM_Y, CAM_Z);
    camera.lookAt(camX, LOOK_Y, PRODUCT_Z);

    // Spotlight rides with the focused product.
    if (spotRef.current && spotTarget.current) {
      spotRef.current.position.set(camX + 0.15, 1.05, 0.55);
      spotTarget.current.position.set(camX, LOOK_Y, PRODUCT_Z);
      spotTarget.current.updateMatrixWorld();
    }

    for (let i = 0; i < layout.length; i++) {
      const mesh = cardRefs.current[i];
      if (!mesh) continue;

      // Focus falls off over roughly one slot either side.
      const offset = Math.abs(i - pos);
      const focus = Math.max(0, 1 - offset * 0.85);

      // Products carry their own studio lighting, so they're drawn unlit and
      // tinted rather than re-lit — relighting a baked photo is what makes
      // composites look pasted on. The tint does the spotlight's job.
      tint.copy(dim).lerp(full, focus * focus);
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.color.lerp(tint, Math.min(1, d * 9));

      const targetScale = 1 + focus * 0.12;
      mesh.scale.x += (targetScale - mesh.scale.x) * Math.min(1, d * 8);
      mesh.scale.y = mesh.scale.x;

      // A hair of turn toward the camera as a product takes focus.
      const targetRot = (i - pos) * -0.12;
      mesh.rotation.y += (targetRot - mesh.rotation.y) * Math.min(1, d * 8);

      const sh = shadowRefs.current[i];
      if (sh) {
        const sm = sh.material as THREE.MeshBasicMaterial;
        sm.opacity += (0.35 + focus * 0.4 - sm.opacity) * Math.min(1, d * 9);
      }
    }
  });

  return (
    <>
      {/* Fog closes the corridor into darkness at both ends, so the rack
          reads as endless without needing geometry that actually is. */}
      <fog attach="fog" args={["#090c11", 2.4, 11]} />
      <color attach="background" args={["#090c11"]} />

      <ambientLight intensity={0.5} color="#7d90b4" />

      {/* Warm work light over whatever is in focus. */}
      <spotLight
        ref={spotRef}
        angle={0.75}
        penumbra={0.9}
        intensity={26}
        distance={7}
        decay={1.7}
        color="#ffd9ab"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0008}
      />
      <object3D ref={spotTarget} />

      {/* Cold daylight leaking in from the open doors far down the corridor. */}
      <pointLight
        position={[CORRIDOR / 2 - 1, 0.2, 0]}
        intensity={22}
        distance={9}
        decay={1.9}
        color="#a8c8ff"
      />

      <mesh geometry={geometry.interior} receiveShadow>
        <meshStandardMaterial color="#5d646e" roughness={0.85} metalness={0.18} />
      </mesh>

      <mesh geometry={geometry.floor} receiveShadow>
        <meshStandardMaterial color="#7a6647" roughness={0.94} metalness={0.05} />
      </mesh>

      {PRODUCTS.map((product, i) => (
        <group key={product.id} position={[layout[i].x, 0, PRODUCT_Z]}>
          <mesh
            geometry={geometry.pallet}
            position={[0, FLOOR_Y + 0.02, 0]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color="#9c7f52" roughness={0.92} metalness={0} />
          </mesh>

          {/* Contact shadow, laid just above the pallet deck. */}
          <mesh
            ref={(el) => {
              shadowRefs.current[i] = el;
            }}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, DECK_Y + 0.004, 0]}
          >
            <planeGeometry args={[layout[i].w * 1.15, layout[i].w * 0.7]} />
            <meshBasicMaterial
              map={shadowTex}
              transparent
              opacity={0.4}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>

          <mesh
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            position={[0, layout[i].y, 0.02]}
          >
            <planeGeometry args={[layout[i].w, layout[i].h]} />
            <meshBasicMaterial
              map={textures[i]}
              transparent
              alphaTest={0.02}
              toneMapped={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      ))}
    </>
  );
}
