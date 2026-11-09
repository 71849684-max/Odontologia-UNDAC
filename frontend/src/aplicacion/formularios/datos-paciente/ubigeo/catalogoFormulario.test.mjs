import { expect, test } from 'vitest';
import catalogo from './catalogoFormulario.json';
import departamentos from './departamentos.json';
import provincias from './provincias.json';
import distritos from './distritos.json';

test('conserva todas las ubicaciones, sus nombres, orden y relaciones del catálogo original', () => {
    const campos = ({ id_ubigeo, nombre_ubigeo }) => ({ id_ubigeo, nombre_ubigeo });
    expect(catalogo.departamentos).toEqual(departamentos.map(campos));
    for (const [nombre, original] of Object.entries({ provincias, distritos })) {
        expect(Object.keys(catalogo[nombre])).toEqual(Object.keys(original));
        for (const [padre, lista] of Object.entries(original)) expect(catalogo[nombre][padre]).toEqual(lista.map(campos));
    }
});
