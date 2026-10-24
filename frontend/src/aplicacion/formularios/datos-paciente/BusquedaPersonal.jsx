import React, { useEffect, useRef, useState } from 'react';
import { Search, UserRound } from 'lucide-react';
import { Field } from '../compartidos/ControlesClinicos.jsx';
import { listarPersonal } from '../../servicios/servicioClinico.js';
import { etiquetaRol } from '../../configuracion/etiquetasRoles.js';
import { formatearFecha, formatearFechaHora, partesFecha } from '../../utilidades/fechas.mjs';

const normalizar = (texto) => String(texto ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const mostrarFecha = (fecha) => {
  if (!fecha) return '—';
  const partes = partesFecha(fecha);
  if (!partes) return '—';
  return partes.hora != null ? formatearFechaHora(fecha) : formatearFecha(fecha);
};

export default function BusquedaPersonal({ value, onChange, meta, fecha }) {
  const [busqueda, setBusqueda] = useState('');
  const [personal, setPersonal] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const contenedor = useRef(null);
  const terminos = normalizar(busqueda).split(/\s+/).filter(Boolean);
  useEffect(() => {
    const texto = busqueda.trim();
    if (texto.length < 2) {
      setPersonal([]);
      return undefined;
    }
    let vigente = true;
    setBuscando(true);
    const temporizador = setTimeout(() => {
      listarPersonal(texto.split(/\s+/)[0])
        .then((lista) => { if (vigente) setPersonal(lista); })
        .catch(() => { if (vigente) setPersonal([]); })
        .finally(() => { if (vigente) setBuscando(false); });
    }, 250);
    return () => { vigente = false; clearTimeout(temporizador); };
  }, [busqueda]);
  const resultados = terminos.length ? personal.filter((persona) => terminos.every((termino) => normalizar(`${persona.dni} ${persona.nombre}`).includes(termino))) : [];

  return <div className="hc-personal-search" ref={contenedor}>
    <div className="hc-personal-search__input">
      <Search size={16} aria-hidden="true" />
      <Field label="Buscar personal por DNI o nombres / apellidos" type="search" value={busqueda} onChange={setBusqueda} placeholder={value?.nombre || 'Escriba el DNI, nombres o apellidos'} />
      {value && <button type="button" className="hc-personal-change" onClick={() => { setBusqueda(''); onChange(null); contenedor.current?.querySelector('input')?.focus(); }}>Cambiar</button>}
    </div>
    {terminos.length > 0 && <div className="hc-personal-search__results" aria-live="polite">
      {resultados.length ? resultados.map((persona) => <button type="button" key={persona.id} onClick={() => { onChange(persona); setBusqueda(''); }}>
        <strong>{persona.nombre}</strong><span>DNI {persona.dni} · {etiquetaRol(persona.rol, persona.rol)}</span>
      </button>) : <p>{buscando || busqueda.trim().length < 2 ? 'Escriba al menos 2 caracteres…' : 'No se encontró personal con esos datos.'}</p>}
    </div>}
    {value ? <div className="hc-operator-summary" role="status" aria-label="Personal seleccionado">
      <div className="hc-operator-identity"><span className="hc-operator-avatar"><UserRound size={24} aria-hidden="true" /></span><div><strong>{value.nombre}</strong><span className="hc-operator-role">{etiquetaRol(value.rol, value.rol)}</span><small>Responsable de la historia clínica</small></div></div>
      <dl>{[['DNI', value.dni], ['C.O.P.', value.cop || 'No registrado'], ['Semestre', value.semestre || meta?.semestre], ['Año académico', meta?.anioAcademico], ['Fecha y hora de registro', mostrarFecha(fecha)], ['Profesional encargado', meta?.docente]].map(([label, dato]) => <div key={label}><dt>{label}</dt><dd>{dato || '—'}</dd></div>)}</dl>
    </div> : <div className="hc-operator-empty"><UserRound size={20} aria-hidden="true" /><span>Seleccione al asistente responsable para ver su ficha.</span></div>}
  </div>;
}
