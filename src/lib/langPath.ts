// Where each language lives: English at /, Hindi at /hi/ (or under a base path, e.g. /site/hi/).

import type { Lang } from "@/content";

export const LANG_PATHS: Record<Lang, string> = { en: "/", hi: "/hi/" };

/** Split a page address into its base folder and language. Handles /hi, /hi/ and /hi/index.html. */
function splitPath(pathname: string): { base: string; lang: Lang } {
  let p = pathname.replace(/index\.html$/, "");
  if (!p.endsWith("/")) p += "/";
  const hindi = /^(.*\/)hi\/$/.exec(p);
  return hindi ? { base: hindi[1], lang: "hi" } : { base: p, lang: "en" };
}

/** The language a page address shows. */
export function langFromPath(pathname: string): Lang {
  return splitPath(pathname).lang;
}

/** The address of the same page in another language. */
export function pathForLang(pathname: string, lang: Lang): string {
  const { base } = splitPath(pathname);
  return lang === "hi" ? base + "hi/" : base;
}
