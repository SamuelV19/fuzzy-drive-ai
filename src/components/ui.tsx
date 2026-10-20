import { useEffect, useState, type ReactNode } from 'react';
import type { Status, Mode } from '../sim/useSimulation';

export const riskColor = (r: number) => (r < 30 ? 'var(--cyan)' : r < 55 ? 'var(--amber)' : r < 75 ? 'var(--orange)' : 'var(--red)');
export const fmtTime = (d: Date) => d.toLocaleTimeString('es-CO', { hour12: false });

export function Panel({ title, note, children, className = '' }: { title: string; note?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`panel ${className}`}>
      <header className="panel-head"><h2>{title}</h2>{note && <span className="note">{note}</span>}</header>
      {children}
    </section>
  );
}

export function TelemetryCard({ label, value, unit, min, max, set }: { label: string; value: number; unit: string; min: number; max: number; set: string }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="tele">
      <div className="tele-top"><span className="tele-label">{label}</span><span className="chip">{set}</span></div>
      <div className="tele-value">{Math.round(value)}<small>{unit}</small></div>
      <div className="bar"><i style={{ width: `${pct}%` }} /></div>
    </div>
  );
}

export function RiskGauge({ risk, label }: { risk: number; label: string }) {
  const R = 100, C = 2 * Math.PI * R, arc = C * 0.75;
  const color = riskColor(risk);
  return (
    <div className="gauge" role="img" aria-label={`Riesgo ${risk.toFixed(1)} de 100, ${label}`}>
      <svg viewBox="0 0 240 240">
        <g transform="rotate(135 120 120)" fill="none" strokeLinecap="round" strokeWidth="16">
          <circle cx="120" cy="120" r={R} stroke="var(--track)" strokeDasharray={`${arc} ${C}`} />
          <circle className="gauge-arc" cx="120" cy="120" r={R} stroke={color} strokeDasharray={`${(arc * risk) / 100} ${C}`} />
        </g>
      </svg>
      <div className="gauge-center">
        <div className="gauge-num" style={{ color }}>{risk.toFixed(1)}</div>
        <div className="gauge-cat">{label}</div>
      </div>
    </div>
  );
}

export function Countdown({ nextTickAt, status, mode }: { nextTickAt: number | null; status: Status; mode: Mode }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (nextTickAt === null) return;
    const id = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(id);
  }, [nextTickAt]);
  if (mode === 'manual') return <span className="muted">sin ciclos (manual)</span>;
  if (nextTickAt === null) return <span className="muted">{status === 'pausada' ? 'en pausa' : '—'}</span>;
  return <span className="mono">próximo ciclo en {Math.max(0, (nextTickAt - now) / 1000).toFixed(1)} s</span>;
}
