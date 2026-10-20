import type { FuzzyInput } from '../fuzzy/inference';
import { DISTANCE, ROAD, SPEED } from '../fuzzy/variables';

export type ScenarioKey = 'favorable' | 'intermedio' | 'critico';
export const SCENARIOS: Record<ScenarioKey, { label: string; input: FuzzyInput }> = {
  favorable: { label: 'Favorable', input: { speed: 35, distance: 85, road: 12 } },
  intermedio: { label: 'Intermedio', input: { speed: 70, distance: 40, road: 50 } },
  critico: { label: 'Crítico', input: { speed: 125, distance: 8, road: 88 } },
};

/** Secuencia reproducible: favorable → intermedio → crítico (9 pasos, empeora de forma progresiva). */
export const DEMO_SEQUENCE: { phase: ScenarioKey; input: FuzzyInput }[] = [
  { phase: 'favorable', input: { speed: 30, distance: 90, road: 10 } },
  { phase: 'favorable', input: { speed: 40, distance: 80, road: 18 } },
  { phase: 'favorable', input: { speed: 55, distance: 65, road: 30 } },
  { phase: 'intermedio', input: { speed: 70, distance: 40, road: 50 } },
  { phase: 'intermedio', input: { speed: 85, distance: 28, road: 60 } },
  { phase: 'intermedio', input: { speed: 100, distance: 18, road: 72 } },
  { phase: 'critico', input: { speed: 115, distance: 12, road: 80 } },
  { phase: 'critico', input: { speed: 128, distance: 7, road: 88 } },
  { phase: 'critico', input: { speed: 138, distance: 3, road: 96 } },
];

/** Genera entradas aleatorias válidas. `rng` debe devolver valores en [0,1). Inyectable para pruebas. */
export function generateInputs(rng: () => number = Math.random): FuzzyInput {
  const pick = (min: number, max: number) => Math.min(max, min + Math.floor(rng() * (max - min + 1)));
  return {
    speed: pick(SPEED.min, SPEED.max),
    distance: pick(DISTANCE.min, DISTANCE.max),
    road: pick(ROAD.min, ROAD.max),
  };
}
