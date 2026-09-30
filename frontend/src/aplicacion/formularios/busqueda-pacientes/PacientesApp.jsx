<<<<<<< HEAD
import { useCallback, useMemo, useRef, useState } from 'react';
import { ClipboardPlus, Search, UserPlus, X } from 'lucide-react';
import { mockPacientes } from '../../configuracion/datosMock.mjs';
=======
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Search, UserPlus, X } from 'lucide-react';
import { historiasClinicas, pacientesClinicos } from '../../configuracion/datosClinicos.mjs';
>>>>>>> 68f9ee0cdb3126a8a4cedcd77484ffa134ac8628
import { StatusBadge } from '../compartidos/ControlesClinicos.jsx';
import EstadoVacio from '../../componentes/interfaz/EstadoVacio.jsx';
import PacienteForm from '../registro-paciente/PacienteForm.jsx';
import useModalDialog from '../../componentes/interfaz/useModalDialog.js';
<<<<<<< HEAD
import { historiasDePaciente, listarPacientesLocales, PACIENTES_STORAGE_KEY, registrarHistoriaClinica } from '../../servicios/registroHistoriaClinica.js';
=======

const STORAGE_KEY = 'undac:pacientes:frontend:v1';
>>>>>>> 68f9ee0cdb3126a8a4cedcd77484ffa134ac8628

