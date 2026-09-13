import React from 'react';
import { odontogramStates } from './odontograma.config.mjs';
import { toothRow } from './odontogramaRegistro.mjs';
import { optionLabels, quickTools } from './opcionesOdontograma.mjs';
import IconoHerramienta from './IconoHerramienta.jsx';

export default function HerramientasOdontograma({ mode, state, code, condition, endTooth, selectedTooth, locked, onMode, onTool, onCode, onCondition, onEndTooth }) {
  return <fieldset disabled={locked} className="nts-tools nts-no-print">
    <legend>Elija qué marcar y toque el diente</legend>
    <div className="nts-quick-tools" role="group" aria-label="Herramientas de marcado">
      <button type="button" className="nts-tool nts-tool--inspect" aria-pressed={mode === 'inspect'} onClick={() => onMode('inspect')}><IconoHerramienta type="inspect" />Consultar</button>
      {quickTools.map((tool) => <button type="button" className={`nts-tool nts-tool--${tool.icon}`} key={tool.label} title={tool.description}
        aria-pressed={mode === 'mark' && state.id === tool.state && (tool.state !== 'ausente' || code === tool.code)}
        onClick={() => onTool(tool.state, tool.code)}>
        <IconoHerramienta type={tool.icon} />{tool.label}
      </button>)}
      <button type="button" className="nts-tool nts-tool--erase" aria-pressed={mode === 'erase'} onClick={() => onMode('erase')}><IconoHerramienta type="erase" />Borrar marca</button>
    </div>
    {mode === 'mark' && <div className="nts-tool-options">
      {state.options.length > 0 && <label className="undac-field"><span>Clasificación / material</span><select value={code} onChange={(event) => onCode(event.target.value)}>{state.options.map((value) => <option key={value} value={value}>{value} · {optionLabels[value] || value}</option>)}</select></label>}
      {state.condition && <label className="undac-field"><span>Estado del tratamiento observado</span><select value={condition} onChange={(event) => onCondition(event.target.value)}><option value="good">Buen estado · azul</option><option value="bad">Mal estado · rojo</option></select></label>}
      {['pair', 'range'].includes(state.scope) && <label className="undac-field"><span>{state.scope === 'pair' ? 'Pieza adyacente' : 'Hasta la pieza'}</span><select value={endTooth} onChange={(event) => onEndTooth(event.target.value)}><option value="">Seleccione</option>{toothRow(selectedTooth).filter((number) => number !== selectedTooth).map((number) => <option key={number}>{number}</option>)}</select></label>}
    </div>}
    <details className="nts-more-findings"><summary>Más hallazgos</summary><label className="undac-field"><span>Hallazgo clínico</span><select value={mode === 'mark' ? state.id : ''} onChange={(event) => onTool(event.target.value)}><option value="" disabled>Seleccione un hallazgo</option>{odontogramStates.filter((item) => item.id !== 'sin-registro').map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label></details>
    <p className="nts-guidance" aria-live="polite">{locked ? 'Evaluación cerrada: puede consultar las piezas.' : mode === 'inspect' ? 'Seleccione un hallazgo de la barra para empezar a marcar.' : mode === 'erase' ? 'Toque una marca para quitarla del borrador. La ausencia se quita de toda la pieza.' : state.id === 'ausente' ? 'Toque cualquier superficie: se marcarán las cinco secciones de la pieza.' : state.scope === 'surface' ? 'Toque la superficie afectada para aplicar el hallazgo. Se guarda automáticamente.' : ['pair', 'range'].includes(state.scope) ? 'Seleccione la pieza final y toque la pieza inicial para marcar el conjunto.' : state.scope === 'arch' ? 'Toque una pieza para aplicar el hallazgo a toda su arcada.' : 'Toque una pieza para aplicar el hallazgo.'}</p>
  </fieldset>;
}
