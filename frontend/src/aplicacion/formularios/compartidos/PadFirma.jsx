import React from 'react';
import { createPortal } from 'react-dom';
import { Eraser, X } from 'lucide-react';

const ANCHO = 600;
const ALTO = 220;

function prepararLienzo(lienzo) {
  const contexto = lienzo?.getContext?.('2d');
  if (!contexto) return null;
  contexto.fillStyle = '#ffffff';
  contexto.fillRect(0, 0, ANCHO, ALTO);
  contexto.lineWidth = 2.4;
  contexto.lineCap = 'round';
  contexto.lineJoin = 'round';
  contexto.strokeStyle = '#0f172a';
  return contexto;
}

function lienzoABlob(lienzo) {
  return new Promise((resolve, reject) => {
    if (typeof lienzo.toBlob !== 'function') {
      reject(new Error('El navegador no permite exportar la firma.'));
      return;
    }
    lienzo.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('No se pudo generar la firma.'))), 'image/png');
  });
}

/** Modal para dibujar una firma con ratón, lápiz o dedo. Entrega un PNG con fondo blanco. */
export default function PadFirma({ titulo, alConfirmar, alCancelar }) {
  const lienzoRef = React.useRef(null);
  const contextoRef = React.useRef(null);
  const trazandoRef = React.useRef(false);
  const [vacio, setVacio] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    contextoRef.current = prepararLienzo(lienzoRef.current);
    const teclado = (evento) => { if (evento.key === 'Escape') alCancelar(); };
    window.addEventListener('keydown', teclado);
    return () => window.removeEventListener('keydown', teclado);
  }, [alCancelar]);

  function punto(evento) {
    const caja = lienzoRef.current.getBoundingClientRect();
    return {
      x: ((evento.clientX - caja.left) / (caja.width || ANCHO)) * ANCHO,
      y: ((evento.clientY - caja.top) / (caja.height || ALTO)) * ALTO,
    };
  }

  function iniciar(evento) {
    const contexto = contextoRef.current;
    if (!contexto) return;
    evento.preventDefault();
    lienzoRef.current.setPointerCapture?.(evento.pointerId);
    trazandoRef.current = true;
    const { x, y } = punto(evento);
    contexto.beginPath();
    contexto.moveTo(x, y);
    contexto.lineTo(x + 0.1, y + 0.1);
    contexto.stroke();
    setVacio(false);
  }

  function mover(evento) {
    if (!trazandoRef.current || !contextoRef.current) return;
    evento.preventDefault();
    const { x, y } = punto(evento);
    contextoRef.current.lineTo(x, y);
    contextoRef.current.stroke();
  }

  function terminar() {
    trazandoRef.current = false;
  }

  function limpiar() {
    contextoRef.current = prepararLienzo(lienzoRef.current);
    setVacio(true);
    setError('');
  }

  async function confirmar() {
    try {
      alConfirmar(await lienzoABlob(lienzoRef.current));
    } catch (errorExportacion) {
      setError(errorExportacion.message);
    }
  }

  return createPortal(
    <div className="undac-visor undac-pad-firma" role="dialog" aria-modal="true" aria-label={`Dibujar ${titulo}`}
      onMouseDown={(evento) => { if (evento.target === evento.currentTarget) alCancelar(); }}>
      <div className="undac-pad-firma__contenedor">
        <header className="undac-visor__cabecera">
          <div><strong>{titulo}</strong><span>Firme dentro del recuadro con el ratón, un lápiz o el dedo.</span></div>
          <button type="button" className="undac-visor__cerrar" aria-label="Cerrar" onClick={alCancelar}><X size={18} aria-hidden="true" /></button>
        </header>
        <canvas
          ref={lienzoRef}
          className="undac-pad-firma__lienzo"
          width={ANCHO}
          height={ALTO}
          aria-label="Área de firma"
          onPointerDown={iniciar}
          onPointerMove={mover}
          onPointerUp={terminar}
          onPointerLeave={terminar}
          onPointerCancel={terminar}
        />
        {error ? <p className="undac-upload-error" role="alert">{error}</p> : null}
        <footer className="undac-pad-firma__acciones">
          <button type="button" className="undac-btn undac-btn--secondary" onClick={limpiar}><Eraser size={14} aria-hidden="true" /> Limpiar</button>
          <span />
          <button type="button" className="undac-btn undac-btn--secondary" onClick={alCancelar}>Cancelar</button>
          <button type="button" className="undac-btn undac-btn--primary" onClick={confirmar} disabled={vacio}>Usar firma</button>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
