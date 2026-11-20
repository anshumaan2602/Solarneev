"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { site } from "@/config/site";
import { loadCopy, type Copy, type Lang } from "@/content";
import { LANG_PATHS, langFromPath, pathForLang } from "@/lib/langPath";

interface LangValue {
  lang: Lang;
  /** All the page's text in the current language. */
  c: Copy;
  setLang(next: Lang): void;
  /** Start fetching a language's text before it is needed, so the switch is instant. */
  prefetch(lang: Lang): void;
}

const LangContext = createContext<LangValue | null>(null);

/** Point the page's head at the language shown: tab title, description, canonical and share tags. */
function syncHead(lang: Lang, c: Copy) {
  document.documentElement.lang = lang;
  document.title = c.meta.title;
  const url = new URL(LANG_PATHS[lang], site.url).href;
  const set = (selector: string, attr: string, value: string) => document.head.querySelector(selector)?.setAttribute(attr, value);
  set('link[rel="canonical"]', "href", url);
  set('meta[name="description"]', "content", c.meta.description);
  set('meta[property="og:url"]', "content", url);
  set('meta[property="og:title"]', "content", c.meta.title);
  set('meta[property="og:description"]', "content", c.meta.description);
  set('meta[property="og:locale"]', "content", lang === "hi" ? "hi_IN" : "en_IN");
  set('meta[name="twitter:title"]', "content", c.meta.title);
  set('meta[name="twitter:description"]', "content", c.meta.description);
}

/**
 * The language switch changes the page in place, like the design: no reload, so calculator
 * inputs survive. It also moves the address between / and /hi/, so a reload or a shared link
 * opens the same language, and Back and Forward bring the language back with the address.
 * The page arrives with its own language's text; the other is fetched when first needed.
 */
export function LangProvider({ initialLang, initialCopy, children }: Readonly<{ initialLang: Lang; initialCopy: Copy; children: React.ReactNode }>) {
  const [shown, setShown] = useState<{ lang: Lang; c: Copy }>({ lang: initialLang, c: initialCopy });
  const copies = useRef<Partial<Record<Lang, Copy>>>({ [initialLang]: initialCopy });
  const current = useRef<Lang>(initialLang);
  const latest = useRef(0);

  const load = useCallback(async (lang: Lang): Promise<Copy> => {
    const have = copies.current[lang];
    if (have) return have;
    const c = await loadCopy[lang]();
    copies.current[lang] = c;
    return c;
  }, []);

  const show = useCallback(
    async (lang: Lang, moveAddress: boolean) => {
      const ticket = ++latest.current;
      const address = () => pathForLang(window.location.pathname, lang) + window.location.search + window.location.hash;
      let c: Copy;
      try {
        c = await load(lang);
      } catch (err) {
        // Offline, or the site changed since this page loaded: open that language's page instead.
        console.warn("Could not load the other language", err);
        if (moveAddress) window.location.assign(address());
        return;
      }
      if (ticket !== latest.current) return; // a later switch won
      if (moveAddress) window.history.replaceState(null, "", address());
      current.current = lang;
      setShown({ lang, c });
      syncHead(lang, c);
    },
    [load],
  );

  // Back and Forward can land on an address recorded in the other language: follow it.
  useEffect(() => {
    const onPopState = () => {
      const lang = langFromPath(window.location.pathname);
      if (lang !== current.current) void show(lang, false);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [show]);

  const setLang = useCallback((next: Lang) => void show(next, true), [show]);
  const prefetch = useCallback((lang: Lang) => void load(lang).catch(() => {}), [load]);
  const value = useMemo(() => ({ lang: shown.lang, c: shown.c, setLang, prefetch }), [shown, setLang, prefetch]);
  return <LangContext value={value}>{children}</LangContext>;
}

export function useLang(): LangValue {
  const value = useContext(LangContext);
  if (!value) throw new Error("useLang() must be used inside <LangProvider>");
  return value;
}
