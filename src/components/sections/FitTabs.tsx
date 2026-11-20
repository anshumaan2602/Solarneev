import { useId, useState } from "react";
import { SEGMENT_TABS, type SegmentTab } from "@/lib/calc/data";
import { useCalcDispatch } from "../providers/CalcProvider";
import { useLang } from "../providers/LangProvider";
import ui from "../ui/section.module.css";
import s from "./FitTabs.module.css";

/** "Different roofs, different rules": the scheme that fits each kind of customer. */
export function FitTabs() {
  const { c } = useLang();
  const dispatch = useCalcDispatch();
  const [tab, setTab] = useState<SegmentTab>("home");
  const id = useId();
  const panel = c.fit.panels[tab];
  return (
    <section aria-labelledby={id} className={s.section}>
      <div className={ui.container}>
        <h2 id={id} className={`${ui.h2} ${s.title}`}>{c.fit.h2}</h2>
        <p className={s.lead}>{c.fit.p}</p>
        <div role="group" aria-label={c.fit.aria} className={s.tabs}>
          {SEGMENT_TABS.map((t) => (
            <button key={t} type="button" aria-pressed={tab === t} onClick={() => setTab(t)} className={s.tab}>
              {c.fit.tabs[t]}
            </button>
          ))}
        </div>
        <div className={s.panel}>
          <div className={s.split}>
            <div className={s.text}>
              <h3 className={s.h3}>{panel.h3}</h3>
              <p className={s.p1}>{panel.p1}</p>
              <p className={s.p2}>{panel.p2}</p>
              {/* Opens the calculator on the matching tab. */}
              <a href="#calculator" onClick={() => dispatch({ type: "segment", seg: tab })} className={s.cta}>
                {panel.cta}
              </a>
            </div>
            <dl className={s.facts}>
              {panel.rows.map((r) => (
                <div key={r.k} className={s.fact}>
                  <dt className={s.factKey}>{r.k}</dt>
                  <dd className={s.factValue}>{r.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
