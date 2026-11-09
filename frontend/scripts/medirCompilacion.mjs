import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { gzipSync } from 'node:zlib';

const directorio = resolve(import.meta.dirname, '../dist');
const html = readFileSync(resolve(directorio, 'index.html'), 'utf8');
const archivos = [...html.matchAll(/(?:src|href)="([^\"]+\.js)"/g)].map(coincidencia => coincidencia[1]);
const modulos = archivos.map(archivo => {
    const ruta = resolve(directorio, `.${archivo}`);
    return { archivo, bytes: statSync(ruta).size, gzip: gzipSync(readFileSync(ruta)).length };
});
console.log(JSON.stringify({ modulos, gzipInicial: modulos.reduce((total, modulo) => total + modulo.gzip, 0) }, null, 2));
