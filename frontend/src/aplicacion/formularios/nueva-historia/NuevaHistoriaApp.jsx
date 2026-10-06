import React, { useEffect, useState } from 'react';
import { Check, ChevronRight, Search, UserPlus } from 'lucide-react';
import { Field, SelectField, SectionCard } from '../compartidos/ControlesClinicos.jsx';
import { registrarHistoriaDesdeFormulario } from '../../servicios/registroHistoriaClinica.js';
import { abrirHistoria, listarHistoriasRemotas, mensajeError } from '../../servicios/servicioClinico.js';

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

export default function NuevaHistoriaApp({ onCreated, onNavigate, pacienteInicial }) {
    const [form, setForm] = useState(() => datosIniciales(pacienteInicial));
    const [error, setError] = useState('');
    const [usaApi, setUsaApi] = useState(false);
    useEffect(() => {
        let vigente = true;
        listarHistoriasRemotas().then(() => { if (vigente) setUsaApi(true); }).catch(() => {});
        return () => { vigente = false; };
    }, []);
    const set = (key) => (value) => setForm((current) => ({ ...current, [key]: value }));
    const create = () => {
        if (usaApi) {
            abrirHistoria({ ...form, pacienteId: pacienteInicial?.id })
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
        <SectionCard title="Datos mínimos del paciente" subtitle="Al crear, se abrirá Ingreso y filiación para completar la información clínica restante.">
            <label className="hc-search hc-search--large"><Search size={18} /><input placeholder="Buscar por nombre o documento..." /></label>
            <div className="hc-inline-callout"><span><UserPlus size={20} /></span><div><strong>¿Paciente nuevo?</strong><small>Complete los datos mínimos. El operador y la supervisión se asociarán desde la atención clínica.</small></div></div>
            <div className="undac-form-grid mt-5"><Field label="DNI" value={form.dni} onChange={set('dni')} /><Field label="Apellidos y nombres" value={form.nombres} onChange={set('nombres')} className="undac-col-2" /><Field label="Fecha de nacimiento" type="date" value={form.nacimiento} onChange={set('nacimiento')} /><SelectField label="Sexo" value={form.sexo} onChange={set('sexo')} options={['M','F']} /><Field label="N.º de celular" value={form.celular} onChange={set('celular')} /><Field label="Correo electrónico" type="email" value={form.email} onChange={set('email')} /></div>
        </SectionCard>
        {error ? <p className="hc-form-error" role="alert">{error}</p> : null}
        <div className="hc-form-actions"><button type="button" className="hc-button hc-button--ghost" onClick={() => onNavigate?.('inicio')}>Cancelar</button><button type="button" className="hc-button hc-button--primary" onClick={create}>Crear historia <Check size={17} /> <ChevronRight size={17} /></button></div>
    </div>;
}
