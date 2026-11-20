// The calculator's tables: SOLARNEEV's home price list, state sunshine, tariffs and top-ups,
// and the size steps for societies and businesses.

export type SystemType = "on" | "hyb";
/** The four buttons at the top of the calculator. */
export type SegmentTab = "home" | "soc" | "biz" | "farm";
/** Segments with numbers to calculate. The farm tab shows a notice instead. */
export type Segment = Exclude<SegmentTab, "farm">;

export const SEGMENT_TABS: readonly SegmentTab[] = ["home", "soc", "biz", "farm"];
export const SYSTEM_TYPES: readonly SystemType[] = ["on", "hyb"];

export interface PriceList {
  /** System sizes in kW. */
  kw: number[];
  /** Price in rupees for each size. */
  cost: number[];
  /** SOLARNEEV's estimate of units generated a month in western UP for each size. */
  units: number[];
}

export const PRICE_LIST: Record<SystemType, PriceList> = {
  on: {
    kw: [2, 3, 4, 5, 6, 7, 8, 9, 10],
    cost: [140000, 180000, 220000, 260000, 280000, 330000, 370000, 410000, 450000],
    units: [240, 360, 480, 560, 680, 800, 920, 1040, 1160],
  },
  hyb: {
    kw: [3, 4, 5, 6, 7, 8, 9, 10],
    cost: [199000, 270000, 340000, 370000, 420000, 470000, 520000, 570000],
    units: [360, 480, 560, 680, 800, 920, 1040, 1160],
  },
};

/** Typical commercial tariff, rupees per unit: the business calculator's starting rate. */
export const BUSINESS_TARIFF = 9;

/** States with a home top-up the calculator knows how to count. */
export type TopUp = "UP" | "DL" | "GJ" | "OD" | "BR" | "TN" | "";

export interface StateInfo {
  id: string;
  /** Units generated per kW in a year. */
  yieldPerKw: number;
  /** Typical top-slab tariff, rupees per unit. */
  tariff: number;
  /** Special-category state: the central subsidy is 10% higher. */
  special: boolean;
  topUp: TopUp;
}

const S = (id: string, yieldPerKw: number, tariff: number, special: boolean, topUp: TopUp): StateInfo => ({
  id,
  yieldPerKw,
  tariff,
  special,
  topUp,
});

/** In the order the State menu lists them. */
export const STATES: readonly StateInfo[] = [
  S("AP", 1500, 6.0, false, ""), S("AS", 1150, 6.5, true, ""), S("BR", 1350, 5.6, false, "BR"), S("CG", 1450, 4.8, false, ""),
  S("DL", 1350, 4.5, false, "DL"), S("GA", 1350, 4.0, false, ""), S("GJ", 1550, 5.9, false, "GJ"), S("HR", 1450, 6.0, false, ""),
  S("HP", 1400, 4.2, true, ""), S("JK", 1350, 4.3, true, ""), S("JH", 1350, 5.8, false, ""), S("KA", 1450, 7.0, false, ""),
  S("KL", 1250, 6.7, false, ""), S("LA", 1450, 5.0, true, ""), S("MP", 1450, 6.4, false, ""), S("MH", 1450, 9.0, false, ""),
  S("NE", 1150, 6.0, true, ""), S("OD", 1350, 5.5, false, "OD"), S("PB", 1450, 6.0, false, ""), S("RJ", 1600, 7.0, false, ""),
  S("TN", 1420, 5.0, false, "TN"), S("TG", 1500, 7.0, false, ""), S("UP", 1350, 6.5, false, "UP"), S("UK", 1400, 5.1, true, ""),
  S("WB", 1250, 7.0, false, ""),
];

const UP = STATES.find((s) => s.id === "UP")!;

/** Look up a state; unknown ids fall back to Uttar Pradesh. */
export function stateById(id: string): StateInfo {
  return STATES.find((s) => s.id === id) ?? UP;
}

/** Size steps (kW) on the size slider for each segment. Homes use their price list's sizes. */
export function sizeSteps(seg: Segment, type: SystemType): number[] {
  if (seg === "soc") return [5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 100, 125, 150, 200, 250, 300, 400, 500];
  if (seg === "biz") return [3, 5, 8, 10, 15, 20, 25, 30, 40, 50, 60, 75, 100, 125, 150, 200, 250, 300, 400, 500];
  return PRICE_LIST[type].kw;
}

/** The monthly-bill slider's range for each segment. */
export function billRange(seg: Segment): { min: number; max: number; step: number } {
  if (seg === "soc") return { min: 2000, max: 300000, step: 1000 };
  if (seg === "biz") return { min: 5000, max: 1000000, step: 5000 };
  return { min: 300, max: 20000, step: 100 };
}
