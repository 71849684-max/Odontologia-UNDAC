import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import DialogoRectificacion from '../workspace/DialogoRectificacion.jsx';
import DialogoSalidaClinica from '../workspace/DialogoSalidaClinica.jsx';
import EstadoCarga from '../../interfaz/EstadoCarga.jsx';
import { clinicalMoments, clinicalSections } from '../../../configuracion/historiaClinica.config.mjs';
import { momentosPermitidos, seccionesPermitidas } from '../../../configuracion/permisosVista.js';
import { historiasClinicas, metaHistoriaVacia, pacientesClinicos } from '../../../configuracion/datosClinicos.mjs';
import { buscarHistoria, pacienteDeHistoria } from '../../../servicios/registroHistoriaClinica.js';
import { eliminarArchivoClinico, guardarExpediente, idHistoria, mensajeError, obtenerExpediente, subirArchivoClinico } from '../../../servicios/servicioClinico.js';
import { ArchivosClinicosContext } from '../../../formularios/compartidos/archivosClinicos.js';
import { buildClinicalAlerts } from '../logica/clinicalAlerts.mjs';
import { inferSectionStatus, SECTION_STATUS } from '../logica/clinicalStatus.mjs';
import { cambiosCoherentes, validarSeccion } from '../logica/reglasClinicas.mjs';
import { fechaRegistroActual, valorFechaHoraRegistro } from '../../../formularios/datos-paciente/DatosPacienteSection.jsx';

import { GuardadosClinicosContext } from '../../../formularios/compartidos/GuardadosClinicosContext.js';

const HistoriaClinicaContext = createContext(null);

