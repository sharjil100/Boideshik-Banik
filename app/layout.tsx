import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { LangProvider } from "@/lib/i18n";
import { SmoothScroll } from "@/components/SmoothScroll";
import { HeroLoader } from "@/components/HeroLoader";
import "./globals.css";

/* Fonts are self-hosted rather than pulled from Google. The audience is on
   Bangladeshi mobile networks, where a third-party DNS lookup + TLS
   handshake to fonts.gstatic.com costs more than the files themselves. */

/* Archivo's width axis is what gives the display type its industrial,
   stencilled proportions — deliberately not a default UI grotesque. */
const archivo = localFont({
  src: [{ path: "./fonts/archivo-latin-var.woff2", weight: "100 900", style: "normal" }],
  display: "swap",
  variable: "--font-archivo",
  fallback: ["Arial Narrow", "Helvetica Neue", "sans-serif"],
});

const plexMono = localFont({
  src: [
    { path: "./fonts/plex-mono-latin-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/plex-mono-latin-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/plex-mono-latin-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/plex-mono-latin-700.woff2", weight: "700", style: "normal" },
  ],
  display: "swap",
  variable: "--font-plex-mono",
  fallback: ["ui-monospace", "Consolas", "monospace"],
});

/* Two files, one family: the Bengali subset is 437 KB and the Latin 97 KB,
   so they stay split and the browser pulls only what the glyphs need. */
const anek = localFont({
  src: [
    { path: "./fonts/anek-bangla-bengali-var.woff2", weight: "100 800", style: "normal" },
    { path: "./fonts/anek-bangla-latin-var.woff2", weight: "100 800", style: "normal" },
  ],
  display: "swap",
  variable: "--font-anek",
  fallback: ["Nirmala UI", "Vrinda", "sans-serif"],
});

/**
 * Decides, before first paint, whether the opening video runs.
 *
 * This has to be a blocking inline script rather than a React effect. By
 * the time React mounts the page has already painted, so showing the
 * overlay then would flash the site first, and hiding it then would flash
 * the overlay at people who opted out of it.
 *
 * "Seen" is recorded immediately, so a reload goes straight to the site.
 */
const LOADER_GATE = `(function(){try{
var d=document.documentElement;
/* A reload should open on the hero. Both lines run before first paint:
   without them the browser restores the previous offset, or jumps to a
   stale hash, before anything else has a chance to. */
if('scrollRestoration' in history) history.scrollRestoration='manual';
if(location.hash) history.replaceState(null,'',location.pathname+location.search);
if(localStorage.getItem('bb.loader.seen'))return;
if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
var c=navigator.connection||{};
if(c.saveData===true)return;
if(/2g/.test(c.effectiveType||''))return;
d.setAttribute('data-loader','on');
localStorage.setItem('bb.loader.seen','1');
}catch(e){}})();`;

export const metadata: Metadata = {
  metadataBase: new URL("https://boideshikbanik.com"),
  title: {
    default: "Boideshik Banik — Import & Wholesale Distribution, Bangladesh",
    template: "%s · Boideshik Banik",
  },
  description:
    "Direct-import wholesale across Bangladesh. Gang switches, GaN chargers, ceiling fans, LED lighting and general merchandise — sourced at the factory, cleared at Chattogram, delivered to your shop.",
  keywords: [
    "wholesale electrical Bangladesh",
    "importer Dhaka",
    "gang switch wholesale",
    "GaN charger importer",
    "ceiling fan wholesale Bangladesh",
    "Chattogram import",
    "বৈদেশিক বণিক",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: "bn_BD",
    siteName: "Boideshik Banik",
    title: "Boideshik Banik — Import & Wholesale Distribution",
    description:
      "Direct-import wholesale across Bangladesh. Electrical goods and everything else.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#061634",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${plexMono.variable} ${anek.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: LOADER_GATE }} />
      </head>
      <body>
        <HeroLoader />
        <LangProvider>
          <SmoothScroll>{children}</SmoothScroll>
        </LangProvider>
      </body>
    </html>
  );
}
