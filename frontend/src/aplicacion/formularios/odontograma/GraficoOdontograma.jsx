import React from 'react';
import { clinicalColor, markCode, stateFor, surfacePosition, toothSurfaces } from './odontograma.config.mjs';
import { toothFindings } from './odontogramaRegistro.mjs';
import { isMolar, isUpper, surfacePolygons, toothCrownPolygons, toothIncisalPath, toothRootsPath } from './odontogramaGeometria.mjs';

export { isUpper, surfacePolygons };
// La presentación alarga el esquema, sin cambiar las coordenadas guardadas.
export const toothDrawingScaleY = 1.7;
const toothColumnWidth = 60;
// La arcada inferior se refleja al dibujar; convierta la posición visual al plano local.
export function toothSurfacePolygon(number, surface) {
  const position = surfacePosition(number, surface);
  const polygons = toothCrownPolygons(number);
  return polygons[!isUpper(number) ? ({ top: 'bottom', bottom: 'top' }[position] || position) : position];
}

/** Punto medio de una superficie, en coordenadas locales del dibujo, para rotularla. */
export function surfaceLabelPoint(number, surface) {
  const puntos = String(toothSurfacePolygon(number, surface)).trim().split(/\s+/)
    .map((par) => par.split(',').map(Number));
  const total = puntos.length || 1;
  const x = puntos.reduce((suma, [valor]) => suma + valor, 0) / total;
  const y = puntos.reduce((suma, [, valor]) => suma + valor, 0) / total;
  return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
}

/**
 * Nombre corto de cada sección dibujado sobre la superficie.
 * El texto contrarresta el reflejo de la arcada inferior y el alargado vertical del esquema.
 */
function SurfaceLabels({ number }) {
  return <g className="nts-surface-labels" pointerEvents="none" aria-hidden="true">
    {toothSurfaces.map((surface) => {
      const { x, y } = surfaceLabelPoint(number, surface.id);
      const escalaY = (isUpper(number) ? 1 : -1) / toothDrawingScaleY;
      return <text key={surface.id} className="nts-surface-label" textAnchor="middle" dy=".34em"
        transform={`translate(${x} ${y}) scale(1 ${escalaY})`}>{surface.short}</text>;
    })}
  </g>;
}

function ToothMark({ mark, number }) {
  const state = stateFor(mark.state), color = clinicalColor(mark), points = mark.points.map((p) => p.join(',')).join(' ');
  let shape = null;
  switch (state.graphic) {
    case 'draw-fill': shape = <polygon points={points} fill={color} />; break;
    case 'draw-line': shape = <polyline points={points} />; break;
    case 'missing': shape = <path d="M8 10L92 95M92 10L8 95" />; break;
    case 'crown': shape = <rect x="6" y="58" width="88" height="39" />; break;
    case 'root': shape = <path d="M50 16V79" />; break;
    case 'pulp': shape = <path d="M35 77H65" strokeWidth="7" />; break;
    case 'post': shape = <><path d="M50 16V73" /><rect x="39" y="72" width="22" height="13" /></>; break;
    case 'triangle': shape = <path d="M35 8L50 0L65 8Z" />; break;
    case 'rotation': shape = <g transform={mark.code === 'antihorario' ? 'translate(100 0) scale(-1 1)' : undefined}><path d="M25 97Q50 112 75 97M65 97H75V105" /></g>; break;
    case 'eruption': shape = <path d="M50 15L40 32L60 48L40 64L50 89M40 80L50 89L60 80" />; break;
    case 'extrusion': shape = <path d="M50 98V109M44 103L50 109L56 103" />; break;
    case 'intrusion': shape = <path d="M50 109V98M44 104L50 98L56 104" />; break;
    default: break;
  }
  if (mark.state === 'remanente') shape = <text x="50" y="40" transform={isUpper(number) ? undefined : 'translate(0 80) scale(1 -1)'} textAnchor="middle" fill={color} stroke="none" fontSize="16">RR</text>;
  return <g fill="none" stroke={color} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" pointerEvents="none"><title>{state.label}</title>{shape}</g>;
}

