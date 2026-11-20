import { useId, useState } from "react";
import { site } from "@/config/site";
import { SYSTEM_TYPES, type SystemType } from "@/lib/calc/data";
import { packageRows } from "@/lib/calc/viewModel";
import { fmt } from "@/lib/format";
import { useCalcDispatch } from "../providers/CalcProvider";
import { useLang } from "../providers/LangProvider";
import { ArrowIcon, CheckIcon } from "../ui/icons";
import ui from "../ui/section.module.css";
import s from "./Packages.module.css";

/** SOLARNEEV's home price list with UP subsidies. "Calculate" loads a row into the calculator. */
export function Packages() {
  const { c } = useLang();
  const dispatch = useCalcDispatch();
  const [type, setType] = useState<SystemType>("on");
  const id = useId();
  const h = c.packages.headers;
  const rows = packageRows(type, c, site.prices);

  return (
    <section id="packages" aria-labelledby={id} className={s.section}>
      <div className={ui.container}>
        <div className={s.top}>
          <div className={s.intro}>
            <h2 id={id} className={`${ui.h2} ${s.title}`}>{c.packages.h2}</h2>
            <p className={s.lead}>{c.packages.p}</p>
          </div>
          <div role="group" aria-label={c.packages.aria} className={s.switch}>
            {SYSTEM_TYPES.map((t) => (
              <button key={t} type="button" aria-pressed={type === t} onClick={() => setType(t)} className={s.switchBtn}>
                {c.calc.types[t]}
              </button>
            ))}
          </div>
        </div>

        <div role="table" aria-label={fmt(c.packages.cap, { t: c.estimate.tLower[type] })} className={s.table}>
          <div role="rowgroup">
            <div role="row" className={s.head}>
              <span role="columnheader">{h.system}</span>
              <span role="columnheader">{h.cost}</span>
              <span role="columnheader">{h.subsidy}</span>
              <span role="columnheader">{h.net}</span>
              <span role="columnheader">{h.units}</span>
              <span role="columnheader">
                <span className="sr-only">{h.open}</span>
              </span>
            </div>
          </div>
          <div role="rowgroup">
            {rows.map((r, i) => (
              <div key={r.kw} role="row" className={s.row}>
                <span role="rowheader" className={s.kw}>{r.kw}</span>
                <span role="cell" className={s.cell}>
                  <span className={s.cellLabel}>{h.cost}</span>
                  <span className={s.cost}>{r.cost}</span>
                </span>
                <span role="cell" className={s.cell}>
                  <span className={s.cellLabel}>{h.subsidy}</span>
                  <span className={s.sub}>{r.sub}</span>
                  <span className={s.split}>{r.split}</span>
                </span>
                <span role="cell" className={s.cell}>
                  <span className={s.cellLabel}>{h.net}</span>
                  <span className={s.net}>{r.net}</span>
                </span>
                <span role="cell" className={s.cell}>
                  <span className={s.cellLabel}>{h.units}</span>
                  <span className={s.units}>{r.units}</span>
                </span>
                <span role="cell" className={s.act}>
                  <a
                    href="#calculator"
                    onClick={() => dispatch({ type: "package", systemType: type, index: i })}
                    aria-label={r.goLabel}
                    className={s.go}
                  >
                    {c.packages.go}
                    <ArrowIcon size={14} strokeWidth={2.4} />
                  </a>
                </span>
              </div>
            ))}
          </div>
        </div>
        <p className={s.note}>{c.packages.note}</p>

        <h3 className={s.incTitle}>{c.packages.incH}</h3>
        <ul className={s.incList}>
          {c.packages.inc.map((item) => (
            <li key={item} className={s.incItem}>
              <CheckIcon size={24} className={s.incIcon} />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
