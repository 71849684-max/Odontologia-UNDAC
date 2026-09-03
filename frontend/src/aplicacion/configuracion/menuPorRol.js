export const MENU_POR_ROL = {
    administrador: [
        { id: 'inicio', etiqueta: 'Inicio' },
        { id: 'gestion', etiqueta: 'Gestión clínica', children: [
            { id: 'pacientes', etiqueta: 'Pacientes' },
            { id: 'historias', etiqueta: 'Historias clínicas' },
            { id: 'nueva-historia', etiqueta: 'Nueva historia clínica' },
        ]},
        { id: 'administracion', etiqueta: 'Administración', children: [
            { id: 'usuarios', etiqueta: 'Usuarios' },
            { id: 'permisos-usuarios', etiqueta: 'Permisos por usuario' },
            { id: 'auditoria', etiqueta: 'Auditoría' },
        ]},
        { id: 'sistema', etiqueta: 'Sistema', children: [ { id: 'configuracion', etiqueta: 'Configuración' } ] },
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
            { id: 'nueva-historia', etiqueta: 'Nueva historia clínica' },
        ]},
        { id: 'seguimiento', etiqueta: 'Seguimiento', children: [ { id: 'mis-seguimientos', etiqueta: 'Mis seguimientos' } ] },
    ],
};
