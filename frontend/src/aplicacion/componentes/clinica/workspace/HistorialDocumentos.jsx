import React, { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Download, Eye, FileClock, FileText, Info, Paperclip, ShieldCheck, X } from 'lucide-react';
import useModalDialog from '../../interfaz/useModalDialog.js';
import EstadoCarga from '../../interfaz/EstadoCarga.jsx';
import { listarVersionesClinicas, obtenerVersionClinica, enlaceExportacionClinica, mensajeError } from '../../../servicios/servicioClinico.js';
import { formatearFechaHora } from '../../../utilidades/fechas.mjs';

const etiquetas = { EXPEDIENTE: 'Expediente', ARCHIVOS: 'Archivos clínicos', ODONTOGRAMA: 'Odontograma', CONSENTIMIENTO: 'Consentimiento', ANTES_DE_EDITAR: 'Documento antes del cambio', GUARDAR: 'Documento guardado', OTORGADO: 'Consentimiento otorgado', REVOCADO: 'Consentimiento revocado', NEGADO: 'Consentimiento negado', formData: 'Datos clínicos', sectionStatus: 'Estado de las secciones', examinations: 'Evaluaciones', teeth: 'Piezas dentales', findings: 'Hallazgos', surfaces: 'Superficies', ranges: 'Hallazgos entre piezas', professional: 'Profesional responsable', cop: 'N.º COP', date: 'Fecha', reason: 'Motivo', status: 'Estado', closedAt: 'Fecha de cierre', createdAt: 'Fecha de registro', observations: 'Observaciones', specifications: 'Especificaciones', points: 'Coordenadas del hallazgo', state: 'Hallazgo', code: 'Código clínico', surface: 'Superficie', condition: 'Condición', note: 'Nota', draft: 'Borrador', closed: 'Cerrada', approved: 'Aprobada', review: 'En revisión', complete: 'Completa', 'in-progress': 'En progreso', 'not-started': 'Sin iniciar', good: 'Buen estado', bad: 'Mal estado', traced: 'Trazo registrado', schematic: 'Representación esquemática' };
const nombre = clave => etiquetas[clave] || clave.replace(/([a-záéíóú])([A-ZÁÉÍÓÚ])/g, '$1 $2').replaceAll('-', ' ').replaceAll('_', ' ');
function Datos({ valor }) {
  if (valor == null || valor === '') return <span>Sin registrar</span>;
  if (typeof valor !== 'object') return <span>{typeof valor === 'boolean' ? valor ? 'Sí' : 'No' : etiquetas[valor] ?? String(valor)}</span>;
  return <dl className="ou-documentos__datos">{Object.entries(valor).filter(([clave]) => !['id', 'revision', 'revisionServidor', 'url', 'archivoId', 'hash', 'patientId'].includes(clave)).map(([clave, dato]) => <div key={clave}><dt>{/^\d+$/.test(clave) ? `Registro ${Number(clave) + 1}` : nombre(clave)}</dt><dd><Datos valor={dato} /></dd></div>)}</dl>;
}

