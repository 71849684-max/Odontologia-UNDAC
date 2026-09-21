import HerramientasOdontograma from './HerramientasOdontograma.jsx';
import ShapeEditor from './ShapeEditor.jsx';
import React, { useRef, useState } from 'react';
import { Maximize2, X } from 'lucide-react';
import './odontograma.css';
import { arches, temporaryArches, toothSurfaces, stateFor, clinicalColor, markCode } from './odontograma.config.mjs';
import { readRecord, updateExamination, closeExamination, addExamination, addFinding, removeFinding, toothFindings, examinationReasons, localDate } from './odontogramaRegistro.mjs';
import { OdontogramRow } from './GraficoOdontograma.jsx';
import { SectionCard } from '../compartidos/ControlesClinicos.jsx';


function load(patientId, key) {
  try { const raw = localStorage.getItem(key); return { record: readRecord(raw, patientId), raw, error: '' }; }
  catch (error) { return { record: null, raw: null, error: error.message || 'El almacenamiento local no está disponible.' }; }
}


// El padre usa una key por historia para aislar los pacientes también en memoria.
export default function Odontograma({ patientId = 'demo', patientName = '', historyCode = '' }) {
  const storageKey = `undac:odontograma:nts188:v1:${patientId}`;
  const [initial] = useState(() => load(patientId, storageKey));
  const [record, setRecord] = useState(initial.record);
  const expectedRaw = useRef(initial.raw);
  const [error, setError] = useState(initial.error);
  const [examId, setExamId] = useState(initial.record?.examinations.at(-1).id);
  const [selectedTooth, setSelectedTooth] = useState('11');
  const [surface, setSurface] = useState('oclusal');
  const [stateId, setStateId] = useState('caries');
  const [code, setCode] = useState('CE');
  const [mode, setMode] = useState('inspect');
  const [dentition, setDentition] = useState('permanent');
  const [condition, setCondition] = useState('good');
  const [endTooth, setEndTooth] = useState('');
  const [note, setNote] = useState('');
  const [points, setPoints] = useState([]);
  const [reason, setReason] = useState('Nuevos hallazgos');
  const [reviewed, setReviewed] = useState(false);
  const [message, setMessage] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [actionTarget, setActionTarget] = useState(null);

  React.useEffect(() => {
    if (!mobileOpen) return undefined;
    document.body.classList.add('nts-modal-open');
    return () => document.body.classList.remove('nts-modal-open');
  }, [mobileOpen]);

  if (!record) return <SectionCard title="Odontograma"><p role="alert">{error}</p><p>Recupere el almacenamiento del navegador antes de continuar. El registro existente no se ha reemplazado.</p></SectionCard>;
  const exam = record.examinations.find((e) => e.id === examId) || record.examinations.at(-1);
  const locked = exam.status === 'closed', state = stateFor(stateId);
  const selectedMarks = [...toothFindings(exam.teeth[selectedTooth]), ...exam.ranges.filter((m) => m.teeth.includes(selectedTooth))];
  const allMarks = [...Object.entries(exam.teeth).flatMap(([number, tooth]) => toothFindings(tooth).map((m) => ({ ...m, teeth: [number] }))), ...exam.ranges];
  const actionSurface = actionTarget ? toothSurfaces.find((item) => item.id === actionTarget.surface) : null;

  const persist = (next) => {
    try {
      if (localStorage.getItem(storageKey) !== expectedRaw.current) throw new Error('El registro cambió en otra pestaña. Recargue la página para leer la versión más reciente antes de editar.');
      const raw = JSON.stringify(next);
      localStorage.setItem(storageKey, raw);
      expectedRaw.current = raw;
      setRecord(next); setError(''); setMessage('Guardado en este navegador.');
      return true;
    } catch (e) { setError(`No se guardó el cambio. ${e.message}`); setMessage(''); return false; }
  };
  const run = (action) => { try { return action(); } catch (e) { setError(e.message); return false; } };
  const change = (changes) => run(() => { if (persist(updateExamination(record, exam.id, changes))) setReviewed(false); });
  const resetEditor = () => { setPoints([]); setNote(''); setEndTooth(''); setReviewed(false); };
  const chooseTool = (id, nextCode) => {
    const nextState = stateFor(id);
    setStateId(id); setCode(nextCode ?? nextState.options[0] ?? '');
    setCondition('good'); setMode('mark'); resetEditor();
  };
  const apply = (number = selectedTooth, nextSurface = surface, tracedPoints = []) => run(() => {
    const existing = state.scope === 'surface' ? exam.teeth[number].surfaces[nextSurface].findings : exam.teeth[number].findings;
    if (!tracedPoints.length && existing.some((mark) => mark.state === stateId && mark.code === code && mark.condition === (state.condition ? condition : 'good') && mark.note === note.trim())) {
      setMessage('Este hallazgo ya está registrado en la selección.'); return false;
    }
    const next = addFinding(exam, { state: stateId, tooth: number, surface: nextSurface, endTooth, code, condition, note, points: tracedPoints, representation: tracedPoints.length ? 'traced' : 'schematic' });
    if (persist(updateExamination(record, exam.id, { teeth: next.teeth, ranges: next.ranges }))) { setPoints([]); setNote(''); setReviewed(false); return true; }
    return false;
  });
  const remove = (id) => run(() => { const next = removeFinding(exam, id); if (persist(updateExamination(record, exam.id, { teeth: next.teeth, ranges: next.ranges }))) { setReviewed(false); return true; } return false; });
  const erase = (number, nextSurface) => {
    const tooth = exam.teeth[number];
    const mark = tooth.findings.findLast((item) => item.state === 'ausente') || tooth.surfaces[nextSurface].findings.at(-1) || tooth.findings.at(-1);
    return mark ? remove(mark.id) : false;
  };
  const select = (number, nextSurface) => {
    setSelectedTooth(number); setSurface(nextSurface); setPoints([]);
    if (mobileOpen) { setActionTarget({ tooth: number, surface: nextSurface }); return; }
    if (locked || mode === 'inspect') return;
    if (mode === 'erase') { erase(number, nextSurface); return; }
    apply(number, nextSurface);
  };
  const applyMobileAction = () => {
    if (!actionTarget || locked || mode === 'inspect') { setActionTarget(null); return; }
    const changed = mode === 'erase' ? erase(actionTarget.tooth, actionTarget.surface) : apply(actionTarget.tooth, actionTarget.surface, points);
    if (changed) setActionTarget(null);
  };
  const add = () => apply(selectedTooth, surface, points);

  return <div className={`undac-section-stack hc-odontogram nts-odontogram${mobileOpen ? ' is-mobile-open' : ''}`}>
    <div className="nts-mobile-launcher">
      <button type="button" className="undac-btn undac-btn--primary" onClick={() => setMobileOpen(true)}><Maximize2 size={18} />Abrir odontograma</button>
      <small>Abra el odontograma para registrar hallazgos sin recargar esta sección.</small>
    </div>
    <div className="nts-mobile-modal" onMouseDown={(event) => { if (event.target === event.currentTarget) { setActionTarget(null); setMobileOpen(false); } }}>
      <div className="nts-mobile-modal__window" role={mobileOpen ? 'dialog' : undefined} aria-modal={mobileOpen || undefined} aria-label={mobileOpen ? 'Odontograma' : undefined}>{mobileOpen ? <header className="nts-mobile-modal__header"><div><strong>Odontograma</strong><small>Toque una superficie para ver sus acciones.</small></div><button type="button" className="hc-mini-button" onClick={() => { setActionTarget(null); setMobileOpen(false); }} aria-label="Cerrar odontograma"><X size={18} /></button></header> : null}
    <SectionCard title="Odontograma" subtitle="Seleccione un hallazgo y marque la pieza o superficie afectada.">
      <div className="nts-notice">Modo de demostración · {patientName || 'Paciente de demostración'} · {historyCode}. Los cambios se conservan únicamente en este navegador; el cierre local no constituye firma digital.</div>
      <details className="nts-evaluation-details nts-no-print"><summary>Datos de la evaluación</summary>
      <div className="nts-record-toolbar">
        <label className="undac-field"><span>Evaluación</span><select value={exam.id} onChange={(e) => { setExamId(e.target.value); resetEditor(); }}>{record.examinations.map((e, i) => <option key={e.id} value={e.id}>{i + 1}. {e.reason} · {e.date} · {e.status === 'closed' ? 'Cerrada' : 'Borrador'}</option>)}</select></label>
        {!record.examinations.some((e) => e.status === 'draft') && <><label className="undac-field"><span>Motivo de nueva evaluación</span><select value={reason} onChange={(e) => setReason(e.target.value)}>{examinationReasons.filter((r) => r !== 'Inicial').map((r) => <option key={r}>{r}</option>)}</select></label><button type="button" className="undac-btn undac-btn--secondary" onClick={() => run(() => { const next = addExamination(record, reason); if (persist(next)) { setExamId(next.examinations.at(-1).id); resetEditor(); } })}>Nueva evaluación</button></>}
      </div>
      <div className="nts-metadata">
        <label className="undac-field"><span>Fecha de evaluación</span><input type="date" max={localDate()} value={exam.date} disabled={locked} onChange={(e) => change({ date: e.target.value })} /></label>
        <label className="undac-field"><span>Cirujano dentista responsable</span><input value={exam.professional} disabled={locked} onChange={(e) => change({ professional: e.target.value })} /></label>
        <label className="undac-field"><span>N.° COP</span><input value={exam.cop} inputMode="numeric" maxLength={8} disabled={locked} onChange={(e) => change({ cop: e.target.value })} /></label>
      </div>
      </details>
      {error && <p className="nts-error" role="alert">{error}</p>}
      {message && <p className="nts-save-status" role="status">{message}</p>}
      <HerramientasOdontograma mode={mode} state={state} code={code} condition={condition} endTooth={endTooth}
        selectedTooth={selectedTooth} locked={locked} onMode={setMode} onTool={chooseTool} onCode={setCode}
        onCondition={setCondition} onEndTooth={setEndTooth} />
      <div className="nts-dentition" role="group" aria-label="Dentición visible">
        {[['permanent', 'Permanente'], ['temporary', 'Temporal'], ['mixed', 'Mixta']].map(([value, label]) => <button key={value} type="button" aria-pressed={dentition === value} onClick={() => {
          setDentition(value); setPoints([]);
          if (value === 'temporary' && Number(selectedTooth[0]) < 5) setSelectedTooth('51');
          if (value === 'permanent' && Number(selectedTooth[0]) > 4) setSelectedTooth('11');
        }}>{label}</button>)}
      </div>
      <div className="nts-chart-scroll" role="region" aria-label="Odontograma desplazable" tabIndex={0}><div className="nts-chart">
        <div className="nts-orientation"><span>Derecha del paciente</span><span>Izquierda del paciente</span></div>
        {dentition !== 'temporary' && <OdontogramRow title="Permanentes superiores" teeth={arches.superior} exam={exam} selectedTooth={selectedTooth} selectedSurface={surface} onSelect={select} />}
        {dentition !== 'permanent' && <OdontogramRow title="Temporales superiores" teeth={temporaryArches.superior} exam={exam} selectedTooth={selectedTooth} selectedSurface={surface} onSelect={select} />}
        <div className="nts-occlusal">Plano oclusal</div>
        {dentition !== 'permanent' && <OdontogramRow title="Temporales inferiores" teeth={temporaryArches.inferior} exam={exam} selectedTooth={selectedTooth} selectedSurface={surface} onSelect={select} />}
        {dentition !== 'temporary' && <OdontogramRow title="Permanentes inferiores" teeth={arches.inferior} exam={exam} selectedTooth={selectedTooth} selectedSurface={surface} onSelect={select} />}
      </div></div>
      <div className="nts-legend"><span><i className="nts-blue" />Azul: buen estado / característica no patológica</span><span><i className="nts-red" />Rojo: patología / mal estado / temporal</span><span>Sin marca: sin hallazgo registrado; no equivale a pieza sana.</span></div>
    </SectionCard>

    <SectionCard title={`Pieza ${selectedTooth}`} subtitle="Revise o quite los hallazgos de la pieza seleccionada." className="nts-no-print">
      <div className="nts-mobile-surface-picker" role="group" aria-label={`Superficies de pieza ${selectedTooth}`}>
        {toothSurfaces.map((item) => <button key={item.id} type="button" disabled={locked} aria-pressed={surface === item.id} onClick={() => select(selectedTooth, item.id)}>{item.label}</button>)}
      </div>
      <details className="nts-extra-details"><summary>Detalles adicionales del hallazgo</summary>
        <fieldset disabled={locked} className="nts-editor-fields">
          <label className="undac-field"><span>Superficie</span><select value={surface} onChange={(event) => { setSurface(event.target.value); setPoints([]); }}>{toothSurfaces.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
          <label className="undac-field"><span>Especificación del hallazgo</span><textarea rows="2" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Detalle opcional…" /></label>
          {state.graphic.startsWith('draw-') && <details><summary>Trazo personalizado (opcional)</summary><ShapeEditor number={selectedTooth} tooth={exam.teeth[selectedTooth]} surface={state.scope === 'surface' ? surface : null} state={state} points={points} onChange={setPoints} disabled={locked} condition={condition} /></details>}
          <button type="button" className="undac-btn undac-btn--primary" onClick={add}>Añadir hallazgo</button>
        </fieldset>
      </details>
      <div className="nts-findings"><h4>Hallazgos de la pieza {selectedTooth}</h4>{selectedMarks.length === 0 ? <p>Sin hallazgos registrados.</p> : selectedMarks.map((m) => <div key={m.id}><span style={{ color: clinicalColor(m) }}><b>{markCode(m)}</b> {stateFor(m.state).label}</span><span>{m.surface ? toothSurfaces.find((s) => s.id === m.surface)?.label : m.teeth.join(' – ')}{m.note ? ` · ${m.note}` : ''}</span>{!locked && <button type="button" className="undac-btn undac-btn--ghost" onClick={() => remove(m.id)}>Quitar del borrador</button>}</div>)}</div>
    </SectionCard>

    <SectionCard title="Especificaciones y observaciones">
      <div className="nts-notes">
        <label className="undac-field"><span>Especificaciones</span><textarea rows="3" disabled={locked} value={exam.specifications} onChange={(e) => change({ specifications: e.target.value })} placeholder="Características adicionales, fluorosis y clasificación, material o color del metal…" /></label>
        <label className="undac-field"><span>Observaciones</span><textarea rows="3" disabled={locked} value={exam.observations} onChange={(e) => change({ observations: e.target.value })} placeholder="Hallazgos clínicos no contemplados en la nomenclatura…" /></label>
      </div>
      {allMarks.length > 0 && <details className="nts-register"><summary>Registro de hallazgos ({allMarks.length})</summary><table><thead><tr><th>Pieza(s)</th><th>Hallazgo / sigla</th><th>Superficie</th><th>Especificación</th></tr></thead><tbody>{allMarks.map((m) => <tr key={m.id}><td>{m.teeth.join(', ')}</td><td style={{ color: clinicalColor(m) }}>{stateFor(m.state).label} {markCode(m)}{stateFor(m.state).condition ? ` · ${m.condition === 'bad' ? 'Mal estado' : 'Buen estado'}` : ''}</td><td>{m.surface ? toothSurfaces.find((s) => s.id === m.surface)?.label : 'Pieza / conjunto'}</td><td>{m.note || '—'}</td></tr>)}</tbody></table></details>}
      {!locked ? <div className="nts-close nts-no-print"><label><input type="checkbox" checked={reviewed} onChange={(e) => setReviewed(e.target.checked)} /> He revisado el registro de esta evaluación.</label><button type="button" className="undac-btn undac-btn--primary" disabled={!reviewed} onClick={() => run(() => { if (persist(closeExamination(record, exam.id))) { setReviewed(false); setMessage('Evaluación cerrada y conservada en este navegador.'); } })}>Cerrar evaluación</button></div> : <p>Cerrada el {new Date(exam.closedAt).toLocaleString('es-PE')} · Responsable: {exam.professional} · COP {exam.cop}</p>}
    </SectionCard>
      {mobileOpen && actionTarget && (
        <div className="nts-action-modal-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setActionTarget(null); }}>
          <section className="nts-action-modal" role="dialog" aria-modal="true" aria-label={`Acciones para pieza ${actionTarget.tooth}, ${actionSurface?.label}`}>
            <header>
              <div><h3>Pieza {actionTarget.tooth}</h3><p>{actionSurface?.label}</p></div>
              <button type="button" className="hc-mini-button" onClick={() => setActionTarget(null)} aria-label="Cerrar acciones de la pieza"><X size={18} /></button>
            </header>
            <HerramientasOdontograma mode={mode} state={state} code={code} condition={condition} endTooth={endTooth}
              selectedTooth={actionTarget.tooth} locked={locked} onMode={setMode} onTool={chooseTool} onCode={setCode}
              onCondition={setCondition} onEndTooth={setEndTooth} />
            <footer>
              <button type="button" className="undac-btn undac-btn--secondary" onClick={() => setActionTarget(null)}>Cancelar</button>
              <button type="button" className="undac-btn undac-btn--primary" onClick={applyMobileAction}>{locked || mode === 'inspect' ? 'Cerrar' : mode === 'erase' ? 'Borrar marca' : 'Aplicar en esta superficie'}</button>
            </footer>
          </section>
        </div>
      )}
    </div>
  </div></div>;
}
