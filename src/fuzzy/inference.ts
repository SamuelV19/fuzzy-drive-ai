import { evaluate } from './membership';
import { DISTANCE, ROAD, RISK, SPEED, INPUT_VARIABLES, type LinguisticVariable } from './variables';
import { RULES, type Rule, type RiskSet } from './rules';

export interface FuzzyInput { speed: number; distance: number; road: number }
export type Memberships = Record<string, number>;
export interface RuleActivation { rule: Rule; strength: number }
export interface Point { x: number; y: number }

export interface InferenceResult {
  input: FuzzyInput;
  memberships: { speed: Memberships; distance: Memberships; road: Memberships };
  activations: RuleActivation[]; // solo reglas con activación > 0, de mayor a menor
  aggregated: Point[];            // conjunto difuso de salida agregado (máximo)
  risk: number;                   // salida desfusificada (centroide), 0–100
  category: RiskSet;
  categoryLabel: string;
  recommendation: string;
  degenerate: boolean;            // true si el área agregada es 0 y se usó el valor neutro
}

export const DEFAULT_RESOLUTION = 0.25;
export const NEUTRAL_RISK = 50;

export function validateInput(input: FuzzyInput): void {
  for (const v of INPUT_VARIABLES) {
    const value = input[v.name as keyof FuzzyInput];
    if (typeof value !== 'number' || !Number.isFinite(value)) throw new RangeError(`${v.label}: el valor debe ser un número finito`);
    if (value < v.min || value > v.max) throw new RangeError(`${v.label}: ${value} fuera del rango [${v.min}, ${v.max}]`);
  }
}

export function fuzzify(variable: LinguisticVariable, x: number): Memberships {
  const out: Memberships = {};
  for (const [key, set] of Object.entries(variable.sets)) out[key] = evaluate(set.mf, x);
  return out;
}

/** Activación de cada regla: AND = mínimo de los tres antecedentes. */
export function evaluateRules(m: InferenceResult['memberships'], rules: Rule[] = RULES): RuleActivation[] {
  return rules
    .map((rule) => ({ rule, strength: Math.min(m.speed[rule.speed], m.distance[rule.distance], m.road[rule.road]) }))
    .filter((a) => a.strength > 0)
    .sort((a, b) => b.strength - a.strength);
}

/** Implicación (mínimo) y agregación (máximo) sobre el universo de salida discretizado. */
export function aggregate(activations: RuleActivation[], step = DEFAULT_RESOLUTION): Point[] {
  const points: Point[] = [];
  const n = Math.round((RISK.max - RISK.min) / step);
  for (let i = 0; i <= n; i++) {
    const x = RISK.min + i * step;
    let y = 0;
    for (const { rule, strength } of activations) {
      y = Math.max(y, Math.min(strength, evaluate(RISK.sets[rule.output].mf, x)));
    }
    points.push({ x, y });
  }
  return points;
}

/** Centroide discreto: Σ x·μ(x) / Σ μ(x). Devuelve null si el área es nula. */
export function centroid(points: Point[]): number | null {
  let num = 0, den = 0;
  for (const p of points) { num += p.x * p.y; den += p.y; }
  return den > 1e-12 ? num / den : null;
}

export function classify(risk: number): RiskSet {
  let best: RiskSet = 'bajo', bestMu = -1;
  for (const key of Object.keys(RISK.sets) as RiskSet[]) {
    const mu = evaluate(RISK.sets[key].mf, risk);
    if (mu >= bestMu) { best = key; bestMu = mu; } // en empate gana la categoría más severa
  }
  return best;
}

export const RECOMMENDATIONS: Record<RiskSet, string> = {
  bajo: 'Condiciones seguras: mantén la velocidad y la distancia de seguimiento.',
  moderado: 'Atención: reduce la velocidad gradualmente y aumenta la distancia de seguridad.',
  alto: 'Precaución elevada: frena de forma progresiva y prepárate para una maniobra evasiva.',
  muyAlto: 'Riesgo crítico: reduce la velocidad de inmediato y evita maniobras bruscas.',
};

export function inferRisk(input: FuzzyInput, step = DEFAULT_RESOLUTION): InferenceResult {
  validateInput(input);
  const memberships = {
    speed: fuzzify(SPEED, input.speed),
    distance: fuzzify(DISTANCE, input.distance),
    road: fuzzify(ROAD, input.road),
  };
  const activations = evaluateRules(memberships);
  const aggregated = aggregate(activations, step);
  const c = centroid(aggregated);
  const degenerate = c === null;
  const risk = Math.min(100, Math.max(0, c ?? NEUTRAL_RISK));
  const category = classify(risk);
  return {
    input, memberships, activations, aggregated, risk, category,
    categoryLabel: RISK.sets[category].label, recommendation: RECOMMENDATIONS[category], degenerate,
  };
}
