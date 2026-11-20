import { useId, useState, type FormEvent } from "react";
import { menuOptions, shared } from "@/content";
import { parseIndianMobile } from "@/lib/leads";
import { useLang } from "../providers/LangProvider";
import f from "../ui/fields.module.css";
import { LeadStatus, type LeadSubmit } from "../ui/LeadStatus";
import s from "./FarmForm.module.css";

/**
 * The calculator's Farm tab: PM-KUSUM is between phases, so take the farmer's details instead.
 * The send state lives in the calculator, so its outcome survives a switch to another tab.
 */
export function FarmForm({ lead }: { lead: LeadSubmit }) {
  const { c, lang } = useLang();
  const id = useId();
  const [mobileError, setMobileError] = useState(false);
  const pumpSizes = menuOptions(shared.leadValues.pumpSize, c.farm.pumpOptions);
  const runsOn = menuOptions(shared.leadValues.pumpRunsOn, c.farm.runsOptions);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const mobile = parseIndianMobile(String(data.get("mobile") ?? ""));
    setMobileError(!mobile);
    if (!mobile) {
      lead.reset();
      form.querySelector<HTMLInputElement>("input[name=mobile]")?.focus();
      return;
    }
    const ok = await lead.send({
      subject: "PM-KUSUM 2.0 registration from solarneev.com",
      fields: {
        "Pump size": String(data.get("pump")),
        "Pump runs on": String(data.get("runs")),
        Mobile: mobile,
        "Page language": lang === "hi" ? "Hindi" : "English",
      },
      botcheck: data.has("botcheck"),
    });
    if (ok) form.reset();
  }

  return (
    <div className={s.wrap}>
      <div className={s.notice}>
        <p className={s.noticeTitle}>{c.farm.title}</p>
        <p className={s.noticeText}>{c.farm.text}</p>
      </div>
      <form onSubmit={onSubmit} noValidate className={s.form}>
        <div className={f.field}>
          <label htmlFor={id + "p"} className={f.label}>{c.farm.pump}</label>
          <select id={id + "p"} name="pump" className={f.select}>
            {pumpSizes.map((o) => (
              <option key={o.key} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className={f.field}>
          <label htmlFor={id + "r"} className={f.label}>{c.farm.runs}</label>
          <select id={id + "r"} name="runs" className={f.select}>
            {runsOn.map((o) => (
              <option key={o.key} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className={f.field}>
          <label htmlFor={id + "m"} className={f.label}>{c.farm.mob}</label>
          <input
            id={id + "m"}
            name="mobile"
            type="tel"
            autoComplete="tel"
            placeholder={c.farm.mobPh}
            aria-invalid={mobileError || undefined}
            aria-describedby={mobileError ? id + "me" : undefined}
            onInput={() => mobileError && setMobileError(false)}
            className={s.input}
          />
          {mobileError && <p id={id + "me"} className={f.error}>{c.forms.mobileInvalid}</p>}
        </div>
        <input type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" aria-hidden="true" className={s.trap} />
        <button type="submit" disabled={lead.phase === "sending"} className={s.submit}>
          {lead.phase === "sending" ? c.forms.sending : c.farm.btn}
        </button>
        <LeadStatus phase={lead.phase} success={c.forms.farmSuccess} />
      </form>
    </div>
  );
}
