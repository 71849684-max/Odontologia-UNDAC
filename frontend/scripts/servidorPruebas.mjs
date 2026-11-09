import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { parseEnv } from 'node:util';

const tipo = process.argv[2] ?? 'navegador';
if (!['navegador', 'rendimiento'].includes(tipo)) throw new Error('Entorno no permitido.');
const backend = resolve(import.meta.dirname, '../../backend');
const almacenamiento = resolve(backend, `storage/pruebas-${tipo}`).replaceAll('\\', '/');
const configuracion = parseEnv(readFileSync(resolve(backend, `.env.pruebas_${tipo}`), 'utf8'));
if (configuracion.APP_ENV !== `pruebas_${tipo}` || configuracion.DB_DATABASE !== `bd_clinica_undac_${tipo}` || configuracion.DB_URL) {
    throw new Error('La configuración no corresponde al entorno exclusivo. Ejecute primero su preparación.');
}
const hijo = spawn('php', ['artisan', `--env=pruebas_${tipo}`, 'serve', '--host=127.0.0.1', `--port=${tipo === 'navegador' ? 8011 : 8012}`, '--no-reload'], {
    cwd: backend, stdio: 'inherit', env: {
        ...process.env, ...configuracion, APP_ENV: `pruebas_${tipo}`, APP_CONFIG_CACHE: `${almacenamiento}/config.php`,
    },
});
for (const señal of ['SIGINT', 'SIGTERM']) process.on(señal, () => hijo.kill(señal));
hijo.on('exit', codigo => process.exit(codigo ?? 1));
