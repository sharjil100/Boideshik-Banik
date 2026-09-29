"use client";

import { useLang, type TKey } from "@/lib/i18n";

/**
 * How we source.
 *
 * Every claim here is already live elsewhere on the page — buying direct,
 * shipping in bulk, clearing customs in-house, holding stock and selling
 * by the carton. This section restates those approved facts as a sequence;
 * it introduces nothing new, because the real process detail (payment
 * terms, collection or delivery) has not been supplied yet.
 */

const NAVY = "#17293f";

const STEPS: { title: TKey; body: TKey }[] = [
  { title: "src.1.title", body: "src.1.body" },
  { title: "src.2.title", body: "src.2.body" },
  { title: "src.3.title", body: "src.3.body" },
  { title: "src.4.title", body: "src.4.body" },
];

export function Sourcing() {
  const { t, lang } = useLang();
  const isBn = lang === "bn";

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

  const kicker = {
    fontSize: "0.7rem",
    letterSpacing: "0.3em",
    fontWeight: 600,
    textTransform: isBn ? ("none" as const) : ("uppercase" as const),
  };

  return (
    <section id="sourcing" className="bg-paper py-20 md:py-28">
      <div className="px-[var(--shell-gutter)]">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-7">
            <p className={isBn ? "bangla" : ""} style={{ ...kicker, color: "#6b7d92" }}>
              {t("src.kicker")}
            </p>
            <h2
              className={`mt-4 ${isBn ? "bangla" : ""}`}
              style={{ ...display("clamp(1.7rem,4vw,3.2rem)"), color: NAVY }}
            >
              {t("src.title")}
            </h2>
          </div>
          <div className="lg:col-span-5 lg:pt-10">
            <p
              className={`max-w-md text-[0.95rem] leading-relaxed ${isBn ? "bangla" : ""}`}
              style={{ color: "#5c6a79" }}
            >
              {t("src.body")}
            </p>
          </div>
        </div>

        <div className="relative mt-14 md:mt-20">
          {/* Connecting rule sits behind the numerals and stops short of the
              last one, so the sequence reads as finished rather than as
              trailing off the edge. */}
          <div
            aria-hidden
            className="absolute left-0 right-[14%] top-7 hidden border-t-2 border-dashed lg:block"
            style={{ borderColor: "#ccd4dd" }}
          />

          <ol className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {STEPS.map((step, i) => {
              const last = i === STEPS.length - 1;
              return (
                <li key={step.title} className="relative">
                  <span
                    className="inline-flex h-14 w-14 items-center justify-center rounded-full text-[0.95rem] font-bold tabular-nums"
                    style={
                      last
                        ? { background: NAVY, color: "#fff" }
                        : { background: "#fff", color: NAVY, boxShadow: "var(--shadow-card)" }
                    }
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <h3
                    className={`mt-6 text-[1.05rem] font-bold leading-snug ${isBn ? "bangla" : ""}`}
                    style={{ color: NAVY }}
                  >
                    {t(step.title)}
                  </h3>
                  <p
                    className={`mt-2.5 max-w-[30ch] text-[0.88rem] leading-relaxed ${isBn ? "bangla" : ""}`}
                    style={{ color: "#64717f" }}
                  >
                    {t(step.body)}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