export default function PacientesApp({ onNavigate }) {
    const [query, setQuery] = useState('');
    const [estado, setEstado] = useState('');
<<<<<<< HEAD
    const [localPatients, setLocalPatients] = useState(listarPacientesLocales);
=======
    const [localPatients, setLocalPatients] = useState([]);
>>>>>>> 68f9ee0cdb3126a8a4cedcd77484ffa134ac8628
    const [formularioAbierto, setFormularioAbierto] = useState(false);
    const patientTriggerRef = useRef(null);
    const cerrarFormulario = useCallback(() => setFormularioAbierto(false), []);
    const patientDialogRef = useModalDialog(formularioAbierto, cerrarFormulario, patientTriggerRef);
    const patients = useMemo(() => [...pacientesClinicos, ...localPatients], [localPatients]);
    useEffect(() => {
        localStorage.removeItem(STORAGE_KEY);
    }, []);
    const filtered = useMemo(() => patients.filter((item) => {
        const coincide = `${item.nombres} ${item.dni} ${item.hc}`.toLowerCase().includes(query.toLowerCase());
        return coincide && (!estado || item.estado === estado);
    }), [patients, query, estado]);
    const go = (target) => typeof onNavigate === 'function' ? onNavigate(target) : window.onNavigate?.(target);

<<<<<<< HEAD
    function abrirNuevaHistoria(patient) {
        try {
            const historia = registrarHistoriaClinica(patient);
            setLocalPatients(listarPacientesLocales());
            setPersistenciaError('');
            go({ view: 'historia', historiaId: historia.id, section: 'datos-paciente' });
        } catch {
            setPersistenciaError('No fue posible registrar la historia clínica. Revise el almacenamiento e inténtelo nuevamente.');
        }
    }

    function guardarPaciente(patient) {
        const actualizados = [...localPatients, patient];
        try {
            localStorage.setItem(PACIENTES_STORAGE_KEY, JSON.stringify(actualizados));
            setLocalPatients(actualizados);
            setPersistenciaError('');
            cerrarFormulario();
        } catch {
            setPersistenciaError('No fue posible guardar el paciente en este navegador. Revise el almacenamiento e inténtelo nuevamente.');
        }
=======
    function guardarPaciente(patient, { crearHistoria = false } = {}) {
        const actualizados = [...localPatients, patient];
        setLocalPatients(actualizados);
        cerrarFormulario();
        if (crearHistoria) go({ view: 'nueva-historia', paciente: patient });
>>>>>>> 68f9ee0cdb3126a8a4cedcd77484ffa134ac8628
    }

    return <div className="hc-page space-y-5">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><p className="hc-kicker">Gestión clínica</p><h1 className="hc-page-title">Pacientes</h1><p className="hc-page-subtitle">Gestión de pacientes registrados en la Clínica Odontológica Universitaria.</p></div><button ref={patientTriggerRef} type="button" className="hc-button hc-button--primary" onClick={() => setFormularioAbierto(true)}><UserPlus size={17} /> Nuevo paciente</button></header>
        <section className="hc-compact-stats" aria-label="Resumen de pacientes"><article><strong>{patients.length}</strong><small>Registrados</small></article><article><strong>{patients.filter((item) => item.estado === 'En proceso').length}</strong><small>En atención</small></article><article><strong>{patients.filter((item) => item.estado === 'Pendiente de revisión').length}</strong><small>Por revisar</small></article></section>
        <div className="hc-filterbar"><label className="hc-search"><Search size={17} /><span className="sr-only">Buscar paciente</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nombre, DNI o código..." /></label><div className="hc-filter-actions"><label className="hc-select-filter"><span>Estado</span><select value={estado} onChange={(e) => setEstado(e.target.value)}><option value="">Todos</option>{[...new Set(patients.map((item) => item.estado))].map((item) => <option key={item}>{item}</option>)}</select></label><span>{filtered.length} pacientes</span></div></div>
<<<<<<< HEAD
        {persistenciaError && !formularioAbierto ? <p className="hc-form-error" role="alert">{persistenciaError}</p> : null}
        {filtered.length ? <div className="hc-table-card"><table className="hc-table"><thead><tr><th>Paciente</th><th>DNI</th><th>Edad</th><th>Teléfono</th><th>Historias</th><th>Estado</th><th>Última atención</th><th>Acciones</th></tr></thead><tbody>{filtered.map((patient) => { const historiasPaciente = historiasDePaciente(patient.id); const historia = historiasPaciente.at(-1) ?? null; const tieneHistoria = historiasPaciente.length > 0; return <tr key={patient.id}><td data-label="Paciente"><div className="hc-person"><span className="hc-avatar">{patient.nombres.split(' ').slice(0, 2).map((p) => p[0]).join('')}</span><span><strong>{patient.nombres}</strong><small>{historia?.codigo || patient.hc || 'Sin historia'} · {patient.sexo}</small></span></div></td><td data-label="DNI">{patient.dni}</td><td data-label="Edad">{patient.edad === '' ? '—' : `${patient.edad} años`}</td><td data-label="Teléfono">{patient.telefono || '—'}</td><td data-label="Historias">{historiasPaciente.length}</td><td data-label="Estado"><StatusBadge status={patient.estado} /></td><td data-label="Última atención">{historia?.fecha ?? patient.ultimaAtencion ?? 'Sin atención'}</td><td data-label="Acciones"><div className="hc-row-actions">{tieneHistoria ? <button type="button" className="hc-mini-button" onClick={() => go({ view: 'historia', historiaId: historia.id, section: 'datos-paciente' })}>Ver</button> : null}<button type="button" className="hc-mini-button" onClick={() => abrirNuevaHistoria(patient)}>Nueva HC</button></div></td></tr>;})}</tbody></table></div> : <EstadoVacio titulo="No se encontraron pacientes" descripcion="Ajusta la búsqueda o el filtro para consultar otros registros." />}
        {formularioAbierto ? <div className="hc-patient-dialog-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) cerrarFormulario(); }}><section ref={patientDialogRef} className="hc-patient-dialog" role="dialog" aria-modal="true" aria-labelledby="registrar-paciente-title"><header><div><h2 id="registrar-paciente-title">Registrar nuevo paciente</h2><p>Este registro no crea una historia clínica.</p></div><button type="button" className="hc-mini-button" aria-label="Cerrar" onClick={cerrarFormulario}><X size={17} /></button></header>{persistenciaError ? <p className="hc-form-error" role="alert">{persistenciaError}</p> : null}<PacienteForm onCancel={cerrarFormulario} onSave={guardarPaciente} /></section></div> : null}
=======
        {filtered.length ? <div className="hc-table-card"><table className="hc-table"><thead><tr><th>Paciente</th><th>DNI</th><th>Edad</th><th>Teléfono</th><th>Historias</th><th>Estado</th><th>Última atención</th><th>Acciones</th></tr></thead><tbody>{filtered.map((patient) => { const historia = historiasClinicas.find((item) => item.id === patient.id); const tieneHistoria = Boolean(patient.hc); return <tr key={patient.id}><td data-label="Paciente"><div className="hc-person"><span className="hc-avatar">{patient.nombres.split(' ').slice(0, 2).map((p) => p[0]).join('')}</span><span><strong>{patient.nombres}</strong><small>{patient.hc || 'Sin historia'} · {patient.sexo}</small></span></div></td><td data-label="DNI">{patient.dni}</td><td data-label="Edad">{patient.edad === '' ? '—' : `${patient.edad} años`}</td><td data-label="Teléfono">{patient.telefono || '—'}</td><td data-label="Historias">{patient.historias ?? (tieneHistoria ? 1 : 0)}</td><td data-label="Estado"><StatusBadge status={patient.estado} /></td><td data-label="Última atención">{historia?.fecha ?? patient.ultimaAtencion ?? 'Sin atención'}</td><td data-label="Acciones"><div className="hc-row-actions">{tieneHistoria ? <button type="button" className="hc-mini-button" onClick={() => go({ view: 'historia', historiaId: patient.id, section: 'datos-paciente' })}>Ver</button> : null}</div></td></tr>;})}</tbody></table></div> : <EstadoVacio titulo="No se encontraron pacientes" descripcion="Ajusta la búsqueda o el filtro para consultar otros registros." />}
        {formularioAbierto ? <div className="hc-patient-dialog-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) cerrarFormulario(); }}><section ref={patientDialogRef} className="hc-patient-dialog" role="dialog" aria-modal="true" aria-labelledby="registrar-paciente-title"><header><div><h2 id="registrar-paciente-title">Registrar nuevo paciente</h2><p>Guarde el paciente o continúe directamente con su historia clínica.</p></div><button type="button" className="hc-mini-button" aria-label="Cerrar" onClick={cerrarFormulario}><X size={17} /></button></header><PacienteForm onCancel={cerrarFormulario} onSave={guardarPaciente} /></section></div> : null}
>>>>>>> 68f9ee0cdb3126a8a4cedcd77484ffa134ac8628
    </div>;
}
