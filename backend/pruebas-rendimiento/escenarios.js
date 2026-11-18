import http from 'k6/http';
import { check, sleep, fail } from 'k6';
import { SharedArray } from 'k6/data';
import { Counter, Rate } from 'k6/metrics';
import ejecucionActual from 'k6/execution';

const manifiesto = JSON.parse(open(__ENV.CARGA_MANIFIESTO || '../storage/pruebas-rendimiento/app/manifiesto-pruebas.json'));
if (manifiesto.base !== 'bd_clinica_undac_rendimiento' || manifiesto.entorno !== 'pruebas_rendimiento') {
    throw new Error('El manifiesto no corresponde a la base exclusiva de rendimiento.');
}
const actores = new SharedArray('operadores', () => Object.values(manifiesto.actores).filter(actor => actor.historias.length));
const origen = (__ENV.CARGA_URL || 'http://127.0.0.1:8012').replace(/\/$/, '');
if (/:(8001|5173)(\/|$)/.test(origen)) throw new Error('Destino de trabajo rechazado. Use el servidor exclusivo de rendimiento.');
const escenario = __ENV.CARGA_ESCENARIO || 'mixto';
if (!['listado', 'lectura', 'autoguardado', 'mixto'].includes(escenario)) throw new Error('Escenario no permitido.');
const humo = __ENV.CARGA_HUMO === '1';
const usuarios = Number(__ENV.CARGA_USUARIOS || (humo ? 1 : escenario === 'listado' || escenario === 'mixto' ? 40 : 30));
if (usuarios > actores.length) throw new Error('Faltan operadores con historias propias para la concurrencia solicitada.');
const fallosServidor = new Counter('fallos_servidor');
const integridad = new Rate('integridad');
const conflictos = new Counter('conflictos');
const muestrasEstables = new Counter('muestras_estables');
const ejecucion = __ENV.CARGA_EJECUCION || String(Date.now());
const minimoMuestras = humo ? 1 : 30;
let autenticado = false;

export const options = {
    noCookiesReset: true,
    scenarios: { nominal: { executor: 'ramping-vus', startVUs: 0, gracefulRampDown: '30s', stages: humo
        ? [{ duration: '2s', target: usuarios }, { duration: '10s', target: usuarios }]
        : [{ duration: '30s', target: Math.min(5, usuarios) }, { duration: '1m', target: usuarios }, { duration: '5m', target: usuarios }, { duration: '30s', target: 0 }] } },
    thresholds: {
        http_req_failed: ['rate<0.01'],
        fallos_servidor: ['count==0'],
        checks: ['rate==1'],
        ...(['listado', 'mixto'].includes(escenario) ? {
            'http_req_duration{operacion:listado,fase:estable}': ['p(95)<800'],
            'muestras_estables{operacion:listado}': [`count>=${minimoMuestras}`],
        } : {}),
        ...(['lectura', 'mixto', 'autoguardado'].includes(escenario) ? {
            'http_req_duration{operacion:lectura,fase:estable}': ['p(95)<1200'],
            'muestras_estables{operacion:lectura}': [`count>=${minimoMuestras}`],
        } : {}),
        ...(['autoguardado', 'mixto'].includes(escenario) ? {
            'http_req_duration{operacion:autoguardado,fase:estable}': ['p(95)<700'],
            'muestras_estables{operacion:autoguardado}': [`count>=${minimoMuestras}`],
            integridad: ['rate==1'], conflictos: ['count==0'],
        } : {}),
    },
    summaryTrendStats: ['avg', 'med', 'p(95)', 'p(99)', 'max', 'count'],
};

function solicitud(metodo, ruta, datos, operacion, csrf = true) {
    const transcurrido = Date.now() - ejecucionActual.scenario.startTime;
    const comienzoEstable = humo ? 2000 : 90000;
    const finEstable = humo ? 12000 : 390000;
    const fase = transcurrido < comienzoEstable ? 'calentamiento' : transcurrido < finEstable ? 'estable' : 'recuperacion';
    const jarra = http.cookieJar();
    const token = jarra.cookiesForURL(origen)['XSRF-TOKEN']?.[0];
    const respuesta = http.request(metodo, `${origen}/api${ruta}`, datos === undefined ? null : JSON.stringify(datos), {
        headers: { Accept: 'application/json', 'Content-Type': 'application/json', ...(csrf && token ? { 'X-XSRF-TOKEN': decodeURIComponent(token) } : {}) },
        tags: { operacion, fase },
    });
    if (fase === 'estable') muestrasEstables.add(1, { operacion });
    fallosServidor.add(respuesta.status >= 500 ? 1 : 0);
    return respuesta;
}

export default function () {
    const actor = actores[__VU - 1];
    if (!autenticado) {
        solicitud('GET', '/csrf', undefined, 'csrf', false);
        const ingreso = solicitud('POST', '/auth/login', { nombre_usuario: actor.usuario, contrasena: actor.clave }, 'sesion');
        if (!check(ingreso, { 'sesión iniciada': respuesta => respuesta.status === 200 })) fail('No fue posible iniciar sesión.');
        autenticado = true;
    }
    if (['listado', 'mixto'].includes(escenario)) {
        check(solicitud('GET', '/historias', undefined, 'listado'), { 'listado autorizado': respuesta => respuesta.status === 200 });
    }
    if (escenario !== 'listado') {
        const id = actor.historias[escenario === 'lectura' ? __ITER % actor.historias.length : 0];
        const lectura = solicitud('GET', `/historias/${id}/expediente`, undefined, 'lectura');
        if (!check(lectura, { 'expediente disponible': respuesta => respuesta.status === 200 })) fail('Lectura fallida.');
        if (['autoguardado', 'mixto'].includes(escenario)) {
            const expediente = lectura.json();
            const marcador = `${ejecucion}|${actor.usuario}|${id}|${__ITER}`;
            const formulario = expediente.formData;
            formulario.anamnesis = { ...formulario.anamnesis, motivoConsulta: marcador };
            const guardado = solicitud('PUT', `/historias/${id}/expediente`, { formData: formulario, sectionStatus: expediente.sectionStatus, revision: expediente.revision }, 'autoguardado');
            conflictos.add(guardado.status === 422 ? 1 : 0);
            check(guardado, { 'guardado confirmado': respuesta => respuesta.status === 200 });
            const verificacion = solicitud('GET', `/historias/${id}/expediente`, undefined, 'verificacion');
            integridad.add(verificacion.status === 200 && verificacion.json('formData.anamnesis.motivoConsulta') === marcador);
        }
    }
    // Intervalo clínico; el tiempo de espera no se incluye en http_req_duration.
    sleep(humo ? 1 : escenario === 'autoguardado' || escenario === 'mixto' ? 30 : 3);
}

export function handleSummary(datos) {
    return { [__ENV.CARGA_INFORME || 'resultados/resumen.json']: JSON.stringify({ ejecucion, escenario, usuarios, humo, origen, datos }, null, 2) };
}
