import { readFileSync } from 'node:fs';

const manifiesto = JSON.parse(readFileSync(process.env.CARGA_MANIFIESTO || new URL('../storage/pruebas-rendimiento/app/manifiesto-pruebas.json', import.meta.url)));
if (manifiesto.base !== 'bd_clinica_undac_rendimiento' || manifiesto.entorno !== 'pruebas_rendimiento') throw new Error('Base de rendimiento no permitida.');
const origen = process.env.CARGA_URL || 'http://127.0.0.1:8012';
if (/:(8001|5173)(\/|$)/.test(origen)) throw new Error('Destino de trabajo rechazado.');
let comprobadas = 0;
let renovacionesCsrf = 0;
for (const actor of Object.values(manifiesto.actores).filter(item => item.historias.length)) {
    const cookies = new Map();
    async function solicitar(ruta, datos, permitirRenovacion = true) {
        const respuesta = await fetch(`${origen}/api${ruta}`, {
            method: datos ? 'POST' : 'GET', headers: { Accept: 'application/json',
                Cookie: [...cookies].map(([clave, valor]) => `${clave}=${valor}`).join('; '),
                'Content-Type': 'application/json', 'X-XSRF-TOKEN': decodeURIComponent(cookies.get('XSRF-TOKEN') || ''),
            }, body: datos ? JSON.stringify(datos) : undefined,
        });
        for (const cookie of respuesta.headers.getSetCookie()) {
            const [par] = cookie.split(';'); const indice = par.indexOf('=');
            cookies.set(par.slice(0, indice), par.slice(indice + 1));
        }
        if (respuesta.status === 419 && datos && permitirRenovacion) {
            renovacionesCsrf++;
            await solicitar('/csrf');
            return solicitar(ruta, datos, false);
        }
        if (!respuesta.ok) throw new Error(`Respuesta ${respuesta.status} en ${ruta}`);
        return respuesta.status === 204 ? null : respuesta.json();
    }
    await solicitar('/csrf');
    await solicitar('/auth/login', { nombre_usuario: actor.usuario, contrasena: actor.clave });
    for (const id of actor.historias) {
        const expediente = await solicitar(`/historias/${id}/expediente`);
        const partes = String(expediente.formData.anamnesis.motivoConsulta).split('|');
        if (partes[1] !== actor.usuario || Number(partes[2]) !== id) throw new Error(`Integridad fallida en historia ${id}`);
        comprobadas++;
    }
}
console.log(JSON.stringify({ resultado: 'aprobado', historias: comprobadas, renovacionesCsrf }));
