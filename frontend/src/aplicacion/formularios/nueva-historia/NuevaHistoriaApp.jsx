import React, { useEffect, useState } from 'react';
import { Check, ChevronRight, Search, UserPlus } from 'lucide-react';
import { Field, SelectField, SectionCard } from '../compartidos/ControlesClinicos.jsx';
import { listarPacientesLocales, registrarHistoriaDesdeFormulario } from '../../servicios/registroHistoriaClinica.js';
import { abrirHistoria, buscarPacientePorDocumento, listarHistoriasRemotas, listarPacientes, mensajeError } from '../../servicios/servicioClinico.js';

function datosIniciales(paciente) {
    const origen = paciente ?? {};
    return {
        dni: origen.dni ?? '',
        nombres: origen.nombres ?? '',
        nacimiento: origen.fechaNacimiento ?? '',
        sexo: origen.sexo ?? '',
        celular: origen.telefono ?? '',
        email: origen.correo ?? '',
    };
}

const normalizar = (texto) => String(texto ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

export default function NuevaHistoriaApp({ onCreated, onNavigate, pacienteInicial }) {
    const [form, setForm] = useState(() => datosIniciales(pacienteInicial));
    const [error, setError] = useState('');
    const [usaApi, setUsaApi] = useState(false);
    const [busqueda, setBusqueda] = useState('');
    const [resultados, setResultados] = useState([]);
    const [seleccionado, setSeleccionado] = useState(pacienteInicial ?? null);
    useEffect(() => {
        let vigente = true;
        listarHistoriasRemotas().then(() => { if (vigente) setUsaApi(true); }).catch(() => {});
        return () => { vigente = false; };
    }, []);
    useEffect(() => {
        const termino = busqueda.trim();
        if (termino.length < 2) {
            setResultados([]);
            return undefined;
        }
        if (!usaApi) {
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
    }, [busqueda, usaApi]);
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
        if (usaApi) {
            abrirHistoria({ ...form, pacienteId: seleccionado?.id })
                .then((historia) => { setError(''); onCreated?.(historia); })
                .catch((err) => setError(mensajeError(err, 'No fue posible registrar la historia clínica.')));
            return;
        }
        try {
            const historia = registrarHistoriaDesdeFormulario(form);
            setError('');
            onCreated?.(historia);
        } catch {
            setError('No fue posible registrar la historia clínica. Revise el almacenamiento e inténtelo nuevamente.');
        }
    };

    return <div className="hc-page hc-new-record space-y-5">
        <header><p className="hc-kicker">Nuevo registro</p><h1 className="hc-page-title">Nueva historia clínica</h1><p className="hc-page-subtitle">Busque al paciente o registre únicamente los datos mínimos para abrir su historia clínica.</p></header>
        {!usaApi ? <p className="hc-local-banner" role="status">Sin conexión al servidor; los datos no se guardaron en la clínica.</p> : null}
        <SectionCard title="Datos mínimos del paciente" subtitle="Al crear, se abrirá Ingreso y filiación para completar la información clínica restante.">
            <label className="hc-search hc-search--large"><Search size={18} /><span className="sr-only">Buscar paciente registrado</span><input type="search" maxLength={120} value={busqueda} onChange={(event) => setBusqueda(event.target.value)} placeholder="Nombre de sus pacientes, o DNI exacto de cualquier registrado..." /></label>
            {busqueda.trim().length >= 2 && <div className="hc-personal-search__results" aria-live="polite" aria-label="Pacientes encontrados">
                {resultados.length ? resultados.map((paciente) => <button type="button" key={paciente.id} onClick={() => elegir(paciente)}>
                    <strong>{paciente.nombres}</strong><span>DNI {paciente.dni || '—'}{paciente.hc ? ` · ${paciente.hc}` : ''}</span>
                </button>) : <p>No se encontraron pacientes asignados. Pruebe el DNI exacto o registre los datos mínimos abajo.</p>}
            </div>}
            {seleccionado?.id
                ? <div className="hc-inline-callout" role="status"><span><Check size={20} /></span><div><strong>Paciente registrado seleccionado</strong><small>Se abrirá una nueva historia para {seleccionado.nombres}. Cambie el DNI para registrar a otra persona.</small></div></div>
                : <div className="hc-inline-callout"><span><UserPlus size={20} /></span><div><strong>¿Paciente nuevo?</strong><small>Complete los datos mínimos. El operador y la supervisión se asociarán desde la atención clínica.</small></div></div>}
            <div className="undac-form-grid mt-5"><Field label="DNI" value={form.dni} onChange={set('dni')} /><Field label="Apellidos y nombres" value={form.nombres} onChange={set('nombres')} className="undac-col-2" /><Field label="Fecha de nacimiento" type="date" value={form.nacimiento} onChange={set('nacimiento')} /><SelectField label="Sexo" value={form.sexo} onChange={set('sexo')} options={['M','F']} /><Field label="N.º de celular" value={form.celular} onChange={set('celular')} /><Field label="Correo electrónico" type="email" value={form.email} onChange={set('email')} /></div>
        </SectionCard>
        {error ? <p className="hc-form-error" role="alert">{error}</p> : null}
        <div className="hc-form-actions"><button type="button" className="hc-button hc-button--ghost" onClick={() => onNavigate?.('inicio')}>Cancelar</button><button type="button" className="hc-button hc-button--primary" onClick={create}>Crear historia <Check size={17} /> <ChevronRight size={17} /></button></div>
    </div>;
}
