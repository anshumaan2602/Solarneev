// The solar estimate: price, subsidies, generation, 25-year savings, payback, loan EMI and the
// size suggestion. Ported from the design's calculator.

import { BUSINESS_TARIFF, PRICE_LIST, sizeSteps, stateById, type Segment, type SegmentTab, type StateInfo, type SystemType } from "./data";

export interface CalcState {
  seg: SegmentTab;
  /** State id, e.g. "UP". */
  st: string;
  homeType: SystemType;
  /** Position on the size slider, per segment. */
  kwIdx: Record<Segment, number>;
  /** Monthly bill in rupees, per segment. */
  bill: Record<Segment, number>;
  /** Top-slab tariff in rupees per unit, per segment. */
  rate: Record<Segment, number>;
  /** Homes in the society. */
  houses: number;
}

export interface PriceConfig {
  societyPricePerKw: number;
  businessPricePerKw: number;
}

export interface CalcResult {
  seg: Segment;
  st: StateInfo;
  type: SystemType;
  stops: number[];
  idx: number;
  kw: number;
  bill: number;
  rate: number;
  price: number;
  central: number;
  stateAmt: number;
  net: number;
  /** Year-one tax saving from accelerated depreciation (businesses). */
  ad: number;
  /** Units generated a month in year one. */
  gm: number;
  /** Delhi's per-unit generation incentive, rupees per unit. */
  gbi: number;
  /** Saving in year one. */
  y1: number;
  /** Saving over 25 years. */
  total: number;
  /** Payback in years, or null if it takes longer than 25. */
  pay: number | null;
  loan: number;
  emi: number;
  /** Suggested slider position for the bill. */
  recIdx: number;
  /** The bill needs more than the biggest size on the slider. */
  recMore: boolean;
  panels: number;
  socCap: number;
  /** Central subsidy per kW for housing societies in this state. */
  socRate: number;
  units: number;
}

/** Units per kW a year in western UP, which the home price list's generation figures assume. */
const UP_YIELD = 1350;
/** Rupees a unit for power exported beyond what the home uses. */
const EXPORT_RATE = 2.5;
/** Panel output lost each year. */
const DEGRADATION = 0.005;

/**
 * PM Surya Ghar central subsidy for a home: ₹30,000 per kW for the first 2 kW and ₹18,000 for
 * the third, nothing beyond. Hill and North-East ("special-category") states get 10% more.
 */
export function centralHomeSubsidy(kw: number, special: boolean): number {
  const first = special ? 33000 : 30000;
  const third = societySubsidyPerKw(special);
  return first * Math.min(kw, 2) + third * Math.max(0, Math.min(kw, 3) - 2);
}

/** Central subsidy per kW for housing societies (the same rate as a home's third kW). */
export function societySubsidyPerKw(special: boolean): number {
  return special ? 19800 : 18000;
}

/** Monthly instalment for a loan of P at an annual rate, over n months. */
function monthlyEmi(P: number, annualRate: number, months: number): number {
  if (P <= 0) return 0;
  const r = annualRate / 12;
  const q = Math.pow(1 + r, months);
  return (P * r * q) / (q - 1);
}

