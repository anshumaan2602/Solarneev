import { describe, expect, it } from "vitest";
import { fmt, fmtNum, inr, inrShort, kw } from "./format";

const words = { lakh: "lakh", crore: "crore" };
const intl = (x: number, d: number) => x.toLocaleString("en-IN", { minimumFractionDigits: d, maximumFractionDigits: d });

describe("fmtNum", () => {
  it("groups digits the Indian way", () => {
    expect(fmtNum(100)).toBe("100");
    expect(fmtNum(1000)).toBe("1,000");
    expect(fmtNum(180000)).toBe("1,80,000");
    expect(fmtNum(12345678.25, 2)).toBe("1,23,45,678.25");
  });
  it("rounds halves the way toLocaleString does", () => {
    for (const [x, d] of [[0.15, 1], [1.005, 2], [2.675, 2], [12.5, 0], [0.45, 1]] as const) {
      expect(fmtNum(x, d), `${x} to ${d} places`).toBe(intl(x, d));
    }
  });
  it("matches toLocaleString('en-IN') on many numbers, with and without decimals", () => {
    let seed = 7;
    const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 3000; i++) {
      const digits = Math.floor(rand() * 10);
      const x = Math.floor(rand() * 10 ** (1 + digits)) / 10 ** Math.floor(rand() * 4); // 0–3 decimals
      const d = Math.floor(rand() * 3);
      expect(fmtNum(x, d), `${x} to ${d} places`).toBe(intl(x, d));
    }
  });
});

describe("money and sizes", () => {
  it("rounds rupees", () => {
    expect(inr(1798.5)).toBe("₹1,799");
  });
  it("uses lakh and crore for big amounts", () => {
    expect(inrShort(99999, words)).toBe("₹99,999");
    expect(inrShort(1250000, words)).toBe("₹12.5 lakh");
    expect(inrShort(10000000, words)).toBe("₹1 crore");
    expect(inrShort(20500000, words)).toBe("₹2.05 crore");
  });
  it("picks the unit after rounding, so just under ₹1 crore is not '₹100 lakh'", () => {
    expect(inrShort(9999999, words)).toBe("₹1 crore");
    expect(inrShort(9999500, words)).toBe("₹1 crore");
    expect(inrShort(9994000, words)).toBe("₹99.94 lakh");
  });
  it("prints kW", () => {
    expect(kw(3)).toBe("3 kW");
    expect(kw(2.5)).toBe("2.5 kW");
  });
  it("fills placeholders and leaves unknown ones", () => {
    expect(fmt("{a} and {b}", { a: 1 })).toBe("1 and {b}");
  });
});
