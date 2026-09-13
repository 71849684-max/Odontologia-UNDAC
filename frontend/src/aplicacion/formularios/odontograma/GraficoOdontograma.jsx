import React from 'react';
import { clinicalColor, markCode, stateFor, surfacePosition, toothSurfaces } from './odontograma.config.mjs';
import { toothFindings } from './odontogramaRegistro.mjs';

export const surfacePolygons = {
  top: '8,60 92,60 68,72 32,72', bottom: '8,95 32,83 68,83 92,95',
  left: '8,60 32,72 32,83 8,95', right: '92,60 92,95 68,83 68,72', center: '32,72 68,72 68,83 32,83',
};
export const isUpper = (number) => ['1','2','5','6'].includes(number[0]);
// La arcada inferior se refleja al dibujar; convierta la posición visual al plano local.
export function toothSurfacePolygon(number, surface) {
  const position = surfacePosition(number, surface);
  const polygons = Number(number[1]) <= 3 ? {
    top: '8,60 92,60 68,77 32,77', bottom: '8,95 32,78 68,78 92,95',
    left: '8,60 32,77 32,78 8,95', right: '92,60 92,95 68,78 68,77', center: '32,77 68,77 68,78 32,78',
  } : surfacePolygons;
  return polygons[!isUpper(number) ? ({ top: 'bottom', bottom: 'top' }[position] || position) : position];
}

function ToothMark({ mark }) {
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
  return <g fill="none" stroke={color} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" pointerEvents="none">{shape}</g>;
}

export function ToothDrawing({ number, tooth, selectedSurface, onSelect, interactive = true }) {
  const position = Number(number[1]), temporary = Number(number[0]) > 4;
  const molar = position >= (temporary ? 4 : 6);
  const roots = molar ? (isUpper(number) ? 'M8 60L17 10L36 60L50 10L64 60L83 10L92 60' : 'M8 60L25 10L50 60L75 10L92 60') : 'M8 60L50 10L92 60';
  return <>
    <path d={roots} fill="white" stroke="black" strokeWidth="1.3" />
    {!temporary && ['14','24'].includes(number) && <path d="M32 60L60 10L75 60" fill="none" stroke="black" strokeDasharray="3 2" />}
    {toothSurfaces.map((s) => <polygon key={s.id} points={toothSurfacePolygon(number, s.id)} fill="white" stroke="black" strokeWidth="1.2"
      role={interactive ? 'button' : undefined} tabIndex={interactive ? 0 : undefined} aria-label={interactive ? `Pieza ${number}, ${s.label}` : undefined}
      aria-pressed={interactive ? selectedSurface === s.id : undefined}
      onClick={interactive ? () => onSelect?.(s.id) : undefined}
      onKeyDown={interactive ? (event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); onSelect?.(s.id); } } : undefined}>
      <title>{number} · {s.label}</title>
    </polygon>)}
    {position <= 3 && <path d="M32 77.5H68" stroke="black" strokeWidth="1" />}
    {toothFindings(tooth).map((mark) => <ToothMark key={mark.id} mark={mark} />)}
    {selectedSurface && <polygon points={toothSurfacePolygon(number, selectedSurface)} fill="none" stroke="#53616e" strokeDasharray="3 3" strokeWidth="2" pointerEvents="none" />}
  </>;
}

export function CompactTooth({ number, tooth, selectedSurface, onSelect, interactive = true }) {
  const wholeTooth = tooth.findings.findLast((mark) => mark.state === 'ausente');
  return <div className={`nts-tooth-map${wholeTooth ? ' nts-tooth-map--absent' : ''}`}>
    {toothSurfaces.map((surface) => {
      const finding = wholeTooth || tooth.surfaces[surface.id].findings.at(-1);
      const color = finding ? clinicalColor(finding) : undefined;
      const Element = interactive ? 'button' : 'span';
      return <Element key={surface.id} type={interactive ? 'button' : undefined}
        className={`nts-surface nts-surface--${surfacePosition(number, surface.id)}${selectedSurface === surface.id ? ' is-selected' : ''}`}
        style={color ? { background: color, color: 'white' } : undefined}
        data-state={finding?.state || 'sin-registro'}
        aria-label={interactive ? `Pieza ${number}, ${surface.label}` : undefined}
        aria-pressed={interactive ? selectedSurface === surface.id : undefined}
        aria-description={finding ? `${stateFor(finding.state).label} · ${markCode(finding)}` : 'Sin hallazgo registrado'}
        onClick={interactive ? () => onSelect?.(surface.id) : undefined}
        title={`${number} · ${surface.label}${finding ? ` · ${markCode(finding)}` : ''}`} />;
    })}
    {wholeTooth && <svg className="nts-tooth-absence" viewBox="0 0 100 100" aria-hidden="true"><path d="M12 12L88 88M88 12L12 88" /></svg>}
  </div>;
}

function RangeMark({ mark, teeth }) {
  const start = teeth.indexOf(mark.teeth[0]) * 48 + 24, end = teeth.indexOf(mark.teeth.at(-1)) * 48 + 24;
  if (start < 0 || end < 0) return null;
  const state = stateFor(mark.state), y = 15, crown = 66, numberY = 34;
  const mid = (start + end) / 2;
  let shape;
  switch (state.graphic) {
    case 'double': shape = <path d={`M${start - 24} ${y}H${end + 24}M${start - 24} ${y + 5}H${end + 24}`} />; break;
    case 'edentulous': shape = <path d={`M${start - 24} ${crown}H${end + 24}`} />; break;
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
    <div className="nts-compact-row" style={{ width: `${teeth.length * 48}px` }}>
      {teeth.map((number, index) => {
        const tooth = exam.teeth[number], marks = toothFindings(tooth);
        const codes = marks;
        return <div key={number} className={`nts-tooth${selectedTooth === number ? ' is-selected' : ''}${index === teeth.length / 2 ? ' nts-midline' : ''}`}>
          <button type="button" className="nts-tooth-number" aria-label={`Seleccionar pieza ${number}`} aria-pressed={selectedTooth === number} onClick={() => onSelect(number, 'oclusal')}>{number}</button>
          <CompactTooth number={number} tooth={tooth} selectedSurface={selectedTooth === number ? selectedSurface : null} onSelect={(surface) => onSelect(number, surface)} />
          <div className="nts-tooth-codes">{codes.map((mark) => <span key={mark.id} style={{ color: clinicalColor(mark) }} title={stateFor(mark.state).label}>{markCode(mark) || stateFor(mark.state).symbol}</span>)}</div>
        </div>;
      })}
      <svg className="nts-range-overlay" viewBox={`0 0 ${teeth.length * 48} 110`} aria-label={`Hallazgos entre piezas: ${title}`}>
        {exam.ranges.filter((m) => m.teeth.every((n) => teeth.includes(n))).map((m) => <RangeMark key={m.id} mark={m} teeth={teeth} />)}
      </svg>
    </div>
  </section>;
}
