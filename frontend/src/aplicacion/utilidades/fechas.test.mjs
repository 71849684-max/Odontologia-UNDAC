import { describe, expect, test } from 'vitest';
import { aIsoFecha, aIsoFechaHora, enmascararFecha, fechaCompleta, formatearFecha, formatearFechaHora } from './fechas.mjs';

describe('fechas Día/Mes/Año', () => {
  test('formatea ISO a dd/mm/aaaa', () => {
    expect(formatearFecha('2026-10-16')).toBe('16/10/2026');
    expect(formatearFecha('2026-10-16T23:30')).toBe('16/10/2026');
    expect(formatearFechaHora('2026-10-16 12:00:00')).toBe('16/10/2026 12:00');
    expect(formatearFechaHora('2026-10-16T08:05')).toBe('16/10/2026 08:05');
  });

  test('parsea dd/mm/aaaa a ISO', () => {
    expect(aIsoFecha('16/10/2026')).toBe('2026-10-16');
    expect(aIsoFecha('1/9/2026')).toBe('2026-09-01');
    expect(aIsoFechaHora('16/10/2026 23:30')).toBe('2026-10-16T23:30');
    expect(aIsoFecha('31/02/2026')).toBeNull();
  });

  test('acepta ISO al convertir', () => {
    expect(aIsoFecha('2026-10-16')).toBe('2026-10-16');
    expect(aIsoFechaHora('2026-10-16T23:30')).toBe('2026-10-16T23:30');
  });

  test('enmascara lo escrito como día/mes/año', () => {
    expect(enmascararFecha('0')).toBe('0');
    expect(enmascararFecha('01')).toBe('01/');
    expect(enmascararFecha('01', { anterior: '01/' })).toBe('01');
    expect(enmascararFecha('0105')).toBe('01/05/');
    expect(enmascararFecha('01052026')).toBe('01/05/2026');
    expect(enmascararFecha('1/5/2026')).toBe('1/5/2026');
    expect(enmascararFecha('2026-05-01')).toBe('01/05/2026');
    expect(enmascararFecha('160520260830', { conHora: true })).toBe('16/05/2026 08:30');
    expect(fechaCompleta('01/05/2026')).toBe(true);
    expect(fechaCompleta('01/05')).toBe(false);
    expect(aIsoFecha('01/05/2026')).toBe('2026-05-01');
  });
});
