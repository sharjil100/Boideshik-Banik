"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PRODUCTS, SUMMARY, textureUrl } from "@/lib/products";
import { useLang } from "@/lib/i18n";

/**
 * Featured products carousel.
 *
 * Built on native overflow scrolling rather than a carousel library or a
 * transform track. That gets touch momentum, trackpad gestures, keyboard
 * scrolling and screen-reader order for free, and it degrades to a plain
 * scrollable row if JavaScript never runs. The buttons and the counter are
 * conveniences layered on top, not the mechanism.
 *
 * The row runs continuously rather than stepping between slides. The
 * product list is rendered twice and the scroll position wraps at the
 * halfway mark, so the loop is seamless and there is no visible jump at
 * the end of the set.
 *
 * The highlighted card is whichever sits nearest the centre of the
 * viewport, so the emphasis tracks the motion instead of being pinned to
 * a fixed slot.
 */

const NAVY = "#16293f";
/** Pixels per second. Slow enough to read a card as it passes. */
const SCROLL_SPEED = 45;

/** How long the marquee yields after an arrow press, so its smooth scroll
    can finish without being overwritten frame by frame. */
const ARROW_YIELD_MS = 900;

/* Rendered twice so the wrap has somewhere to wrap to. */
const LOOP = [...PRODUCTS, ...PRODUCTS];

function Arrow({ dir }: { dir: "prev" | "next" }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {dir === "next" ? (
        <>
          <path d="M5 12h13" />
          <path d="m12 5 7 7-7 7" />
        </>
      ) : (
        <>
          <path d="M19 12H6" />
          <path d="m12 19-7-7 7-7" />
        </>
      )}
    </svg>
  );
}

