import { allTeeth, arches, temporaryArches, createEmptyOdontogram, stateFor, toothSurfaces } from './odontograma.config.mjs';

export const examinationReasons = ['Inicial', 'Nuevos hallazgos', 'Fin de tratamiento', 'Reingreso', 'Solicitud judicial', 'Solicitud personal'];
const id = () => globalThis.crypto.randomUUID();
export function localDate() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function createExamination(reason = 'Inicial') {
  return { id: id(), reason, date: localDate(), professional: '', cop: '', status: 'draft', teeth: createEmptyOdontogram(), ranges: [], specifications: '', observations: '', createdAt: new Date().toISOString(), closedAt: null };
}
export function createRecord(patientId) {
  return { version: 1, patientId: String(patientId), examinations: [createExamination()] };
}
export function updateExamination(record, examId, changes) {
  const exam = record.examinations.find((e) => e.id === examId);
  if (!exam || exam.status !== 'draft') throw new Error('La evaluación está cerrada. Cree una nueva evaluación.');
  const allowed = ['date','professional','cop','teeth','ranges','specifications','observations'];
  if (Object.keys(changes).some((key) => !allowed.includes(key))) throw new Error('Cambio no permitido.');
  return { ...record, examinations: record.examinations.map((e) => e.id === examId ? { ...e, ...changes } : e) };
}
export function closeExamination(record, examId) {
  const exam = record.examinations.find((e) => e.id === examId);
  if (!exam || exam.status !== 'draft') throw new Error('La evaluación ya está cerrada.');
  const parsedDate = new Date(`${exam.date}T12:00:00Z`);
  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(exam.date) && !Number.isNaN(parsedDate.getTime()) && parsedDate.toISOString().slice(0, 10) === exam.date;
  if (!exam.professional.trim() || !/^\d{4,8}$/.test(exam.cop) || !validDate || exam.date > localDate()) throw new Error('Complete la fecha de evaluación, el profesional responsable y un COP de 4 a 8 dígitos.');
  return { ...record, examinations: record.examinations.map((e) => e.id === examId ? { ...e, status: 'closed', closedAt: new Date().toISOString() } : e) };
}
export function addExamination(record, reason) {
  if (record.examinations.some((e) => e.status === 'draft')) throw new Error('Cierre el borrador actual antes de crear otra evaluación.');
  if (!examinationReasons.includes(reason)) throw new Error('Seleccione un motivo de evaluación.');
  return { ...record, examinations: [...record.examinations, createExamination(reason)] };
}
export function toothRow(number) {
  return [...Object.values(arches), ...Object.values(temporaryArches)].find((row) => row.includes(number));
}
export function findingTeeth(state, start, end) {
  const row = toothRow(start);
  if (!row) throw new Error('Seleccione una pieza válida.');
  if (state.scope === 'arch') return [...row];
  if (['pair','range'].includes(state.scope)) {
    if (!row.includes(end) || start === end) throw new Error('Seleccione dos piezas diferentes de la misma arcada y dentición.');
    const a = row.indexOf(start), b = row.indexOf(end);
    if (state.scope === 'pair' && Math.abs(a - b) !== 1) throw new Error('Este hallazgo requiere dos piezas adyacentes.');
    return row.slice(Math.min(a, b), Math.max(a, b) + 1);
  }
  return [start];
}
export function addFinding(exam, { state: stateId, tooth, surface, endTooth, code, condition = 'good', note = '', points = [], representation = 'traced' }) {
  if (exam.status !== 'draft') throw new Error('La evaluación está cerrada.');
  const state = stateFor(stateId);
  if (state.id === 'sin-registro') throw new Error('Seleccione un hallazgo.');
  if (state.options.length && !state.options.includes(code)) throw new Error('Seleccione la clasificación del hallazgo.');
  if (!['good','bad'].includes(condition)) throw new Error('Seleccione el estado del tratamiento.');
  if (!['traced', 'schematic'].includes(representation)) throw new Error('Representación del hallazgo no válida.');
  if (points.some((p) => !Array.isArray(p) || p.length !== 2 || p.some((v) => !Number.isFinite(v) || v < 0 || v > 100))) throw new Error('El trazo contiene puntos no válidos.');
  if (representation === 'traced' && state.graphic.startsWith('draw-') && points.length < (state.graphic === 'draw-fill' ? 3 : 2)) throw new Error('Dibuje la forma y ubicación del hallazgo sobre la pieza.');
  const teeth = findingTeeth(state, tooth, endTooth);
  const mark = { id: id(), state: stateId, code: code || '', condition: state.condition ? condition : 'good', note: note.trim(), points, representation, teeth, surface: state.scope === 'surface' ? surface : null };
  if (['range','arch','pair'].includes(state.scope)) return { ...exam, ranges: [...exam.ranges, mark] };
  const current = exam.teeth[tooth];
  if (state.scope === 'surface') {
    if (!toothSurfaces.some((s) => s.id === surface)) throw new Error('Seleccione una superficie.');
    const old = current.surfaces[surface];
    return { ...exam, teeth: { ...exam.teeth, [tooth]: { ...current, surfaces: { ...current.surfaces, [surface]: { state: stateId, note, findings: [...old.findings, mark] } } } } };
  }
  return { ...exam, teeth: { ...exam.teeth, [tooth]: { ...current, findings: [...current.findings, mark] } } };
}
export function removeFinding(exam, markId) {
  if (exam.status !== 'draft') throw new Error('La evaluación está cerrada.');
  return { ...exam, ranges: exam.ranges.filter((m) => m.id !== markId), teeth: Object.fromEntries(Object.entries(exam.teeth).map(([number, tooth]) => [number, {
    ...tooth, findings: tooth.findings.filter((m) => m.id !== markId), surfaces: Object.fromEntries(Object.entries(tooth.surfaces).map(([key, value]) => {
      const findings = value.findings.filter((m) => m.id !== markId), last = findings.at(-1);
      return [key, { ...value, findings, state: last?.state || 'sin-registro', note: last?.note || '' }];
    })),
  }])) };
}
export function toothFindings(tooth) {
  return [...tooth.findings, ...Object.values(tooth.surfaces).flatMap((s) => s.findings)];
}
export function readRecord(raw, patientId) {
  if (!raw) return createRecord(patientId);
  const value = JSON.parse(raw);
  const validMark = (m) => m && typeof m.id === 'string' && typeof m.note === 'string' && typeof m.code === 'string' && ['good','bad'].includes(m.condition) && stateFor(m.state).id !== 'sin-registro' && Array.isArray(m.teeth) && m.teeth.length > 0 && m.teeth.every((n) => allTeeth.some((t) => t.number === n)) && Array.isArray(m.points) && m.points.every((p) => Array.isArray(p) && p.length === 2 && p.every((v) => Number.isFinite(v) && v >= 0 && v <= 100));
  if (value?.version !== 1 || value.patientId !== String(patientId) || !Array.isArray(value.examinations) || !value.examinations.length || value.examinations.filter((e) => e.status === 'draft').length > 1 || value.examinations.some((e) => !e || typeof e.id !== 'string' || !['draft','closed'].includes(e.status) || !['date','professional','cop','specifications','observations'].every((key) => typeof e[key] === 'string') || !Array.isArray(e.ranges) || !e.ranges.every(validMark) || !allTeeth.every(({ number }) => {
    const t = e.teeth?.[number];
    return t && Array.isArray(t.findings) && t.findings.every(validMark) && toothSurfaces.every((s) => Array.isArray(t.surfaces?.[s.id]?.findings) && t.surfaces[s.id].findings.every(validMark));
  }))) throw new Error('No se pudo leer el odontograma guardado. Se conservó el contenido original; no se sobrescribirá.');
  return value;
}
