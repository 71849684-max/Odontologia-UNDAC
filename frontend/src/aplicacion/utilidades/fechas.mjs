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
