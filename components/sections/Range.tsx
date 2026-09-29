"use client";

import { useLang, type TKey } from "@/lib/i18n";

/**
 * Product range.
 *
 * One tall navy feature card beside a 2x2 grid of white cards.
 *
 * Every card gives its product the same image box — fixed position, fixed
 * bounds, object-contain. Positioning each cut-out by hand looked fine for
 * whichever one was tuned last and clipped the rest, because the cards
 * clip their overflow; a shared box cannot clip, and it is what makes four
 * very differently-shaped products read as one set.
 *
 * The reference marked each card with a SKU count. Those are left out
 * deliberately — no verified counts exist, and an invented "32 SKUS" is
 * exactly the kind of detail a wholesale buyer checks. The slot instead
 * carries a true descriptor drawn from the actual range.
 */

type Card = {
  kicker: TKey;
  title: TKey;
  note: TKey;
  image: string;
  alt: string;
  /**
   * Fine scale within the shared image box. The box handles containment and
   * alignment; this only evens out optical weight, since a wide fan and a
   * squat charger fill a box very differently at the same nominal size.
   */
  scale: number;
};

const CARDS: Card[] = [
  {
    kicker: "rng.fan.kicker",
    title: "rng.fan.title",
    note: "rng.fan.note",
    image: "/products/ceiling-fan.webp",
    alt: "Ceiling fan",
    scale: 1.12,
  },
  {
    kicker: "rng.led.kicker",
    title: "rng.led.title",
    note: "rng.led.note",
    image: "/products/led-round-light.webp",
    alt: "Round LED panel",
    scale: 1.02,
  },
  {
    kicker: "rng.chg.kicker",
    title: "rng.chg.title",
    note: "rng.chg.note",
    image: "/products/charger-1.webp",
    alt: "GaN fast charger",
    scale: 0.82,
  },
  {
    kicker: "rng.pwr.kicker",
    title: "rng.pwr.title",
    note: "rng.pwr.note",
    image: "/products/multiplug.webp",
    alt: "Six-way extension socket",
    scale: 1.06,
  },
];

const NAVY = "#17293f";

function ArrowButton({ light = false }: { light?: boolean }) {
  return (
    <span
      aria-hidden
      className="inline-flex h-10 w-10 items-center justify-center rounded-full transition-transform duration-300 group-hover:translate-x-1"
      style={{
        background: light ? "rgba(255,255,255,0.14)" : "#f1ece3",
        color: light ? "#fff" : NAVY,
      }}
    >
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12h15" />
        <path d="m13 6 6 6-6 6" />
      </svg>
    </span>
  );
}

