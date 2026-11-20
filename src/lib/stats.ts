// "Our work so far": the four headline numbers and the line about where SOLARNEEV works.

import type { Copy } from "@/content";
import type { SiteConfig } from "@/config/site";
import { fmt, fmtNum } from "./format";

/** The design's sample figures, shown for any figure not yet set in src/config/site.ts. */
export const SAMPLE_STATS: Record<keyof SiteConfig["stats"], number> = {
  panelsInstalled: 1000,
  rooftops: 150,
  capacityKw: 550,
  subsidySecuredLakh: 100,
  cities: 12,
  statesServed: 3,
};

export interface StatNumber {
  /** Final value, in the unit it is shown in (kW or MW, lakh or crore). */
  v: number;
  /** Decimal places to show. */
  dec: number;
}

export interface StatNumbers {
  panels: StatNumber;
  roofs: StatNumber;
  cap: StatNumber & { mw: boolean };
  sub: StatNumber & { cr: boolean };
  cities: number;
  states: number;
  /** Some figures are still the design's samples. */
  sample: boolean;
}

export function statNumbers(p: SiteConfig["stats"]): StatNumbers {
  const value = (k: keyof SiteConfig["stats"]) => Math.max(0, Math.round(p[k] ?? SAMPLE_STATS[k]));
  const panels = value("panelsInstalled");
  const roofs = value("rooftops");
  const capKw = value("capacityKw");
  const subL = value("subsidySecuredLakh");
  const decs = (v: number) => {
    const h = Math.round(v * 100);
    return h % 100 === 0 ? 0 : h % 10 === 0 ? 1 : 2;
  };
  // 1,000 kW and up shows as MW; 100 lakh and up shows as crore.
  const capMW = capKw >= 1000;
  const capV = capMW ? Math.round(capKw / 100) / 10 : capKw;
  const subCr = subL >= 100;
  const subV = subCr ? subL / 100 : subL;
  return {
    panels: { v: panels, dec: 0 },
    roofs: { v: roofs, dec: 0 },
    cap: { v: capV, dec: capMW ? decs(capV) : 0, mw: capMW },
    sub: { v: subV, dec: subCr ? decs(subV) : 0, cr: subCr },
    cities: Math.max(1, value("cities")),
    states: Math.max(1, value("statesServed")),
    sample: Object.values(p).some((v) => v === null),
  };
}

/** Units and suffixes shown around each number, e.g. "₹" + "1" + " crore+". */
export function statAffixes(sn: StatNumbers, c: Copy) {
  return {
    panels: { pre: "", suf: "+" },
    roofs: { pre: "", suf: "+" },
    cap: { pre: "", suf: sn.cap.mw ? " MW" : " kW" },
    sub: { pre: "₹", suf: " " + (sn.sub.cr ? c.estimate.crore : c.estimate.lakh) + "+" },
  };
}

/** "Based in Meerut, we serve 12 cities across 3 states." */
export function presenceText(sn: StatNumbers, c: Copy): string {
  const cs = c.stats;
  return fmt(cs.pres, {
    c: sn.cities,
    cw: sn.cities === 1 ? cs.cw1 : cs.cwN,
    sp: sn.states === 1 ? cs.sp1 : fmt(cs.spN, { s: sn.states }),
  });
}

/** The hero's fourth proof point: "150+ rooftops solarised since [YEAR]". */
export function rooftopsProof(sn: StatNumbers, c: Copy): string {
  return fmt(c.hero.proof4, { n: fmtNum(sn.roofs.v, 0) });
}
