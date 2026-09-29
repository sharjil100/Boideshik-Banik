# Boideshik Banik — বৈদেশিক বণিক

Marketing site for a Dhaka-based wholesale importer. Bilingual (English /
Bangla), built with Next.js.

## Running it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build
```

## Layout

```
app/
  layout.tsx       fonts, metadata, the pre-paint loader gate
  globals.css      design tokens, elevation, animations
  fonts/           self-hosted woff2
components/
  SiteHeader.tsx   fixed nav
  SiteFooter.tsx
  HeroLoader.tsx   opening video overlay
  SmoothScroll.tsx Lenis, anchor scrolling, scroll restoration
  sections/        Hero, Services, Range, Featured, Sourcing, About, Quote
  three/           unused WebGL experiment, kept for reference
lib/
  i18n.tsx         every string, as [en, bn] pairs
  company.ts       verified company details — single source of truth
  catalogue.ts     the five product categories
  products.ts      the 11 products, specs and display sizing
```

## Things worth knowing before changing them

**Fonts are self-hosted.** Archivo, IBM Plex Mono and Anek Bangla live in
`app/fonts` and are loaded with `next/font/local`. The audience is on
Bangladeshi mobile networks, where a third-party lookup and TLS handshake
to `fonts.gstatic.com` costs more than the files. Anek Bangla is split
into Bengali and Latin subsets so the browser pulls only what it needs.

**The hero is two matched plates.** `hero-bg.webp` and
`hero-foreground.webp` are cut from one photograph and share an identical
1448x1086 canvas. Both use `object-fit: cover` on the same box, so they
stay registered at any viewport with no manual offsets. Trimming either
one, or replacing just one of them, breaks the alignment — and the
wordmark sitting *between* them is the whole effect.

**`lib/company.ts` holds only verified facts.** Phone, email, address.
Nothing is inferred. If a section needs a figure that isn't there — years
trading, SKU counts, volumes, client numbers — the answer is to ask for
it, not to invent a plausible one. Several reference mockups came with
placeholder contact details and invented stats; none of it shipped.

**Every string is in `lib/i18n.tsx`** as an `[en, bn]` pair, type-checked,
so a missing translation is a build error rather than a silent fallback to
English.

**The loader can't trap anyone.** `HeroLoader` fades out via a CSS
keyframe with a delay, so the overlay clears even if its JavaScript never
runs. A pre-paint script in `layout.tsx` decides whether it plays at all —
first visit only, never on reduced-motion, Save-Data or 2G — and the video
`src` is attached in JS so excluded visitors never download it.

**Source artwork is gitignored,** not deleted. The originals are ~44 MB
against 2.6 MB of shipped assets; see `.gitignore` for what and why.

## Open items

- "Chattogram" appears in three strings as the clearing port. It was
  inferred from the company being Dhaka-based and has not been confirmed.
- The quotation form has no backend by design: it composes the enquiry and
  hands it to WhatsApp or the user's mail client. Nothing is stored.
- `components/three/` and `components/sections/Rack.tsx` and `Unload.tsx`
  are an earlier WebGL direction, out of the page but not deleted.
