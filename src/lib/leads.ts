// Sends a form to the business inbox through Web3Forms (https://web3forms.com).
// The access key is public by design: Web3Forms ties it to one destination address.
// It is read at build time, so set NEXT_PUBLIC_WEB3FORMS_KEY before `npm run build`.

const ENDPOINT = "https://api.web3forms.com/submit";

export type LeadResult =
  | { ok: true }
  | { ok: false; reason: "missing-key" | "rejected" | "network" };

export interface Lead {
  /** Email subject line. */
  subject: string;
  /** The fields to send, labelled the way they should read in the email. */
  fields: Record<string, string>;
  /** True if the hidden spam-trap field was filled in, which people never do. */
  botcheck?: boolean;
}

/**
 * Read an Indian mobile number typed any common way: 98765 43210, +91 98765-43210, 0091 98765 43210,
 * 098765 43210, or in Devanagari digits (९८७६५४३२१०). Returns the 10 digits, or null.
 */
export function parseIndianMobile(raw: string): string | null {
  const compact = raw
    .replace(/[०-९]/g, (d) => String(d.charCodeAt(0) - 0x0966)) // Devanagari digits
    .replace(/[\s\-().]/g, "");
  const match = /^(?:(?:\+|00)?91)?0?([6-9]\d{9})$/.exec(compact);
  return match ? match[1] : null;
}

export async function submitLead(lead: Lead, key = process.env.NEXT_PUBLIC_WEB3FORMS_KEY): Promise<LeadResult> {
  if (lead.botcheck) return { ok: true }; // a bot: drop it quietly
  if (!key) {
    console.error("Lead not sent: NEXT_PUBLIC_WEB3FORMS_KEY is not set. See README.md.");
    return { ok: false, reason: "missing-key" };
  }
  const body = new FormData();
  body.append("access_key", key);
  body.append("subject", lead.subject);
  body.append("from_name", "SOLARNEEV website");
  for (const [name, value] of Object.entries(lead.fields)) body.append(name, value);
  try {
    const res = await fetch(ENDPOINT, { method: "POST", body, headers: { Accept: "application/json" } });
    const json: unknown = await res.json().catch(() => null);
    const success = typeof json === "object" && json !== null && (json as { success?: unknown }).success === true;
    return res.ok && success ? { ok: true } : { ok: false, reason: "rejected" };
  } catch {
    return { ok: false, reason: "network" };
  }
}
