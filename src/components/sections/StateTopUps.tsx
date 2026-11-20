import { useId } from "react";
import { useLang } from "../providers/LangProvider";
import ui from "../ui/section.module.css";
import s from "./StateTopUps.module.css";

/** States that add their own money on top of the central subsidy. */
export function StateTopUps() {
  const { c } = useLang();
  const id = useId();
  const t = c.topUps;
  return (
    <section id="states" aria-labelledby={id} className={s.section}>
      <div className={ui.container}>
        <div className={s.top}>
          <h2 id={id} className={`${ui.h2} ${s.title}`}>{t.h2}</h2>
          <p className={s.lead}>{t.p}</p>
        </div>
        <div className={s.scroller}>
          <table className={s.table}>
            <thead>
              <tr className={s.headRow}>
                <th scope="col" className={s.th}>{t.headers.state}</th>
                <th scope="col" className={s.th}>{t.headers.extra}</th>
                <th scope="col" className={s.th}>{t.headers.conditions}</th>
              </tr>
            </thead>
            <tbody>
              {t.rows.map((r) => (
                <tr key={r.s} className={s.row}>
                  <th scope="row" className={s.state}>{r.s}</th>
                  <td className={s.cell}>{r.a}</td>
                  <td className={s.conditions}>{r.c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
