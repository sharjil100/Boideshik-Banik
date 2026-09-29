"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { RackScene } from "@/components/three/RackScene";
import { PRODUCTS } from "@/lib/products";
import { CATEGORIES } from "@/lib/catalogue";
import { useLang } from "@/lib/i18n";

const LAST = PRODUCTS.length - 1;
const clamp = (v: number) => Math.max(0, Math.min(LAST, v));

export function Rack() {
  const { t, lang } = useLang();
  const isBn = lang === "bn";

  // The scroll position lives in a ref, not state: it changes every frame
  // while dragging, and re-rendering the React tree at that rate would
  // stutter far worse than the 3D ever could.
  const positionRef = useRef(0);
  const velocityRef = useRef(0);
  const draggingRef = useRef(false);
  const [active, setActive] = useState(0);

  const surfaceRef = useRef<HTMLDivElement>(null);

  /* ---- physics loop: fling, then settle onto a product ---- */
  useEffect(() => {
    let frame = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      if (!draggingRef.current) {
        // Project where the fling is heading and snap to that slot, rather
        // than always to the nearest — otherwise a firm flick stops dead on
        // the neighbour and the carousel feels sticky.
        const projected = positionRef.current + velocityRef.current * 0.28;
        const target = clamp(Math.round(projected));

        const stiffness = 60;
        const damping = 14;
        const accel =
          (target - positionRef.current) * stiffness - velocityRef.current * damping;

        velocityRef.current += accel * dt;
        positionRef.current += velocityRef.current * dt;
      }

      positionRef.current = clamp(positionRef.current);

      const nearest = Math.round(positionRef.current);
      setActive((prev) => (prev === nearest ? prev : nearest));

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  /* ---- pointer drag ---- */
  useEffect(() => {
    const el = surfaceRef.current;
    if (!el) return;

    let pointerId: number | null = null;
    let lastX = 0;
    let lastT = 0;

    // 240px of travel moves one slot — tuned so a comfortable swipe on a
    // phone advances exactly one product.
    const PX_PER_SLOT = 240;

    const down = (e: PointerEvent) => {
      pointerId = e.pointerId;
      draggingRef.current = true;
      velocityRef.current = 0;
      lastX = e.clientX;
      lastT = performance.now();
      el.setPointerCapture(e.pointerId);
    };

    const move = (e: PointerEvent) => {
      if (pointerId !== e.pointerId || !draggingRef.current) return;
      const now = performance.now();
      const dx = e.clientX - lastX;
      const dt = Math.max((now - lastT) / 1000, 1 / 240);

      const delta = -dx / PX_PER_SLOT;
      positionRef.current = clamp(positionRef.current + delta);
      velocityRef.current = delta / dt;

      lastX = e.clientX;
      lastT = now;
    };

    const up = (e: PointerEvent) => {
      if (pointerId !== e.pointerId) return;
      draggingRef.current = false;
      pointerId = null;
      // A long pause before release means a deliberate stop, not a fling.
      if (performance.now() - lastT > 120) velocityRef.current = 0;
    };

    // Horizontal wheel only. Claiming the vertical wheel would trap the
    // page scroll inside this section, which is always worse than it sounds.
    const wheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) < Math.abs(e.deltaY)) return;
      e.preventDefault();
      positionRef.current = clamp(positionRef.current + e.deltaX / 400);
      velocityRef.current = 0;
    };

    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("wheel", wheel, { passive: false });

    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      el.removeEventListener("wheel", wheel);
    };
  }, []);

  const go = useCallback((index: number) => {
    velocityRef.current = 0;
    positionRef.current = clamp(index);
  }, []);

  const product = PRODUCTS[active];
  const category = CATEGORIES.find((c) => c.id === product.category);

  return (
    <section
      id="rack"
      className="relative h-[100svh] w-full overflow-hidden bg-[#090c11]"
    >
      <div className="absolute inset-0">
        <Canvas
          dpr={[1, 1.75]}
          shadows="soft"
          camera={{ fov: 42, position: [0, -0.5, 1.15], near: 0.1, far: 40 }}
          gl={{
            antialias: true,
            powerPreference: "high-performance",
            toneMapping: THREE.ACESFilmicToneMapping,
          }}
        >
          <Suspense fallback={null}>
            <RackScene positionRef={positionRef} />
          </Suspense>
        </Canvas>
      </div>

      {/* Drag surface sits over the canvas and owns all the pointer input. */}
      <div
        ref={surfaceRef}
        className="absolute inset-0 cursor-grab touch-pan-y active:cursor-grabbing"
        role="group"
        aria-label={isBn ? "পণ্যের তালিকা" : "Product rack"}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(active + 1);
          if (e.key === "ArrowLeft") go(active - 1);
        }}
      />

      {/* ---------- overlay ---------- */}
      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-[var(--shell-gutter)]">
        <div className="flex items-start justify-between pt-16">
          <div>
            <p className="manifest-sm text-paper/40">
              {isBn ? "নথি / ০২" : "DOC / 02"}
            </p>
            <h2
              className={`mt-2 text-paper ${
                isBn ? "bangla text-3xl font-bold" : "display text-4xl"
              }`}
            >
              {isBn ? "কন্টেইনারের ভিতরে" : "Inside the container"}
            </h2>
          </div>
          <p className="manifest-sm hidden text-right text-paper/40 sm:block">
            {isBn ? "টেনে দেখুন" : "Drag to browse"}
            <br />
            <span className="text-paper/25">
              {String(active + 1).padStart(2, "0")} / {String(PRODUCTS.length).padStart(2, "0")}
            </span>
          </p>
        </div>

        {/* ---------- museum label ---------- */}
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <div className="md:col-span-5">
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden
                className="inline-block h-2.5 w-2.5 shrink-0"
                style={{ background: category?.color }}
              />
              <span className="manifest-sm text-paper/45">
                {category ? t(category.labelKey) : ""}
              </span>
            </div>
            <h3
              className={`mt-3 text-paper ${
                isBn ? "bangla text-3xl font-bold" : "display text-4xl"
              }`}
            >
              {product.name[lang]}
            </h3>
            <p className="manifest mt-2 text-crate-orange">{product.code}</p>
          </div>

          <div className="md:col-span-4">
            <hr className="rule-perf mb-3 text-paper/40" />
            <ul className="space-y-1.5">
              {product.specs.map((spec) => (
                <li
                  key={spec.en}
                  className={`text-sm text-paper/70 ${isBn ? "bangla" : ""}`}
                >
                  {spec[lang]}
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <hr className="rule-perf mb-3 text-paper/40" />
            <dl className="manifest-sm grid grid-cols-2 gap-y-1.5 text-paper/50">
              <dt>{isBn ? "ন্যূনতম" : "MOQ"}</dt>
              <dd className="text-right text-paper/80">
                {product.moq.toLocaleString()}
              </dd>
              <dt>{isBn ? "কার্টন" : "CARTON"}</dt>
              <dd className="text-right text-paper/80">{product.carton}</dd>
              <dt>{isBn ? "এইচএস" : "HS"}</dt>
              <dd className="text-right text-paper/80">{product.hs}</dd>
            </dl>
          </div>
        </div>

        {/* ---------- slot ticks ---------- */}
        <div className="pointer-events-auto mt-6 flex items-center justify-center gap-1.5">
          {PRODUCTS.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => go(i)}
              aria-label={p.name.en}
              aria-current={i === active}
              className="group p-2"
            >
              <span
                className="block h-px w-6 transition-all duration-300"
                style={{
                  background:
                    i === active
                      ? "var(--color-crate-orange)"
                      : "color-mix(in srgb, var(--color-paper) 28%, transparent)",
                  height: i === active ? "3px" : "1px",
                }}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
