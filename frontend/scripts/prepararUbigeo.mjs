import { readFileSync, writeFileSync } from 'node:fs';

// Los originales y su licencia se conservan; el navegador solo necesita id y nombre.
const directorio = new URL('../src/aplicacion/formularios/datos-paciente/ubigeo/', import.meta.url);
const reducir = ({ id_ubigeo, nombre_ubigeo }) => ({ id_ubigeo, nombre_ubigeo });
const catalogo = Object.fromEntries(['departamentos', 'provincias', 'distritos'].map((nombre) => {
    const original = JSON.parse(readFileSync(new URL(`${nombre}.json`, directorio), 'utf8'));
    return [nombre, Array.isArray(original) ? original.map(reducir) : Object.fromEntries(Object.entries(original).map(([id, lista]) => [id, lista.map(reducir)]))];
}));
writeFileSync(new URL('catalogoFormulario.json', directorio), `${JSON.stringify(catalogo)}\n`);
