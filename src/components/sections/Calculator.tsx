import { useId, useState } from "react";
import { SEGMENT_TABS, STATES, SYSTEM_TYPES } from "@/lib/calc/data";
import { calcView } from "@/lib/calc/viewModel";
import { useCalc, useCalcDispatch } from "../providers/CalcProvider";
import { useLang } from "../providers/LangProvider";
import f from "../ui/fields.module.css";
import { useLeadSubmit } from "../ui/LeadStatus";
import s from "./Calculator.module.css";
import { FarmForm } from "./FarmForm";

interface NumberFieldProps {
  id: string;
  value: number;
  min: number;
  max: number;
  step: number;
  integer?: boolean;
  onAccept(value: number): void;
  className: string;
}

/**
 * A number box the visitor can clear and retype. The estimate keeps the last number that was in
 * range, so the figures don't jump while typing; an entry out of range is outlined in red.
 */
function NumberField({ id, value, min, max, step, integer = false, onAccept, className }: NumberFieldProps) {
  const read = (text: string): number | null => {
    if (text.trim() === "") return null;
    const v = Number(text);
    return Number.isFinite(v) && v >= min && v <= max && (!integer || Number.isInteger(v)) ? v : null;
  };
  const [text, setText] = useState(String(value));
  const [badInput, setBadInput] = useState(false);
  const [shown, setShown] = useState(value);
  // The number changed from outside (say, a new state's tariff): show it instead.
  if (value !== shown) {
    setShown(value);
    if (read(text) !== value) setText(String(value));
  }
  const invalid = badInput || (text.trim() !== "" && read(text) === null);
  return (
    <input
      id={id}
      type="number"
      min={min}
      max={max}
      step={step}
      value={text}
      onChange={(e) => {
        const next = e.target.value;
        setText(next);
        setBadInput(e.target.validity.badInput);
        const v = read(next);
        if (v !== null) {
          setShown(v);
          onAccept(v);
        }
      }}
      aria-invalid={invalid || undefined}
      className={invalid ? `${className} ${s.invalid}` : className}
    />
  );
}

