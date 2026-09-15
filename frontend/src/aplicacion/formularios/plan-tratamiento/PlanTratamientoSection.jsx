import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { CollapsibleSection, Field, SectionCard, SelectField, TextAreaField } from '../compartidos/ControlesClinicos.jsx';
import useSection from '../compartidos/useSection.js';

const PHASES = ['Preventiva','Restauradora','Periodontal','Endodóntica','Quirúrgica','Rehabilitadora','Mantenimiento','Otra'];

export default function PlanTratamientoSection({ values, onChange }) {
  const { get, set } = useSection(values, onChange);
  const procedimientos = get('procedimientosPlan', []);
  const update = (index, key, value) => set('procedimientosPlan')(procedimientos.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item));
  const add = () => set('procedimientosPlan')([...procedimientos, { fase: 'Preventiva', pieza: '', procedimiento: '', prioridad: 'Media', estado: 'Pendiente', observaciones: '' }]);
  const remove = (index) => set('procedimientosPlan')(procedimientos.filter((_, itemIndex) => itemIndex !== index));

  const grouped = PHASES.map((phase) => ({ phase, items: procedimientos.map((item, index) => ({ ...item, index })).filter((item) => item.fase === phase) })).filter((group) => group.items.length);

  return <div className="undac-section-stack clinical-treatment-flow">
    <SectionCard title="Plan de tratamiento por fases" subtitle="Organice procedimientos en unidades que luego puedan seguirse durante la atención." actions={<button type="button" className="undac-btn undac-btn--primary undac-btn--sm" onClick={add}><Plus size={16} />Añadir procedimiento</button>}>
      {procedimientos.length === 0 ? <div className="clinical-empty-inline"><strong>No hay procedimientos planificados.</strong><span>Agregue un procedimiento y asígnelo a una fase clínica.</span></div> : null}
      <div className="clinical-treatment-phases">
        {grouped.map((group) => <section className="clinical-treatment-phase" key={group.phase}>
          <header><strong>{group.phase}</strong><span>{group.items.length} procedimiento{group.items.length === 1 ? '' : 's'}</span></header>
          <div>
            {group.items.map((item) => <article className="clinical-treatment-item" key={`plan-${item.index}`}>
              <SelectField label="Fase" value={item.fase} onChange={(value) => update(item.index, 'fase', value)} options={PHASES} />
              <Field label="Pieza / región" value={item.pieza} onChange={(value) => update(item.index, 'pieza', value)} placeholder="Ej. 21" />
              <Field label="Procedimiento" value={item.procedimiento} onChange={(value) => update(item.index, 'procedimiento', value)} placeholder="Ej. Restauración con resina" />
              <SelectField label="Prioridad" value={item.prioridad} onChange={(value) => update(item.index, 'prioridad', value)} options={['Alta','Media','Baja']} />
              <SelectField label="Estado" value={item.estado} onChange={(value) => update(item.index, 'estado', value)} options={['Pendiente','Programado','En curso','Completado','Suspendido']} />
              <Field label="Observaciones" value={item.observaciones} onChange={(value) => update(item.index, 'observaciones', value)} />
              <button type="button" className="clinical-icon-action is-danger" onClick={() => remove(item.index)} aria-label={`Eliminar procedimiento ${item.index + 1}`}><Trash2 size={17} /></button>
            </article>)}
          </div>
        </section>)}
      </div>
    </SectionCard>

    <CollapsibleSection title="Plan de tratamiento integral" subtitle="Campo institucional de planificación clínica abierta" summary={get('planIntegral') ? 'Resumen registrado' : 'Sin resumen'} status={get('planIntegral') ? 'progress' : 'pending'}>
      <TextAreaField label="Plan de tratamiento integral" value={get('planIntegral')} onChange={set('planIntegral')} rows={8} placeholder="Describa las fases, objetivos y consideraciones generales del plan..." />
    </CollapsibleSection>
  </div>;
}
