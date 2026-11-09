import { expect, test } from 'vitest';
import { problemaDocumento, problemaTelefono, problemaCorreo, problemaFechaNacimiento } from './validacionesRegistro.mjs';

test('verifica DNI, carné y pasaporte sin exigir documentos solo numéricos', () => {
    expect(problemaDocumento('12345678')).toBe('');
    expect(problemaDocumento('123')).toMatch(/8 dígitos/);
    expect(problemaDocumento('AB123456', 'PAS')).toBe('');
    expect(problemaDocumento('CE-12345', 'CE')).toBe('');
    expect(problemaDocumento('')).toMatch(/Ingrese/);
});
test('teléfono y correo opcionales aceptan vacío y rechazan formatos inválidos', () => {
    expect(problemaTelefono('')).toBe('');
    expect(problemaCorreo('')).toBe('');
    expect(problemaTelefono('+51 987-654-321')).toBe('');
    expect(problemaTelefono('hola')).not.toBe('');
    expect(problemaCorreo('ana@undac.edu.pe')).toBe('');
    expect(problemaCorreo('correo inválido')).not.toBe('');
});

test('la fecha de nacimiento acepta vacío y rechaza días imposibles o futuros', () => {
    expect(problemaFechaNacimiento('')).toBe('');
    expect(problemaFechaNacimiento('2000-02-29')).toBe('');
    expect(problemaFechaNacimiento('2001-02-29')).not.toBe('');
    expect(problemaFechaNacimiento('2999-01-01')).not.toBe('');
});
