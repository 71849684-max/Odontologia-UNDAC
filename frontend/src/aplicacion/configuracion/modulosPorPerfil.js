const filtrosEstado = [{ id: 'estado', etiqueta: 'Estado', opciones: ['Activo', 'Pendiente', 'Completo'] }];

const columnasHistorias = [
    { clave: 'codigo', etiqueta: 'Historia' }, { clave: 'paciente', etiqueta: 'Paciente' },
    { clave: 'responsable', etiqueta: 'Responsable' }, { clave: 'actualizacion', etiqueta: 'Actualización' }, { clave: 'estado', etiqueta: 'Estado' },
];

const columnasPacientes = [
    { clave: 'paciente', etiqueta: 'Paciente' }, { clave: 'documento', etiqueta: 'Documento' },
    { clave: 'contacto', etiqueta: 'Contacto' }, { clave: 'ultimaAtencion', etiqueta: 'Última atención' }, { clave: 'estado', etiqueta: 'Estado' },
];

const resumen = (titulo, descripcion, accion) => ({ id: 'resumen', etiqueta: 'Resumen', icono: 'resumen', tipo: 'resumen', titulo, descripcion, accion });
const indicador = (id, etiqueta, valor, tono = 'neutro') => ({ id, etiqueta, valor, tono });
const barra = (etiqueta, valor, porcentaje) => ({ etiqueta, valor, porcentaje });

