import { describe, expect, it } from "vitest";
import { site } from "@/config/site";
import { en } from "@/content/en";
import { SAMPLE_STATS, presenceText, statNumbers } from "./stats";

const allSet = { ...SAMPLE_STATS };
const stats = (patch: Partial<typeof site.stats>) => statNumbers({ ...allSet, ...patch });

describe("statNumbers", () => {
  it("shows the design's samples, labelled, while figures are unset", () => {
    const none = statNumbers({ panelsInstalled: null, rooftops: null, capacityKw: null, subsidySecuredLakh: null, cities: null, statesServed: null });
    expect([none.panels.v, none.roofs.v, none.cap.v, none.sample]).toEqual([1000, 150, 550, true]);
  });
  it("keeps the sample label until every figure is set", () => {
    expect(stats({ rooftops: 162, cities: null }).sample).toBe(true);
    expect(stats({ rooftops: 162 }).sample).toBe(false);
  });
  it("switches to MW from 1,000 kW and to crore from 100 lakh", () => {
    expect(stats({ capacityKw: 550 }).cap).toEqual({ v: 550, dec: 0, mw: false });
    expect(stats({ capacityKw: 1250 }).cap).toEqual({ v: 1.3, dec: 1, mw: true });
    expect(stats({ subsidySecuredLakh: 100 }).sub).toEqual({ v: 1, dec: 0, cr: true });
    expect(stats({ subsidySecuredLakh: 250 }).sub).toEqual({ v: 2.5, dec: 1, cr: true });
    expect(stats({ subsidySecuredLakh: 85 }).sub).toEqual({ v: 85, dec: 0, cr: false });
  });
  it("words the presence line for one city and one state", () => {
    expect(presenceText(stats({}), en)).toBe("Based in Meerut, we serve 12 cities across 3 states.");
    expect(presenceText(stats({ cities: 1, statesServed: 1 }), en)).toBe("Based in Meerut, we serve 1 city in our state.");
  });
});