export function ToothDrawing({ number, tooth, selectedSurface, onSelect, interactive = true, showLabels = false }) {
  const clipId = React.useId().replace(/:/g, '');
  const molar = isMolar(number);
  const incisalPath = toothIncisalPath(number);
  const absence = tooth.findings.findLast((mark) => mark.state === 'ausente');
  return <>
    <defs><clipPath id={clipId}><ellipse cx="50" cy="77.5" rx="42" ry="17.5" /></clipPath></defs>
    <path className="nts-roots" d={toothRootsPath(number)} fill="white" stroke="black" strokeWidth="2.5" strokeLinejoin="round"><title>Raíces de pieza {number}</title></path>
    <g clipPath={`url(#${clipId})`}>
      {toothSurfaces.map((s) => {
        const finding = absence || tooth.surfaces[s.id].findings.findLast((mark) => !mark.points.length);
        const color = finding ? clinicalColor(finding) : undefined;
        const incisal = s.id === 'oclusal' && incisalPath !== null;
        const Element = incisal ? 'path' : 'polygon';
        return <Element key={s.id} points={incisal ? undefined : toothSurfacePolygon(number, s.id)} d={incisal ? incisalPath : undefined}
          className={`nts-surface${incisal ? ' nts-incisal' : ''}${selectedSurface === s.id ? ' is-selected' : ''}`}
          fill={color || 'white'} stroke={incisal ? color || 'transparent' : 'black'} strokeWidth={2.2}
          style={color ? { background: color } : undefined} data-state={finding?.state || absence?.state || tooth.surfaces[s.id].findings.at(-1)?.state || 'sin-registro'}
          role={interactive ? 'button' : undefined} tabIndex={interactive ? 0 : undefined} aria-label={interactive ? `Pieza ${number}, ${s.label}` : undefined}
          aria-pressed={interactive ? selectedSurface === s.id : undefined}
          onClick={interactive ? () => onSelect?.(s.id) : undefined}
          onKeyDown={interactive ? (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect?.(s.id); } } : undefined}>
          <title>{number} · {s.label}{finding ? ` · ${markCode(finding)}` : ''}</title>
        </Element>;
      })}
      {molar && <path d="M32 77.5H68" stroke="black" strokeWidth="1.8" pointerEvents="none" />}
    </g>
    <ellipse cx="50" cy="77.5" rx="42" ry="17.5" fill="none" stroke="black" strokeWidth="2.5" pointerEvents="none" />
    {toothFindings(tooth).filter((mark) => !stateFor(mark.state).graphic.startsWith('draw-') || mark.points.length).map((mark) => <ToothMark key={mark.id} number={number} mark={mark} />)}
    {selectedSurface && <polygon points={toothSurfacePolygon(number, selectedSurface)} clipPath={`url(#${clipId})`} fill="none" stroke="#53616e" strokeDasharray="3 3" strokeWidth="2" pointerEvents="none" />}
    {showLabels && <SurfaceLabels number={number} />}
  </>;
}

export function CompactTooth({ number, tooth, selectedSurface, onSelect, interactive = true, showLabels = false, ariaLabel }) {
  return <svg className="nts-tooth-map" viewBox={`0 0 100 ${110 * toothDrawingScaleY}`} aria-label={ariaLabel || `Gráfico de pieza ${number}`}>
    <g transform={`scale(1 ${toothDrawingScaleY})`}>
    <g transform={isUpper(number) ? undefined : 'translate(0 100) scale(1 -1)'}>
      <ToothDrawing number={number} tooth={tooth} selectedSurface={selectedSurface} onSelect={onSelect} interactive={interactive} showLabels={showLabels} />
    </g>
    </g>
  </svg>;
}

