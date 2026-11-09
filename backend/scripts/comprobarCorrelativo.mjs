import { spawn } from 'node:child_process';
const ejecutar = argumentos => new Promise((resolver, rechazar) => {
    const hijo = spawn('php', ['scripts/correlativoPrueba.php', ...argumentos], { cwd: new URL('..', import.meta.url), env: { ...process.env, APP_ENV: 'testing', APP_CONFIG_CACHE: 'storage/framework/config-correlativo-prueba.php' } });
    let salida = ''; let errores = '';
    hijo.stdout.on('data', dato => salida += dato);
    hijo.stderr.on('data', dato => errores += dato);
    hijo.on('error', rechazar);
    hijo.on('close', codigo => {
        if (codigo !== 0) return rechazar(new Error(errores || salida || `La prueba PHP terminó con código ${codigo}.`));
        try { resolver(JSON.parse(salida)); } catch { rechazar(new Error('Respuesta de prueba inválida: ' + salida)); }
    });
});
const { actor, anioNuevo } = await ejecutar(['preparar']);
const comienzo = performance.now();
const base = 92000000 + Math.floor(Math.random() * 1000000);
const escenarios = [];
for (const [indiceEscenario, anio] of [undefined, anioNuevo].entries()) {
    const resultados = await Promise.all(Array.from({ length: 20 }, (_, indice) => ejecutar([actor, String(base + indiceEscenario * 20 + indice), ...(anio ? [String(anio)] : [])])));
    const unicos = new Set(resultados.map(fila => fila.codigo)).size;
    if (unicos !== 20) throw new Error('Se repitió un correlativo.');
    escenarios.push({ escenario: anio ? 'Año nuevo sin contador previo' : 'Año actual', confirmadas: resultados.length, codigosUnicos: unicos });
}
console.log(JSON.stringify({ base: 'bd_clinica_undac_test', conexionesPorEscenario: 20, escenarios, duracionMs: Math.round(performance.now() - comienzo) }));
