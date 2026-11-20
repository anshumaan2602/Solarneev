// Number and text formatting. Indian digit grouping is done here rather than with
// toLocaleString('en-IN'), so the build machine and every browser print the same thing.

/** Fill {name} placeholders. Unknown names are left in place. */
export function fmt(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    values[key] !== undefined ? String(values[key]) : match,
  );
}

/** Group an unsigned integer string the Indian way: 1234567 -> 12,34,567. */
function groupIndian(digits: string): string {
  if (digits.length <= 3) return digits;
  let head = digits.slice(0, -3);
  const groups: string[] = [];
  while (head.length > 2) {
    groups.unshift(head.slice(-2));
    head = head.slice(0, -2);
  }
  if (head) groups.unshift(head);
  return groups.join(",") + "," + digits.slice(-3);
}

/**
 * Round a non-negative number to `decimals` places, halves away from zero, working from its
 * shortest decimal form the way Intl does: 0.15 -> "0.2" and 1.005 -> "1.01" (toFixed gives
 * "0.1" and "1.00", because those values sit just below the half in binary).
 */
function roundDecimal(x: number, decimals: number): string {
  if (/e/i.test(String(x))) return x.toFixed(decimals); // too big or small to shift; never shown here
  const shifted = Math.round(Number(`${x}e${decimals}`));
  return Number(`${shifted}e-${decimals}`).toFixed(decimals);
}

/** Same output as x.toLocaleString('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d }). */
export function fmtNum(x: number, decimals = 0): string {
  const sign = x < 0 || Object.is(x, -0) ? "-" : "";
  const [int, frac] = roundDecimal(Math.abs(x), decimals).split(".");
  return sign + groupIndian(int) + (frac ? "." + frac : "");
}

/** Rupees, rounded to the rupee: ₹1,80,000. */
export function inr(x: number): string {
  return "₹" + fmtNum(Math.round(x));
}

/** Rupees in words for big amounts: ₹1.8 lakh, ₹2.25 crore. */
export function inrShort(x: number, words: { lakh: string; crore: string }): string {
  const f = (v: number) => v.toFixed(2).replace(/\.?0+$/, "");
  // Choose the unit after rounding, so ₹99,99,999 reads "₹1 crore", not "₹100 lakh".
  if (x >= 1e7 || Number((x / 1e5).toFixed(2)) >= 100) return "₹" + f(x / 1e7) + " " + words.crore;
  if (x >= 1e5) return "₹" + f(x / 1e5) + " " + words.lakh;
  return inr(x);
}

/** System size: 3 kW, 2.5 kW. */
export function kw(k: number): string {
  return (k % 1 ? k.toFixed(1) : String(k)) + " kW";
}
