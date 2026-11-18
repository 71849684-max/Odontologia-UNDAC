import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Printer, X } from 'lucide-react';
import { useHistoriaClinica } from '../contexto/HistoriaClinicaContext.jsx';
import { idHistoria, obtenerExpediente, registrarImpresionClinica, mensajeError } from '../../../servicios/servicioClinico.js';
import { clinicalSections } from '../../../configuracion/historiaClinica.config.mjs';
import { getSectionById } from '../../../configuracion/historiaClinica.config.mjs';
import { datosImpresion } from './documentoClinico.mjs';
import { plantillaDeSeccion } from './registroImpresion.js';

function esperarImagenes(contenedor) {
  const imagenes = contenedor ? [...contenedor.querySelectorAll('img')] : [];
  const pendientes = imagenes.filter((imagen) => !imagen.complete);
  if (!pendientes.length) return Promise.resolve();
  const carga = Promise.all(pendientes.map((imagen) => new Promise((resolver) => {
    imagen.addEventListener('load', resolver, { once: true });
    imagen.addEventListener('error', resolver, { once: true });
  })));
  const limite = new Promise((resolver) => setTimeout(resolver, 1200));
  return Promise.race([carga, limite]);
}

export default function VistaPreviaImpresion({ seccionId, onClose }) {
  const contexto = useHistoriaClinica();
  const [confirmado, setConfirmado] = useState(null);
  const [errorCarga, setErrorCarga] = useState('');
  const historiaId = idHistoria(contexto.history.id);
  const { patient, history, meta } = contexto;
  const formData = confirmado?.formData ?? contexto.formData;
  const cargandoExpediente = contexto.cargandoExpediente || Boolean(historiaId && !confirmado);
  useEffect(() => {
    if (!historiaId) return undefined;
    let vigente = true;
    obtenerExpediente(historiaId).then(datos => { if (vigente) setConfirmado(datos); }).catch(fallo => { if (vigente) setErrorCarga(mensajeError(fallo, 'No se pudo cargar la copia del servidor.')); });
    return () => { vigente = false; };
  }, [historiaId]);
  const seccion = seccionId === 'todas' ? { label: 'Expediente completo' } : getSectionById(seccionId);
  const Plantilla = plantillaDeSeccion(seccionId);
  const datos = useMemo(() => datosImpresion({ patient, history, meta, formData }), [patient, history, meta, formData]);
  const [preparando, setPreparando] = useState(false);
  const dialogoRef = useRef(null);
  const cerrarRef = useRef(null);

  useEffect(() => {
    const anterior = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.classList.add('doc-impresion-abierta');
    document.body.style.overflow = 'hidden';
    cerrarRef.current?.focus({ preventScroll: true });
    const cerrarConEscape = (evento) => {
      if (evento.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', cerrarConEscape);
    return () => {
      window.removeEventListener('keydown', cerrarConEscape);
      document.body.classList.remove('doc-impresion-abierta');
      document.body.style.overflow = overflow;
      anterior?.focus?.({ preventScroll: true });
    };
  }, [onClose]);

  async function imprimir() {
    if (preparando || cargandoExpediente) return;
    setPreparando(true);
    try {
      if (historiaId) await registrarImpresionClinica(historiaId, seccionId);
      await esperarImagenes(dialogoRef.current);
      window.print();
    } catch (fallo) { setErrorCarga(mensajeError(fallo, 'No se pudo registrar la preparación de impresión.')); }
    finally { setPreparando(false); }
  }

  return createPortal(
    <div className="doc-impresion-portal">
      <div className="doc-impresion__barra clinical-print-hide">
        <div className="doc-impresion__barra-titulo">
          <strong>Vista previa de impresión</strong>
          <span>{seccion.label}</span>
        </div>
        <div className="doc-impresion__barra-acciones">
          <button ref={cerrarRef} type="button" className="undac-btn undac-btn--ghost" onClick={onClose}>
            <X size={16} aria-hidden="true" /> Cerrar
          </button>
          <button type="button" className="undac-btn undac-btn--primary" onClick={imprimir} disabled={preparando || cargandoExpediente}>
            <Printer size={16} aria-hidden="true" /> {preparando ? 'Preparando…' : 'Imprimir documento'}
          </button>
        </div>
      </div>

      <div className="doc-impresion__lienzo" ref={dialogoRef} role="dialog" aria-modal="true" aria-labelledby="doc-impresion-titulo">
        <h1 id="doc-impresion-titulo" className="solo-lectores">Vista previa de impresión: {seccion.label}</h1>
        {cargandoExpediente ? <p className="doc-impresion__aviso" role="status">Cargando la información de la historia clínica…</p> : null}
        {errorCarga ? <p role="alert">{errorCarga}</p> : null}
        {seccionId === 'todas' && !cargandoExpediente ? clinicalSections.map(seccion => {
          const Documento = plantillaDeSeccion(seccion.id);
          return Documento ? <Documento key={seccion.id} values={formData[seccion.id] ?? {}} allFormData={formData} formData={formData} patient={confirmado?.paciente ?? patient} history={confirmado?.historia ?? history} meta={meta} datos={datos} /> : null;
        }) : null}
        {Plantilla && !cargandoExpediente ? <Plantilla
          values={formData[seccionId] ?? {}}
          allFormData={formData}
          patient={patient}
          history={history}
          meta={meta}
          datos={datos}
          formData={formData}
        /> : seccionId !== 'todas' && !cargandoExpediente ? <p className="doc-impresion__aviso">Esta sección todavía no tiene una plantilla de impresión.</p> : null}
        <p className="doc-impresion__nota">Los márgenes ya están definidos en el documento. Para guardar un PDF limpio, desactive los encabezados y pies de página del navegador en el diálogo de impresión.</p>
      </div>
    </div>,
    document.body,
  );
}
