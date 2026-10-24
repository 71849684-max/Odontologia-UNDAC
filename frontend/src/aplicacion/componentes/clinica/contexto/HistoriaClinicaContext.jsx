import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { clinicalMoments, clinicalSections } from '../../../configuracion/historiaClinica.config.mjs';
import { momentosPermitidos, seccionesPermitidas } from '../../../configuracion/permisosVista.js';
import { historiasClinicas, metaHistoriaVacia, pacientesClinicos } from '../../../configuracion/datosClinicos.mjs';
import { buscarHistoria, pacienteDeHistoria } from '../../../servicios/registroHistoriaClinica.js';
import { eliminarArchivoClinico, esFalloDeRed, guardarExpediente, idHistoria, obtenerExpediente, subirArchivoClinico } from '../../../servicios/servicioClinico.js';
import { ArchivosClinicosContext } from '../../../formularios/compartidos/archivosClinicos.js';
import { buildClinicalAlerts } from '../logica/clinicalAlerts.mjs';
import { inferSectionStatus, SECTION_STATUS } from '../logica/clinicalStatus.mjs';
import { cambiosCoherentes, validarSeccion } from '../logica/reglasClinicas.mjs';
import { fechaRegistroActual, valorFechaHoraRegistro } from '../../../formularios/datos-paciente/DatosPacienteSection.jsx';

const HistoriaClinicaContext = createContext(null);

