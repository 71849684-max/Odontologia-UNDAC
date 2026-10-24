import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Printer, X } from 'lucide-react';
import { useHistoriaClinica } from '../contexto/HistoriaClinicaContext.jsx';
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
  const { patient, history, meta, formData, cargandoExpediente = false } = useHistoriaClinica();
  const seccion = getSectionById(seccionId);
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
    const pendientes = dialogoRef.current ? [...dialogoRef.current.querySelectorAll('img')].filter((imagen) => !imagen.complete) : [];
    if (!pendientes.length) {
      window.print();
      return;
    }
    setPreparando(true);
    await esperarImagenes(dialogoRef.current);
    setPreparando(false);
    window.print();
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
        {Plantilla ? <Plantilla
          values={formData[seccionId] ?? {}}
          allFormData={formData}
          patient={patient}
          history={history}
          meta={meta}
          datos={datos}
          formData={formData}
        /> : <p className="doc-impresion__aviso">Esta sección todavía no tiene una plantilla de impresión.</p>}
        <p className="doc-impresion__nota">Para guardar un PDF limpio, desactive los encabezados y pies de página del navegador en el diálogo de impresión.</p>
      </div>
    </div>,
    document.body,
  );
}
