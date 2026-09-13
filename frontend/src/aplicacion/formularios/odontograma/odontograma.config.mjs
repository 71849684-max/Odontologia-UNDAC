const upperRight = ['18','17','16','15','14','13','12','11'];
const upperLeft = ['21','22','23','24','25','26','27','28'];
const lowerRight = ['48','47','46','45','44','43','42','41'];
const lowerLeft = ['31','32','33','34','35','36','37','38'];

export const permanentTeeth = [
  ...upperRight.map((number) => ({ number, arch: 'superior', quadrant: 1 })),
  ...upperLeft.map((number) => ({ number, arch: 'superior', quadrant: 2 })),
  ...lowerRight.map((number) => ({ number, arch: 'inferior', quadrant: 4 })),
  ...lowerLeft.map((number) => ({ number, arch: 'inferior', quadrant: 3 })),
];

export const temporaryArches = {
  superior: ['55','54','53','52','51','61','62','63','64','65'],
  inferior: ['85','84','83','82','81','71','72','73','74','75'],
};
export const temporaryTeeth = Object.entries(temporaryArches).flatMap(([arch, numbers]) => numbers.map((number) => ({ number, arch, quadrant: Number(number[0]) })));
export const allTeeth = [...permanentTeeth, ...temporaryTeeth];

export const arches = {
  superior: [...upperRight, ...upperLeft],
  inferior: [...lowerRight, ...lowerLeft],
};

export const toothSurfaces = [
  { id: 'vestibular', label: 'Vestibular', short: 'V' },
  { id: 'lingual', label: 'Lingual / Palatina', short: 'L/P' },
  { id: 'mesial', label: 'Mesial', short: 'M' },
  { id: 'distal', label: 'Distal', short: 'D' },
  { id: 'oclusal', label: 'Oclusal / Incisal', short: 'O/I' },
];

