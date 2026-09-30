import { mockHistorias, mockPacientes } from '../configuracion/datosMock.mjs';

export const PACIENTES_STORAGE_KEY = 'undac:pacientes:frontend:v1';
export const HISTORIAS_STORAGE_KEY = 'undac:historias:frontend:v1';

let secuencia = 0;

function leerLista(clave) {
    if (typeof localStorage === 'undefined') return [];
    try {
        const datos = JSON.parse(localStorage.getItem(clave) || '[]');
        return Array.isArray(datos) ? datos : [];
    } catch {
        return [];
    }
}

function guardarLista(clave, lista) {
    localStorage.setItem(clave, JSON.stringify(lista));
}

function texto(valor) {
    return String(valor ?? '').trim();
}

function fechaHoy() {
    const hoy = new Date();
    return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
}

function calcularEdad(fechaNacimiento) {
    if (!fechaNacimiento) return '';
    const nacimiento = new Date(`${fechaNacimiento}T00:00:00`);
    if (Number.isNaN(nacimiento.getTime())) return '';
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const diferenciaMes = hoy.getMonth() - nacimiento.getMonth();
    if (diferenciaMes < 0 || (diferenciaMes === 0 && hoy.getDate() < nacimiento.getDate())) edad -= 1;
    return edad >= 0 ? edad : '';
}

function nuevoId(prefijo) {
    secuencia += 1;
    return `${prefijo}-${Date.now().toString(36)}-${secuencia.toString(36)}`;
}

export function listarPacientesLocales() {
    return leerLista(PACIENTES_STORAGE_KEY);
}

export function listarHistoriasLocales() {
    return leerLista(HISTORIAS_STORAGE_KEY);
}

export function listarHistorias() {
    return [...mockHistorias, ...listarHistoriasLocales()];
}

export function historiasDePaciente(pacienteId) {
    return listarHistorias().filter((item) => String(item.pacienteId ?? item.id) === String(pacienteId));
}

export function buscarHistoria(historiaId) {
    if (historiaId == null || historiaId === '') return null;
    return listarHistorias().find((item) => String(item.id) === String(historiaId)) ?? null;
}

export function buscarPacientePorDocumento(documento) {
    const dni = texto(documento);
    if (!dni) return null;
    return [...mockPacientes, ...listarPacientesLocales()].find((item) => texto(item.dni) === dni) ?? null;
}

export function pacienteDeHistoria(historia) {
    if (!historia) return null;
    const pacienteId = historia.pacienteId ?? historia.id;
    return mockPacientes.find((item) => String(item.id) === String(pacienteId))
        ?? listarPacientesLocales().find((item) => String(item.id) === String(pacienteId))
        ?? historia.pacienteRegistro
        ?? null;
}

function fichaPaciente(paciente) {
    return {
        id: paciente.id,
        nombres: paciente.nombres ?? '',
        dni: paciente.dni ?? '',
        edad: paciente.edad ?? '',
        sexo: paciente.sexo ?? '',
        telefono: paciente.telefono ?? '',
        correo: paciente.correo ?? paciente.email ?? '',
        fechaNacimiento: paciente.fechaNacimiento ?? paciente.nacimiento ?? '',
        apellidoPaterno: paciente.apellidoPaterno ?? '',
        apellidoMaterno: paciente.apellidoMaterno ?? '',
    };
}

function vincularHistoriaAlPaciente(paciente, historia) {
    const locales = listarPacientesLocales();
    const indice = locales.findIndex((item) => String(item.id) === String(paciente.id));
    if (indice < 0) return;
    locales[indice] = {
        ...locales[indice],
        hc: historia.codigo,
        historias: historiasDePaciente(paciente.id).length,
        ultimaAtencion: historia.fecha,
        estado: locales[indice].estado === 'Registrado' ? 'Borrador' : locales[indice].estado,
    };
    guardarLista(PACIENTES_STORAGE_KEY, locales);
}

export function registrarHistoriaClinica(paciente) {
    const locales = listarHistoriasLocales();
    const numero = mockHistorias.length + locales.length + 1;
    const historia = {
        id: nuevoId('hc'),
        pacienteId: paciente.id,
        codigo: `HC-2026-${String(numero).padStart(3, '0')}`,
        paciente: paciente.nombres ?? '',
        nombres: paciente.nombres ?? '',
        dni: paciente.dni ?? '',
        operador: '',
        docente: '',
        fecha: fechaHoy(),
        estado: 'Borrador',
        progreso: 0,
        pacienteRegistro: fichaPaciente(paciente),
    };
    guardarLista(HISTORIAS_STORAGE_KEY, [...locales, historia]);
    vincularHistoriaAlPaciente(paciente, historia);
    return historia;
}

export function registrarPacienteMinimo(form) {
    const paciente = {
        id: nuevoId('local'),
        nombres: texto(form.nombres),
        dni: texto(form.dni),
        edad: calcularEdad(form.nacimiento),
        sexo: form.sexo ?? '',
        telefono: form.celular ?? '',
        correo: form.email ?? '',
        fechaNacimiento: form.nacimiento ?? '',
        historias: 0,
        hc: '',
        ultimaAtencion: 'Sin atención',
        estado: 'Registrado',
    };
    guardarLista(PACIENTES_STORAGE_KEY, [...listarPacientesLocales(), paciente]);
    return paciente;
}

export function registrarHistoriaDesdeFormulario(form) {
    const paciente = buscarPacientePorDocumento(form.dni) ?? registrarPacienteMinimo(form);
    return registrarHistoriaClinica(paciente);
}
