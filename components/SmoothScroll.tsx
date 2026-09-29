"use client";

import { useEffect, type ReactNode } from "react";
import Lenis from "lenis";

/**
 * Scroll behaviour for the whole page.
 *
 * Three jobs:
 *
 *   1. Smooth the wheel, so scroll-linked work advances on one clock.
 *      Skipped under prefers-reduced-motion, which is exactly what that
 *      setting is asking for.
 *   2. Drive in-page anchors. Lenis takes the scroll position over, so a
 *      native hash jump fights it and lands in the wrong place; anchor
 *      clicks are intercepted and handed to Lenis instead, offset by the
 *      fixed header's height.
 *   3. Start at the top. A reload should open on the hero, so scroll
 *      restoration is turned off and any hash is cleared before paint.
 */

/** Clearance for the fixed header when scrolling a section into view. */
const HEADER_OFFSET = -104;

export function SmoothScroll({ children }: { children: ReactNode }) {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis: Lenis | null = null;
    let frame = 0;

    if (!reduce.matches) {
      lenis = new Lenis({
        duration: 1.1,
        easing: (x) => 1 - Math.pow(1 - x, 3),
        smoothWheel: true,
        // Touch devices already have good native momentum; overriding it
        // feels laggy on mid-range Android, which is most of this audience.
        syncTouch: false,
      });

      const raf = (time: number) => {
        lenis!.raf(time);
        frame = requestAnimationFrame(raf);
      };
      frame = requestAnimationFrame(raf);
    }

    /* ---- in-page anchors ---- */
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = (event.target as Element | null)?.closest?.(
        'a[href^="#"]',
      ) as HTMLAnchorElement | null;
      if (!anchor) return;

      const id = anchor.getAttribute("href")?.slice(1);
      if (!id) return;

      const target = document.getElementById(id);
      if (!target) return;

      event.preventDefault();

      if (lenis) {
        lenis.scrollTo(target, { offset: HEADER_OFFSET, duration: 1.15 });
      } else {
        // Reduced-motion path: jump, but still clear the header.
        const top =
          target.getBoundingClientRect().top + window.scrollY + HEADER_OFFSET;
        window.scrollTo({ top, behavior: "auto" });
      }

      // The hash is deliberately not written to the URL. Leaving it out is
      // what makes a reload land on the hero rather than back on whichever
      // section was last clicked.
    };

    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      if (frame) cancelAnimationFrame(frame);
      lenis?.destroy();
    };
  }, []);

  return <>{children}</>;
}
