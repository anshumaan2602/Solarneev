import { useEffect, useId, useRef, useState } from "react";
import { site } from "@/config/site";
import { fmtNum } from "@/lib/format";
import { presenceText, statAffixes, statNumbers, type StatNumber } from "@/lib/stats";
import { useLang } from "../providers/LangProvider";
import ui from "../ui/section.module.css";
import s from "./Stats.module.css";

const COUNT_MS = 1800;

/**
 * 0 → 1 over 1.8 s, eased, starting the first time the element scrolls into view.
 * Stays at 1 (the final numbers) before that, and always under reduced motion.
 */
function useCountUp(ref: React.RefObject<HTMLElement | null>) {
  const [progress, setProgress] = useState(1);
  useEffect(() => {
    const el = ref.current;
    if (!el || !window.IntersectionObserver || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((en) => en.isIntersecting)) return;
      io.disconnect();
      const t0 = performance.now();
      const step = (now: number) => {
        // The first frame's timestamp can be a little before t0; never count below zero.
        const t = Math.max(0, Math.min(1, (now - t0) / COUNT_MS));
        setProgress(t);
        if (t < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [ref]);
  return progress;
}

export function Stats() {
  const { c } = useLang();
  const id = useId();
  const sectionRef = useRef<HTMLElement>(null);
  const progress = useCountUp(sectionRef);
  const sn = statNumbers(site.stats);
  const af = statAffixes(sn, c);
  const eased = 1 - Math.pow(1 - progress, 3);
  const show = (n: StatNumber) => fmtNum(progress < 1 ? n.v * eased : n.v, n.dec);

  return (
    <section ref={sectionRef} aria-labelledby={id} className={s.section}>
      <div className={s.container}>
        <h2 id={id} className={ui.h2}>{c.stats.h2}</h2>
        <div className={s.row}>
          <div className={s.panelsCard}>
            <p className={s.bigLabel}>{c.stats.bigLabel}</p>
            <p className={s.bigNumber}>
              <span>{show(sn.panels)}</span>
              <span className={s.plus}>{af.panels.suf}</span>
            </p>
            <p className={s.bigSub}>{c.stats.bigSub}</p>
          </div>
          <dl className={s.list}>
            <div className={`${s.item} ${s.divided}`}>
              <dt className={s.itemLabel}>{c.stats.roofs}</dt>
              <dd className={s.itemValue}>
                <span>{show(sn.roofs)}</span>
                <span>{af.roofs.suf}</span>
              </dd>
            </div>
            <div className={`${s.item} ${s.divided}`}>
              <dt className={s.itemLabel}>{c.stats.cap}</dt>
              <dd className={s.itemValue}>
                <span>{show(sn.cap)}</span>
                <span>{af.cap.suf}</span>
              </dd>
            </div>
            <div className={s.item}>
              <dt className={s.itemLabel}>{c.stats.sub}</dt>
              <dd className={s.itemValue}>
                <span>{af.sub.pre}</span>
                <span>{show(sn.sub)}</span>
                <span>{af.sub.suf}</span>
              </dd>
            </div>
          </dl>
        </div>
        <div className={s.presence}>
          <p className={s.presenceText}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E57A00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={s.pin}>
              <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
              <circle cx="12" cy="9.5" r="2.5" />
            </svg>
            <span>{presenceText(sn, c)}</span>
          </p>
          <a href="#calculator" className={s.cta}>{c.stats.cta}</a>
        </div>
        {sn.sample && <p className={s.sample}>{c.stats.sample}</p>}
      </div>
    </section>
  );
}
