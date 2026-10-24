import DatosPacienteImpresion from './plantillas/DatosPacienteImpresion.jsx';
import AnamnesisImpresion from './plantillas/AnamnesisImpresion.jsx';
import CuestionarioSaludImpresion from './plantillas/CuestionarioSaludImpresion.jsx';
import AntecedentesImpresion from './plantillas/AntecedentesImpresion.jsx';
import ExamenClinicoImpresion from './plantillas/ExamenClinicoImpresion.jsx';
import ExamenExtraoralImpresion from './plantillas/ExamenExtraoralImpresion.jsx';
import ExamenIntraoralImpresion from './plantillas/ExamenIntraoralImpresion.jsx';
import OdontogramaImpresion from './plantillas/OdontogramaImpresion.jsx';
import OclusionImpresion from './plantillas/OclusionImpresion.jsx';
import ExamenesAuxiliaresImpresion from './plantillas/ExamenesAuxiliaresImpresion.jsx';
import DiagnosticoImpresion from './plantillas/DiagnosticoImpresion.jsx';
import ModelosImpresion from './plantillas/ModelosImpresion.jsx';
import PlanTratamientoImpresion from './plantillas/PlanTratamientoImpresion.jsx';
import ConsentimientoImpresion from './plantillas/ConsentimientoImpresion.jsx';
import CirugiaImpresion from './plantillas/CirugiaImpresion.jsx';
import ReporteOperatorioImpresion from './plantillas/ReporteOperatorioImpresion.jsx';
import SeguimientoImpresion from './plantillas/SeguimientoImpresion.jsx';

export const plantillasImpresion = {
  'datos-paciente': DatosPacienteImpresion,
  anamnesis: AnamnesisImpresion,
  'cuestionario-salud': CuestionarioSaludImpresion,
  antecedentes: AntecedentesImpresion,
  'examen-clinico': ExamenClinicoImpresion,
  'examen-extraoral': ExamenExtraoralImpresion,
  'examen-intraoral': ExamenIntraoralImpresion,
  odontograma: OdontogramaImpresion,
  oclusion: OclusionImpresion,
  'examenes-auxiliares': ExamenesAuxiliaresImpresion,
  diagnostico: DiagnosticoImpresion,
  modelos: ModelosImpresion,
  'plan-tratamiento': PlanTratamientoImpresion,
  consentimiento: ConsentimientoImpresion,
  cirugia: CirugiaImpresion,
  'reporte-operatorio': ReporteOperatorioImpresion,
  seguimiento: SeguimientoImpresion,
};

export function plantillaDeSeccion(seccionId) {
  return plantillasImpresion[seccionId] ?? null;
}
