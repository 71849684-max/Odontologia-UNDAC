/** Formato de presentación institucional: Día/Mes/Año (Perú). */

const RE_ISO_FECHA = /^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2})(?::(\d{2}))?)?/;
const RE_DISPLAY_FECHA = /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?$/;

function pad(n) {
  return String(n).padStart(2, '0');
}

function fechaValida(anio, mes, dia) {
  if (!Number.isInteger(anio) || !Number.isInteger(mes) || !Number.isInteger(dia)) return false;
  if (mes < 1 || mes > 12 || dia < 1 || dia > 31) return false;
  const fecha = new Date(anio, mes - 1, dia);
  return fecha.getFullYear() === anio && fecha.getMonth() === mes - 1 && fecha.getDate() === dia;
}

/** Extrae partes de ISO / MySQL sin usar el huso UTC del navegador. */
export function partesFecha(valor) {
  if (valor == null || valor === '') return null;
  if (valor instanceof Date && !Number.isNaN(valor.getTime())) {
    return {
      anio: valor.getFullYear(),
      mes: valor.getMonth() + 1,
      dia: valor.getDate(),
      hora: valor.getHours(),
      minuto: valor.getMinutes(),
    };
  }
  const texto = String(valor).trim();
  const iso = texto.match(RE_ISO_FECHA);
  if (iso) {
    return {
      anio: Number(iso[1]),
      mes: Number(iso[2]),
      dia: Number(iso[3]),
      hora: iso[4] != null ? Number(iso[4]) : null,
      minuto: iso[5] != null ? Number(iso[5]) : null,
    };
  }
  const display = texto.match(RE_DISPLAY_FECHA);
  if (display) {
    return {
      anio: Number(display[3]),
      mes: Number(display[2]),
      dia: Number(display[1]),
      hora: display[4] != null ? Number(display[4]) : null,
      minuto: display[5] != null ? Number(display[5]) : null,
    };
  }
  const nativo = new Date(texto);
  if (!Number.isNaN(nativo.getTime())) {
    return {
      anio: nativo.getFullYear(),
      mes: nativo.getMonth() + 1,
      dia: nativo.getDate(),
      hora: nativo.getHours(),
      minuto: nativo.getMinutes(),
    };
  }
  return null;
}

/** DD/MM/AAAA */
export function formatearFecha(valor) {
  const p = partesFecha(valor);
  if (!p || !fechaValida(p.anio, p.mes, p.dia)) return valor ? String(valor) : '';
  return `${pad(p.dia)}/${pad(p.mes)}/${p.anio}`;
}

/** DD/MM/AAAA HH:mm */
export function formatearFechaHora(valor) {
  const p = partesFecha(valor);
  if (!p || !fechaValida(p.anio, p.mes, p.dia)) return valor ? String(valor) : '';
  if (p.hora == null || p.minuto == null) return formatearFecha(valor);
  return `${pad(p.dia)}/${pad(p.mes)}/${p.anio} ${pad(p.hora)}:${pad(p.minuto)}`;
}

/**
 * Inserta las barras de dd/mm/aaaa mientras se escribe.
 * `anterior` permite borrar la barra sin que vuelva a aparecer al instante.
 */
