import React from 'react';
import { CollapsibleSection, Field, SelectField, ChoiceGroup } from '../compartidos/ControlesClinicos.jsx';
import { yesNo } from '../compartidos/opcionesClinicas.js';
import useSection from '../compartidos/useSection.js';
import Subheading from '../compartidos/Subheading.jsx';

export default function ExamenClinicoSection({ values, onChange }) {
  const { get, set } = useSection(values, onChange);
  return <div className="undac-section-stack clinical-exam-flow">
    <CollapsibleSection title="Examen clínico general" subtitle="Evaluación general y signos vitales" defaultOpen status={Object.keys(values ?? {}).length ? 'progress' : 'pending'}>
      <div className="undac-form-grid">
        <ChoiceGroup label="Tipo psicológico de paciente" value={get('tipoPsicologico')} onChange={set('tipoPsicologico')} options={['Receptivo','Escéptico','Pasivo','No colaborador']} className="undac-col-2" />
        <ChoiceGroup label="Marcha o caminata" value={get('marcha')} onChange={set('marcha')} options={['Normal','Con dificultad']} />
        <ChoiceGroup label="¿Presenta fatiga o cansancio al sentarse o caminar?" value={get('fatiga')} onChange={set('fatiga')} options={yesNo} />
        <SelectField label="Raza" value={get('raza')} onChange={set('raza')} options={['Mestiza','Blanca','Negra','Caucásico','Otros']} />{get('raza') === 'Otros' ? <Field label="Raza — otros" value={get('razaOtros')} onChange={set('razaOtros')} /> : null}
        <Field label="Peso" value={get('peso')} onChange={set('peso')} /><Field label="Talla" value={get('talla')} onChange={set('talla')} />
      </div>
      <Subheading>Signos vitales</Subheading>
      <div className="undac-vitals-grid clinical-vitals-grid">
        <Field label="T° (°C)" value={get('temperatura')} onChange={set('temperatura')} />
        <Field label="P.A. (mmHg)" value={get('presionArterial')} onChange={set('presionArterial')} />
        <Field label="F.R. (rpm)" value={get('frecuenciaRespiratoria')} onChange={set('frecuenciaRespiratoria')} />
        <Field label="Pulso (ppm)" value={get('pulso')} onChange={set('pulso')} />
        <Field label="F.C. (lpm)" value={get('frecuenciaCardiaca')} onChange={set('frecuenciaCardiaca')} />
      </div>
    </CollapsibleSection>

    <CollapsibleSection title="Cabeza y órganos de los sentidos" subtitle="Describa detalles solo cuando exista una alteración" status={get('formaCraneo') || get('ojosEstado') || get('oidosEstado') ? 'progress' : 'pending'}>
      <div className="undac-form-grid">
        <ChoiceGroup label="Forma del cráneo" value={get('formaCraneo')} onChange={set('formaCraneo')} options={['Dolicocéfalo','Mesocéfalo','Braquicéfalo']} className="undac-col-2" />
        <ChoiceGroup label="Cabellos — implantación" value={get('cabelloImplantacion')} onChange={set('cabelloImplantacion')} options={['Buena','Regular','Patológica']} /><Field label="Cabellos — color" value={get('cabelloColor')} onChange={set('cabelloColor')} />
        <ChoiceGroup label="Ojos" value={get('ojosEstado')} onChange={set('ojosEstado')} options={['Normales','Presenta patología']} />{get('ojosEstado') === 'Presenta patología' ? <Field label="Ojos — patología" value={get('ojosPatologia')} onChange={set('ojosPatologia')} required /> : null}
        <Field label="Ojos — color" value={get('ojosColor')} onChange={set('ojosColor')} /><Field label="Ojos — forma" value={get('ojosForma')} onChange={set('ojosForma')} />
        <ChoiceGroup label="Oídos" value={get('oidosEstado')} onChange={set('oidosEstado')} options={['Normales','Presenta patología']} />{get('oidosEstado') === 'Presenta patología' ? <Field label="Oídos — patología" value={get('oidosPatologia')} onChange={set('oidosPatologia')} required /> : null}
        <ChoiceGroup label="Audición" value={get('audicion')} onChange={set('audicion')} options={['Escucha bien','Escucha con dificultad']} className="undac-col-2" />
        <ChoiceGroup label="Nariz / olfacción" value={get('narizEstado')} onChange={set('narizEstado')} options={['Normal','Buen olfato','Dificultad en olfacción']} /><Field label="Nariz — forma" value={get('narizForma')} onChange={set('narizForma')} />
        <ChoiceGroup label="Labios" value={get('labiosEstado')} onChange={set('labiosEstado')} options={['Normal','Presenta patología']} />{get('labiosEstado') === 'Presenta patología' ? <Field label="Patología de labios (queilitis angular, herpes simple, etc.)" value={get('labiosPatologia')} onChange={set('labiosPatologia')} required /> : null}
        <Field label="Labios — forma" value={get('labiosForma')} onChange={set('labiosForma')} /><ChoiceGroup label="Fascies" value={get('fasciesEstado')} onChange={set('fasciesEstado')} options={['Normal','Patológico']} />
        {get('fasciesEstado') === 'Patológico' ? <Field label="Color de fascies" value={get('fasciesColor')} onChange={set('fasciesColor')} /> : null}
      </div>
    </CollapsibleSection>

    <CollapsibleSection title="Cuello, extremidades y tórax" subtitle="Condición general y descripción dirigida de alteraciones" status={get('cuelloForma') || get('cadenaLinfatica') || get('atm') ? 'progress' : 'pending'}>
      <div className="undac-form-grid">
        <ChoiceGroup label="Cuello — forma" value={get('cuelloForma')} onChange={set('cuelloForma')} options={['Normal','Patológico']} />{get('cuelloForma') === 'Patológico' ? <Field label="¿Qué patología?" value={get('cuelloPatologia')} onChange={set('cuelloPatologia')} required /> : null}
        <ChoiceGroup label="Exploración de cadena linfática" value={get('cadenaLinfatica')} onChange={set('cadenaLinfatica')} options={['Normal','Patológico']} />{get('cadenaLinfatica') === 'Patológico' ? <Field label="¿Qué patología?" value={get('cadenaLinfaticaPatologia')} onChange={set('cadenaLinfaticaPatologia')} required /> : null}
        <ChoiceGroup label="ATM" value={get('atm')} onChange={set('atm')} options={['Normal','Chasquidos','Otros']} />{get('atm') === 'Otros' ? <Field label="ATM — otros" value={get('atmOtros')} onChange={set('atmOtros')} /> : null}
        <ChoiceGroup label="Glándulas tiroides (palpación)" value={get('tiroides')} onChange={set('tiroides')} options={['Normal','Patológico']} />{get('tiroides') === 'Patológico' ? <Field label="¿Qué patología?" value={get('tiroidesPatologia')} onChange={set('tiroidesPatologia')} required /> : null}
        <ChoiceGroup label="Miembros superiores" value={get('miembrosSuperiores')} onChange={set('miembrosSuperiores')} options={['Normales','Presenta alteración']} />{get('miembrosSuperiores') === 'Presenta alteración' ? <Field label="Tipo de alteración" value={get('miembrosSuperioresDetalle')} onChange={set('miembrosSuperioresDetalle')} /> : null}
        <ChoiceGroup label="Miembros inferiores" value={get('miembrosInferiores')} onChange={set('miembrosInferiores')} options={['Normales','Presenta alteración']} />{get('miembrosInferiores') === 'Presenta alteración' ? <Field label="Tipo de alteración" value={get('miembrosInferioresDetalle')} onChange={set('miembrosInferioresDetalle')} /> : null}
        <ChoiceGroup label="Tórax" value={get('torax')} onChange={set('torax')} options={['Normal','Presenta alteración o patología']} />{get('torax') === 'Presenta alteración o patología' ? <Field label="¿Qué patología?" value={get('toraxPatologia')} onChange={set('toraxPatologia')} required /> : null}
      </div>
    </CollapsibleSection>
  </div>;
}
