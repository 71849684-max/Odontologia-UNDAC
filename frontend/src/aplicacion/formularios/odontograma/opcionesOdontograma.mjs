export const optionLabels = {
  MB: 'Mancha blanca', CE: 'Caries en esmalte', CD: 'Caries en dentina', CDP: 'Dentina con compromiso pulpar',
  CM: 'Corona metálica', CF: 'Corona fenestrada', CMC: 'Corona metal cerámica', CV: 'Corona Veneer', CLM: 'Corona libre de metal',
  DNE: 'Diente no erupcionado', DEX: 'Ausente por extracción por caries', DAO: 'Ausente por otras razones',
  AM: 'Amalgama', R: 'Resina', IV: 'Ionómero de vidrio', IM: 'Incrustación metálica', IE: 'Incrustación estética', C: 'Carilla',
  TC: 'Tratamiento de conductos', PC: 'Pulpectomía', O: 'Opacidades del esmalte', PE: 'Pigmentación del esmalte',
  M: 'Mesializado', D: 'Distalizado', V: 'Vestibularizado', P: 'Palatinizado', L: 'Lingualizado',
  M1: 'Movilidad grado 1', M2: 'Movilidad grado 2', M3: 'Movilidad grado 3', horario: 'Sentido horario', antihorario: 'Sentido antihorario',
};

export const quickTools = [
  { label: 'Caries', state: 'caries', code: 'CE', icon: 'caries', description: 'CE · Caries en esmalte. Puede cambiar la clasificación.' },
  { label: 'Restauración', state: 'restauracion', code: 'R', icon: 'restoration', description: 'R · Resina. Puede cambiar el material y el estado.' },
  { label: 'Ausente', state: 'ausente', code: 'DAO', icon: 'absent', description: 'DAO · Ausente por otras razones.' },
  { label: 'Extraído', state: 'ausente', code: 'DEX', icon: 'extracted', description: 'DEX · Extraído por caries. Para otras razones, use DAO.' },
  { label: 'Fractura', state: 'fractura', code: '', icon: 'fracture', description: 'Fractura dental.' },
  { label: 'Sellante', state: 'sellante', code: '', icon: 'sealant', description: 'Sellante observado.' },
];
