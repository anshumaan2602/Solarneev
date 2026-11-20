import { describe, expect, it } from "vitest";
import { INITIAL_CALC_STATE, calcReducer } from "./reducer";

const s0 = INITIAL_CALC_STATE;

describe("calcReducer", () => {
  it("starts with a 3 kW on-grid home in UP at UP's tariff", () => {
    expect([s0.st, s0.homeType, s0.kwIdx.home, s0.rate.home, s0.rate.biz]).toEqual(["UP", "on", 1, 6.5, 9]);
  });
  it("switching system type keeps the same kW where the other list has it", () => {
    const at5kW = { ...s0, kwIdx: { ...s0.kwIdx, home: 3 } }; // on-grid 5 kW
    const s = calcReducer(at5kW, { type: "systemType", systemType: "hyb" });
    expect([s.homeType, s.kwIdx.home]).toEqual(["hyb", 2]); // hybrid 5 kW
  });
  it("2 kW on-grid becomes 3 kW hybrid, the smallest hybrid", () => {
    const at2kW = { ...s0, kwIdx: { ...s0.kwIdx, home: 0 } };
    expect(calcReducer(at2kW, { type: "systemType", systemType: "hyb" }).kwIdx.home).toBe(0);
  });
  it("choosing the current type changes nothing", () => {
    expect(calcReducer(s0, { type: "systemType", systemType: "on" })).toBe(s0);
  });
  it("a new state brings its tariff for homes and societies, not businesses", () => {
    const s = calcReducer(s0, { type: "state", id: "MH" });
    expect([s.st, s.rate.home, s.rate.soc, s.rate.biz]).toEqual(["MH", 9, 9, 9]);
    expect(calcReducer(s0, { type: "state", id: "DL" }).rate.biz).toBe(9);
  });
  it("inputs on the farm tab write to the home figures", () => {
    const farm = { ...s0, seg: "farm" as const };
    expect(calcReducer(farm, { type: "bill", value: 4000 }).bill.home).toBe(4000);
    expect(calcReducer(farm, { type: "size", index: 4 }).kwIdx.home).toBe(4);
    expect(calcReducer(farm, { type: "rate", value: 7.25 }).rate.home).toBe(7.25);
  });
  it("stores accepted tariff and home counts", () => {
    expect(calcReducer({ ...s0, seg: "soc" }, { type: "rate", value: 8 }).rate.soc).toBe(8);
    expect(calcReducer(s0, { type: "houses", value: 120 }).houses).toBe(120);
  });
  it("a package row opens that home system in UP, as the table prices it", () => {
    const elsewhere = { ...calcReducer(s0, { type: "state", id: "KA" }), seg: "biz" as const };
    const s = calcReducer(elsewhere, { type: "package", systemType: "hyb", index: 2 });
    expect([s.seg, s.st, s.rate.home, s.homeType, s.kwIdx.home]).toEqual(["home", "UP", 6.5, "hyb", 2]);
  });
  it("a package row keeps a custom tariff when the state is already UP", () => {
    const custom = calcReducer(s0, { type: "rate", value: 8 });
    expect(calcReducer(custom, { type: "package", systemType: "on", index: 3 }).rate.home).toBe(8);
  });
});
