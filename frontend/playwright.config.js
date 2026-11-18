import { defineConfig, devices } from '@playwright/test';

const externo = process.env.PRUEBAS_URL;
if (externo && ['5173', '8001'].includes(new URL(externo).port)) {
    throw new Error('La URL de trabajo no es un destino permitido para las pruebas.');
}
export default defineConfig({
    testDir: './pruebas-navegador',
    fullyParallel: false,
    workers: 1,
    retries: 0,
    timeout: 60000,
    expect: { timeout: 12000 },
    outputDir: './resultados-navegador',
    snapshotPathTemplate: '{testDir}/referencias/{projectName}/{arg}{ext}',
    reporter: [['list'], ['html', { outputFolder: 'informes-navegador', open: 'never' }]],
    use: {
        baseURL: externo ?? 'http://127.0.0.1:5183',
        trace: 'retain-on-failure', screenshot: 'only-on-failure', video: 'retain-on-failure',
    },
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
        { name: 'firefox', use: { ...devices['Desktop Firefox'], viewport: { width: 1280, height: 800 } } },
    ],
    webServer: externo ? undefined : [
        { command: 'node scripts/servidorPruebas.mjs navegador', url: 'http://127.0.0.1:8011/up', reuseExistingServer: false, timeout: 60000 },
        { command: 'npm run pruebas:navegador:servidor', url: 'http://127.0.0.1:5183', reuseExistingServer: false, timeout: 60000 },
    ],
});