export function calc(s: CalcState, p: PriceConfig): CalcResult {
  const num = (v: unknown, d: number) => (typeof v === "number" && isFinite(v) && v >= 0 ? v : d);
  const seg: Segment = s.seg === "farm" ? "home" : s.seg;
  const st = stateById(s.st);
  const type: SystemType = s.homeType === "hyb" ? "hyb" : "on";
  const pl = PRICE_LIST[type];
  const stops = sizeSteps(seg, type);
  let idx = Number(s.kwIdx[seg]);
  if (!(idx >= 0)) idx = 0;
  idx = Math.min(stops.length - 1, Math.round(idx));
  const kw = stops[idx];
  const bill = Math.max(0, Number(s.bill[seg]) || 0);
  const rate = s.rate[seg] > 0 ? s.rate[seg] : seg === "biz" ? BUSINESS_TARIFF : st.tariff;
  const price =
    seg === "home"
      ? pl.cost[idx]
      : seg === "soc"
        ? 50000 + num(p.societyPricePerKw, 48000) * kw
        : 50000 + num(p.businessPricePerKw, 40000) * kw;

  const homeUnits = (i: number) => (pl.units[i] * st.yieldPerKw) / UP_YIELD;
  const socRate = societySubsidyPerKw(st.special);
  const socCap = Math.min(500, 3 * Math.max(1, s.houses));
  const central = seg === "home" ? centralHomeSubsidy(kw, st.special) : seg === "soc" ? socRate * Math.min(kw, socCap) : 0;

  let stateAmt = 0;
  if (seg === "home") {
    const bench = 50000 * Math.min(kw, 2) + 45000 * Math.max(0, kw - 2);
    if (st.topUp === "UP") stateAmt = Math.min(15000 * kw, 30000);
    else if (st.topUp === "DL") stateAmt = Math.min(10000 * Math.min(kw, 3), 30000);
    else if (st.topUp === "GJ") stateAmt = kw <= 2.18 ? Math.max(0, Math.round(0.9 * bench - centralHomeSubsidy(kw, st.special))) : 0;
    else if (st.topUp === "OD") stateAmt = Math.min(25000 * kw, 60000);
    else if (st.topUp === "BR") stateAmt = Math.min(10000 * kw, 20000);
    else if (st.topUp === "TN") stateAmt = kw >= 3 ? 22000 : kw >= 2 ? 10000 : kw >= 1 ? 5000 : 0;
  }
  const subsidy = Math.min(price, central + stateAmt);
  const net = price - subsidy;
  const ad = seg === "biz" ? price * 0.4 * 0.25 : 0;
  const gm = seg === "home" ? homeUnits(idx) : (kw * st.yieldPerKw) / 12;
  const used = rate > 0 ? bill / rate : 0;
  const gbi = seg === "home" && st.topUp === "DL" && kw <= 10 ? (kw <= 3 ? 3 : 2) : 0;

  const cost = net - ad;
  let cum = 0;
  let pay: number | null = null;
  let y1 = 0;
  for (let t = 0; t < 25; t++) {
    const g = gm * Math.pow(1 - DEGRADATION, t);
    let sv = 12 * (Math.min(g, used) * rate + Math.max(0, g - used) * EXPORT_RATE);
    if (t < 5) sv += 12 * g * gbi;
    if (t === 0) y1 = sv;
    if (pay === null && sv > 0 && cum + sv >= cost) pay = Math.max(0, t + (cost - cum) / sv);
    cum += sv;
  }

  let loan = 0;
  let emi = 0;
  if (seg === "home") {
    // Scheme loans, repaid over 10 years: up to ₹2 lakh at about 6% for systems up to 3 kW;
    // bigger home systems borrow up to ₹6 lakh at a higher rate, taken here as 8%.
    loan = Math.min(0.9 * price, kw <= 3 ? 200000 : 600000);
    emi = monthlyEmi(loan, kw <= 3 ? 0.06 : 0.08, 120);
  }

  let recIdx = stops.length - 1;
  let recMore = false;
  if (seg === "home") {
    for (let i = 0; i < stops.length; i++) {
      if (homeUnits(i) >= used - 0.5) {
        recIdx = i;
        break;
      }
    }
    recMore = homeUnits(stops.length - 1) < used - 0.5;
  } else {
    const rec = st.yieldPerKw > 0 ? used / (st.yieldPerKw / 12) : 0;
    for (let i = 0; i < stops.length; i++) {
      if (stops[i] >= rec - 0.05) {
        recIdx = i;
        break;
      }
    }
    recMore = rec > stops[stops.length - 1];
  }

  const panels = Math.ceil((kw * 1000) / 550);
  return {
    seg, st, type, stops, idx, kw, bill, rate, price, central, stateAmt, net, ad, gm, gbi, y1,
    total: cum, pay, loan, emi, recIdx, recMore, panels, socCap, socRate,
    units: seg === "home" ? pl.units[idx] : Math.round(gm),
  };
}
