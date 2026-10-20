import type { Reading } from '../sim/useSimulation';
import { fmtTime, riskColor } from './ui';

const SRC = { auto: 'Aleatorio', manual: 'Manual', demo: 'Demo', inicial: 'Inicial' } as const;

export function EventLog({ history }: { history: Reading[] }) {
  const rows = history.slice(-14).reverse();
  if (rows.length === 0) return <div className="empty">El registro se llena con cada ciclo de simulación.</div>;
  return (
    <div className="table-wrap">
      <table>
        <thead><tr><th>Hora</th><th>Vel.</th><th>Dist.</th><th>Vía</th><th>Riesgo</th><th>Categoría</th><th>Reglas dominantes</th><th>Origen</th></tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td className="mono">{fmtTime(r.time)}</td>
              <td>{r.result.input.speed} km/h</td><td>{r.result.input.distance} m</td><td>{r.result.input.road}</td>
              <td className="mono" style={{ color: riskColor(r.result.risk) }}><b>{r.result.risk.toFixed(1)}</b></td>
              <td>{r.result.categoryLabel}</td>
              <td className="mono">{r.result.activations.slice(0, 3).map((a) => `${a.rule.id} (${a.strength.toFixed(2)})`).join(', ')}</td>
              <td>{SRC[r.source]} · simulado</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
