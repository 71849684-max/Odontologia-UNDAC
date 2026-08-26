export const PANELES_POR_PERFIL = {
    administrador: {
        etiqueta: 'Administrador',
        persona: 'Carlos Mendoza',
        encabezado: 'Control general del sistema',
        accionPrincipal: 'Registrar usuario',
        indicadores: [
            { id: 'usuarios', etiqueta: 'Usuarios activos', valor: '86', tono: 'clinico' },
            { id: 'historias', etiqueta: 'Historias registradas', valor: '248', tono: 'neutro' },
            { id: 'actividad', etiqueta: 'Acciones hoy', valor: '34', tono: 'neutro' },
            { id: 'alertas', etiqueta: 'Alertas', valor: '03', tono: 'academico' },
        ],
        actividades: [
            { id: 'a1', paciente: 'Rosa Huamán', historia: 'HC-2026-0048', atencion: 'Actualización', fecha: 'Hoy, 09:30', estado: 'Registrada' },
            { id: 'a2', paciente: 'Luis Espinoza', historia: 'HC-2026-0041', atencion: 'Validación', fecha: 'Hoy, 08:45', estado: 'Por revisar' },
            { id: 'a3', paciente: 'Ana Salazar', historia: 'HC-2026-0037', atencion: 'Auditoría', fecha: 'Ayer, 16:10', estado: 'Completa' },
        ],
        accionesRapidas: ['Gestionar usuarios', 'Consultar auditoría', 'Ver historias clínicas'],
    },
    docente: {
        etiqueta: 'Docente',
        persona: 'Dra. Elena Salazar',
        encabezado: 'Supervisión académica y clínica',
        accionPrincipal: 'Revisar pendientes',
        indicadores: [
            { id: 'alumnos', etiqueta: 'Alumnos asignados', valor: '36', tono: 'neutro' },
            { id: 'revisiones', etiqueta: 'Historias por revisar', valor: '12', tono: 'academico' },
            { id: 'firmas', etiqueta: 'Firmas pendientes', valor: '04', tono: 'academico' },
            { id: 'controles', etiqueta: 'Controles del día', valor: '07', tono: 'clinico' },
        ],
        actividades: [
            { id: 'd1', paciente: 'Luis Espinoza', historia: 'HC-2026-0041', atencion: 'Diagnóstico', fecha: 'Hoy, 10:00', estado: 'Por revisar' },
            { id: 'd2', paciente: 'Ana Salazar', historia: 'HC-2026-0037', atencion: 'Consentimiento', fecha: 'Hoy, 11:30', estado: 'Firma pendiente' },
            { id: 'd3', paciente: 'Diego Torres', historia: 'HC-2026-0032', atencion: 'Seguimiento', fecha: 'Ayer, 15:20', estado: 'Validada' },
        ],
        accionesRapidas: ['Revisar historias pendientes', 'Firmar consentimientos', 'Consultar alumnos'],
    },
    alumno: {
        etiqueta: 'Alumno operador',
        persona: 'María Quispe',
        encabezado: 'Tu actividad clínica de hoy',
        accionPrincipal: 'Nueva historia clínica',
        indicadores: [
            { id: 'activas', etiqueta: 'Historias activas', valor: '24', tono: 'clinico' },
            { id: 'validacion', etiqueta: 'Pendientes de validación', valor: '08', tono: 'academico' },
            { id: 'hoy', etiqueta: 'Controles del día', valor: '05', tono: 'clinico' },
            { id: 'incompletos', etiqueta: 'Registros incompletos', valor: '03', tono: 'neutro' },
        ],
        actividades: [
            { id: 'e1', paciente: 'Rosa Huamán', historia: 'HC-2026-0048', atencion: 'Cirugía bucal', fecha: 'Hoy, 09:30', estado: 'En curso' },
            { id: 'e2', paciente: 'Luis Espinoza', historia: 'HC-2026-0041', atencion: 'Seguimiento', fecha: 'Ayer, 16:10', estado: 'Por validar' },
            { id: 'e3', paciente: 'Ana Salazar', historia: 'HC-2026-0037', atencion: 'Diagnóstico', fecha: '22 ago.', estado: 'Completa' },
        ],
        accionesRapidas: ['Registrar paciente', 'Continuar historia', 'Ver seguimientos'],
    },
};
