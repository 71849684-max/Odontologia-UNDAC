import { clinicalSections } from './historiaClinica.config.mjs';

// Compatibilidad: la navegación clínica usa `clinicalMoments` como fuente principal.
// Esta exportación se deriva de `clinicalSections` para evitar mantener una segunda lista divergente.
export const SECCIONES_HC = clinicalSections.map((section, index) => ({
  id: section.id,
  titulo: section.label,
  orden: index + 1,
}));
