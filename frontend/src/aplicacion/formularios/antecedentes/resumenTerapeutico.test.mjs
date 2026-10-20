import { describe, expect, test } from 'vitest';
import { resumenAlergiaMedicamentos, resumenMedicacionActual } from './resumenTerapeutico.mjs';

describe('resumen de antecedentes terapéuticos', () => {
  test('usa la alergia respondida en el cuestionario de salud cuando el bloque terapéutico está vacío', () => {
    expect(resumenAlergiaMedicamentos({}, { q13Answer: 'No', q14Answer: 'No' })).toBe('No refiere');
    expect(resumenAlergiaMedicamentos({}, { q13Answer: 'Sí' })).toBe('Penicilina');
    expect(resumenAlergiaMedicamentos({}, { q13Answer: 'Sí', q13Detail: 'reacción cutánea', q14Answer: 'Sí', q14Detail: 'Ibuprofeno' })).toBe('Penicilina: reacción cutánea · Ibuprofeno');
  });

  test('conserva el detalle registrado en el bloque terapéutico', () => {
    expect(resumenAlergiaMedicamentos({}, {})).toBe('Pendiente de preguntar');
    expect(resumenAlergiaMedicamentos({ alergiaMedicamento: 'No' }, {})).toBe('No refiere');
    expect(resumenAlergiaMedicamentos({ alergiaMedicamento: 'Sí' }, {})).toBe('Sí · detalle pendiente');
    expect(resumenAlergiaMedicamentos({ alergiaMedicamento: 'Sí', alergiaMedicamentoDetalle: 'Detalle de prueba' }, { q13Answer: 'Sí' })).toBe('Detalle de prueba · Penicilina');
  });

  test('la medicación actual sale del bloque terapéutico', () => {
    expect(resumenMedicacionActual({})).toBe('Pendiente de preguntar');
    expect(resumenMedicacionActual({ medicacionActual: 'No' })).toBe('No refiere');
    expect(resumenMedicacionActual({ medicacionActual: 'Sí', medicacionActualNombre: 'Metformina' })).toBe('Metformina');
  });
});
