import { healthQuestions } from '../../../formularios/cuestionario-salud/cuestionario-salud.config.mjs';

const texto = (valor) => String(valor ?? '').trim();
const vacio = (valor) => (Array.isArray(valor) ? valor.length === 0 : texto(valor) === '');
const numero = (valor) => {
  const limpio = texto(valor).replace(',', '.');
  if (limpio === '' || !/^-?\d+(\.\d+)?$/.test(limpio)) return null;
  return Number(limpio);
};
const hoyIso = () => new Date().toISOString().slice(0, 10);

/**
 * IMC = peso (kg) / talla (m)². La talla se acepta en metros (1.65) o centímetros (165).
 */
export function calcularImc(peso, talla) {
  const kg = numero(peso);
  let metros = numero(talla);
  if (kg === null || metros === null || kg <= 0 || metros <= 0) return null;
  if (metros > 3) metros /= 100;
  if (metros < 0.4 || metros > 2.5 || kg > 400) return null;
  const valor = Math.round((kg / (metros * metros)) * 10) / 10;
  const categoria = valor < 18.5 ? 'Bajo peso' : valor < 25 ? 'Normal' : valor < 30 ? 'Sobrepeso' : 'Obesidad';
  return { valor, categoria };
}

/**
 * Cambios derivados que mantienen la sección coherente cuando se edita un campo.
 * Devuelve solo las claves adicionales que deben actualizarse.
 */
export function cambiosCoherentes(seccion, valores = {}, clave, valor) {
  const cambios = {};
  if (seccion === 'cuestionario-salud') {
    if (clave === 'q20Answer' && valor !== 'Sí') {
      if (!vacio(valores.q21Answer)) cambios.q21Answer = '';
      if (!vacio(valores.q21Detail)) cambios.q21Detail = '';
    }
  }
  if (seccion === 'antecedentes') {
    const conteos = ['hijosNumero', 'hijosVivos', 'hijosFallecidos'];
    if (clave === 'ningunHijo' && valor === 'Sí') {
      conteos.forEach((campo) => { if (!vacio(valores[campo])) cambios[campo] = ''; });
    }
    if (conteos.includes(clave) && (numero(valor) ?? 0) > 0 && valores.ningunHijo === 'Sí') {
      cambios.ningunHijo = 'No';
    }
  }
  return cambios;
}

/** Preguntas del cuestionario visibles según las respuestas previas. */
export function preguntaVisible(numeroPregunta, valores = {}) {
  if (numeroPregunta === 21) return valores.q20Answer === 'Sí';
  return true;
}

function requerido(errores, valores, clave, etiqueta) {
  if (vacio(valores[clave])) errores.push({ campo: clave, mensaje: `${etiqueta} es obligatorio.` });
}

/**
 * Campos mínimos para marcar una sección como completa.
 * @returns {{campo: string, mensaje: string}[]}
 */
