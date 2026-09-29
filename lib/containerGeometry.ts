import * as THREE from "three";
import { CONTAINER_DIMS } from "./catalogue";

/**
 * Merge a set of geometries into one non-indexed buffer.
 *
 * three's own mergeGeometries lives in three/examples/jsm, which doesn't
 * resolve reliably inside Next's server bundle — it fails at module scope
 * with an unhelpful "not a function". Since everything merged here is
 * static and small, doing it directly is both more robust and one less
 * import to bundle.
 */
function mergeNonIndexed(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const parts = geometries.map((g) => {
    const flat = g.index ? g.toNonIndexed() : g;
    if (!flat.getAttribute("normal")) flat.computeVertexNormals();
    return flat;
  });

  const total = parts.reduce((n, g) => n + g.getAttribute("position").count, 0);
  const position = new Float32Array(total * 3);
  const normal = new Float32Array(total * 3);
  const uv = new Float32Array(total * 2);

  let offset = 0;
  for (const g of parts) {
    const p = g.getAttribute("position") as THREE.BufferAttribute;
    const n = g.getAttribute("normal") as THREE.BufferAttribute;
    const u = g.getAttribute("uv") as THREE.BufferAttribute | undefined;

    position.set(p.array as Float32Array, offset * 3);
    normal.set(n.array as Float32Array, offset * 3);
    if (u) uv.set(u.array as Float32Array, offset * 2);

    offset += p.count;
  }

  const out = new THREE.BufferGeometry();
  out.setAttribute("position", new THREE.BufferAttribute(position, 3));
  out.setAttribute("normal", new THREE.BufferAttribute(normal, 3));
  out.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return out;
}

const { length: L, height: H, width: W } = CONTAINER_DIMS;

/**
 * Real corrugated panel geometry.
 *
 * A normal map on a flat box is the usual shortcut and it always reads as
 * fake, because the silhouette stays dead straight — at a grazing angle you
 * can see the ribs aren't there. This builds the fold profile into actual
 * vertices so the edge is serrated from every angle.
 *
 * The profile is trapezoidal, not sinusoidal: flat outer face, sharp flank,
 * flat valley, sharp flank. That's what pressed steel does, and the hard
 * fold is what catches the light as a bright line.
 *
 *   ___        ___        ___     outer face (z = depth)
 *  /   \      /   \      /   \    flanks
 * /     \____/     \____/     \   valley (z = 0)
 *
 * Geometry is non-indexed so every quad gets its own face normal and the
 * folds stay crisp instead of being smoothed away by averaged vertex normals.
 */
