import { describe, test, expect } from 'vitest';
import { arches, temporaryArches } from './odontograma.config.mjs';
import {
  isAnterior, isMolar, isUpper, surfacePolygons, toothCrownPolygons,
  toothIncisalPath, toothRootCount, toothRootPolygon, toothRootsPath,
} from './odontogramaGeometria.mjs';

const allTeeth = [
  ...arches.superior, ...arches.inferior,
  ...temporaryArches.superior, ...temporaryArches.inferior,
];

/** Coordenadas (x, y) de un trazo `M…L…`. */
const coordinates = (d) => d.replace(/[ML]/g, ' ').trim().split(/\s+/).map(Number);
/** Abscisas de las puntas en y = 10: una por cada rama radicular dibujada. */
const apexes = (d) => {
  const coords = coordinates(d);
  const tips = [];
  for (let i = 1; i < coords.length; i += 2) if (coords[i] === 10) tips.push(coords[i - 1]);
  return tips;
};
const contours = (d) => (d.match(/M/g) || []).length;
const vertices = (polygon) => polygon.trim().split(/\s+/).map((pair) => pair.split(',').map(Number));
const rectangle = (polygon) => {
  const xs = vertices(polygon).map(([x]) => x);
  const ys = vertices(polygon).map(([, y]) => y);
  return { minX: Math.min(...xs), maxX: Math.max(...xs), minY: Math.min(...ys), maxY: Math.max(...ys) };
};
/** Área por la fórmula del zapatero. */
const area = (polygon) => {
  const puntos = vertices(polygon);
  return Math.abs(puntos.reduce((suma, [x, y], i) => {
    const [x2, y2] = puntos[(i + 1) % puntos.length];
    return suma + (x * y2 - x2 * y);
  }, 0)) / 2;
};

describe('raíces', () => {
  test('declara tres ramas en molares superiores, dos en inferiores y en 14 y 24', () => {
    for (const number of ['16', '17', '18', '26', '27', '28', '54', '55', '64', '65']) expect(toothRootCount(number)).toBe(3);
    for (const number of ['36', '37', '38', '46', '47', '48', '74', '75', '84', '85']) expect(toothRootCount(number)).toBe(2);
    expect(toothRootCount('14')).toBe(2);
    expect(toothRootCount('24')).toBe(2);
    for (const number of ['11', '13', '15', '22', '25', '34', '44', '51', '53', '81']) expect(toothRootCount(number)).toBe(1);
  });

  test('dibuja exactamente las ramas declaradas en un único contorno continuo', () => {
    for (const number of allTeeth) {
      const d = toothRootsPath(number);
      expect(contours(d), `pieza ${number}`).toBe(1);
      expect(apexes(d), `pieza ${number}`).toHaveLength(toothRootCount(number));
    }
  });

  test('14 y 24 se dibujan bifurcadas sin trazos superpuestos', () => {
    const bifurcada = toothRootsPath('14');
    expect(apexes(bifurcada)).toEqual([33, 67]);
    expect(toothRootsPath('24')).toBe(bifurcada);
    // 15 conserva una sola rama: la bifurcación no se propaga al resto de premolares.
    expect(toothRootsPath('15')).not.toBe(bifurcada);
    expect(apexes(toothRootsPath('15'))).toEqual([50]);
  });

  test('la zona radicular es el mismo contorno que se dibuja, como polígono pulsable', () => {
    for (const number of allTeeth) {
      const polygon = toothRootPolygon(number);
      // Mismo trazo que las raíces visibles: ninguna pieza queda sin zona registrable.
      expect(polygon.trim().split(/\s+/).flatMap((pair) => pair.split(',').map(Number)), `pieza ${number}`)
        .toEqual(coordinates(toothRootsPath(number)));
      const box = rectangle(polygon);
      expect(box.minX, `pieza ${number}`).toBe(8);
      expect(box.maxX, `pieza ${number}`).toBe(92);
      // Arranca y cierra en la base de la corona, que queda tapada por ella.
      expect(box.maxY, `pieza ${number}`).toBe(77.5);
      expect(box.minY, `pieza ${number}`).toBe(10);
      expect(area(polygon), `pieza ${number}`).toBeGreaterThan(0);
    }
  });
});

describe('corona', () => {
  test('clasifica piezas por posición y dentición', () => {
    expect(isAnterior('11')).toBe(true);
    expect(isAnterior('53')).toBe(true);
    expect(isAnterior('14')).toBe(false);
    expect(isMolar('18')).toBe(true);
    expect(isMolar('54')).toBe(true);
    expect(isMolar('14')).toBe(false);
    expect(isUpper('24')).toBe(true);
    expect(isUpper('44')).toBe(false);
    expect(toothCrownPolygons('46')).toBe(surfacePolygons);
  });

  test('las cinco superficies tiling la corona sin huecos ni solapes', () => {
    // Un área total mayor que el rectángulo revela polígonos solapados: era lo
    // que producía la celda degenerada en el centro de las piezas anteriores.
    for (const number of ['11', '16', '15', '41', '46', '45', '51', '54']) {
      const polygons = Object.values(toothCrownPolygons(number));
      for (const polygon of polygons) {
        const box = rectangle(polygon);
        expect(box.minX, `pieza ${number}`).toBeGreaterThanOrEqual(8);
        expect(box.maxX, `pieza ${number}`).toBeLessThanOrEqual(92);
        expect(box.minY, `pieza ${number}`).toBeGreaterThanOrEqual(60);
        expect(box.maxY, `pieza ${number}`).toBeLessThanOrEqual(95);
      }
      const total = polygons.reduce((suma, polygon) => suma + area(polygon), 0);
      expect(total, `pieza ${number}`).toBeCloseTo(84 * 35, 6);
    }
  });

  test('la corona anterior no deja una celda central: el borde incisal vive en el borde', () => {
    for (const number of ['11', '13', '21', '51', '71', '81']) {
      const { top, bottom, left, right, center } = toothCrownPolygons(number);
      // Las cuatro divisiones llegan al centro de la corona…
      for (const polygon of [top, bottom, left, right]) {
        expect(rectangle(polygon).maxY, `pieza ${number}`).toBeLessThanOrEqual(86);
      }
      // …y la quinta superficie es una banda ancha en el borde, no un rectángulo plano.
      const band = rectangle(center);
      expect(band.minY, `pieza ${number}`).toBe(86);
      expect(band.maxY - band.minY, `pieza ${number}`).toBeGreaterThanOrEqual(4);
      expect(band.minY).toBeGreaterThan(77.5);
    }
  });
});

describe('borde incisal', () => {
  test('existe solo en piezas anteriores y coincide con su polígono', () => {
    expect(toothIncisalPath('11')).toBe('M8 86L92 86L92 95L8 95Z');
    expect(toothIncisalPath('51')).toBe(toothIncisalPath('11'));
    expect(toothIncisalPath('16')).toBeNull();
    expect(toothIncisalPath('15')).toBeNull();
    expect(toothIncisalPath('46')).toBeNull();
  });
});
