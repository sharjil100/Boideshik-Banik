"use client";

import { CATEGORIES } from "@/lib/catalogue";
import { COMPANY, mailtoLink, telLink, whatsappLink } from "@/lib/company";
import { useLang, type TKey } from "@/lib/i18n";

/**
 * Site footer.
 *
 * The reference carried placeholder contact details, a set of product
 * categories that are not the ones stocked, four social accounts, and two
 * legal links. Only what actually exists is rendered here — real phone,
 * real email, real address, the five real categories, and WhatsApp, which
 * is the one channel whose address is known.
 */

const NAVY = "#16293f";

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.3 3.5h3l1.5 3.8-2 1.3a12 12 0 0 0 5.6 5.6l1.3-2 3.8 1.5v3a1.8 1.8 0 0 1-2 1.8A15.6 15.6 0 0 1 4.5 5.5a1.8 1.8 0 0 1 1.8-2Z" />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2.2" />
      <path d="m3.6 6.6 8.4 6 8.4-6" />
    </svg>
  );
}
function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.6" />
    </svg>
  );
}
function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" width="19" height="19" fill="currentColor" aria-hidden>
      <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2Zm0 1.9a8.1 8.1 0 1 1-4.1 15.1l-.3-.2-2.8.8.8-2.8-.2-.3A8.1 8.1 0 0 1 12 3.9Zm-2.5 4c-.2 0-.5 0-.7.4-.2.4-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.7 2.7 4.2 3.7 2.1.8 2.5.7 3 .6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.6-.3-1.5-.7c-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.1-.2 0-.4.1-.5l.4-.5.3-.5v-.5l-.7-1.6c-.2-.4-.4-.4-.5-.4h-.4Z" />
    </svg>
  );
}

const QUICK: { href: string; key: TKey }[] = [
  { href: "#top", key: "ft.home" },
  { href: "#products", key: "nav.products" },
  { href: "#about", key: "nav.about" },
  { href: "#quote", key: "ft.quote" },
];