export function validarSeccion(seccion, valores = {}) {
  const errores = [];
  switch (seccion) {
    case 'datos-paciente': {
      requerido(errores, valores, 'dni', 'El DNI');
      requerido(errores, valores, 'nombres', 'Los nombres');
      requerido(errores, valores, 'apellidos', 'Los apellidos');
      requerido(errores, valores, 'sexo', 'El sexo');
      requerido(errores, valores, 'fechaNacimiento', 'La fecha de nacimiento');
      const dni = texto(valores.dni);
      if (dni && !/^\d{8}$/.test(dni) && (!valores.tipoDocumento || valores.tipoDocumento === 'DNI')) {
        errores.push({ campo: 'dni', mensaje: 'El DNI debe tener 8 dígitos.' });
      }
      if (texto(valores.fechaNacimiento) > hoyIso()) {
        errores.push({ campo: 'fechaNacimiento', mensaje: 'La fecha de nacimiento no puede ser futura.' });
      }
      break;
    }
    case 'anamnesis':
      requerido(errores, valores, 'motivoConsulta', 'El motivo de consulta');
      requerido(errores, valores, 'historiaEnfermedad', 'La historia de la enfermedad actual');
      break;
    case 'cuestionario-salud':
      healthQuestions.forEach((pregunta) => {
        if (!preguntaVisible(pregunta.number, valores)) return;
        const respuesta = valores[`q${pregunta.number}Answer`];
        if (vacio(respuesta)) {
          errores.push({ campo: `q${pregunta.number}Answer`, mensaje: `Responda la pregunta ${pregunta.number}.` });
        } else if (respuesta === 'Sí' && vacio(valores[`q${pregunta.number}Detail`])) {
          errores.push({ campo: `q${pregunta.number}Detail`, mensaje: `Detalle la respuesta positiva de la pregunta ${pregunta.number}.` });
        }
      });
      break;
    case 'antecedentes':
      if (valores.alergiaMedicamento === 'Sí') requerido(errores, valores, 'alergiaMedicamentoDetalle', 'El medicamento al que es alérgico');
      if (valores.medicacionActual === 'Sí') requerido(errores, valores, 'medicacionActualNombre', 'El nombre de la medicación actual');
      if (valores.ningunHijo !== 'Sí' && numero(valores.hijosNumero) !== null) {
        const total = numero(valores.hijosNumero);
        const suma = (numero(valores.hijosVivos) ?? 0) + (numero(valores.hijosFallecidos) ?? 0);
        if (suma > total) errores.push({ campo: 'hijosNumero', mensaje: 'Hijos vivos y fallecidos no pueden superar el número de hijos.' });
      }
      break;
    case 'examen-clinico': {
      ['peso', 'talla', 'temperatura', 'frecuenciaRespiratoria', 'pulso', 'frecuenciaCardiaca'].forEach((campo) => {
        if (!vacio(valores[campo]) && numero(valores[campo]) === null) {
          errores.push({ campo, mensaje: `Ingrese un número válido en ${campo === 'frecuenciaRespiratoria' ? 'F.R.' : campo === 'frecuenciaCardiaca' ? 'F.C.' : campo}.` });
        }
      });
      const t = numero(valores.temperatura);
      if (t !== null && (t < 30 || t > 45)) errores.push({ campo: 'temperatura', mensaje: 'La temperatura debe estar entre 30 y 45 °C.' });
      if (!vacio(valores.presionArterial) && !/^\d{2,3}\s*\/\s*\d{2,3}$/.test(texto(valores.presionArterial))) {
        errores.push({ campo: 'presionArterial', mensaje: 'La presión arterial debe tener el formato 120/80.' });
      }
      if (!vacio(valores.peso) && !vacio(valores.talla) && !calcularImc(valores.peso, valores.talla)) {
        errores.push({ campo: 'talla', mensaje: 'Revise peso (kg) y talla (m o cm): el IMC resultante no es válido.' });
      }
      break;
    }
    case 'diagnostico':
      if (vacio(valores.dxPresuntivo) && vacio(valores.dxDefinitivo)) {
        errores.push({ campo: 'dxPresuntivo', mensaje: 'Registre al menos un diagnóstico presuntivo o definitivo.' });
      }
      if (vacio(valores.pronosticoEstructurado) && vacio(valores.pronostico)) {
        errores.push({ campo: 'pronosticoEstructurado', mensaje: 'El pronóstico es obligatorio.' });
      }
      break;
    case 'consentimiento':
      requerido(errores, valores, 'intervencionAutorizada', 'La intervención autorizada');
      requerido(errores, valores, 'fecha', 'La fecha del consentimiento');
      if (!valores.firmaPaciente && !valores.huellaDactilar) {
        errores.push({ campo: 'firmaPaciente', mensaje: 'Se requiere la firma o la huella del paciente.' });
      }
      break;
    case 'reporte-operatorio': {
      requerido(errores, valores, 'fecha', 'La fecha de la intervención');
      const inicio = texto(valores.horaInicio);
      const termino = texto(valores.horaTermino);
      if (inicio && termino && termino <= inicio) {
        errores.push({ campo: 'horaTermino', mensaje: 'La hora de término debe ser posterior a la de inicio.' });
      }
      break;
    }
    default:
      break;
  }
  return errores;
}