export function corrugatedPanel(
  width: number,
  height: number,
  ribs: number,
  depth: number,
): THREE.BufferGeometry {
  const period = width / ribs;

  // Fractions of one period: outer flat, down flank, inner flat, up flank.
  const OUTER = 0.34;
  const FLANK = 0.16;
  const INNER = 0.34;

  const profile: [number, number][] = [];
  for (let i = 0; i < ribs; i++) {
    const x = -width / 2 + i * period;
    profile.push([x, depth]);
    profile.push([x + period * OUTER, depth]);
    profile.push([x + period * (OUTER + FLANK), 0]);
    profile.push([x + period * (OUTER + FLANK + INNER), 0]);
  }
  profile.push([width / 2, depth]);

  const y0 = -height / 2;
  const y1 = height / 2;

  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];

  const nA = new THREE.Vector3();
  const nB = new THREE.Vector3();
  const n = new THREE.Vector3();

  for (let i = 0; i < profile.length - 1; i++) {
    const [xa, za] = profile[i];
    const [xb, zb] = profile[i + 1];

    // Face normal of this strip: segment direction × +Y.
    //
    // Order matters and is easy to get backwards. The quads below wind
    // counter-clockwise seen from +Z, so the front face is +Z, and the
    // normal has to agree: X × Y = +Z. Crossing the other way (Y × X)
    // yields -Z, which leaves the geometry rendering outward while being
    // lit from behind — the surface goes flat and dead, and no amount of
    // material tuning fixes it.
    nA.set(xb - xa, 0, zb - za).normalize();
    nB.set(0, 1, 0);
    n.crossVectors(nA, nB).normalize();

    const ua = (xa + width / 2) / width;
    const ub = (xb + width / 2) / width;

    // Two triangles, wound counter-clockwise seen from +Z.
    const quad: [number, number, number, number, number][] = [
      [xa, y0, za, ua, 0],
      [xb, y0, zb, ub, 0],
      [xb, y1, zb, ub, 1],
      [xa, y0, za, ua, 0],
      [xb, y1, zb, ub, 1],
      [xa, y1, za, ua, 1],
    ];

    for (const [px, py, pz, u, v] of quad) {
      positions.push(px, py, pz);
      normals.push(n.x, n.y, n.z);
      uvs.push(u, v);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  return geo;
}

/* ------------------------------------------------------------------ *
 * Panel set
 * ------------------------------------------------------------------ */

const POST = 0.13; // corner post cross-section
const RAIL = 0.15; // top/bottom rail depth
const SKIN = 0.045; // how far the corrugation stands proud of the frame

/** Long sides, merged into one geometry so both draw in a single call. */
export function sidePanels(): THREE.BufferGeometry {
  const w = L - POST * 2;
  const h = H - RAIL * 2;
  const ribs = 20;

  const front = corrugatedPanel(w, h, ribs, SKIN);
  front.translate(0, 0, W / 2 - SKIN);

  const back = corrugatedPanel(w, h, ribs, SKIN);
  back.rotateY(Math.PI);
  back.translate(0, 0, -(W / 2 - SKIN));

  return mergeNonIndexed([front, back]);
}

/** The closed end — ribs run vertically here, as on a real container. */
export function endPanel(): THREE.BufferGeometry {
  const geo = corrugatedPanel(W - POST * 2, H - RAIL * 2, 8, SKIN);
  geo.rotateY(-Math.PI / 2);
  geo.translate(-(L / 2 - SKIN), 0, 0);
  return geo;
}

/** Door end. Shallower corrugation — door leaves are less deeply pressed. */
export function doorPanel(): THREE.BufferGeometry {
  const geo = corrugatedPanel(W - POST * 2, H - RAIL * 2, 10, SKIN * 0.55);
  geo.rotateY(Math.PI / 2);
  geo.translate(L / 2 - SKIN * 0.55, 0, 0);
  return geo;
}

/** Roof ribs run transverse, repeating down the length. */
export function roofPanel(): THREE.BufferGeometry {
  const geo = corrugatedPanel(L - POST * 2, W - POST * 2, 26, SKIN * 0.7);
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, H / 2 - SKIN * 0.7, 0);
  return geo;
}

/* ------------------------------------------------------------------ *
 * Frame — corner posts, rails, castings, door hardware
 * ------------------------------------------------------------------ */

function box(
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
): THREE.BufferGeometry {
  const g = new THREE.BoxGeometry(w, h, d);
  g.translate(x, y, z);
  return g;
}

/**
 * The structural frame, merged to a single geometry. This is most of what
 * gives a container its silhouette — the panels are just skin stretched
 * between these members.
 */
