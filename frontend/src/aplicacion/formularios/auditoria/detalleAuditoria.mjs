import { clinicalSections } from '../../configuracion/historiaClinica.config.mjs';

const CAMPOS = {
    asistente_responsable: 'Asistente responsable', profesional_encargado: 'Profesional encargado',
    personal: 'Personal asignado', estado: 'Estado', observacion: 'Observación',
    secciones: 'Secciones', seccion: 'Sección', codigo: 'Código', historia: 'Historia clínica',
    motivoConsulta: 'Motivo de consulta', enfermedadActual: 'Enfermedad actual',
    tamano: 'Tamaño del archivo (bytes)', nombre: 'Nombre', campo: 'Campo',
    ...Object.fromEntries(clinicalSections.map(seccion => [seccion.id, seccion.label])),
};
const ESTADOS = {
    'not-started': 'Sin iniciar', 'in-progress': 'En progreso', complete: 'Completado',
    review: 'En revisión', approved: 'Validado', VALIDADA: 'Validada', OBSERVADA: 'Observada',
    BORRADOR: 'Borrador', EN_PROCESO: 'En proceso', PENDIENTE_REVISION: 'Pendiente de revisión',
    activa: 'Activa', inactiva: 'Inactiva',
};

export function agenteLegible(agente) {
    if (!agente) return 'No registrado';
    const navegador = [['Edg/', 'Microsoft Edge'], ['OPR/', 'Opera'], ['Firefox/', 'Firefox'], ['Chrome/', 'Chrome'], ['Version/', 'Safari']]
        .map(([patron, nombre]) => ({ nombre, version: agente.match(new RegExp(`${patron}(\\d+)`))?.[1] }))
        .find(item => item.version);
    const sistema = /Android/i.test(agente) ? 'Android' : /iPhone|iPad/i.test(agente) ? 'iOS' : /Windows/i.test(agente) ? 'Windows' : /Macintosh|Mac OS/i.test(agente) ? 'macOS' : /Linux/i.test(agente) ? 'Linux' : 'sistema no identificado';
    return navegador ? `${navegador.nombre} ${navegador.version} · ${sistema}` : 'Navegador no identificado';
}

function etiqueta(campo) {
    return CAMPOS[campo] ?? String(campo).replace(/([a-záéíóúñ])([A-Z])/g, '$1 $2').replaceAll('_', ' ').replaceAll('-', ' ').replace(/^./, letra => letra.toUpperCase());
}

export function valoresLegibles(valor, ruta = '') {
    if (valor == null || valor === '' || (typeof valor === 'object' && !Object.keys(valor).length)) return [{ etiqueta: ruta, valor: 'No registrado' }];
    if (typeof valor === 'object') return Object.entries(valor).flatMap(([clave, dato]) => {
        const nombre = Array.isArray(valor) ? `Elemento ${Number(clave) + 1}` : etiqueta(clave);
        const camino = [ruta, nombre].filter(Boolean).join(' · ');
        if (/contrasena|contraseña|password|token|secreto/i.test(clave)) return [{ etiqueta: camino, valor: 'Dato protegido' }];
        return valoresLegibles(dato, camino);
    });
    let texto = typeof valor === 'boolean' ? (valor ? 'Sí' : 'No') : ESTADOS[valor] ?? CAMPOS[valor] ?? String(valor);
    const personal = texto.match(/^(ALUMNO|DOCENTE)-(\d+)$/);
    if (personal) texto = `${personal[1] === 'ALUMNO' ? 'Asistente' : 'Profesional encargado'} (identificador ${personal[2]}; nombre no registrado)`;
    return [{ etiqueta: ruta, valor: texto }];
}
