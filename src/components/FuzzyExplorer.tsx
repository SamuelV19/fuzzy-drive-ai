import { Area, CartesianGrid, ComposedChart, Line, ReferenceLine, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import type { InferenceResult, Memberships } from '../fuzzy/inference';
import { evaluate } from '../fuzzy/membership';
import { DISTANCE, RISK, ROAD, SPEED, type LinguisticVariable } from '../fuzzy/variables';

const COLORS = ['#35d6e8', '#ffb347', '#ff6a3d', '#ff4d6d'];

function sample(v: LinguisticVariable, points = 140) {
  return Array.from({ length: points + 1 }, (_, i) => {
    const x = v.min + ((v.max - v.min) * i) / points;
    const row: Record<string, number> = { x };
    for (const [k, s] of Object.entries(v.sets)) row[k] = evaluate(s.mf, x);
    return row;
  });
}

function MembershipChart({ v, value, mu }: { v: LinguisticVariable; value: number; mu: Memberships }) {
  const data = sample(v);
  return (
    <div className="mf">
      <h3>{v.label} <small>({v.unit})</small></h3>
      <div className="chart short">
        <ResponsiveContainer>
          <ComposedChart data={data} margin={{ top: 6, right: 8, bottom: 0, left: -24 }}>
            <CartesianGrid stroke="var(--grid)" />
            <XAxis dataKey="x" type="number" domain={[v.min, v.max]} stroke="var(--muted)" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 1]} ticks={[0, 0.5, 1]} stroke="var(--muted)" tick={{ fontSize: 11 }} />
            {Object.keys(v.sets).map((k, i) => <Line key={k} dataKey={k} dot={false} stroke={COLORS[i]} strokeWidth={2} isAnimationActive={false} />)}
            <ReferenceLine x={value} stroke="#fff" strokeWidth={2} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="chips">
        {Object.entries(v.sets).map(([k, s], i) => (
          <span key={k} className="chip" style={{ borderColor: COLORS[i] }}>{s.label} <b>{mu[k].toFixed(2)}</b></span>
        ))}
      </div>
    </div>
  );
}

export function FuzzyExplorer({ result }: { result: InferenceResult }) {
  const out = result.aggregated.map((p) => {
    const row: Record<string, number> = { x: p.x, agregado: p.y };
    for (const [k, s] of Object.entries(RISK.sets)) row[k] = evaluate(s.mf, p.x);
    return row;
  });
  return (
    <div className="explorer">
      <div className="mf-grid">
        <MembershipChart v={SPEED} value={result.input.speed} mu={result.memberships.speed} />
        <MembershipChart v={DISTANCE} value={result.input.distance} mu={result.memberships.distance} />
        <MembershipChart v={ROAD} value={result.input.road} mu={result.memberships.road} />
      </div>
      <div className="out-grid">
        <div className="mf">
          <h3>Salida agregada (máximo de implicaciones) y centroide</h3>
          <div className="chart mid">
            <ResponsiveContainer>
              <ComposedChart data={out} margin={{ top: 6, right: 8, bottom: 0, left: -24 }}>
                <CartesianGrid stroke="var(--grid)" />
                <XAxis dataKey="x" type="number" domain={[0, 100]} stroke="var(--muted)" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 1]} ticks={[0, 0.5, 1]} stroke="var(--muted)" tick={{ fontSize: 11 }} />
                {Object.keys(RISK.sets).map((k, i) => <Line key={k} dataKey={k} dot={false} stroke={COLORS[i]} strokeWidth={1} strokeDasharray="3 3" isAnimationActive={false} />)}
                <Area dataKey="agregado" stroke="var(--orange)" fill="var(--orange)" fillOpacity={0.35} isAnimationActive={false} />
                <ReferenceLine x={result.risk} stroke="#fff" strokeWidth={2} label={{ value: `centroide ${result.risk.toFixed(1)}`, fill: '#fff', fontSize: 12, position: 'insideTopRight' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <p className="hint">Defusificación: Σ x·μ(x) / Σ μ(x) sobre 401 puntos (paso 0,25){result.degenerate ? ' — área nula: se usó el valor neutro 50' : ''}.</p>
        </div>
        <div className="rules">
          <h3>Reglas activadas ({result.activations.length} de 27)</h3>
          <ul>
            {result.activations.slice(0, 8).map(({ rule, strength }) => (
              <li key={rule.id}>
                <div className="rule-head"><b>{rule.id}</b><span className="mono">α = {strength.toFixed(2)}</span></div>
                <div className="bar"><i style={{ width: `${strength * 100}%` }} /></div>
                <p>{rule.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
