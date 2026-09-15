import React from 'react';
import { GraduationCap } from 'lucide-react';
import { clinicalMoments } from '../../../configuracion/historiaClinica.config.mjs';
import { useHistoriaClinica } from '../contexto/HistoriaClinicaContext.jsx';
import { SECTION_STATUS } from '../logica/clinicalStatus.mjs';

function momentState(moment, statuses) {
  const values = moment.sections.map((id) => statuses[id]);
  if (values.every((status) => [SECTION_STATUS.COMPLETE, SECTION_STATUS.REVIEW, SECTION_STATUS.APPROVED].includes(status))) return 'complete';
  if (values.some((status) => status !== SECTION_STATUS.NOT_STARTED)) return 'progress';
  return 'pending';
}

export default function ClinicalMomentSidebar() {
  const { activeMoment, sectionStatuses, navigateToMoment, history } = useHistoriaClinica();
  return (
    <aside className="clinical-moment-sidebar" aria-label="Momentos de Historia Clínica">
      <div className="clinical-moment-sidebar__heading"><span>Historia clínica</span><strong>{history.codigo}</strong></div>
      <nav aria-label="Secciones de Historia Clínica">
        {clinicalMoments.map((moment) => {
          const active = moment.id === activeMoment.id;
          const state = momentState(moment, sectionStatuses);
          return <button type="button" key={moment.id} className={`clinical-moment-nav is-${state}${active ? ' is-active' : ''}`} onClick={() => navigateToMoment(moment.id)} aria-current={active ? 'step' : undefined}>
            <span className="clinical-moment-nav__number">{state === 'complete' ? '✓' : moment.number}</span>
            <span><strong>{moment.label}</strong><small>{moment.description}</small></span>
          </button>;
        })}
      </nav>
      <div className="clinical-moment-sidebar__footer"><GraduationCap size={22} aria-hidden="true" /><span><strong>Formación con impacto</strong><small>Clínica Odontológica UNDAC</small></span></div>
    </aside>
  );
}
