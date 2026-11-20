import { useId } from "react";
import { useLang } from "../providers/LangProvider";
import ui from "../ui/section.module.css";
import s from "./LoansWarrantyDocs.module.css";

/** Solar loans, low-upfront models, warranty terms and the documents to keep ready. */
export function LoansWarrantyDocs() {
  const { c } = useLang();
  const id = useId();
  return (
    <section id="loans" aria-labelledby={id} className={s.section}>
      <div className={ui.container}>
        <h2 id={id} className={`${ui.h2} ${s.title}`}>{c.loans.sec}</h2>
        <div className={s.grid}>
          <div className={`${s.box} ${s.wide} ${s.white}`}>
            <h3 className={s.loanTitle}>{c.loans.h2}</h3>
            <p className={s.loanP1}>{c.loans.p1}</p>
            <p className={s.loanP2}>{c.loans.p2}</p>
          </div>
          <div className={`${s.box} ${s.narrow} ${s.sand}`}>
            <h3 className={s.h3}>{c.loans.h3}</h3>
            <p className={s.upfront}>{c.loans.p3}</p>
          </div>
          <div id="warranty" className={`${s.box} ${s.narrow} ${s.sand}`}>
            <h3 className={s.h3}>{c.warranty.h3}</h3>
            <dl className={s.warranty}>
              {c.warranty.items.map((w) => (
                <div key={w.k} className={s.term}>
                  <dt className={s.termName}>
                    <span aria-hidden="true" className={s.years}>{w.n}</span>
                    {w.k}
                  </dt>
                  <dd className={s.termValue}>{w.v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className={`${s.box} ${s.wide} ${s.white}`}>
            <h3 className={s.h3}>{c.docs.h3}</h3>
            <p className={s.docsLead}>{c.docs.p}</p>
            <ul className={s.docs}>
              {c.docs.items.map((doc) => (
                <li key={doc} className={s.doc}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9A5200" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={s.docIcon}>
                    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
                    <path d="M14 3v5h5" />
                    <path d="M9 13h6" />
                    <path d="M9 17h4" />
                  </svg>
                  {doc}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
