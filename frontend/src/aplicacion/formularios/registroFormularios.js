import DatosPacienteSection from './datos-paciente/DatosPacienteSection.jsx';
import AnamnesisSection from './anamnesis/AnamnesisSection.jsx';
import CuestionarioSaludSection from './cuestionario-salud/CuestionarioSaludSection.jsx';
import AntecedentesSection from './antecedentes/AntecedentesSection.jsx';
import ExamenClinicoSection from './examen-clinico/ExamenClinicoSection.jsx';
import ExamenExtraoralSection from './examen-extraoral/ExamenExtraoralSection.jsx';
import ExamenIntraoralSection from './examen-intraoral/ExamenIntraoralSection.jsx';
import OclusionSection from './oclusion/OclusionSection.jsx';
import ExamenesAuxiliaresSection from './examenes-auxiliares/ExamenesAuxiliaresSection.jsx';
import DiagnosticoSection from './diagnostico/DiagnosticoSection.jsx';
import ModelosSection from './modelos/ModelosSection.jsx';
import PlanTratamientoSection from './plan-tratamiento/PlanTratamientoSection.jsx';
import ConsentimientoSection from './consentimiento/ConsentimientoSection.jsx';
import CirugiaSection from './cirugia/CirugiaSection.jsx';
import ReporteOperatorioSection from './reporte-operatorio/ReporteOperatorioSection.jsx';
import SeguimientoSection from './seguimiento/SeguimientoSection.jsx';
import Odontograma from './odontograma/Odontograma.jsx';

// Relaciona los identificadores de clinicalSections con sus vistas.
export const componentesSeccion = {
  'datos-paciente': DatosPacienteSection,
  'anamnesis': AnamnesisSection,
  'cuestionario-salud': CuestionarioSaludSection,
  'antecedentes': AntecedentesSection,
  'examen-clinico': ExamenClinicoSection,
  'examen-extraoral': ExamenExtraoralSection,
  'examen-intraoral': ExamenIntraoralSection,
  odontograma: Odontograma,
  'oclusion': OclusionSection,
  'examenes-auxiliares': ExamenesAuxiliaresSection,
  'diagnostico': DiagnosticoSection,
  'modelos': ModelosSection,
  'plan-tratamiento': PlanTratamientoSection,
  'consentimiento': ConsentimientoSection,
  'cirugia': CirugiaSection,
  'reporte-operatorio': ReporteOperatorioSection,
  'seguimiento': SeguimientoSection,
};
