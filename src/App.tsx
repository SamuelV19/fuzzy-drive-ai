import { useSimulation } from './sim/useSimulation';
import { Controls } from './components/Controls';
import { EventLog } from './components/EventLog';
import { FuzzyExplorer } from './components/FuzzyExplorer';
import { RiskChart } from './components/RiskChart';
import { Countdown, Panel, RiskGauge, TelemetryCard } from './components/ui';
import { DISTANCE, ROAD, SPEED } from './fuzzy/variables';

const dominant = (m: Record<string, number>, sets: Record<string, { label: string }>) => {
  const [k] = Object.entries(m).sort((a, b) => b[1] - a[1])[0];
  return sets[k].label;
};

export default function App() {
  const sim = useSimulation();
  const { current, status, mode } = sim;
  const r = current.result;
  const label = mode === 'manual' ? 'manual' : status;
  return (
    <div className="app">
      <header className="topbar">
        <div className="logo">Fuzzy<span>Drive</span> AI</div>
        <div className="top-right">
          <span className={`state s-${mode === 'manual' ? 'manual' : status}`}><i />{label}</span>
          <Countdown nextTickAt={sim.nextTickAt} status={status} mode={mode} />
          <span className="chip warn">Datos simulados · no son mediciones reales</span>
        </div>
      </header>

      <main>
        <div className="hero">
          <Panel title="Riesgo vial" note="Mamdani · centroide" className="gauge-panel">
            <RiskGauge risk={r.risk} label={r.categoryLabel} />
            <p className="reco">{r.recommendation}</p>
            {r.degenerate && <p className="hint">Caso degenerado: ninguna regla se activó; se muestra el valor neutro.</p>}
          </Panel>
          <div className="tele-col">
            <TelemetryCard label="Velocidad" value={r.input.speed} unit="km/h" min={SPEED.min} max={SPEED.max} set={dominant(r.memberships.speed, SPEED.sets)} />
            <TelemetryCard label="Distancia al obstáculo" value={r.input.distance} unit="m" min={DISTANCE.min} max={DISTANCE.max} set={dominant(r.memberships.distance, DISTANCE.sets)} />
            <TelemetryCard label="Adversidad de la vía" value={r.input.road} unit="/100" min={ROAD.min} max={ROAD.max} set={dominant(r.memberships.road, ROAD.sets)} />
          </div>
          <Panel title="Control de simulación"><Controls sim={sim} /></Panel>
        </div>

        <Panel title="Evolución del riesgo" note="últimos 30 ciclos"><RiskChart history={sim.history} /></Panel>
        <Panel title="Explorador de lógica difusa" note="ciclo actual"><FuzzyExplorer result={r} /></Panel>
        <Panel title="Registro de eventos" note="datos simulados"><EventLog history={sim.history} /></Panel>
      </main>
      <footer>FuzzyDrive AI es una herramienta educativa. Todo se calcula localmente en el navegador con datos simulados.</footer>
    </div>
  );
}
