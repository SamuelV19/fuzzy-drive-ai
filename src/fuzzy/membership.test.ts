import { describe, expect, it } from 'vitest';
import { evaluate, trapezoidal, triangular } from './membership';

describe('funciones de pertenencia', () => {
  it('triangular: límites, pico e interior', () => {
    expect(triangular(40, 40, 70, 100)).toBe(0);
    expect(triangular(100, 40, 70, 100)).toBe(0);
    expect(triangular(70, 40, 70, 100)).toBe(1);
    expect(triangular(55, 40, 70, 100)).toBeCloseTo(0.5);
    expect(triangular(85, 40, 70, 100)).toBeCloseTo(0.5);
    expect(triangular(10, 40, 70, 100)).toBe(0);
  });
  it('trapezoidal: meseta, rampas y hombros', () => {
    expect(trapezoidal(0, 0, 0, 30, 60)).toBe(1);
    expect(trapezoidal(30, 0, 0, 30, 60)).toBe(1);
    expect(trapezoidal(45, 0, 0, 30, 60)).toBeCloseTo(0.5);
    expect(trapezoidal(60, 0, 0, 30, 60)).toBe(0);
    expect(trapezoidal(100, 80, 110, 140, 140)).toBeCloseTo(2 / 3, 5);
    expect(trapezoidal(140, 80, 110, 140, 140)).toBe(1);
  });
  it('grados siempre en [0,1]', () => {
    for (let x = -20; x <= 160; x += 0.5) {
      const mu = evaluate({ kind: 'trapezoidal', params: [10, 30, 60, 90] }, x);
      expect(mu).toBeGreaterThanOrEqual(0);
      expect(mu).toBeLessThanOrEqual(1);
    }
  });
  it('rechaza parámetros y valores inválidos', () => {
    expect(() => triangular(1, 5, 3, 9)).toThrow(RangeError);
    expect(() => trapezoidal(1, 0, 5, 3, 9)).toThrow(RangeError);
    expect(() => triangular(NaN, 0, 1, 2)).toThrow(RangeError);
    expect(() => trapezoidal(Infinity, 0, 1, 2, 3)).toThrow(RangeError);
  });
});
