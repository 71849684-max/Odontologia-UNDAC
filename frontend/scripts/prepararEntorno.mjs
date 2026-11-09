import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const tipo = process.argv[2] ?? 'navegador';
if (!['navegador', 'rendimiento'].includes(tipo)) throw new Error('Tipo de entorno no permitido.');
const raiz = resolve(import.meta.dirname, '../..');
const backend = resolve(raiz, 'backend');
const ruta = resolve(backend, `.env.pruebas_${tipo}`);
const almacenamiento = resolve(backend, `storage/pruebas-${tipo}`).replaceAll('\\', '/');
for (const carpeta of ['framework/sessions', 'framework/cache/data', 'framework/views', 'logs', 'app/private']) {
    mkdirSync(resolve(almacenamiento, carpeta), { recursive: true });
}
if (!existsSync(ruta)) {
    const origen = readFileSync(resolve(backend, '.env'), 'utf8');
    const valores = {
        APP_ENV: `pruebas_${tipo}`, APP_DEBUG: 'false', APP_URL: `http://127.0.0.1:${tipo === 'navegador' ? 8011 : 8012}`,
        DB_CONNECTION: 'mysql', DB_DATABASE: `bd_clinica_undac_${tipo}`, SESSION_DRIVER: 'file', SESSION_COOKIE: `undac_pruebas_${tipo}`,
        CACHE_STORE: 'file', LARAVEL_STORAGE_PATH: almacenamiento, DB_URL: '',
        APP_CONFIG_CACHE: `${almacenamiento}/config.php`, APP_ROUTES_CACHE: `${almacenamiento}/rutas.php`,
        APP_EVENTS_CACHE: `${almacenamiento}/eventos.php`,
    };
    let texto = origen;
    for (const [clave, valor] of Object.entries(valores)) {
        const linea = `${clave}="${valor}"`;
        const patron = new RegExp(`^${clave}=.*$`, 'm');
        texto = patron.test(texto) ? texto.replace(patron, linea) : `${texto}\n${linea}\n`;
    }
    writeFileSync(ruta, texto, { mode: 0o600 });
}
const argumentos = process.argv.slice(3);
const resultado = spawnSync('php', ['artisan', `--env=pruebas_${tipo}`, 'pruebas:preparar', ...argumentos], {
    cwd: backend, stdio: 'inherit',
    env: { ...process.env, APP_ENV: `pruebas_${tipo}`, APP_CONFIG_CACHE: `${almacenamiento}/config.php` },
});
process.exit(resultado.status ?? 1);
