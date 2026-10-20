/** Funciones de pertenencia triangulares y trapezoidales. Devuelven grados en [0,1]. */

export type MembershipFunction =
  | { kind: 'triangular'; params: [number, number, number] }
  | { kind: 'trapezoidal'; params: [number, number, number, number] };

function assertFinite(...values: number[]): void {
  for (const v of values) {
    if (!Number.isFinite(v)) throw new RangeError(`Valor no finito: ${v}`);
  }
}

/** Triángulo (a, b, c): pertenencia 1 en el pico b. Admite hombros (a=b o b=c). */
export function triangular(x: number, a: number, b: number, c: number): number {
  assertFinite(x, a, b, c);
  if (!(a <= b && b <= c)) throw new RangeError('Parámetros inválidos: se exige a ≤ b ≤ c');
  if (x < a || x > c) return 0;
  if (x === b) return 1;
  if (x < b) return (x - a) / (b - a);
  return (c - x) / (c - b);
}

/** Trapecio (a, b, c, d): meseta con pertenencia 1 entre b y c. */
export function trapezoidal(x: number, a: number, b: number, c: number, d: number): number {
  assertFinite(x, a, b, c, d);
  if (!(a <= b && b <= c && c <= d)) throw new RangeError('Parámetros inválidos: se exige a ≤ b ≤ c ≤ d');
  if (x < a || x > d) return 0;
  if (x >= b && x <= c) return 1;
  if (x < b) return (x - a) / (b - a);
  return (d - x) / (d - c);
}

export function evaluate(mf: MembershipFunction, x: number): number {
  const mu = mf.kind === 'triangular' ? triangular(x, ...mf.params) : trapezoidal(x, ...mf.params);
  return Math.min(1, Math.max(0, mu));
}
