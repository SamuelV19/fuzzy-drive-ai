import { useCallback, useEffect, useRef, useState } from 'react';
import { inferRisk, type FuzzyInput, type InferenceResult } from '../fuzzy/inference';
import { DEMO_SEQUENCE, SCENARIOS, generateInputs, type ScenarioKey } from './scenarios';

export type Mode = 'auto' | 'manual' | 'demo';
export type Status = 'detenida' | 'ejecutandose' | 'pausada';
export const INTERVALS = [1000, 3000, 5000] as const;
export const MAX_HISTORY = 300;

export interface Reading {
  id: number; time: Date; source: 'auto' | 'manual' | 'demo' | 'inicial'; phase?: ScenarioKey; result: InferenceResult;
}

export function useSimulation() {
  const idRef = useRef(0);
  const demoIdx = useRef(0);
  const make = useCallback((input: FuzzyInput, source: Reading['source'], phase?: ScenarioKey): Reading => ({
    id: ++idRef.current, time: new Date(), source, phase, result: inferRisk(input),
  }), []);

  const [status, setStatus] = useState<Status>('detenida');
  const [mode, setModeState] = useState<Mode>('auto');
  const [intervalMs, setIntervalMs] = useState<number>(3000);
  const [manual, setManualInput] = useState<FuzzyInput>(SCENARIOS.intermedio.input);
  const [history, setHistory] = useState<Reading[]>([]);
  const [current, setCurrent] = useState<Reading>(() => make(SCENARIOS.intermedio.input, 'inicial'));
  const [nextTickAt, setNextTickAt] = useState<number | null>(null);

  const commit = useCallback((r: Reading) => {
    setCurrent(r);
    setHistory((h) => [...h, r].slice(-MAX_HISTORY));
  }, []);

  const tick = useCallback(() => {
    if (mode === 'demo') {
      const step = DEMO_SEQUENCE[demoIdx.current % DEMO_SEQUENCE.length];
      demoIdx.current += 1;
      commit(make(step.input, 'demo', step.phase));
    } else if (mode === 'auto') {
      commit(make(generateInputs(), 'auto'));
    }
  }, [mode, commit, make]);

  // El temporizador solo depende de estado/modo/intervalo; el tick más reciente se lee desde una ref.
  const tickRef = useRef(tick);
  tickRef.current = tick;
  useEffect(() => {
    if (status !== 'ejecutandose' || mode === 'manual') { setNextTickAt(null); return; }
    setNextTickAt(Date.now() + intervalMs);
    const id = setInterval(() => { tickRef.current(); setNextTickAt(Date.now() + intervalMs); }, intervalMs);
    return () => clearInterval(id);
  }, [status, mode, intervalMs]);

  const start = useCallback(() => {
    setStatus('ejecutandose');
    if (mode !== 'manual') tick();
  }, [mode, tick]);
  const togglePause = useCallback(() => setStatus((s) => (s === 'ejecutandose' ? 'pausada' : s === 'pausada' ? 'ejecutandose' : s)), []);
  const reset = useCallback(() => {
    setStatus('detenida'); setHistory([]); demoIdx.current = 0;
    setCurrent(make(mode === 'manual' ? manual : SCENARIOS.intermedio.input, 'inicial'));
  }, [make, manual, mode]);

  const setMode = useCallback((m: Mode) => {
    setModeState(m);
    demoIdx.current = 0;
    if (m === 'manual') setCurrent(make(manual, 'manual'));
  }, [make, manual]);

  const setManual = useCallback((patch: Partial<FuzzyInput>) => {
    const next = { ...manual, ...patch };
    setManualInput(next);
    setCurrent(make(next, 'manual'));
  }, [make, manual]);
  const applyScenario = useCallback((k: ScenarioKey) => {
    setManualInput(SCENARIOS[k].input);
    setCurrent(make(SCENARIOS[k].input, 'manual', k));
  }, [make]);
  const logManual = useCallback(() => commit(make(manual, 'manual')), [commit, make, manual]);

  return { status, mode, intervalMs, manual, history, current, nextTickAt, start, togglePause, reset, setMode, setIntervalMs, setManual, applyScenario, logManual };
}
