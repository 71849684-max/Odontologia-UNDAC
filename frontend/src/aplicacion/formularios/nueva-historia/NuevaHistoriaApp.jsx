import React, { useState } from 'react';
import { Search, UserPlus } from 'lucide-react';
import { Field, SelectField, SectionCard } from '../compartidos/ControlesClinicos.jsx';
import { registrarHistoriaDesdeFormulario } from '../../servicios/registroHistoriaClinica.js';

<<<<<<< HEAD
export default function NuevaHistoriaApp({ onCreated, onNavigate }) {
    const [form, setForm] = useState({});
    const [error, setError] = useState('');
    const set = (key) => (value) => setForm((current) => ({ ...current, [key]: value }));
    const create = () => {
        try {
            const historia = registrarHistoriaDesdeFormulario(form);
            setError('');
            onCreated?.(historia);
        } catch {
            setError('No fue posible registrar la historia clínica. Revise el almacenamiento e inténtelo nuevamente.');
        }
    };
=======
function datosIniciales(paciente = {}) {
    return {
        dni: paciente.dni ?? '',
        nombres: paciente.nombres ?? '',
        nacimiento: paciente.fechaNacimiento ?? '',
        sexo: paciente.sexo ?? '',
        celular: paciente.telefono ?? '',
        email: paciente.correo ?? '',
    };
}

export default function NuevaHistoriaApp({ onCreated, onNavigate, pacienteInicial }) {
    const [form, setForm] = useState(() => datosIniciales(pacienteInicial));
    const set = (key) => (value) => setForm((current) => ({ ...current, [key]: value }));
    const [mensaje, setMensaje] = useState('');
    const create = () => setMensaje('El registro de historias estará disponible cuando el módulo clínico se conecte a la base de datos.');
>>>>>>> 68f9ee0cdb3126a8a4cedcd77484ffa134ac8628

    return <div className="hc-page hc-new-record space-y-5">
        <header><p className="hc-kicker">Nuevo registro</p><h1 className="hc-page-title">Nueva historia clínica</h1><p className="hc-page-subtitle">Busque al paciente o registre únicamente los datos mínimos para abrir su historia clínica.</p></header>
        <SectionCard title="Datos mínimos del paciente" subtitle="Al crear, se abrirá Ingreso y filiación para completar la información clínica restante.">
            <label className="hc-search hc-search--large"><Search size={18} /><input placeholder="Buscar por nombre o documento..." /></label>
            <div className="hc-inline-callout"><span><UserPlus size={20} /></span><div><strong>¿Paciente nuevo?</strong><small>Complete los datos mínimos. El operador y la supervisión se asociarán desde la atención clínica.</small></div></div>
            <div className="undac-form-grid mt-5"><Field label="DNI" value={form.dni} onChange={set('dni')} /><Field label="Apellidos y nombres" value={form.nombres} onChange={set('nombres')} className="undac-col-2" /><Field label="Fecha de nacimiento" type="date" value={form.nacimiento} onChange={set('nacimiento')} /><SelectField label="Sexo" value={form.sexo} onChange={set('sexo')} options={['M','F']} /><Field label="N.º de celular" value={form.celular} onChange={set('celular')} /><Field label="Correo electrónico" type="email" value={form.email} onChange={set('email')} /></div>
        </SectionCard>
<<<<<<< HEAD
        {error ? <p className="hc-form-error" role="alert">{error}</p> : null}
        <div className="hc-form-actions"><button type="button" className="hc-button hc-button--ghost" onClick={() => onNavigate?.('inicio')}>Cancelar</button><button type="button" className="hc-button hc-button--primary" onClick={create}><Check size={17} /> Crear y abrir historia <ChevronRight size={17} /></button></div>
=======
        {mensaje ? <p className="hc-inline-callout" role="status">{mensaje}</p> : null}
        <div className="hc-form-actions"><button type="button" className="hc-button hc-button--ghost" onClick={() => onNavigate?.('inicio')}>Cancelar</button><button type="button" className="hc-button hc-button--primary" onClick={create}>Crear historia</button></div>
>>>>>>> 68f9ee0cdb3126a8a4cedcd77484ffa134ac8628
    </div>;
}
