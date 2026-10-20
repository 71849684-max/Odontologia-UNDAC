import { clienteHttp, ErrorHttp } from './clienteHttp.js';
import { consentParagraphs } from '../formularios/consentimiento/consentimiento.config.mjs';

const enPrueba = import.meta.env?.VITEST === true;

export function sinRedEnPrueba() {
    if (enPrueba) throw new TypeError('El entorno de prueba no consulta el servidor.');
}

export function esFalloDeRed(error) {
    return !(error instanceof ErrorHttp);
}

export function mensajeError(error, respaldo) {
    if (error instanceof ErrorHttp) {
        const primero = Object.values(error.errores ?? {})[0];
        const texto = Array.isArray(primero) ? primero[0] : primero;
        return texto || error.message || respaldo;
    }

    return error?.mensaje || error?.message || respaldo;
}

export function idHistoria(valor) {
    if (typeof valor === 'number' && Number.isInteger(valor) && valor > 0) return valor;
    if (typeof valor === 'string' && /^\d+$/.test(valor)) return Number(valor);
    return null;
}

function nombresDePila(paciente) {
    const apellidos = [paciente.apellidoPaterno, paciente.apellidoMaterno].filter(Boolean).join(' ').trim();
    const completo = String(paciente.nombres ?? '').trim();
    if (apellidos && completo.endsWith(apellidos)) {
        return completo.slice(0, -apellidos.length).trim();
    }

    return completo;
}

function consulta(filtros = {}) {
    const entradas = Object.entries(filtros).filter(([, valor]) => valor !== undefined && valor !== null && String(valor).trim() !== '');
    return entradas.length ? `?${new URLSearchParams(entradas.map(([clave, valor]) => [clave, String(valor).trim()])).toString()}` : '';
}

export async function listarPacientes(filtros = {}) {
    sinRedEnPrueba();
    const cuerpo = await clienteHttp.obtener(`/pacientes${consulta(filtros)}`);
    return cuerpo?.data ?? [];
}

/** Coincide exacto por número de documento (no exige asignación previa). */
export async function buscarPacientePorDocumento(documento, tipoDocumento = 'DNI') {
    sinRedEnPrueba();
    return clienteHttp.obtener(`/pacientes/buscar${consulta({ documento, tipoDocumento })}`);
}

function cuerpoPaciente(paciente) {
    return {
        nombres: nombresDePila(paciente),
        apellidoPaterno: paciente.apellidoPaterno,
        apellidoMaterno: paciente.apellidoMaterno,
        tipoDocumento: paciente.tipoDocumento,
        numeroDocumento: paciente.numeroDocumento || paciente.dni,
        fechaNacimiento: paciente.fechaNacimiento || paciente.nacimiento || null,
        sexo: paciente.sexo,
        telefono: paciente.telefono || paciente.celular,
        correo: paciente.correo || paciente.email || null,
        direccion: paciente.direccion,
        ocupacion: paciente.ocupacion,
        observaciones: paciente.observaciones,
    };
}

export async function actualizarPaciente(id, paciente) {
    sinRedEnPrueba();
    return clienteHttp.actualizar(`/pacientes/${id}`, cuerpoPaciente(paciente));
}

export async function cambiarEstadoHistoria(historiaId, codigo, observacion) {
    sinRedEnPrueba();
    return clienteHttp.parchear(`/historias/${historiaId}/estado`, { codigo, observacion: observacion || null });
}

export async function listarPersonal(q) {
    sinRedEnPrueba();
    const cuerpo = await clienteHttp.obtener(`/personal${consulta({ q })}`);
    return cuerpo?.data ?? [];
}

export async function asignarPersonal(historiaId, personalId) {
    sinRedEnPrueba();
    return clienteHttp.actualizar(`/historias/${historiaId}/asignacion`, { personal: personalId });
}

export async function listarSeguimientos(q) {
    sinRedEnPrueba();
    const cuerpo = await clienteHttp.obtener(`/seguimientos${consulta({ q })}`);
    return cuerpo?.data ?? [];
}

export async function crearSeguimiento(historiaId, datos) {
    sinRedEnPrueba();
    return clienteHttp.enviar(`/historias/${historiaId}/seguimientos`, datos);
}

export async function actualizarSeguimiento(id, datos) {
    sinRedEnPrueba();
    const numerico = String(id).replace(/^(control|cirugia)-/, '');
    if (String(id).startsWith('cirugia-')) {
        return clienteHttp.parchear(`/programaciones/${numerico}`, datos);
    }
    return clienteHttp.parchear(`/seguimientos/${numerico}`, datos);
}

