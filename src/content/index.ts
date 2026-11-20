import type { Copy } from "./en";

export type { Copy };
export { menuOptions, shared } from "./shared";

export type Lang = "en" | "hi";

/**
 * Each language's copy as its own download. A page gets its own language from the server and
 * loads the other only when the visitor is about to switch.
 */
export const loadCopy: Record<Lang, () => Promise<Copy>> = {
  en: () => import("./en").then((m) => m.en),
  hi: () => import("./hi").then((m) => m.hi),
};
