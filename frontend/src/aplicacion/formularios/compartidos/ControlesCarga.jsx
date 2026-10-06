import React from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, FileText, ImagePlus, Upload, X } from 'lucide-react';

/** Ancho de separación entre celdas del carrusel (debe coincidir con el CSS). */
const HUECO_CARRUSEL = 10;

/**
 * Controles de carga de archivos e imágenes (solo frontend).
 * - Las imágenes se reducen en el navegador y se guardan como vista previa local.
 * - Los documentos solo conservan metadatos (nombre, tipo y tamaño).
 * - Nada se sube a un servidor: la adjuntada real llega en la fase de backend.
 */

const ENTORNO_PRUEBA = typeof navigator !== 'undefined' && /jsdom|node/i.test(String(navigator.userAgent || ''));

export const ACEPTAR_IMAGENES = 'image/*';
export const ACEPTAR_DOCUMENTOS = '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.png,.jpg,.jpeg';

export function formatoTamano(bytes = 0) {
  const total = Number(bytes) || 0;
  if (total < 1024) return `${total} B`;
  if (total < 1024 * 1024) return `${Math.round(total / 1024)} KB`;
  return `${(total / (1024 * 1024)).toFixed(1)} MB`;
}

export function extensionDe(nombre = '') {
  const partes = String(nombre).split('.');
  return partes.length > 1 ? partes.pop().toUpperCase() : 'ARCHIVO';
}

export function coincideConAceptacion(archivo, aceptar) {
  if (!aceptar) return true;
  const nombre = String(archivo?.name || '').toLowerCase();
  const tipo = String(archivo?.type || '').toLowerCase();
  return String(aceptar)
    .split(',')
    .map((parte) => parte.trim().toLowerCase())
    .filter(Boolean)
    .some((patron) => {
      if (patron.startsWith('.')) return nombre.endsWith(patron);
      if (patron.endsWith('/*')) return tipo.startsWith(patron.slice(0, -1));
      return tipo === patron;
    });
}

function leerComoDataURL(archivo) {
  return new Promise((resolve, reject) => {
    if (typeof FileReader === 'undefined') {
      reject(new Error('Este navegador no permite leer archivos.'));
      return;
    }
    const lector = new FileReader();
    lector.onload = () => resolve(String(lector.result));
    lector.onerror = () => reject(new Error('No se pudo leer el archivo seleccionado.'));
    lector.onabort = () => reject(new Error('Lectura de archivo cancelada.'));
    lector.readAsDataURL(archivo);
  });
}

function escalarImagen(fuente, { maxDimension, calidad }) {
  return new Promise((resolve) => {
    const imagen = new Image();
    let terminado = false;
    const finalizar = (resultado) => {
      if (terminado) return;
      terminado = true;
      resolve(resultado);
    };
    // Si el navegador no decodifica la imagen, se conserva el original.
    const tiempo = setTimeout(() => finalizar(fuente), 1500);
    imagen.onerror = () => { clearTimeout(tiempo); finalizar(fuente); };
    imagen.onload = () => {
      clearTimeout(tiempo);
      try {
        const ancho = imagen.naturalWidth || imagen.width;
        const alto = imagen.naturalHeight || imagen.height;
        const escala = Math.min(1, maxDimension / Math.max(ancho, alto, 1));
        const lienzo = document.createElement('canvas');
        lienzo.width = Math.max(1, Math.round(ancho * escala));
        lienzo.height = Math.max(1, Math.round(alto * escala));
        const contexto = lienzo.getContext('2d');
        if (!contexto) { finalizar(fuente); return; }
        contexto.drawImage(imagen, 0, 0, lienzo.width, lienzo.height);
        finalizar(lienzo.toDataURL('image/jpeg', calidad));
      } catch {
        finalizar(fuente);
      }
    };
    imagen.src = fuente;
  });
}

/** Devuelve una vista previa local (data URL) lista para mostrar en la interfaz. */
export async function prepararImagen(archivo, { maxDimension = 900, calidad = 0.65 } = {}) {
  const fuente = await leerComoDataURL(archivo);
  const esImagen = String(archivo?.type || '').startsWith('image/');
  if (!esImagen || ENTORNO_PRUEBA) return fuente;
  return escalarImagen(fuente, { maxDimension, calidad });
}

