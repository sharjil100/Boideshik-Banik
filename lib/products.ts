import manifest from "./productManifest.json";
import type { CategoryId } from "./catalogue";

export type Bilingual = { en: string; bn: string };

export type Product = {
  id: keyof typeof manifest;
  category: CategoryId;
  /** Internal catalogue code, as it would appear on a quotation. */
  code: string;
  name: Bilingual;
  /** Three or four spec lines, shown beside the product on the rack. */
  specs: Bilingual[];
  /** Real width of the product as photographed, in metres. */
  realWidth: number;
  moq: number;
  /** Units per export carton. */
  carton: number;
  /** Harmonised System code — what customs actually classifies it under. */
  hs: string;
};

export const PRODUCTS: Product[] = [
  {
    id: "1-gang",
    category: "switches",
    code: "BB-SW-TG-01",
    name: { en: "1-Gang Touch Switch", bn: "১-গ্যাং টাচ সুইচ" },
    specs: [
      { en: "250V · 10A", bn: "২৫০V · ১০A" },
      { en: "Tempered glass panel", bn: "টেম্পার্ড গ্লাস প্যানেল" },
      { en: "Blue LED indicator", bn: "নীল এলইডি ইন্ডিকেটর" },
    ],
    realWidth: 0.086,
    moq: 500,
    carton: 100,
    hs: "8536.50",
  },
  {
    id: "2-gang",
    category: "switches",
    code: "BB-SW-MB-02",
    name: { en: "2-Gang Rocker — Matte Black", bn: "২-গ্যাং রকার — ম্যাট ব্ল্যাক" },
    specs: [
      { en: "250V · 16A", bn: "২৫০V · ১৬A" },
      { en: "Brushed metal faceplate", bn: "ব্রাশড মেটাল ফেসপ্লেট" },
      { en: "Screwless mount", bn: "স্ক্রুবিহীন মাউন্ট" },
    ],
    realWidth: 0.086,
    moq: 500,
    carton: 100,
    hs: "8536.50",
  },
  {
    id: "3-gang",
    category: "switches",
    code: "BB-SW-GL-03",
    name: { en: "3-Gang Rocker — Glass", bn: "৩-গ্যাং রকার — গ্লাস" },
    specs: [
      { en: "250V · 16A", bn: "২৫০V · ১৬A" },
      { en: "Crystal glass panel", bn: "ক্রিস্টাল গ্লাস প্যানেল" },
      { en: "Chrome trim ring", bn: "ক্রোম ট্রিম রিং" },
    ],
    realWidth: 0.086,
    moq: 500,
    carton: 100,
    hs: "8536.50",
  },
  {
    id: "charger-1",
    category: "power",
    code: "BB-PW-GN-65",
    name: { en: "65W GaN Charger", bn: "৬৫W গ্যান চার্জার" },
    specs: [
      { en: "2× USB-C + 1× USB-A", bn: "২× USB-C + ১× USB-A" },
      { en: "PD 3.0 · PPS", bn: "PD ৩.০ · PPS" },
      { en: "Folding UK 3-pin", bn: "ভাঁজযোগ্য UK ৩-পিন" },
    ],
    realWidth: 0.062,
    moq: 300,
    carton: 60,
    hs: "8504.40",
  },
  {
    id: "charger-2",
    category: "power",
    code: "BB-PW-GN-140",
    name: { en: "140W GaN Desktop Charger", bn: "১৪০W গ্যান ডেস্কটপ চার্জার" },
    specs: [
      { en: "4× USB-C", bn: "৪× USB-C" },
      { en: "140W / 100W / 100W / 100W", bn: "১৪০W / ১০০W / ১০০W / ১০০W" },
      { en: "Detachable AC cable", bn: "খোলা যায় এমন AC ক্যাবল" },
    ],
    realWidth: 0.112,
    moq: 200,
    carton: 40,
    hs: "8504.40",
  },
  {
    id: "ceiling-fan",
    category: "fans",
    code: "BB-FN-CF-56",
    name: { en: '56" Ceiling Fan', bn: "৫৬″ সিলিং ফ্যান" },
    specs: [
      { en: "3 swept aluminium blades", bn: "৩টি সুইপ্ট অ্যালুমিনিয়াম ব্লেড" },
      { en: "75W · 300 RPM", bn: "৭৫W · ৩০০ RPM" },
      { en: "Brushed pewter finish", bn: "ব্রাশড পিউটার ফিনিশ" },
    ],
    realWidth: 1.42,
    moq: 100,
    carton: 2,
    hs: "8414.51",
  },
  {
    id: "ventilation-fan",
    category: "fans",
    code: "BB-FN-EX-12",
    name: { en: '12" Exhaust Fan', bn: "১২″ এক্সহস্ট ফ্যান" },
    specs: [
      { en: "Louvred auto-shutter", bn: "লুভার অটো-শাটার" },
      { en: "45W · 1400 m³/h", bn: "৪৫W · ১৪০০ m³/h" },
      { en: "Wall or window mount", bn: "দেয়াল বা জানালা মাউন্ট" },
    ],
    realWidth: 0.3,
    moq: 200,
    carton: 8,
    hs: "8414.51",
  },
  {
    id: "led-round-light",
    category: "lighting",
    code: "BB-LT-PN-18",
    name: { en: "18W Round LED Panel", bn: "১৮W গোল এলইডি প্যানেল" },
    specs: [
      { en: "1,800 lm · CRI 80+", bn: "১,৮০০ lm · CRI ৮০+" },
      { en: "3000K / 4000K / 6500K", bn: "৩০০০K / ৪০০০K / ৬৫০০K" },
      { en: "Surface mount · 300mm", bn: "সারফেস মাউন্ট · ৩০০মিমি" },
    ],
    realWidth: 0.3,
    moq: 300,
    carton: 20,
    hs: "9405.11",
  },
  {
    id: "bulb",
    category: "lighting",
    code: "BB-LT-BL-09",
    name: { en: "9W LED Bulb — B22", bn: "৯W এলইডি বাল্ব — B22" },
    specs: [
      { en: "900 lm · 2700K warm", bn: "৯০০ lm · ২৭০০K উষ্ণ" },
      { en: "Bayonet cap B22", bn: "বেয়নেট ক্যাপ B22" },
      { en: "25,000 hr rated", bn: "২৫,০০০ ঘণ্টা রেটেড" },
    ],
    realWidth: 0.06,
    moq: 1000,
    carton: 100,
    hs: "8539.52",
  },
  {
    id: "mcb",
    category: "general",
    code: "BB-EL-MCB-16",
    name: { en: "C16 MCB — 1 Pole", bn: "C16 এমসিবি — ১ পোল" },
    specs: [
      { en: "230/400V · 6000A Icn", bn: "২৩০/৪০০V · ৬০০০A Icn" },
      { en: "Curve C · IEC 60898-1", bn: "কার্ভ C · IEC 60898-1" },
      { en: "35mm DIN rail", bn: "৩৫মিমি ডিন রেইল" },
    ],
    realWidth: 0.018,
    moq: 1000,
    carton: 120,
    hs: "8536.20",
  },
  {
    id: "multiplug",
    category: "general",
    code: "BB-EL-PS-06",
    name: { en: "6-Way Extension Socket", bn: "৬-ওয়ে এক্সটেনশন সকেট" },
    specs: [
      { en: "Individually switched", bn: "আলাদা আলাদা সুইচ" },
      { en: "13A · surge protected", bn: "১৩A · সার্জ প্রোটেক্টেড" },
      { en: "3m braided cable", bn: "৩মি ব্রেইডেড ক্যাবল" },
    ],
    realWidth: 0.4,
    moq: 300,
    carton: 24,
    hs: "8536.69",
  },
];

