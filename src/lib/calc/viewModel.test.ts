import { describe, expect, it } from "vitest";
import { en } from "@/content/en";
import { hi } from "@/content/hi";
import { calc } from "./calc";
import { INITIAL_CALC_STATE, calcReducer } from "./reducer";
import { calcView, packageRows, stageView, subsidyBars } from "./viewModel";

const prices = { societyPricePerKw: 48000, businessPricePerKw: 40000 };

describe("calculator text", () => {
  const s = INITIAL_CALC_STATE;
  const v = calcView(s, calc(s, prices), en);
  it("shows the default home estimate", () => {
    expect([v.tile1, v.tile2, v.tile3]).toEqual(["₹72,000", "₹2,340", "2.6 years"]);
    expect(v.rows).toEqual([
      { label: "SOLARNEEV price, on-grid", value: "₹1,80,000" },
      { label: "Central subsidy (PM Surya Ghar)", value: "− ₹78,000" },
      { label: "Uttar Pradesh top-up", value: "− ₹30,000" },
    ]);
    expect([v.recText, v.recBtn, v.showRec]).toEqual(["Suggested for your bill: 4 kW", "Use 4 kW", true]);
  });
  it("labels business figures as an investment", () => {
    const b = { ...s, seg: "biz" as const };
    const vb = calcView(b, calc(b, prices), en);
    expect([vb.tile1Label, vb.tile1, vb.finalLabel]).toEqual(["System cost", "₹20.5 lakh", "You invest"]);
  });
  it("names the society subsidy rate the calculator used", () => {
    for (const [st, rate] of [["UP", "₹18,000"], ["UK", "₹19,800"]]) {
      const soc = { ...calcReducer(s, { type: "state", id: st }), seg: "soc" as const };
      expect(calcView(soc, calc(soc, prices), en).rows[1].label).toBe(`Central subsidy at ${rate}/kW`);
    }
  });
  it("speaks Hindi", () => {
    const vh = calcView(s, calc(s, prices), hi);
    expect([vh.tile3, vh.billLabel]).toEqual(["2.6 साल", "हर महीने का बिजली बिल"]);
  });
});

describe("3D stage text", () => {
  it("caps the drawn panels at 19", () => {
    const soc = { ...INITIAL_CALC_STATE, seg: "soc" as const };
    const view = stageView(calc(soc, prices), en); // 40 kW: 73 panels
    expect([view.panelsShown, view.panelChip]).toEqual([19, "19 of 73 panels shown"]);
  });
  it("lists panels, units, roof and CO₂ for the default home", () => {
    const view = stageView(calc(INITIAL_CALC_STATE, prices), en);
    expect(view.facts.map((f) => f.value)).toEqual(["6 × 550 W", "≈ 360", "30 m²", "3.1 t a year"]);
  });
});

describe("package table", () => {
  it("shows UP prices, subsidies and net cost", () => {
    const [first] = packageRows("on", en, prices);
    expect(first).toEqual({
      kw: "2 kW",
      cost: "₹1,40,000",
      sub: "− ₹90,000",
      split: "₹60,000 central + ₹30,000 UP",
      net: "₹50,000",
      units: "≈ 240 units",
      goLabel: "Open 2 kW on-grid in the calculator",
    });
  });
  it("agrees with the calculator for every row it opens", () => {
    for (const type of ["on", "hyb"] as const) {
      packageRows(type, en, prices).forEach((row, i) => {
        const opened = calcReducer(INITIAL_CALC_STATE, { type: "package", systemType: type, index: i });
        expect(calcView(opened, calc(opened, prices), en).finalValue, `${type} ${row.kw}`).toBe(row.net);
      });
    }
  });
});

describe("subsidy chart", () => {
  it("draws the central subsidy for 1, 2 and 3 kW, and 3 kW in hill states, tallest at 200px", () => {
    expect(subsidyBars()).toEqual([
      { amount: "₹30,000", height: 70, hill: false },
      { amount: "₹60,000", height: 140, hill: false },
      { amount: "₹78,000", height: 182, hill: false },
      { amount: "₹85,800", height: 200, hill: true },
    ]);
  });
});
