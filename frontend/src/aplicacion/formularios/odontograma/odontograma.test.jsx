import React from 'react';
import { beforeEach, afterEach, describe, test, expect, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import Odontograma from './Odontograma.jsx';
import { CompactTooth, toothSurfacePolygon, surfacePolygons } from './GraficoOdontograma.jsx';
import { arches, temporaryArches, createEmptyOdontogram, stateFor, clinicalColor, surfacePosition } from './odontograma.config.mjs';
import { createRecord, addFinding, removeFinding, toothFindings, closeExamination, updateExamination, addExamination, readRecord, findingTeeth } from './odontogramaRegistro.mjs';

// Node 25 también expone localStorage: use un almacén controlado para jsdom.
beforeEach(() => {
  const data = new Map();
  vi.stubGlobal('localStorage', { getItem: (key) => data.get(key) ?? null, setItem: (key, value) => data.set(key, String(value)), clear: () => data.clear() });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
const mark = (overrides = {}) => ({ state: 'caries', tooth: '11', surface: 'vestibular', code: 'CE', points: [[30,63],[45,64],[40,69]], ...overrides });

describe('estructura NTS 188', () => {
  test('dispone 32 permanentes y 20 temporales desde la perspectiva del observador', () => {
    expect(Object.keys(createEmptyOdontogram())).toHaveLength(52);
    expect(arches.inferior).toEqual(['48','47','46','45','44','43','42','41','31','32','33','34','35','36','37','38']);
    expect(temporaryArches.superior).toEqual(['55','54','53','52','51','61','62','63','64','65']);
    expect(temporaryArches.inferior).toEqual(['85','84','83','82','81','71','72','73','74','75']);
  });
  test('orienta superficies por cuadrante y compensa el reflejo inferior', () => {
    for (const n of ['11','41','51','81']) expect(surfacePosition(n, 'mesial')).toBe('right');
    for (const n of ['21','31','61','71']) expect(surfacePosition(n, 'mesial')).toBe('left');
    expect(surfacePosition('41', 'vestibular')).toBe('bottom');
    expect(toothSurfacePolygon('46', 'vestibular')).toBe(surfacePolygons.top);
    expect(toothSurfacePolygon('46', 'lingual')).toBe(surfacePolygons.bottom);
  });
  test('usa rojo en movilidad y desgaste, y distingue buen y mal estado', () => {
    expect(clinicalColor({ state: 'movilidad' })).toBe('#dc2626');
    expect(clinicalColor({ state: 'desgaste' })).toBe('#dc2626');
    expect(clinicalColor({ state: 'restauracion', condition: 'bad' })).toBe('#dc2626');
    expect(clinicalColor({ state: 'ausente' })).toBe('#1d4ed8');
    expect(stateFor('endodoncia').options).toEqual(['TC','PC']);
    expect(stateFor('extraccion-indicada').id).toBe('sin-registro');
  });
  test('conserva varios hallazgos y retirar uno no borra el resto', () => {
    const exam = createRecord('a').examinations[0];
    const first = addFinding(exam, mark());
    const second = addFinding(first, mark({ state: 'restauracion', code: 'R', condition: 'bad' }));
    expect(toothFindings(exam.teeth['11'])).toHaveLength(0);
    expect(toothFindings(second.teeth['11'])).toHaveLength(2);
    const next = removeFinding(second, toothFindings(second.teeth['11'])[0].id);
    expect(toothFindings(next.teeth['11'])).toHaveLength(1);
    expect(toothFindings(next.teeth['11'])[0].state).toBe('restauracion');
  });
  test('exige clasificación y forma observada; no sustituye ausencias por superficies', () => {
    const exam = createRecord('a').examinations[0];
    expect(() => addFinding(exam, mark({ code: '' }))).toThrow(/clasificación/);
    expect(() => addFinding(exam, mark({ points: [] }))).toThrow(/Dibuje/);
    const next = addFinding(exam, mark({ state: 'ausente', code: 'DEX', points: [] }));
    expect(next.teeth['11'].findings[0].code).toBe('DEX');
    expect(next.teeth['11'].surfaces.vestibular.findings).toHaveLength(0);
  });
  test('rechaza puentes entre arcadas y parejas no adyacentes', () => {
    expect(() => findingTeeth(stateFor('protesis-fija'), '11', '41')).toThrow();
    expect(() => findingTeeth(stateFor('diastema'), '11', '23')).toThrow();
    expect(findingTeeth(stateFor('protesis-fija'), '16', '13')).toEqual(['16','15','14','13']);
    expect(findingTeeth(stateFor('edentulo'), '41')).toEqual(arches.inferior);
  });
  test('el cierre exige identidad, impide edición y conserva evaluaciones previas', () => {
    let record = createRecord('a'); const examId = record.examinations[0].id;
    expect(() => closeExamination(record, examId)).toThrow(/Complete/);
    record = updateExamination(record, examId, { professional: 'Profesional de prueba', cop: '12345' });
    record = closeExamination(record, examId);
    expect(() => updateExamination(record, examId, { observations: 'Cambio' })).toThrow(/cerrada/);
    expect(() => removeFinding(record.examinations[0], 'any')).toThrow(/cerrada/);
    const next = addExamination(record, 'Nuevos hallazgos');
    expect(next.examinations[0]).toEqual(record.examinations[0]);
    expect(next.examinations[1].status).toBe('draft');
    expect(() => addExamination(next, 'Reingreso')).toThrow(/borrador/);
  });
  test('rechaza archivos ajenos o incompletos sin reemplazarlos', () => {
    expect(() => readRecord(JSON.stringify(createRecord('a')), 'b')).toThrow();
    expect(() => readRecord('{', 'a')).toThrow();
    const record = createRecord('a'); delete record.examinations[0].teeth['11'];
    expect(() => readRecord(JSON.stringify(record), 'a')).toThrow();
  });
});

test('interfaz guarda, recupera y separa el registro por historia', () => {
  const { unmount } = render(<Odontograma patientId="a" />);
  fireEvent.click(screen.getByRole('button', { name: 'Ausente', exact: true }));
  fireEvent.change(screen.getByLabelText('Clasificación / material'), { target: { value: 'DEX' } });
  fireEvent.click(screen.getByRole('button', { name: 'Pieza 11, Vestibular' }));
  for (const button of screen.getAllByRole('button', { name: /^Pieza 11,/ })) {
    expect(button).toHaveAttribute('data-state', 'ausente');
  }
  expect(screen.getByRole('button', { name: 'Quitar del borrador' })).toBeInTheDocument();
  unmount();
  const other = render(<Odontograma patientId="b" />);
  expect(screen.getByText('Sin hallazgos registrados.')).toBeInTheDocument();
  other.unmount();
  render(<Odontograma patientId="a" />);
  expect(screen.getAllByRole('button', { name: /^Pieza 11,/ })).toHaveLength(5);
  for (const button of screen.getAllByRole('button', { name: /^Pieza 11,/ })) {
    expect(button).toHaveAttribute('data-state', 'ausente');
  }
  expect(screen.getByRole('button', { name: 'Quitar del borrador' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Temporal', exact: true }));
  expect(screen.getByRole('button', { name: 'Pieza 85, Vestibular' })).toBeInTheDocument();
});

test('marca directamente sin trazado y permite consultar y borrar sin duplicar hallazgos', () => {
  render(<Odontograma patientId="simple" />);
  const stored = () => JSON.parse(localStorage.getItem('undac:odontograma:nts188:v1:simple')).examinations[0];
  fireEvent.click(screen.getByRole('button', { name: 'Caries', exact: true }));
  const vestibular = screen.getByRole('button', { name: 'Pieza 11, Vestibular' });
  fireEvent.click(vestibular);
  expect(vestibular).toHaveAttribute('data-state', 'caries');
  expect(stored().teeth['11'].surfaces.vestibular.findings[0]).toMatchObject({ code: 'CE', points: [], representation: 'schematic' });
  fireEvent.click(vestibular);
  expect(toothFindings(stored().teeth['11'])).toHaveLength(1);
  fireEvent.click(screen.getByRole('button', { name: 'Consultar', exact: true }));
  fireEvent.click(screen.getByRole('button', { name: 'Pieza 21, Mesial' }));
  expect(toothFindings(stored().teeth['21'])).toHaveLength(0);
  fireEvent.click(screen.getByRole('button', { name: 'Extraído', exact: true }));
  fireEvent.click(vestibular);
  expect(screen.getAllByRole('button', { name: /^Pieza 11,/ }).every((button) => button.dataset.state === 'ausente')).toBe(true);
  expect(stored().teeth['11'].findings[0].code).toBe('DEX');
  fireEvent.click(screen.getByRole('button', { name: 'Borrar marca' }));
  fireEvent.click(screen.getByRole('button', { name: 'Pieza 11, Mesial' }));
  expect(vestibular).toHaveAttribute('data-state', 'caries');
  expect(toothFindings(stored().teeth['11'])).toHaveLength(1);
  fireEvent.click(vestibular);
  expect(toothFindings(stored().teeth['11'])).toHaveLength(0);
});

test.each([['11', 'DEX'], ['41', 'DAO'], ['51', 'DAO'], ['81', 'DEX']])(
  'la ausencia de %s cubre cinco superficies y quitarla restaura los hallazgos anteriores', (number, code) => {
    const original = addFinding(createRecord('a').examinations[0], mark({ tooth: number }));
    const absent = addFinding(original, mark({ tooth: number, state: 'ausente', code, points: [] }));
    const select = vi.fn();
    const { rerender } = render(<CompactTooth number={number} tooth={absent.teeth[number]} onSelect={select} />);
    const surfaces = screen.getAllByRole('button');
    expect(surfaces).toHaveLength(5);
    for (const button of surfaces) {
      expect(button).toHaveAttribute('data-state', 'ausente');
      expect(button).toHaveStyle('background-color: rgb(29, 78, 216)');
    }
    fireEvent.click(surfaces[2]);
    expect(select).toHaveBeenCalledWith('mesial');
    expect(toothFindings(absent.teeth[number])).toHaveLength(2);
    const restored = removeFinding(absent, absent.teeth[number].findings[0].id);
    expect(restored.teeth[number]).toEqual(original.teeth[number]);
    rerender(<CompactTooth number={number} tooth={restored.teeth[number]} />);
    expect(screen.getByRole('button', { name: `Pieza ${number}, Vestibular` })).toHaveAttribute('data-state', 'caries');
    expect(screen.getAllByRole('button').filter((button) => button.dataset.state === 'sin-registro')).toHaveLength(4);
  },
);

test('una evaluación cerrada permanece en solo lectura después de recargar', () => {
  let record = createRecord('a'), examId = record.examinations[0].id;
  record = updateExamination(record, examId, { professional: 'Prueba', cop: '12345' });
  localStorage.setItem('undac:odontograma:nts188:v1:a', JSON.stringify(closeExamination(record, examId)));
  render(<Odontograma patientId="a" />);
  expect(screen.getByRole('button', { name: 'Caries', exact: true })).toBeDisabled();
  expect(screen.getByLabelText('Especificaciones')).toBeDisabled();
  fireEvent.click(screen.getByText('Datos de la evaluación'));
  fireEvent.click(screen.getByRole('button', { name: 'Nueva evaluación' }));
  expect(screen.getByRole('button', { name: 'Caries', exact: true })).toBeEnabled();
  expect(JSON.parse(localStorage.getItem('undac:odontograma:nts188:v1:a')).examinations).toHaveLength(2);
});

test('informa errores de almacenamiento sin anunciar éxito ni aplicar cambios', () => {
  render(<Odontograma patientId="a" />);
  vi.spyOn(localStorage, 'setItem').mockImplementation(() => { throw new Error('Sin espacio'); });
  fireEvent.change(screen.getByLabelText('Observaciones'), { target: { value: 'Prueba' } });
  expect(screen.getByRole('alert')).toHaveTextContent('No se guardó');
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
  expect(screen.getByLabelText('Observaciones')).toHaveValue('');
});

test('detecta modificaciones de otra pestaña sin sobrescribirlas', () => {
  render(<Odontograma patientId="a" />);
  const external = JSON.stringify(createRecord('a'));
  localStorage.setItem('undac:odontograma:nts188:v1:a', external);
  fireEvent.change(screen.getByLabelText('Observaciones'), { target: { value: 'Prueba' } });
  expect(screen.getByRole('alert')).toHaveTextContent('otra pestaña');
  expect(localStorage.getItem('undac:odontograma:nts188:v1:a')).toBe(external);
});
