const BASE = '/api';

/** El backend responde 419 cuando el token CSRF caduco o falta. */
const ESTADO_CSRF_INVALIDO = 419;

export class ErrorHttp extends Error {
    constructor(mensaje, { estado, errores = {}, cuerpo = null } = {}) {
        super(mensaje);
        this.name = 'ErrorHttp';
        this.estado = estado;
        this.errores = errores;
        this.cuerpo = cuerpo;
    }

    get esNoAutenticado() {
        return this.estado === 401;
    }

    get esProhibido() {
        return this.estado === 403;
    }
}

function leerCookie(nombre) {
    const encontrada = document.cookie
        .split('; ')
        .find((entrada) => entrada.startsWith(`${nombre}=`));

    return encontrada ? decodeURIComponent(encontrada.slice(nombre.length + 1)) : null;
}

/**
 * Pide la cookie XSRF-TOKEN. Laravel la adjunta a cualquier respuesta del grupo web.
 */
export async function asegurarTokenCsrf() {
    if (leerCookie('XSRF-TOKEN')) return;

    await fetch(`${BASE}/csrf`, {
        credentials: 'same-origin',
        headers: { Accept: 'application/json' },
    });
}

async function interpretarCuerpo(respuesta) {
    const tipo = respuesta.headers.get('content-type') ?? '';

    if (!tipo.includes('application/json')) return null;

    try {
        return await respuesta.json();
    } catch {
        return null;
    }
}

async function ejecutar(metodo, ruta, datos, { reintentarCsrf = true } = {}) {
    const encabezados = { Accept: 'application/json' };

    if (metodo !== 'GET') {
        await asegurarTokenCsrf();

        const token = leerCookie('XSRF-TOKEN');
        if (token) encabezados['X-XSRF-TOKEN'] = token;
        if (datos !== undefined) encabezados['Content-Type'] = 'application/json';
    }

    const respuesta = await fetch(`${BASE}${ruta}`, {
        method: metodo,
        credentials: 'same-origin',
        headers: encabezados,
        body: datos === undefined ? undefined : JSON.stringify(datos),
    });

    // Tras cerrar sesion el token cambia; se renueva una sola vez y se reintenta.
    if (respuesta.status === ESTADO_CSRF_INVALIDO && reintentarCsrf) {
        document.cookie = 'XSRF-TOKEN=; Max-Age=0; path=/';
        return ejecutar(metodo, ruta, datos, { reintentarCsrf: false });
    }

    const cuerpo = await interpretarCuerpo(respuesta);

    if (!respuesta.ok) {
        throw new ErrorHttp(cuerpo?.message ?? 'No se pudo completar la solicitud.', {
            estado: respuesta.status,
            errores: cuerpo?.errors ?? {},
            cuerpo,
        });
    }

    return cuerpo;
}

export const clienteHttp = {
    obtener: (ruta) => ejecutar('GET', ruta),
    enviar: (ruta, datos) => ejecutar('POST', ruta, datos),
    actualizar: (ruta, datos) => ejecutar('PUT', ruta, datos),
    parchear: (ruta, datos) => ejecutar('PATCH', ruta, datos),
    eliminar: (ruta) => ejecutar('DELETE', ruta),
};
