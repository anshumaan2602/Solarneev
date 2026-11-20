import { describe, expect, it } from "vitest";
import { en } from "@/content/en";
import { hi } from "@/content/hi";
import { inr } from "../format";
import { calc, centralHomeSubsidy, type CalcState } from "./calc";
import { INITIAL_CALC_STATE } from "./reducer";

const prices = { societyPricePerKw: 48000, businessPricePerKw: 40000 };
const run = (patch: Partial<CalcState>) => calc({ ...INITIAL_CALC_STATE, ...patch }, prices);
const home = (st: string, type: "on" | "hyb", kwIdx: number, extra: Partial<CalcState> = {}) =>
  run({ st, homeType: type, kwIdx: { ...INITIAL_CALC_STATE.kwIdx, home: kwIdx }, ...extra });

describe("figures quoted in the page copy", () => {
  const up3 = home("UP", "on", 1);
  const up2 = home("UP", "on", 0);
  const hyb3 = home("UP", "hyb", 0);
  it("UP, 3 kW on-grid: ₹1,80,000 less ₹1,08,000 subsidy is ₹72,000 (hero)", () => {
    expect([up3.kw, up3.price, up3.central, up3.stateAmt, up3.net]).toEqual([3, 180000, 78000, 30000, 72000]);
  });
  it("UP, 2 kW on-grid: ₹1,40,000 becomes ₹50,000 (system types)", () => {
    expect(up2.net).toBe(50000);
  });
  it("UP, 3 kW hybrid: ₹1,99,000 becomes ₹91,000 (system types, FAQ)", () => {
    expect(hyb3.net).toBe(91000);
  });
  it("central subsidy stops at 3 kW: ₹78,000, or ₹85,800 in hill and North-East states", () => {
    expect(home("UP", "on", 3).central).toBe(78000); // 5 kW
    expect(home("UK", "on", 3).central).toBe(85800);
    expect([1, 2, 3].map((k) => centralHomeSubsidy(k, false))).toEqual([30000, 60000, 78000]);
  });
  // If a rule or price changes, these fail until the copy is updated to match.
  it.each([
    ["en", en],
    ["hi", hi],
  ] as const)("the %s copy quotes what the calculator works out", (_, c) => {
    for (const figure of [up3.price, up3.central + up3.stateAmt, up3.net]) expect(c.hero.sub).toContain(inr(figure));
    expect(c.types.cards[0].price).toContain(inr(up2.price));
    expect(c.types.cards[0].price).toContain(inr(up2.net));
    expect(c.types.cards[2].price).toContain(inr(hyb3.price));
    expect(c.types.cards[2].price).toContain(inr(hyb3.net));
    expect(c.faq.items[1].a).toContain(inr(hyb3.price));
    expect(c.faq.items[1].a).toContain(inr(hyb3.net));
  });
});

describe("state top-ups for homes", () => {
  it.each([
    ["OD", 1, 60000], // ₹25,000/kW, capped at ₹60,000
    ["BR", 1, 20000], // ₹10,000/kW, capped at ₹20,000
    ["TN", 1, 22000], // 3 kW or more
    ["TN", 0, 10000], // 2 kW
    ["DL", 1, 30000], // ₹10,000/kW up to ₹30,000
    ["GJ", 0, 30000], // up to 2.18 kWp: tops up to 90% of the ₹1,00,000 benchmark
    ["GJ", 1, 0], // above 2.18 kWp: nothing
    ["KA", 1, 0], // no top-up
  ])("%s, size step %i: %i", (st, idx, amount) => {
    expect(home(st as string, "on", idx as number).stateAmt).toBe(amount);
  });
  it("Delhi's ₹3/unit generation incentive is counted in the saving", () => {
    const r = home("DL", "on", 1, { rate: { ...INITIAL_CALC_STATE.rate, home: 4.5 } });
    // 360 units a month, all used at ₹4.50, plus ₹3 a unit: ₹2,700 a month in year one.
    expect(r.gbi).toBe(3);
    expect(Math.round(r.y1 / 12)).toBe(2700);
  });
});

describe("savings, payback and loan", () => {
  const r = home("UP", "on", 1);
  it("saves ₹2,340 a month: 360 units at ₹6.50", () => {
    expect(r.gm).toBe(360);
    expect(Math.round(r.y1 / 12)).toBe(2340);
  });
  it("pays back in about 2.6 years", () => {
    expect(r.pay?.toFixed(1)).toBe("2.6");
  });
  it("up to 3 kW: a ₹1,62,000 scheme loan at 6% over 10 years is about ₹1,799 a month", () => {
    expect(r.loan).toBe(162000);
    expect(Math.round(r.emi)).toBe(1799);
  });
  it("above 3 kW: the whole loan is at the higher rate (8%)", () => {
    const four = home("UP", "on", 2); // 4 kW, ₹2,20,000
    expect(four.loan).toBe(198000);
    expect(Math.round(four.emi)).toBe(2402);
  });
  it("payback is null when 25 years of savings do not cover the cost", () => {
    // At ₹0.10 a unit the 3 kW system saves ₹432 a year against ₹72,000.
    expect(home("UP", "on", 1, { rate: { ...INITIAL_CALC_STATE.rate, home: 0.1 } }).pay).toBeNull();
  });
});

describe("size suggestion", () => {
  it("suggests the smallest size whose generation covers the bill", () => {
    // ₹2,500 at ₹6.50 is about 385 units: 4 kW makes 480.
    const r = home("UP", "on", 1);
    expect([r.stops[r.recIdx], r.recMore]).toEqual([4, false]);
  });
  it("says 'or more' when even 10 kW falls short", () => {
    const r = home("UP", "on", 1, { bill: { ...INITIAL_CALC_STATE.bill, home: 20000 } });
    expect([r.stops[r.recIdx], r.recMore]).toEqual([10, true]);
  });
});

describe("societies and businesses", () => {
  it("society: ₹50,000 + ₹48,000/kW, central ₹18,000/kW on up to 3 kW per home", () => {
    const r = run({ seg: "soc" }); // 40 kW, 40 homes
    expect([r.kw, r.price, r.socCap, r.socRate, r.central, r.net]).toEqual([40, 1970000, 120, 18000, 720000, 1250000]);
    expect(run({ seg: "soc", houses: 10 }).central).toBe(18000 * 30);
    expect(run({ seg: "soc", st: "UK" }).socRate).toBe(19800);
  });
  it("business: no capital subsidy; year-one depreciation saving is 10% of the price", () => {
    const r = run({ seg: "biz" }); // 50 kW
    expect([r.kw, r.price, r.central, r.ad]).toEqual([50, 2050000, 0, 205000]);
  });
  it("the farm tab keeps the home figures behind it", () => {
    expect(run({ seg: "farm" })).toEqual(run({ seg: "home" }));
  });
});

describe("panels on the roof", () => {
  it("rounds up 550 W panels", () => {
    expect(home("UP", "on", 1).panels).toBe(6);
    expect(home("UP", "on", 8).panels).toBe(19);
  });
});
