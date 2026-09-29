"use client";

import type { ReactNode } from "react";
import { useLang, type TKey } from "@/lib/i18n";

/**
 * The white card that overlaps the foot of the hero.
 *
 * Icons are drawn inline rather than generated or pulled from a set:
 * three glyphs at one stroke weight, sized to the type around them, and
 * they recolour with the theme. A generated icon arrives as a raster at
 * whatever weight the model felt like and goes soft next to live text.
 */

const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden {...STROKE}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      {/* The two meridians read as curvature without needing a full wire globe. */}
      <path d="M12 3c2.5 2.5 3.8 5.6 3.8 9S14.5 18.5 12 21c-2.5-2.5-3.8-5.6-3.8-9S9.5 5.5 12 3Z" />
    </svg>
  );
}

function ShipIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden {...STROKE}>
      {/* Hull, tapering as a loaded vessel sits low in the water. */}
      <path d="M2.8 15.4h18.4l-2 4.4H4.8z" />
      {/* Superstructure aft, container stack forward, mast. */}
      <path d="M5.6 15.4V10.6h4.6v4.8" />
      <path d="M10.2 15.4v-3.2h7.2v3.2" />
      <path d="M7.9 10.6V7.6" />
    </svg>
  );
}

function CartonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden {...STROKE}>
      {/* Export carton: body, lid band, and the tape seam down the front. */}
      <rect x="3.2" y="8.4" width="17.6" height="11.4" rx="1" />
      <rect x="2.4" y="4.6" width="19.2" height="3.8" rx="0.9" />
      <path d="M12 8.4v3.4" />
    </svg>
  );
}

const FEATURES: { icon: ReactNode; title: TKey; body: TKey }[] = [
  { icon: <GlobeIcon />, title: "svc.1.title", body: "svc.1.body" },
  { icon: <ShipIcon />, title: "svc.2.title", body: "svc.2.body" },
  { icon: <CartonIcon />, title: "svc.3.title", body: "svc.3.body" },
];

export function Services() {
  const { t, lang } = useLang();
  const isBn = lang === "bn";

  return (
    <section
      id="why"
      /* A slight lift over the foot of the hero keeps the two reading as one
         composition rather than stacked bands — but only slight. At -80px
         the card's top edge cut straight through the ship's hull and
         waterline, so it now overlaps by just enough to tuck under the
         vessel without clipping it. */
      className="elev-panel relative z-20 mt-0 rounded-[28px] bg-white px-6 py-12 md:-mt-8 md:px-12 md:py-16"
      style={{
        marginLeft: "var(--shell-gutter)",
        marginRight: "var(--shell-gutter)",
              }}
    >
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
        {/* ---- heading ---- */}
        <div className="lg:col-span-5">
          <h2
            className={isBn ? "bangla font-bold" : undefined}
            style={{
              color: "#111c28",
              fontFamily: isBn ? undefined : "var(--font-archivo)",
              fontVariationSettings: isBn ? undefined : '"wdth" 100',
              fontWeight: 700,
              fontSize: isBn ? "clamp(1.4rem,2.6vw,2rem)" : "clamp(1.55rem,2.9vw,2.35rem)",
              lineHeight: isBn ? 1.3 : 1.12,
              letterSpacing: isBn ? "-0.01em" : "-0.028em",
            }}
          >
            {t("svc.title1")}
            <br />
            {t("svc.title2")}
          </h2>

          <p
            className={`mt-5 max-w-md text-[0.95rem] leading-relaxed ${isBn ? "bangla" : ""}`}
            style={{ color: "#5a6675" }}
          >
            {t("svc.body")}
          </p>
        </div>

        {/* ---- feature list ---- */}
        <div className="lg:col-span-3">
          <div className="h-full rounded-[18px] bg-[#eef4fa] p-6">
            <ul className="space-y-6">
              {FEATURES.map((f) => (
                <li key={f.title} className="flex gap-4">
                  <span className="mt-0.5 shrink-0" style={{ color: "#2c4a6b" }}>
                    {f.icon}
                  </span>
                  <div>
                    <h3
                      className={`text-[0.92rem] font-semibold ${isBn ? "bangla" : ""}`}
                      style={{ color: "#152231" }}
                    >
                      {t(f.title)}
                    </h3>
                    <p
                      className={`mt-1 text-[0.82rem] leading-snug ${isBn ? "bangla" : ""}`}
                      style={{ color: "#64717f" }}
                    >
                      {t(f.body)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ---- photograph ---- */}
        <div className="lg:col-span-4">
          <img
            src="/images/card-port.jpg"
            alt="Stacked containers awaiting collection at a terminal"
            className="elev-panel h-full min-h-[220px] w-full rounded-[18px] object-cover"
            draggable={false}
          />
        </div>
      </div>
    </section>
  );
}