export function Calculator() {
  const { c } = useLang();
  const { state, result } = useCalc();
  const dispatch = useCalcDispatch();
  // Held here rather than in the farm form, so a request still running when the visitor
  // switches tabs keeps its outcome for when they come back.
  const farmLead = useLeadSubmit();
  const v = calcView(state, result, c);
  const id = useId();
  const ids = { title: id + "t", type: id + "ty", state: id + "s", bill: id + "b", rate: id + "r", houses: id + "h", kw: id + "k" };

  return (
    <section aria-labelledby={ids.title} className={s.card}>
      <div className={s.head}>
        <h2 id={ids.title} className={s.title}>{c.calc.title}</h2>
        <span className={s.asOf}>{c.calc.asOf}</span>
      </div>

      <div role="group" aria-label={c.calc.segAria} className={s.segments}>
        {SEGMENT_TABS.map((seg) => (
          <button key={seg} type="button" aria-pressed={state.seg === seg} onClick={() => dispatch({ type: "segment", seg })} className={s.segment}>
            {c.calc.segs[seg]}
          </button>
        ))}
      </div>

      {state.seg === "farm" ? (
        <FarmForm lead={farmLead} />
      ) : (
        <div className={s.body}>
          {state.seg === "home" && (
            <div className={f.field}>
              <span id={ids.type} className={f.label}>{c.calc.type}</span>
              <div role="group" aria-labelledby={ids.type} className={s.types}>
                {SYSTEM_TYPES.map((t) => (
                  <button key={t} type="button" aria-pressed={result.type === t} onClick={() => dispatch({ type: "systemType", systemType: t })} className={s.type}>
                    <span className={s.typeName}>{c.calc.types[t]}</span>
                    <span className={s.typeHint}>{c.calc.typeHint[t]}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className={f.field}>
            <label htmlFor={ids.state} className={f.label}>{c.calc.state}</label>
            <select id={ids.state} value={result.st.id} onChange={(e) => dispatch({ type: "state", id: e.target.value })} className={f.select}>
              {STATES.map((st) => (
                <option key={st.id} value={st.id}>
                  {c.stateNames[st.id as keyof typeof c.stateNames]}
                </option>
              ))}
            </select>
          </div>

          <div className={f.field}>
            <div className={s.labelRow}>
              <label htmlFor={ids.bill} className={f.label}>{v.billLabel}</label>
              <span className={s.reading}>{v.billStr}</span>
            </div>
            <input
              id={ids.bill}
              type="range"
              min={v.billMin}
              max={v.billMax}
              step={v.billStep}
              value={v.billVal}
              onChange={(e) => dispatch({ type: "bill", value: Number(e.target.value) })}
              aria-valuetext={v.billStr}
            />
            <div className={s.rateRow}>
              <label htmlFor={ids.rate}>{c.calc.rateLabel}</label>
              <NumberField
                key={result.seg}
                id={ids.rate}
                min={1}
                max={25}
                step={0.1}
                value={v.rateVal}
                onAccept={(value) => dispatch({ type: "rate", value })}
                className={`${s.number} ${s.rate}`}
              />
              <span>{c.calc.perUnit}</span>
            </div>
          </div>

          {state.seg === "soc" && (
            <div className={s.housesRow}>
              <label htmlFor={ids.houses} className={f.label}>{c.calc.houses}</label>
              <NumberField
                id={ids.houses}
                min={2}
                max={5000}
                step={1}
                integer
                value={v.housesVal}
                onAccept={(value) => dispatch({ type: "houses", value })}
                className={`${s.number} ${s.houses}`}
              />
            </div>
          )}

          <div className={f.field}>
            <div className={s.labelRow}>
              <label htmlFor={ids.kw} className={f.label}>{c.calc.size}</label>
              <span className={s.reading}>{v.kwStr}</span>
            </div>
            <input
              id={ids.kw}
              type="range"
              min="0"
              max={v.kwMax}
              step="1"
              value={v.kwIdx}
              onChange={(e) => dispatch({ type: "size", index: Number(e.target.value) })}
              aria-valuetext={v.kwStr}
            />
            <div className={s.recRow}>
              <span>{v.recText}</span>
              {v.showRec && (
                <button type="button" onClick={() => dispatch({ type: "size", index: v.recIdx })} className={s.useRec}>
                  {v.recBtn}
                </button>
              )}
            </div>
          </div>

          <div className={s.results}>
            <div className={s.tiles}>
              <div className={s.tile}>
                <p className={s.tileLabel}>{v.tile1Label}</p>
                <p className={s.tileValue}>{v.tile1}</p>
              </div>
              <div className={s.tile}>
                <p className={s.tileLabel}>{c.calc.tileSave}</p>
                <p className={s.tileValue}>{v.tile2}</p>
              </div>
              <div className={s.tile}>
                <p className={s.tileLabel}>{c.calc.tileBack}</p>
                <p className={s.tileValue}>{v.tile3}</p>
              </div>
            </div>

            <dl className={s.breakdown}>
              {v.rows.map((r) => (
                <div key={r.label} className={s.line}>
                  <dt className={s.lineLabel}>{r.label}</dt>
                  <dd className={s.lineValue}>{r.value}</dd>
                </div>
              ))}
              <div className={`${s.line} ${s.total}`}>
                <dt className={s.totalLabel}>{v.finalLabel}</dt>
                <dd className={s.totalValue}>{v.finalValue}</dd>
              </div>
            </dl>

            <ul className={s.extras}>
              {v.extras.map((x) => (
                <li key={x.label} className={s.extra}>
                  <span className={s.extraLabel}>{x.label}</span>
                  <strong className={s.extraValue}>{x.value}</strong>
                </li>
              ))}
            </ul>

            <div className={s.notes}>
              <p className={s.note}>{v.stateNote}</p>
              <p className={s.yieldNote}>{v.yieldNote}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
