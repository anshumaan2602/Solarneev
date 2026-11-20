import { useId } from "react";
import { shared } from "@/content";
import { useLang } from "../providers/LangProvider";
import { PersonIcon } from "../ui/icons";
import ui from "../ui/section.module.css";
import s from "./Team.module.css";

/** The founder and the three people customers deal with. Names and photos are placeholders for now. */
export function Team() {
  const { c } = useLang();
  const id = useId();
  return (
    <section id="team" aria-labelledby={id} className={s.section}>
      <div className={ui.container}>
        <div className={s.top}>
          <h2 id={id} className={`${ui.h2} ${s.title}`}>{c.team.h2}</h2>
          <p className={s.lead}>{c.team.p}</p>
        </div>

        <article className={s.founder}>
          <div className={s.founderPhoto}>
            <PersonIcon size={60} strokeWidth={1.4} />
            <span className={s.founderPhotoLabel}>{c.team.photo}</span>
          </div>
          <div className={s.founderText}>
            <p className={s.role}>{c.team.founderRole}</p>
            <p className={s.founderName}>{shared.founder.name}</p>
            <blockquote className={s.quote}>{c.team.quote}</blockquote>
            <p className={s.cred}>{c.team.cred}</p>
          </div>
        </article>

        <div className={s.members}>
          {c.team.members.map((m, i) => (
            <article key={i} className={s.member}>
              <div className={s.memberPhoto}>
                <PersonIcon size={46} strokeWidth={1.5} />
                <span className={s.memberPhotoLabel}>{c.team.photo}</span>
              </div>
              <div className={s.memberText}>
                <p className={s.memberName}>{shared.team[i].name}</p>
                <p className={s.memberRole}>{m.role}</p>
                <p className={s.memberLine}>{m.line}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
