import React, { useMemo, useState } from 'react';
import {
  arches,
  toothSurfaces,
  odontogramStates,
  createEmptyOdontogram,
  applyOdontogramMark,
  clearToothMarks,
  setToothGeneralNote,
  countRegisteredSurfaces,
} from '../../configuracion/odontograma.config.mjs';
import { SectionCard } from './ControlesClinicos.jsx';

const surfacePosition = {
  vestibular: 'surface-top',
  lingual: 'surface-bottom',
  mesial: 'surface-left',
  distal: 'surface-right',
  oclusal: 'surface-center',
};

function stateFor(id) {
  return odontogramStates.find((item) => item.id === id) || odontogramStates[0];
}

function Tooth({ number, data, selectedTooth, selectedSurface, onSelect }) {
  const isSelected = selectedTooth === number;
  const registered = Object.values(data.surfaces).filter((surface) => surface.state !== 'sin-registro').length;
  return (
    <div className={`undac-tooth ${isSelected ? 'is-selected' : ''}`}>
      <button type="button" className="undac-tooth__number" onClick={() => onSelect(number, 'oclusal')} aria-label={`Seleccionar pieza ${number}`}>{number}</button>
      <div className="undac-tooth__surface-map" aria-label={`Superficies de la pieza ${number}`}>
        {toothSurfaces.map((surface) => {
          const mark = data.surfaces[surface.id];
          const state = stateFor(mark.state);
          const active = isSelected && selectedSurface === surface.id;
          return (
            <button
              key={surface.id}
              type="button"
              className={`undac-tooth-surface ${surfacePosition[surface.id]} ${state.className} ${active ? 'is-active' : ''}`}
              onClick={() => onSelect(number, surface.id)}
              title={`${number} · ${surface.label} · ${state.label}`}
              aria-label={`Pieza ${number}, superficie ${surface.label}, estado ${state.label}`}
            >
              <span>{state.symbol === '—' ? '' : state.symbol}</span>
            </button>
          );
        })}
      </div>
      <span className="undac-tooth__summary">{registered ? `${registered}/5` : '—'}</span>
    </div>
  );
}

function Arch({ title, teeth, data, selectedTooth, selectedSurface, onSelect }) {
  return (
    <section className="undac-arch" aria-label={title}>
      <div className="undac-arch__title"><span>{title}</span><small>{teeth.length} piezas</small></div>
      <div className="undac-arch__teeth">
        {teeth.map((number, index) => <React.Fragment key={number}><Tooth number={number} data={data[number]} selectedTooth={selectedTooth} selectedSurface={selectedSurface} onSelect={onSelect} />{index === 7 ? <div className="undac-midline" aria-hidden="true" /> : null}</React.Fragment>)}
      </div>
    </section>
  );
}

