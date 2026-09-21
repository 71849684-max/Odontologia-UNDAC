import React, { useEffect, useState } from 'react';
import { ChevronDown, GraduationCap } from 'lucide-react';
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
  const { activeMoment, sectionStatuses, navigateToMoment, history, momentProgress } = useHistoriaClinica();
  const [mobileOpen, setMobileOpen] = useState(false);
  const activeIndex = Math.max(0, clinicalMoments.findIndex((item) => item.id === activeMoment?.id));
  const activeProgress = momentProgress(activeMoment);

  useEffect(() => {
    setMobileOpen(false);
  }, [activeMoment.id]);

  function selectMoment(momentId) {
    navigateToMoment(momentId);
    setMobileOpen(false);
  }

  return (
    <>
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

      <section className="clinical-moment-mobile" aria-label="Momento clínico actual">
        <button
          type="button"
          className="clinical-moment-mobile__trigger"
          aria-expanded={mobileOpen}
          aria-controls="clinical-mobile-moments"
          aria-label={`${activeIndex + 1} de ${clinicalMoments.length}, ${activeMoment.label}`}
          onClick={() => setMobileOpen((value) => !value)}
        >
          <span className="clinical-moment-mobile__count">{activeIndex + 1} de {clinicalMoments.length}</span>
          <span className="clinical-moment-mobile__copy">
            <strong>{activeMoment.label}</strong>
            <small>{activeProgress.complete} de {activeProgress.total} secciones completas</small>
          </span>
          <ChevronDown className={mobileOpen ? 'is-open' : ''} size={19} aria-hidden="true" />
        </button>
        {mobileOpen ? (
          <div id="clinical-mobile-moments" className="clinical-moment-mobile__menu" role="region" aria-label="Cambiar momento clínico">
            {clinicalMoments.map((moment) => {
              const active = moment.id === activeMoment.id;
              const state = momentState(moment, sectionStatuses);
              const progress = momentProgress(moment);
              return (
                <button
                  type="button"
                  key={moment.id}
                  className={`is-${state}${active ? ' is-active' : ''}`}
                  aria-current={active ? 'step' : undefined}
                  onClick={() => selectMoment(moment.id)}
                >
                  <span className="clinical-moment-mobile__number">{state === 'complete' ? '✓' : moment.number}</span>
                  <span><strong>{moment.label}</strong><small>{progress.complete}/{progress.total} completas</small></span>
                </button>
              );
            })}
          </div>
        ) : null}
      </section>
    </>
  );
}
