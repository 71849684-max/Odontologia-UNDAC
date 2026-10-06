import { clienteHttp, ErrorHttp } from './clienteHttp.js';

const enPrueba = import.meta.env?.VITEST === true;

function sinRedEnPrueba() {
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

export async function listarPacientes() {
    sinRedEnPrueba();
    const cuerpo = await clienteHttp.obtener('/pacientes');
    return cuerpo?.data ?? [];
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

export async function listarHistoriasRemotas() {
    sinRedEnPrueba();
    const cuerpo = await clienteHttp.obtener('/historias');
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

export async function guardarExpediente(historiaId, formData, sectionStatus) {
    sinRedEnPrueba();
    return clienteHttp.actualizar(`/historias/${historiaId}/expediente`, {
        formData,
        sectionStatus,
    });
}

export async function guardarOdontograma(historiaId, registro) {
    sinRedEnPrueba();
    return clienteHttp.actualizar(`/historias/${historiaId}/odontograma`, { registro });
}
