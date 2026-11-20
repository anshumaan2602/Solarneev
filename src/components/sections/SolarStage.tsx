import { useEffect, useRef, useState } from "react";
import { stageView } from "@/lib/calc/viewModel";
import type { SolarScene } from "@/lib/scene/solarScene";
import { useCalc } from "../providers/CalcProvider";
import { useLang } from "../providers/LangProvider";
import s from "./SolarStage.module.css";

/** The 3D house beside the calculator. The panel count follows the chosen system size. */
export function SolarStage() {
  const { c } = useLang();
  const { result } = useCalc();
  const view = stageView(result, c);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<SolarScene | null>(null);
  const panelsRef = useRef(view.panelsShown);
  const [noWebGL, setNoWebGL] = useState(false);

  // Build the scene once, after the page is interactive. The scene and three.js load on demand.
  useEffect(() => {
    let cancelled = false;
    import("@/lib/scene/solarScene").then(
      ({ buildSolarScene }) => {
        if (cancelled || !canvasRef.current || !stageRef.current) return;
        try {
          const scene = buildSolarScene(canvasRef.current, stageRef.current);
          sceneRef.current = scene;
          scene.setPanels(panelsRef.current);
        } catch (err) {
          // three.js could not get a WebGL context: say so, the estimate still works.
          console.warn("3D scene unavailable", err);
          setNoWebGL(true);
        }
      },
      // A failed download (offline, or the site was redeployed while the tab was open) is not a
      // WebGL problem, so the stage just keeps its sky.
      (err) => console.warn("3D scene failed to load", err),
    );
    return () => {
      cancelled = true;
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    panelsRef.current = view.panelsShown;
    sceneRef.current?.setPanels(view.panelsShown);
  }, [view.panelsShown]);

  return (
    <div className={s.col}>
      <div ref={stageRef} className={s.stage}>
        <canvas ref={canvasRef} role="img" aria-label={view.sceneLabel} className={s.canvas} />
        <div className={s.chips}>
          <p className={s.chip}>{view.panelChip}</p>
          <p className={s.hint}>{c.stage.drag}</p>
        </div>
        <div className={s.turns}>
          <button type="button" aria-label={c.stage.rotL} onClick={() => sceneRef.current?.nudge(-0.55)} className={s.turn}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 12a9 9 0 1 0 3-6.7" />
              <path d="M3 4v5h5" />
            </svg>
          </button>
          <button type="button" aria-label={c.stage.rotR} onClick={() => sceneRef.current?.nudge(0.55)} className={s.turn}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 12a9 9 0 1 1-3-6.7" />
              <path d="M21 4v5h-5" />
            </svg>
          </button>
        </div>
        {noWebGL && <p className={s.noWebGL}>{c.stage.noGL}</p>}
      </div>
      <dl className={s.facts}>
        {view.facts.map((f) => (
          <div key={f.label} className={s.fact}>
            <dt className={s.factLabel}>{f.label}</dt>
            <dd className={s.factValue}>{f.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
