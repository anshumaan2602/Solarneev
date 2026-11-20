import { site } from "@/config/site";
import { shared, type Lang } from "@/content";
import { useLang } from "../providers/LangProvider";
import { Brand } from "../ui/Brand";
import { PhoneIcon } from "../ui/icons";
import s from "./SiteNav.module.css";

const LANG_CLASS: Record<Lang, string> = { en: s.langEn, hi: s.langHi };

export function SiteNav() {
  const { c, lang, setLang, prefetch } = useLang();
  const phone = site.phones[0];
  // Fetch the other language's text as soon as the visitor reaches for the switch.
  const other: Lang = lang === "en" ? "hi" : "en";
  const getReady = () => prefetch(other);
  return (
    <nav aria-label="Main" className={s.nav}>
      <Brand />
      <ul className={s.links}>
        <li><a href="#calculator" className={s.link}>{c.nav.calc}</a></li>
        <li><a href="#packages" className={s.link}>{c.nav.prices}</a></li>
        <li><a href="#schemes" className={s.link}>{c.nav.subs}</a></li>
        <li><a href="#team" className={s.link}>{c.nav.team}</a></li>
      </ul>
      <div className={s.actions}>
        <div role="group" aria-label={c.nav.lang} onPointerEnter={getReady} onTouchStart={getReady} onFocus={getReady} className={s.langSwitch}>
          {(["en", "hi"] as const).map((l) => (
            <button
              key={l}
              type="button"
              lang={l}
              aria-pressed={lang === l}
              onClick={() => setLang(l)}
              className={`${s.langBtn} ${LANG_CLASS[l]}`}
            >
              {shared.languageNames[l]}
            </button>
          ))}
        </div>
        <a href={`tel:${phone.tel}`} className={s.phone}>
          <PhoneIcon size={16} stroke="#FFC266" />
          <span className={s.phoneText}>{phone.display}</span>
        </a>
        <a href="#contact" className={s.book}>{c.nav.book}</a>
      </div>
    </nav>
  );
}
