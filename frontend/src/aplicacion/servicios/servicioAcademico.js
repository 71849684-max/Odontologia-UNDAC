import { clienteHttp, ErrorHttp } from './clienteHttp.js';
import { sinRedEnPrueba } from './servicioClinico.js';
import * as local from './repositorioAcademicoLocal.js';

let remoto = null;

function estadoVacio() {
    return {
        personas: [], cursos: [], periodos: [], grupos: [], membresias: [],
        rotaciones: [], docentesRotacion: [], asignacionesExcepcionales: [],
    };
}

export async function sincronizarAcademico() {
    sinRedEnPrueba();
    try {
        remoto = await clienteHttp.obtener('/academico');
        return true;
    } catch (error) {
        remoto = null;
        throw error instanceof ErrorHttp ? error : new ErrorHttp(
            'No se pudo cargar la información académica. Compruebe la conexión y reintente.',
        );
    }
}

export function obtenerEstadoAcademico() {
    const perfiles = local.obtenerEstadoAcademico();
    const datos = remoto ?? estadoVacio();

    return {
        personas: datos.personas ?? [],
        cursos: datos.cursos ?? [],
        periodos: datos.periodos ?? [],
        grupos: datos.grupos ?? [],
        membresias: datos.membresias ?? [],
        rotaciones: datos.rotaciones ?? [],
        docentesRotacion: datos.docentesRotacion ?? [],
        asignacionesExcepcionales: datos.asignacionesExcepcionales ?? [],
        aviso: datos.aviso ?? '',
        perfiles: perfiles.perfiles ?? {},
        perfil: perfiles.perfil,
    };
}

async function enServidor(accion, coleccion) {
    let resultado;
    try {
        resultado = await accion();
    } catch (error) {
        throw error instanceof ErrorHttp ? error : new ErrorHttp(
            'No se pudo confirmar el guardado con el servidor. Compruebe la conexión y revise el listado antes de volver a guardar.',
        );
    }
    // La respuesta de escritura ya confirma la persistencia en el servidor.
    const confirmado = { ...(remoto ?? estadoVacio()) };
    confirmado[coleccion] = [...(confirmado[coleccion] ?? [])];
    for (const guardado of Array.isArray(resultado) ? resultado : [resultado]) {
        const indice = confirmado[coleccion].findIndex((item) => item.id === guardado.id);
        if (indice < 0) confirmado[coleccion].push(guardado);
        else confirmado[coleccion][indice] = guardado;
    }
    try {
        await sincronizarAcademico();
    } catch {
        remoto = {
            ...confirmado,
            aviso: 'Los cambios se guardaron en el servidor, pero no se pudo actualizar el listado completo. Recargue la vista para actualizarlo.',
        };
    }
    return resultado;
}

export async function crearPeriodo(datos) {
    sinRedEnPrueba();
    return enServidor(() => clienteHttp.enviar('/academico/periodos', datos), 'periodos');
}

export async function crearCurso(datos) {
    sinRedEnPrueba();
    return enServidor(() => clienteHttp.enviar('/academico/cursos', datos), 'cursos');
}

export async function actualizarCurso(cursoId, datos) {
    sinRedEnPrueba();
    return enServidor(() => clienteHttp.actualizar(`/academico/cursos/${cursoId}`, datos), 'cursos');
}

export async function crearGrupo(datos) {
    sinRedEnPrueba();
    return enServidor(() => clienteHttp.enviar('/academico/grupos', datos), 'grupos');
}

export async function actualizarGrupo(grupoId, datos) {
    sinRedEnPrueba();
    return enServidor(() => clienteHttp.actualizar(`/academico/grupos/${grupoId}`, datos), 'grupos');
}

export async function guardarMembresias(grupoId, membresias) {
    sinRedEnPrueba();
    return enServidor(
        () => clienteHttp.enviar(`/academico/grupos/${grupoId}/miembros`, { membresias }),
        'membresias',
    );
}

export async function finalizarMembresia(membresiaId, fechaFin) {
    sinRedEnPrueba();
    return enServidor(
        () => clienteHttp.parchear(`/academico/miembros/${membresiaId}`, { fechaFin }),
        'membresias',
    );
}

export async function crearRotacion(datos) {
    sinRedEnPrueba();
    return enServidor(() => clienteHttp.enviar('/academico/rotaciones', datos), 'rotaciones');
}

export async function guardarDocentesRotacion(rotacionId, docentes) {
    sinRedEnPrueba();
    return enServidor(
        () => clienteHttp.enviar(`/academico/rotaciones/${rotacionId}/docentes`, { docentes }),
        'docentesRotacion',
    );
}

export async function guardarAsignacionesExcepcionales(rotacionId, personas) {
    sinRedEnPrueba();
    return enServidor(
        () => clienteHttp.enviar(`/academico/rotaciones/${rotacionId}/alumnos`, { personas }),
        'asignacionesExcepcionales',
    );
}

export function actualizarPerfil(datos) {
    return local.actualizarPerfil(datos);
}
