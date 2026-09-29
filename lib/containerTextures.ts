import * as THREE from "three";

/**
 * Painted-steel surfaces for the containers.
 *
 * These used to carry the corrugation and the frame as painted-on shading.
 * That work now lives in real geometry (see containerGeometry.ts), so these
 * textures do only what paint does: colour, markings, and wear.
 *
 * Each panel gets a matching roughness map. That pairing matters more than
 * it sounds — rust and scuffed primer are markedly rougher than intact
 * enamel, and varying roughness across a surface is most of what separates
 * "photographed object" from "coloured polygon".
 */

type PanelTextures = {
  map: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
};

function makeCanvas(w: number, h: number) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas context unavailable");
  return { canvas, ctx };
}

/** Deterministic PRNG so a container always weathers the same way. */
function seeded(seed: number) {
  let s = (seed >>> 0) || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

/**
 * Brand colours are chosen for screens, not for steel that has crossed the
 * Indian Ocean a dozen times. Pulling saturation and lightness down keeps
 * the livery recognisable while letting it read as paint under sun.
 */
export function weatheredPaint(hex: string): THREE.Color {
  const c = new THREE.Color(hex);
  const hsl = { h: 0, s: 0, l: 0 };
  c.getHSL(hsl);
  return c.setHSL(hsl.h, hsl.s * 0.74, hsl.l * 0.88);
}

function paintBase(
  ctx: CanvasRenderingContext2D,
  rough: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: THREE.Color,
  rand: () => number,
) {
  ctx.fillStyle = `#${color.getHexString()}`;
  ctx.fillRect(0, 0, w, h);

  // Enamel is fairly smooth; everything below roughens it selectively.
  rough.fillStyle = "#6e6e6e";
  rough.fillRect(0, 0, w, h);

  // Large-scale mottling — sun-faded panels are never one flat value.
  ctx.save();
  for (let i = 0; i < 34; i++) {
    const r = 40 + rand() * 190;
    const x = rand() * w;
    const y = rand() * h;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const light = rand() > 0.5;
    g.addColorStop(0, light ? "rgba(255,255,255,0.055)" : "rgba(0,0,0,0.055)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function wear(
  ctx: CanvasRenderingContext2D,
  rough: CanvasRenderingContext2D,
  w: number,
  h: number,
  rand: () => number,
  intensity = 1,
) {
  // Rust bleeding downward from fixings and the top rail.
  for (let i = 0; i < Math.round(30 * intensity); i++) {
    const x = rand() * w;
    const len = h * (0.1 + rand() * 0.5);
    const top = rand() < 0.65 ? 0 : rand() * h;
    const wide = 1 + rand() * 4;

    const g = ctx.createLinearGradient(0, top, 0, top + len);
    g.addColorStop(0, `rgba(104,48,18,${0.30 * intensity})`);
    g.addColorStop(1, "rgba(104,48,18,0)");
    ctx.fillStyle = g;
    ctx.fillRect(x, top, wide, len);

    // Rust is rough: same streak, brighter in the roughness channel.
    const rg = rough.createLinearGradient(0, top, 0, top + len);
    rg.addColorStop(0, `rgba(228,228,228,${0.7 * intensity})`);
    rg.addColorStop(1, "rgba(228,228,228,0)");
    rough.fillStyle = rg;
    rough.fillRect(x, top, wide, len);
  }

  // Chips and scrapes down to primer.
  for (let i = 0; i < Math.round(80 * intensity); i++) {
    const x = rand() * w;
    const y = rand() * h;
    const sw = rand() * 22;
    const sh = rand() * 3;
    ctx.fillStyle = `rgba(28,22,16,${0.05 + rand() * 0.1})`;
    ctx.fillRect(x, y, sw, sh);
    rough.fillStyle = `rgba(210,210,210,${0.3 + rand() * 0.4})`;
    rough.fillRect(x, y, sw, sh);
  }

  // Road film, always heaviest at the bottom.
  const grime = ctx.createLinearGradient(0, h * 0.5, 0, h);
  grime.addColorStop(0, "rgba(20,16,12,0)");
  grime.addColorStop(1, `rgba(20,16,12,${0.3 * intensity})`);
  ctx.fillStyle = grime;
  ctx.fillRect(0, 0, w, h);
}

function finish(canvas: HTMLCanvasElement, srgb: boolean) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  tex.anisotropy = 8;
  return tex;
}

/* ------------------------------------------------------------------ *
 * Long side — carries the ISO 6346 marking
 * ------------------------------------------------------------------ */

export function sideTextures(
  color: THREE.Color,
  code: string,
  seed: number,
): PanelTextures {
  const W = 1024;
  const H = 448;
  const { canvas, ctx } = makeCanvas(W, H);
  const { canvas: rCanvas, ctx: rCtx } = makeCanvas(W, H);
  const rand = seeded(seed);

  paintBase(ctx, rCtx, W, H, color, rand);

  // Owner code + serial + check digit, stencilled high on the panel.
  ctx.textBaseline = "top";
  ctx.fillStyle = "rgba(246,243,236,0.90)";
  ctx.font = "600 38px ui-monospace, 'Courier New', monospace";
  ctx.letterSpacing = "5px";
  ctx.fillText(code, W * 0.06, H * 0.13);

  ctx.font = "700 21px ui-monospace, 'Courier New', monospace";
  ctx.letterSpacing = "8px";
  ctx.fillStyle = "rgba(246,243,236,0.58)";
  ctx.fillText("BOIDESHIK BANIK", W * 0.06, H * 0.31);

  // Payload plate — the small print every box carries.
  ctx.font = "500 15px ui-monospace, 'Courier New', monospace";
  ctx.letterSpacing = "2px";
  ctx.fillStyle = "rgba(246,243,236,0.46)";
  ["MAX GROSS  30,480 KG", "TARE        2,230 KG", "CU. CAP.    33.2 CBM"].forEach(
    (line, i) => ctx.fillText(line, W * 0.66, H * 0.60 + i * 21),
  );

  // Stencils are paint too — slightly smoother than the surrounding panel.
  rCtx.fillStyle = "rgba(60,60,60,0.5)";
  rCtx.fillRect(W * 0.05, H * 0.11, W * 0.44, H * 0.26);

  wear(ctx, rCtx, W, H, rand, 1);

  return { map: finish(canvas, true), roughnessMap: finish(rCanvas, false) };
}

/* ------------------------------------------------------------------ *
 * Ends
 * ------------------------------------------------------------------ */

export function endTextures(color: THREE.Color, seed: number): PanelTextures {
  const W = 512;
  const H = 512;
  const { canvas, ctx } = makeCanvas(W, H);
  const { canvas: rCanvas, ctx: rCtx } = makeCanvas(W, H);
  const rand = seeded(seed + 77);

  paintBase(ctx, rCtx, W, H, color, rand);
  wear(ctx, rCtx, W, H, rand, 0.9);

  return { map: finish(canvas, true), roughnessMap: finish(rCanvas, false) };
}

export function doorTextures(color: THREE.Color, seed: number): PanelTextures {
  const W = 512;
  const H = 512;
  const { canvas, ctx } = makeCanvas(W, H);
  const { canvas: rCanvas, ctx: rCtx } = makeCanvas(W, H);
  const rand = seeded(seed + 211);

  paintBase(ctx, rCtx, W, H, color, rand);

  // Consignee stencil and a CSC plate outline, as carried on real doors.
  ctx.textBaseline = "top";
  ctx.fillStyle = "rgba(246,243,236,0.4)";
  ctx.font = "500 13px ui-monospace, 'Courier New', monospace";
  ctx.letterSpacing = "3px";
  ctx.fillText("CSC / ACEP", W * 0.08, H * 0.7);
  ctx.strokeStyle = "rgba(246,243,236,0.22)";
  ctx.lineWidth = 2;
  ctx.strokeRect(W * 0.07, H * 0.67, W * 0.3, H * 0.13);

  // Doors take the most handling damage.
  wear(ctx, rCtx, W, H, rand, 1.25);

  return { map: finish(canvas, true), roughnessMap: finish(rCanvas, false) };
}

/* ------------------------------------------------------------------ *
 * Roof — the worst-weathered surface on any container
 * ------------------------------------------------------------------ */

export function roofTextures(color: THREE.Color, seed: number): PanelTextures {
  const W = 512;
  const H = 256;
  const { canvas, ctx } = makeCanvas(W, H);
  const { canvas: rCanvas, ctx: rCtx } = makeCanvas(W, H);
  const rand = seeded(seed + 311);

  const darker = color.clone().multiplyScalar(0.9);
  paintBase(ctx, rCtx, W, H, darker, rand);

  // Pooled water leaves broad rust blooms in the valleys.
  for (let i = 0; i < 46; i++) {
    const x = rand() * W;
    const y = rand() * H;
    const rx = 5 + rand() * 34;
    const ry = 3 + rand() * 14;
    ctx.fillStyle = `rgba(92,44,16,${0.06 + rand() * 0.2})`;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    rCtx.fillStyle = `rgba(235,235,235,${0.4 + rand() * 0.5})`;
    rCtx.beginPath();
    rCtx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    rCtx.fill();
  }

  wear(ctx, rCtx, W, H, rand, 1.5);

  return { map: finish(canvas, true), roughnessMap: finish(rCanvas, false) };
}
