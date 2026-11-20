import { shared } from "@/content";
import { useLang } from "../providers/LangProvider";
import s from "./Hero.module.css";

export function Hero() {
  const { c } = useLang();
  return (
    <div className={s.hero}>
      <div className={s.headline}>
        <p lang="hi" className={s.tagline}>{shared.tagline}</p>
        <h1 className={s.h1}>{c.hero.h1}</h1>
      </div>
      <div className={s.side}>
        <p className={s.sub}>{c.hero.sub}</p>
        <div className={s.ctas}>
          <a href="#contact" className={s.ctaPrimary}>{c.hero.cta1}</a>
          <a href="#packages" className={s.ctaGhost}>{c.hero.cta2}</a>
        </div>
      </div>
    </div>
  );
}