export function Featured() {
  const { t, lang } = useLang();
  const isBn = lang === "bn";

  const scroller = useRef<HTMLDivElement>(null);
  const paused = useRef(false);
  const suspendUntil = useRef(0);
  const [active, setActive] = useState(0);

  /** Width of one card plus the gap — the distance one press should travel. */
  const step = useCallback(() => {
    const el = scroller.current;
    const first = el?.firstElementChild as HTMLElement | null;
    if (!el || !first) return 0;
    const gap = parseFloat(getComputedStyle(el).columnGap || "0") || 0;
    return first.offsetWidth + gap;
  }, []);

  const go = useCallback(
    (dir: 1 | -1) => {
      const el = scroller.current;
      if (!el) return;
      // Yield, or the per-frame writes below would fight the smooth scroll.
      suspendUntil.current = performance.now() + ARROW_YIELD_MS;

      // Going back from the very start would clamp at zero and appear
      // dead. Jump to the identical card in the second pass first, so
      // there is somewhere to travel back into.
      const distance = step();
      if (dir === -1 && el.scrollLeft < distance) {
        el.scrollLeft += el.scrollWidth / 2;
      }
      el.scrollBy({ left: dir * distance, behavior: "smooth" });
    },
    [step],
  );

  /* Track which card owns the centre of the viewport. */
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;

    let frame = 0;
    const measure = () => {
      frame = 0;
      const centre = el.scrollLeft + el.clientWidth / 2;
      let best = 0;
      let bestDistance = Infinity;
      Array.from(el.children).forEach((node, i) => {
        const child = node as HTMLElement;
        const childCentre = child.offsetLeft + child.offsetWidth / 2;
        const distance = Math.abs(childCentre - centre);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = i;
        }
      });
      setActive(best);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    measure();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  /* Continuous marquee.
     Motion is accumulated in a ref and applied only in whole pixels —
     browsers may round scrollLeft to an integer, and a sub-pixel delta of
     0.75px per frame would round to zero every time and never move. */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = scroller.current;
    if (!el) return;

    let frame = 0;
    let last = performance.now();
    let carry = 0;

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      if (!paused.current && !document.hidden && now >= suspendUntil.current) {
        carry += SCROLL_SPEED * dt;
        const whole = Math.floor(carry);
        if (whole >= 1) {
          carry -= whole;
          const half = el.scrollWidth / 2;
          const next = el.scrollLeft + whole;
          // Wrapping at the halfway point lands on an identical card, so
          // the reset is invisible.
          el.scrollLeft = next >= half ? next - half : next;
        }
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const hold = () => {
    paused.current = true;
  };
  const release = () => {
    paused.current = false;
  };

  const display = (size: string) =>
    isBn
      ? { fontWeight: 700, lineHeight: 1.22, letterSpacing: "-0.01em", fontSize: size }
      : {
          fontFamily: "var(--font-archivo)",
          fontVariationSettings: '"wdth" 100',
          fontWeight: 800,
          textTransform: "uppercase" as const,
          lineHeight: 0.94,
          letterSpacing: "-0.03em",
          fontSize: size,
        };

  return (
    <section
      id="featured"
      className="overflow-hidden py-20 md:py-28"
      style={{ background: NAVY }}
      /* Hover deliberately does not pause — the row keeps moving. Focus
         still does, because a keyboard user tabbing into a moving list of
         links cannot hit anything. */
      onFocusCapture={hold}
      onBlurCapture={release}
    >
      {/* ---------- header ---------- */}
      <div className="flex flex-wrap items-end justify-between gap-6 px-[var(--shell-gutter)]">
        <div>
          <p
            className={isBn ? "bangla" : ""}
            style={{
              fontSize: "0.7rem",
              letterSpacing: "0.3em",
              fontWeight: 600,
              textTransform: isBn ? "none" : "uppercase",
              color: "rgba(240,228,206,0.72)",
            }}
          >
            {t("ftr.kicker")}
          </p>
          <h2
            className={`mt-4 ${isBn ? "bangla" : ""}`}
            style={{ ...display("clamp(1.7rem,4vw,3.2rem)"), color: "#fff" }}
          >
            {t("ftr.title")}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <span
            className="tabular-nums"
            style={{ fontSize: "0.86rem", color: "rgba(255,255,255,0.55)" }}
          >
            {String((active % PRODUCTS.length) + 1).padStart(2, "0")} / {PRODUCTS.length}
          </span>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label={t("ftr.prev")}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-white transition-colors"
              style={{ background: "rgba(255,255,255,0.1)" }}
            >
              <Arrow dir="prev" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label={t("ftr.next")}
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl text-white transition-transform hover:scale-105"
              style={{ background: "var(--color-crate-orange)" }}
            >
              <Arrow dir="next" />
            </button>
          </div>
        </div>
      </div>

      {/* ---------- track ---------- */}
      <div
        ref={scroller}
        className="no-scrollbar mt-10 flex gap-5 overflow-x-auto pb-4 md:mt-14"
        style={{
          /* Padding rather than margin so the first and last cards can rest
             flush with the page gutter when snapped. */
          paddingInline: "var(--shell-gutter)",
          scrollPaddingInline: "var(--shell-gutter)",
          /* Scroll-snap would fight a continuous scroll, pulling the row
             back to the nearest card every frame. */
        }}
        onPointerDown={hold}
        onPointerUp={release}
        onPointerCancel={release}
      >
        {LOOP.map((product, i) => {
          const isActive = i === active;
          // The second pass is decorative; keeping it out of the tab order
          // and the accessibility tree avoids 11 duplicate links.
          const isClone = i >= PRODUCTS.length;
          return (
            <a
              key={`${product.id}-${i}`}
              href="#quote"
              aria-hidden={isClone || undefined}
              tabIndex={isClone ? -1 : undefined}
              className="group relative w-[74%] shrink-0 overflow-hidden rounded-[20px] bg-white transition-[box-shadow,transform,outline-color] duration-400 sm:w-[44%] lg:w-[29%] xl:w-[23%]"
              style={{
                boxShadow: isActive ? "var(--shadow-card-lift)" : "var(--shadow-card)",
                outline: "2px solid",
                outlineColor: isActive ? "var(--color-crate-orange)" : "transparent",
                outlineOffset: "-2px",
                transform: isActive ? "translateY(-6px)" : "none",
              }}
            >
              {/* Fixed-ratio image area, so every product occupies the same
                  box whatever its own proportions are. */}
              <div className="flex aspect-[4/3] items-center justify-center p-7">
                <img
                  src={textureUrl(product)}
                  alt={product.name.en}
                  className="elev-product max-h-full max-w-full select-none object-contain transition-transform duration-500 group-hover:scale-[1.05]"
                  loading="lazy"
                  draggable={false}
                />
              </div>

              <div className="px-6 pb-7">
                <h3
                  className={`text-[1.06rem] font-bold leading-tight ${isBn ? "bangla" : ""}`}
                  style={{ color: NAVY }}
                >
                  {product.name[lang]}
                </h3>
                <p
                  className={`mt-2 text-[0.84rem] ${isBn ? "bangla" : ""}`}
                  style={{ color: "#6b7887" }}
                >
                  {SUMMARY[product.id][lang]}
                </p>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
