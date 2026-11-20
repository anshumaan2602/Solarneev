import { site } from "@/config/site";
import { rooftopsProof, statNumbers } from "@/lib/stats";
import { useLang } from "../providers/LangProvider";
import { Calculator } from "./Calculator";
import s from "./Header.module.css";
import { Hero } from "./Hero";
import { SiteNav } from "./SiteNav";
import { SolarStage } from "./SolarStage";

/** The dark top of the page: navigation, headline, the 3D house beside the calculator, proof points. */
export function Header() {
  const { c } = useLang();
  const proof = [...c.hero.proof, rooftopsProof(statNumbers(site.stats), c)];
  return (
    <header className={s.header}>
      <div aria-hidden="true" className={s.glow} />
      <div className={s.inner}>
        <SiteNav />
        <Hero />
        <div id="calculator" className={s.calcRow}>
          <SolarStage />
          <Calculator />
        </div>
        <ul className={s.proof}>
          {proof.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>
    </header>
  );
}
