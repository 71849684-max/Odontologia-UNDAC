import { clinicalSections } from '../../configuracion/historiaClinica.config.mjs';

const ACCIONES_HISTORIAS = {
    CREAR: 'Crear historia clínica',
    EDITAR: 'Editar historia clínica',
    EDITAR_ODONTOGRAMA: 'Editar odontograma',
    CONSULTAR_HISTORIA: 'Consultar historia clínica',
    CONSULTAR_MODULO: 'Consultar módulo clínico',
    CONSULTAR_PACIENTES: 'Consultar pacientes',
    ARCHIVOS: 'Archivos clínicos',
    CONSULTAR_ARCHIVO: 'Consultar o descargar archivo',
    EXPORTAR_HISTORIA: 'Exportar historia clínica',
    IMPRIMIR_HISTORIA: 'Preparar impresión de historia',
    CONSENTIMIENTO_OTORGADO: 'Registrar consentimiento otorgado',
    CONSENTIMIENTO_REVOCADO: 'Registrar revocación del consentimiento',
    CONSENTIMIENTO_NEGADO: 'Registrar negativa del consentimiento',
    REABRIR_SECCION: 'Reabrir sección para corregirla',
    MARCAR_COMPLETADO: 'Marcar sección como completada',
    INACTIVAR: 'Eliminar historia clínica (inactivar)',
    DESACTIVAR: 'Desactivar historia clínica',
    ACTIVAR: 'Activar historia clínica',
    RESTAURAR: 'Restaurar historia clínica',
    ELIMINAR: 'Eliminar historia clínica',
    CAMBIAR_ESTADO: 'Cambiar estado de la historia',
    ASIGNAR_PERSONAL: 'Cambiar asignación del equipo clínico',
    REVISAR_SECCION: 'Revisar sección clínica',
    APROBAR_SECCION: 'Aprobar sección',
    SUBIR_ARCHIVO: 'Adjuntar archivo a la historia',
    ELIMINAR_ARCHIVO: 'Eliminar archivo de la historia',
};

const NOMBRES_SECCIONES = Object.fromEntries(clinicalSections.map(seccion => [seccion.id, seccion.label]));

export function seccionesDelEvento(evento) {
    const codigos = new Set();
    for (const valores of [evento.valores_anteriores, evento.valores_nuevos]) {
        if (!valores || typeof valores !== 'object' || Array.isArray(valores)) continue;
        if (typeof valores.seccion === 'string') codigos.add(valores.seccion);
        if (Array.isArray(valores.secciones)) valores.secciones.filter(codigo => typeof codigo === 'string').forEach(codigo => codigos.add(codigo));
        for (const codigo of Object.keys(valores)) {
            if (NOMBRES_SECCIONES[codigo] || evento.modulo === 'historia_seccion_estado') codigos.add(codigo);
        }
    }
    return [...codigos].map(codigo => NOMBRES_SECCIONES[codigo] ?? codigo.replaceAll('-', ' ').replaceAll('_', ' ')).join(', ') || (evento.modulo === 'historia_seccion_estado' ? 'Sección no registrada' : 'Historia completa');
}

export function nombreAccion(accion) {
    return ACCIONES_HISTORIAS[accion] ?? String(accion ?? '—').replaceAll('_', ' ');
}

export function historiaDelEvento(evento) {
    if (evento.historia) return evento.historia;
    if (evento.historiaId) return `Historia clínica ${evento.historiaId}`;
    if (['historia_clinica', 'historia_seccion_estado'].includes(evento.modulo) && evento.registro) return `Historia clínica ${evento.registro}`;
    return 'Sin referencia disponible';
}