function nuevoId(archivo) {
  const aleatorio = Math.random().toString(36).slice(2, 8);
  return `${archivo.name}-${archivo.size}-${archivo.lastModified}-${aleatorio}`;
}

function BotonCarga({ onClick, children, disabled = false }) {
  return (
    <button type="button" className="undac-btn undac-btn--secondary" onClick={onClick} disabled={disabled}>
      <Upload size={14} aria-hidden="true" />
      {children}
    </button>
  );
}

function TarjetaImagen({ adjunto, onQuitar, onAbrir }) {
  return (
    <figure className="undac-carousel__cell undac-photo-tile">
      <button type="button" className="undac-photo-tile__abrir" onClick={onAbrir} aria-label={`Ampliar ${adjunto.nombre}`}>
        {adjunto.vistaPrevia
          ? <img src={adjunto.vistaPrevia} alt={`Vista previa de ${adjunto.nombre}`} />
          : <span className="undac-photo-tile__fallback" aria-hidden="true"><ImagePlus size={18} /></span>}
      </button>
      <figcaption><strong title={adjunto.nombre}>{adjunto.nombre}</strong><small>{formatoTamano(adjunto.tamano)}</small></figcaption>
      <button type="button" className="undac-photo-tile__remove" aria-label={`Eliminar ${adjunto.nombre}`} onClick={() => onQuitar(adjunto)}>
        <X size={14} aria-hidden="true" />
      </button>
    </figure>
  );
}

function ItemArchivo({ adjunto, onQuitar }) {
  return (
    <li className="undac-file-item">
      <span className="undac-file-item__icon" aria-hidden="true"><FileText size={16} /></span>
      <span className="undac-file-item__copy">
        <strong title={adjunto.nombre}>{adjunto.nombre}</strong>
        <small>{extensionDe(adjunto.nombre)} · {formatoTamano(adjunto.tamano)}</small>
      </span>
      <button type="button" className="undac-file-item__remove" aria-label={`Eliminar ${adjunto.nombre}`} onClick={() => onQuitar(adjunto)}>
        <X size={14} aria-hidden="true" />
      </button>
    </li>
  );
}

function desplazarTira(tira, izquierda) {
  if (!tira) return;
  try {
    if (!ENTORNO_PRUEBA && typeof tira.scrollTo === 'function') tira.scrollTo({ left: izquierda, behavior: 'smooth' });
    else tira.scrollLeft = izquierda;
  } catch {
    try { tira.scrollLeft = izquierda; } catch { /* sin desplazamiento disponible */ }
  }
}

/**
 * Modal con la imagen ampliada. El contenedor ocupa como máximo 1000 x 700 px
 * y se ajusta al viewport en tablets y móviles.
 */
