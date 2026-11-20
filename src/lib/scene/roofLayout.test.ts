import { describe, expect, it } from "vitest";
import { MAX_SCENE_PANELS, panelSlots } from "./roofLayout";

/** The design's original layout: rows of 7, 7 and 5, the back row shifted right by 1. */
function designSlots(n: number): [number, number][] {
  const out: [number, number][] = [];
  const a = Math.min(n, 7);
  const b = Math.min(Math.max(n - 7, 0), 7);
  const c = Math.min(Math.max(n - 14, 0), 5);
  for (let i = 0; i < a; i++) out.push([i - (a - 1) / 2, 2.25]);
  for (let i = 0; i < b; i++) out.push([i - (b - 1) / 2, -0.05]);
  for (let i = 0; i < c; i++) out.push([1 + (i - (c - 1) / 2), -2.35]);
  return out;
}

describe("roof layout", () => {
  it("holds 19 panels", () => {
    expect(MAX_SCENE_PANELS).toBe(19);
  });
  it("places panels exactly as the design did, for every count", () => {
    for (let n = 0; n <= MAX_SCENE_PANELS; n++) expect(panelSlots(n), `${n} panels`).toEqual(designSlots(n));
  });
  it("never returns more slots than the roof has", () => {
    expect(panelSlots(73)).toHaveLength(MAX_SCENE_PANELS);
  });
});
