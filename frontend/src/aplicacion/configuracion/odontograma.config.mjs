const upperRight = ['18','17','16','15','14','13','12','11'];
const upperLeft = ['21','22','23','24','25','26','27','28'];
const lowerLeft = ['38','37','36','35','34','33','32','31'];
const lowerRight = ['41','42','43','44','45','46','47','48'];

export const permanentTeeth = [
  ...upperRight.map((number) => ({ number, arch: 'superior', quadrant: 1 })),
  ...upperLeft.map((number) => ({ number, arch: 'superior', quadrant: 2 })),
  ...lowerLeft.map((number) => ({ number, arch: 'inferior', quadrant: 3 })),
  ...lowerRight.map((number) => ({ number, arch: 'inferior', quadrant: 4 })),
];

export const arches = {
  superior: [...upperRight, ...upperLeft],
  inferior: [...lowerLeft, ...lowerRight],
};

export const toothSurfaces = [
  { id: 'vestibular', label: 'Vestibular', short: 'V' },
  { id: 'lingual', label: 'Lingual / Palatina', short: 'L/P' },
  { id: 'mesial', label: 'Mesial', short: 'M' },
  { id: 'distal', label: 'Distal', short: 'D' },
  { id: 'oclusal', label: 'Oclusal / Incisal', short: 'O/I' },
];

export const odontogramStates = [
  { id: 'sin-registro', label: 'Sin registrar', symbol: '—', className: 'state-empty' },
  { id: 'caries', label: 'Caries', symbol: 'C', className: 'state-caries' },
  { id: 'restauracion', label: 'Restauración', symbol: 'R', className: 'state-restoration' },
  { id: 'sellante', label: 'Sellante', symbol: 'S', className: 'state-sealant' },
  { id: 'corona', label: 'Corona', symbol: 'CR', className: 'state-crown' },
  { id: 'endodoncia', label: 'Endodoncia', symbol: 'E', className: 'state-endo' },
  { id: 'ausente', label: 'Pieza ausente', symbol: 'X', className: 'state-missing' },
  { id: 'extraccion-indicada', label: 'Extracción indicada', symbol: 'EX', className: 'state-extraction' },
];

function emptySurface() {
  return { state: 'sin-registro', note: '' };
}

function emptyTooth(number) {
  return {
    number,
    generalNote: '',
    surfaces: Object.fromEntries(toothSurfaces.map((surface) => [surface.id, emptySurface()])),
  };
}

export function createEmptyOdontogram() {
  return Object.fromEntries(permanentTeeth.map((tooth) => [tooth.number, emptyTooth(tooth.number)]));
}

export function applyOdontogramMark(current, toothNumber, surfaceId, stateId, note = '') {
  if (!current[toothNumber]) return current;
  if (!toothSurfaces.some((surface) => surface.id === surfaceId)) return current;
  if (!odontogramStates.some((state) => state.id === stateId)) return current;

  return {
    ...current,
    [toothNumber]: {
      ...current[toothNumber],
      surfaces: {
        ...current[toothNumber].surfaces,
        [surfaceId]: { state: stateId, note },
      },
    },
  };
}

export function setToothGeneralNote(current, toothNumber, generalNote) {
  if (!current[toothNumber]) return current;
  return {
    ...current,
    [toothNumber]: { ...current[toothNumber], generalNote },
  };
}

export function clearToothMarks(current, toothNumber) {
  if (!current[toothNumber]) return current;
  return { ...current, [toothNumber]: emptyTooth(toothNumber) };
}

export function countRegisteredSurfaces(current) {
  return Object.values(current).reduce((total, tooth) => total + Object.values(tooth.surfaces).filter((surface) => surface.state !== 'sin-registro').length, 0);
}
