import { expect, test } from 'vitest';
import { formularioParaServidor } from './servicioClinico.js';

test('el autoguardado conserva el formulario sin reenviar una copia obsoleta del odontograma', () => {
    const datos = {
        anamnesis: { motivoConsulta: 'Control' },
        odontograma: { registro: { examinations: ['Evaluación cargada antes de editar'] } },
    };
    const enviado = formularioParaServidor(datos);
    expect(enviado).toEqual({ anamnesis: { motivoConsulta: 'Control' } });
    expect(datos.odontograma.registro.examinations).toHaveLength(1);
});

test('mantiene los textos institucionales del consentimiento al preparar el autoguardado', () => {
    const enviado = formularioParaServidor({ consentimiento: { firmaPaciente: 'archivo-privado' } });
    expect(enviado.consentimiento.firmaPaciente).toBe('archivo-privado');
    expect(Object.keys(enviado.consentimiento.textosClausulas)).toHaveLength(9);
});