export const MODULOS_POR_PERFIL = {
    administrador: [
        resumen('Control general del sistema', 'Consulta el estado institucional, clínico y operativo de la plataforma.', 'Registrar usuario'),
        {
            id: 'usuarios-roles', etiqueta: 'Usuarios y roles', icono: 'usuarios', tipo: 'listado', titulo: 'Gestión de usuarios y roles',
            descripcion: 'Administra visualmente los perfiles y accesos institucionales.', accion: 'Registrar usuario', busqueda: 'Buscar por nombre o correo',
            filtros: [{ id: 'rol', etiqueta: 'Rol', opciones: ['Administrador', 'Docente', 'Alumno operador'] }, ...filtrosEstado],
            indicadores: [indicador('u1', 'Usuarios activos', '86', 'clinico'), indicador('u2', 'Docentes', '18'), indicador('u3', 'Alumnos', '64'), indicador('u4', 'Accesos pendientes', '04', 'academico')],
            tituloListado: 'Usuarios institucionales',
            columnas: [{ clave: 'nombre', etiqueta: 'Usuario' }, { clave: 'correo', etiqueta: 'Correo institucional' }, { clave: 'rol', etiqueta: 'Rol' }, { clave: 'ultimoAcceso', etiqueta: 'Último acceso' }, { clave: 'estado', etiqueta: 'Estado' }],
            filas: [
                { id: 'ua1', nombre: 'Dra. Elena Salazar', correo: 'esalazar@undac.edu.pe', rol: 'Docente', ultimoAcceso: 'Hoy, 08:45', estado: 'Activo' },
                { id: 'ua2', nombre: 'María Quispe', correo: 'mquispe@undac.edu.pe', rol: 'Alumno operador', ultimoAcceso: 'Hoy, 08:12', estado: 'Activo' },
                { id: 'ua3', nombre: 'José Paredes', correo: 'jparedes@undac.edu.pe', rol: 'Alumno operador', ultimoAcceso: '24 ago.', estado: 'Pendiente' },
            ],
            distribucion: { titulo: 'Distribución de perfiles', elementos: [barra('Alumnos operadores', '64', '74%'), barra('Docentes', '18', '21%'), barra('Administradores', '04', '5%')] },
        },
        {
            id: 'historias-clinicas', etiqueta: 'Historias clínicas', icono: 'historias', tipo: 'listado', titulo: 'Gestión de historias clínicas',
            descripcion: 'Revisa el avance y estado documental de las atenciones.', accion: 'Nueva historia clínica', busqueda: 'Buscar historia o paciente', filtros: filtrosEstado,
            indicadores: [indicador('h1', 'Historias activas', '128', 'clinico'), indicador('h2', 'En revisión', '34', 'academico'), indicador('h3', 'Completas', '79'), indicador('h4', 'Incompletas', '07', 'academico')],
            tituloListado: 'Historias registradas', columnas: columnasHistorias,
            filas: [
                { id: 'ha1', codigo: 'HC-2026-0048', paciente: 'Rosa Huamán', responsable: 'María Quispe', actualizacion: 'Hoy, 09:30', estado: 'Activa' },
                { id: 'ha2', codigo: 'HC-2026-0041', paciente: 'Luis Espinoza', responsable: 'José Paredes', actualizacion: 'Hoy, 08:45', estado: 'Pendiente' },
                { id: 'ha3', codigo: 'HC-2026-0037', paciente: 'Ana Salazar', responsable: 'Lucía Torres', actualizacion: '24 ago.', estado: 'Completa' },
            ],
            distribucion: { titulo: 'Estado documental', elementos: [barra('Activas', '128', '52%'), barra('Completas', '79', '32%'), barra('En revisión', '34', '14%')] },
        },
        {
            id: 'pacientes', etiqueta: 'Pacientes', icono: 'pacientes', tipo: 'listado', titulo: 'Directorio general de pacientes',
            descripcion: 'Consulta pacientes registrados y próximas atenciones.', accion: 'Registrar paciente', busqueda: 'Buscar paciente o documento', filtros: filtrosEstado,
            indicadores: [indicador('p1', 'Registrados', '312', 'clinico'), indicador('p2', 'Nuevos del mes', '28'), indicador('p3', 'Con seguimiento', '46', 'clinico'), indicador('p4', 'Por actualizar', '09', 'academico')],
            tituloListado: 'Directorio de pacientes', columnas: columnasPacientes,
            filas: [
                { id: 'pa1', paciente: 'Rosa Huamán', documento: '45872163', contacto: '987 412 630', ultimaAtencion: 'Hoy, 09:30', estado: 'Activo' },
                { id: 'pa2', paciente: 'Luis Espinoza', documento: '70214589', contacto: '965 220 418', ultimaAtencion: '24 ago.', estado: 'Seguimiento' },
                { id: 'pa3', paciente: 'Ana Salazar', documento: '61489257', contacto: '944 810 326', ultimaAtencion: '18 ago.', estado: 'Pendiente' },
            ],
            citas: [{ id: 'pc1', hora: '10:30', paciente: 'Luis Espinoza', detalle: 'Control postoperatorio' }, { id: 'pc2', hora: '12:00', paciente: 'Ana Salazar', detalle: 'Evaluación diagnóstica' }],
        },
        {
            id: 'auditoria', etiqueta: 'Auditoría', icono: 'auditoria', tipo: 'auditoria', titulo: 'Registro de auditoría',
            descripcion: 'Supervisa accesos, modificaciones y validaciones del sistema.', accion: 'Exportar reporte', filtros: [{ id: 'evento', etiqueta: 'Evento', opciones: ['Acceso', 'Modificación', 'Validación'] }],
            indicadores: [indicador('a1', 'Accesos hoy', '146', 'clinico'), indicador('a2', 'Modificaciones', '34'), indicador('a3', 'Validaciones', '21', 'academico'), indicador('a4', 'Alertas', '03', 'academico')],
            eventos: [
                { id: 'ae1', titulo: 'Historia clínica actualizada', detalle: 'HC-2026-0048 · Sección diagnóstico', usuario: 'María Quispe', fecha: 'Hoy, 09:30', tono: 'clinico' },
                { id: 'ae2', titulo: 'Validación docente registrada', detalle: 'HC-2026-0041 · Plan de tratamiento', usuario: 'Dra. Elena Salazar', fecha: 'Hoy, 08:45', tono: 'academico' },
                { id: 'ae3', titulo: 'Nuevo acceso institucional', detalle: 'Perfil alumno operador', usuario: 'José Paredes', fecha: 'Hoy, 08:12', tono: 'neutro' },
            ],
            distribucion: { titulo: 'Eventos por módulo', elementos: [barra('Historias clínicas', '58%', '58%'), barra('Pacientes', '27%', '27%'), barra('Usuarios', '15%', '15%')] },
        },
        {
            id: 'configuracion', etiqueta: 'Configuración', icono: 'configuracion', tipo: 'configuracion', titulo: 'Configuración institucional',
            descripcion: 'Define la presentación y parámetros demostrativos del sistema.', accion: 'Guardar configuración',
            grupos: [
                { id: 'identidad', titulo: 'Identidad institucional', descripcion: 'Información visible en encabezados y documentos.', opciones: [
                    { id: 'nombre', tipo: 'texto', etiqueta: 'Nombre de la clínica', valor: 'Clínica Odontológica UNDAC' },
                    { id: 'facultad', tipo: 'texto', etiqueta: 'Facultad', valor: 'Facultad de Ciencias de la Salud' },
                ] },
                { id: 'clinica', titulo: 'Parámetros clínicos', opciones: [
                    { id: 'validacion', etiqueta: 'Validación docente obligatoria', detalle: 'Solicitar revisión antes de cerrar una historia.', activa: true },
                    { id: 'seguimiento', etiqueta: 'Recordatorios de seguimiento', detalle: 'Mostrar avisos de controles próximos.', activa: true },
                ] },
                { id: 'avisos', titulo: 'Notificaciones', opciones: [
                    { id: 'correo', etiqueta: 'Avisos por correo', detalle: 'Notificaciones institucionales de actividad.', activa: true },
                    { id: 'resumen', etiqueta: 'Resumen académico semanal', detalle: 'Consolidado demostrativo para docentes.', activa: false },
                ] },
                { id: 'seguridad', titulo: 'Seguridad', opciones: [
                    { id: 'sesion', etiqueta: 'Aviso de sesión expirada', detalle: 'Mostrar el diálogo visual de seguridad.', activa: true },
                    { id: 'auditar', etiqueta: 'Auditar cambios clínicos', detalle: 'Registrar visualmente modificaciones sensibles.', activa: true },
                ] },
            ],
        },
    ],
    docente: [
        resumen('Supervisión académica y clínica', 'Consulta tu carga docente y los pendientes de validación.', 'Revisar pendientes'),
        {
            id: 'alumnos-asignados', etiqueta: 'Alumnos asignados', icono: 'alumnos', tipo: 'listado', titulo: 'Alumnos asignados',
            descripcion: 'Supervisa el progreso clínico de tu grupo académico.', accion: 'Ver distribución', busqueda: 'Buscar alumno o código', filtros: [{ id: 'ciclo', etiqueta: 'Ciclo', opciones: ['VIII', 'IX', 'X'] }],
            indicadores: [indicador('d1', 'Alumnos activos', '36', 'clinico'), indicador('d2', 'En clínica', '28'), indicador('d3', 'Con pendientes', '09', 'academico'), indicador('d4', 'Al día', '27', 'clinico')],
            tituloListado: 'Directorio de alumnos',
            columnas: [{ clave: 'alumno', etiqueta: 'Alumno' }, { clave: 'codigo', etiqueta: 'Código' }, { clave: 'ciclo', etiqueta: 'Ciclo' }, { clave: 'historias', etiqueta: 'Historias' }, { clave: 'progreso', etiqueta: 'Progreso' }],
            filas: [
                { id: 'da1', alumno: 'María Quispe', codigo: '20210318', ciclo: 'IX', historias: '08', progreso: '82%' },
                { id: 'da2', alumno: 'José Paredes', codigo: '20210274', ciclo: 'IX', historias: '06', progreso: '68%' },
                { id: 'da3', alumno: 'Lucía Torres', codigo: '20210405', ciclo: 'VIII', historias: '05', progreso: '74%' },
            ],
            distribucion: { titulo: 'Progreso del grupo', elementos: [barra('Avance alto', '14', '78%'), barra('Avance medio', '17', '54%'), barra('Requiere apoyo', '05', '22%')] },
        },
        {
            id: 'historias-supervisadas', etiqueta: 'Historias supervisadas', icono: 'historias', tipo: 'listado', titulo: 'Historias clínicas supervisadas',
            descripcion: 'Organiza las historias que requieren acompañamiento docente.', accion: 'Revisar siguiente', busqueda: 'Buscar historia, paciente o alumno', filtros: filtrosEstado,
            indicadores: [indicador('hs1', 'Asignadas', '42'), indicador('hs2', 'Por revisar', '12', 'academico'), indicador('hs3', 'Observadas', '05', 'academico'), indicador('hs4', 'Validadas', '25', 'clinico')],
            tituloListado: 'Bandeja de supervisión', columnas: [{ clave: 'codigo', etiqueta: 'Historia' }, { clave: 'paciente', etiqueta: 'Paciente' }, { clave: 'alumno', etiqueta: 'Alumno' }, { clave: 'etapa', etiqueta: 'Etapa clínica' }, { clave: 'prioridad', etiqueta: 'Prioridad' }],
            filas: [
                { id: 'dh1', codigo: 'HC-2026-0048', paciente: 'Rosa Huamán', alumno: 'María Quispe', etapa: 'Diagnóstico', prioridad: 'Alta' },
                { id: 'dh2', codigo: 'HC-2026-0041', paciente: 'Luis Espinoza', alumno: 'José Paredes', etapa: 'Plan de tratamiento', prioridad: 'Media' },
                { id: 'dh3', codigo: 'HC-2026-0037', paciente: 'Ana Salazar', alumno: 'Lucía Torres', etapa: 'Seguimiento', prioridad: 'Regular' },
            ],
            distribucion: { titulo: 'Carga de revisión', elementos: [barra('Diagnósticos', '06', '50%'), barra('Planes', '04', '34%'), barra('Cierres', '02', '16%')] },
        },
        {
            id: 'validaciones', etiqueta: 'Validaciones', icono: 'validaciones', tipo: 'listado', titulo: 'Cola de validaciones clínicas',
            descripcion: 'Prioriza diagnósticos, planes, consentimientos y cierres.', accion: 'Iniciar revisión', filtros: [{ id: 'tipo', etiqueta: 'Tipo', opciones: ['Diagnóstico', 'Plan', 'Consentimiento'] }],
            indicadores: [indicador('v1', 'Diagnósticos', '05', 'academico'), indicador('v2', 'Planes', '03', 'academico'), indicador('v3', 'Consentimientos', '02'), indicador('v4', 'Cierres', '02', 'clinico')],
            tituloListado: 'Solicitudes pendientes', columnas: [{ clave: 'solicitud', etiqueta: 'Solicitud' }, { clave: 'historia', etiqueta: 'Historia' }, { clave: 'alumno', etiqueta: 'Alumno' }, { clave: 'espera', etiqueta: 'En espera' }, { clave: 'prioridad', etiqueta: 'Prioridad' }],
            filas: [
                { id: 'dv1', solicitud: 'Diagnóstico', historia: 'HC-2026-0048', alumno: 'María Quispe', espera: '45 min', prioridad: 'Alta' },
                { id: 'dv2', solicitud: 'Plan de tratamiento', historia: 'HC-2026-0041', alumno: 'José Paredes', espera: '1 h 20 min', prioridad: 'Media' },
                { id: 'dv3', solicitud: 'Consentimiento', historia: 'HC-2026-0037', alumno: 'Lucía Torres', espera: '2 h', prioridad: 'Regular' },
            ],
            distribucion: { titulo: 'Tiempo de atención', elementos: [barra('Menos de 1 hora', '05', '72%'), barra('Entre 1 y 2 horas', '04', '48%'), barra('Más de 2 horas', '03', '26%')] },
        },
        {
            id: 'seguimientos', etiqueta: 'Seguimientos', icono: 'seguimientos', tipo: 'agenda', titulo: 'Agenda de seguimientos',
            descripcion: 'Consulta controles próximos y compromisos de supervisión.', accion: 'Programar seguimiento',
            indicadores: [indicador('sg1', 'Controles hoy', '07', 'clinico'), indicador('sg2', 'Esta semana', '24'), indicador('sg3', 'Reprogramados', '03', 'academico'), indicador('sg4', 'Vencidos', '02', 'academico')],
            citas: [
                { id: 'dsc1', hora: '09:30', paciente: 'Rosa Huamán', detalle: 'Control postoperatorio', responsable: 'María Quispe' },
                { id: 'dsc2', hora: '11:00', paciente: 'Luis Espinoza', detalle: 'Evaluación periodontal', responsable: 'José Paredes' },
                { id: 'dsc3', hora: '14:30', paciente: 'Ana Salazar', detalle: 'Seguimiento diagnóstico', responsable: 'Lucía Torres' },
            ],
            distribucion: { titulo: 'Carga semanal', elementos: [barra('Martes', '07', '78%'), barra('Miércoles', '05', '56%'), barra('Jueves', '08', '88%')] },
        },
        {
            id: 'auditoria-academica', etiqueta: 'Auditoría académica', icono: 'auditoria', tipo: 'auditoria', titulo: 'Auditoría académica',
            descripcion: 'Evalúa intervenciones docentes y cumplimiento por alumno.', accion: 'Generar informe', filtros: filtrosEstado,
            indicadores: [indicador('aa1', 'Revisiones', '38', 'clinico'), indicador('aa2', 'Observaciones', '11', 'academico'), indicador('aa3', 'Firmas', '27'), indicador('aa4', 'Cumplimiento', '84%', 'clinico')],
            eventos: [
                { id: 'dae1', titulo: 'Observación académica registrada', detalle: 'María Quispe · HC-2026-0048', fecha: 'Hoy, 10:05', tono: 'academico' },
                { id: 'dae2', titulo: 'Historia validada', detalle: 'José Paredes · HC-2026-0041', fecha: 'Hoy, 09:10', tono: 'clinico' },
                { id: 'dae3', titulo: 'Consentimiento firmado', detalle: 'Lucía Torres · HC-2026-0037', fecha: '24 ago.', tono: 'neutro' },
            ],
            distribucion: { titulo: 'Cumplimiento por alumno', elementos: [barra('María Quispe', '92%', '92%'), barra('Lucía Torres', '86%', '86%'), barra('José Paredes', '74%', '74%')] },
        },
    ],
    alumno: [
        resumen('Tu actividad clínica de hoy', 'Consulta tus historias, controles y registros pendientes.', 'Nueva historia clínica'),
        {
            id: 'mis-historias', etiqueta: 'Mis historias clínicas', icono: 'historias', tipo: 'listado', titulo: 'Mis historias clínicas',
            descripcion: 'Continúa tus registros y consulta su avance de validación.', accion: 'Nueva historia clínica', busqueda: 'Buscar historia o paciente', filtros: filtrosEstado,
            indicadores: [indicador('mh1', 'Activas', '24', 'clinico'), indicador('mh2', 'Por validar', '08', 'academico'), indicador('mh3', 'Completas', '13'), indicador('mh4', 'Incompletas', '03', 'academico')],
            tituloListado: 'Avance de historias', columnas: [{ clave: 'paciente', etiqueta: 'Paciente' }, { clave: 'codigo', etiqueta: 'Historia' }, { clave: 'etapa', etiqueta: 'Etapa' }, { clave: 'docente', etiqueta: 'Docente' }, { clave: 'progreso', etiqueta: 'Progreso' }],
            filas: [
                { id: 'amh1', paciente: 'Rosa Huamán', codigo: 'HC-2026-0048', etapa: 'Diagnóstico', docente: 'Dra. Elena Salazar', progreso: '78%' },
                { id: 'amh2', paciente: 'Luis Espinoza', codigo: 'HC-2026-0041', etapa: 'Seguimiento', docente: 'Dra. Elena Salazar', progreso: '62%' },
                { id: 'amh3', paciente: 'Ana Salazar', codigo: 'HC-2026-0037', etapa: 'Cierre', docente: 'Dr. Marco Rojas', progreso: '94%' },
            ],
            distribucion: { titulo: 'Estado de validación', elementos: [barra('Validadas', '13', '78%'), barra('Por revisar', '08', '48%'), barra('Observadas', '03', '22%')] },
        },
        {
            id: 'pacientes', etiqueta: 'Pacientes', icono: 'pacientes', tipo: 'listado', titulo: 'Mis pacientes asignados',
            descripcion: 'Consulta el directorio clínico asociado a tu práctica.', accion: 'Registrar paciente', busqueda: 'Buscar paciente asignado', filtros: filtrosEstado,
            indicadores: [indicador('ap1', 'Pacientes activos', '18', 'clinico'), indicador('ap2', 'Nuevos', '04'), indicador('ap3', 'Con control', '09', 'clinico'), indicador('ap4', 'Sin atención reciente', '03', 'academico')],
            tituloListado: 'Pacientes asignados', columnas: columnasPacientes,
            filas: [
                { id: 'apa1', paciente: 'Rosa Huamán', documento: '45872163', contacto: '987 412 630', ultimaAtencion: 'Hoy, 09:30', estado: 'Activo' },
                { id: 'apa2', paciente: 'Luis Espinoza', documento: '70214589', contacto: '965 220 418', ultimaAtencion: '24 ago.', estado: 'Seguimiento' },
                { id: 'apa3', paciente: 'Ana Salazar', documento: '61489257', contacto: '944 810 326', ultimaAtencion: '18 ago.', estado: 'Pendiente' },
            ],
            citas: [{ id: 'apc1', hora: '09:30', paciente: 'Rosa Huamán', detalle: 'Control postoperatorio' }, { id: 'apc2', hora: '15:00', paciente: 'Luis Espinoza', detalle: 'Reevaluación clínica' }],
        },
        {
            id: 'seguimientos', etiqueta: 'Seguimientos', icono: 'seguimientos', tipo: 'agenda', titulo: 'Mis seguimientos clínicos',
            descripcion: 'Organiza controles, tareas y próximas atenciones.', accion: 'Registrar control',
            indicadores: [indicador('as1', 'Controles hoy', '05', 'clinico'), indicador('as2', 'Esta semana', '12'), indicador('as3', 'Próximos', '07', 'clinico'), indicador('as4', 'Vencidos', '02', 'academico')],
            citas: [
                { id: 'asc1', hora: '09:30', paciente: 'Rosa Huamán', detalle: 'Control de cicatrización' },
                { id: 'asc2', hora: '11:30', paciente: 'Luis Espinoza', detalle: 'Actualización de evolución' },
                { id: 'asc3', hora: '15:00', paciente: 'Ana Salazar', detalle: 'Registro de cierre clínico' },
            ],
            distribucion: { titulo: 'Tareas de la semana', elementos: [barra('Completadas', '08', '66%'), barra('Pendientes', '03', '32%'), barra('Vencidas', '01', '12%')] },
        },
        {
            id: 'recursos-clinicos', etiqueta: 'Recursos clínicos', icono: 'recursos', tipo: 'recursos', titulo: 'Biblioteca de recursos clínicos',
            descripcion: 'Consulta protocolos, formatos y material académico.', accion: 'Explorar biblioteca', busqueda: 'Buscar protocolo, guía o formato',
            filtros: [{ id: 'categoria', etiqueta: 'Categoría', opciones: ['Protocolos', 'Formatos', 'Guías', 'Material académico'] }],
            recursos: [
                { id: 'r1', titulo: 'Protocolo de bioseguridad clínica', categoria: 'Protocolos', formato: 'PDF · 12 páginas', descripcion: 'Lineamientos para la atención segura en clínica universitaria.' },
                { id: 'r2', titulo: 'Guía de diagnóstico odontológico', categoria: 'Guías', formato: 'PDF · 28 páginas', descripcion: 'Criterios académicos para organizar el diagnóstico integral.' },
                { id: 'r3', titulo: 'Formato de consentimiento informado', categoria: 'Formatos', formato: 'DOCX · 2 páginas', descripcion: 'Modelo institucional para procedimientos odontológicos.' },
                { id: 'r4', titulo: 'Manual de registro de historias', categoria: 'Material académico', formato: 'PDF · 18 páginas', descripcion: 'Orientaciones para completar la historia clínica digital.' },
            ],
        },
    ],
};
