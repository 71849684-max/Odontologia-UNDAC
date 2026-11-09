export const fasesTratamiento = ['Preventiva', 'Restauradora', 'Periodontal', 'Endodóntica', 'Quirúrgica', 'Rehabilitadora', 'Mantenimiento', 'Otra'];

// Solo propone recuperar una indicación; no genera una orden clínica automáticamente.
export function indicacionesHistoricas(registro) {
  const piezas = new Map();
  for (const examen of registro?.examinations ?? []) {
    for (const [numero, diente] of Object.entries(examen.teeth ?? {})) {
      for (const marca of diente.findings ?? []) if (marca.state === 'extraccion-programada') piezas.set(numero, { pieza: numero, fecha: examen.date });
    }
  }
  return [...piezas.values()];
}
