"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/lib/i18n";

const NAV = [
  { href: "#products", key: "nav.products" },
  { href: "#about", key: "nav.about" },
  { href: "#sourcing", key: "nav.sourcing" },
  // Contact resolves to the quotation block, which carries the phone,
  // email and address — a separate contact page would duplicate it.
  { href: "#quote", key: "nav.contact" },
] as const;

export function SiteHeader() {
  const { t, lang, toggle } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>("#products");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 transition-colors duration-500"
      style={{
        background: scrolled
          ? "color-mix(in srgb, #24323f 82%, transparent)"
          : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
      }}
    >
      <div className="flex items-center justify-between gap-4 px-[var(--shell-gutter)] py-5">
        {/* ---- mark ---- */}
        <a href="#top" className="shrink-0">
          {/* Reversed variant, header only.
              The header is transparent over the hero, and the hero carries
              a rgba(9,26,47,0.62) scrim across its top so the white
              headline reads. That scrim is exactly what buries a navy
              mark. Structure goes to paper white; the container livery and
              the Bangladesh map keep their own colours. Everywhere on a
              light ground — the white card, the footer — uses logo.webp. */}
          <img
            src="/images/logo-reversed.webp"
            alt="বৈদেশিক বণিক — Boideshik Banik"
            width={128}
            height={64}
            className="h-12 w-auto sm:h-16"
          />
        </a>

        {/* ---- pill nav ---- */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item, i) => {
            const isActive = active === item.href;
            return (
              <span key={item.href} className="flex items-center">
                <a
                  href={item.href}
                  onClick={() => setActive(item.href)}
                  className="rounded-full px-4 py-2 text-[0.9rem] transition-colors"
                  style={
                    isActive
                      ? { background: "rgba(20,30,40,0.55)", color: "var(--color-paper)" }
                      : { color: "rgba(244,241,234,0.72)" }
                  }
                >
                  {isActive && (
                    <span aria-hidden className="mr-1.5 text-crate-orange">
                      •
                    </span>
                  )}
                  {t(item.key)}
                </a>
                {i < NAV.length - 1 && (
                  <span aria-hidden className="px-1 text-paper/30">
                    ·
                  </span>
                )}
              </span>
            );
          })}
        </nav>

        {/* ---- actions ---- */}
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={toggle}
            aria-label={
              lang === "en" ? "ভাষা পরিবর্তন করুন" : "Switch language to English"
            }
            className="rounded-full border border-paper/30 px-3.5 py-2 text-[0.8rem] text-paper/80 transition-colors hover:border-paper/70 hover:text-paper"
          >
            {t("lang.switch")}
          </button>

          <a
            href="#quote"
            className="rounded-full bg-paper px-5 py-2.5 text-[0.9rem] font-medium text-[#1b2733] transition-colors hover:bg-crate-orange"
          >
            {t("nav.quote")}
          </a>
        </div>
      </div>
    </header>
  );
}
