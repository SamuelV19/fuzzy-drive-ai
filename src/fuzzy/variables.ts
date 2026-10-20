import type { MembershipFunction } from './membership';

export interface FuzzySet { label: string; mf: MembershipFunction }
export interface LinguisticVariable {
  name: string; label: string; unit: string; min: number; max: number;
  sets: Record<string, FuzzySet>;
}

const trap = (a: number, b: number, c: number, d: number): MembershipFunction => ({ kind: 'trapezoidal', params: [a, b, c, d] });
const tri = (a: number, b: number, c: number): MembershipFunction => ({ kind: 'triangular', params: [a, b, c] });

export const SPEED: LinguisticVariable = {
  name: 'speed', label: 'Velocidad', unit: 'km/h', min: 0, max: 140,
  sets: {
    baja: { label: 'Baja', mf: trap(0, 0, 30, 60) },
    media: { label: 'Media', mf: tri(40, 70, 100) },
    alta: { label: 'Alta', mf: trap(80, 110, 140, 140) },
  },
};

export const DISTANCE: LinguisticVariable = {
  name: 'distance', label: 'Distancia al obstáculo', unit: 'm', min: 1, max: 100,
  sets: {
    cercana: { label: 'Cercana', mf: trap(1, 1, 10, 30) },
    intermedia: { label: 'Intermedia', mf: tri(15, 40, 70) },
    lejana: { label: 'Lejana', mf: trap(50, 75, 100, 100) },
  },
};

export const ROAD: LinguisticVariable = {
  name: 'road', label: 'Adversidad de la vía', unit: '/100', min: 0, max: 100,
  sets: {
    favorable: { label: 'Favorable', mf: trap(0, 0, 20, 45) },
    regular: { label: 'Regular', mf: tri(30, 50, 70) },
    adversa: { label: 'Adversa', mf: trap(55, 80, 100, 100) },
  },
};

export const RISK: LinguisticVariable = {
  name: 'risk', label: 'Riesgo', unit: '/100', min: 0, max: 100,
  sets: {
    bajo: { label: 'Riesgo bajo', mf: trap(0, 0, 15, 30) },
    moderado: { label: 'Riesgo moderado', mf: tri(20, 40, 60) },
    alto: { label: 'Riesgo alto', mf: tri(50, 65, 80) },
    muyAlto: { label: 'Riesgo muy alto', mf: trap(70, 85, 100, 100) },
  },
};

export const INPUT_VARIABLES = [SPEED, DISTANCE, ROAD] as const;
