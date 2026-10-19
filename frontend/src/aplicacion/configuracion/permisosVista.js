import { clinicalMoments, clinicalSections } from './historiaClinica.config.mjs';

/** Vista del menú o de la ruta, y el submódulo que la habilita. */
export const CODIGO_POR_VISTA = {
    inicio: 'TABLERO',
    pacientes: 'PACIENTES',
    'mis-pacientes': 'PACIENTES',
    historias: 'HISTORIAS',
    'mis-historias': 'HISTORIAS',
    'historia-clinica': 'HISTORIAS',
    pendientes: 'SEGUIMIENTO',
    seguimiento: 'SEGUIMIENTO',
    'mis-seguimientos': 'SEGUIMIENTO',
    usuarios: 'USUARIOS',
    'permisos-usuarios': 'ROLES',
    auditoria: 'BITACORA',
    cursos: 'CURSOS',
    'grupos-academicos': 'GRUPOS',
    configuracion: 'PARAMETROS',
};

/** Sección interna de la historia clínica y el submódulo que la habilita. */
export const CODIGO_POR_SECCION = {
    'examen-clinico': 'EXAMEN_CLINICO',
    'examen-extraoral': 'EXAMEN_CLINICO',
    'examen-intraoral': 'EXAMEN_CLINICO',
    odontograma: 'ODONTOGRAMA',
    'examenes-auxiliares': 'EXAMENES_AUXILIARES',
    diagnostico: 'DIAGNOSTICO_TRATAMIENTO',
    'plan-tratamiento': 'DIAGNOSTICO_TRATAMIENTO',
    consentimiento: 'CONSENTIMIENTO',
    cirugia: 'PROGRAMACION',
    'reporte-operatorio': 'REPORTE_OPERATORIO',
    seguimiento: 'SEGUIMIENTO',
};

const ALIAS_VISTA = {
    dashboard: 'inicio',
    historia: 'historia-clinica',
    'nueva-historia': 'historias',
    permisos: 'permisos-usuarios',
};

export function vistaPermitida(ruta, permisos) {
    if (!Array.isArray(permisos)) return true;
    const codigo = CODIGO_POR_VISTA[ALIAS_VISTA[ruta] ?? ruta];
    if (!codigo) return true;
    return permisos.includes(codigo);
}

export function seccionesPermitidas(permisos) {
    if (!Array.isArray(permisos)) return clinicalSections;
    const concedidos = new Set(permisos);
    return clinicalSections.filter((seccion) => {
        const codigo = CODIGO_POR_SECCION[seccion.id];
        return !codigo || concedidos.has(codigo);
    });
}

export function momentosPermitidos(permisos) {
    if (!Array.isArray(permisos)) return clinicalMoments;
    const visibles = new Set(seccionesPermitidas(permisos).map((seccion) => seccion.id));
    return clinicalMoments
        .map((momento) => ({
            ...momento,
            sections: momento.sections.filter((id) => visibles.has(id)),
        }))
        .filter((momento) => momento.sections.length > 0);
}