export function enmascararFecha(valor, opciones = {}) {
  const conHora = opciones === true || opciones?.conHora === true;
  const anterior = typeof opciones === 'object' ? String(opciones.anterior ?? '') : '';
  const crudo = String(valor ?? '');
  if (!crudo.trim()) return '';

  const iso = crudo.trim().match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2}))?$/);
  if (iso) {
    let fecha = `${iso[3]}/${iso[2]}/${iso[1]}`;
    if (conHora && iso[4] != null) fecha += ` ${iso[4]}:${iso[5]}`;
    return fecha;
  }

  const borrando = anterior !== '' && crudo.length < anterior.length;
  const [fechaParte, horaParte = ''] = crudo.trim().split(/\s+/, 2);
  const bloques = fechaParte.split('/');
  let dia = '';
  let mes = '';
  let anio = '';
  let hora = '';
  let minuto = '';

  if (conHora && bloques.length === 1 && !crudo.includes(':') && !crudo.includes(' ')) {
    const digitos = bloques[0].replace(/\D/g, '').slice(0, 12);
    dia = digitos.slice(0, 2);
    mes = digitos.slice(2, 4);
    anio = digitos.slice(4, 8);
    hora = digitos.slice(8, 10);
    minuto = digitos.slice(10, 12);
  } else if (bloques.length >= 3) {
    dia = bloques[0].replace(/\D/g, '').slice(0, 2);
    mes = bloques[1].replace(/\D/g, '').slice(0, 2);
    anio = bloques.slice(2).join('').replace(/\D/g, '').slice(0, 4);
  } else if (bloques.length === 2) {
    dia = bloques[0].replace(/\D/g, '').slice(0, 2);
    const resto = bloques[1].replace(/\D/g, '');
    mes = resto.slice(0, 2);
    anio = resto.slice(2, 6);
  } else {
    const digitos = bloques[0].replace(/\D/g, '').slice(0, 8);
    dia = digitos.slice(0, 2);
    mes = digitos.slice(2, 4);
    anio = digitos.slice(4, 8);
  }

  const hayMes = mes.length > 0 || anio.length > 0 || bloques.length > 1;
  const diaRecienCompleto = !borrando && dia.length === 2 && bloques.length === 1 && mes.length === 0 && anio.length === 0;
  let salida = dia;
  if (hayMes || diaRecienCompleto) salida += `/${mes}`;

  const hayAnio = anio.length > 0 || bloques.length > 2;
  const mesRecienCompleto = !borrando && mes.length === 2 && anio.length === 0 && bloques.length < 3;
  if (hayAnio || mesRecienCompleto) salida += `/${anio}`;

  if (!conHora) return salida;

  if (!hora && !minuto && (horaParte || crudo.includes(':'))) {
    if (horaParte.includes(':')) {
      const partesHora = horaParte.split(':');
      hora = (partesHora[0] || '').replace(/\D/g, '').slice(0, 2);
      minuto = (partesHora[1] || '').replace(/\D/g, '').slice(0, 2);
    } else {
      const digitosHora = horaParte.replace(/\D/g, '').slice(0, 4);
      hora = digitosHora.slice(0, 2);
      minuto = digitosHora.slice(2, 4);
    }
  }
  if (!hora && !minuto) return salida;
  salida += ` ${hora}`;
  if (minuto || horaParte.includes(':') || (!borrando && hora.length === 2)) salida += `:${minuto}`;
  return salida;
}

/** La fecha ya tiene día, mes y año (y hora, si corresponde). */
export function fechaCompleta(valor, conHora = false) {
  const texto = String(valor ?? '').trim();
  if (conHora) {
    return /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})$/.test(texto)
      || /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(texto);
  }
  return /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.test(texto) || /^\d{4}-\d{2}-\d{2}$/.test(texto);
}

/** Convierte texto dd/mm/aaaa (u ISO) a YYYY-MM-DD. */
export function aIsoFecha(valor) {
  if (valor == null || String(valor).trim() === '') return '';
  const p = partesFecha(valor);
  if (!p || !fechaValida(p.anio, p.mes, p.dia)) return null;
  return `${p.anio}-${pad(p.mes)}-${pad(p.dia)}`;
}

/** Convierte texto dd/mm/aaaa hh:mm (u ISO) a YYYY-MM-DDTHH:mm. */
export function aIsoFechaHora(valor) {
  if (valor == null || String(valor).trim() === '') return '';
  const p = partesFecha(valor);
  if (!p || !fechaValida(p.anio, p.mes, p.dia)) return null;
  const hora = p.hora == null ? 0 : p.hora;
  const minuto = p.minuto == null ? 0 : p.minuto;
  if (hora < 0 || hora > 23 || minuto < 0 || minuto > 59) return null;
  return `${p.anio}-${pad(p.mes)}-${pad(p.dia)}T${pad(hora)}:${pad(minuto)}`;
}

export function dentroDeRangoIso(iso, min, max) {
  if (!iso) return true;
  if (min && iso < min) return false;
  if (max && iso > max) return false;
  return true;
}
