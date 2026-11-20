// Every piece of text the calculator, the 3D stage and the package table show,
// built from the estimate and the copy. Pure functions, so they can be tested directly.

import type { Copy } from "@/content";
import { fmt, fmtNum, inr, inrShort, kw } from "../format";
import { MAX_SCENE_PANELS } from "../scene/roofLayout";
import { calc, centralHomeSubsidy, type CalcResult, type CalcState, type PriceConfig } from "./calc";
import { PRICE_LIST, billRange, type SystemType } from "./data";
import { INITIAL_CALC_STATE } from "./reducer";

export interface Line {
  label: string;
  value: string;
}

export interface CalcView {
  billLabel: string;
  billStr: string;
  billMin: number;
  billMax: number;
  billStep: number;
  billVal: number;
  rateVal: number;
  housesVal: number;
  kwIdx: number;
  kwMax: number;
  kwStr: string;
  recText: string;
  showRec: boolean;
  recBtn: string;
  recIdx: number;
  tile1Label: string;
  tile1: string;
  tile2: string;
  tile3: string;
  rows: Line[];
  finalLabel: string;
  finalValue: string;
  extras: Line[];
  stateNote: string;
  yieldNote: string;
}

export function calcView(s: CalcState, r: CalcResult, c: Copy): CalcView {
  const d = c.estimate;
  const br = billRange(r.seg);
  const recKw = r.stops[r.recIdx];
  const stName = c.stateNames[r.st.id as keyof Copy["stateNames"]];
  const rows: Line[] = [{ label: r.seg === "home" ? fmt(d.rPkg, { t: d.tLower[r.type] }) : d.rPrice, value: inr(r.price) }];
  let finalLabel = d.fPay;
  let finalValue = inr(r.net);
  let tile1Label = d.tilePay;
  let tile1 = inrShort(r.net, d);
  let extras: Line[];
  let stateNote = c.stateNotes[r.st.id as keyof Copy["stateNotes"]];
  if (r.seg === "home") {
    rows.push({ label: r.st.special ? d.rCentralSp : d.rCentral, value: "− " + inr(r.central) });
    if (r.stateAmt > 0) rows.push({ label: fmt(d.rTop, { s: stName }), value: "− " + inr(r.stateAmt) });
    extras = [
      { label: d.x25, value: inrShort(r.total, d) },
      { label: d.xEmi, value: fmt(d.aMonth, { v: inr(r.emi) }) },
    ];
    if (r.type === "hyb") stateNote = stateNote + " " + d.hybNote;
  } else if (r.seg === "soc") {
    rows.push({ label: fmt(d.rSoc, { r: inr(r.socRate) }), value: "− " + inr(r.central) });
    extras = [
      { label: d.x25, value: inrShort(r.total, d) },
      { label: d.xCounted, value: kw(Math.min(r.kw, r.socCap)) },
    ];
    stateNote = d.socNote;
  } else {
    rows.push({ label: d.rCap, value: d.none });
    rows.push({ label: d.rAd, value: fmt(d.upTo, { v: inr(r.ad) }) });
    finalLabel = d.fInvest;
    finalValue = inr(r.price);
    tile1Label = d.tileCost;
    tile1 = inrShort(r.price, d);
    extras = [
      { label: d.x25, value: inrShort(r.total, d) },
      { label: d.xNet, value: d.netVal },
    ];
    stateNote = d.bizNote;
  }
  const tile3 = r.pay === null ? d.over25 : r.pay < 1 ? d.under1 : fmt(d.years, { n: r.pay.toFixed(1) });
  const yieldNote =
    r.seg === "home"
      ? fmt(d.yieldHome, { t: d.tLower[r.type], u: fmtNum(r.units), adj: r.st.id === "UP" ? "" : fmt(d.adj, { s: stName }) })
      : fmt(d.yield, { y: fmtNum(r.st.yieldPerKw), s: stName });
  return {
    billLabel: r.seg === "soc" ? d.billSoc : d.billHome,
    billStr: inr(r.bill),
    billMin: br.min,
    billMax: br.max,
    billStep: br.step,
    billVal: r.bill,
    rateVal: s.rate[r.seg],
    housesVal: s.houses,
    kwIdx: r.idx,
    kwMax: r.stops.length - 1,
    kwStr: kw(r.kw),
    recText: fmt(d.suggest, { kw: kw(recKw) }) + (r.recMore ? d.orMore : ""),
    showRec: r.recIdx !== r.idx,
    recBtn: fmt(d.use, { kw: kw(recKw) }),
    recIdx: r.recIdx,
    tile1Label,
    tile1,
    tile2: inr(r.y1 / 12),
    tile3,
    rows,
    finalLabel,
    finalValue,
    extras,
    stateNote,
    yieldNote,
  };
}

export interface StageView {
  panelsShown: number;
  panelChip: string;
  sceneLabel: string;
  facts: Line[];
}

export function stageView(r: CalcResult, c: Copy): StageView {
  const d = c.estimate;
  const shown = Math.min(MAX_SCENE_PANELS, r.panels);
  return {
    panelsShown: shown,
    panelChip: r.panels > MAX_SCENE_PANELS ? fmt(d.chipShown, { s: shown, n: r.panels }) : fmt(d.chipOn, { n: r.panels }),
    sceneLabel: fmt(d.scene, { n: shown }),
    facts: [
      { label: d.fPanels, value: r.panels + " × 550 W" },
      { label: d.fUnits, value: "≈ " + fmtNum(Math.round(r.gm)) },
      { label: d.fRoof, value: fmtNum(Math.round(r.kw * 10)) + " m²" },
      { label: d.fCo2, value: fmt(d.tYear, { v: ((r.gm * 12 * 0.72) / 1000).toFixed(1) }) },
    ],
  };
}

export interface PackageRow {
  kw: string;
  cost: string;
  sub: string;
  split: string;
  net: string;
  units: string;
  goLabel: string;
}

/** Home packages with Uttar Pradesh subsidies, each row worked out by the calculator itself. */
export function packageRows(type: SystemType, c: Copy, prices: PriceConfig): PackageRow[] {
  return PRICE_LIST[type].kw.map((k, i) => {
    const r = calc({ ...INITIAL_CALC_STATE, seg: "home", st: "UP", homeType: type, kwIdx: { ...INITIAL_CALC_STATE.kwIdx, home: i } }, prices);
    return {
      kw: kw(k),
      cost: inr(r.price),
      sub: "− " + inr(r.central + r.stateAmt),
      split: fmt(c.packages.split, { c: inr(r.central), s: inr(r.stateAmt) }),
      net: inr(r.net),
      units: fmt(c.packages.units, { u: fmtNum(r.units) }),
      goLabel: fmt(c.packages.goLabel, { kw: kw(k), t: c.estimate.tLower[type] }),
    };
  });
}

export interface SubsidyBar {
  amount: string;
  /** Bar height in px; the tallest bar is 200. */
  height: number;
  /** Hill and North-East states, which get 10% more. */
  hill: boolean;
}

/** The central-subsidy chart: 1 kW, 2 kW, 3 kW or more, and 3 kW or more in hill states. */
export function subsidyBars(): SubsidyBar[] {
  const bars = ([[1, false], [2, false], [3, false], [3, true]] as const).map(([k, hill]) => ({ value: centralHomeSubsidy(k, hill), hill }));
  const max = Math.max(...bars.map((b) => b.value));
  return bars.map((b) => ({ amount: inr(b.value), height: Math.round((b.value / max) * 200), hill: b.hill }));
}