function VisorImagen({ adjuntos, indice, alCambiar, alCerrar, alQuitar }) {
  const cerrarRef = React.useRef(null);
  const adjunto = adjuntos[indice];
  const anterior = indice > 0;
  const siguiente = indice < adjuntos.length - 1;

  React.useEffect(() => {
    cerrarRef.current?.focus();
  }, []);

  React.useEffect(() => {
    const teclado = (evento) => {
      if (evento.key === 'Escape') alCerrar();
      else if (evento.key === 'ArrowRight' && indice < adjuntos.length - 1) alCambiar(indice + 1);
      else if (evento.key === 'ArrowLeft' && indice > 0) alCambiar(indice - 1);
    };
    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', teclado);
    return () => {
      window.removeEventListener('keydown', teclado);
      document.body.style.overflow = overflowPrevio;
    };
  }, [adjuntos.length, indice, alCambiar, alCerrar]);

  if (!adjunto) return null;

  return createPortal(
    <div
      className="undac-visor"
      role="dialog"
      aria-modal="true"
      aria-label={`Imagen ampliada de ${adjunto.nombre}`}
      onMouseDown={(evento) => { if (evento.target === evento.currentTarget) alCerrar(); }}
    >
      <div className="undac-visor__contenedor">
        <header className="undac-visor__cabecera">
          <div><strong title={adjunto.nombre}>{adjunto.nombre}</strong><span>{indice + 1} de {adjuntos.length} · {formatoTamano(adjunto.tamano)}</span></div>
          <button ref={cerrarRef} type="button" className="undac-visor__cerrar" aria-label="Cerrar visor" onClick={alCerrar}>
            <X size={18} aria-hidden="true" />
          </button>
        </header>
        <div className="undac-visor__lienzo">
          {anterior ? (
            <button type="button" className="undac-visor__flecha undac-visor__flecha--anterior" aria-label="Imagen anterior" onClick={() => alCambiar(indice - 1)}>
              <ChevronLeft size={22} aria-hidden="true" />
            </button>
          ) : null}
          <img className="undac-visor__imagen" src={adjunto.vistaPrevia} alt={`Imagen ampliada de ${adjunto.nombre}`} />
          {siguiente ? (
            <button type="button" className="undac-visor__flecha undac-visor__flecha--siguiente" aria-label="Imagen siguiente" onClick={() => alCambiar(indice + 1)}>
              <ChevronRight size={22} aria-hidden="true" />
            </button>
          ) : null}
        </div>
        <footer className="undac-visor__pie">
          <span>Use las flechas o el teclado para recorrer las imágenes · Esc para cerrar</span>
          <button type="button" className="undac-visor__quitar" onClick={() => alQuitar(adjunto)}>
            <X size={14} aria-hidden="true" /> Eliminar imagen
          </button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}

/**
 * Bloque genérico de carga.
 * tipo="imagen": rejilla de vistas con vista previa de lo ya cargado.
 * tipo="archivo": botón de carga + listado de documentos adjuntos.
 */
export function BloqueCarga({
  title,
  description,
  tipo = 'imagen',
  count = 1,
  maximoArchivos = 10,
  value,
  onChange,
  accept,
  multiple = true,
  nota = 'Los archivos elegidos se guardan localmente en esta demostración; se adjuntarán al servidor cuando se conecte el backend.',
}) {
  const controlado = typeof onChange === 'function';
  const [interno, setInterno] = React.useState([]);
  const adjuntos = Array.isArray(controlado ? value : interno) ? (controlado ? value : interno) : [];
  const definir = (siguientes) => (controlado ? onChange(siguientes) : setInterno(siguientes));

  const [procesando, setProcesando] = React.useState(false);
  const [error, setError] = React.useState('');
  const [arrastrando, setArrastrando] = React.useState(false);
  const inputRef = React.useRef(null);

  const esImagen = tipo !== 'archivo';
  // Carrusel de miniaturas de tamaño fijo.
  const tiraRef = React.useRef(null);
  const disparoRef = React.useRef(null);
  const longitudPrevia = React.useRef(0);
  const [posicion, setPosicion] = React.useState(0);
  const [maxPosicion, setMaxPosicion] = React.useState(0);
  const [visor, setVisor] = React.useState(null);
  const limite = esImagen ? (Number(count) > 0 ? Number(count) : Infinity) : Math.max(1, Number(maximoArchivos) || 10);
  const sinEspacio = adjuntos.length >= limite;
  const limiteVisible = Number.isFinite(limite) ? `${limite}` : `${adjuntos.length}`;
  const aceptar = accept ?? (esImagen ? ACEPTAR_IMAGENES : ACEPTAR_DOCUMENTOS);
  const descripcion = description ?? (esImagen
    ? 'Espacio preparado para documentar evidencia visual de la evaluación.'
    : 'Adjunte los documentos de respaldo en PDF, Word, Excel o imagen.');

  function abrirSelector() {
    if (!sinEspacio || !esImagen) inputRef.current?.click();
  }

  const vacantes = esImagen && Number.isFinite(limite) ? Math.max(0, limite - adjuntos.length) : 0;
  const totalCeldas = adjuntos.length + vacantes;

  /** Lee el tamaño real de las celdas para mover el carrusel de forma precisa. */
  function medirCarrusel() {
    const tira = tiraRef.current;
    const celda = tira?.querySelector('.undac-carousel__cell');
    const anchoCelda = (celda?.getBoundingClientRect().width || 140) + HUECO_CARRUSEL;
    const visibles = Math.max(1, Math.floor((tira?.clientWidth || 0) / anchoCelda));
    return { anchoCelda, maxPosicion: Math.max(0, totalCeldas - visibles) };
  }

  /** Lleva el carrusel a una posición concreta sin cambiar el tamaño de las celdas. */
  function moverA(destino) {
    const { anchoCelda, maxPosicion: limitePosicion } = medirCarrusel();
    const posicionDestino = Math.max(0, Math.min(destino, limitePosicion));
    setPosicion(posicionDestino);
    desplazarTira(tiraRef.current, posicionDestino * anchoCelda);
  }

  function alDesplazar() {
    const { anchoCelda, maxPosicion: limitePosicion } = medirCarrusel();
    const tira = tiraRef.current;
    const posicionActual = Math.round((tira?.scrollLeft || 0) / anchoCelda);
    setPosicion(Math.max(0, Math.min(posicionActual, limitePosicion)));
  }

  React.useEffect(() => {
    if (!esImagen) return undefined;
    const { maxPosicion: limitePosicion } = medirCarrusel();
    setMaxPosicion(limitePosicion);
    setPosicion((actual) => Math.min(actual, limitePosicion));
    const alRedimensionar = () => {
      const { maxPosicion: siguiente } = medirCarrusel();
      setMaxPosicion(siguiente);
      setPosicion((actual) => Math.min(actual, siguiente));
    };
    window.addEventListener?.('resize', alRedimensionar);
    return () => window.removeEventListener?.('resize', alRedimensionar);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [esImagen, adjuntos.length, totalCeldas]);

  React.useEffect(() => {
    if (!esImagen) return undefined;
    // Al subir una imagen nueva, el carrusel la deja visible.
    if (adjuntos.length > longitudPrevia.current) moverA(adjuntos.length - 1);
    longitudPrevia.current = adjuntos.length;
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adjuntos.length, esImagen]);

  async function incorporar(lista) {
    const archivos = Array.from(lista || []);
    if (!archivos.length) return;
    setError('');

    const validos = archivos.filter((archivo) => coincideConAceptacion(archivo, aceptar));
    if (!validos.length) {
      setError('El archivo elegido no tiene un formato permitido en este bloque.');
      return;
    }

    setProcesando(true);
    try {
      const preparados = await Promise.all(validos.map(async (archivo) => {
        const adjunto = { id: nuevoId(archivo), nombre: archivo.name, tamano: archivo.size, tipo: archivo.type || 'application/octet-stream' };
        if (esImagen) adjunto.vistaPrevia = await prepararImagen(archivo);
        return adjunto;
      }));

      const espacio = Math.max(0, limite - adjuntos.length);
      const aceptados = preparados.slice(0, espacio);
      const sobrantes = preparados.length - aceptados.length;
      const ignorados = archivos.length - validos.length;

      if (!aceptados.length) {
        setError(esImagen
          ? `Este bloque ya tiene sus ${limiteVisible} vista${Number(limite) === 1 ? '' : 's'} completas.`
          : `Este bloque admite hasta ${limiteVisible} archivos.`);
        return;
      }

      definir([...adjuntos, ...aceptados]);

      if (sobrantes > 0) {
        setError(`Solo se adjuntaron ${aceptados.length} de ${preparados.length} porque el bloque admite ${limiteVisible} ${esImagen ? 'vistas' : 'archivos'}.`);
      } else if (ignorados > 0) {
        setError(`Se ignoraron ${ignorados} archivo${ignorados === 1 ? '' : 's'} por formato no permitido.`);
      }
    } catch {
      setError('No fue posible preparar la vista previa del archivo elegido.');
    } finally {
      setProcesando(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function quitar(adjunto) {
    definir(adjuntos.filter((item) => item.id !== adjunto.id));
    setError('');
  }

  function abrirVisor(indice, disparo) {
    disparoRef.current = disparo || null;
    setVisor(indice);
  }

  function cerrarVisor() {
    setVisor(null);
    const disparo = disparoRef.current;
    disparoRef.current = null;
    if (disparo && typeof disparo.focus === 'function') disparo.focus();
  }

  function quitarDelVisor(adjunto) {
    const restantes = adjuntos.filter((item) => item.id !== adjunto.id);
    definir(restantes);
    setError('');
    if (!restantes.length) { cerrarVisor(); return; }
    setVisor((actual) => Math.min(actual ?? 0, restantes.length - 1));
  }

  function arrastrarSobre(evento) {
    evento.preventDefault();
    setArrastrando(true);
  }

  function soltar(evento) {
    evento.preventDefault();
    setArrastrando(false);
    incorporar(evento.dataTransfer?.files);
  }

  const input = (
    <input
      ref={inputRef}
      type="file"
      className="undac-upload-input"
      aria-label={esImagen ? `Cargar imágenes en ${title}` : `Cargar archivos en ${title}`}
      accept={aceptar}
      multiple={multiple}
      hidden
      onChange={(evento) => incorporar(evento.target.files)}
    />
  );

  if (esImagen) {
    const estado = procesando
      ? 'Preparando la vista previa…'
      : adjuntos.length
        ? `${adjuntos.length} de ${limiteVisible} vista${limite === 1 ? '' : 's'} adjunta${limite === 1 ? '' : 's'}`
        : 'Sin imágenes adjuntas';

    return (
      <section
        className={`undac-photo-block${arrastrando ? ' is-dragging' : ''}`}
        role="group"
        aria-label={title}
        onDragOver={arrastrarSobre}
        onDragLeave={() => setArrastrando(false)}
        onDrop={soltar}
      >
        <div className="undac-photo-block__head">
          <div><strong>{title}</strong><span>{descripcion}</span></div>
          <span className="undac-photo-block__count">{Number.isFinite(limite) ? `${limite} vista${limite === 1 ? '' : 's'} sugerida${limite === 1 ? '' : 's'}` : 'Adjuntos'}</span>
        </div>
        <div className="undac-photo-block__toolbar">
          <BotonCarga onClick={abrirSelector} disabled={procesando || sinEspacio}>
            {procesando ? 'Preparando…' : 'Cargar imágenes'}
          </BotonCarga>
          <p className="undac-photo-block__status" role="status">{estado}</p>
        </div>

        <div className="undac-carousel">
          <div className="undac-carousel__viewport" ref={tiraRef} role="group" aria-label={`Carrusel de ${title}`} onScroll={alDesplazar}>
            {adjuntos.map((adjunto, indice) => (
              <TarjetaImagen
                key={adjunto.id}
                adjunto={adjunto}
                onQuitar={quitar}
                onAbrir={(evento) => abrirVisor(indice, evento.currentTarget)}
              />
            ))}
            {Array.from({ length: vacantes }, (_, index) => (
              <button type="button" className="undac-carousel__cell undac-photo-slot" key={`vista-${adjuntos.length + index + 1}`} onClick={abrirSelector} disabled={procesando}>
                <span aria-hidden="true"><ImagePlus size={18} /></span>
                <strong>{limite > 1 ? `Vista ${adjuntos.length + index + 1}` : 'Área de imagen'}</strong>
                <small>Pendiente de adjuntar</small>
              </button>
            ))}
          </div>
          <button
            type="button"
            className="undac-carousel__flecha undac-carousel__flecha--anterior"
            aria-label="Ver elementos anteriores"
            disabled={posicion <= 0}
            onClick={() => moverA(posicion - 1)}
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="undac-carousel__flecha undac-carousel__flecha--siguiente"
            aria-label="Ver elementos siguientes"
            disabled={posicion >= maxPosicion}
            onClick={() => moverA(posicion + 1)}
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>

        {error ? <p className="undac-upload-error" role="alert">{error}</p> : null}
        <p className="undac-upload-note">{nota}</p>
        {input}
        {visor !== null && adjuntos[visor] ? (
          <VisorImagen
            adjuntos={adjuntos}
            indice={visor}
            alCambiar={(siguiente) => setVisor(siguiente)}
            alCerrar={cerrarVisor}
            alQuitar={quitarDelVisor}
          />
        ) : null}
      </section>
    );
  }

  return (
    <section
      className={`undac-file-block${arrastrando ? ' is-dragging' : ''}`}
      role="group"
      aria-label={title}
      onDragOver={arrastrarSobre}
      onDragLeave={() => setArrastrando(false)}
      onDrop={soltar}
    >
      <div className="undac-photo-block__head">
        <div><strong>{title}</strong><span>{descripcion}</span></div>
        <span className="undac-photo-block__count">
          {adjuntos.length ? `${adjuntos.length} archivo${adjuntos.length === 1 ? '' : 's'} adjunto${adjuntos.length === 1 ? '' : 's'}` : 'Sin archivos'}
        </span>
      </div>
      <button type="button" className="undac-file-zone" onClick={abrirSelector} disabled={procesando}>
        <span className="undac-file-zone__icon" aria-hidden="true"><Upload size={18} /></span>
        <strong>{procesando ? 'Preparando archivos…' : 'Cargar archivos'}</strong>
        <small>Haga clic para elegir desde su equipo, o arrastre los archivos hasta aquí. Formatos admitidos: {aceptar}.</small>
      </button>
      <p className="undac-photo-block__status" role="status">
        {adjuntos.length ? `${adjuntos.length} de ${limite} archivo${limite === 1 ? '' : 's'} adjunto${limite === 1 ? '' : 's'}` : 'Sin archivos adjuntos'}
      </p>
      {adjuntos.length ? (
        <ul className="undac-file-list">
          {adjuntos.map((adjunto) => <ItemArchivo key={adjunto.id} adjunto={adjunto} onQuitar={quitar} />)}
        </ul>
      ) : null}
      {error ? <p className="undac-upload-error" role="alert">{error}</p> : null}
      <p className="undac-upload-note">{nota}</p>
      {input}
    </section>
  );
}

/** Slot individual de constancia (firma, huella) con carga de imagen. */
export function SlotConstancia({ label, value, onChange, textoPendiente = 'Constancia pendiente', accept = ACEPTAR_IMAGENES }) {
  const inputRef = React.useRef(null);
  const [error, setError] = React.useState('');
  const adjunto = value || null;

  async function cargar(lista) {
    const archivo = Array.from(lista || [])[0];
    if (!archivo) return;
    if (!coincideConAceptacion(archivo, accept)) {
      setError('Formato no permitido: adjunte una imagen.');
      return;
    }
    try {
      setError('');
      onChange?.({ id: nuevoId(archivo), nombre: archivo.name, tamano: archivo.size, tipo: archivo.type, vistaPrevia: await prepararImagen(archivo) });
    } catch {
      setError('No fue posible preparar la vista previa de la imagen.');
    } finally {
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <>
      {adjunto ? (
        <div className="undac-signature-slot is-loaded">
          <img src={adjunto.vistaPrevia} alt={`Vista previa de ${label}`} />
          <span>Imagen adjunta</span>
          <strong>{label}</strong>
          <button type="button" className="undac-signature-slot__remove" aria-label={`Eliminar ${label}`} onClick={() => onChange?.(null)}>
            <X size={13} aria-hidden="true" />
          </button>
        </div>
      ) : (
        <button type="button" className="undac-signature-slot undac-signature-slot--carga" onClick={() => inputRef.current?.click()}>
          <span>{textoPendiente}</span>
          <strong>{label}</strong>
          <small>Cargar imagen</small>
        </button>
      )}
      <input ref={inputRef} type="file" className="undac-upload-input" aria-label={`Cargar imagen de ${label}`} accept={accept} hidden onChange={(evento) => cargar(evento.target.files)} />
      {error ? <p className="undac-upload-error" role="alert">{error}</p> : null}
    </>
  );
}
