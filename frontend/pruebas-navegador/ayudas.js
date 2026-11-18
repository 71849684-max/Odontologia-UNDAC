import { test as prueba, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ruta = process.env.PRUEBAS_MANIFIESTO ?? resolve(import.meta.dirname, '../../backend/storage/pruebas-navegador/app/manifiesto-pruebas.json');
export const manifiesto = JSON.parse(readFileSync(ruta, 'utf8'));
if (manifiesto.base === 'bd_clinica_undac' || manifiesto.entorno !== 'pruebas_navegador') {
    throw new Error('El manifiesto no corresponde al entorno de navegador.');
}
export const test = prueba.extend({
    page: async ({ page }, usar, informacion) => {
        const errores = [];
        page.on('pageerror', error => errores.push(error.message));
        page.on('console', mensaje => { if (mensaje.type() === 'error') errores.push(mensaje.text()); });
        await usar(page);
        await informacion.attach('errores-consola', { body: JSON.stringify(errores, null, 2), contentType: 'application/json' });
    },
});
export { expect };

export async function ingresar(pagina, alias = 'alumnoA') {
    await pagina.goto('/');
    await pagina.getByRole('textbox', { name: 'Usuario', exact: true }).fill(manifiesto.actores[alias].usuario);
    await pagina.getByLabel('Contraseña', { exact: true }).fill(manifiesto.actores[alias].clave);
    const respuesta = pagina.waitForResponse(r => r.url().endsWith('/api/auth/login') && r.request().method() === 'POST');
    await pagina.getByRole('button', { name: 'Ingresar al sistema' }).click();
    expect((await respuesta).status()).toBe(200);
    await expect(pagina.getByRole('button', { name: 'Ingresar al sistema' })).toHaveCount(0);
}

export async function abrirHistorias(pagina) {
    await pagina.goto('/#/historias');
    await pagina.reload();
    await expect(pagina.getByRole('heading', { name: 'Historias clínicas', exact: true })).toBeVisible();
    await expect.poll(async () => (await pagina.request.get('/api/historias')).status()).toBe(200);
}

export async function crearHistoria(pagina) {
    await abrirHistorias(pagina);
    await pagina.getByRole('button', { name: 'Nueva historia clínica', exact: true }).click();
    const dialogo = pagina.getByRole('dialog', { name: 'Nueva historia clínica' });
    const documento = String(70000000 + Math.floor(Math.random() * 9999999));
    await dialogo.getByLabel('DNI', { exact: true }).fill(documento);
    await dialogo.getByLabel('Nombres', { exact: true }).fill('Paciente Sintético');
    await dialogo.getByLabel('Apellido paterno').fill('Navegador');
    await dialogo.getByLabel('Apellido materno').fill('Pruebas');
    await dialogo.getByRole('combobox', { name: /^Sexo/ }).selectOption('F');
    const respuesta = pagina.waitForResponse(r => r.url().endsWith('/api/historias') && r.request().method() === 'POST');
    await dialogo.getByRole('button', { name: 'Crear historia', exact: true }).click();
    const recibido = await respuesta;
    expect(recibido.status(), await recibido.text()).toBe(201);
    const historia = await recibido.json();
    await expect(pagina.getByRole('button', { name: 'Volver a historias clínicas' })).toBeVisible();
    await expect.poll(async () => (await pagina.request.get(`/api/historias/${historia.id}/expediente`)).status()).toBe(200);
    return { ...historia, documento };
}

export async function completarAnamnesis(pagina, historia, texto) {
    await pagina.goto(`/#/historia-clinica?historia=${historia.id}&seccion=anamnesis`);
    const campo = pagina.getByRole('textbox', { name: 'Motivo de consulta', exact: true });
    await expect(campo).toBeVisible();
    await campo.fill(texto);
    await pagina.getByRole('textbox', { name: 'Historia de la enfermedad', exact: true }).fill('Descripción sintética de laboratorio');
    await expect.poll(async () => {
        const respuesta = await pagina.request.get(`/api/historias/${historia.id}/expediente`);
        return (await respuesta.json()).formData?.anamnesis?.motivoConsulta;
    }).toBe(texto);
}

export async function cambiarEstado(pagina, historia, etiqueta, codigo, observacion) {
    await abrirHistorias(pagina);
    await pagina.getByRole('textbox', { name: 'Buscar historia clínica' }).fill(historia.documento);
    const fila = pagina.getByRole('row').filter({ hasText: historia.documento });
    await expect(fila).toHaveCount(1);
    const respuesta = pagina.waitForResponse(r => r.url().endsWith(`/historias/${historia.id}/estado`) && r.request().method() === 'PATCH');
    await fila.getByRole('button', { name: new RegExp(`^${etiqueta}`) }).click();
    if (observacion) {
        await pagina.getByLabel('Observación clínica para el asistente').fill(observacion);
        await pagina.getByRole('button', { name: 'Registrar observación' }).click();
    }
    expect((await respuesta).status()).toBe(200);
    const lectura = await pagina.request.get(`/api/historias/${historia.id}`);
    expect((await lectura.json()).codigoEstado).toBe(codigo);
}

export async function escribirConCsrf(pagina, ruta, datos, metodo = 'PUT') {
    const cookies = await pagina.context().cookies();
    const token = decodeURIComponent(cookies.find(cookie => cookie.name === 'XSRF-TOKEN').value);
    return pagina.request.fetch(ruta, { method: metodo, headers: { 'X-XSRF-TOKEN': token, Accept: 'application/json' }, data: datos });
}