// NTS 188-MINSA/DGIESP-2022, 6.1. Los símbolos gráficos no son siglas clínicas.
const finding = (id, label, symbol, scope, graphic, color = 'blue', options = [], condition = false) => ({
  id, label, symbol, scope, graphic, color, options, condition, className: color === 'red' ? 'state-pathology' : 'state-clinical-blue',
});
export const odontogramStates = [
  finding('sin-registro', 'Sin registrar', '—', 'surface', 'none'),
  finding('ortodoncia-fija', 'Aparato ortodóntico fijo', '⊞—⊞', 'range', 'brackets', 'blue', [], true),
  finding('ortodoncia-removible', 'Aparato ortodóntico removible', '⌁', 'range', 'zigzag', 'blue', [], true),
  finding('corona', 'Corona', 'CM', 'tooth', 'crown', 'blue', ['CM','CF','CMC','CV','CLM'], true),
  finding('corona-temporal', 'Corona temporal', 'CT', 'tooth', 'crown', 'red'),
  finding('defecto-esmalte', 'Defectos de desarrollo del esmalte', 'O', 'surface', 'code', 'red', ['O','PE']),
  finding('diastema', 'Diastema', ')(', 'pair', 'diastema'),
  finding('edentulo', 'Edéntulo total', '—', 'arch', 'edentulous'),
  finding('espigo', 'Espigo – muñón', '▣', 'tooth', 'post', 'blue', [], true),
  finding('fosas', 'Fosas y fisuras profundas', 'FFP', 'tooth', 'code'),
  finding('fractura', 'Fractura dental', '╱', 'tooth', 'draw-line', 'red'),
  finding('fusion', 'Fusión', '◯◯', 'pair', 'fusion'),
  finding('geminacion', 'Geminación', '◯', 'tooth', 'gemination'),
  finding('giroversion', 'Giroversión', '↷', 'tooth', 'rotation', 'blue', ['horario','antihorario']),
  finding('impactacion', 'Impactación', 'I', 'tooth', 'code'),
  finding('implante', 'Implante dental', 'IMP', 'tooth', 'code', 'blue', [], true),
  finding('caries', 'Lesión de caries dental', 'CE', 'surface', 'draw-fill', 'red', ['MB','CE','CD','CDP']),
  finding('macrodoncia', 'Macrodoncia', 'MAC', 'tooth', 'code'),
  finding('microdoncia', 'Microdoncia', 'MIC', 'tooth', 'code'),
  finding('movilidad', 'Movilidad patológica', 'M', 'tooth', 'code', 'red', ['M1','M2','M3']),
  finding('ausente', 'Pieza dentaria ausente / extraída', 'DAO', 'tooth', 'missing', 'blue', ['DNE','DEX','DAO']),
  finding('clavija', 'Pieza dentaria en clavija', '△', 'tooth', 'triangle'),
  finding('ectopico', 'Pieza dentaria ectópica', 'E', 'tooth', 'code'),
  finding('erupcion', 'Pieza dentaria en erupción', '↯', 'tooth', 'eruption'),
  finding('extruido', 'Pieza dentaria extruida', '↓', 'tooth', 'extrusion'),
  finding('intruido', 'Pieza dentaria intruida', '↑', 'tooth', 'intrusion'),
  finding('supernumerario', 'Pieza dentaria supernumeraria', 'Ⓢ', 'pair', 'supernumerary'),
  finding('pulpotomia', 'Pulpotomía', 'PP', 'tooth', 'pulp', 'blue', [], true),
  finding('posicion', 'Posición anormal dentaria', 'M', 'tooth', 'code', 'blue', ['M','D','V','P','L']),
  finding('protesis-fija', 'Prótesis dental parcial fija', '┬─┬', 'range', 'bridge', 'blue', [], true),
  finding('protesis-completa', 'Prótesis dental completa', '═', 'arch', 'double', 'blue', [], true),
  finding('protesis-removible', 'Prótesis dental parcial removible', '═', 'range', 'double', 'blue', [], true),
  finding('remanente', 'Remanente radicular', 'RR', 'tooth', 'code', 'red'),
  finding('restauracion', 'Restauración definitiva', 'R', 'surface', 'draw-fill', 'blue', ['AM','R','IV','IM','IE','C'], true),
  finding('restauracion-temporal', 'Restauración temporal', 'Contorno', 'surface', 'draw-line', 'red'),
  finding('sellante', 'Sellante', 'S', 'surface', 'draw-line', 'blue', [], true),
  finding('desgaste', 'Superficie desgastada', 'DES', 'surface', 'draw-line', 'red'),
  finding('endodoncia', 'Tratamiento de conductos / pulpectomía', 'TC', 'tooth', 'root', 'blue', ['TC','PC'], true),
  finding('transposicion', 'Transposición dentaria', '⇄', 'pair', 'transposition'),
];

export function surfacePosition(number, surface) {
  const right = ['1','4','5','8'].includes(String(number)[0]);
  const upper = ['1','2','5','6'].includes(String(number)[0]);
  return { vestibular: upper ? 'top' : 'bottom', lingual: upper ? 'bottom' : 'top', mesial: right ? 'right' : 'left', distal: right ? 'left' : 'right', oclusal: 'center' }[surface];
}
export const clinicalColor = (mark) => mark.condition === 'bad' || odontogramStates.find((s) => s.id === mark.state)?.color === 'red' ? '#dc2626' : '#1d4ed8';
export const stateFor = (id) => odontogramStates.find((s) => s.id === id) || odontogramStates[0];
export function markCode(mark) {
  const state = stateFor(mark.state);
  return ['code','crown','missing','pulp','root','draw-fill'].includes(state.graphic) || ['sellante','desgaste'].includes(mark.state) ? mark.code || state.symbol : '';
}

function emptySurface() {
  return { state: 'sin-registro', note: '', findings: [] };
}

function emptyTooth(number) {
  return {
    number,
    generalNote: '',
    findings: [],
    surfaces: Object.fromEntries(toothSurfaces.map((surface) => [surface.id, emptySurface()])),
  };
}

export function createEmptyOdontogram() {
  return Object.fromEntries(allTeeth.map((tooth) => [tooth.number, emptyTooth(tooth.number)]));
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
