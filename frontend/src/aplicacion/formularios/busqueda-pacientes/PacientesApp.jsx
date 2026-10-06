import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Search, UserPlus, X } from 'lucide-react';
import { pacientesClinicos } from '../../configuracion/datosClinicos.mjs';
import { StatusBadge } from '../compartidos/ControlesClinicos.jsx';
import EstadoVacio from '../../componentes/interfaz/EstadoVacio.jsx';
import PacienteForm from '../registro-paciente/PacienteForm.jsx';
import useModalDialog from '../../componentes/interfaz/useModalDialog.js';
import { historiasDePaciente, listarPacientesLocales, PACIENTES_STORAGE_KEY, registrarHistoriaClinica } from '../../servicios/registroHistoriaClinica.js';
import { abrirHistoria, crearPaciente, esFalloDeRed, listarHistoriasRemotas, listarPacientes, mensajeError } from '../../servicios/servicioClinico.js';

// Almacén heredado de versiones con datos simulados: se limpia al abrir la vista.
const LEGACY_STORAGE_KEY = 'undac:pacientes:frontend:v1';

export default function PacientesApp({ onNavigate }) {
    const [query, setQuery] = useState('');
    const [estado, setEstado] = useState('');
    const [localPatients, setLocalPatients] = useState(listarPacientesLocales);
    const [historiasRemotas, setHistoriasRemotas] = useState([]);
    const [usaApi, setUsaApi] = useState(false);
    const [formularioAbierto, setFormularioAbierto] = useState(false);
    const [persistenciaError, setPersistenciaError] = useState('');
    const patientTriggerRef = useRef(null);
    const cerrarFormulario = useCallback(() => setFormularioAbierto(false), []);
    const patientDialogRef = useModalDialog(formularioAbierto, cerrarFormulario, patientTriggerRef);
    const patients = useMemo(() => [...pacientesClinicos, ...localPatients], [localPatients]);
    useEffect(() => {
        localStorage.removeItem(LEGACY_STORAGE_KEY);
        let vigente = true;
        Promise.all([listarPacientes(), listarHistoriasRemotas()])
            .then(([pacientes, historias]) => {
                if (!vigente) return;
                setUsaApi(true);
                setLocalPatients(pacientes);
                setHistoriasRemotas(historias);
            })
            .catch(() => {});
        return () => { vigente = false; };
    }, []);
    const filtered = useMemo(() => patients.filter((item) => {
        const coincide = `${item.nombres} ${item.dni} ${item.hc}`.toLowerCase().includes(query.toLowerCase());
        return coincide && (!estado || item.estado === estado);
    }), [patients, query, estado]);
    const go = (target) => typeof onNavigate === 'function' ? onNavigate(target) : window.onNavigate?.(target);

    async function recargarApi() {
        const [pacientes, historias] = await Promise.all([listarPacientes(), listarHistoriasRemotas()]);
        setLocalPatients(pacientes);
        setHistoriasRemotas(historias);
    }

    function abrirNuevaHistoria(patient) {
        if (usaApi) {
            abrirHistoria({ pacienteId: patient.id, dni: patient.dni, nombres: patient.nombres, apellidoPaterno: patient.apellidoPaterno, apellidoMaterno: patient.apellidoMaterno, sexo: patient.sexo, telefono: patient.telefono })
                .then((historia) => {
                    setPersistenciaError('');
                    go({ view: 'historia', historiaId: historia.id, section: 'datos-paciente' });
                })
                .catch((error) => setPersistenciaError(mensajeError(error, 'No fue posible registrar la historia clínica.')));
            return;
        }
        try {
            const historia = registrarHistoriaClinica(patient);
            setLocalPatients(listarPacientesLocales());
            setPersistenciaError('');
            go({ view: 'historia', historiaId: historia.id, section: 'datos-paciente' });
        } catch {
            setPersistenciaError('No fue posible registrar la historia clínica. Revise el almacenamiento e inténtelo nuevamente.');
        }
    }

    function guardarPaciente(patient, { crearHistoria = false } = {}) {
        if (usaApi) {
            crearPaciente(patient)
                .then(async (creado) => {
                    await recargarApi();
                    setPersistenciaError('');
                    cerrarFormulario();
                    if (crearHistoria) go({ view: 'nueva-historia', paciente: creado });
                })
                .catch((error) => {
                    if (esFalloDeRed(error)) {
                        setUsaApi(false);
                        guardarPacienteLocal(patient, { crearHistoria });
                        return;
                    }
                    setPersistenciaError(mensajeError(error, 'No fue posible guardar el paciente.'));
                });
            return;
        }
        guardarPacienteLocal(patient, { crearHistoria });
    }

    function guardarPacienteLocal(patient, { crearHistoria = false } = {}) {
        const actualizados = [...listarPacientesLocales(), patient];
        try {
            localStorage.setItem(PACIENTES_STORAGE_KEY, JSON.stringify(actualizados));
            setLocalPatients(actualizados);
            setPersistenciaError('');
            cerrarFormulario();
            if (crearHistoria) go({ view: 'nueva-historia', paciente: patient });
        } catch {
            setPersistenciaError('No fue posible guardar el paciente en este navegador. Revise el almacenamiento e inténtelo nuevamente.');
        }
    }

    return <div className="hc-page space-y-5">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><p className="hc-kicker">Gestión clínica</p><h1 className="hc-page-title">Pacientes</h1><p className="hc-page-subtitle">Gestión de pacientes registrados en la Clínica Odontológica Universitaria.</p></div><button ref={patientTriggerRef} type="button" className="hc-button hc-button--primary" onClick={() => { setPersistenciaError(''); setFormularioAbierto(true); }}><UserPlus size={17} /> Nuevo paciente</button></header>
        <section className="hc-compact-stats" aria-label="Resumen de pacientes"><article><strong>{patients.length}</strong><small>Registrados</small></article><article><strong>{patients.filter((item) => item.estado === 'En proceso').length}</strong><small>En atención</small></article><article><strong>{patients.filter((item) => item.estado === 'Pendiente de revisión').length}</strong><small>Por revisar</small></article></section>
        <div className="hc-filterbar"><label className="hc-search"><Search size={17} /><span className="sr-only">Buscar paciente</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nombre, DNI o código..." /></label><div className="hc-filter-actions"><label className="hc-select-filter"><span>Estado</span><select value={estado} onChange={(e) => setEstado(e.target.value)}><option value="">Todos</option>{[...new Set(patients.map((item) => item.estado))].map((item) => <option key={item}>{item}</option>)}</select></label><span>{filtered.length} pacientes</span></div></div>
        {persistenciaError && !formularioAbierto ? <p className="hc-form-error" role="alert">{persistenciaError}</p> : null}
        {filtered.length ? <div className="hc-table-card"><table className="hc-table"><thead><tr><th>Paciente</th><th>DNI</th><th>Edad</th><th>Teléfono</th><th>Historias</th><th>Estado</th><th>Última atención</th><th>Acciones</th></tr></thead><tbody>{filtered.map((patient) => { const historiasPaciente = usaApi ? historiasRemotas.filter((item) => String(item.pacienteId) === String(patient.id)) : historiasDePaciente(patient.id); const historia = historiasPaciente.at(-1) ?? null; return <tr key={patient.id}><td data-label="Paciente"><div className="hc-person"><span className="hc-avatar">{patient.nombres.split(' ').slice(0, 2).map((p) => p[0]).join('')}</span><span><strong>{patient.nombres}</strong><small>{historia?.codigo || patient.hc || 'Sin historia'} · {patient.sexo}</small></span></div></td><td data-label="DNI">{patient.dni}</td><td data-label="Edad">{patient.edad === '' ? '—' : `${patient.edad} años`}</td><td data-label="Teléfono">{patient.telefono || '—'}</td><td data-label="Historias">{usaApi ? (patient.historias ?? historiasPaciente.length) : historiasPaciente.length}</td><td data-label="Estado"><StatusBadge status={patient.estado} /></td><td data-label="Última atención">{historia?.fecha ?? patient.ultimaAtencion ?? 'Sin atención'}</td><td data-label="Acciones"><div className="hc-row-actions">{historia ? <button type="button" className="hc-mini-button" onClick={() => go({ view: 'historia', historiaId: historia.id, section: 'datos-paciente' })}>Ver</button> : null}<button type="button" className="hc-mini-button" onClick={() => abrirNuevaHistoria(patient)}>Nueva HC</button></div></td></tr>;})}</tbody></table></div> : <EstadoVacio titulo="No se encontraron pacientes" descripcion="Ajusta la búsqueda o el filtro para consultar otros registros." />}
        {formularioAbierto ? <div className="hc-patient-dialog-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) cerrarFormulario(); }}><section ref={patientDialogRef} className="hc-patient-dialog" role="dialog" aria-modal="true" aria-labelledby="registrar-paciente-title"><header><div><h2 id="registrar-paciente-title">Registrar nuevo paciente</h2><p>Guarde el paciente o continúe directamente con su historia clínica.</p></div><button type="button" className="hc-mini-button" aria-label="Cerrar" onClick={cerrarFormulario}><X size={17} /></button></header>{persistenciaError ? <p className="hc-form-error" role="alert">{persistenciaError}</p> : null}<PacienteForm onCancel={cerrarFormulario} onSave={guardarPaciente} /></section></div> : null}
    </div>;
}