function loadLocalState(storageKey) {
  if (import.meta.env.MODE !== 'test') return {};
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
  const [errorGuardado, setErrorGuardado] = useState('');
  const [transicionEnCurso, setTransicionEnCurso] = useState(false);
  const operandoSeccion = useRef(false);
  const temporizadorGuardado = useRef(null);
  const estadosActuales = useRef(explicitStatus);
  estadosActuales.current = explicitStatus;
  const hydrated = useRef(false);
  const revisionServidor = useRef(null);
  const conflictoServidor = useRef(false);
  const colaGuardado = useRef(Promise.resolve());
  const firmaConfirmada = useRef(null);
  const expedienteConfirmado = useRef(null);
  const guardadosExternos = useRef(new Map());
  const [revisionExternos, setRevisionExternos] = useState(0);
  useEffect(() => {
    guardadosExternos.notificar = () => setRevisionExternos(numero => numero + 1);
    return () => {
      guardadosExternos.notificar = undefined;
      for (const entrada of guardadosExternos.current.values()) entrada.descartar?.();
    };
  }, []);
  const [rectificacionPendiente, setRectificacionPendiente] = useState(null);
  const cancelarRectificacion = useCallback(() => setRectificacionPendiente(null), []);
  const firmaActual = useRef(null);
  firmaActual.current = JSON.stringify([formData, explicitStatus]);
  const guardadosPendientes = useRef(0);
  const salidaRef = useRef(null);
  const [salidaPendiente, setSalidaPendiente] = useState(false);
  const [guardandoSalida, setGuardandoSalida] = useState(false);
  const [errorSalida, setErrorSalida] = useState('');
  const [sinAcceso, setSinAcceso] = useState(false);
  const [errorCarga, setErrorCarga] = useState('');
  const accesoRevocado = useRef(false);
  useEffect(() => {
    accesoRevocado.current = false;
    return () => { accesoRevocado.current = true; };
  }, []);
  const comprobarAcceso = useCallback((error) => {
    if (![401, 403, 404].includes(error?.estado)) return;
    accesoRevocado.current = true;
    setSinAcceso(true);
    setExpediente(null);
    setFormData({});
    setExplicitStatus({});
    try { window.localStorage?.removeItem(storageKey); } catch { /* El acceso queda bloqueado aunque el navegador no permita borrar el borrador. */ }
  }, [storageKey]);

  const guardarEnOrden = useCallback((datos, estados, motivoDeOperacion) => {
    const firma = JSON.stringify([datos, estados]);
    const modificado = firma !== firmaConfirmada.current;
    if (modificado) guardadosPendientes.current++;
    const operacion = colaGuardado.current.catch(() => {}).then(async () => {
      if (accesoRevocado.current) throw new Error('Ya no tiene acceso a esta historia clínica.');
      if (conflictoServidor.current) throw new Error('Recargue la historia para resolver el conflicto entre sesiones.');
      if (firma === firmaConfirmada.current && expedienteConfirmado.current && !motivoDeOperacion) return expedienteConfirmado.current;
      try {
        const cuerpo = revisionServidor.current
          ? await guardarExpediente(historiaServidor, datos, estados, revisionServidor.current, motivoDeOperacion)
          : await guardarExpediente(historiaServidor, datos, estados, undefined, motivoDeOperacion);
        revisionServidor.current = cuerpo?.revision ?? revisionServidor.current;
        firmaConfirmada.current = firma;
        expedienteConfirmado.current = cuerpo;
        return cuerpo;
      } catch (error) {
        comprobarAcceso(error);
        if (error?.errores?.revision) {
          conflictoServidor.current = true;
          setRevisionAviso('Otra sesión modificó el expediente. Sus cambios permanecen en esta pantalla sin guardar. Cópielos antes de recargar para resolver el conflicto.');
        }
        throw error;
      }
    }).finally(() => { if (modificado) guardadosPendientes.current--; });
    colaGuardado.current = operacion;
    return operacion;
  }, [historiaServidor, comprobarAcceso]);

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
      expedienteConfirmado.current = cuerpo;
      revisionServidor.current = cuerpo.revision ?? null;
      const historia = cuerpo.historia ?? selectedHistory;
      const formulario = conFechaRegistroHistoria({ ...formData, ...cuerpo.formData }, historia);
      const estados = { ...explicitStatus, ...(cuerpo.sectionStatus ?? {}) };
      firmaConfirmada.current = JSON.stringify([formulario, estados]);
      setFormData(formulario);
      setExplicitStatus(estados);
    }).catch((error) => {
      if (!vigente) return;
      comprobarAcceso(error);
      if (import.meta.env.MODE !== 'test') setErrorCarga('No se pudo cargar la historia desde el servidor. No se mostrará una copia local.');
    }).finally(() => {
      if (vigente) setCargandoExpediente(false);
    });
    return () => { vigente = false; };
  }, [historiaServidor, comprobarAcceso]);

  useEffect(() => {
    if (!historiaServidor || sinAcceso || import.meta.env.MODE === 'test') return undefined;
    const verificar = () => {
      if (document.visibilityState === 'visible') obtenerExpediente(historiaServidor).catch(comprobarAcceso);
    };
    window.addEventListener('focus', verificar);
    const intervalo = window.setInterval(verificar, 30000);
    return () => { window.removeEventListener('focus', verificar); window.clearInterval(intervalo); };
  }, [historiaServidor, sinAcceso, comprobarAcceso]);

  useEffect(() => {
    setActiveSection(safeInitial);
  }, [safeInitial, selectedHistory.codigo]);

  useEffect(() => {
    if (accesoRevocado.current) return;
    if (historiaServidor && cargandoExpediente) return;
    if (transicionEnCurso) return;
    if (!hydrated.current) {
      hydrated.current = true;
      return;
    }
    if (conflictoServidor.current) return;
    if (firmaActual.current === firmaConfirmada.current) return;
    setAutosaveStatus('saving');
    let vigente = true;
    temporizadorGuardado.current = window.setTimeout(() => {
      if (accesoRevocado.current) return;
      const now = new Date().toISOString();
      try {
        if (import.meta.env.MODE === 'test') {
          window.localStorage?.setItem(storageKey, JSON.stringify({ formData, sectionStatus: explicitStatus, lastSavedAt: now }));
        }
      } catch {
        if (!historiaServidor) {
          setAutosaveStatus('error');
          return;
        }
      }
      if (!historiaServidor || !expediente) {
        setLastSavedAt(now);
        setAutosaveStatus('local');
        return;
      }
      guardarEnOrden(formData, explicitStatus)
        .then(() => {
          if (!vigente) return;
          setLastSavedAt(new Date().toISOString());
          setAutosaveStatus('saved');
          setErrorGuardado('');
        })
        .catch((error) => {
          if (!vigente) return;
          setAutosaveStatus('error');
          setErrorGuardado(mensajeError(error, 'No se pudo guardar el expediente.'));
        });
    }, 450);
    return () => {
      vigente = false;
      window.clearTimeout(temporizadorGuardado.current);
    };
  }, [formData, explicitStatus, storageKey, historiaServidor, cargandoExpediente, expediente, guardarEnOrden, transicionEnCurso]);

  const reintentarGuardado = useCallback(async () => {
    if (!historiaServidor || !expediente || accesoRevocado.current || conflictoServidor.current) return false;
    setAutosaveStatus('saving');
    try {
      await guardarEnOrden(formData, explicitStatus);
      if (accesoRevocado.current) return false;
      setLastSavedAt(new Date().toISOString());
      setAutosaveStatus('saved');
      setErrorGuardado('');
      return true;
    } catch (error) {
      if (!accesoRevocado.current) {
        setAutosaveStatus('error');
        setErrorGuardado(mensajeError(error, 'No se pudo guardar el expediente.'));
      }
      return false;
    }
  }, [historiaServidor, expediente, formData, explicitStatus, guardarEnOrden]);

  const hayCambiosPendientes = useCallback(() => Boolean(historiaServidor && expediente && !accesoRevocado.current
    && (firmaActual.current !== firmaConfirmada.current || guardadosPendientes.current > 0 || [...guardadosExternos.current.values()].some(entrada => entrada.pendiente()))), [historiaServidor, expediente]);

  useEffect(() => {
    const proteger = evento => {
      if (!hayCambiosPendientes()) return;
      evento.preventDefault();
      salidaRef.current = evento.detail;
      setErrorSalida('');
      setSalidaPendiente(true);
    };
    const protegerVentana = evento => {
      if (!hayCambiosPendientes()) return;
      evento.preventDefault();
      evento.returnValue = '';
    };
    window.addEventListener('hc:solicitar-salida', proteger);
    window.addEventListener('beforeunload', protegerVentana);
    return () => {
      window.removeEventListener('hc:solicitar-salida', proteger);
      window.removeEventListener('beforeunload', protegerVentana);
    };
  }, [hayCambiosPendientes]);

  const permanecer = useCallback(() => {
    salidaRef.current?.cancelar?.();
    salidaRef.current = null;
    setSalidaPendiente(false);
    setGuardandoSalida(false);
  }, []);

  const descartarYSalir = useCallback(() => {
    const continuar = salidaRef.current?.continuar;
    for (const entrada of guardadosExternos.current.values()) entrada.descartar?.();
    salidaRef.current = null;
    setSalidaPendiente(false);
    setGuardandoSalida(false);
    continuar?.();
  }, []);

  const guardarYSalir = async () => {
    const intento = salidaRef.current;
    setGuardandoSalida(true);
    setErrorSalida('');
    try {
      const externos = await Promise.all([...guardadosExternos.current.values()].map(entrada => entrada.guardar()));
      const guardado = externos.every(Boolean) && await reintentarGuardado();
      await colaGuardado.current.catch(() => {});
      if (salidaRef.current !== intento) return;
      if (guardado && !hayCambiosPendientes()) descartarYSalir();
      else setErrorSalida('No se pudo confirmar el guardado. Permanezca para revisar los cambios o descártelos explícitamente.');
    } finally { if (salidaRef.current === intento) setGuardandoSalida(false); }
  };

  const updateSection = useCallback((sectionId, key, value) => {
    if (operandoSeccion.current || estadosActuales.current[sectionId] === SECTION_STATUS.APPROVED) return;
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
    if (import.meta.env.MODE !== 'test') return;
    const now = new Date().toISOString();
    try {
      window.localStorage?.setItem(storageKey, JSON.stringify({ formData, sectionStatus: siguientes, lastSavedAt: now }));
    } catch { /* almacenamiento lleno o no disponible */ }
    setLastSavedAt(now);
    setAutosaveStatus('local');
  }, [formData, storageKey]);

  const cambiarEstadoConfirmado = useCallback(async (sectionId, estado, motivo) => {
    if (operandoSeccion.current) return false;
    const siguientes = { ...explicitStatus, [sectionId]: estado };
    if (!historiaServidor || !expediente) {
      if (import.meta.env.MODE !== 'test') return false;
      setExplicitStatus(siguientes);
      persistirLocal(siguientes);
      if (estado === SECTION_STATUS.REVIEW) setRevisionAviso('Sección marcada para revisión (solo en este equipo; sin servidor no se notifica al profesional encargado).');
      return true;
    }
    if (estado === SECTION_STATUS.APPROVED && (autosaveStatus !== 'saved' || errorGuardado || conflictoServidor.current || hayCambiosPendientes())) {
      setRevisionAviso('Antes de aprobar, guarde correctamente todos los cambios y resuelva los errores pendientes.');
      return false;
    }
    operandoSeccion.current = true;
    setTransicionEnCurso(true);
    window.clearTimeout(temporizadorGuardado.current);
    setRevisionAviso('');
    setAutosaveStatus('saving');
    try {
      const externos = await Promise.all([...guardadosExternos.current.values()].map(entrada => entrada.guardar()));
      if (!externos.every(Boolean)) throw new Error('Hay cambios del odontograma que no se pudieron guardar. Reintente el guardado antes de continuar.');
      await guardarEnOrden(formData, explicitStatus);
      const cuerpo = await guardarEnOrden(formData, siguientes, motivo);
      if (cuerpo?.sectionStatus?.[sectionId] !== estado) throw new Error('El servidor no confirmó el cambio de estado de la sección. Revise sus permisos y los datos del profesional.');
      const formulario = conFechaRegistroHistoria(cuerpo.formData, cuerpo.historia ?? selectedHistory);
      firmaConfirmada.current = JSON.stringify([formulario, cuerpo.sectionStatus]);
      setExpediente(cuerpo);
      setFormData(formulario);
      setExplicitStatus(cuerpo.sectionStatus);
      setAutosaveStatus('saved');
      setErrorGuardado('');
      setLastSavedAt(new Date().toISOString());
      if (estado === SECTION_STATUS.APPROVED) {
        setRevisionAviso('Sección aprobada y guardada en el servidor.');
      } else if (estado === SECTION_STATUS.IN_PROGRESS) {
        setRevisionAviso('Sección reabierta y guardada. Ya puede corregir la información.');
      } else if (cuerpo?.revisionNotificada) {
        setRevisionAviso('Sección enviada; el profesional encargado fue notificado.');
      } else if ((cuerpo?.seccionesEnviadas ?? []).length) {
        setRevisionAviso('Sección guardada en revisión. No hay profesional encargado asignado para avisar.');
      } else {
        setRevisionAviso('Sección en revisión.');
      }
      return true;
    } catch (error) {
      setAutosaveStatus('error');
      setErrorGuardado(mensajeError(error, 'No se pudo guardar el cambio de estado.'));
      return false;
    } finally {
      operandoSeccion.current = false;
      setTransicionEnCurso(false);
    }
  }, [explicitStatus, formData, historiaServidor, expediente, persistirLocal, guardarEnOrden, autosaveStatus, errorGuardado, hayCambiosPendientes, selectedHistory]);

  const sendCurrentToReview = useCallback(async () => {
    if (!validarActual()) return false;
    return cambiarEstadoConfirmado(activeSection, SECTION_STATUS.REVIEW);
  }, [activeSection, validarActual, cambiarEstadoConfirmado]);

  const approveCurrent = useCallback(async () => {
    if (!validarActual()) return false;
    return cambiarEstadoConfirmado(activeSection, SECTION_STATUS.APPROVED);
  }, [activeSection, validarActual, cambiarEstadoConfirmado]);

  const returnCurrentToEdit = useCallback(() => {
    setRectificacionPendiente(activeSection);
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
    actualizarEquipo: (historia) => setExpediente((actual) => ({ ...actual, historia })),
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
    errorGuardado: errorGuardado || [...guardadosExternos.current.values()].map(entrada => entrada.error).find(Boolean) || '',
    transicionEnCurso,
    aprobacionBloqueada: transicionEnCurso || (Boolean(expediente) && (autosaveStatus !== 'saved' || Boolean(errorGuardado) || hayCambiosPendientes() || [...guardadosExternos.current.values()].some(entrada => entrada.error || entrada.cargando))),
    momentProgress,
    navigateToMoment,
    navigateRelative,
    alerts,
    autosaveStatus: [...guardadosExternos.current.values()].some(entrada => entrada.error) ? 'error' : [...guardadosExternos.current.values()].some(entrada => entrada.cargando || entrada.pendiente()) ? 'saving' : autosaveStatus,
    reintentarGuardado: async () => {
      const resultados = await Promise.all([...guardadosExternos.current.values()].map(entrada => entrada.guardar()));
      return resultados.every(Boolean) && await reintentarGuardado();
    },
    confirmarGuardado: async () => {
      const resultados = await Promise.all([...guardadosExternos.current.values()].map(entrada => entrada.guardar()));
      return resultados.every(Boolean) && await reintentarGuardado();
    },
    cargandoExpediente,
    lastSavedAt: [lastSavedAt, ...[...guardadosExternos.current.values()].map(entrada => entrada.confirmadoEn)].filter(Boolean).sort().at(-1) ?? lastSavedAt,
  }), [selectedPatient, selectedHistory, seccionesVisibles, momentosVisibles, activeSection, activeMoment, formData, updateSection, updateActiveSection, sectionStatuses, setSectionStatus, markCurrentComplete, sendCurrentToReview, approveCurrent, returnCurrentToEdit, validation, revisionAviso, errorGuardado, transicionEnCurso, expediente, hayCambiosPendientes, momentProgress, navigateToMoment, navigateRelative, alerts, autosaveStatus, reintentarGuardado, cargandoExpediente, lastSavedAt, revisionExternos]);

  const enServidor = Boolean(historiaServidor && expediente);
  const archivos = useMemo(() => (enServidor ? {
    subir: (campo, archivo, nombre) => subirArchivoClinico(historiaServidor, campo, archivo, nombre),
    eliminar: (adjunto) => eliminarArchivoClinico(historiaServidor, adjunto.archivoId),
  } : null), [enServidor, historiaServidor]);

  if (sinAcceso) return <main className="hc-page"><div role="alert"><h1>Historia clínica no disponible</h1><p>Ya no tiene acceso a esta historia clínica. Los cambios no se guardaron.</p></div><a href="#/historias">Volver a historias clínicas</a></main>;
  if (import.meta.env.MODE !== 'test' && cargandoExpediente && !errorCarga) return <main className="hc-page"><EstadoCarga mensaje="Verificando acceso a la historia…" detalle="Estamos preparando el expediente clínico." /></main>;
  if (import.meta.env.MODE !== 'test' && (!expediente || errorCarga)) return <main className="hc-page"><p role="alert">{errorCarga || 'La historia requiere conexión con el servidor.'}</p><button type="button" onClick={() => window.location.reload()}>Reintentar</button><a href="#/historias">Volver a historias clínicas</a></main>;

  return <HistoriaClinicaContext.Provider value={value}><GuardadosClinicosContext.Provider value={guardadosExternos}>
    <ArchivosClinicosContext.Provider value={archivos}>{children}</ArchivosClinicosContext.Provider>
    {rectificacionPendiente ? <DialogoRectificacion detalleError={errorGuardado} onCancel={cancelarRectificacion} onConfirm={async motivo => {
      const guardado = await cambiarEstadoConfirmado(rectificacionPendiente, SECTION_STATUS.IN_PROGRESS, motivo);
      if (guardado) setRectificacionPendiente(null);
      return guardado;
    }} /> : null}
    {salidaPendiente ? <DialogoSalidaClinica guardando={guardandoSalida} error={errorSalida} onPermanecer={permanecer} onDescartar={descartarYSalir} onGuardar={guardarYSalir} /> : null}
  </GuardadosClinicosContext.Provider></HistoriaClinicaContext.Provider>;
}

export function useHistoriaClinicaOpcional() { return useContext(HistoriaClinicaContext); }

export function useHistoriaClinica() {
  const value = useContext(HistoriaClinicaContext);
  if (!value) throw new Error('useHistoriaClinica debe utilizarse dentro de HistoriaClinicaProvider');
  return value;
}
