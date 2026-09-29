"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Lang = "en" | "bn";

/**
 * Every string on the site lives here as an [en, bn] pair so a missing
 * translation is a type error rather than a silent English fallback.
 */
const dict = {
  "nav.services": ["Services", "সেবাসমূহ"],
  "nav.sourcing": ["Sourcing", "সোর্সিং"],
  "nav.contact": ["Contact", "যোগাযোগ"],
  "nav.port": ["Chattogram Port", "চট্টগ্রাম বন্দর"],

  "hero.h1a": ["IMPORTED DIRECT.", "সরাসরি আমদানি।"],
  "hero.h1b": ["SUPPLIED WHOLESALE.", "পাইকারি সরবরাহ।"],
  "hero.kicker1": ["GLOBAL SOURCING.", "বিশ্বজুড়ে সংগ্রহ।"],
  "hero.kicker2": ["NATIONWIDE WHOLESALE.", "সারা দেশে পাইকারি।"],
  "hero.standfirst": [
    "We import quality goods direct from overseas manufacturers and supply them wholesale to retailers, dealers and businesses across Bangladesh.",
    "আমরা বিদেশি কারখানা থেকে সরাসরি মানসম্পন্ন পণ্য আমদানি করি এবং বাংলাদেশজুড়ে খুচরা বিক্রেতা, ডিলার ও ব্যবসায়ীদের কাছে পাইকারি দরে সরবরাহ করি।",
  ],
  "hero.explore": ["See what we stock", "আমাদের পণ্য দেখুন"],

  "nav.products": ["Products", "পণ্যসমূহ"],
  "nav.voyage": ["The Voyage", "যাত্রাপথ"],
  "nav.about": ["About", "আমাদের কথা"],
  "nav.quote": ["Request Quotation", "কোটেশন নিন"],

  "hero.eyebrow": ["Importer & Wholesale Distributor · Bangladesh", "আমদানিকারক ও পাইকারি সরবরাহকারী · বাংলাদেশ"],
  "hero.name": ["BOIDESHIK BANIK", "বৈদেশিক বণিক"],
  "hero.sub": [
    "Direct-import wholesale. Electrical goods and everything else — sourced at the factory, cleared at Chattogram, delivered to your shop.",
    "সরাসরি আমদানি, পাইকারি সরবরাহ। বৈদ্যুতিক পণ্যসহ সবকিছু — কারখানা থেকে সংগ্রহ, চট্টগ্রামে খালাস, আপনার দোকানে পৌঁছে দেওয়া।",
  ],
  "hero.cta": ["Request a quotation", "কোটেশন চান"],
  "hero.cta2": ["Browse the rack", "পণ্য দেখুন"],
  "hero.scroll": ["Scroll to unload", "খালাস করতে স্ক্রল করুন"],
  "hero.hint": ["Pick a container", "একটি কন্টেইনার বাছুন"],

  "cat.switches": ["Switches & Sockets", "সুইচ ও সকেট"],
  "cat.switches.note": ["1–4 gang · modular plates", "১–৪ গ্যাং · মডুলার প্লেট"],
  "cat.fans": ["Fans & Ventilation", "ফ্যান ও ভেন্টিলেশন"],
  "cat.fans.note": ["Ceiling · exhaust · stand", "সিলিং · এক্সহস্ট · স্ট্যান্ড"],
  "cat.lighting": ["Lighting", "লাইটিং"],
  "cat.lighting.note": ["LED panels · bulbs · strips", "এলইডি প্যানেল · বাল্ব · স্ট্রিপ"],
  "cat.power": ["GaN Chargers & Power", "গ্যান চার্জার ও পাওয়ার"],
  "cat.power.note": ["30–140W · adapters · cable", "৩০–১৪০W · অ্যাডাপ্টার · ক্যাবল"],
  "cat.general": ["General Merchandise", "সাধারণ পণ্য"],
  "cat.general.note": ["Anything you can container", "কন্টেইনারে আনা যায় এমন সব"],

  "unload.title": ["What comes out of the box", "বাক্স খুললে যা পাবেন"],
  "unload.body": [
    "We hold no single catalogue. If it ships in a container and sells in Bangladesh, we can source it, inspect it and land it. Electrical goods are simply what we move most.",
    "আমাদের নির্দিষ্ট কোনো তালিকা নেই। কন্টেইনারে আসে আর বাংলাদেশে বিক্রি হয় — এমন যেকোনো পণ্য আমরা সংগ্রহ, যাচাই ও আমদানি করতে পারি। বৈদ্যুতিক পণ্য শুধু আমাদের সবচেয়ে বেশি চলা পণ্য।",
  ],

  "svc.title1": ["Imported, Cleared,", "আমদানি, খালাস —"],
  "svc.title2": ["and Ready to Sell.", "বিক্রির জন্য প্রস্তুত।"],
  "svc.body": [
    "You don't need an LC, a C&F agent, or a full container. We import in bulk, clear it at Chattogram and hold it in stock — so you buy by the carton at wholesale and restock in days, not months.",
    "এলসি, সিএন্ডএফ এজেন্ট বা পুরো কন্টেইনারের প্রয়োজন নেই। আমরা বাল্কে আমদানি করি, চট্টগ্রামে খালাস করি এবং স্টকে রাখি — আপনি কার্টন হিসেবে পাইকারি দরে কিনুন, মাস নয়, কয়েক দিনেই রিস্টক করুন।",
  ],
  "svc.1.title": ["Bought at the Factory", "কারখানা থেকে সরাসরি"],
  "svc.1.body": [
    "We buy direct from overseas manufacturers — no trading-house markup sitting in your price.",
    "আমরা সরাসরি বিদেশি কারখানা থেকে কিনি — আপনার দামে কোনো মধ্যস্বত্বভোগীর মুনাফা নেই।",
  ],
  "svc.2.title": ["Landed at Chattogram", "চট্টগ্রামে খালাসকৃত"],
  "svc.2.body": [
    "We ship in bulk and clear customs ourselves. Duty and paperwork are settled long before it reaches you.",
    "আমরা বাল্কে শিপিং করি ও নিজেরাই কাস্টমস ক্লিয়ার করি। শুল্ক ও কাগজপত্র আগেই সম্পন্ন।",
  ],
  "svc.3.title": ["Wholesale by the Carton", "কার্টন হিসেবে পাইকারি"],
  "svc.3.body": [
    "No container minimums. Order only what you can sell, and come back when it moves.",
    "কন্টেইনারের ন্যূনতম শর্ত নেই। যতটা বিক্রি করতে পারবেন ততটাই নিন।",
  ],

  "rng.kicker": ["OUR PRODUCT RANGE", "আমাদের পণ্যসম্ভার"],
  "rng.h1": ["QUALITY ELECTRICAL", "মানসম্পন্ন বৈদ্যুতিক পণ্য"],
  "rng.h2": ["PRODUCTS FOR EVERY NEED", "সব প্রয়োজনের জন্য"],
  "rng.body": [
    "From switches to lighting, fans to power solutions — we source reliable electrical products from trusted global manufacturers to support your business.",
    "সুইচ থেকে লাইটিং, ফ্যান থেকে পাওয়ার সলিউশন — আপনার ব্যবসার জন্য আমরা বিশ্বের নির্ভরযোগ্য কারখানা থেকে পণ্য সংগ্রহ করি।",
  ],
  "rng.viewall": ["View All Products", "সব পণ্য দেখুন"],

  "rng.feat.kicker": ["SWITCHES & ACCESSORIES", "সুইচ ও অ্যাকসেসরিজ"],
  "rng.feat.title": ["MODERN SWITCHES FOR MODERN SPACES.", "আধুনিক স্পেসের জন্য আধুনিক সুইচ।"],
  "rng.feat.body": [
    "Stylish, durable and reliable switches for residential and commercial projects.",
    "আবাসিক ও বাণিজ্যিক প্রকল্পের জন্য রুচিশীল, টেকসই ও নির্ভরযোগ্য সুইচ।",
  ],
  "rng.feat.cta": ["Explore Products", "পণ্য দেখুন"],
  "rng.feat.note": ["1–3 GANG", "১–৩ গ্যাং"],

  "rng.fan.kicker": ["CEILING FANS", "সিলিং ফ্যান"],
  "rng.fan.title": ["FANS", "ফ্যান"],
  "rng.fan.note": ["CEILING · EXHAUST", "সিলিং · এক্সহস্ট"],

  "rng.led.kicker": ["LED LIGHTING", "এলইডি লাইটিং"],
  "rng.led.title": ["LED PANELS", "এলইডি প্যানেল"],
  "rng.led.note": ["PANEL · BULB", "প্যানেল · বাল্ব"],

  "rng.chg.kicker": ["CHARGERS & ADAPTERS", "চার্জার ও অ্যাডাপ্টার"],
  "rng.chg.title": ["CHARGERS", "চার্জার"],
  "rng.chg.note": ["65W · 140W", "৬৫W · ১৪০W"],

  "rng.pwr.kicker": ["POWER SOLUTIONS", "পাওয়ার সলিউশন"],
  "rng.pwr.title": ["POWER STRIPS", "পাওয়ার স্ট্রিপ"],
  "rng.pwr.note": ["6-WAY · SWITCHED", "৬-ওয়ে · সুইচড"],

  "ftr.kicker": ["FEATURED PRODUCTS", "নির্বাচিত পণ্য"],
  "ftr.title": ["EVERYDAY ELECTRICAL ESSENTIALS", "প্রতিদিনের বৈদ্যুতিক পণ্য"],
  "ftr.prev": ["Previous product", "আগের পণ্য"],
  "ftr.next": ["Next product", "পরের পণ্য"],

  "q.kicker": ["REQUEST A QUOTATION", "কোটেশনের জন্য অনুরোধ"],
  "q.h1": ["LET'S SOURCE", "আপনার ব্যবসার জন্য"],
  "q.h2": ["FOR YOUR BUSINESS.", "পণ্য সংগ্রহ করি।"],
  "q.body": [
    "Tell us what you need and we will come back with pricing, availability and the best options for your business.",
    "আপনার প্রয়োজন জানান — আমরা দাম, প্রাপ্যতা ও সেরা বিকল্পসহ আপনাকে জানাব।",
  ],
  "q.name": ["Your Name", "আপনার নাম"],
  "q.business": ["Business Name", "প্রতিষ্ঠানের নাম"],
  "q.phone": ["Phone Number", "ফোন নম্বর"],
  "q.category": ["Product Category", "পণ্যের ধরন"],
  "q.quantity": ["Quantity", "পরিমাণ"],
  "q.message": ["Message (optional)", "বার্তা (ঐচ্ছিক)"],
  "q.choose": ["Select a category", "একটি ধরন বাছুন"],
  "q.submit": ["Send Quotation Request", "কোটেশন অনুরোধ পাঠান"],
  "q.whatsapp": ["Chat on WhatsApp", "হোয়াটসঅ্যাপে কথা বলুন"],
  "q.privacy": [
    "Your details are used only to prepare your quotation.",
    "আপনার তথ্য শুধুমাত্র কোটেশন তৈরিতে ব্যবহৃত হয়।",
  ],
  "q.required": [
    "Please complete the required fields.",
    "অনুগ্রহ করে আবশ্যক ঘরগুলো পূরণ করুন।",
  ],
  "q.touch": ["GET IN TOUCH", "যোগাযোগ করুন"],
  "q.help1": ["WE'RE HERE", "আমরা আছি"],
  "q.help2": ["TO HELP.", "আপনার পাশে।"],
  "q.call": ["CALL US", "কল করুন"],
  "q.mail": ["EMAIL US", "ইমেইল করুন"],
  "q.visit": ["VISIT US", "আমাদের ঠিকানা"],
  "q.subject": ["Quotation request", "কোটেশন অনুরোধ"],

  "ft.tagline": [
    "Imported goods, supplied wholesale and delivered across Bangladesh.",
    "আমদানি করা পণ্য, বাংলাদেশজুড়ে পাইকারি সরবরাহ ও ডেলিভারি।",
  ],
  "ft.quick": ["QUICK LINKS", "দ্রুত লিঙ্ক"],
  "ft.cats": ["PRODUCT CATEGORIES", "পণ্যের ধরন"],
  "ft.home": ["Home", "হোম"],
  "ft.quote": ["Request a Quotation", "কোটেশন নিন"],
  "ft.phone": ["Phone", "ফোন"],
  "ft.email": ["Email", "ইমেইল"],
  "ft.address": ["Address", "ঠিকানা"],
  "ft.rights": ["All rights reserved.", "সর্বস্বত্ব সংরক্ষিত।"],
  "ft.credit": ["Crafted by Thinkr Studio", "তৈরি করেছে Thinkr Studio"],
  "ft.whatsapp": ["Message us on WhatsApp", "হোয়াটসঅ্যাপে বার্তা পাঠান"],

  "src.kicker": ["HOW WE SOURCE", "যেভাবে আমরা সংগ্রহ করি"],
  "src.title": ["FROM THE FACTORY TO YOUR SHELF", "কারখানা থেকে আপনার দোকানে"],
  "src.body": [
    "Four steps sit between an overseas production line and a carton on your counter. We handle all four, so you handle none of them.",
    "বিদেশি কারখানা থেকে আপনার দোকানের তাক পর্যন্ত চারটি ধাপ। চারটিই আমরা সামলাই, যাতে আপনাকে কিছুই সামলাতে না হয়।",
  ],
  "src.1.title": ["Sourced at the factory", "কারখানা থেকে সংগ্রহ"],
  "src.1.body": [
    "We buy direct from overseas manufacturers, with no trading house sitting in between.",
    "আমরা সরাসরি বিদেশি কারখানা থেকে কিনি, মাঝে কোনো ট্রেডিং হাউস নেই।",
  ],
  "src.2.title": ["Shipped in bulk", "বাল্কে শিপিং"],
  "src.2.body": [
    "Goods travel as full consignments rather than parcels, which is what keeps the unit cost down.",
    "পণ্য আসে পূর্ণ চালান হিসেবে, পার্সেল নয় — এতেই একক খরচ কম থাকে।",
  ],
  "src.3.title": ["Cleared by us", "আমরাই খালাস করি"],
  "src.3.body": [
    "Duty, customs and documentation are settled before the goods ever reach you.",
    "শুল্ক, কাস্টমস ও কাগজপত্র আপনার কাছে পৌঁছানোর আগেই সম্পন্ন।",
  ],
  "src.4.title": ["Stocked, collected or delivered", "স্টক, সংগ্রহ বা ডেলিভারি"],
  "src.4.body": [
    "Held in stock, so you order what you can sell. Collect from Atibazar, or we deliver.",
    "স্টকে রাখা হয়, যাতে যতটা বিক্রি করতে পারবেন ততটাই নিতে পারেন। আটিবাজার থেকে নিজে নিন, অথবা আমরা পৌঁছে দিই।",
  ],

  "abt.kicker": ["ABOUT US", "আমাদের কথা"],
  "abt.title1": ["A WHOLESALE IMPORTER", "ঢাকার একটি"],
  "abt.title2": ["BASED IN DHAKA.", "পাইকারি আমদানিকারক।"],
  "abt.p1": [
    "Boideshik Banik imports goods directly from overseas manufacturers and supplies them wholesale to retailers, dealers and businesses across Bangladesh.",
    "বৈদেশিক বণিক সরাসরি বিদেশি কারখানা থেকে পণ্য আমদানি করে এবং বাংলাদেশজুড়ে খুচরা বিক্রেতা, ডিলার ও ব্যবসাপ্রতিষ্ঠানের কাছে পাইকারি সরবরাহ করে।",
  ],
  "abt.p2": [
    "We work from Atibazar, Keraniganj — buying at the factory, handling the shipping and the customs ourselves, and holding stock so our customers can buy by the carton rather than by the container. Collect from us, or we deliver.",
    "আমরা কাজ করি আটিবাজার, কেরানীগঞ্জ থেকে — কারখানা থেকে কিনি, শিপিং ও কাস্টমস নিজেরাই সামলাই, এবং স্টক রাখি যাতে ক্রেতারা কন্টেইনার নয়, কার্টন হিসেবে কিনতে পারেন। নিজে সংগ্রহ করুন, অথবা আমরা পৌঁছে দিই।",
  ],
  "abt.what": ["WHAT WE STOCK", "আমরা যা রাখি"],
  "abt.where": ["WHERE TO FIND US", "আমাদের ঠিকানা"],

  "lang.switch": ["বাংলা", "EN"],
} as const satisfies Record<string, readonly [string, string]>;

export type TKey = keyof typeof dict;

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
  t: (key: TKey) => string;
};

const LangContext = createContext<Ctx | null>(null);

const STORAGE_KEY = "bb.lang";

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  // Read the stored preference after mount so the server and first client
  // render agree; a mismatch here would hydration-error the whole tree.
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "bn" || stored === "en") setLangState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    window.localStorage.setItem(STORAGE_KEY, lang);
  }, [lang]);

  const setLang = useCallback((l: Lang) => setLangState(l), []);
  const toggle = useCallback(
    () => setLangState((l) => (l === "en" ? "bn" : "en")),
    [],
  );

  const t = useCallback(
    (key: TKey) => dict[key][lang === "en" ? 0 : 1],
    [lang],
  );

  const value = useMemo(
    () => ({ lang, setLang, toggle, t }),
    [lang, setLang, toggle, t],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): Ctx {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside <LangProvider>");
  return ctx;
}
