const ACCIONES_HISTORIAS = {
    CREAR: 'Crear historia clínica',
    EDITAR: 'Editar historia clínica',
    EDITAR_ODONTOGRAMA: 'Editar odontograma',
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
    SUBIR_ARCHIVO: 'Adjuntar archivo a la historia',
    ELIMINAR_ARCHIVO: 'Eliminar archivo de la historia',
};

export function nombreAccion(accion) {
    return ACCIONES_HISTORIAS[accion] ?? String(accion ?? '—').replaceAll('_', ' ');
}

export function historiaDelEvento(evento) {
    if (evento.historia) return evento.historia;
    if (evento.historiaId) return `Historia clínica ${evento.historiaId}`;
    if (['historia_clinica', 'historia_seccion_estado'].includes(evento.modulo) && evento.registro) return `Historia clínica ${evento.registro}`;
    return 'Sin referencia disponible';
}
