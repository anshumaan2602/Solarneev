import { describe, expect, it } from "vitest";
import { STATES } from "@/lib/calc/data";
import { en } from "./en";
import { hi } from "./hi";
import { menuOptions, shared } from "./shared";

/** Every string in a copy object, keyed by its path. */
function leaves(v: unknown, path = ""): [string, string][] {
  if (typeof v === "string") return [[path, v]];
  if (Array.isArray(v)) return v.flatMap((x, i) => leaves(x, `${path}[${i}]`));
  if (v && typeof v === "object") return Object.entries(v).flatMap(([k, x]) => leaves(x, path ? `${path}.${k}` : k));
  return [];
}

const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(",");

describe("English and Hindi copy", () => {
  it("has no empty strings", () => {
    for (const [path, s] of [...leaves(en), ...leaves(hi)]) expect(s.trim(), path).not.toBe("");
  });
  it("uses the same {placeholders} in both languages", () => {
    const hiByPath = new Map(leaves(hi));
    for (const [path, s] of leaves(en)) {
      if (hiByPath.has(path)) expect(placeholders(hiByPath.get(path)!), path).toBe(placeholders(s));
    }
  });
  it("labels every menu option the forms send, in both languages", () => {
    const menus = [
      [shared.leadValues.pumpSize, en.farm.pumpOptions, hi.farm.pumpOptions],
      [shared.leadValues.pumpRunsOn, en.farm.runsOptions, hi.farm.runsOptions],
      [shared.leadValues.solarFor, en.contact.forOptions, hi.contact.forOptions],
      [shared.leadValues.monthlyBill, en.contact.billOptions, hi.contact.billOptions],
    ] as const;
    for (const [values, enLabels, hiLabels] of menus) {
      for (const labels of [enLabels, hiLabels]) {
        const options = menuOptions(values as Record<string, string>, labels as Record<string, string>);
        expect(options.map((o) => o.key)).toEqual(Object.keys(values));
        for (const o of options) expect(o.label, o.key).toBeTruthy();
      }
    }
  });
  it("sends the English wording, so English labels and sent values agree", () => {
    expect(en.contact.forOptions).toEqual(shared.leadValues.solarFor);
    expect(en.contact.billOptions).toEqual(shared.leadValues.monthlyBill);
    expect(en.farm.pumpOptions).toEqual(shared.leadValues.pumpSize);
    expect(en.farm.runsOptions).toEqual(shared.leadValues.pumpRunsOn);
  });
  it("has one team member and one review per placeholder person", () => {
    for (const c of [en, hi]) {
      expect(c.team.members).toHaveLength(shared.team.length);
      expect(c.reviews.quotes).toHaveLength(shared.reviews.length);
      expect(c.types.cards).toHaveLength(3);
    }
  });
  it("names and describes every state in the calculator", () => {
    for (const c of [en, hi]) {
      for (const { id } of STATES) {
        expect(c.stateNames[id as keyof typeof c.stateNames], id).toBeTruthy();
        expect(c.stateNotes[id as keyof typeof c.stateNotes], id).toBeTruthy();
      }
    }
  });
});
