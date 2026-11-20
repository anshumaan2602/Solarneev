import { useId } from "react";
import { useLang } from "../providers/LangProvider";
import ui from "../ui/section.module.css";
import s from "./Faq.module.css";

export function Faq() {
  const { c } = useLang();
  const id = useId();
  return (
    <section id="faq" aria-labelledby={id} className={s.section}>
      <div className={s.container}>
        <h2 id={id} className={ui.h2}>{c.faq.h2}</h2>
        <div className={s.list}>
          {/* Keyed by position, so an open answer stays open when the language changes. */}
          {c.faq.items.map((item, i) => (
            <details key={i} className={s.item}>
              <summary className={s.question}>
                {item.q}
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={s.chev}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </summary>
              <p className={s.answer}>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
