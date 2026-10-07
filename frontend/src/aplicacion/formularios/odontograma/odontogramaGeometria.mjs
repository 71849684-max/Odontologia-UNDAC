/**
 * Geometría del odontograma en coordenadas locales del SVG de cada pieza.
 *
 * Espacio local (antes del alargado vertical de 1,7 del componente):
 *   - Corona: x ∈ [8, 92], y ∈ [60, 95], recortada por la elipse
 *     cx 50, cy 77,5, rx 42, ry 17,5.
 *   - Raíces: ascienden hasta y = 10.
 *   - y creciente siempre mira hacia el plano oclusal. La arcada inferior se
 *     refleja al dibujar (`translate(0 100) scale(1 -1)`), de modo que el borde
 *     y = 95 es el borde oclusal/incisal en ambas arcadas: por eso el borde
 *     incisal ocupa ese borde y no el centro de la corona.
 *
 * Tres coronas según el Anexo II de la NTS N.° 188:
 *   - molar:    ventana con cruz (cuatro cuadrantes oclusales).
 *   - premolar: hexágono con dos barras horizontales.
 *   - anterior: X de cuatro divisiones y, separado, el borde incisal; no existe
 *     una quinta celda en el centro (el centro lo comparten las cuatro caras).
 */

// Corona de molar, referente también para `toothSurfacePolygon('46', …)`.
export const surfacePolygons = {
  top: '8,60 92,60 68,72 32,72', bottom: '8,95 32,83 68,83 92,95',
  left: '8,60 32,72 32,83 8,95', right: '92,60 92,95 68,83 68,72', center: '32,72 68,72 68,83 32,83',
};

const crownPremolar = {
  top: '8,60 92,60 68,75 32,75', bottom: '8,95 32,80 68,80 92,95',
  left: '8,60 32,75 32,80 8,95', right: '92,60 92,95 68,80 68,75', center: '32,75 68,75 68,80 32,80',
};

// Las cuatro divisiones terminan en (50, 77,5); por debajo, una banda ancha
// recoge el borde incisal: queda dentro de la corona y lejos del centro.
const incisalBand = '8,86 92,86 92,95 8,95';
const crownAnterior = {
  top: '8,60 92,60 50,77.5', bottom: '8,86 50,77.5 92,86',
  left: '8,60 50,77.5 8,86', right: '92,60 92,86 50,77.5',
  center: incisalBand,
};

export const isUpper = (number) => ['1', '2', '5', '6'].includes(String(number)[0]);
export const isTemporary = (number) => Number(String(number)[0]) > 4;
/** Piezas 1–3 de cada cuadrante: incisivos y caninos. */
export const isAnterior = (number) => Number(String(number)[1]) <= 3;
export const isMolar = (number) => Number(String(number)[1]) >= (isTemporary(number) ? 4 : 6);

/** Polígonos de las cinco superficies de la corona de una pieza. */
export function toothCrownPolygons(number) {
  if (isAnterior(number)) return crownAnterior;
  return isMolar(number) ? surfacePolygons : crownPremolar;
}

const ROOTS_UPPER_MOLAR = 'M8 77.5L17 10L36 60L50 10L64 60L83 10L92 77.5';
const ROOTS_LOWER_MOLAR = 'M8 77.5L25 10L50 60L75 10L92 77.5';
const ROOTS_SINGLE = 'M8 77.5L50 10L92 77.5';
// Primer premolar superior: la lámina oficial distingue dos ramas en 14 y 24;
// se dibujan como un único contorno para no superponer trazos.
const ROOTS_BIFURCATED = 'M8 77.5L33 10L50 60L67 10L92 77.5';
const BIFURCATED_TEETH = new Set(['14', '24']);

/** Número de ramas radiculares que dibuja la pieza (3, 2 o 1). */
export function toothRootCount(number) {
  if (isMolar(number)) return isUpper(number) ? 3 : 2;
  return BIFURCATED_TEETH.has(String(number)) ? 2 : 1;
}

/** Trazo de las raíces, siempre como un solo contorno continuo. */
export function toothRootsPath(number) {
  if (isMolar(number)) return isUpper(number) ? ROOTS_UPPER_MOLAR : ROOTS_LOWER_MOLAR;
  return BIFURCATED_TEETH.has(String(number)) ? ROOTS_BIFURCATED : ROOTS_SINGLE;
}

function polygonPath(points) {
  return `M${points.split(' ').map((point) => point.replace(',', ' ')).join('L')}Z`;
}

/**
 * Banda del borde incisal: solo existe en piezas anteriores, donde la corona no
 * tiene superficie oclusal. Se dibuja como un `path` relleno para que la zona
 * sea real (visible al pasar el cursor y al seleccionarla), no una línea
 * invisible en el centro de la X.
 */
export function toothIncisalPath(number) {
  return isAnterior(number) ? polygonPath(toothCrownPolygons(number).center) : null;
}
