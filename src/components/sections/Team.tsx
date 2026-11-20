import { useId } from "react";
import founderPhoto from "@/assets/founder.jpg";
import customerSuccessPhoto from "@/assets/team-customer-success.jpg";
import operationsManagerPhoto from "@/assets/team-operations-manager.jpg";
import siteEngineerPhoto from "@/assets/team-site-engineer.jpg";
import vinayakKadPhoto from "@/assets/team-vinayak-kad.jpg";
import { shared } from "@/content";
import { useLang } from "../providers/LangProvider";
import { PersonIcon } from "../ui/icons";
import ui from "../ui/section.module.css";
import s from "./Team.module.css";

/** Team photos, by the `photo` key in shared.team. Members without one show a placeholder. */
const MEMBER_PHOTOS: Record<string, { src: string; width: number; height: number }> = {
  "vinayak-kad": vinayakKadPhoto,
  "operations-manager": operationsManagerPhoto,
  "site-engineer": siteEngineerPhoto,
  "customer-success": customerSuccessPhoto,
};

/** The founder and the people customers deal with. Some names and photos are still placeholders. */
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
            {/* A plain <img>: the site is a static export, so next/image's optimiser is not available. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={founderPhoto.src} alt={shared.founder.name} width={founderPhoto.width} height={founderPhoto.height} loading="lazy" className={s.founderImg} />
          </div>
          <div className={s.founderText}>
            <p className={s.role}>{c.team.founderRole}</p>
            <p className={s.founderName}>{shared.founder.name}</p>
            <p className={s.cred}>{c.team.cred}</p>
          </div>
        </article>

        <div className={s.members}>
          {c.team.members.map((m, i) => {
            const { name, photo: photoKey } = shared.team[i];
            const photo = MEMBER_PHOTOS[photoKey];
            return (
              <article key={i} className={s.member}>
                <div className={s.memberPhoto}>
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element -- static export: no image optimiser
                    <img src={photo.src} alt={name.startsWith("[") ? m.role : name} width={photo.width} height={photo.height} loading="lazy" className={s.memberImg} />
                  ) : (
                    <>
                      <PersonIcon size={46} strokeWidth={1.5} />
                      <span className={s.memberPhotoLabel}>{c.team.photo}</span>
                    </>
                  )}
                </div>
                <div className={s.memberText}>
                  <p className={s.memberName}>{name}</p>
                  <p className={s.memberRole}>{m.role}</p>
                  <p className={s.memberLine}>{m.line}</p>
                  {"note" in m && m.note && <p className={s.memberNote}>{m.note}</p>}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