function RangeMark({ mark, teeth, upper }) {
  const start = teeth.indexOf(mark.teeth[0]) * toothColumnWidth + 30, end = teeth.indexOf(mark.teeth.at(-1)) * toothColumnWidth + 30;
  if (start < 0 || end < 0) return null;
  // Posiciones en píxeles de la fila: corona superior al pie de las raíces;
  // corona inferior antes de las raíces y numeración debajo de la pieza.
  const state = stateFor(mark.state), y = upper ? 15 : 157, crown = upper ? 113 : 34, numberY = upper ? 24 : 132;
  const mid = (start + end) / 2;
  let shape;
  switch (state.graphic) {
    case 'double': shape = <path d={`M${start - 30} ${y}H${end + 30}M${start - 30} ${y + 5}H${end + 30}`} />; break;
    case 'edentulous': shape = <path d={`M${start - 30} ${crown}H${end + 30}`} />; break;
    case 'bridge': shape = <path d={`M${start} ${y + 9}V${y}H${end}V${y + 9}`} />; break;
    case 'brackets': shape = <><path d={`M${start} ${y}H${end}`} />{[start,end].map((x) => <g key={x}><rect x={x - 5} y={y - 5} width="10" height="10" /><path d={`M${x - 3} ${y}H${x + 3}M${x} ${y - 3}V${y + 3}`} /></g>)}</>; break;
    case 'zigzag': shape = <polyline points={Array.from({ length: Math.round((end - start) / 6) + 1 }, (_, i) => `${start + i * 6},${y + (i % 2 ? 4 : -4)}`).join(' ')} />; break;
    case 'diastema': shape = <text x={mid} y={crown + 3} textAnchor="middle" fill="currentColor" stroke="none" fontSize="18">)(</text>; break;
    case 'supernumerary': shape = <><circle cx={mid} cy={y} r="8" /><text x={mid} y={y + 3} fill="currentColor" stroke="none" textAnchor="middle" fontSize="9">S</text></>; break;
    case 'fusion': shape = <><ellipse cx={start + 8} cy={numberY - 4} rx="24" ry="10" /><ellipse cx={end - 8} cy={numberY - 4} rx="24" ry="10" /></>; break;
    case 'transposition': shape = <><path d={`M${start} ${numberY - 4}Q${mid} ${numberY - 26} ${end} ${numberY - 4}l-7 -1m7 1l-3 -7M${end} ${numberY - 8}Q${mid} ${numberY + 14} ${start} ${numberY - 8}l7 1m-7 -1l3 7`} /></>; break;
    default: return null;
  }
  return <g fill="none" stroke="currentColor" color={clinicalColor(mark)} strokeWidth="2" pointerEvents="none"><title>{state.label}: {mark.teeth.join(', ')}</title>{shape}</g>;
}

export function OdontogramRow({ title, teeth, exam, selectedTooth, selectedSurface, onSelect }) {
  return <section className="nts-arch" aria-label={title}>
    <h4>{title}</h4>
    <div className="nts-compact-row" style={{ width: `${teeth.length * toothColumnWidth}px` }}>
      {teeth.map((number, index) => {
        const tooth = exam.teeth[number], marks = toothFindings(tooth);
        const codes = marks;
        return <div key={number} className={`nts-tooth${!isUpper(number) ? ' nts-tooth--lower' : ''}${selectedTooth === number ? ' is-selected' : ''}${index === teeth.length / 2 ? ' nts-midline' : ''}`}>
          <button type="button" className="nts-tooth-number" aria-label={`Seleccionar pieza ${number}`} aria-pressed={selectedTooth === number} onClick={() => onSelect(number, 'oclusal')}>{number}</button>
          <CompactTooth number={number} tooth={tooth} selectedSurface={selectedTooth === number ? selectedSurface : null} onSelect={(surface) => onSelect(number, surface)} />
          <div className="nts-tooth-codes">{codes.map((mark) => <span key={mark.id} style={{ color: clinicalColor(mark) }} title={stateFor(mark.state).label}>{markCode(mark) || stateFor(mark.state).symbol}</span>)}</div>
        </div>;
      })}
      <svg className="nts-range-overlay" viewBox={`0 0 ${teeth.length * toothColumnWidth} 170`} aria-label={`Hallazgos entre piezas: ${title}`}>
        {exam.ranges.filter((m) => m.teeth.every((n) => teeth.includes(n))).map((m) => <RangeMark key={m.id} mark={m} teeth={teeth} upper={isUpper(teeth[0])} />)}
      </svg>
    </div>
  </section>;
}
