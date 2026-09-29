"use client";

import { useEffect, useState } from "react";

/**
 * next/font hashes its family names at build time, so the only reliable way
 * to get a usable `ctx.font` string is to ask the browser what a CSS custom
 * property actually resolved to.
 */
export function useResolvedFont(cssVar: string, fallback: string): string {
  const [family, setFamily] = useState(fallback);

  useEffect(() => {
    const probe = document.createElement("span");
    probe.style.cssText = `position:absolute;visibility:hidden;font-family:var(${cssVar})`;
    document.body.appendChild(probe);
    const resolved = getComputedStyle(probe).fontFamily;
    document.body.removeChild(probe);
    if (resolved) setFamily(resolved);
  }, [cssVar]);

  return family;
}
