"use client";

import { useState, type FormEvent } from "react";
import { CATEGORIES } from "@/lib/catalogue";
import { COMPANY, mailtoLink, telLink, whatsappLink } from "@/lib/company";
import { useLang, type TKey } from "@/lib/i18n";

/**
 * Quotation request.
 *
 * There is no backend. The two buttons are two real channels rather than
 * one button and a decorative alternative: the form assembles what the
 * buyer typed into a formatted enquiry, then hands it either to WhatsApp
 * or to their mail client. Nothing is stored, nothing needs an API key,
 * and it works the moment the site is deployed — which matters more than
 * a submissions dashboard nobody has asked for yet.
 *
 * Contact details come from lib/company.ts. The reference mockup carried
 * placeholder ones — a different phone, an info@ address and a Chittagong
 * street — and none of that is repeated here.
 */

const NAVY = "#16293f";

/** Swap for any image in /public/images. */
const PANEL_IMAGE = "/images/card-port.jpg";

type Fields = {
  name: string;
  business: string;
  phone: string;
  category: string;
  quantity: string;
  message: string;
};

const EMPTY: Fields = {
  name: "",
  business: "",
  phone: "",
  category: "",
  quantity: "",
  message: "",
};

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="3.6" />
      <path d="M4.8 20c.9-3.6 3.8-5.6 7.2-5.6s6.3 2 7.2 5.6" />
    </svg>
  );
}
function BuildingIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20V5.4A1.4 1.4 0 0 1 5.4 4h6.2A1.4 1.4 0 0 1 13 5.4V20" />
      <path d="M13 10h5.6A1.4 1.4 0 0 1 20 11.4V20" />
      <path d="M3 20h18M7 8h2M7 12h2M7 16h2M16 14h1.6M16 17h1.6" />
    </svg>
  );
}
function PhoneIcon({ size = 17 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.3 3.5h3l1.5 3.8-2 1.3a12 12 0 0 0 5.6 5.6l1.3-2 3.8 1.5v3a1.8 1.8 0 0 1-2 1.8A15.6 15.6 0 0 1 4.5 5.5a1.8 1.8 0 0 1 1.8-2Z" />
    </svg>
  );
}
function BoxIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3 4 7v10l8 4 8-4V7Z" />
      <path d="m4 7 8 4 8-4M12 11v10" />
    </svg>
  );
}
function ListIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4.5" y="3.5" width="15" height="17" rx="2" />
      <path d="M8.5 8.5h7M8.5 12h7M8.5 15.5h4" />
    </svg>
  );
}
function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 14.5a2.5 2.5 0 0 1-2.5 2.5H8l-4 3.5V6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5Z" />
    </svg>
  );
}
function MailIcon({ size = 17 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2.2" />
      <path d="m3.6 6.6 8.4 6 8.4-6" />
    </svg>
  );
}
function PinIcon({ size = 17 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.6" />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
      <path d="M8.2 10.5V7.8a3.8 3.8 0 0 1 7.6 0v2.7" />
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

export function Quote() {
  const { t, lang } = useLang();
  const isBn = lang === "bn";
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [showErrors, setShowErrors] = useState(false);

  const set = (key: keyof Fields) => (e: { target: { value: string } }) =>
    setFields((f) => ({ ...f, [key]: e.target.value }));

  const missing = (["name", "business", "phone", "category", "quantity"] as const).filter(
    (k) => !fields[k].trim(),
  );

  /** One enquiry, formatted once, sent down whichever channel they pick. */
  const compose = () => {
    const category = CATEGORIES.find((c) => c.id === fields.category);
    const lines = [
      `${t("q.subject")} — ${COMPANY.name.en}`,
      "",
      `${t("q.name")}: ${fields.name}`,
      `${t("q.business")}: ${fields.business}`,
      `${t("q.phone")}: ${fields.phone}`,
      `${t("q.category")}: ${category ? t(category.labelKey) : fields.category}`,
      `${t("q.quantity")}: ${fields.quantity}`,
    ];
    if (fields.message.trim()) lines.push("", fields.message.trim());
    return lines.join("\n");
  };

  const send = (channel: "whatsapp" | "email") => {
    if (missing.length) {
      setShowErrors(true);
      return;
    }
    const body = compose();
    if (channel === "whatsapp") {
      window.open(whatsappLink(body), "_blank", "noopener");
    } else {
      window.location.href = `${mailtoLink}?subject=${encodeURIComponent(
        `${t("q.subject")} — ${fields.business}`,
      )}&body=${encodeURIComponent(body)}`;
    }
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    send("email");
  };

  const display = (size: string) =>
    isBn
      ? { fontWeight: 700, lineHeight: 1.22, letterSpacing: "-0.01em", fontSize: size }
      : {
          fontFamily: "var(--font-archivo)",
          fontVariationSettings: '"wdth" 100',
          fontWeight: 800,
          textTransform: "uppercase" as const,
          lineHeight: 0.92,
          letterSpacing: "-0.032em",
          fontSize: size,
        };

  const kicker = {
    fontSize: "0.7rem",
    letterSpacing: "0.3em",
    fontWeight: 600,
    textTransform: isBn ? ("none" as const) : ("uppercase" as const),
  };

  const invalid = (key: keyof Fields) =>
    showErrors && !fields[key].trim() && key !== "message";

  const fieldShell = (key: keyof Fields) =>
    `flex items-center gap-3 rounded-xl border px-4 transition-colors ${
      invalid(key) ? "border-[#d6252b]" : "border-[#e0dcd3] focus-within:border-[#16293f]"
    }`;

  const inputBase =
    "w-full bg-transparent py-3.5 text-[0.95rem] outline-none placeholder:text-[#9aa3ad]";

  return (
    <section id="quote" className="bg-paper py-20 md:py-28">
      <div className="grid gap-6 px-[var(--shell-gutter)] lg:grid-cols-12">
        {/* ---------------- form ---------------- */}
        <div className="rounded-[26px] bg-[#faf8f4] p-7 md:p-11 lg:col-span-7">
          <p className={isBn ? "bangla" : ""} style={{ ...kicker, color: "#6b7d92" }}>
            {t("q.kicker")}
          </p>
          <h2
            className={`mt-4 ${isBn ? "bangla" : ""}`}
            style={{ ...display("clamp(1.7rem,3.8vw,3.1rem)"), color: NAVY }}
          >
            {t("q.h1")}
            <br />
            {t("q.h2")}
          </h2>
          <p
            className={`mt-5 max-w-lg text-[0.95rem] leading-relaxed ${isBn ? "bangla" : ""}`}
            style={{ color: "#5c6a79" }}
          >
            {t("q.body")}
          </p>

          <form onSubmit={onSubmit} noValidate className="mt-9">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className={fieldShell("name")}>
                <span style={{ color: "#8b95a0" }}><PersonIcon /></span>
                <input
                  className={inputBase}
                  value={fields.name}
                  onChange={set("name")}
                  placeholder={`${t("q.name")} *`}
                  aria-label={t("q.name")}
                  autoComplete="name"
                />
              </label>

              <label className={fieldShell("business")}>
                <span style={{ color: "#8b95a0" }}><BuildingIcon /></span>
                <input
                  className={inputBase}
                  value={fields.business}
                  onChange={set("business")}
                  placeholder={`${t("q.business")} *`}
                  aria-label={t("q.business")}
                  autoComplete="organization"
                />
              </label>

              <label className={fieldShell("phone")}>
                <span style={{ color: "#8b95a0" }}><PhoneIcon /></span>
                <input
                  className={inputBase}
                  value={fields.phone}
                  onChange={set("phone")}
                  placeholder={`${t("q.phone")} *`}
                  aria-label={t("q.phone")}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                />
              </label>

              <label className={`${fieldShell("category")} relative`}>
                <span style={{ color: "#8b95a0" }}><BoxIcon /></span>
                <select
                  className={`${inputBase} appearance-none pr-6`}
                  value={fields.category}
                  onChange={set("category")}
                  aria-label={t("q.category")}
                  style={{ color: fields.category ? NAVY : "#9aa3ad" }}
                >
                  <option value="">{`${t("q.category")} *`}</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id} style={{ color: NAVY }}>
                      {t(c.labelKey)}
                    </option>
                  ))}
                </select>
                <span className="pointer-events-none absolute right-4" style={{ color: "#8b95a0" }}>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </span>
              </label>

              <label className={`${fieldShell("quantity")} sm:col-span-1`}>
                <span style={{ color: "#8b95a0" }}><ListIcon /></span>
                <input
                  className={inputBase}
                  value={fields.quantity}
                  onChange={set("quantity")}
                  placeholder={`${t("q.quantity")} *`}
                  aria-label={t("q.quantity")}
                  inputMode="numeric"
                />
              </label>
            </div>

            <label
              className={`mt-4 flex gap-3 rounded-xl border px-4 py-3.5 transition-colors ${
                "border-[#e0dcd3] focus-within:border-[#16293f]"
              }`}
            >
              <span className="mt-1" style={{ color: "#8b95a0" }}><ChatIcon /></span>
              <textarea
                className={`${inputBase} min-h-[110px] resize-y py-0`}
                value={fields.message}
                onChange={set("message")}
                placeholder={t("q.message")}
                aria-label={t("q.message")}
              />
            </label>

            {showErrors && missing.length > 0 && (
              <p role="alert" className={`mt-4 text-[0.85rem] ${isBn ? "bangla" : ""}`} style={{ color: "#d6252b" }}>
                {t("q.required")}
              </p>
            )}

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                className={`inline-flex flex-1 items-center justify-center gap-3 rounded-xl px-7 py-4 text-[0.95rem] font-semibold text-white transition-transform hover:scale-[1.01] ${isBn ? "bangla" : ""}`}
                style={{ background: NAVY }}
              >
                {t("q.submit")}
                <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12h15" />
                  <path d="m13 6 6 6-6 6" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => send("whatsapp")}
                className={`inline-flex flex-1 items-center justify-center gap-3 rounded-xl border-2 px-7 py-4 text-[0.95rem] font-semibold transition-colors hover:bg-[#f0faf3] ${isBn ? "bangla" : ""}`}
                style={{ borderColor: "#1f7a45", color: "#1f7a45" }}
              >
                <WhatsAppIcon />
                {t("q.whatsapp")}
              </button>
            </div>

            <p className={`mt-5 flex items-center gap-2 text-[0.8rem] ${isBn ? "bangla" : ""}`} style={{ color: "#8b95a0" }}>
              <LockIcon />
              {t("q.privacy")}
            </p>
          </form>
        </div>

        {/* ---------------- contact panel ---------------- */}
        <div
          className="relative overflow-hidden rounded-[26px] lg:col-span-5"
          style={{ background: NAVY, minHeight: "clamp(420px, 50vw, 640px)" }}
        >
          <img
            src={PANEL_IMAGE}
            alt=""
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-[58%] w-full object-cover"
            draggable={false}
          />
          {/* Navy fades down into the photograph so there is no hard seam. */}
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, #16293f 0%, #16293f 38%, rgba(22,41,63,0.82) 50%, rgba(22,41,63,0.28) 64%, rgba(22,41,63,0.08) 100%)",
            }}
          />

          <div className="relative p-8 md:p-10">
            <p className={isBn ? "bangla" : ""} style={{ ...kicker, color: "rgba(255,255,255,0.6)" }}>
              {t("q.touch")}
            </p>
            <h3 className={`mt-4 ${isBn ? "bangla" : ""}`} style={{ ...display("clamp(1.5rem,3vw,2.4rem)"), color: "#fff" }}>
              {t("q.help1")}
              <br />
              <span style={{ color: "rgba(255,255,255,0.55)" }}>{t("q.help2")}</span>
            </h3>

            <ul className="mt-9 space-y-5">
              {(
                [
                  { icon: <PhoneIcon size={19} />, label: "q.call", value: COMPANY.phone.display, href: telLink },
                  { icon: <MailIcon size={19} />, label: "q.mail", value: COMPANY.email, href: mailtoLink },
                  { icon: <PinIcon size={19} />, label: "q.visit", value: COMPANY.address[lang], href: undefined },
                ] as { icon: React.ReactNode; label: TKey; value: string; href?: string }[]
              ).map((row, i) => (
                <li key={row.label}>
                  {i > 0 && (
                    <hr aria-hidden className="mb-5 border-0 border-t" style={{ borderColor: "rgba(255,255,255,0.14)" }} />
                  )}
                  <div className="flex items-start gap-4">
                    <span
                      className="mt-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white"
                      style={{ background: "rgba(255,255,255,0.1)" }}
                    >
                      {row.icon}
                    </span>
                    <div>
                      <p className={isBn ? "bangla" : ""} style={{ ...kicker, fontSize: "0.62rem", color: "rgba(255,255,255,0.55)" }}>
                        {t(row.label)}
                      </p>
                      {row.href ? (
                        <a
                          href={row.href}
                          className={`mt-1.5 block text-[1.02rem] font-semibold text-white transition-colors hover:text-crate-orange ${isBn ? "bangla" : ""}`}
                        >
                          {row.value}
                        </a>
                      ) : (
                        <p className={`mt-1.5 text-[1.02rem] font-semibold text-white ${isBn ? "bangla" : ""}`}>
                          {row.value}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
