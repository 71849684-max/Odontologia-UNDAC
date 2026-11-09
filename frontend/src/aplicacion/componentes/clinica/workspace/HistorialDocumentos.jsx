import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import useModalDialog from '../../interfaz/useModalDialog.js';
import { listarVersionesClinicas, obtenerVersionClinica, enlaceExportacionClinica, mensajeError } from '../../../servicios/servicioClinico.js';
import { formatearFechaHora } from '../../../utilidades/fechas.mjs';

const etiquetas = { EXPEDIENTE: 'Expediente', ARCHIVOS: 'Archivos clínicos', ODONTOGRAMA: 'Odontograma', CONSENTIMIENTO: 'Consentimiento', ANTES_DE_EDITAR: 'Documento antes del cambio', GUARDAR: 'Documento guardado', OTORGADO: 'Consentimiento otorgado', REVOCADO: 'Consentimiento revocado', NEGADO: 'Consentimiento negado', formData: 'Datos clínicos', sectionStatus: 'Estado de las secciones', examinations: 'Evaluaciones', teeth: 'Piezas dentales', findings: 'Hallazgos', surfaces: 'Superficies', ranges: 'Hallazgos entre piezas', professional: 'Profesional responsable', cop: 'N.º COP', date: 'Fecha', reason: 'Motivo', status: 'Estado', closedAt: 'Fecha de cierre', createdAt: 'Fecha de registro', observations: 'Observaciones', specifications: 'Especificaciones', points: 'Coordenadas del hallazgo', state: 'Hallazgo', code: 'Código clínico', surface: 'Superficie', condition: 'Condición', note: 'Nota', draft: 'Borrador', closed: 'Cerrada', approved: 'Aprobada', review: 'En revisión', complete: 'Completa', 'in-progress': 'En progreso', 'not-started': 'Sin iniciar', good: 'Buen estado', bad: 'Mal estado', traced: 'Trazo registrado', schematic: 'Representación esquemática' };
const nombre = clave => etiquetas[clave] || clave.replace(/([a-záéíóú])([A-ZÁÉÍÓÚ])/g, '$1 $2').replaceAll('-', ' ').replaceAll('_', ' ');
function Datos({ valor }) {
  if (valor == null || valor === '') return <span>Sin registrar</span>;
  if (typeof valor !== 'object') return <span>{typeof valor === 'boolean' ? valor ? 'Sí' : 'No' : etiquetas[valor] ?? String(valor)}</span>;
  return <dl className="permisos-ficha__datos">{Object.entries(valor).filter(([clave]) => !['id', 'revision', 'revisionServidor', 'url', 'archivoId', 'hash', 'patientId'].includes(clave)).map(([clave, dato]) => <div key={clave}><dt>{nombre(clave)}</dt><dd><Datos valor={dato} /></dd></div>)}</dl>;
}

export default function HistorialDocumentos({ historiaId, onClose }) {
  const titulo = useId();
  const disparador = useRef(document.activeElement);
  const dialogo = useModalDialog(true, onClose, disparador);
  const [versiones, setVersiones] = useState([]);
  const [seleccion, setSeleccion] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let vigente = true;
    listarVersionesClinicas(historiaId).then(datos => { if (vigente) setVersiones(datos); }).catch(fallo => { if (vigente) setError(mensajeError(fallo, 'No se pudo cargar el historial.')); });
    return () => { vigente = false; };
  }, [historiaId]);
  async function consultar(id) {
    try { setSeleccion(await obtenerVersionClinica(historiaId, id)); setError(''); }
    catch (fallo) { setError(mensajeError(fallo, 'No se pudo consultar la versión.')); }
  }
  return createPortal(<div className="admin-dialogo-fondo">
    <section ref={dialogo} className="admin-dialogo hc-audit-detalle" role="dialog" aria-modal="true" aria-labelledby={titulo}>
      <header className="admin-dialogo__cabecera"><h2 id={titulo}>Historial de documentos</h2><button type="button" className="undac-btn undac-btn--ghost" onClick={onClose}>Cerrar</button></header>
      <p>Las versiones conservan el contenido anterior. Este registro de integridad no sustituye una firma digital.</p>
      <a className="undac-btn undac-btn--secondary" href={enlaceExportacionClinica(historiaId)} download>Descargar expediente con versiones y adjuntos</a>
      {seleccion?.integridadVerificada && seleccion.archivosConservados?.length ? <div><h3>Archivos de esta versión</h3>{seleccion.archivosConservados.map(archivo => <p key={archivo.archivoId}><a href={archivo.url} target="_blank" rel="noopener noreferrer">{archivo.nombre}</a></p>)}</div> : null}
      {error ? <p role="alert">{error}</p> : null}
      {seleccion ? <><button type="button" className="undac-btn undac-btn--secondary" onClick={() => setSeleccion(null)}>Volver a las versiones</button><p>{nombre(seleccion.clase)} · {seleccion.nombre_usuario} · {formatearFechaHora(seleccion.creado_en)}</p><p>{seleccion.integridadVerificada ? 'Integridad de esta versión comprobada.' : 'Advertencia: la integridad de esta versión no coincide.'}</p><Datos valor={seleccion.contenido} /></> : <div className="admin-tabla-contenedor"><table className="admin-tabla"><thead><tr><th>Fecha</th><th>Documento</th><th>Acción</th><th>Responsable</th><th>Detalle</th></tr></thead><tbody>{versiones.map(version => <tr key={version.id_version}><td>{formatearFechaHora(version.creado_en)}</td><td>{nombre(version.clase)}</td><td>{nombre(version.evento)}</td><td>{version.nombre_usuario}</td><td><button type="button" className="undac-btn undac-btn--ghost" onClick={() => consultar(version.id_version)}>Consultar</button></td></tr>)}</tbody></table>{!versiones.length ? <p>No hay versiones conservadas desde la instalación de esta función.</p> : null}</div>}
    </section>
  </div>, document.body);
}
