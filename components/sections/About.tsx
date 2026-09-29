"use client";

import { CATEGORIES } from "@/lib/catalogue";
import { COMPANY } from "@/lib/company";
import { useLang } from "@/lib/i18n";

/**
 * About.
 *
 * Deliberately short. Everything stated is verified — what the business
 * does, where it works from, what it stocks. No founding year, no
 * headcount, no volume figures, no client count: none of those have been
 * supplied, and they are exactly the claims a wholesale buyer checks.
 */

const NAVY = "#16293f";

export function About() {
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
          letterSpacing: "-0.032em",
          fontSize: size,
        };

  const kicker = {
    fontSize: "0.7rem",
    letterSpacing: "0.3em",
    fontWeight: 600,
    textTransform: isBn ? ("none" as const) : ("uppercase" as const),
  };

  return (
    <section
      id="about"
      className="relative overflow-hidden py-20 md:py-28"
      style={{ background: NAVY }}
    >
      <img
        src="/images/card-port.jpg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 h-full w-[44%] object-cover"
        style={{
          maskImage: "linear-gradient(to right, transparent 0%, #000 50%)",
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, #000 50%)",
        }}
        draggable={false}
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, #16293f 0%, #16293f 46%, rgba(22,41,63,0.78) 70%, rgba(22,41,63,0.5) 100%)",
        }}
      />

      <div className="relative px-[var(--shell-gutter)]">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <p className={isBn ? "bangla" : ""} style={{ ...kicker, color: "rgba(255,255,255,0.6)" }}>
              {t("abt.kicker")}
            </p>
            <h2
              className={`mt-4 ${isBn ? "bangla" : ""}`}
              style={{ ...display("clamp(1.7rem,4vw,3.2rem)"), color: "#fff" }}
            >
              {t("abt.title1")}
              <br />
              {t("abt.title2")}
            </h2>

            <p
              className={`mt-7 max-w-xl text-[1rem] leading-relaxed ${isBn ? "bangla" : ""}`}
              style={{ color: "rgba(255,255,255,0.84)" }}
            >
              {t("abt.p1")}
            </p>
            <p
              className={`mt-4 max-w-xl text-[1rem] leading-relaxed ${isBn ? "bangla" : ""}`}
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              {t("abt.p2")}
            </p>
          </div>

          <div className="lg:col-span-4 lg:col-start-9">
            <p
              className={isBn ? "bangla" : ""}
              style={{ ...kicker, fontSize: "0.62rem", color: "rgba(255,255,255,0.55)" }}
            >
              {t("abt.what")}
            </p>
            <ul className="mt-4 space-y-2.5">
              {CATEGORIES.map((category) => (
                <li key={category.id} className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className="inline-block h-2 w-2 shrink-0"
                    style={{ background: category.color }}
                  />
                  <span
                    className={`text-[0.95rem] ${isBn ? "bangla" : ""}`}
                    style={{ color: "rgba(255,255,255,0.86)" }}
                  >
                    {t(category.labelKey)}
                  </span>
                </li>
              ))}
            </ul>

            <hr className="my-7 border-0 border-t" style={{ borderColor: "rgba(255,255,255,0.16)" }} />

            <p
              className={isBn ? "bangla" : ""}
              style={{ ...kicker, fontSize: "0.62rem", color: "rgba(255,255,255,0.55)" }}
            >
              {t("abt.where")}
            </p>
            <p
              className={`mt-3 text-[1rem] font-semibold ${isBn ? "bangla" : ""}`}
              style={{ color: "#fff" }}
            >
              {COMPANY.address[lang]}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
