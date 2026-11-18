import { test, expect, ingresar, crearHistoria } from './ayudas.js';

test('no muestra borradores antiguos cuando no puede verificar acceso con el servidor', async ({ page }) => {
    await ingresar(page);
    const historia = await crearHistoria(page);
    await page.evaluate(id => localStorage.setItem(`undac:hc:workspace:v3:${id}`, JSON.stringify({ formData: { anamnesis: { motivoConsulta: 'BORRADOR-AJENO-NO-VISIBLE' } } })), historia.id);
    await page.route(`**/api/historias/${historia.id}/expediente`, ruta => ruta.abort('failed'));
    await page.goto(`/#/historia-clinica?historia=${historia.id}&seccion=anamnesis`);
    await page.reload();
    await expect(page.getByRole('alert')).toContainText('No se pudo cargar la historia');
    await expect(page.getByText('BORRADOR-AJENO-NO-VISIBLE')).toHaveCount(0);
    await expect(page.getByLabel('Motivo de consulta')).toHaveCount(0);
});

test('no crea historias locales cuando la API no está disponible', async ({ page }) => {
    await ingresar(page);
    await page.goto('/#/historias');
    await page.getByRole('button', { name: 'Nueva historia clínica', exact: true }).waitFor();
    await page.route('**/api/historias', ruta => ruta.abort('failed'));
    await page.getByRole('button', { name: 'Nueva historia clínica', exact: true }).click();
    const dialogo = page.getByRole('dialog', { name: 'Nueva historia clínica' });
    await dialogo.getByLabel('DNI', { exact: true }).fill('99887766');
    await dialogo.getByLabel('Nombres', { exact: true }).fill('Paciente Sintético');
    await expect(dialogo.getByRole('button', { name: 'Crear historia', exact: true })).toBeEnabled();
    await dialogo.getByRole('button', { name: 'Crear historia', exact: true }).click();
    await expect(dialogo).toBeVisible();
    await expect(dialogo).toContainText('No se puede crear la historia sin conexión');
    expect(await page.evaluate(() => localStorage.getItem('undac:historias:frontend:v1'))).toBeNull();
});

test('reintenta cambios en memoria sin escribir el expediente en localStorage', async ({ page }) => {
    await ingresar(page);
    const historia = await crearHistoria(page);
    await page.goto(`/#/historia-clinica?historia=${historia.id}&seccion=anamnesis`);
    const campo = page.getByRole('textbox', { name: 'Motivo de consulta', exact: true });
    await campo.waitFor();
    const interrumpir = ruta => ruta.request().method() === 'PUT' ? ruta.abort('failed') : ruta.continue();
    await page.route(`**/api/historias/${historia.id}/expediente`, interrumpir);
    await campo.fill('Cambio sintético pendiente de confirmar');
    await expect(page.getByLabel('Autoguardado')).toContainText('No se pudo guardar');
    expect(await page.evaluate(id => localStorage.getItem(`undac:hc:workspace:v3:${id}`), historia.id)).toBeNull();
    await page.unroute(`**/api/historias/${historia.id}/expediente`, interrumpir);
    await page.getByRole('button', { name: 'Reintentar guardado', exact: true }).click();
    await expect(page.getByLabel('Autoguardado')).toContainText('Guardado en el servidor');
    await page.reload();
    await expect(campo).toHaveValue('Cambio sintético pendiente de confirmar');
});

test('el siguiente usuario del mismo navegador no accede al expediente anterior', async ({ page }) => {
    await ingresar(page);
    const historia = await crearHistoria(page);
    await page.goto('/#/historias');
    await page.getByRole('button', { name: /Cerrar sesión/i }).click();
    await expect(page.getByRole('button', { name: 'Ingresar al sistema' })).toBeEnabled();
    await ingresar(page, 'alumnoB');
    await page.goto(`/#/historia-clinica?historia=${historia.id}`);
    await expect(page.getByRole('alert')).toContainText('Ya no tiene acceso');
    await expect(page.getByLabel('Nombres completos')).toHaveCount(0);
    expect((await page.request.get(`/api/historias/${historia.id}/expediente`)).status()).toBe(404);
});
