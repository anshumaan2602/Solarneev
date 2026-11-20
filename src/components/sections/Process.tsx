import { useId } from "react";
import { useLang } from "../providers/LangProvider";
import ui from "../ui/section.module.css";
import s from "./Process.module.css";

/** Six steps from the first call to the subsidy arriving. */
export function Process() {
  const { c } = useLang();
  const id = useId();
  return (
    <section id="process" aria-labelledby={id} className={s.section}>
      <div className={ui.container}>
        <h2 id={id} className={`${ui.h2} ${s.title}`}>{c.process.h2}</h2>
        <ol className={s.steps}>
          {c.process.steps.map((step, i) => (
            <li key={i} className={s.step}>
              <span className={s.label}>{c.process.step + " " + (i + 1)}</span>
              <strong className={s.name}>{step.title}</strong>
              <span className={s.text}>{step.text}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
