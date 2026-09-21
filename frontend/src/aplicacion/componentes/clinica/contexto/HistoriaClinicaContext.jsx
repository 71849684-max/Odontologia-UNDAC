import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { clinicalMoments, clinicalSections, getMomentForSection } from '../../../configuracion/historiaClinica.config.mjs';
import { mockHistoriaMeta, mockHistorias, mockPacientes } from '../../../configuracion/datosMock.mjs';
import { buildClinicalAlerts } from '../logica/clinicalAlerts.mjs';
import { inferSectionStatus, SECTION_STATUS } from '../logica/clinicalStatus.mjs';

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

function patientSeed(patient, history) {
  if (!patient) return {};
  const names = String(patient.nombres ?? '').trim().split(/\s+/);
  return {
    dni: patient.dni ?? '',
    nombres: names.slice(0, Math.max(1, names.length - 2)).join(' '),
    apellidos: names.length > 2 ? names.slice(-2).join(' ') : '',
    edad: patient.edad ?? '',
    sexo: patient.sexo ?? '',
    celular: patient.telefono ?? '',
    operador: history?.operador ?? '',
  };
}

export function HistoriaClinicaProvider({ historiaId, initialSection = 'datos-paciente', children }) {
  const selectedPatient = mockPacientes.find((item) => String(item.id) === String(historiaId)) || mockPacientes[0];
  const selectedHistory = mockHistorias.find((item) => String(item.id) === String(historiaId)) || mockHistorias[0];
  const safeInitial = clinicalSections.some((item) => item.id === initialSection) ? initialSection : 'datos-paciente';
  const storageKey = `undac:hc:workspace:v2:${selectedHistory.codigo}`;
  const initialLocal = useMemo(() => loadLocalState(storageKey), [storageKey]);
  const [activeSection, setActiveSection] = useState(safeInitial);
  const [formData, setFormData] = useState(() => ({
    'datos-paciente': patientSeed(selectedPatient, selectedHistory),
    ...(initialLocal.formData ?? {}),
  }));
  const [explicitStatus, setExplicitStatus] = useState(() => initialLocal.sectionStatus ?? {});
  const [autosaveStatus, setAutosaveStatus] = useState('saved');
  const [lastSavedAt, setLastSavedAt] = useState(() => initialLocal.lastSavedAt ?? null);
  const hydrated = useRef(false);

  useEffect(() => {
    setActiveSection(safeInitial);
  }, [safeInitial, selectedHistory.codigo]);

  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;
      return;
    }
    setAutosaveStatus('saving');
    const timer = window.setTimeout(() => {
      const now = new Date().toISOString();
      try {
        window.localStorage?.setItem(storageKey, JSON.stringify({ formData, sectionStatus: explicitStatus, lastSavedAt: now }));
        setLastSavedAt(now);
        setAutosaveStatus('saved');
      } catch {
        setAutosaveStatus('error');
      }
    }, 450);
    return () => window.clearTimeout(timer);
  }, [formData, explicitStatus, storageKey]);

  const updateSection = useCallback((sectionId, key, value) => {
    setFormData((current) => ({
      ...current,
      [sectionId]: { ...(current[sectionId] || {}), [key]: value },
    }));
    setExplicitStatus((current) => current[sectionId] === SECTION_STATUS.APPROVED || current[sectionId] === SECTION_STATUS.REVIEW
      ? current
      : { ...current, [sectionId]: SECTION_STATUS.IN_PROGRESS });
  }, []);

  const updateActiveSection = useCallback((key, value) => updateSection(activeSection, key, value), [activeSection, updateSection]);

  const sectionStatuses = useMemo(() => Object.fromEntries(clinicalSections.map((section) => [
    section.id,
    inferSectionStatus(formData[section.id] ?? {}, explicitStatus[section.id]),
  ])), [formData, explicitStatus]);

  const activeMoment = getMomentForSection(activeSection);
  const alerts = useMemo(() => buildClinicalAlerts(formData), [formData]);

  const setSectionStatus = useCallback((sectionId, status) => {
    setExplicitStatus((current) => ({ ...current, [sectionId]: status }));
  }, []);

  const markCurrentComplete = useCallback(() => {
    setSectionStatus(activeSection, SECTION_STATUS.COMPLETE);
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
    const moment = clinicalMoments.find((item) => item.id === momentId);
    if (!moment) return;
    const preferred = moment.sections.find((id) => sectionStatuses[id] !== SECTION_STATUS.COMPLETE) ?? moment.sections[0];
    setActiveSection(preferred);
  }, [sectionStatuses]);

  const navigateRelative = useCallback((offset) => {
    const index = clinicalSections.findIndex((item) => item.id === activeSection);
    const nextIndex = Math.min(clinicalSections.length - 1, Math.max(0, index + offset));
    setActiveSection(clinicalSections[nextIndex].id);
  }, [activeSection]);

  const value = useMemo(() => ({
    patient: selectedPatient,
    history: selectedHistory,
    meta: { ...mockHistoriaMeta, codigo: selectedHistory.codigo, estado: selectedHistory.estado, operador: selectedHistory.operador, docente: selectedHistory.docente },
    activeSection,
    setActiveSection,
    activeMoment,
    formData,
    updateSection,
    updateActiveSection,
    sectionStatuses,
    setSectionStatus,
    markCurrentComplete,
    momentProgress,
    navigateToMoment,
    navigateRelative,
    alerts,
    autosaveStatus,
    lastSavedAt,
  }), [selectedPatient, selectedHistory, activeSection, activeMoment, formData, updateSection, updateActiveSection, sectionStatuses, setSectionStatus, markCurrentComplete, momentProgress, navigateToMoment, navigateRelative, alerts, autosaveStatus, lastSavedAt]);

  return <HistoriaClinicaContext.Provider value={value}>{children}</HistoriaClinicaContext.Provider>;
}

export function useHistoriaClinica() {
  const value = useContext(HistoriaClinicaContext);
  if (!value) throw new Error('useHistoriaClinica debe utilizarse dentro de HistoriaClinicaProvider');
  return value;
}
