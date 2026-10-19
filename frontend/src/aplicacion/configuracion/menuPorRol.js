import { vistaPermitida } from './permisosVista.js';

/**
 * Traduce los codigos de rol que devuelve el backend (tabla rol) al perfil de
 * menu que usa la interfaz.
 */
export const PERFIL_POR_CODIGO_ROL = {
    ADMINISTRADOR: 'administrador',
    DOCENTE: 'docente',
    ALUMNO: 'alumno',
    ALUMNO_OPERADOR: 'alumno',
    ADMINISTRATIVO: 'administrativo',
};

/** Si el usuario tiene varios roles, gana el de mayor alcance. */
const PRIORIDAD_DE_ROLES = ['ADMINISTRADOR', 'DOCENTE', 'ALUMNO', 'ALUMNO_OPERADOR', 'ADMINISTRATIVO'];

export function perfilDesdeRoles(roles = []) {
    const codigo = PRIORIDAD_DE_ROLES.find((candidato) => roles.includes(candidato));

    return codigo ? PERFIL_POR_CODIGO_ROL[codigo] : 'administrativo';
}

export const MENU_POR_ROL = {
    administrador: [
        { id: 'inicio', etiqueta: 'Inicio' },
        { id: 'gestion', etiqueta: 'Gestión clínica', children: [
            { id: 'pacientes', etiqueta: 'Pacientes' },
            { id: 'historias', etiqueta: 'Historias clínicas' },
        ]},
        { id: 'administracion', etiqueta: 'Administración', children: [
            { id: 'usuarios', etiqueta: 'Usuarios' },
            { id: 'permisos-usuarios', etiqueta: 'Permisos por usuario' },
            { id: 'auditoria', etiqueta: 'Auditoría' },
        ]},
        { id: 'sistema', etiqueta: 'Sistema', children: [
            { id: 'grupos-academicos', etiqueta: 'Grupos académicos' },
            { id: 'cursos', etiqueta: 'Cursos' },
            { id: 'configuracion', etiqueta: 'Configuración' },
        ] },
    ],
    docente: [
        { id: 'inicio', etiqueta: 'Inicio' },
        { id: 'gestion', etiqueta: 'Gestión clínica', children: [
            { id: 'pacientes', etiqueta: 'Pacientes' },
            { id: 'historias', etiqueta: 'Historias clínicas' },
        ]},
        { id: 'supervision', etiqueta: 'Supervisión', children: [
            { id: 'pendientes', etiqueta: 'Pendientes de revisión' },
            { id: 'seguimiento', etiqueta: 'Seguimiento' },
        ]},
    ],
    alumno: [
        { id: 'inicio', etiqueta: 'Inicio' },
        { id: 'gestion', etiqueta: 'Gestión clínica', children: [
            { id: 'mis-pacientes', etiqueta: 'Mis pacientes' },
            { id: 'mis-historias', etiqueta: 'Mis historias clínicas' },
        ]},
        { id: 'seguimiento', etiqueta: 'Seguimiento', children: [ { id: 'mis-seguimientos', etiqueta: 'Mis seguimientos' } ] },
    ],
    administrativo: [
        { id: 'inicio', etiqueta: 'Inicio' },
        { id: 'gestion', etiqueta: 'Gestión clínica', children: [
            { id: 'pacientes', etiqueta: 'Pacientes' },
            { id: 'historias', etiqueta: 'Historias clínicas' },
        ]},
    ],
};

/**
 * El perfil arma el menú posible. `permisos` (códigos efectivos de la sesión)
 * oculta lo que esa persona no tiene. Sin lista, se conserva el menú del rol.
 */
export function menuParaSesion(perfil, permisos) {
    const base = MENU_POR_ROL[perfil] ?? MENU_POR_ROL.administrativo;
    if (!Array.isArray(permisos)) return base;

    return base.flatMap((item) => {
        if (!item.children) {
            return vistaPermitida(item.id, permisos) ? [item] : [];
        }

        const children = item.children.filter((hijo) => vistaPermitida(hijo.id, permisos));
        return children.length ? [{ ...item, children }] : [];
    });
}
