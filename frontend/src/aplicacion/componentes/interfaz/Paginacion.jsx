import { Children, useEffect, useMemo, useState } from 'react';

export default function Paginacion({ elementos = [], tamanos = [10, 25, 50], inicial = 10, etiqueta = 'registros', children }) {
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(inicial);
  const totalPaginas = Math.max(1, Math.ceil(elementos.length / porPagina));
  const paginaActual = Math.min(pagina, totalPaginas);
  const inicio = (paginaActual - 1) * porPagina;
  const visibles = useMemo(() => elementos.slice(inicio, inicio + porPagina), [elementos, inicio, porPagina]);

  useEffect(() => { setPagina(1); }, [elementos.length, porPagina]);

  const desde = elementos.length ? inicio + 1 : 0;
  const hasta = Math.min(inicio + porPagina, elementos.length);
  const primeraPagina = Math.max(1, Math.min(paginaActual - 2, totalPaginas - 4));
  const paginas = Array.from({ length: Math.min(5, totalPaginas) }, (_, indice) => primeraPagina + indice);

  return <>
    {Children.toArray(children(visibles))}
    <nav className="hc-pagination" aria-label={`Paginación de ${etiqueta}`}>
      <span className="hc-pagination__summary">Mostrando {desde}–{hasta} de {elementos.length} {etiqueta}</span>
      <div className="hc-pagination__controls">
        <label><span className="sr-only">Registros por página</span><select aria-label="Registros por página" value={porPagina} onChange={(event) => setPorPagina(Number(event.target.value))}>{tamanos.map((tamano) => <option key={tamano} value={tamano}>{tamano} por página</option>)}</select></label>
        <button type="button" className="hc-mini-button" disabled={paginaActual <= 1} onClick={() => setPagina((actual) => actual - 1)}>Anterior</button>
        <span className="hc-pagination__pages">{paginas.map((numero) => <button type="button" key={numero} className={numero === paginaActual ? 'is-active' : ''} aria-current={numero === paginaActual ? 'page' : undefined} onClick={() => setPagina(numero)}>{numero}</button>)}</span>
        <button type="button" className="hc-mini-button" disabled={paginaActual >= totalPaginas} onClick={() => setPagina((actual) => actual + 1)}>Siguiente</button>
      </div>
    </nav>
  </>;
}