/* ------------------------------------------------------------------ *
 * Display sizing
 * ------------------------------------------------------------------ */

const NOMINAL = 0.78; // metres — the size a mid-sized product renders at
const MEDIAN = 0.12; // metres — roughly the median realWidth below
const COMPRESSION = 0.3;

/**
 * True scale would be honest and unusable: a 56" fan is 79× the width of an
 * MCB, so at real scale the breaker is four pixels. Uniform scale is the
 * opposite failure — everything the same size reads as clip art and loses
 * the sense that these are physical goods.
 *
 * So scale is compressed by a power curve. Big things stay visibly bigger,
 * small things stay legible, and the ordering is preserved.
 */
export function displayWidth(product: Product): number {
  return NOMINAL * Math.pow(product.realWidth / MEDIAN, COMPRESSION);
}

export function aspectOf(product: Product): number {
  return (manifest as Record<string, { aspect: number }>)[product.id].aspect;
}

export function textureUrl(product: Product): string {
  return `/products/${product.id}.webp`;
}

/**
 * Compact two-attribute line for card layouts.
 *
 * The full `specs` array is three lines and too long for a card, and
 * joining its entries produces things like "250V · 10A · Tempered glass
 * panel". These pick the two attributes a buyer scans for.
 */
export const SUMMARY: Record<Product["id"], Bilingual> = {
  "1-gang": { en: "Tempered glass · 1 gang", bn: "টেম্পার্ড গ্লাস · ১ গ্যাং" },
  "2-gang": { en: "Brushed metal · 2 gang", bn: "ব্রাশড মেটাল · ২ গ্যাং" },
  "3-gang": { en: "Crystal glass · 3 gang", bn: "ক্রিস্টাল গ্লাস · ৩ গ্যাং" },
  "charger-1": { en: "65W fast charge · 3 port", bn: "৬৫W ফাস্ট চার্জ · ৩ পোর্ট" },
  "charger-2": { en: "140W desktop · 4× USB-C", bn: "১৪০W ডেস্কটপ · ৪× USB-C" },
  "ceiling-fan": { en: '56" span · 3 blade', bn: "৫৬″ · ৩ ব্লেড" },
  "ventilation-fan": { en: '12" louvred · Auto-shutter', bn: "১২″ লুভার · অটো-শাটার" },
  "led-round-light": { en: "18W slim profile · Tri-colour", bn: "১৮W স্লিম · ট্রাই-কালার" },
  bulb: { en: "9W · B22 warm white", bn: "৯W · B22 উষ্ণ সাদা" },
  mcb: { en: "C16 · 1 pole", bn: "C16 · ১ পোল" },
  multiplug: { en: "6 outlets · Individually switched", bn: "৬ আউটলেট · আলাদা সুইচ" },
};
