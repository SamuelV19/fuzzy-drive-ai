import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Reading } from '../sim/useSimulation';
import { fmtTime } from './ui';

export function RiskChart({ history }: { history: Reading[] }) {
  const data = history.slice(-30).map((r) => ({ id: r.id, hora: fmtTime(r.time), riesgo: Number(r.result.risk.toFixed(1)), cat: r.result.categoryLabel }));
  if (data.length === 0) return <div className="empty">Aún no hay ciclos. Pulsa «Iniciar» para generar lecturas simuladas.</div>;
  return (
    <div className="chart tall">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: -8 }}>
          <CartesianGrid stroke="var(--grid)" vertical={false} />
          <XAxis dataKey="hora" stroke="var(--muted)" tick={{ fontSize: 12 }} interval="preserveStartEnd" minTickGap={40} />
          <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} stroke="var(--muted)" tick={{ fontSize: 12 }} />
          <ReferenceLine y={55} stroke="var(--orange)" strokeDasharray="4 4" />
          <ReferenceLine y={75} stroke="var(--red)" strokeDasharray="4 4" />
          <Tooltip contentStyle={{ background: 'var(--panel2)', border: '1px solid var(--line)', borderRadius: 8 }} formatter={(v: number, _n, p) => [`${v} · ${p.payload.cat}`, 'Riesgo']} />
          <Line type="monotone" dataKey="riesgo" stroke="var(--cyan)" strokeWidth={2.5} dot={{ r: 3, fill: 'var(--orange)', strokeWidth: 0 }} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
