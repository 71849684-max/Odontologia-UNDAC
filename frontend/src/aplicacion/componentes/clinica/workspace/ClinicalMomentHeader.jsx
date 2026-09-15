import React from 'react';
import { Activity, ClipboardList, FileHeart, Route, Stethoscope, UserRound } from 'lucide-react';
import { useHistoriaClinica } from '../contexto/HistoriaClinicaContext.jsx';

const ICONS = { ingreso: UserRound, entrevista: ClipboardList, evaluacion: Stethoscope, sintesis: FileHeart, plan: Route, seguimiento: Activity };

export default function ClinicalMomentHeader() {
  const { activeMoment, momentProgress } = useHistoriaClinica();
  const progress = momentProgress(activeMoment);
  const Icon = ICONS[activeMoment.id] ?? ClipboardList;
  return (
    <section className="clinical-moment-header">
      <span className="clinical-moment-header__icon"><Icon size={25} aria-hidden="true" /></span>
      <div className="clinical-moment-header__copy"><span className="clinical-kicker">Momento {activeMoment.number} de 6</span><h2>{activeMoment.label}</h2><p>{activeMoment.description}</p></div>
      <div className="clinical-moment-header__progress"><span><b>Progreso de este momento</b><strong>{progress.percent}%</strong></span><div><i style={{ width: `${progress.percent}%` }} /></div><small>{progress.complete} de {progress.total} secciones completadas · {progress.started} iniciadas</small></div>
    </section>
  );
}
