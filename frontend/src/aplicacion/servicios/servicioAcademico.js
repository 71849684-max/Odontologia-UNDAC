import { clienteHttp, ErrorHttp } from './clienteHttp.js';
import * as local from './repositorioAcademicoLocal.js';

const enPrueba = import.meta.env?.VITEST === true;

let remoto = null;

function esRed(error) {
    return !(error instanceof ErrorHttp);
}

export async function sincronizarAcademico() {
    if (enPrueba) {
        remoto = null;
        return false;
    }
    try {
        remoto = await clienteHttp.obtener('/academico');
        return true;
    } catch (error) {
        if (esRed(error)) {
            remoto = null;
            return false;
        }

        remoto = {
            personas: [],
            cursos: [],
            periodos: [],
            grupos: [],
            membresias: [],
            rotaciones: [],
            docentesRotacion: [],
            asignacionesExcepcionales: [],
        };
        throw error;
    }
}

export function obtenerEstadoAcademico() {
    const perfiles = local.obtenerEstadoAcademico();
    if (!remoto) return perfiles;

    return {
        personas: remoto.personas ?? [],
        cursos: remoto.cursos ?? [],
        periodos: remoto.periodos ?? [],
        grupos: remoto.grupos ?? [],
        membresias: remoto.membresias ?? [],
        rotaciones: remoto.rotaciones ?? [],
        docentesRotacion: remoto.docentesRotacion ?? [],
        asignacionesExcepcionales: remoto.asignacionesExcepcionales ?? [],
        perfiles: perfiles.perfiles ?? {},
        perfil: perfiles.perfil,
    };
}

async function enServidor(accion, localFn) {
    if (!remoto) return localFn();

    try {
        const resultado = await accion();
        await sincronizarAcademico();
        return resultado;
    } catch (error) {
        if (esRed(error)) {
            remoto = null;
            return localFn();
        }
        throw error;
    }
}

export function crearPeriodo(datos) {
    return enServidor(() => clienteHttp.enviar('/academico/periodos', datos), () => local.crearPeriodo(datos));
}

export function crearCurso(datos) {
    return enServidor(() => clienteHttp.enviar('/academico/cursos', datos), () => local.crearCurso(datos));
}

export function actualizarCurso(cursoId, datos) {
    return enServidor(() => clienteHttp.actualizar(`/academico/cursos/${cursoId}`, datos), () => local.actualizarCurso(cursoId, datos));
}

export function crearGrupo(datos) {
    return enServidor(() => clienteHttp.enviar('/academico/grupos', datos), () => local.crearGrupo(datos));
}

export function actualizarGrupo(grupoId, datos) {
    return enServidor(() => clienteHttp.actualizar(`/academico/grupos/${grupoId}`, datos), () => local.actualizarGrupo(grupoId, datos));
}

export function guardarMembresias(grupoId, membresias) {
    return enServidor(
        () => clienteHttp.enviar(`/academico/grupos/${grupoId}/miembros`, { membresias }),
        () => local.guardarMembresias(grupoId, membresias),
    );
}

export function finalizarMembresia(membresiaId, fechaFin) {
    return enServidor(
        () => clienteHttp.parchear(`/academico/miembros/${membresiaId}`, { fechaFin }),
        () => local.finalizarMembresia(membresiaId, fechaFin),
    );
}

export function crearRotacion(datos) {
    return enServidor(() => clienteHttp.enviar('/academico/rotaciones', datos), () => local.crearRotacion(datos));
}

export function guardarDocentesRotacion(rotacionId, docentes) {
    return enServidor(
        () => clienteHttp.enviar(`/academico/rotaciones/${rotacionId}/docentes`, { docentes }),
        () => local.guardarDocentesRotacion(rotacionId, docentes),
    );
}

export function guardarAsignacionesExcepcionales(rotacionId, personas) {
    return enServidor(
        () => clienteHttp.enviar(`/academico/rotaciones/${rotacionId}/alumnos`, { personas }),
        () => local.guardarAsignacionesExcepcionales(rotacionId, personas),
    );
}

export function actualizarPerfil(datos) {
    return local.actualizarPerfil(datos);
}
