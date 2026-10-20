/**
 * Base de reglas Mamdani completa: 3 × 3 × 3 = 27 reglas (todas las combinaciones).
 * Criterio de construcción: cada antecedente aporta un nivel de peligro (0, 1 o 2):
 *   velocidad  baja=0 media=1 alta=2 · distancia lejana=0 intermedia=1 cercana=2 · vía favorable=0 regular=1 adversa=2
 * Con la suma s: s ≤ 1 → bajo · s = 2 o 3 → moderado · s = 4 → alto · s ≥ 5 → muy alto.
 * El motor evalúa cada regla con mínimo; aquí solo se declara el conocimiento experto.
 */
export type SpeedSet = 'baja' | 'media' | 'alta';
export type DistanceSet = 'cercana' | 'intermedia' | 'lejana';
export type RoadSet = 'favorable' | 'regular' | 'adversa';
export type RiskSet = 'bajo' | 'moderado' | 'alto' | 'muyAlto';

export interface Rule {
  id: string; speed: SpeedSet; distance: DistanceSet; road: RoadSet; output: RiskSet; text: string;
}

const SPEEDS: SpeedSet[] = ['baja', 'media', 'alta'];
const DISTANCES: DistanceSet[] = ['lejana', 'intermedia', 'cercana'];
const ROADS: RoadSet[] = ['favorable', 'regular', 'adversa'];
const OUTPUT_LABEL: Record<RiskSet, string> = { bajo: 'bajo', moderado: 'moderado', alto: 'alto', muyAlto: 'muy alto' };

function consequent(score: number): RiskSet {
  if (score <= 1) return 'bajo';
  if (score <= 3) return 'moderado';
  if (score === 4) return 'alto';
  return 'muyAlto';
}

export const RULES: Rule[] = (() => {
  const rules: Rule[] = [];
  SPEEDS.forEach((s, si) =>
    DISTANCES.forEach((d, di) =>
      ROADS.forEach((r, ri) => {
        const output = consequent(si + di + ri);
        rules.push({
          id: `R${String(rules.length + 1).padStart(2, '0')}`, speed: s, distance: d, road: r, output,
          text: `SI velocidad es ${s} Y distancia es ${d} Y vía es ${r} ENTONCES riesgo es ${OUTPUT_LABEL[output]}`,
        });
      }),
    ),
  );
  return rules;
})();
