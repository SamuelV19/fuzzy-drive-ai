import type { useSimulation } from '../sim/useSimulation';
import { INTERVALS } from '../sim/useSimulation';
import { DISTANCE, ROAD, SPEED } from '../fuzzy/variables';
import { SCENARIOS, type ScenarioKey } from '../sim/scenarios';

type Sim = ReturnType<typeof useSimulation>;

export function Controls({ sim }: { sim: Sim }) {
  const { status, mode } = sim;
  return (
    <div className="controls">
      <div className="btn-row">
        <button className="btn primary" onClick={sim.start} disabled={status !== 'detenida'}>Iniciar</button>
        <button className="btn" onClick={sim.togglePause} disabled={status === 'detenida'}>{status === 'pausada' ? 'Reanudar' : 'Pausar'}</button>
        <button className="btn ghost" onClick={sim.reset}>Reiniciar historial</button>
      </div>
      <div className="field">
        <span>Modo</span>
        <div className="seg" role="group" aria-label="Modo de simulación">
          {([['auto', 'Automático'], ['manual', 'Manual'], ['demo', 'Demo crítica']] as const).map(([m, l]) => (
            <button key={m} className={mode === m ? 'on' : ''} onClick={() => sim.setMode(m)}>{l}</button>
          ))}
        </div>
      </div>
      <div className="field">
        <span>Intervalo</span>
        <div className="seg" role="group" aria-label="Intervalo del ciclo">
          {INTERVALS.map((ms) => (
            <button key={ms} className={sim.intervalMs === ms ? 'on' : ''} onClick={() => sim.setIntervalMs(ms)}>{ms / 1000} s</button>
          ))}
        </div>
      </div>
      {mode === 'manual' && (
        <div className="manual">
          {[SPEED, DISTANCE, ROAD].map((v) => {
            const key = v.name as 'speed' | 'distance' | 'road';
            return (
              <label key={v.name} className="slider">
                <span>{v.label}<b>{sim.manual[key]} {v.unit}</b></span>
                <input type="range" min={v.min} max={v.max} step={1} value={sim.manual[key]} onChange={(e) => sim.setManual({ [key]: Number(e.target.value) })} />
              </label>
            );
          })}
          <div className="btn-row">
            {(Object.keys(SCENARIOS) as ScenarioKey[]).map((k) => (
              <button key={k} className="btn small" onClick={() => sim.applyScenario(k)}>{SCENARIOS[k].label}</button>
            ))}
            <button className="btn small primary" onClick={sim.logManual}>Registrar lectura</button>
          </div>
        </div>
      )}
      {mode === 'demo' && <p className="hint">La demo recorre 9 pasos fijos: favorable → intermedio → crítico, y vuelve a empezar.</p>}
    </div>
  );
}
