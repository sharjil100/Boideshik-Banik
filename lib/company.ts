/**
 * Verified company details.
 *
 * This file is the only place real company facts live, and it holds exactly
 * what has been confirmed — nothing inferred, nothing rounded up. If a
 * section needs a number that isn't here (years trading, containers a year,
 * clients served, MOQ policy), the answer is to ask for it, not to invent a
 * plausible one. Fabricated trust signals are the fastest way to lose a
 * wholesale buyer who checks.
 */

export const COMPANY = {
  name: { en: "Boideshik Banik", bn: "বৈদেশিক বণিক" },

  phone: {
    /** E.164, for tel: and wa.me links. */
    e164: "+8801756785842",
    /** Grouped for display. */
    display: "+880 1756 785842",
  },

  email: "boideshikbanik@gmail.com",

  address: {
    en: "Atibazar, Keraniganj, Dhaka",
    bn: "আটিবাজার, কেরানীগঞ্জ, ঢাকা",
  },
} as const;

/** Prefilled WhatsApp deep link — how most BD wholesale enquiries arrive. */
export function whatsappLink(message?: string): string {
  const number = COMPANY.phone.e164.replace(/\D/g, "");
  const base = `https://wa.me/${number}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export const telLink = `tel:${COMPANY.phone.e164}`;
export const mailtoLink = `mailto:${COMPANY.email}`;
