import { describe, expect, test } from 'vitest';
import { calcularImc, cambiosCoherentes, preguntaVisible, validarSeccion } from './reglasClinicas.mjs';
import { buildClinicalAlerts } from './clinicalAlerts.mjs';

describe('calcularImc', () => {
  test('acepta la talla en metros o centímetros', () => {
    expect(calcularImc('70', '1.75')).toEqual({ valor: 22.9, categoria: 'Normal' });
    expect(calcularImc('70', '175')).toEqual({ valor: 22.9, categoria: 'Normal' });
    expect(calcularImc('90,5', '1.70').categoria).toBe('Obesidad');
  });

  test('devuelve null con valores ausentes o absurdos', () => {
    expect(calcularImc('', '1.70')).toBeNull();
    expect(calcularImc('abc', '1.70')).toBeNull();
    expect(calcularImc('70', '0.1')).toBeNull();
  });
});

describe('cambiosCoherentes', () => {
  test('Q21 se limpia cuando Q20 deja de ser positiva', () => {
    const valores = { q20Answer: 'Sí', q20Detail: 'Tipo 2', q21Answer: 'No', q21Detail: 'x' };
    expect(cambiosCoherentes('cuestionario-salud', valores, 'q20Answer', 'No')).toEqual({ q21Answer: '', q21Detail: '' });
    expect(preguntaVisible(21, { q20Answer: 'No' })).toBe(false);
    expect(preguntaVisible(21, { q20Answer: 'Sí' })).toBe(true);
  });

  test('"Ningún hijo" vacía los conteos y un conteo positivo lo desmarca', () => {
    expect(cambiosCoherentes('antecedentes', { hijosNumero: '2', hijosVivos: '2' }, 'ningunHijo', 'Sí')).toEqual({ hijosNumero: '', hijosVivos: '' });
    expect(cambiosCoherentes('antecedentes', { ningunHijo: 'Sí' }, 'hijosNumero', '1')).toEqual({ ningunHijo: 'No' });
    expect(cambiosCoherentes('antecedentes', { ningunHijo: 'Sí' }, 'hijosNumero', '0')).toEqual({});
  });
});

describe('validarSeccion', () => {
  test('exige los datos de identificación del paciente', () => {
    const errores = validarSeccion('datos-paciente', { dni: '123', nombres: 'Ana' });
    const campos = errores.map((e) => e.campo);
    expect(campos).toEqual(expect.arrayContaining(['apellidos', 'sexo', 'fechaNacimiento', 'dni']));
    expect(validarSeccion('datos-paciente', { dni: '12345678', nombres: 'Ana', apellidos: 'Ruiz', sexo: 'F', fechaNacimiento: '1990-01-01' })).toEqual([]);
  });

  test('el cuestionario omite Q21 sin diabetes y exige detalle en respuestas positivas', () => {
    const valores = Object.fromEntries(Array.from({ length: 24 }, (_, i) => [`q${i + 1}Answer`, 'No']));
    delete valores.q21Answer;
    expect(validarSeccion('cuestionario-salud', valores)).toEqual([]);
    valores.q9Answer = 'Sí';
    expect(validarSeccion('cuestionario-salud', valores)).toEqual([{ campo: 'q9Detail', mensaje: expect.stringContaining('pregunta 9') }]);
  });

  test('un diagnóstico estructurado presuntivo o definitivo completa la sección', () => {
    const base = { pronosticoEstructurado: 'Favorable' };
    expect(validarSeccion('diagnostico', base).map((e) => e.mensaje)).toEqual(['Registre al menos un diagnóstico presuntivo o definitivo.']);
    expect(validarSeccion('diagnostico', { ...base, diagnosticos: [{ tipo: 'Presuntivo', codigo: 'K02.1' }] })).toEqual([]);
    expect(validarSeccion('diagnostico', { ...base, diagnosticos: [{ tipo: 'Definitivo', codigo: 'K04.0' }] })).toEqual([]);
    expect(validarSeccion('diagnostico', { ...base, diagnosticos: [{ tipo: 'Clínico-radiográfico', codigo: 'K02.1' }] }).map((e) => e.campo)).toEqual(['dxPresuntivo']);
    expect(validarSeccion('diagnostico', { ...base, dxPresuntivo: 'Caries' })).toEqual([]);
  });

  test('valida formato de signos vitales y coherencia de hijos y horas', () => {
    expect(validarSeccion('examen-clinico', { presionArterial: '120-80' })[0].campo).toBe('presionArterial');
    expect(validarSeccion('examen-clinico', { presionArterial: '120/80', temperatura: '36.5', peso: '70', talla: '170' })).toEqual([]);
    expect(validarSeccion('antecedentes', { hijosNumero: '1', hijosVivos: '2' })[0].campo).toBe('hijosNumero');
    expect(validarSeccion('reporte-operatorio', { fecha: '2026-10-20', horaInicio: '10:00', horaTermino: '09:00' })[0].campo).toBe('horaTermino');
  });
});

describe('buildClinicalAlerts', () => {
  test('no inventa el medicamento cuando falta el detalle', () => {
    const alertas = buildClinicalAlerts({ antecedentes: { alergiaMedicamento: 'Sí' } });
    expect(alertas.map((a) => a.label)).toEqual(['Alergia medicamentosa: detalle pendiente']);
    expect(buildClinicalAlerts({ 'cuestionario-salud': { q13Answer: 'Sí' } })[0].label).toBe('Alergia a penicilina');
  });
});
