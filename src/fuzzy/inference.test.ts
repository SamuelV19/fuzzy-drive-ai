import { describe, expect, it } from 'vitest';
import { inferRisk } from './inference';
import { RULES } from './rules';
import { generateInputs, SCENARIOS, DEMO_SEQUENCE } from '../sim/scenarios';

describe('motor Mamdani', () => {
  it('produce una salida finita entre 0 y 100 en todo el espacio de entradas', () => {
    for (let s = 0; s <= 140; s += 14)
      for (let d = 1; d <= 100; d += 11)
        for (let r = 0; r <= 100; r += 10) {
          const out = inferRisk({ speed: s, distance: d, road: r });
          expect(Number.isFinite(out.risk)).toBe(true);
          expect(out.risk).toBeGreaterThanOrEqual(0);
          expect(out.risk).toBeLessThanOrEqual(100);
          expect(out.degenerate).toBe(false);
        }
  });
  it('el escenario crítico produce más riesgo que el intermedio y este más que el favorable', () => {
    const f = inferRisk(SCENARIOS.favorable.input).risk;
    const i = inferRisk(SCENARIOS.intermedio.input).risk;
    const c = inferRisk(SCENARIOS.critico.input).risk;
    expect(c).toBeGreaterThan(i);
    expect(i).toBeGreaterThan(f);
    expect(c - f).toBeGreaterThan(40);
    expect(inferRisk(SCENARIOS.critico.input).category).toBe('muyAlto');
    expect(inferRisk(SCENARIOS.favorable.input).category).toBe('bajo');
  });
  it('la secuencia de demostración termina con mucho más riesgo del que empieza', () => {
    const risks = DEMO_SEQUENCE.map((s) => inferRisk(s.input).risk);
    expect(risks[risks.length - 1]).toBeGreaterThan(risks[0] + 50);
  });
  it('empeorar una variable no reduce el riesgo', () => {
    const base = { speed: 60, distance: 50, road: 40 };
    const r0 = inferRisk(base).risk;
    expect(inferRisk({ ...base, speed: 120 }).risk).toBeGreaterThan(r0);
    expect(inferRisk({ ...base, distance: 5 }).risk).toBeGreaterThan(r0);
    expect(inferRisk({ ...base, road: 95 }).risk).toBeGreaterThan(r0);
  });
  it('activa reglas con grados correctos (mínimo de antecedentes)', () => {
    const out = inferRisk({ speed: 125, distance: 5, road: 90 });
    expect(out.activations.length).toBeGreaterThan(0);
    expect(out.activations[0].rule.output).toBe('muyAlto');
    expect(out.activations[0].strength).toBe(1);
    for (const a of out.activations) {
      const { speed, distance, road } = out.memberships;
      expect(a.strength).toBeCloseTo(Math.min(speed[a.rule.speed], distance[a.rule.distance], road[a.rule.road]));
    }
  });
  it('la base de reglas es completa (27 combinaciones únicas)', () => {
    expect(RULES).toHaveLength(27);
    expect(new Set(RULES.map((r) => `${r.speed}|${r.distance}|${r.road}`)).size).toBe(27);
  });
  it('rechaza entradas inválidas', () => {
    expect(() => inferRisk({ speed: -1, distance: 10, road: 10 })).toThrow(RangeError);
    expect(() => inferRisk({ speed: 141, distance: 10, road: 10 })).toThrow(RangeError);
    expect(() => inferRisk({ speed: 50, distance: 0, road: 10 })).toThrow(RangeError);
    expect(() => inferRisk({ speed: 50, distance: 10, road: 101 })).toThrow(RangeError);
    expect(() => inferRisk({ speed: NaN, distance: 10, road: 10 })).toThrow(RangeError);
  });
});

describe('generación de datos', () => {
  const lcg = (seed: number) => () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
  it('siempre produce entradas dentro de rango', () => {
    const rng = lcg(7);
    for (let k = 0; k < 2000; k++) {
      const x = generateInputs(rng);
      expect(x.speed).toBeGreaterThanOrEqual(0); expect(x.speed).toBeLessThanOrEqual(140);
      expect(x.distance).toBeGreaterThanOrEqual(1); expect(x.distance).toBeLessThanOrEqual(100);
      expect(x.road).toBeGreaterThanOrEqual(0); expect(x.road).toBeLessThanOrEqual(100);
      expect(() => inferRisk(x)).not.toThrow();
    }
  });
  it('alcanza los extremos con rng 0 y casi 1', () => {
    expect(generateInputs(() => 0)).toEqual({ speed: 0, distance: 1, road: 0 });
    expect(generateInputs(() => 0.999999999)).toEqual({ speed: 140, distance: 100, road: 100 });
  });
});