export default function Odontograma({ value, onChange }) {
  const data = value || createEmptyOdontogram();
  const [selectedTooth, setSelectedTooth] = useState('11');
  const [selectedSurface, setSelectedSurface] = useState('oclusal');
  const [selectedState, setSelectedState] = useState('caries');
  const [draftNote, setDraftNote] = useState('');
  const [undoStack, setUndoStack] = useState([]);

  const currentSurface = data[selectedTooth]?.surfaces?.[selectedSurface];
  const currentTooth = data[selectedTooth];
  const registeredSurfaces = useMemo(() => countRegisteredSurfaces(data), [data]);

  const selectSurface = (tooth, surface) => {
    setSelectedTooth(tooth);
    setSelectedSurface(surface);
    const mark = data[tooth]?.surfaces?.[surface];
    if (mark) {
      setSelectedState(mark.state === 'sin-registro' ? 'caries' : mark.state);
      setDraftNote(mark.note || '');
    }
  };

  const commit = (next) => {
    setUndoStack((current) => [...current.slice(-19), data]);
    onChange?.(next);
  };

  const applyState = (stateId = selectedState) => {
    setSelectedState(stateId);
    const next = applyOdontogramMark(data, selectedTooth, selectedSurface, stateId, draftNote);
    commit(next);
  };

  const markWholeTooth = () => {
    let next = data;
    toothSurfaces.forEach((surface) => {
      next = applyOdontogramMark(next, selectedTooth, surface.id, selectedState, surface.id === selectedSurface ? draftNote : '');
    });
    commit(next);
  };

  const clearSelectedTooth = () => commit(clearToothMarks(data, selectedTooth));

  const undo = () => {
    if (!undoStack.length) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack((current) => current.slice(0, -1));
    onChange?.(previous);
  };

  const saveGeneralNote = (note) => onChange?.(setToothGeneralNote(data, selectedTooth, note));

  return (
    <div className="undac-section-stack undac-odontogram-page hc-odontogram">
      <SectionCard title="Odontograma digital" subtitle="Vista interactiva de dentición permanente con numeración FDI, cinco superficies por pieza, leyenda y detalle local. La persistencia real queda fuera de esta fase." actions={<div className="undac-odontogram-stats"><span><b>{registeredSurfaces}</b> superficies registradas</span><button type="button" className="undac-btn undac-btn--ghost undac-btn--sm" onClick={undo} disabled={!undoStack.length}>↶ Deshacer</button></div>}>
        <div className="undac-odontogram-toolbar" aria-label="Leyenda y herramientas del odontograma">
          <div className="undac-odontogram-toolbar__label"><strong>Estado / hallazgo</strong><span>Seleccione una superficie y luego el estado.</span></div>
          <div className="undac-state-tools">
            {odontogramStates.filter((item) => item.id !== 'sin-registro').map((state) => (
              <button key={state.id} type="button" className={`undac-state-tool ${state.className} ${selectedState === state.id ? 'is-selected' : ''}`} onClick={() => applyState(state.id)} aria-pressed={selectedState === state.id}>
                <span>{state.symbol}</span><strong>{state.label}</strong>
              </button>
            ))}
          </div>
        </div>

        <div className="undac-odontogram-canvas">
          <Arch title="Arcada superior" teeth={arches.superior} data={data} selectedTooth={selectedTooth} selectedSurface={selectedSurface} onSelect={selectSurface} />
          <div className="undac-occlusal-line"><span>Plano oclusal</span></div>
          <Arch title="Arcada inferior" teeth={arches.inferior} data={data} selectedTooth={selectedTooth} selectedSurface={selectedSurface} onSelect={selectSurface} />
        </div>

        <div className="undac-odontogram-legend">
          <strong>Leyenda:</strong>
          {odontogramStates.map((state) => <span key={state.id}><i className={state.className}>{state.symbol}</i>{state.label}</span>)}
        </div>
      </SectionCard>

      <div className="undac-odontogram-bottom">
        <SectionCard title={`Detalle de pieza ${selectedTooth}`} subtitle="La selección de superficie se conserva visualmente y no depende solo del color.">
          <div className="undac-piece-detail">
            <div className="undac-piece-detail__surface">
              <span>Superficie seleccionada</span>
              <strong>{toothSurfaces.find((surface) => surface.id === selectedSurface)?.label}</strong>
              <small>Estado actual: {stateFor(currentSurface?.state).label}</small>
            </div>
            <label className="undac-field"><span>Nota de la superficie</span><textarea rows="3" value={draftNote} onChange={(event) => setDraftNote(event.target.value)} placeholder="Observación local de la superficie seleccionada..." /></label>
            <div className="undac-piece-detail__actions">
              <button type="button" className="undac-btn undac-btn--primary" onClick={() => applyState(selectedState)}>Guardar superficie</button>
              <button type="button" className="undac-btn undac-btn--secondary" onClick={markWholeTooth}>Aplicar estado a toda la pieza</button>
              <button type="button" className="undac-btn undac-btn--danger-soft" onClick={clearSelectedTooth}>Limpiar pieza</button>
            </div>
          </div>
        </SectionCard>
        <SectionCard title="Observación general de la pieza" subtitle="Comentario complementario independiente de las superficies.">
          <label className="undac-field"><span>Observación de pieza {selectedTooth}</span><textarea rows="5" value={currentTooth?.generalNote || ''} onChange={(event) => saveGeneralNote(event.target.value)} placeholder="Observación general..." /></label>
          <div className="undac-surface-summary">
            {toothSurfaces.map((surface) => { const state = stateFor(currentTooth?.surfaces?.[surface.id]?.state); return <button type="button" key={surface.id} onClick={() => selectSurface(selectedTooth, surface.id)} className={selectedSurface === surface.id ? 'is-active' : ''}><span>{surface.short}</span><strong>{state.symbol}</strong><small>{state.label}</small></button>; })}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
