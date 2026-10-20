function limpio(valor) {
  return String(valor ?? '').trim();
}

/**
 * Alergia mostrada en el resumen: el bloque terapéutico y las preguntas 13 y 14 del cuestionario.
 */
export function resumenAlergiaMedicamentos(antecedentes = {}, salud = {}) {
  const hallazgos = [];
  const detallePropio = limpio(antecedentes.alergiaMedicamentoDetalle);
  if (antecedentes.alergiaMedicamento === 'Sí' && detallePropio) hallazgos.push(detallePropio);
  if (salud.q13Answer === 'Sí') {
    const detalle = limpio(salud.q13Detail);
    hallazgos.push(detalle ? `Penicilina: ${detalle}` : 'Penicilina');
  }
  if (salud.q14Answer === 'Sí') {
    hallazgos.push(limpio(salud.q14Detail) || 'Otro medicamento');
  }
  const unicos = [...new Set(hallazgos)];
  if (unicos.length) return unicos.join(' · ');
  if (antecedentes.alergiaMedicamento === 'Sí') return 'Sí · detalle pendiente';
  const respondioNo = antecedentes.alergiaMedicamento === 'No'
    || (salud.q13Answer === 'No' && salud.q14Answer === 'No');
  return respondioNo ? 'No refiere' : 'Pendiente de preguntar';
}

export function resumenMedicacionActual(antecedentes = {}) {
  if (antecedentes.medicacionActual === 'Sí') return limpio(antecedentes.medicacionActualNombre) || 'Sí · nombre pendiente';
  if (antecedentes.medicacionActual === 'No') return 'No refiere';
  return 'Pendiente de preguntar';
}
