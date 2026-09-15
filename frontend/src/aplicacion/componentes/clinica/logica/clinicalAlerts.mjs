function clean(value) {
  return String(value ?? '').trim();
}

function addAlert(map, alert) {
  if (!map.has(alert.id)) map.set(alert.id, alert);
}

export function buildClinicalAlerts(formData = {}) {
  const health = formData['cuestionario-salud'] ?? {};
  const antecedentes = formData.antecedentes ?? {};
  const alerts = new Map();

  if (health.q13Answer === 'Sí' || antecedentes.alergiaMedicamento === 'Sí') {
    const detail = clean(antecedentes.alergiaMedicamentoDetalle) || clean(health.q13Detail) || 'Penicilina';
    addAlert(alerts, { id: 'allergy-penicillin', level: 'critical', label: `Alergia: ${detail}`, source: 'Antecedentes' });
  }
  if (health.q14Answer === 'Sí') {
    const detail = clean(health.q14Detail) || 'Otro medicamento';
    addAlert(alerts, { id: `allergy-other-${detail.toLowerCase()}`, level: 'critical', label: `Alergia medicamentosa: ${detail}`, source: 'Cuestionario de salud' });
  }
  if (health.q9Answer === 'Sí') {
    addAlert(alerts, { id: 'hypertension', level: 'warning', label: `Hipertensión${health.q9Detail ? `: ${clean(health.q9Detail)}` : ''}`, source: 'Cuestionario de salud' });
  }
  if (health.q20Answer === 'Sí') {
    addAlert(alerts, { id: 'diabetes', level: 'warning', label: `Diabetes${health.q20Detail ? `: ${clean(health.q20Detail)}` : ''}`, source: 'Cuestionario de salud' });
  }
  if (health.q18Answer === 'Sí') {
    addAlert(alerts, { id: 'hematologic', level: 'warning', label: `Antecedente hematológico${health.q18Detail ? `: ${clean(health.q18Detail)}` : ''}`, source: 'Cuestionario de salud' });
  }
  if (health.q24Answer === 'Sí' || health.q4Answer === 'Sí' || health.q23Answer === 'Sí') {
    const detail = clean(health.q24Detail) || clean(health.q4Detail) || clean(health.q23Detail) || 'Dificultad respiratoria';
    addAlert(alerts, { id: 'respiratory', level: 'warning', label: `Respiratorio: ${detail}`, source: 'Cuestionario de salud' });
  }
  if (antecedentes.medicacionActual === 'Sí' && clean(antecedentes.medicacionActualNombre)) {
    addAlert(alerts, { id: 'current-medication', level: 'info', label: `Medicación actual: ${clean(antecedentes.medicacionActualNombre)}`, source: 'Antecedentes terapéuticos' });
  }

  return [...alerts.values()];
}
