import { test, expect, ingresar, escribirConCsrf } from './ayudas.js';

test('inicia sesión, conserva cookies al recargar y cierra la sesión real', async ({ page }) => {
    await ingresar(page);
    const cookies = await page.context().cookies();
    expect(cookies.some(cookie => cookie.name === 'XSRF-TOKEN')).toBe(true);
    expect(cookies.some(cookie => cookie.httpOnly)).toBe(true);
    await page.reload();
    expect((await page.request.get('/api/auth/yo')).status()).toBe(200);
    await page.getByRole('button', { name: /Cerrar sesión/i }).click();
    await expect(page.getByRole('button', { name: 'Ingresar al sistema' })).toBeVisible();
    await page.reload();
    expect((await page.request.get('/api/auth/yo')).status()).toBe(401);
});

test('rechaza escrituras sin CSRF o con token inválido y acepta el token real', async ({ page }) => {
    await ingresar(page, 'administrador');
    const codigo = `CSRF-${Date.now()}`;
    const datos = { codigo, nombre: 'Curso sintético CSRF', estado: 'activo' };
    for (const headers of [{}, { 'X-XSRF-TOKEN': 'token-invalido' }]) {
        const respuesta = await page.request.post('/api/academico/cursos', { headers: { Accept: 'application/json', ...headers }, data: datos });
        expect(respuesta.status()).toBe(419);
    }
    const estado = await (await page.request.get('/api/academico')).json();
    expect(estado.cursos.some(curso => curso.codigo === codigo)).toBe(false);
    expect((await escribirConCsrf(page, '/api/academico/cursos', datos, 'POST')).status()).toBe(201);
});

test('el formulario recupera un token CSRF caducado y guarda una sola vez', async ({ page }) => {
    await ingresar(page, 'administrador');
    await page.goto('/#/cursos');
    await page.getByRole('button', { name: 'Nuevo curso', exact: true }).click();
    const dialogo = page.getByRole('dialog', { name: 'Nuevo curso' });
    const codigo = `RENOVAR-${Date.now()}`;
    await dialogo.getByLabel('Código', { exact: true }).fill(codigo);
    await dialogo.getByLabel('Nombre', { exact: true }).fill('Curso sintético de renovación');
    // Laravel 13 también acepta el origen verificado del navegador. Simular
    // metadatos de origen no confiables fuerza la comprobación real del token.
    // La petición continúa hacia Laravel: no se fabrica ninguna respuesta.
    let primeraPeticion = true;
    await page.route('**/api/academico/cursos', async ruta => {
        const cabeceras = { ...ruta.request().headers() };
        cabeceras['sec-fetch-site'] = 'cross-site';
        if (primeraPeticion) {
            cabeceras['x-xsrf-token'] = 'token-caducado';
            primeraPeticion = false;
        }
        const respuestaReal = await ruta.fetch({ headers: cabeceras });
        await ruta.fulfill({ response: respuestaReal });
    });
    const estados = [];
    page.on('response', respuesta => {
        if (respuesta.url().endsWith('/api/academico/cursos') && respuesta.request().method() === 'POST') estados.push(respuesta.status());
    });
    // Cambiar la cookie y pulsar en el mismo turno evita que una respuesta
    // pendiente reponga el token antes de que el formulario lo envíe.
    await dialogo.getByRole('button', { name: 'Guardar curso', exact: true }).evaluate(boton => {
        document.cookie = 'XSRF-TOKEN=token-caducado; path=/';
        boton.click();
    });
    await expect(dialogo).toHaveCount(0);
    expect(estados).toEqual([419, 201]);
    const estado = await (await page.request.get('/api/academico')).json();
    expect(estado.cursos.filter(curso => curso.codigo === codigo)).toHaveLength(1);
});