function loadLocalState(storageKey) {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage?.getItem(storageKey);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function fechaRegistroHistoria(history) {
  const origen = history?.fecha ?? history?.creadoEn ?? '';
  return origen ? valorFechaHoraRegistro(origen) : fechaRegistroActual();
}

function conFechaRegistroHistoria(formData, history) {
  const datos = formData?.['datos-paciente'];
  if (!datos || typeof datos !== 'object') return formData;
  return {
    ...formData,
    'datos-paciente': {
      ...datos,
      fechaPaciente: fechaRegistroHistoria(history),
    },
  };
}

function patientSeed(patient, history) {
  if (!patient) return {};
  const apellidosRegistrados = [patient.apellidoPaterno, patient.apellidoMaterno].filter(Boolean).join(' ');
  const nombreCompleto = String(patient.nombres ?? '').trim();
  let nombres = nombreCompleto;
  let apellidos = apellidosRegistrados;
  if (apellidosRegistrados && nombreCompleto.endsWith(apellidosRegistrados)) {
    nombres = nombreCompleto.slice(0, -apellidosRegistrados.length).trim();
  } else if (!apellidosRegistrados) {
    const partes = nombreCompleto.split(/\s+/).filter(Boolean);
    nombres = partes.slice(0, Math.max(1, partes.length - 2)).join(' ');
    apellidos = partes.length > 2 ? partes.slice(-2).join(' ') : '';
  }
  return {
    dni: patient.dni ?? '',
    nombres,
    apellidos,
    edad: patient.edad ?? '',
    sexo: patient.sexo ?? '',
    celular: patient.telefono ?? '',
    correo: patient.correo ?? '',
    fechaNacimiento: patient.fechaNacimiento ?? '',
    fechaPaciente: fechaRegistroHistoria(history),
    operador: history?.operador ?? '',
  };
}

export function HistoriaClinicaProvider({ historiaId, initialSection = 'datos-paciente', permisos = null, children }) {
  const seccionesVisibles = useMemo(() => seccionesPermitidas(permisos), [permisos]);
  const momentosVisibles = useMemo(() => momentosPermitidos(permisos), [permisos]);
  const [expediente, setExpediente] = useState(null);
  const historiaLocal = buscarHistoria(historiaId)
    ?? historiasClinicas.find((item) => String(item.id) === String(historiaId))
    ?? null;
  const historiaRemota = expediente?.historia ?? null;
  const selectedHistory = historiaLocal && historiaRemota
    ? { ...historiaLocal, ...historiaRemota }
    : (historiaLocal ?? historiaRemota ?? { id: historiaId ?? null, codigo: 'Sin historia', estado: '', operador: '', docente: '' });
  const selectedPatient = (historiaLocal ? pacienteDeHistoria(historiaLocal) : null)
    ?? expediente?.paciente
    ?? pacientesClinicos.find((item) => String(item.id) === String(selectedHistory.pacienteId ?? selectedHistory.id))
    ?? { id: null, nombres: 'Paciente sin datos', dni: '—', edad: '', sexo: '', telefono: '' };
  const safeInitial = seccionesVisibles.some((item) => item.id === initialSection) ? initialSection : (seccionesVisibles[0]?.id ?? 'datos-paciente');
  // Clave por id de historia (no por código) para no mezclar borradores de «Sin historia».
  const storageKey = `undac:hc:workspace:v3:${historiaId ?? selectedHistory.id ?? selectedHistory.codigo}`;
  const initialLocal = useMemo(() => loadLocalState(storageKey), [storageKey]);
  const [activeSection, setActiveSection] = useState(safeInitial);

  useEffect(() => {
    if (seccionesVisibles.some((item) => item.id === activeSection)) return;
    const siguiente = seccionesVisibles[0]?.id;
    if (siguiente) setActiveSection(siguiente);
  }, [seccionesVisibles, activeSection]);
  const [formData, setFormData] = useState(() => {
    const local = initialLocal.formData ?? {};
    const datosLocal = local['datos-paciente'] && typeof local['datos-paciente'] === 'object' ? local['datos-paciente'] : {};
    return {
      ...local,
      'datos-paciente': {
        ...patientSeed(selectedPatient, selectedHistory),
        ...datosLocal,
        fechaPaciente: fechaRegistroHistoria(selectedHistory),
      },
    };
  });
  const [explicitStatus, setExplicitStatus] = useState(() => initialLocal.sectionStatus ?? {});
  const historiaServidor = idHistoria(selectedHistory.id);
  const [cargandoExpediente, setCargandoExpediente] = useState(Boolean(historiaServidor));
  const [autosaveStatus, setAutosaveStatus] = useState(historiaServidor ? 'saved' : 'local');
  const [lastSavedAt, setLastSavedAt] = useState(() => initialLocal.lastSavedAt ?? null);
  const [validation, setValidation] = useState({ sectionId: null, errors: [] });
  const [revisionAviso, setRevisionAviso] = useState('');
  const hydrated = useRef(false);

  useEffect(() => {
    if (!historiaServidor) {
      setCargandoExpediente(false);
      return undefined;
    }
    let vigente = true;
    setCargandoExpediente(true);
    obtenerExpediente(historiaServidor).then((cuerpo) => {
      if (!vigente || !cuerpo?.formData) return;
      setExpediente(cuerpo);
      const historia = cuerpo.historia ?? selectedHistory;
      setFormData((actual) => conFechaRegistroHistoria({ ...actual, ...cuerpo.formData }, historia));
      if (cuerpo.sectionStatus && typeof cuerpo.sectionStatus === 'object') {
        setExplicitStatus((actual) => ({ ...actual, ...cuerpo.sectionStatus }));
      }
    }).catch(() => {}).finally(() => {
      if (vigente) setCargandoExpediente(false);
    });
    return () => { vigente = false; };
  }, [historiaServidor]);

  useEffect(() => {
    setActiveSection(safeInitial);
  }, [safeInitial, selectedHistory.codigo]);

  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;
      return;
    }
    setAutosaveStatus('saving');
    let vigente = true;
    const timer = window.setTimeout(() => {
      const now = new Date().toISOString();
      let guardadoLocal = false;
      try {
        window.localStorage?.setItem(storageKey, JSON.stringify({ formData, sectionStatus: explicitStatus, lastSavedAt: now }));
        guardadoLocal = true;
      } catch {
        if (!historiaServidor) {
          setAutosaveStatus('error');
          return;
        }
      }
      if (!historiaServidor) {
        setLastSavedAt(now);
        setAutosaveStatus('local');
        return;
      }
      guardarExpediente(historiaServidor, formData, explicitStatus)
        .then(() => {
          if (!vigente) return;
          setLastSavedAt(new Date().toISOString());
          setAutosaveStatus('saved');
        })
        .catch((error) => {
          if (!vigente) return;
          if (esFalloDeRed(error) && guardadoLocal) {
            setLastSavedAt(now);
            setAutosaveStatus('local');
          } else {
            setAutosaveStatus('error');
          }
        });
    }, 450);
    return () => {
      vigente = false;
      window.clearTimeout(timer);
    };
  }, [formData, explicitStatus, storageKey, historiaServidor]);

  const updateSection = useCallback((sectionId, key, value) => {
    setFormData((current) => {
      const previos = current[sectionId] || {};
      return {
        ...current,
        [sectionId]: { ...previos, [key]: value, ...cambiosCoherentes(sectionId, previos, key, value) },
      };
    });
    setValidation((current) => (current.sectionId === sectionId ? { sectionId: null, errors: [] } : current));
    setExplicitStatus((current) => current[sectionId] === SECTION_STATUS.APPROVED || current[sectionId] === SECTION_STATUS.REVIEW
      ? current
      : { ...current, [sectionId]: SECTION_STATUS.IN_PROGRESS });
  }, []);

  const updateActiveSection = useCallback((key, value) => updateSection(activeSection, key, value), [activeSection, updateSection]);

  const sectionStatuses = useMemo(() => Object.fromEntries(clinicalSections.map((section) => [
    section.id,
    inferSectionStatus(formData[section.id] ?? {}, explicitStatus[section.id]),
  ])), [formData, explicitStatus]);

  const activeMoment = useMemo(
    () => momentosVisibles.find((moment) => moment.sections.includes(activeSection)) ?? momentosVisibles[0] ?? clinicalMoments[0],
    [momentosVisibles, activeSection],
  );
  const alerts = useMemo(() => buildClinicalAlerts(formData), [formData]);

  const setSectionStatus = useCallback((sectionId, status) => {
    setExplicitStatus((current) => ({ ...current, [sectionId]: status }));
  }, []);

  const validarActual = useCallback(() => {
    const errors = validarSeccion(activeSection, formData[activeSection] ?? {});
    setValidation({ sectionId: errors.length ? activeSection : null, errors });
    return errors.length === 0;
  }, [activeSection, formData]);

  const markCurrentComplete = useCallback(() => {
    if (!validarActual()) return false;
    setSectionStatus(activeSection, SECTION_STATUS.COMPLETE);
    return true;
  }, [activeSection, setSectionStatus, validarActual]);

  const persistirLocal = useCallback((siguientes) => {
    const now = new Date().toISOString();
    try {
      window.localStorage?.setItem(storageKey, JSON.stringify({ formData, sectionStatus: siguientes, lastSavedAt: now }));
    } catch { /* almacenamiento lleno o no disponible */ }
    setLastSavedAt(now);
    setAutosaveStatus('local');
  }, [formData, storageKey]);

  const sendCurrentToReview = useCallback(async () => {
    if (!validarActual()) return false;
    const siguientes = { ...explicitStatus, [activeSection]: SECTION_STATUS.REVIEW };
    setExplicitStatus(siguientes);
    setRevisionAviso('');
    if (!historiaServidor) {
      persistirLocal(siguientes);
      setRevisionAviso('Sección marcada para revisión (solo en este equipo; sin servidor no se notifica al profesional encargado).');
      return true;
    }
    try {
      const cuerpo = await guardarExpediente(historiaServidor, formData, siguientes);
      setAutosaveStatus('saved');
      setLastSavedAt(new Date().toISOString());
      if (cuerpo?.revisionNotificada) {
        setRevisionAviso('Sección enviada; el profesional encargado fue notificado.');
      } else if ((cuerpo?.seccionesEnviadas ?? []).length) {
        setRevisionAviso('Sección guardada en revisión. No hay profesional encargado asignado para avisar.');
      } else {
        setRevisionAviso('Sección en revisión.');
      }
      return true;
    } catch (error) {
      if (esFalloDeRed(error)) {
        persistirLocal(siguientes);
        setRevisionAviso('Sección marcada para revisión (solo en este equipo; sin servidor no se notifica al profesional encargado).');
        return true;
      }
      setAutosaveStatus('error');
      setRevisionAviso('No se pudo enviar la revisión al servidor.');
      return false;
    }
  }, [activeSection, explicitStatus, formData, historiaServidor, persistirLocal, validarActual]);

  const approveCurrent = useCallback(() => {
    if (!validarActual()) return false;
    setSectionStatus(activeSection, SECTION_STATUS.APPROVED);
    return true;
  }, [activeSection, setSectionStatus, validarActual]);

  const returnCurrentToEdit = useCallback(() => {
    setSectionStatus(activeSection, SECTION_STATUS.IN_PROGRESS);
  }, [activeSection, setSectionStatus]);

  const momentProgress = useCallback((moment) => {
    const sections = moment.sections;
    const complete = sections.filter((id) => [SECTION_STATUS.COMPLETE, SECTION_STATUS.REVIEW, SECTION_STATUS.APPROVED].includes(sectionStatuses[id])).length;
    const started = sections.filter((id) => sectionStatuses[id] !== SECTION_STATUS.NOT_STARTED).length;
    return {
      complete,
      started,
      total: sections.length,
      percent: sections.length ? Math.round((complete / sections.length) * 100) : 0,
    };
  }, [sectionStatuses]);

  const navigateToMoment = useCallback((momentId) => {
    const moment = momentosVisibles.find((item) => item.id === momentId);
    if (!moment) return;
    const preferred = moment.sections.find((id) => sectionStatuses[id] !== SECTION_STATUS.COMPLETE) ?? moment.sections[0];
    setActiveSection(preferred);
  }, [momentosVisibles, sectionStatuses]);

  const navigateRelative = useCallback((offset) => {
    const index = seccionesVisibles.findIndex((item) => item.id === activeSection);
    const nextIndex = Math.min(seccionesVisibles.length - 1, Math.max(0, index + offset));
    const siguiente = seccionesVisibles[nextIndex];
    if (siguiente) setActiveSection(siguiente.id);
  }, [activeSection, seccionesVisibles]);

  const value = useMemo(() => ({
    patient: selectedPatient,
    history: selectedHistory,
    meta: { ...metaHistoriaVacia, codigo: selectedHistory.codigo, estado: selectedHistory.estado, operador: selectedHistory.operador, docente: selectedHistory.docente },
    sections: seccionesVisibles,
    moments: momentosVisibles,
    activeSection,
    setActiveSection,
    activeMoment,
    formData,
    updateSection,
    updateActiveSection,
    sectionStatuses,
    setSectionStatus,
    markCurrentComplete,
    sendCurrentToReview,
    approveCurrent,
    returnCurrentToEdit,
    validationErrors: validation.sectionId === activeSection ? validation.errors : [],
    revisionAviso,
    momentProgress,
    navigateToMoment,
    navigateRelative,
    alerts,
    autosaveStatus,
    cargandoExpediente,
    lastSavedAt,
  }), [selectedPatient, selectedHistory, seccionesVisibles, momentosVisibles, activeSection, activeMoment, formData, updateSection, updateActiveSection, sectionStatuses, setSectionStatus, markCurrentComplete, sendCurrentToReview, approveCurrent, returnCurrentToEdit, validation, revisionAviso, momentProgress, navigateToMoment, navigateRelative, alerts, autosaveStatus, cargandoExpediente, lastSavedAt]);

  const enServidor = Boolean(historiaServidor && expediente);
  const archivos = useMemo(() => (enServidor ? {
    subir: (campo, archivo, nombre) => subirArchivoClinico(historiaServidor, campo, archivo, nombre),
    eliminar: (adjunto) => eliminarArchivoClinico(historiaServidor, adjunto.archivoId),
  } : null), [enServidor, historiaServidor]);

  return <HistoriaClinicaContext.Provider value={value}>
    <ArchivosClinicosContext.Provider value={archivos}>{children}</ArchivosClinicosContext.Provider>
  </HistoriaClinicaContext.Provider>;
}

export function useHistoriaClinica() {
  const value = useContext(HistoriaClinicaContext);
  if (!value) throw new Error('useHistoriaClinica debe utilizarse dentro de HistoriaClinicaProvider');
  return value;
}
