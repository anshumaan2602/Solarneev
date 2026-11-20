// Calculator state changes, one action per control on the page.

import type { CalcState } from "./calc";
import { BUSINESS_TARIFF, PRICE_LIST, sizeSteps, stateById, type Segment, type SegmentTab, type SystemType } from "./data";

/** Uttar Pradesh: SOLARNEEV's home state, the calculator's default and the package table's basis. */
const UP = stateById("UP");

/** What a visitor sees first: a 3 kW on-grid home, a 40 kW society or a 50 kW business, in UP. */
export const INITIAL_CALC_STATE: CalcState = {
  seg: "home",
  st: UP.id,
  homeType: "on",
  kwIdx: {
    home: PRICE_LIST.on.kw.indexOf(3),
    soc: sizeSteps("soc", "on").indexOf(40),
    biz: sizeSteps("biz", "on").indexOf(50),
  },
  bill: { home: 2500, soc: 30000, biz: 50000 },
  rate: { home: UP.tariff, soc: UP.tariff, biz: BUSINESS_TARIFF },
  houses: 40,
};

export type CalcAction =
  | { type: "segment"; seg: SegmentTab }
  | { type: "state"; id: string }
  | { type: "bill"; value: number }
  /** A tariff the field accepted (1–25). */
  | { type: "rate"; value: number }
  | { type: "size"; index: number }
  /** A number of homes the field accepted (2–5,000). */
  | { type: "houses"; value: number }
  | { type: "systemType"; systemType: SystemType }
  /** "Calculate" on a package row: that home system, priced as the table shows it. */
  | { type: "package"; systemType: SystemType; index: number };

/** The farm tab has no inputs of its own; the home figures stay behind it. */
const active = (s: CalcState): Segment => (s.seg === "farm" ? "home" : s.seg);

export function calcReducer(s: CalcState, a: CalcAction): CalcState {
  switch (a.type) {
    case "segment":
      return { ...s, seg: a.seg };
    case "state": {
      // A new state brings its typical tariff for homes and societies.
      const tariff = stateById(a.id).tariff;
      return { ...s, st: a.id, rate: { ...s.rate, home: tariff, soc: tariff } };
    }
    case "bill":
      return { ...s, bill: { ...s.bill, [active(s)]: a.value } };
    case "rate":
      return { ...s, rate: { ...s.rate, [active(s)]: a.value } };
    case "size":
      return { ...s, kwIdx: { ...s.kwIdx, [active(s)]: a.index } };
    case "houses":
      return { ...s, houses: a.value };
    case "systemType": {
      if (s.homeType === a.systemType) return s;
      // Keep the same kW when the other price list has it; otherwise snap to the nearest end.
      const from = PRICE_LIST[s.homeType].kw;
      const to = PRICE_LIST[a.systemType].kw;
      const i0 = Math.min(from.length - 1, Math.max(0, Math.round(Number(s.kwIdx.home) || 0)));
      const kw = from[i0];
      let ni = to.indexOf(kw);
      if (ni < 0) ni = kw < to[0] ? 0 : to.length - 1;
      return { ...s, homeType: a.systemType, kwIdx: { ...s.kwIdx, home: ni } };
    }
    case "package": {
      // The table shows Uttar Pradesh subsidies, so the calculator opens in UP to match the row.
      const inUP = s.st === UP.id ? s : calcReducer(s, { type: "state", id: UP.id });
      return { ...inUP, seg: "home", homeType: a.systemType, kwIdx: { ...inUP.kwIdx, home: a.index } };
    }
  }
}
