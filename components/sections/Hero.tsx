"use client";

import { useEffect, useMemo, useRef } from "react";
import { useLang } from "@/lib/i18n";

/**
 * Split text into user-perceived characters.
 *
 * Not `Array.from`, and definitely not `split("")`: Bengali builds a
 * character from a consonant plus vowel signs and conjunct marks, so
 * splitting by code point tears বৈ into ব and a stranded ৈ. Intl.Segmenter
 * groups each cluster the way a reader sees it.
 */
function graphemes(text: string, locale: string): string[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter(locale, { granularity: "grapheme" });
    return Array.from(segmenter.segment(text), (s) => s.segment);
  }
  return Array.from(text);
}

/**
 * Layered hero.
 *
 *   z4  headline, standfirst, nav
 *   z3  hero-foreground.webp   ship + cranes + water, transparent above
 *   z2  BOIDESHIK BANIK        live text, not baked into any image
 *   z1  hero-bg.webp           sky, distant terminal, water
 *
 * The two plates are a matched pair cut from one source photograph and
 * share an identical 1448x1086 canvas. Both are laid out `inset-0` with
 * `object-fit: cover`, so the browser resolves them to the same rectangle
 * at every viewport and they stay registered with no hand-tuned offsets.
 * Trimming either one, or sourcing them separately, is what breaks this.
 *
 * The composition is static by design — no parallax, no pointer tracking.
 * Both plates render at exact cover scale so they stay pixel-registered.
 */

const BG = "/images/hero/hero-bg.webp";
const FOREGROUND = "/images/hero/hero-foreground.webp";

/** Vertical placement of the wordmark. Raise to tuck it further behind the
    ship, lower to expose more of the letterforms. */
const WORDMARK_TOP = "36%";

/** How strongly the name reads against the sky. */
const WORDMARK_OPACITY = 0.38;

/** Share of the available width the name should occupy. 1 fills it edge to
    edge; a hair under leaves the last letter clear of the margin. */
const WORDMARK_FILL = 0.98;

/**
 * Size the wordmark to its container by measurement rather than by a `vw`
 * guess.
 *
 * A hand-picked `clamp(...,12.4vw,...)` only holds for the one string, font
 * and viewport it was tuned against — change the language, the weight, or
 * the window and the last letter walks off the screen. Measuring the real
 * rendered width and solving for the font size that fits is exact, and it
 * keeps working for Bangla, which sets to a completely different width.
 */
function useFitToWidth(
  ref: React.RefObject<HTMLElement | null>,
  deps: unknown[],
) {
  useEffect(() => {
    const el = ref.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;

    const PROBE = 100; // measure at a known size, then scale the result

    const fit = () => {
      el.style.fontSize = `${PROBE}px`;
      const natural = el.scrollWidth;
      const available = parent.clientWidth;
      if (natural > 0 && available > 0) {
        el.style.fontSize = `${(available / natural) * PROBE * WORDMARK_FILL}px`;
      }
    };

    fit();
    // Measured again once the webfont lands: the fallback face has different
    // metrics, so a first pass before it loads would size against the wrong
    // letterforms.
    document.fonts.ready.then(fit).catch(() => {});

    const observer = new ResizeObserver(fit);
    observer.observe(parent);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/* Reveal timing. The first letter waits for the hero plates to paint, then
   each cluster follows one beat behind the last. */
const REVEAL_START = 240;
const REVEAL_STEP = 52;

export function Hero() {
  const { t, lang } = useLang();
  const isBn = lang === "bn";

  const wordmark = isBn ? "বৈদেশিক বণিক" : "BOIDESHIK BANIK";
  const letters = useMemo(
    () => graphemes(wordmark, isBn ? "bn" : "en"),
    [wordmark, isBn],
  );

  const wordmarkRef = useRef<HTMLSpanElement>(null);
  useFitToWidth(wordmarkRef, [wordmark]);

  return (
    <section
      id="top"
      className="relative isolate h-[100svh] min-h-[720px] w-full overflow-hidden"
      style={{ background: "#16293f" }}
    >
      {/* ---- z1 · background plate ---- */}
      <img
        src={BG}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover"
        style={{ zIndex: 1 }}
        draggable={false}
      />

      {/* Gradient for type legibility only — kept light so the photograph
          keeps its own warm sunset rather than being flattened to navy. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          zIndex: 1,
          background:
            "linear-gradient(180deg, rgba(9,26,47,0.62) 0%, rgba(9,26,47,0.30) 30%, rgba(9,26,47,0.04) 52%, rgba(9,26,47,0) 70%)",
        }}
      />

      {/* ---- z2 · wordmark ---- */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-[2%] text-center"
        style={{ zIndex: 2, top: WORDMARK_TOP }}
      >
        <span
          ref={wordmarkRef}
          className={isBn ? "bangla" : undefined}
          style={{
            display: "inline-block",
            whiteSpace: "nowrap",
            color: `rgba(255,255,255,${WORDMARK_OPACITY})`,
            fontFamily: isBn ? undefined : "var(--font-archivo)",
            fontVariationSettings: isBn ? undefined : '"wdth" 100',
            fontWeight: 800,
            letterSpacing: isBn ? "-0.01em" : "-0.055em",
            lineHeight: 0.82,
            // Starting value only — replaced with a measured size on mount.
            // The letters are still at opacity 0 behind the reveal delay
            // when that happens, so the correction is never seen.
            fontSize: "9vw",
            // A faint dark spread behind the strokes stops the brightest
            // parts of the sky washing the letters out, so the name holds
            // its weight evenly across the sunset.
            textShadow: "0 2px 40px rgba(8,22,40,0.32)",
          }}
        >
          {letters.map((cluster, i) => (
            // Keyed by the word so switching language remounts the spans
            // and the name spells itself out again in the new script.
            <span
              key={`${wordmark}-${i}`}
              className={isBn ? "bb-letter-bn" : "bb-letter"}
              style={{ animationDelay: `${REVEAL_START + i * REVEAL_STEP}ms` }}
            >
              {cluster === " " ? " " : cluster}
            </span>
          ))}
        </span>
      </div>

      {/* ---- z3 · foreground plate ---- */}
      <img
        src={FOREGROUND}
        alt="Container vessel discharging at a terminal berth"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        style={{ zIndex: 3 }}
        draggable={false}
      />

      {/* ---- z4 · copy ---- */}
      <div
        className="relative flex h-full flex-col px-[var(--shell-gutter)] pt-28 md:pt-32"
        style={{ zIndex: 4 }}
      >
        {/* The headline stands alone. The kicker, standfirst and link that
            used to sit alongside it are gone — with nothing competing, the
            ship and the wordmark carry the frame. */}
        <h1
          className={isBn ? "bangla font-bold text-paper" : "text-paper"}
          style={{
            fontFamily: isBn ? undefined : "var(--font-archivo)",
            fontVariationSettings: isBn ? undefined : '"wdth" 100',
            fontWeight: 800,
            textTransform: isBn ? "none" : "uppercase",
            fontSize: isBn
              ? "clamp(1.8rem,4.4vw,3.3rem)"
              : "clamp(2rem,5.2vw,4.2rem)",
            lineHeight: isBn ? 1.16 : 0.9,
            letterSpacing: isBn ? "-0.01em" : "-0.035em",
            textShadow: "0 2px 30px rgba(6,18,34,0.45)",
          }}
        >
          {t("hero.h1a")}
          <br />
          {t("hero.h1b")}
        </h1>
      </div>
    </section>
  );
}
