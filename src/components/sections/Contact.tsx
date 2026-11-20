import { useId, useState, type FormEvent } from "react";
import { site } from "@/config/site";
import { menuOptions, shared } from "@/content";
import { parseIndianMobile } from "@/lib/leads";
import { useLang } from "../providers/LangProvider";
import f from "../ui/fields.module.css";
import { LeadStatus, useLeadSubmit } from "../ui/LeadStatus";
import ui from "../ui/section.module.css";
import s from "./Contact.module.css";

type Problem = "name" | "mobile";

/** Contact details beside the call-back form. */
export function Contact() {
  const { c, lang } = useLang();
  const id = useId();
  const { phase, send, reset } = useLeadSubmit();
  const [problems, setProblems] = useState<Problem[]>([]);
  const solarFor = menuOptions(shared.leadValues.solarFor, c.contact.forOptions);
  const monthlyBill = menuOptions(shared.leadValues.monthlyBill, c.contact.billOptions);
  const fieldId = (name: string) => id + name;
  const errorProps = (p: Problem) =>
    problems.includes(p) ? { "aria-invalid": true, "aria-describedby": fieldId(p + "Error") } : {};

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const mobile = parseIndianMobile(String(data.get("mobile") ?? ""));
    const found: Problem[] = [];
    if (!name) found.push("name");
    if (!mobile) found.push("mobile");
    setProblems(found);
    if (found.length) {
      reset(); // nothing is sent, so no earlier thank-you either
      form.querySelector<HTMLInputElement>(`[name=${found[0]}]`)?.focus();
      return;
    }
    const ok = await send({
      subject: "Call-back request from solarneev.com",
      fields: {
        Name: name,
        Mobile: mobile!,
        "PIN code": String(data.get("pin") ?? "").trim(),
        "Solar for": String(data.get("for")),
        "Monthly bill": String(data.get("bill")),
        "Page language": lang === "hi" ? "Hindi" : "English",
      },
      botcheck: data.has("botcheck"),
    });
    if (ok) form.reset();
  }

  const clear = (p: Problem) => () => problems.includes(p) && setProblems(problems.filter((x) => x !== p));

  return (
    <section id="contact" aria-labelledby={id} className={s.section}>
      <div className={s.container}>
        <div className={s.info}>
          <h2 id={id} className={`${ui.h2} ${s.title}`}>{c.contact.h2}</h2>
          <p className={s.lead}>{c.contact.p}</p>
          <dl className={s.details}>
            <div className={s.phoneGroup}>
              <dt className={s.term}>{c.contact.l1}</dt>
              <dd className={s.phones}>
                {site.phones.map((p) => (
                  <a key={p.tel} href={`tel:${p.tel}`} className={s.phone}>{p.display}</a>
                ))}
              </dd>
            </div>
            <div className={s.group}>
              <dt className={s.term}>{c.contact.l2}</dt>
              <dd className={s.value}>
                <a href={`mailto:${site.email}`} className={s.email}>{site.email}</a>
              </dd>
            </div>
            <div className={s.group}>
              <dt className={s.term}>{c.contact.l4}</dt>
              <dd className={s.value}>
                <a href={site.website.href} className={s.link}>{site.website.display}</a>
              </dd>
            </div>
            <div className={s.group}>
              <dt className={s.term}>{c.contact.l3}</dt>
              <dd className={s.address}>{site.address}</dd>
              <dd className={s.directions}>
                <a href={site.mapsUrl} className={s.directionsLink}>{c.contact.dir}</a>
              </dd>
            </div>
          </dl>
        </div>

        <form onSubmit={onSubmit} noValidate className={s.form}>
          <div className={f.field}>
            <label htmlFor={fieldId("name")} className={f.label}>{c.contact.name}</label>
            <input id={fieldId("name")} name="name" type="text" autoComplete="name" onInput={clear("name")} {...errorProps("name")} className={s.input} />
            {problems.includes("name") && <p id={fieldId("nameError")} className={f.error}>{c.forms.nameRequired}</p>}
          </div>
          <div className={s.pair}>
            <div className={f.field}>
              <label htmlFor={fieldId("mobile")} className={f.label}>{c.contact.mobile}</label>
              <input id={fieldId("mobile")} name="mobile" type="tel" autoComplete="tel" onInput={clear("mobile")} {...errorProps("mobile")} className={s.input} />
              {problems.includes("mobile") && <p id={fieldId("mobileError")} className={f.error}>{c.forms.mobileInvalid}</p>}
            </div>
            <div className={f.field}>
              <label htmlFor={fieldId("pin")} className={f.label}>{c.contact.pin}</label>
              <input id={fieldId("pin")} name="pin" type="text" inputMode="numeric" autoComplete="postal-code" className={s.input} />
            </div>
          </div>
          <div className={s.pair}>
            <div className={f.field}>
              <label htmlFor={fieldId("for")} className={f.label}>{c.contact.forL}</label>
              <select id={fieldId("for")} name="for" className={s.select}>
                {solarFor.map((o) => (
                  <option key={o.key} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className={f.field}>
              <label htmlFor={fieldId("bill")} className={f.label}>{c.contact.billL}</label>
              <select id={fieldId("bill")} name="bill" className={s.select}>
                {monthlyBill.map((o) => (
                  <option key={o.key} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
          <input type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" aria-hidden="true" className={s.trap} />
          <button type="submit" disabled={phase === "sending"} className={s.submit}>
            {phase === "sending" ? c.forms.sending : c.contact.submit}
          </button>
          <LeadStatus phase={phase} success={c.forms.contactSuccess} />
        </form>
      </div>
    </section>
  );
}