export default function HistorialDocumentos({ historiaId, onClose }) {
  const titulo = useId();
  const descripcion = useId();
  const disparador = useRef(document.activeElement);
  const dialogo = useModalDialog(true, onClose, disparador);
  const [versiones, setVersiones] = useState([]);
  const [seleccion, setSeleccion] = useState(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  const [consultando, setConsultando] = useState(null);
  const [reintento, setReintento] = useState(0);
  useEffect(() => {
    let vigente = true;
    setCargando(true);
    setError('');
    setSeleccion(null);
    listarVersionesClinicas(historiaId)
      .then(datos => { if (vigente) setVersiones(datos); })
      .catch(fallo => { if (vigente) setError(mensajeError(fallo, 'No se pudo cargar el historial.')); })
      .finally(() => { if (vigente) setCargando(false); });
    return () => { vigente = false; };
  }, [historiaId, reintento]);
  async function consultar(id) {
    setConsultando(id);
    try { setSeleccion(await obtenerVersionClinica(historiaId, id)); setError(''); }
    catch (fallo) { setError(mensajeError(fallo, 'No se pudo consultar la versión.')); }
    finally { setConsultando(null); }
  }
  return createPortal(<div className="admin-dialogo-fondo">
    <section ref={dialogo} className="admin-dialogo ou-documentos" role="dialog" aria-modal="true" aria-labelledby={titulo} aria-describedby={descripcion}>
      <header className="ou-documentos__cabecera">
        <span className="ou-documentos__icono" aria-hidden="true"><FileClock size={24} /></span>
        <div><h2 id={titulo}>Historial de documentos</h2><p id={descripcion}>Consulte las versiones anteriores del expediente clínico.</p></div>
        <button type="button" className="hc-mini-button" aria-label="Cerrar historial de documentos" onClick={onClose}><X size={20} /></button>
      </header>
      <div className="ou-documentos__contenido">
        <aside className="ou-documentos__aviso"><Info size={18} aria-hidden="true" /><p>Las versiones conservan el contenido anterior. Este registro de integridad no sustituye una firma digital.</p></aside>
        <div className="ou-documentos__herramientas">
          <div><h3>{seleccion ? 'Detalle de la versión' : 'Versiones conservadas'}</h3><p>{seleccion ? 'Contenido registrado en el momento del cambio.' : cargando ? 'Consultando el historial…' : `${versiones.length} ${versiones.length === 1 ? 'versión disponible' : 'versiones disponibles'}`}</p></div>
          <a className="undac-btn undac-btn--secondary" href={enlaceExportacionClinica(historiaId)} download><Download size={16} aria-hidden="true" />Descargar expediente<span className="sr-only"> con versiones y adjuntos</span></a>
        </div>
        {error ? <div className="ou-documentos__error" role="alert"><p>{error}</p>{!seleccion && !versiones.length ? <button type="button" className="hc-mini-button" onClick={() => setReintento(valor => valor + 1)}>Reintentar carga</button> : null}</div> : null}
        {cargando ? <EstadoCarga mensaje="Cargando versiones…" compacto /> : seleccion ? <>
          <button type="button" className="hc-mini-button" onClick={() => setSeleccion(null)}><ArrowLeft size={16} aria-hidden="true" />Volver a las versiones</button>
          <div className="ou-documentos__resumen"><div><span>Documento</span><strong>{nombre(seleccion.clase)}</strong></div><div><span>Responsable</span><strong>{seleccion.nombre_usuario || 'Sin registrar'}</strong></div><div><span>Fecha de registro</span><strong>{formatearFechaHora(seleccion.creado_en)}</strong></div></div>
          <p className={`ou-documentos__integridad${seleccion.integridadVerificada ? '' : ' ou-documentos__integridad--alerta'}`}><ShieldCheck size={18} aria-hidden="true" />{seleccion.integridadVerificada ? 'Integridad de esta versión comprobada.' : 'Advertencia: la integridad de esta versión no coincide.'}</p>
          {seleccion.integridadVerificada && seleccion.archivosConservados?.length ? <section className="ou-documentos__adjuntos"><h3>Archivos de esta versión</h3><ul>{seleccion.archivosConservados.map(archivo => <li key={archivo.archivoId}><Paperclip size={16} aria-hidden="true" /><a href={archivo.url} target="_blank" rel="noopener noreferrer">{archivo.nombre}<span className="sr-only"> (abre en otra pestaña)</span></a></li>)}</ul></section> : null}
          <Datos valor={seleccion.contenido} />
        </> : versiones.length ? <div className="ou-documentos__tabla"><table><caption className="sr-only">Versiones conservadas del expediente clínico</caption><thead><tr><th scope="col">Fecha</th><th scope="col">Documento</th><th scope="col">Acción</th><th scope="col">Responsable</th><th scope="col">Detalle</th></tr></thead><tbody>{versiones.map(version => <tr key={version.id_version}>
          <td data-etiqueta="Fecha"><time>{formatearFechaHora(version.creado_en)}</time></td>
          <td data-etiqueta="Documento"><span className="ou-documentos__tipo"><FileText size={16} aria-hidden="true" />{nombre(version.clase)}</span></td>
          <td data-etiqueta="Acción">{nombre(version.evento)}</td><td data-etiqueta="Responsable">{version.nombre_usuario || 'Sin registrar'}</td>
          <td data-etiqueta="Detalle"><button type="button" className="hc-mini-button" disabled={consultando !== null} aria-label={`Consultar versión ${version.id_version}`} onClick={() => consultar(version.id_version)}><Eye size={15} aria-hidden="true" />{consultando === version.id_version ? 'Consultando…' : 'Consultar'}</button></td>
        </tr>)}</tbody></table></div> : !error ? <div className="ou-documentos__vacio"><span className="ou-documentos__icono" aria-hidden="true"><FileClock size={28} /></span><h3>Aún no hay versiones conservadas</h3><p>No hay versiones conservadas desde la instalación de esta función.</p></div> : null}
        {consultando !== null ? <EstadoCarga mensaje="Consultando versión…" compacto /> : null}
      </div>
      <footer className="ou-documentos__pie"><span><Paperclip size={15} aria-hidden="true" />La descarga incluye versiones y adjuntos.</span><button type="button" className="undac-btn undac-btn--secondary" onClick={onClose}>Cerrar</button></footer>
    </section>
  </div>, document.body);
}
