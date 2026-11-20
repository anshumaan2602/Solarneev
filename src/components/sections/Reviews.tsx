import { useId } from "react";
import { shared } from "@/content";
import { useLang } from "../providers/LangProvider";
import { ArrowIcon, QuoteIcon } from "../ui/icons";
import ui from "../ui/section.module.css";
import s from "./Reviews.module.css";

/** Customer quotes with their bill before and after. All placeholders until real reviews are in. */
export function Reviews() {
  const { c } = useLang();
  const id = useId();
  const r = c.reviews;
  const [lead, ...others] = r.quotes;
  const [leadPerson, ...otherPeople] = shared.reviews;
  return (
    <section id="reviews" aria-labelledby={id} className={s.section}>
      <div className={ui.container}>
        <div className={s.top}>
          <div className={s.intro}>
            <h2 id={id} className={`${ui.h2} ${s.title}`}>{r.h2}</h2>
            <p className={s.lead}>{r.p}</p>
          </div>
          <p className={s.rating}>
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2.8l2.8 5.7 6.3.9-4.6 4.4 1.1 6.2L12 17l-5.6 3 1.1-6.2L2.9 9.4l6.3-.9z" fill="#E57A00" />
            </svg>
            <span>{r.rating}</span>
          </p>
        </div>

        <div className={s.grid}>
          <article className={s.feature}>
            <div className={s.photo}>
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 11l9-7 9 7" />
                <path d="M5 10v10h14V10" />
                <path d="M9 20v-5h6v5" />
                <path d="M14.5 6.5l3.5 2.7" />
              </svg>
              <span className={s.photoLabel}>{r.photo}</span>
            </div>
            <div className={s.featureBody}>
              <blockquote className={s.featureQuote}>
                <QuoteIcon size={34} fill="#FC8C0A" />
                <p className={s.featureText}>{lead.quote}</p>
              </blockquote>
              <div className={s.featureFoot}>
                <div className={s.who}>
                  <span className={s.featureName}>{leadPerson.name}</span>
                  <span className={s.featureMeta}>{lead.meta}</span>
                </div>
                <div className={s.bills}>
                  <div className={s.bill}>
                    <span className={s.featureBillLabel}>{r.before}</span>
                    <span className={s.featureAmount}>{leadPerson.before}</span>
                  </div>
                  <ArrowIcon size={18} stroke="#A7C1CC" />
                  <div className={s.bill}>
                    <span className={s.featureBillLabel}>{r.after}</span>
                    <span className={`${s.featureAmount} ${s.featureAfter}`}>{leadPerson.after}</span>
                  </div>
                </div>
              </div>
            </div>
          </article>

          <div className={s.side}>
            {others.map((q, i) => {
              const person = otherPeople[i];
              return (
                <article key={i} className={s.card}>
                  <blockquote className={s.cardQuote}>
                    <QuoteIcon size={26} fill="#E57A00" />
                    <p className={s.cardText}>{q.quote}</p>
                  </blockquote>
                  <div className={s.cardFoot}>
                    <div className={s.who}>
                      <span className={s.cardName}>{person.name}</span>
                      <span className={s.cardMeta}>{q.meta}</span>
                    </div>
                    <div className={s.cardBills}>
                      <div className={s.bill}>
                        <span className={s.cardBillLabel}>{r.before}</span>
                        <span className={s.cardAmount}>{person.before}</span>
                      </div>
                      <ArrowIcon size={16} stroke="#6B6156" />
                      <div className={s.bill}>
                        <span className={s.cardBillLabel}>{r.after}</span>
                        <span className={`${s.cardAmount} ${s.cardAfter}`}>{person.after}</span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
