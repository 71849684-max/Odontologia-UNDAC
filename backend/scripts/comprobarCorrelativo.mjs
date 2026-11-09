import { spawn } from 'node:child_process';
const ejecutar = argumentos => new Promise((resolver, rechazar) => {
    const hijo = spawn('php', ['scripts/correlativoPrueba.php', ...argumentos], { cwd: new URL('..', import.meta.url), env: { ...process.env, APP_ENV: 'testing', APP_CONFIG_CACHE: 'storage/framework/config-correlativo-prueba.php' } });
    let salida = ''; let errores = '';
    hijo.stdout.on('data', dato => salida += dato);
    hijo.stderr.on('data', dato => errores += dato);
    hijo.on('error', rechazar);
    hijo.on('exit', codigo => {
        if (codigo) return rechazar(new Error(errores || salida));
        try { resolver(JSON.parse(salida)); } catch { rechazar(new Error('Respuesta de prueba inválida: ' + salida)); }
    });
});
const { actor } = await ejecutar(['preparar']);
const comienzo = performance.now();
const base = 92000000 + Math.floor(Math.random() * 1000000);
const resultados = await Promise.all(Array.from({ length: 20 }, (_, indice) => ejecutar([actor, String(base + indice)])));
const unicos = new Set(resultados.map(fila => fila.codigo)).size;
if (unicos !== 20) throw new Error('Se repitió un correlativo.');
console.log(JSON.stringify({ base: 'bd_clinica_undac_test', conexiones: 20, confirmadas: resultados.length, codigosUnicos: unicos, duracionMs: Math.round(performance.now() - comienzo) }));
