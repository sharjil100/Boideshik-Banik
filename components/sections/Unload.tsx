"use client";

import { CATEGORIES } from "@/lib/catalogue";
import { useLang } from "@/lib/i18n";

/**
 * The tonal turn: navy sea → paper manifest.
 *
 * Structured as a bill of lading rather than a card grid. Each category is a
 * line item carrying its own ISO marking, which is what ties this back to
 * the containers in the hero — the crate you hovered up there is the row
 * you land on down here.
 */
export function Unload() {
  const { t, lang } = useLang();
  const isBn = lang === "bn";

  return (
    <section
      id="manifest"
      className="grain relative bg-paper text-ink"
      style={{ ["--grain" as string]: "1" }}
    >
      {/* Torn edge where the paper meets the sea. */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: "color-mix(in srgb, var(--color-ink) 18%, transparent)" }}
      />

      <div className="px-[var(--shell-gutter)] py-24 md:py-36">
        {/* ---- header block, laid out like a form header ---- */}
        <div className="grid gap-10 md:grid-cols-12 md:gap-8">
          <div className="md:col-span-3">
            <p className="manifest-sm text-ink-soft">
              {isBn ? "নথি / ০১" : "DOC / 01"}
            </p>
            <hr className="rule-perf mt-3 text-ink" />
          </div>

          <div className="md:col-span-9">
            <h2
              className={`${
                isBn ? "bangla text-4xl md:text-6xl font-bold" : "display text-5xl md:text-7xl"
              } text-navy-700`}
            >
              {t("unload.title")}
            </h2>
            <p
              className={`mt-7 max-w-2xl text-lg leading-relaxed text-ink-soft ${
                isBn ? "bangla" : ""
              }`}
            >
              {t("unload.body")}
            </p>
          </div>
        </div>

        {/* ---- line items ---- */}
        <div className="mt-20 md:mt-28">
          <div className="manifest-sm hidden grid-cols-12 gap-4 pb-3 text-ink-soft md:grid">
            <span className="col-span-2">{isBn ? "চিহ্ন" : "MARKING"}</span>
            <span className="col-span-5">{isBn ? "বিবরণ" : "DESCRIPTION"}</span>
            <span className="col-span-4">{isBn ? "অন্তর্ভুক্ত" : "INCLUDES"}</span>
            <span className="col-span-1 text-right">{isBn ? "দর" : "QTE"}</span>
          </div>

          <hr className="rule-perf text-ink" />

          {CATEGORIES.map((cat) => (
            <a
              key={cat.id}
              id={`cat-${cat.id}`}
              href="#quote"
              className="group grid scroll-mt-24 grid-cols-12 items-baseline gap-x-4 gap-y-2 border-b border-dashed border-ink/20 py-7 transition-colors hover:bg-ink/[0.035]"
            >
              <span className="col-span-12 flex items-center gap-3 md:col-span-2">
                <span
                  aria-hidden
                  className="inline-block h-3 w-3 shrink-0 transition-transform duration-300 group-hover:scale-125"
                  style={{ background: cat.color }}
                />
                <span className="manifest-sm text-ink-soft">{cat.code}</span>
              </span>

              <span
                className={`col-span-12 text-2xl md:col-span-5 md:text-3xl ${
                  isBn ? "bangla font-semibold" : "display"
                } text-navy-700 transition-colors group-hover:text-navy-600`}
              >
                {t(cat.labelKey)}
              </span>

              <span
                className={`col-span-12 text-ink-soft md:col-span-4 ${
                  isBn ? "bangla" : "manifest"
                }`}
              >
                {t(cat.noteKey)}
              </span>

              <span className="col-span-12 md:col-span-1 md:text-right">
                <span className="manifest-sm text-ink-soft transition-colors group-hover:text-crate-orange">
                  {isBn ? "দর নিন →" : "QUOTE →"}
                </span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
