import React, { useEffect, useState } from 'react';
import { Check, Search, UserPlus, X } from 'lucide-react';
import { Field, SelectField } from '../compartidos/ControlesClinicos.jsx';
import { listarPacientesLocales, registrarHistoriaDesdeFormulario } from '../../servicios/registroHistoriaClinica.js';
import { abrirHistoria, buscarPacientePorDocumento, listarHistoriasRemotas, listarPacientes, mensajeError } from '../../servicios/servicioClinico.js';

function nombresDePila(paciente) {
  const completo = String(paciente?.nombres ?? '').trim();
  const apellidos = [paciente?.apellidoPaterno, paciente?.apellidoMaterno].filter(Boolean).join(' ').trim();
  return apellidos && completo.endsWith(apellidos) ? completo.slice(0, -apellidos.length).trim() : completo;
}

function datosIniciales(paciente) {
  const origen = paciente ?? {};
  return {
    dni: origen.dni ?? '',
    nombres: nombresDePila(origen),
    apellidoPaterno: origen.apellidoPaterno ?? '',
    apellidoMaterno: origen.apellidoMaterno ?? '',
    nacimiento: origen.fechaNacimiento ?? '',
    sexo: origen.sexo ?? '',
    celular: origen.telefono ?? '',
    email: origen.correo ?? '',
  };
}