export function SiteFooter() {
  const { t, lang } = useLang();
  const isBn = lang === "bn";

  const heading = {
    fontSize: "0.68rem",
    letterSpacing: "0.3em",
    fontWeight: 600,
    textTransform: isBn ? ("none" as const) : ("uppercase" as const),
    color: "rgba(255,255,255,0.62)",
  };

  const link =
    "block py-2 text-[0.95rem] text-[rgba(255,255,255,0.78)] transition-colors hover:text-white";

  const contact = [
    { icon: <PhoneIcon />, label: "ft.phone" as TKey, value: COMPANY.phone.display, href: telLink },
    { icon: <MailIcon />, label: "ft.email" as TKey, value: COMPANY.email, href: mailtoLink },
    { icon: <PinIcon />, label: "ft.address" as TKey, value: COMPANY.address[lang], href: undefined },
  ];

  return (
    <footer className="relative overflow-hidden" style={{ background: NAVY }}>
      {/* Photograph bleeds in from the lower left and dissolves into the
          navy before it reaches the columns.

          Anchored to the bottom at 72% height rather than filling the
          footer: at full height the ship's containers and cranes rode up
          into the top-left corner and collided with the mark. Cropping
          from the bottom keeps the hull and the water and discards the
          sky, which is the part that was in the way. The top edge is
          masked off so it fades rather than ending on a line. */}
      <img
        src="/images/footer-port.webp"
        alt=""
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 h-[72%] w-[58%] object-cover"
        style={{
          objectPosition: "left bottom",
          maskImage: "linear-gradient(to bottom, transparent 0%, #000 26%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 26%)",
        }}
        draggable={false}
      />
      {/* Light touch. The photograph stays legible as a photograph; only
          the column side is taken to solid navy so the links have a clean
          ground. Readability over the image is handled with text shadow on
          the few lines that sit there, rather than by dimming the whole
          picture to suit one paragraph. */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(22,41,63,0.34) 0%, rgba(22,41,63,0.50) 24%, rgba(22,41,63,0.88) 44%, #16293f 58%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-40"
        style={{
          background:
            "linear-gradient(180deg, rgba(22,41,63,0) 0%, rgba(22,41,63,0.62) 100%)",
        }}
      />

      <div className="relative px-[var(--shell-gutter)] pb-8 pt-14 md:pt-16">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          {/* ---- mark ---- */}
          <div className="lg:col-span-4">
            <img
              src="/images/logo-reversed.webp"
              alt="বৈদেশিক বণিক — Boideshik Banik"
              width={248}
              height={124}
              className="-mt-2 h-24 w-auto md:-mt-4 md:h-32"
            />
            <div className="mt-7 flex items-start gap-4">
              <span aria-hidden className="mt-3 block h-px w-8 shrink-0" style={{ background: "var(--color-crate-orange)" }} />
              <p
                className={`max-w-xs text-[0.95rem] leading-relaxed ${isBn ? "bangla" : ""}`}
                style={{
                  color: "rgba(255,255,255,0.88)",
                  textShadow: "0 1px 14px rgba(8,20,36,0.9)",
                }}
              >
                {t("ft.tagline")}
              </p>
            </div>
          </div>

          {/* ---- quick links ---- */}
          <nav className="lg:col-span-2">
            <p className={isBn ? "bangla" : ""} style={heading}>{t("ft.quick")}</p>
            <span aria-hidden className="mt-3 block h-0.5 w-7" style={{ background: "var(--color-crate-orange)" }} />
            <ul className="mt-5">
              {QUICK.map((item) => (
                <li key={item.key}>
                  <a href={item.href} className={`${link} ${isBn ? "bangla" : ""}`}>
                    {t(item.key)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* ---- categories ---- */}
          <nav className="lg:col-span-3">
            <p className={isBn ? "bangla" : ""} style={heading}>{t("ft.cats")}</p>
            <span aria-hidden className="mt-3 block h-0.5 w-7" style={{ background: "var(--color-crate-orange)" }} />
            <ul className="mt-5">
              {CATEGORIES.map((category) => (
                <li key={category.id}>
                  <a href="#products" className={`${link} ${isBn ? "bangla" : ""}`}>
                    {t(category.labelKey)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* ---- contact ---- */}
          <div className="lg:col-span-3 lg:border-l lg:pl-8" style={{ borderColor: "rgba(255,255,255,0.14)" }}>
            <p className={isBn ? "bangla" : ""} style={heading}>{t("q.touch")}</p>
            <span aria-hidden className="mt-3 block h-0.5 w-7" style={{ background: "var(--color-crate-orange)" }} />

            <ul className="mt-6 space-y-5">
              {contact.map((row) => (
                <li key={row.label} className="flex items-start gap-4">
                  <span
                    className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
                    style={{ background: "rgba(255,255,255,0.1)" }}
                  >
                    {row.icon}
                  </span>
                  <div>
                    <p className={`text-[0.78rem] ${isBn ? "bangla" : ""}`} style={{ color: "rgba(255,255,255,0.55)" }}>
                      {t(row.label)}
                    </p>
                    {row.href ? (
                      <a
                        href={row.href}
                        className={`mt-0.5 block font-semibold text-white transition-colors hover:text-crate-orange ${isBn ? "bangla" : ""}`}
                      >
                        {row.value}
                      </a>
                    ) : (
                      <p className={`mt-0.5 font-semibold text-white ${isBn ? "bangla" : ""}`}>{row.value}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {/* Only the channel whose address is actually known. */}
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={t("ft.whatsapp")}
              className="mt-7 inline-flex h-12 w-12 items-center justify-center rounded-full border text-white transition-colors hover:border-white hover:bg-white/10"
              style={{ borderColor: "rgba(255,255,255,0.3)" }}
            >
              <WhatsAppIcon />
            </a>
          </div>
        </div>

        {/* ---- base ---- */}
        <hr className="mt-14 border-0 border-t" style={{ borderColor: "rgba(255,255,255,0.14)" }} />
        <div className="flex flex-wrap items-center justify-between gap-3 pt-6">
          <p className={`text-[0.85rem] ${isBn ? "bangla" : ""}`} style={{ color: "rgba(255,255,255,0.55)" }}>
            © {new Date().getFullYear()} {COMPANY.name[lang]}. {t("ft.rights")}
          </p>
          <p
            className={`text-[0.85rem] ${isBn ? "bangla" : ""}`}
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            {t("ft.credit")}
          </p>
        </div>
      </div>
    </footer>
  );
}
