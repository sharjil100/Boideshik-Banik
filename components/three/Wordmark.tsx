"use client";

import { useEffect, useState } from "react";
import * as THREE from "three";

/**
 * The company name, rendered as a texture.
 *
 * Why not drei's <Text>? It shapes glyphs itself, and Bangla needs real
 * complex-script shaping — বৈদেশিক has a pre-base vowel sign and বণিক a
 * conjunct, both of which come out broken. Painting into a 2D canvas hands
 * shaping to the browser's own text engine, which gets it right, and keeps
 * the wordmark inside the same WebGL context as the sky and containers so
 * the depth sorting is real rather than faked with CSS z-index.
 *
 * The accessible/indexable copy lives in a visually-hidden <h1> in the DOM.
 */

type Props = {
  text: string;
  fontFamily: string;
  /** World-space width of the plane. */
  width: number;
  position?: [number, number, number];
  color?: string;
  weight?: number;
  /** Extra tracking, in ems. Bangla wants less than the Latin setting. */
  tracking?: number;
};

const CANVAS_W = 4096;
const CANVAS_H = 1024;

export function Wordmark({
  text,
  fontFamily,
  width,
  position = [0, 0, 0],
  color = "#f4f1ea",
  weight = 700,
  tracking = 0,
}: Props) {
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);

  useEffect(() => {
    let cancelled = false;
    let made: THREE.CanvasTexture | null = null;

    // The webfont must be resident before measuring, or the first paint is
    // laid out with the fallback metrics and never corrects itself.
    document.fonts.ready.then(() => {
      if (cancelled) return;

      const canvas = document.createElement("canvas");
      canvas.width = CANVAS_W;
      canvas.height = CANVAS_H;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.letterSpacing = `${tracking}em`;
      ctx.textAlign = "center";
      ctx.textBaseline = "alphabetic";

      // Fit to width: measure once at a reference size, then scale.
      const REF = 400;
      ctx.font = `${weight} ${REF}px ${fontFamily}`;
      const refWidth = ctx.measureText(text).width;
      const target = CANVAS_W * 0.94;
      let size = (target / refWidth) * REF;

      // Then clamp to height using the real ink box, which for Bangla is
      // much taller than the Latin cap height because of the matras.
      ctx.font = `${weight} ${size}px ${fontFamily}`;
      let m = ctx.measureText(text);
      const inkHeight = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
      const maxInk = CANVAS_H * 0.82;
      if (inkHeight > maxInk) {
        size *= maxInk / inkHeight;
        ctx.font = `${weight} ${size}px ${fontFamily}`;
        m = ctx.measureText(text);
      }

      // Centre on the ink box rather than the baseline.
      const ascent = m.actualBoundingBoxAscent;
      const descent = m.actualBoundingBoxDescent;
      const baselineY = CANVAS_H / 2 + (ascent - descent) / 2;

      ctx.fillStyle = color;
      ctx.fillText(text, CANVAS_W / 2, baselineY);

      made = new THREE.CanvasTexture(canvas);
      made.colorSpace = THREE.SRGBColorSpace;
      made.anisotropy = 16;
      made.minFilter = THREE.LinearMipmapLinearFilter;
      made.magFilter = THREE.LinearFilter;
      made.generateMipmaps = true;
      made.needsUpdate = true;

      if (cancelled) {
        made.dispose();
        return;
      }
      setTexture(made);
    });

    return () => {
      cancelled = true;
      made?.dispose();
    };
  }, [text, fontFamily, color, weight, tracking]);

  if (!texture) return null;

  const height = width * (CANVAS_H / CANVAS_W);

  return (
    <mesh position={position}>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial
        map={texture}
        transparent
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}
