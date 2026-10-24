export const ETIQUETAS_ROL = {
  administrador: 'Administrador',
  docente: 'Profesional encargado',
  alumno: 'Asistente',
  alumno_operador: 'Asistente',
  administrativo: 'Personal administrativo',
};

export const ETIQUETAS_CODIGO_ROL = {
  ADMINISTRADOR: 'Administrador',
  DOCENTE: 'Profesional encargado',
  ALUMNO: 'Asistente',
  ALUMNO_OPERADOR: 'Asistente',
  ADMINISTRATIVO: 'Personal administrativo',
};

export function etiquetaRol(rol, respaldo = '') {
  const clave = String(rol ?? '').trim().toLowerCase().replace(/\s+/g, '_');
  return ETIQUETAS_ROL[clave] ?? ETIQUETAS_CODIGO_ROL[clave.toUpperCase()] ?? respaldo ?? rol;
}

export function etiquetaCodigoRol(codigo, respaldo = '') {
  const clave = String(codigo ?? '').toUpperCase();
  return ETIQUETAS_CODIGO_ROL[clave] ?? respaldo ?? codigo;
}
