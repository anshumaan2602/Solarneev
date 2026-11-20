// Where panels sit on the 3D roof. Kept apart from the scene so the page can know the limit
// without loading three.js.

/** Rows of panel slots, front to back: how many fit, the row's depth, and its sideways offset. */
const ROOF_ROWS = [
  { count: 7, z: 2.25, x: 0 },
  { count: 7, z: -0.05, x: 0 },
  { count: 5, z: -2.35, x: 1 },
];

/** The most panels the scene can draw. Larger systems show this many, with a note. */
export const MAX_SCENE_PANELS = ROOF_ROWS.reduce((n, row) => n + row.count, 0);

/** Positions [x, z] for n panels: rows fill front to back, each row centred on its offset. */
export function panelSlots(n: number): [number, number][] {
  const out: [number, number][] = [];
  let left = Math.max(0, Math.min(MAX_SCENE_PANELS, n));
  for (const row of ROOF_ROWS) {
    const k = Math.min(left, row.count);
    for (let i = 0; i < k; i++) out.push([row.x + (i - (k - 1) / 2), row.z]);
    left -= k;
  }
  return out;
}
