import { Bricolage_Grotesque, Manrope, Montserrat, Mukta } from "next/font/google";
import type { CSSProperties } from "react";

// The design's Google Fonts, self-hosted at build time: same families, same weights.

const manrope = Manrope({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  adjustFontFallback: false,
});

// Mukta draws the Devanagari text. It is not preloaded: both pages share one font stylesheet
// (Turbopack merges the two layouts' font CSS), so preloading it for the Hindi page would also
// make every English visit download ~260 KB of Devanagari fonts it barely uses.
const mukta = Mukta({
  weight: ["400", "600", "700", "800"],
  preload: false,
  adjustFontFallback: false,
});

const bricolage = Bricolage_Grotesque({
  weight: ["500", "700", "800"],
  subsets: ["latin"],
  adjustFontFallback: false,
});

const montserrat = Montserrat({
  weight: ["700", "800"],
  subsets: ["latin"],
  adjustFontFallback: false,
});

/**
 * The family name next/font gave a font, without the fallback families it lists after it.
 * (Turbopack in Next 16.4 adds a metric-matched Arial fallback even with adjustFontFallback off;
 * left in, Arial would draw characters these fonts lack, such as ≈ and ₂, instead of the next
 * font in the design's stacks.) next/font always lists the loaded face first.
 */
function firstFamily(font: { style: { fontFamily: string } }): string {
  return font.style.fontFamily.split(",")[0].trim();
}

/** Set on <html>: the four --font-* variables the stacks in globals.css are built from. */
export const fontVariables = {
  "--font-manrope": firstFamily(manrope),
  "--font-mukta": firstFamily(mukta),
  "--font-bricolage": firstFamily(bricolage),
  "--font-montserrat": firstFamily(montserrat),
} as CSSProperties;
