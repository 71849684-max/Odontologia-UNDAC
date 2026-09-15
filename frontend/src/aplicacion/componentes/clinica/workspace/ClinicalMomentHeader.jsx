import React from 'react';
import { CheckCircle2, CircleAlert } from 'lucide-react';
import { useHistoriaClinica } from '../contexto/HistoriaClinicaContext.jsx';

export default function ClinicalMomentHeader() {
  const { activeMoment, momentProgress } = useHistoriaClinica();
  const progress = momentProgress(activeMoment);
  const pendingSections = progress.total - progress.complete;
  const pendingCopy = pendingSections === 1 ? '1 sección por revisar' : `${pendingSections} secciones por revisar`;
  const momentReady = pendingSections === 0;
  return (
    <section className="clinical-moment-header">
      <div className="clinical-moment-header__copy"><span className="clinical-moment-header__number" aria-hidden="true">{activeMoment.number}.</span><div><span className="clinical-kicker">Momento clínico de 6</span><h2>{activeMoment.label}</h2><p>{activeMoment.description}</p></div></div>
      <div className="clinical-moment-header__progress" role="status" aria-label={`Estado de ${activeMoment.label}`}>
        <span><b>Secciones revisadas</b><strong>{progress.complete} de {progress.total}</strong></span>
        <div
          role="progressbar"
          aria-label={`Progreso de ${activeMoment.label}`}
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={progress.percent}
        ><i style={{ width: `${progress.percent}%` }} /></div>
        <small>{pendingCopy} · {progress.started} iniciadas</small>
      </div>
      <aside className={`clinical-moment-header__readiness${momentReady ? ' is-ready' : ''}`} aria-label="Resumen de revisión del momento">
        {momentReady ? <CheckCircle2 size={22} aria-hidden="true" /> : <CircleAlert size={22} aria-hidden="true" />}
        <div><strong>{momentReady ? 'Momento preparado' : 'Información por revisar'}</strong><small>{momentReady ? 'Todas sus secciones están completas.' : pendingCopy}</small></div>
      </aside>
    </section>
  );
}
