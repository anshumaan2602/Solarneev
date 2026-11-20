import { useId } from "react";
import { useLang } from "../providers/LangProvider";
import { CheckIcon, CrossIcon } from "../ui/icons";
import ui from "../ui/section.module.css";
import s from "./SystemTypes.module.css";

/** Top-edge colour of each card: on-grid, off-grid, hybrid. */
const ACCENTS = [s.onGrid, s.offGrid, s.hybrid];

/** On-grid, off-grid or hybrid: what each does well and where it falls short. */
export function SystemTypes() {
  const { c } = useLang();
  const id = useId();
  return (
    <section id="types" aria-labelledby={id} className={s.section}>
      <div className={ui.container}>
        <h2 id={id} className={`${ui.h2} ${s.title}`}>{c.types.h2}</h2>
        <p className={s.lead}>{c.types.p}</p>
        <div className={s.cards}>
          {c.types.cards.map((card, i) => (
            <article key={i} className={`${s.card} ${ACCENTS[i]}`}>
              <div className={s.cardHead}>
                <h3 className={s.name}>{card.name}</h3>
                <p className={s.price}>{card.price}</p>
              </div>
              <p className={s.desc}>{card.desc}</p>
              <div className={s.group}>
                <p className={s.prosLabel}>{c.types.pros}</p>
                <ul className={s.list}>
                  {card.pros.map((x) => (
                    <li key={x} className={s.item}>
                      <CheckIcon size={20} className={s.icon} />
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={s.group}>
                <p className={s.consLabel}>{c.types.cons}</p>
                <ul className={s.list}>
                  {card.cons.map((x) => (
                    <li key={x} className={s.item}>
                      <CrossIcon size={20} className={s.icon} />
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
              <p className={s.best}>
                <strong className={s.bestLabel}>{c.types.best}</strong>
                {" " + card.best}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
