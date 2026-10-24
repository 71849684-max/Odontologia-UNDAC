import { formatearFecha, formatearFechaHora } from '../../../utilidades/fechas.mjs';

export const VACIO = '—';
export const SIN_REGISTRO = 'Sin registro';

/** Convierte cualquier valor clínico en texto imprimible. */
export function texto(valor, respaldo = VACIO) {
  if (Array.isArray(valor)) return valor.length ? valor.join(', ') : respaldo;
  const limpio = String(valor ?? '').trim();
  return limpio || respaldo;
}

/** Mantiene el texto vacío como cadena para poder decidir si se muestra el bloque. */
export function textoOpcional(valor) {
  if (Array.isArray(valor)) return valor.filter(Boolean).join(', ');
  return String(valor ?? '').trim();
}

/** Marca una opción simple o varias opciones. */
export function marcar(valor, opciones = []) {
  const seleccionados = Array.isArray(valor) ? valor : [valor];
  return opciones.map((opcion) => ({
    etiqueta: opcion,
    marcado: seleccionados.some((item) => String(item) === String(opcion)),
  }));
}

export function marcarSiNo(valor) {
  return marcar(valor, ['Sí', 'No']);
}

export function sexoLegible(valor) {
  if (valor === 'M' || valor === 'Masculino') return 'Masculino';
  if (valor === 'F' || valor === 'Femenino') return 'Femenino';
  return textoOpcional(valor);
}

export function nombrePaciente(datosPaciente = {}, patient = {}) {
  const nombres = textoOpcional(datosPaciente.nombres);
  const apellidos = textoOpcional(datosPaciente.apellidos);
  if (apellidos && nombres) return `${apellidos}, ${nombres}`;
  if (apellidos || nombres) return `${apellidos} ${nombres}`.trim();
  return texto(patient.nombres);
}

/** Adapta el estado de la historia a los datos comunes de cualquier documento. */
export function datosImpresion({ patient = {}, history = {}, meta = {}, formData = {} }) {
  const datosPaciente = formData['datos-paciente'] ?? {};
  const personal = datosPaciente.personal ?? {};
  const fechaRegistro = datosPaciente.fechaPaciente || history.fecha || '';
  return {
    paciente: {
      nombreCompleto: nombrePaciente(datosPaciente, patient),
      dni: textoOpcional(datosPaciente.dni) || textoOpcional(patient.dni) || VACIO,
      edad: textoOpcional(datosPaciente.edad) || textoOpcional(patient.edad),
      sexo: sexoLegible(datosPaciente.sexo || patient.sexo),
      fechaNacimiento: formatearFecha(datosPaciente.fechaNacimiento || patient.fechaNacimiento),
      historia: textoOpcional(history.codigo) || VACIO,
      fechaRegistro: formatearFechaHora(fechaRegistro),
      telefono: textoOpcional(datosPaciente.celular) || textoOpcional(patient.telefono),
      correo: textoOpcional(datosPaciente.correo) || textoOpcional(patient.correo),
      domicilio: textoOpcional(datosPaciente.domicilio) || textoOpcional(patient.direccion),
      distrito: textoOpcional(datosPaciente.distrito),
      provincia: textoOpcional(datosPaciente.provincia),
      departamento: textoOpcional(datosPaciente.departamento),
    },
    operador: {
      nombre: textoOpcional(personal.nombre) || textoOpcional(datosPaciente.operador) || textoOpcional(history.operador) || VACIO,
      docente: textoOpcional(meta?.docente) || textoOpcional(history.docente) || VACIO,
      semestre: textoOpcional(personal.semestre) || textoOpcional(meta?.semestre),
      anioAcademico: textoOpcional(meta?.anioAcademico),
      cop: textoOpcional(personal.cop) || textoOpcional(meta?.cop),
      fechaRegistro: formatearFechaHora(fechaRegistro),
    },
    generadoEn: formatearFechaHora(new Date()),
  };
}

export function edadDesdeFecha(fecha, referencia = new Date()) {
  const partes = String(fecha ?? '').slice(0, 10).split('-').map(Number);
  if (partes.length !== 3 || partes.some((valor) => !Number.isFinite(valor))) return '';
  const [anio, mes, dia] = partes;
  const nacimiento = new Date(anio, mes - 1, dia);
  if (nacimiento.getMonth() !== mes - 1 || nacimiento.getDate() !== dia) return '';
  let edad = referencia.getFullYear() - anio;
  const diferenciaMes = referencia.getMonth() - (mes - 1);
  if (diferenciaMes < 0 || (diferenciaMes === 0 && referencia.getDate() < dia)) edad -= 1;
  return edad >= 0 ? String(edad) : '';
}

export function calcularImc(peso, talla) {
  const pesoNumero = Number(peso);
  let tallaNumero = Number(talla);
  if (!pesoNumero || !tallaNumero) return '';
  if (tallaNumero > 3) tallaNumero /= 100;
  if (!tallaNumero) return '';
  return (pesoNumero / (tallaNumero * tallaNumero)).toFixed(1);
}
