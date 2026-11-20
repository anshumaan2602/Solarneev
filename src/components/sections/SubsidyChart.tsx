import { subsidyBars } from "@/lib/calc/viewModel";
import { useLang } from "../providers/LangProvider";
import ui from "../ui/section.module.css";
import s from "./SubsidyChart.module.css";

/** PM Surya Ghar central subsidy for a home, by system size, from the calculator's own rule. */
const BARS = subsidyBars();

export function SubsidyChart() {
  const { c } = useLang();
  return (
    <section id="schemes" className={s.section}>
      <div className={ui.container}>
        <div className={s.row}>
          <div className={s.text}>
            <h2 className={`${ui.h2} ${s.title}`}>{c.subsidy.h2}</h2>
            <p className={s.p1}>{c.subsidy.p1}</p>
            <p className={s.p2}>{c.subsidy.p2}</p>
          </div>
          <figure className={s.figure}>
            <figcaption className={s.caption}>{c.subsidy.cap}</figcaption>
            <div role="img" aria-label={c.subsidy.aria} className={s.chart}>
              <div className={s.bars}>
                {BARS.map((b) => (
                  <div key={b.amount} className={s.barCol}>
                    <span className={s.amount}>{b.amount}</span>
                    <div className={b.hill ? `${s.bar} ${s.hill}` : s.bar} style={{ height: b.height }} />
                  </div>
                ))}
              </div>
              <div className={s.axis}>
                <span>1 kW</span>
                <span>2 kW</span>
                <span>{c.subsidy.b3}</span>
                <span>{c.subsidy.b4}</span>
              </div>
            </div>
          </figure>
        </div>
      </div>
    </section>
  );
}
