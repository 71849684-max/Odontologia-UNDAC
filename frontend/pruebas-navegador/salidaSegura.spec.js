import { test, expect, ingresar, crearHistoria, manifiesto } from './ayudas.js';

test('exige credenciales nuevas para ingresar aunque la salida anterior siga fallando', async ({ page }) => {
    await ingresar(page);
    await page.route('**/api/auth/logout', ruta => ruta.abort('failed'));
    await page.getByRole('button', { name: /Cerrar sesión/i }).click();
    await expect(page.getByRole('alert')).toContainText('No se pudo confirmar el cierre de sesión');
    await ingresar(page, 'alumnoB');
    const actual = await (await page.request.get('/api/auth/yo')).json();
    expect(actual.usuario.nombre_usuario).toBe(manifiesto.actores.alumnoB.usuario);
    expect(await page.evaluate(() => localStorage.getItem('undac:sesion:salida-pendiente'))).toBeNull();
    await expect(page).not.toHaveURL(/salida_pendiente/);
});

test('el cierre fallido no recupera la cuenta al recargar y se confirma al volver la red', async ({ page }) => {
    await ingresar(page);
    await page.route('**/api/auth/logout', ruta => ruta.abort('failed'));
    await page.getByRole('button', { name: /Cerrar sesión/i }).click();
    await expect(page.getByRole('alert')).toContainText('No se pudo confirmar el cierre de sesión');
    await page.reload();
    await expect(page.getByRole('button', { name: 'Ingresar al sistema' })).toBeVisible();
    await expect(page.getByRole('alert')).toContainText('No se pudo confirmar el cierre de sesión');
    expect((await page.request.get('/api/auth/yo')).status()).toBe(200);
    await page.unroute('**/api/auth/logout');
    await page.evaluate(() => window.dispatchEvent(new Event('online')));
    await expect.poll(async () => (await page.request.get('/api/auth/yo')).status()).toBe(401);
    expect(await page.evaluate(() => localStorage.getItem('undac:sesion:salida-pendiente'))).toBeNull();
    await page.reload();
    await expect(page.getByRole('button', { name: 'Ingresar al sistema' })).toBeVisible();
    await ingresar(page, 'alumnoB');
    await expect(page.getByRole('button', { name: /Cerrar sesión/i })).toBeVisible();
});

async function historiaConCambioPendiente(page) {
    await ingresar(page);
    const historia = await crearHistoria(page);
    await page.goto(`/#/historia-clinica?historia=${historia.id}&seccion=anamnesis`);
    const campo = page.getByRole('textbox', { name: 'Motivo de consulta', exact: true });
    await campo.waitFor();
    await page.route(`**/api/historias/${historia.id}/expediente`, ruta => ruta.request().method() === 'PUT' ? ruta.abort('failed') : ruta.continue());
    await campo.fill('CAMBIO-SINTETICO-PROTEGIDO');
    await expect(page.getByLabel('Autoguardado')).toContainText('No se pudo guardar');
    return { historia, campo };
}

test('protege salida, retroceso y recarga, y permite guardar antes de salir', async ({ page }) => {
    const { historia, campo } = await historiaConCambioPendiente(page);
    const volver = page.getByRole('button', { name: 'Volver a historias clínicas', exact: true });
    const dialogo = page.getByRole('dialog', { name: 'Hay cambios sin guardar' });
    await volver.click();
    await expect(dialogo).toBeVisible();
    await dialogo.getByRole('button', { name: 'Guardar y salir', exact: true }).click();
    await expect(dialogo.getByRole('alert')).toContainText('No se pudo confirmar el guardado');
    await dialogo.getByRole('button', { name: 'Permanecer', exact: true }).click();
    await expect(campo).toHaveValue('CAMBIO-SINTETICO-PROTEGIDO');
    await expect(volver).toBeFocused();
    await page.goBack();
    await expect(dialogo).toBeVisible();
    await dialogo.getByRole('button', { name: 'Permanecer', exact: true }).click();
    await expect(page).toHaveURL(/seccion=anamnesis/);
    await expect(campo).toHaveValue('CAMBIO-SINTETICO-PROTEGIDO');
    await page.evaluate(() => { window.location.hash = '#/historias'; });
    await expect(dialogo).toBeVisible();
    await dialogo.getByRole('button', { name: 'Permanecer', exact: true }).click();
    await expect(page).toHaveURL(/seccion=anamnesis/);
    let recargaProtegida = false;
    page.once('dialog', async aviso => { recargaProtegida = aviso.type() === 'beforeunload'; await aviso.dismiss(); });
    await page.evaluate(() => window.location.reload());
    await expect.poll(() => recargaProtegida).toBe(true);
    await expect(campo).toHaveValue('CAMBIO-SINTETICO-PROTEGIDO');
    await page.unroute(`**/api/historias/${historia.id}/expediente`);
    await volver.click();
    await dialogo.getByRole('button', { name: 'Guardar y salir', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Historias clínicas', exact: true })).toBeVisible();
    const expediente = await (await page.request.get(`/api/historias/${historia.id}/expediente`)).json();
    expect(expediente.formData.anamnesis.motivoConsulta).toBe('CAMBIO-SINTETICO-PROTEGIDO');
});

test('protege el cambio inmediatamente después de escribir, antes de confirmarse el guardado', async ({ page }) => {
    await ingresar(page);
    const historia = await crearHistoria(page);
    await page.goto(`/#/historia-clinica?historia=${historia.id}&seccion=anamnesis`);
    await page.route(`**/api/historias/${historia.id}/expediente`, ruta => ruta.request().method() === 'PUT' ? ruta.abort('failed') : ruta.continue());
    const campo = page.getByRole('textbox', { name: 'Motivo de consulta', exact: true });
    await campo.fill('CAMBIO-INMEDIATO-SINTETICO');
    await page.getByRole('button', { name: 'Volver a historias clínicas', exact: true }).click();
    const dialogo = page.getByRole('dialog', { name: 'Hay cambios sin guardar' });
    await expect(dialogo).toBeVisible();
    await dialogo.getByRole('button', { name: 'Permanecer', exact: true }).click();
    await expect(campo).toHaveValue('CAMBIO-INMEDIATO-SINTETICO');
});

test('solo descarta un cambio pendiente tras la confirmación explícita', async ({ page }) => {
    const { historia } = await historiaConCambioPendiente(page);
    await page.getByRole('button', { name: 'Volver a historias clínicas', exact: true }).click();
    const dialogo = page.getByRole('dialog', { name: 'Hay cambios sin guardar' });
    await dialogo.getByRole('button', { name: 'Descartar y salir', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Historias clínicas', exact: true })).toBeVisible();
    const expediente = await (await page.request.get(`/api/historias/${historia.id}/expediente`)).json();
    expect(expediente.formData.anamnesis.motivoConsulta ?? '').toBe('');
});
