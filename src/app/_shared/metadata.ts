import type { Metadata } from "next";
import { site } from "@/config/site";
import type { Lang } from "@/content";
import { en } from "@/content/en";
import { hi } from "@/content/hi";
import { LANG_PATHS } from "@/lib/langPath";

const COPY = { en, hi };

/** Title, description and language links for one language version of the page. */
export function pageMetadata(lang: Lang): Metadata {
  const c = COPY[lang];
  return {
    metadataBase: new URL(site.url),
    title: c.meta.title,
    description: c.meta.description,
    alternates: {
      canonical: LANG_PATHS[lang],
      languages: { "en-IN": LANG_PATHS.en, "hi-IN": LANG_PATHS.hi, "x-default": LANG_PATHS.en },
    },
    openGraph: {
      type: "website",
      url: LANG_PATHS[lang],
      siteName: "SOLARNEEV",
      title: c.meta.title,
      description: c.meta.description,
      locale: lang === "hi" ? "hi_IN" : "en_IN",
    },
  };
}
