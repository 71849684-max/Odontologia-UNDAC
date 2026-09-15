export const SECTION_STATUS = Object.freeze({
  NOT_STARTED: 'not-started',
  IN_PROGRESS: 'in-progress',
  COMPLETE: 'complete',
  REVIEW: 'review',
  APPROVED: 'approved',
});

export function hasMeaningfulValue(value) {
  if (Array.isArray(value)) return value.length > 0;
  if (value && typeof value === 'object') return Object.values(value).some(hasMeaningfulValue);
  return value !== null && value !== undefined && String(value).trim() !== '';
}

export function inferSectionStatus(values = {}, explicitStatus) {
  if (explicitStatus && Object.values(SECTION_STATUS).includes(explicitStatus)) return explicitStatus;
  return Object.values(values).some(hasMeaningfulValue) ? SECTION_STATUS.IN_PROGRESS : SECTION_STATUS.NOT_STARTED;
}

export function statusLabel(status) {
  return ({
    [SECTION_STATUS.NOT_STARTED]: 'Pendiente',
    [SECTION_STATUS.IN_PROGRESS]: 'En progreso',
    [SECTION_STATUS.COMPLETE]: 'Completo',
    [SECTION_STATUS.REVIEW]: 'En revisión',
    [SECTION_STATUS.APPROVED]: 'Aprobado',
  })[status] ?? 'Pendiente';
}