const normalizar = (texto) => String(texto ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

export default function NuevaHistoriaModal({ open, onClose, onCreated, pacienteInicial = null }) {
  const [form, setForm] = useState(() => datosIniciales(pacienteInicial));
  const [error, setError] = useState('');
  const [usaApi, setUsaApi] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const [seleccionado, setSeleccionado] = useState(pacienteInicial);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    setForm(datosIniciales(pacienteInicial));
    setSeleccionado(pacienteInicial);
    setBusqueda('');
    setResultados([]);
    setError('');
    setEnviando(false);
    let vigente = true;
    listarHistoriasRemotas()
      .then(() => { if (vigente) setUsaApi(true); })
      .catch(() => { if (vigente) setUsaApi(false); });
    return () => { vigente = false; };
  }, [open, pacienteInicial]);

  useEffect(() => {
    if (!open) return undefined;
    const termino = busqueda.trim();
    if (termino.length < 2) {
      setResultados([]);
      return undefined;
    }
    if (usaApi !== true) {
      const partes = normalizar(termino).split(/\s+/);
      setResultados(listarPacientesLocales().filter((item) => partes.every((parte) => normalizar(`${item.nombres} ${item.dni}`).includes(parte))).slice(0, 8));
      return undefined;
    }
    let vigente = true;
    const temporizador = setTimeout(() => {
      const documentoExacto = /^\d{8,20}$/.test(termino.replace(/\s+/g, ''));
      const documento = termino.replace(/\s+/g, '');
      listarPacientes({ q: termino })
        .then(async (lista) => {
          if (!vigente) return;
          if (lista.length || !documentoExacto) {
            setResultados(lista.slice(0, 8));
            return;
          }
          try {
            const ficha = await buscarPacientePorDocumento(documento);
            if (vigente) setResultados(ficha ? [ficha] : []);
          } catch {
            if (vigente) setResultados([]);
          }
        })
        .catch(() => { if (vigente) setResultados([]); });
    }, 250);
    return () => { vigente = false; clearTimeout(temporizador); };
  }, [busqueda, usaApi, open]);

  if (!open) return null;

  const set = (key) => (value) => {
    if (key === 'dni' && seleccionado && value !== seleccionado.dni) setSeleccionado(null);
    setForm((current) => ({ ...current, [key]: value }));
  };
  const elegir = (paciente) => {
    setSeleccionado(paciente);
    setForm(datosIniciales(paciente));
    setBusqueda('');
    setResultados([]);
  };
  const create = () => {
    setEnviando(true);
    setError('');
    const payload = {
      ...form,
      nombres: form.nombres.trim(),
      apellidoPaterno: form.apellidoPaterno.trim(),
      apellidoMaterno: form.apellidoMaterno.trim(),
      pacienteId: seleccionado?.id,
    };
    if (usaApi) {
      abrirHistoria(payload)
        .then((historia) => { onCreated?.(historia); onClose?.(); })
        .catch((err) => setError(mensajeError(err, 'No fue posible registrar la historia clínica.')))
        .finally(() => setEnviando(false));
      return;
    }
    try {
      const historia = registrarHistoriaDesdeFormulario(payload);
      onCreated?.(historia);
      onClose?.();
    } catch {
      setError('No fue posible registrar la historia clínica. Revise el almacenamiento e inténtelo nuevamente.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="admin-dialogo-fondo" role="presentation" onClick={() => !enviando && onClose?.()}>
      <div className="admin-dialogo admin-dialogo--nueva-historia" role="dialog" aria-modal="true" aria-labelledby="titulo-nueva-historia" onClick={(event) => event.stopPropagation()}>
        <header className="admin-dialogo__cabecera">
          <div>
            <h2 id="titulo-nueva-historia">Nueva historia clínica</h2>
            <p className="admin-dialogo__subtitulo">Busque un paciente registrado o complete los datos mínimos.</p>
          </div>
          <button type="button" className="hc-mini-button" aria-label="Cerrar" disabled={enviando} onClick={onClose}><X size={16} /></button>
        </header>
        {usaApi === false ? <p className="hc-local-banner" role="status">Sin conexión al servidor; los datos no se guardaron en la clínica.</p> : null}
        <label className="hc-search hc-search--large"><Search size={18} /><span className="sr-only">Buscar paciente registrado</span><input type="search" maxLength={120} value={busqueda} onChange={(event) => setBusqueda(event.target.value)} placeholder="Nombre de sus pacientes, o DNI exacto de cualquier registrado..." /></label>
        {busqueda.trim().length >= 2 && <div className="hc-personal-search__results" aria-live="polite" aria-label="Pacientes encontrados">
          {resultados.length ? resultados.map((paciente) => <button type="button" key={paciente.id} onClick={() => elegir(paciente)}>
            <strong>{paciente.nombres}</strong><span>DNI {paciente.dni || '—'}{paciente.hc ? ` · ${paciente.hc}` : ''}</span>
          </button>) : <p>No se encontraron pacientes asignados. Pruebe el DNI exacto o registre los datos mínimos abajo.</p>}
        </div>}
        {seleccionado?.id
          ? <div className="hc-inline-callout" role="status"><span><Check size={20} /></span><div><strong>Paciente registrado seleccionado</strong><small>Se abrirá una nueva historia para {seleccionado.nombres}.</small></div></div>
          : <div className="hc-inline-callout"><span><UserPlus size={20} /></span><div><strong>¿Paciente nuevo?</strong><small>Complete los datos mínimos para abrir su historia.</small></div></div>}
        <div className="undac-form-grid mt-4">
          <Field label="DNI" value={form.dni} onChange={set('dni')} />
          <Field label="Nombres" value={form.nombres} onChange={set('nombres')} />
          <Field label="Apellido paterno" value={form.apellidoPaterno} onChange={set('apellidoPaterno')} />
          <Field label="Apellido materno" value={form.apellidoMaterno} onChange={set('apellidoMaterno')} />
          <Field label="Fecha de nacimiento" type="date" value={form.nacimiento} onChange={set('nacimiento')} />
          <SelectField label="Sexo" value={form.sexo} onChange={set('sexo')} options={['M', 'F']} />
          <Field label="N.º de celular" value={form.celular} onChange={set('celular')} />
          <Field label="Correo electrónico" type="email" value={form.email} onChange={set('email')} />
        </div>
        {error ? <p className="hc-form-error" role="alert">{error}</p> : null}
        <footer className="admin-dialogo__acciones">
          <button type="button" className="hc-button hc-button--ghost" disabled={enviando} onClick={onClose}>Cancelar</button>
          <button type="button" className="hc-button hc-button--primary" disabled={enviando} onClick={create}>Crear historia</button>
        </footer>
      </div>
    </div>
  );
}