export function Range() {
  const { t, lang } = useLang();
  const isBn = lang === "bn";

  /* Bangla sets much taller than uppercase Latin and has no case, so the
     display treatment has to differ rather than just swapping the string. */
  const display = (size: string) =>
    isBn
      ? { fontWeight: 700, lineHeight: 1.25, letterSpacing: "-0.01em", fontSize: size }
      : {
          fontFamily: "var(--font-archivo)",
          fontVariationSettings: '"wdth" 100',
          fontWeight: 800,
          textTransform: "uppercase" as const,
          lineHeight: 0.94,
          letterSpacing: "-0.03em",
          fontSize: size,
        };

  const kicker = {
    fontSize: "0.7rem",
    letterSpacing: "0.26em",
    fontWeight: 600,
    textTransform: isBn ? ("none" as const) : ("uppercase" as const),
  };

  return (
    <section id="products" className="bg-paper py-20 md:py-28">
      <div className="px-[var(--shell-gutter)]">
        {/* ---------- header ---------- */}
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-7">
            <p className={isBn ? "bangla" : ""} style={{ ...kicker, color: "#6b7d92" }}>
              {t("rng.kicker")}
            </p>
            <h2
              className={`mt-4 ${isBn ? "bangla" : ""}`}
              style={{ ...display("clamp(1.9rem,4.6vw,3.7rem)"), color: NAVY }}
            >
              {t("rng.h1")}
              <br />
              {t("rng.h2")}
            </h2>
          </div>

          <div className="lg:col-span-5 lg:pt-10">
            <p
              className={`max-w-md text-[0.95rem] leading-relaxed ${isBn ? "bangla" : ""}`}
              style={{ color: "#5c6a79" }}
            >
              {t("rng.body")}
            </p>
            <a
              href="#quote"
              className="group mt-6 inline-flex items-center gap-8 border-b pb-1.5 transition-colors"
              style={{ borderColor: "#b9c2cc", color: NAVY }}
            >
              <span className="text-[0.92rem]">{t("rng.viewall")}</span>
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:translate-x-1">
                <path d="M4 12h15" />
                <path d="m13 6 6 6-6 6" />
              </svg>
            </a>
          </div>
        </div>

        {/* ---------- cards ---------- */}
        <div className="mt-12 grid gap-5 lg:grid-cols-12 md:mt-16">
          {/* feature */}
          <a
            href="#quote"
            className="elev-feature group relative col-span-full overflow-hidden rounded-[24px] p-8 md:p-10 lg:col-span-5"
            style={{
              background: "linear-gradient(152deg, #16283d 0%, #22405f 100%)",
              minHeight: "clamp(420px, 46vw, 560px)",
            }}
          >

            {/* Two plates, overlapped and tilted, so the card reads as a
                range rather than a single item — inside one box anchored to
                the lower right, clear of the heading. */}
            <div className="pointer-events-none absolute bottom-[6%] right-[4%] w-[46%] md:w-[44%]">
              <img
                src="/products/1-gang.webp"
                alt=""
                aria-hidden
                className="absolute bottom-[26%] right-[14%] w-[82%] select-none"
                style={{ transform: "rotate(-7deg)", filter: "var(--shadow-product-strong)" }}
                draggable={false}
              />
              <img
                src="/products/3-gang.webp"
                alt="Glass touch wall switches"
                className="relative w-full select-none"
                style={{ transform: "rotate(-5deg)", filter: "var(--shadow-product-strong)" }}
                draggable={false}
              />
            </div>

            <div className="relative flex h-full w-[58%] flex-col">
              <p className={isBn ? "bangla" : ""} style={{ ...kicker, color: "rgba(255,255,255,0.62)" }}>
                {t("rng.feat.kicker")}
              </p>

              <h3
                className={`mt-6 max-w-[9ch] ${isBn ? "bangla" : ""}`}
                style={{ ...display("clamp(1.5rem,2.9vw,2.3rem)"), color: "#fff" }}
              >
                {t("rng.feat.title")}
              </h3>

              <span aria-hidden className="mt-6 block h-px w-10" style={{ background: "rgba(255,255,255,0.4)" }} />

              <p
                className={`mt-5 max-w-[26ch] text-[0.86rem] leading-relaxed ${isBn ? "bangla" : ""}`}
                style={{ color: "rgba(255,255,255,0.7)" }}
              >
                {t("rng.feat.body")}
              </p>

              <span className="mt-8 inline-flex w-fit items-center gap-3 rounded-full bg-white px-6 py-3 text-[0.88rem] font-medium" style={{ color: NAVY }}>
                {t("rng.feat.cta")}
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:translate-x-1">
                  <path d="M4 12h15" />
                  <path d="m13 6 6 6-6 6" />
                </svg>
              </span>

              <p className={`mt-auto pt-10 ${isBn ? "bangla" : ""}`} style={{ ...kicker, color: "rgba(255,255,255,0.75)" }}>
                {t("rng.feat.note")}
              </p>
            </div>
          </a>

          {/* 2x2 */}
          <div className="col-span-full grid gap-5 sm:grid-cols-2 lg:col-span-7">
            {CARDS.map((card) => (
              <a
                key={card.title}
                href="#quote"
                className="elev-card group relative overflow-hidden rounded-[20px] bg-white p-6 md:p-7"
                style={{ minHeight: "clamp(210px, 22vw, 268px)" }}
              >
                {/* Shared image box: same position, same bounds, every
                    card. object-contain inside a fixed area is what keeps
                    the four products reading as one set — and it cannot
                    clip, which the old negative offsets did. */}
                <div className="pointer-events-none absolute inset-y-0 right-0 flex w-[50%] items-center justify-center p-4">
                  <img
                    src={card.image}
                    alt={card.alt}
                    className="elev-product max-h-full max-w-full select-none object-contain transition-transform duration-500 group-hover:scale-[1.05]"
                    style={{ transform: `scale(${card.scale})` }}
                    draggable={false}
                  />
                </div>

                {/* Width-capped so copy never runs under the product. */}
                <div className="relative flex h-full w-[52%] flex-col">
                  <p className={isBn ? "bangla" : ""} style={{ ...kicker, fontSize: "0.62rem", color: "#93a0ad" }}>
                    {t(card.kicker)}
                  </p>
                  <h3
                    className={`mt-3 ${isBn ? "bangla" : ""}`}
                    style={{ ...display("clamp(1.1rem,1.8vw,1.55rem)"), color: NAVY }}
                  >
                    {t(card.title)}
                  </h3>
                  <p className={`mt-4 ${isBn ? "bangla" : ""}`} style={{ ...kicker, fontSize: "0.6rem", color: "#9aa6b2" }}>
                    {t(card.note)}
                  </p>
                  <span className="mt-auto pt-6">
                    <ArrowButton />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
