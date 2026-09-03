export const PERMISOS_USUARIO = [
  { id: 'inicio.ver', modulo: 'Inicio', seccion: 'Panel principal', accion: 'Ver' },
  { id: 'pacientes.ver', modulo: 'Gestión clínica', seccion: 'Pacientes', accion: 'Ver' },
  { id: 'pacientes.crear', modulo: 'Gestión clínica', seccion: 'Pacientes', accion: 'Crear' },
  { id: 'pacientes.editar', modulo: 'Gestión clínica', seccion: 'Pacientes', accion: 'Editar' },
  { id: 'pacientes.eliminar', modulo: 'Gestión clínica', seccion: 'Pacientes', accion: 'Eliminar' },
  { id: 'historias.ver', modulo: 'Gestión clínica', seccion: 'Historias clínicas', accion: 'Ver' },
  { id: 'historias.crear', modulo: 'Gestión clínica', seccion: 'Historias clínicas', accion: 'Crear' },
  { id: 'historias.editar', modulo: 'Gestión clínica', seccion: 'Historias clínicas', accion: 'Editar' },
  { id: 'historias.validar', modulo: 'Gestión clínica', seccion: 'Historias clínicas', accion: 'Validar' },
  { id: 'seguimiento.ver', modulo: 'Seguimiento', seccion: 'Seguimientos', accion: 'Ver' },
  { id: 'seguimiento.crear', modulo: 'Seguimiento', seccion: 'Seguimientos', accion: 'Crear' },
  { id: 'supervision.ver', modulo: 'Supervisión', seccion: 'Pendientes de revisión', accion: 'Ver' },
  { id: 'usuarios.ver', modulo: 'Administración', seccion: 'Usuarios', accion: 'Ver' },
  { id: 'usuarios.crear', modulo: 'Administración', seccion: 'Usuarios', accion: 'Crear' },
  { id: 'usuarios.editar', modulo: 'Administración', seccion: 'Usuarios', accion: 'Editar' },
  { id: 'permisos.ver', modulo: 'Administración', seccion: 'Permisos por usuario', accion: 'Ver' },
  { id: 'permisos.editar', modulo: 'Administración', seccion: 'Permisos por usuario', accion: 'Editar' },
  { id: 'auditoria.ver', modulo: 'Administración', seccion: 'Auditoría', accion: 'Ver' },
  { id: 'configuracion.ver', modulo: 'Sistema', seccion: 'Configuración', accion: 'Ver' },
];

const ROL_BASE = {
  administrador: PERMISOS_USUARIO.map((p) => p.id),
  docente: ['inicio.ver', 'pacientes.ver', 'pacientes.crear', 'pacientes.editar', 'historias.ver', 'historias.editar', 'historias.validar', 'seguimiento.ver', 'supervision.ver'],
  alumno: ['inicio.ver', 'pacientes.ver', 'pacientes.crear', 'historias.ver', 'historias.crear', 'historias.editar', 'seguimiento.ver', 'seguimiento.crear'],
};

export const PERMISOS_INICIALES = {
  u1: new Set(ROL_BASE.alumno),
  u2: new Set(ROL_BASE.docente),
  u3: new Set(ROL_BASE.administrador),
};

export function permisosDelRol(rol = '') {
  const clave = rol.toLowerCase().includes('admin') ? 'administrador' : rol.toLowerCase().includes('docente') ? 'docente' : 'alumno';
  return new Set(ROL_BASE[clave]);
}