export function frameGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const hx = L / 2 - POST / 2;
  const hz = W / 2 - POST / 2;
  const hy = H / 2 - RAIL / 2;

  // Four corner posts.
  for (const sx of [-1, 1])
    for (const sz of [-1, 1])
      parts.push(box(POST, H, POST, sx * hx, 0, sz * hz));

  // Top and bottom rails, long axis.
  for (const sy of [-1, 1])
    for (const sz of [-1, 1])
      parts.push(box(L - POST * 2, RAIL, POST, 0, sy * hy, sz * hz));

  // Top and bottom rails, short axis.
  for (const sy of [-1, 1])
    for (const sx of [-1, 1])
      parts.push(box(POST, RAIL, W - POST * 2, sx * hx, sy * hy, 0));

  // Corner castings — the cast blocks the twistlocks engage.
  for (const sx of [-1, 1])
    for (const sy of [-1, 1])
      for (const sz of [-1, 1])
        parts.push(
          box(0.28, 0.25, 0.28, sx * (L / 2 - 0.14), sy * (H / 2 - 0.125), sz * (W / 2 - 0.14)),
        );

  // Four vertical locking bars across the doors, with cam housings.
  const bx = L / 2 + 0.02;
  for (const bz of [-0.88, -0.30, 0.30, 0.88]) {
    const bar = new THREE.CylinderGeometry(0.028, 0.028, H - RAIL * 2.4, 8);
    bar.translate(bx, 0, bz);
    parts.push(bar);
    parts.push(box(0.07, 0.2, 0.1, bx + 0.01, -0.05, bz));
  }

  // Door seam plate down the centre of the door end.
  parts.push(box(0.04, H - RAIL * 2, 0.05, bx, 0, 0));

  return mergeNonIndexed(parts);
}

/** Floor slab, seen only at grazing angles from below. */
export function floorGeometry(): THREE.BufferGeometry {
  return box(L - POST * 2, 0.07, W - POST * 2, 0, -(H / 2 - RAIL), 0);
}

/* ------------------------------------------------------------------ *
 * Rack interior — the carousel is staged inside a container
 * ------------------------------------------------------------------ */

/**
 * Walls and ceiling of an open-ended container interior, corrugation facing
 * inward. Length is arbitrary rather than a real 20ft: the rack reads as a
 * corridor receding into darkness at both ends, so it just needs to outrun
 * the depth-of-field falloff.
 */
export function rackInterior(length: number): THREE.BufferGeometry {
  const ribs = Math.max(8, Math.round(length / 0.3));

  // Unrotated panels face +Z, so the far wall needs no rotation and the
  // near wall is flipped, putting both corrugated faces toward the camera.
  const far = corrugatedPanel(length, H, ribs, SKIN);
  far.translate(0, 0, -(W / 2 - SKIN));

  const near = corrugatedPanel(length, H, ribs, SKIN);
  near.rotateY(Math.PI);
  near.translate(0, 0, W / 2 - SKIN);

  // Ceiling: +Z rotated to face down.
  const ceiling = corrugatedPanel(length, W - POST * 2, Math.round(length / 0.24), SKIN * 0.7);
  ceiling.rotateX(Math.PI / 2);
  ceiling.translate(0, H / 2 - SKIN * 0.7, 0);

  return mergeNonIndexed([far, near, ceiling]);
}

/** Plywood deck. Container floors are boarded, not corrugated. */
export function rackFloor(length: number): THREE.BufferGeometry {
  const g = new THREE.PlaneGeometry(length, W - POST * 2);
  g.rotateX(-Math.PI / 2);
  g.translate(0, -(H / 2) + 0.02, 0);
  return g;
}

/**
 * Euro pallet, 1.2 x 0.8 x 0.144 m — three bottom boards, nine blocks,
 * five top boards. Built to the real spec because the proportions are
 * familiar enough that a wrong one looks off even when you can't say why.
 */
export function palletGeometry(): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const BOARD = 0.022;
  const BLOCK = 0.1;

  for (const z of [-0.35, 0, 0.35]) {
    parts.push(box(1.2, BOARD, 0.1, 0, BOARD / 2, z));
    for (const x of [-0.55, 0, 0.55]) {
      parts.push(box(BLOCK, BLOCK, BLOCK, x, BOARD + BLOCK / 2, z));
    }
  }

  const topY = BOARD + BLOCK + BOARD / 2;
  parts.push(box(1.2, BOARD, 0.145, 0, topY, -0.327));
  parts.push(box(1.2, BOARD, 0.145, 0, topY, 0.327));
  for (const z of [-0.16, 0, 0.16]) {
    parts.push(box(1.2, BOARD, 0.1, 0, topY, z));
  }

  return mergeNonIndexed(parts);
}

/** Height of the pallet deck, so goods can be stood on top of it. */
export const PALLET_DECK = 0.022 * 2 + 0.1;
