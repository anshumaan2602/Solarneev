"use client";

import { useCallback, useMemo, useState } from "react";
import { site } from "@/config/site";
import { submitLead, type Lead } from "@/lib/leads";
import { useLang } from "../providers/LangProvider";
import s from "./LeadStatus.module.css";

export type LeadPhase = "idle" | "sending" | "sent" | "failed";

export interface LeadSubmit {
  phase: LeadPhase;
  /** Send the lead; resolves true once Web3Forms has accepted it. */
  send(lead: Lead): Promise<boolean>;
  /** Back to idle, e.g. when the visitor tries again and the form needs fixing first. */
  reset(): void;
}

/**
 * Send a lead and track where it is. Call this in a component that stays on the page while the
 * request runs, so its outcome is still there to show.
 */
export function useLeadSubmit(): LeadSubmit {
  const [phase, setPhase] = useState<LeadPhase>("idle");
  const send = useCallback(async (lead: Lead) => {
    setPhase("sending");
    const result = await submitLead(lead);
    setPhase(result.ok ? "sent" : "failed");
    return result.ok;
  }, []);
  const reset = useCallback(() => setPhase("idle"), []);
  return useMemo(() => ({ phase, send, reset }), [phase, send, reset]);
}

/** Not in the design: the message under a form once it has been sent, or failed to send. */
export function LeadStatus({ phase, success }: { phase: LeadPhase; success: string }) {
  const { c } = useLang();
  const [before, after = ""] = c.forms.failed.split("{phone}");
  const phone = site.phones[0];
  return (
    <>
      {/* Always on the page and visually hidden, so screen readers announce the thank-you when it arrives. */}
      <p role="status" className="sr-only" data-live-region="">
        {phase === "sent" ? success : ""}
      </p>
      {phase === "sent" && (
        <p aria-hidden="true" className={`${s.status} ${s.ok}`}>
          {success}
        </p>
      )}
      {phase === "failed" && (
        <p role="alert" className={`${s.status} ${s.failed}`}>
          {before}
          <a href={`tel:${phone.tel}`} className={s.phone}>
            {phone.display}
          </a>
          {after}
        </p>
      )}
    </>
  );
}
