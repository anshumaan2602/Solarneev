"use client";

import { createContext, useContext, useMemo, useReducer, type Dispatch } from "react";
import { site } from "@/config/site";
import { calc, type CalcResult, type CalcState } from "@/lib/calc/calc";
import { INITIAL_CALC_STATE, calcReducer, type CalcAction } from "@/lib/calc/reducer";

interface CalcValue {
  state: CalcState;
  result: CalcResult;
}

// Two contexts: sections that only change the calculator (package rows, the "fit" tabs)
// read the dispatcher and so do not re-render on every slider movement.
const CalcStateContext = createContext<CalcValue | null>(null);
const CalcDispatchContext = createContext<Dispatch<CalcAction> | null>(null);

export function CalcProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [state, dispatch] = useReducer(calcReducer, INITIAL_CALC_STATE);
  const value = useMemo(() => ({ state, result: calc(state, site.prices) }), [state]);
  return (
    <CalcDispatchContext value={dispatch}>
      <CalcStateContext value={value}>{children}</CalcStateContext>
    </CalcDispatchContext>
  );
}

export function useCalc(): CalcValue {
  const value = useContext(CalcStateContext);
  if (!value) throw new Error("useCalc() must be used inside <CalcProvider>");
  return value;
}

export function useCalcDispatch(): Dispatch<CalcAction> {
  const dispatch = useContext(CalcDispatchContext);
  if (!dispatch) throw new Error("useCalcDispatch() must be used inside <CalcProvider>");
  return dispatch;
}
