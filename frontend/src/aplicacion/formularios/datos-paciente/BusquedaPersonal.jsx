import React, { useRef, useState } from 'react';
import { Search, UserRound } from 'lucide-react';
import { Field } from '../compartidos/ControlesClinicos.jsx';
import { mockUsuarios } from '../../configuracion/datosMock.mjs';

const personal = mockUsuarios.map((usuario, index) => ({ ...usuario, dni: `7100000${index + 1}` }));
const normalizar = (texto) => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const mostrarFecha = (fecha) => fecha ? fecha.split('-').reverse().join('/') : '—';

export default function BusquedaPersonal({ value, onChange, meta, fecha }) {
  const [busqueda, setBusqueda] = useState('');
  const contenedor = useRef(null);
  const terminos = normalizar(busqueda).split(/\s+/).filter(Boolean);
  const resultados = terminos.length ? personal.filter((persona) => terminos.every((termino) => normalizar(`${persona.dni} ${persona.nombre}`).includes(termino))) : [];

  return <div className="hc-personal-search" ref={contenedor}>
    <div className="hc-personal-search__input">
      <Search size={16} aria-hidden="true" />
      <Field label="Buscar personal por DNI o nombres / apellidos" type="search" value={busqueda} onChange={setBusqueda} placeholder={value?.nombre || 'Escriba el DNI, nombres o apellidos'} />
      {value && <button type="button" className="hc-personal-change" onClick={() => { setBusqueda(''); onChange(null); contenedor.current?.querySelector('input')?.focus(); }}>Cambiar</button>}
    </div>
    {terminos.length > 0 && <div className="hc-personal-search__results" aria-live="polite">
      {resultados.length ? resultados.map((persona) => <button type="button" key={persona.id} onClick={() => { onChange(persona); setBusqueda(''); }}>
        <strong>{persona.nombre}</strong><span>DNI {persona.dni} · {persona.rol}</span>
      </button>) : <p>No se encontró personal con esos datos.</p>}
    </div>}
    {value ? <div className="hc-operator-summary" role="status" aria-label="Personal seleccionado">
      <div className="hc-operator-identity"><span className="hc-operator-avatar"><UserRound size={24} aria-hidden="true" /></span><div><strong>{value.nombre}</strong><span className="hc-operator-role">{value.rol}</span><small>Responsable de la historia clínica</small></div></div>
      <dl>{[['DNI', value.dni], ['C.O.P.', value.cop || 'No registrado'], ['Semestre', value.semestre || meta?.semestre], ['Año académico', meta?.anioAcademico], ['Fecha de registro', mostrarFecha(fecha)], ['Docente', meta?.docente]].map(([label, dato]) => <div key={label}><dt>{label}</dt><dd>{dato || '—'}</dd></div>)}</dl>
    </div> : <div className="hc-operator-empty"><UserRound size={20} aria-hidden="true" /><span>Seleccione al operador para ver su ficha.</span></div>}
  </div>;
}
