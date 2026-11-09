import { expect, test } from 'vitest';
import { agenteLegible, valoresLegibles } from './detalleAuditoria.mjs';

test('resume navegador y sistema sin exponer la cadena técnica', () => {
    expect(agenteLegible('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/157.0.0.0 Safari/537.36')).toBe('Chrome 157 · Windows');
    expect(agenteLegible('Mozilla Chrome/157.0 Edg/157.0')).toBe('Microsoft Edge 157 · sistema no identificado');
});
test('muestra nombres, estados y datos ausentes con etiquetas comprensibles', () => {
    expect(valoresLegibles({ asistente_responsable: 'Ana Rojas' })).toEqual([{ etiqueta: 'Asistente responsable', valor: 'Ana Rojas' }]);
    expect(valoresLegibles({ anamnesis: 'approved' })[0].valor).toBe('Validado');
    expect(valoresLegibles(null)[0].valor).toBe('No registrado');
    expect(valoresLegibles({ contrasena: 'secreto' })[0].valor).toBe('Dato protegido');
});