export async function actualizarProgramacion(id, datos) {
    sinRedEnPrueba();
    const numerico = String(id).replace(/^cirugia-/, '');
    return clienteHttp.parchear(`/programaciones/${numerico}`, datos);
}

export async function listarNotificaciones(limite = 50) {
    sinRedEnPrueba();
    const cuerpo = await clienteHttp.obtener(`/notificaciones${consulta({ limite })}`);
    return cuerpo?.data ?? [];
}

export async function marcarNotificacionLeida(id) {
    sinRedEnPrueba();
    return clienteHttp.parchear(`/notificaciones/${id}/leida`, {});
}

export async function marcarTodasNotificacionesLeidas() {
    sinRedEnPrueba();
    return clienteHttp.enviar('/notificaciones/leer-todas', {});
}

export async function crearPaciente(paciente) {
    sinRedEnPrueba();
    return clienteHttp.enviar('/pacientes', {
        nombres: nombresDePila(paciente),
        apellidoPaterno: paciente.apellidoPaterno,
        apellidoMaterno: paciente.apellidoMaterno,
        tipoDocumento: paciente.tipoDocumento,
        numeroDocumento: paciente.numeroDocumento || paciente.dni,
        dni: paciente.dni,
        fechaNacimiento: paciente.fechaNacimiento || paciente.nacimiento,
        sexo: paciente.sexo,
        telefono: paciente.telefono || paciente.celular,
        correo: paciente.correo || paciente.email,
        direccion: paciente.direccion,
        ocupacion: paciente.ocupacion,
        observaciones: paciente.observaciones,
        estado: paciente.estado,
    });
}

export async function listarHistoriasRemotas(filtros = {}) {
    sinRedEnPrueba();
    const cuerpo = await clienteHttp.obtener(`/historias${consulta(filtros)}`);
    return cuerpo?.data ?? [];
}

export async function abrirHistoria(datos) {
    sinRedEnPrueba();
    const pacienteId = idHistoria(datos.pacienteId ?? datos.paciente_id);
    return clienteHttp.enviar('/historias', {
        pacienteId: pacienteId ?? undefined,
        dni: datos.dni,
        nombres: datos.nombres,
        apellidoPaterno: datos.apellidoPaterno,
        apellidoMaterno: datos.apellidoMaterno,
        nacimiento: datos.nacimiento || datos.fechaNacimiento,
        sexo: datos.sexo,
        celular: datos.celular || datos.telefono,
        email: datos.email || datos.correo,
    });
}

export async function obtenerExpediente(historiaId) {
    sinRedEnPrueba();
    return clienteHttp.obtener(`/historias/${historiaId}/expediente`);
}

export function conTextosClausulas(formData) {
    const consentimiento = formData?.consentimiento;
    if (!consentimiento || typeof consentimiento !== 'object') return formData;
    const textosClausulas = Object.fromEntries(consentParagraphs.map((texto, indice) => [indice + 1, texto]));
    return { ...formData, consentimiento: { ...consentimiento, textosClausulas } };
}

export async function guardarExpediente(historiaId, formData, sectionStatus) {
    sinRedEnPrueba();
    return clienteHttp.actualizar(`/historias/${historiaId}/expediente`, {
        formData: conTextosClausulas(formData),
        sectionStatus,
    });
}

export async function subirArchivoClinico(historiaId, campo, archivo, nombre) {
    sinRedEnPrueba();
    const datos = new FormData();
    datos.append('campo', campo);
    datos.append('archivo', archivo, nombre ?? archivo.name);
    return clienteHttp.enviar(`/historias/${historiaId}/archivos`, datos);
}

export async function eliminarArchivoClinico(historiaId, archivoId) {
    sinRedEnPrueba();
    return clienteHttp.eliminar(`/historias/${historiaId}/archivos/${archivoId}`);
}

export async function inactivarHistoria(historiaId) {
    sinRedEnPrueba();
    return clienteHttp.eliminar(`/historias/${historiaId}`);
}

export async function obtenerOdontograma(historiaId) {
    sinRedEnPrueba();
    const cuerpo = await clienteHttp.obtener(`/historias/${historiaId}/odontograma`);
    return cuerpo?.registro ?? null;
}

export async function guardarOdontograma(historiaId, registro) {
    sinRedEnPrueba();
    return clienteHttp.actualizar(`/historias/${historiaId}/odontograma`, { registro });
}
