import React from 'react';
import { marcar, texto, VACIO } from './documentoClinico.mjs';

export function Bloque({ titulo, subtitulo, children }) {
  return <section className="doc-bloque">
    <h3>{titulo}</h3>
    {subtitulo ? <p className="doc-bloque__subtitulo">{subtitulo}</p> : null}
    {children}
  </section>;
}

export function SubBloque({ titulo, children }) {
  return <section className="doc-subbloque">
    <h4>{titulo}</h4>
    {children}
  </section>;
}

export function Campo({ etiqueta, valor, amplio = false }) {
  return <div className={`doc-campo${amplio ? ' doc-campo--amplio' : ''}`}>
    <span>{etiqueta}</span>
    <strong>{texto(valor)}</strong>
  </div>;
}

export function Opcion({ etiqueta, marcado }) {
  return <span className={marcado ? 'is-marcado' : ''}>
    <i aria-hidden="true">{marcado ? '☒' : '☐'}</i> {etiqueta}
  </span>;
}

export function GrupoOpciones({ etiqueta, valor, opciones = [] }) {
  const normalizadas = opciones.map((opcion) => (typeof opcion === 'string' ? { valor: opcion, etiqueta: opcion } : opcion));
  return <div className="doc-campo doc-campo--opciones">
    <span>{etiqueta}</span>
    <div className="doc-opciones">
      {normalizadas.map((opcion) => <Opcion key={opcion.valor} etiqueta={opcion.etiqueta} marcado={marcar(valor, [opcion.valor])[0].marcado} />)}
    </div>
  </div>;
}

export function Texto({ etiqueta, valor, lineas = 3 }) {
  const contenido = String(valor ?? '').trim();
  return <div className="doc-texto-campo">
    <span>{etiqueta}</span>
    <div className="doc-texto" style={{ minHeight: `${lineas * 5.2}mm` }}>
      {contenido ? <p>{contenido}</p> : <em>Sin registro</em>}
    </div>
  </div>;
}

export function Tabla({ columnas = [], filas = [], vacio = 'Sin registros' }) {
  return <div className="doc-tabla-wrap">
    <table className="doc-tabla">
      <thead>
        <tr>{columnas.map((columna) => <th key={columna.clave ?? columna}>{columna.etiqueta ?? columna}</th>)}</tr>
      </thead>
      <tbody>
        {filas.length ? filas.map((fila, indice) => <tr key={indice}>
          {fila.map((celda, columna) => <td key={columna}>{celda === null || celda === undefined || celda === '' ? VACIO : celda}</td>)}
        </tr>) : <tr><td colSpan={Math.max(columnas.length, 1)} className="doc-tabla__vacia">{vacio}</td></tr>}
      </tbody>
    </table>
  </div>;
}

function fuenteAdjunto(adjunto) {
  if (!adjunto) return '';
  if (typeof adjunto === 'string') return adjunto;
  return adjunto.vistaPrevia || adjunto.url || '';
}

export function Firma({ etiqueta, valor, nombre }) {
  const fuente = fuenteAdjunto(valor);
  return <div className="doc-firma">
    <div className="doc-firma__espacio">{fuente ? <img src={fuente} alt={etiqueta} /> : null}</div>
    <span>{etiqueta}</span>
    {nombre ? <small>{nombre}</small> : null}
  </div>;
}

export function Galeria({ etiqueta, adjuntos = [] }) {
  const lista = Array.isArray(adjuntos) ? adjuntos.filter(Boolean) : [];
  return <div className="doc-galeria-bloque">
    <span className="doc-galeria__titulo">{etiqueta}</span>
    {lista.length ? <div className="doc-galeria">
      {lista.map((adjunto, indice) => {
        const fuente = fuenteAdjunto(adjunto);
        return <figure key={adjunto.id ?? `${indice}`}>
          {fuente ? <img src={fuente} alt={adjunto.nombre || `${etiqueta} ${indice + 1}`} /> : <div className="doc-galeria__vacia">Sin vista</div>}
          <figcaption>{texto(adjunto.nombre, `Imagen ${indice + 1}`)}</figcaption>
        </figure>;
      })}
    </div> : <p className="doc-vacio">Sin imágenes registradas.</p>}
  </div>;
}

export function ListaAdjuntos({ etiqueta, adjuntos = [] }) {
  const lista = Array.isArray(adjuntos) ? adjuntos.filter(Boolean) : [];
  return <div className="doc-lista-adjuntos">
    <span className="doc-galeria__titulo">{etiqueta}</span>
    {lista.length ? <ul>{lista.map((adjunto, indice) => <li key={adjunto.id ?? `${indice}`}>{texto(adjunto.nombre, `Archivo ${indice + 1}`)}</li>)}</ul> : <p className="doc-vacio">Sin archivos adjuntos.</p>}
  </div>;
}

export function Lista({ etiqueta, valores = [] }) {
  const lista = Array.isArray(valores) ? valores.filter(Boolean) : [];
  return <div className="doc-lista">
    <span>{etiqueta}</span>
    {lista.length ? <ul>{lista.map((valor, indice) => <li key={`${valor}-${indice}`}>{valor}</li>)}</ul> : <p className="doc-vacio">Sin registro.</p>}
  </div>;
}

export function Nota({ children }) {
  return <p className="doc-nota">{children}</p>;
}
