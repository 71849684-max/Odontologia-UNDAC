import React, { useRef } from 'react';
import { clinicalColor } from './odontograma.config.mjs';
import { CompactTooth, ToothDrawing, isUpper } from './GraficoOdontograma.jsx';

export default function ShapeEditor({ number, tooth, surface, state, points, onChange, disabled, condition }) {
  const svgRef = useRef(null), drawing = useRef(false);
  const needsDrawing = state.graphic.startsWith('draw-');
  const point = (event) => {
    const svg = svgRef.current, matrix = svg.getScreenCTM();
    if (!matrix) return null;
    const p = svg.createSVGPoint(); p.x = event.clientX; p.y = event.clientY;
    const local = p.matrixTransform(matrix.inverse());
    return [Math.round(Math.max(0, Math.min(100, local.x))), Math.round(Math.max(0, Math.min(100, isUpper(number) ? local.y : 100 - local.y)))];
  };
  const color = clinicalColor({ state: state.id, condition });
  if (!needsDrawing) return <div className="nts-compact-preview">
    <strong>Pieza {number}</strong>
    <CompactTooth number={number} tooth={tooth} selectedSurface={surface} interactive={false} />
  </div>;
  return <div className="nts-shape-editor">
    <svg ref={svgRef} viewBox="0 0 100 110" aria-label={`Dibujo ampliado de pieza ${number}`} className={needsDrawing && !disabled ? 'nts-drawing' : ''}
      onPointerDown={(event) => { if (!needsDrawing || disabled) return; const p = point(event); if (!p) return; drawing.current = true; event.currentTarget.setPointerCapture(event.pointerId); onChange([...points, p]); }}
      onPointerMove={(event) => { if (!drawing.current || disabled) return; const p = point(event); if (p) onChange((old) => [...old, p]); }}
      onPointerUp={() => { drawing.current = false; }} onPointerCancel={() => { drawing.current = false; }}>
      <g transform={isUpper(number) ? undefined : 'translate(0 100) scale(1 -1)'}>
        <ToothDrawing number={number} tooth={tooth} selectedSurface={surface} interactive={false} />
        {needsDrawing && points.length > 0 && (state.graphic === 'draw-fill' ? <polygon points={points.map((p) => p.join(',')).join(' ')} fill={color} fillOpacity=".65" /> : <polyline points={points.map((p) => p.join(',')).join(' ')} fill="none" stroke={color} strokeWidth="2" />)}
      </g>
    </svg>
    {needsDrawing && <><p>Dibuje la forma observada con el puntero o toque varios puntos. Para lesiones y restauraciones definitivas, el contorno se cierra y rellena.</p><button type="button" className="undac-btn undac-btn--ghost" disabled={disabled || !points.length} onClick={() => onChange([])}>Borrar trazo del borrador</button></>}
  </div>;
}

