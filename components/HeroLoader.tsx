"use client";

import { useEffect, useRef } from "react";

/**
 * Opening video overlay.
 *
 * Three rules govern this, because a loading animation is bytes and delay
 * added to the very thing it is meant to disguise:
 *
 *   1. It never blocks. The hero renders underneath from the first frame;
 *      this is only painted on top. If the video stalls or 404s, nothing
 *      is waiting on it.
 *   2. It clears itself in CSS. The fade-out is a keyframe animation with
 *      a delay, so the overlay leaves even if this component never runs.
 *      JavaScript can only make it leave sooner, never later.
 *   3. It costs nothing to anyone who does not get it. The gate is decided
 *      before first paint by the inline script in the head — first visit
 *      only, and never on reduced-motion, Save-Data or 2G.
 */

const SOURCE = "/video/hero-loader.mp4";

export function HeroLoader() {
  const root = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = root.current;
    const media = video.current;
    if (!el || !media) return;

    // Everyone the gate excluded leaves here, before any request is made.
    // The src is attached in JS rather than rendered as an attribute for
    // exactly this reason: a markup src would download the file for every
    // visitor, including the ones on 2G we are trying to spare.
    if (document.documentElement.dataset.loader !== "on") return;

    media.src = SOURCE;
    // Autoplay can still be refused; the CSS fade covers that case.
    void media.play().catch(() => {});

    const dismiss = () => el.classList.add("is-done");
    media.addEventListener("ended", dismiss, { once: true });

    // Any intent to get on with it ends the sequence early.
    const opts = { once: true, passive: true } as const;
    window.addEventListener("wheel", dismiss, opts);
    window.addEventListener("touchstart", dismiss, opts);
    window.addEventListener("pointerdown", dismiss, opts);
    window.addEventListener("keydown", dismiss, { once: true });

    return () => {
      media.removeEventListener("ended", dismiss);
      window.removeEventListener("wheel", dismiss);
      window.removeEventListener("touchstart", dismiss);
      window.removeEventListener("pointerdown", dismiss);
      window.removeEventListener("keydown", dismiss);
    };
  }, []);

  return (
    <div
      id="hero-loader"
      ref={root}
      aria-hidden
      className="fixed inset-0 z-[100]"
      /* Solid navy underneath, so the overlay is opaque from the first
         frame rather than showing the page through while the video
         decodes. No poster image, which would be another request. */
      style={{ background: "#16293f" }}
    >
      <video
        ref={video}
        className="h-full w-full object-cover"
        muted
        playsInline
        preload="none"
      />
    </div>
  );
}
