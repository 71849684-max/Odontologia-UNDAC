import React, { useState } from 'react';
import { Check, ChevronRight, Search, UserPlus } from 'lucide-react';
import '../../css/aplicacion/historia-clinica.css';
import { Field, SelectField, SectionCard } from '../componentes/clinica/ControlesClinicos.jsx';

export default function NuevaHistoriaApp({ onCreated, onNavigate }) {
    const [form, setForm] = useState({});
    const set = (key) => (value) => setForm((current) => ({ ...current, [key]: value }));
    const create = () => onCreated?.({ id: `mock-${Date.now()}`, ...form });

    return <div className="hc-page hc-new-record space-y-5">
        <header><p className="hc-kicker">Nuevo registro</p><h1 className="hc-page-title">Nueva historia clínica</h1><p className="hc-page-subtitle">Flujo guiado para iniciar la Historia Clínica sin conectar todavía con el backend.</p></header>
        <ol className="hc-stepper"><li className="is-current"><span>1</span><strong>Paciente</strong></li><li><span>2</span><strong>Datos iniciales</strong></li><li><span>3</span><strong>Confirmar</strong></li><li><span>4</span><strong>Crear</strong></li></ol>
        <SectionCard title="Buscar o registrar paciente" subtitle="El prototipo conserva los datos únicamente en memoria.">
            <label className="hc-search hc-search--large"><Search size={18} /><input placeholder="Buscar por nombre o documento..." /></label>
            <div className="hc-inline-callout"><span><UserPlus size={20} /></span><div><strong>¿Paciente nuevo?</strong><small>Complete los datos mínimos para crear la historia.</small></div></div>
            <div className="undac-form-grid mt-5"><Field label="DNI" value={form.dni} onChange={set('dni')} /><Field label="Apellidos y nombres" value={form.nombres} onChange={set('nombres')} className="undac-col-2" /><Field label="Fecha de nacimiento" type="date" value={form.nacimiento} onChange={set('nacimiento')} /><SelectField label="Sexo" value={form.sexo} onChange={set('sexo')} options={['M','F']} /><Field label="N.º de celular" value={form.celular} onChange={set('celular')} /><Field label="Correo electrónico" type="email" value={form.email} onChange={set('email')} /></div>
        </SectionCard>
        <SectionCard title="Contexto académico" subtitle="Datos vinculados con el operador y la supervisión docente."><div className="undac-form-grid"><Field label="Apellidos y nombres del operador" value={form.operador} onChange={set('operador')} className="undac-col-2" /><Field label="Semestre" value={form.semestre} onChange={set('semestre')} /><Field label="Año académico" value={form.anio} onChange={set('anio')} /><Field label="Docente" value={form.docente} onChange={set('docente')} /><Field label="C.O.P." value={form.cop} onChange={set('cop')} /></div></SectionCard>
        <div className="hc-form-actions"><button type="button" className="hc-button hc-button--ghost" onClick={() => onNavigate?.('inicio')}>Cancelar</button><button type="button" className="hc-button hc-button--primary" onClick={create}><Check size={17} /> Crear historia <ChevronRight size={17} /></button></div>
    </div>;
}
