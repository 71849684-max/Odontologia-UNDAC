import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { haySalidaPendiente, marcarSalidaPendiente, claveSalidaPendiente } from './salidaPendiente.js';
import {
    cerrarSesion as cerrarSesionEnServidor,
    iniciarSesion as iniciarSesionEnServidor,
    obtenerSesion,
} from '../servicios/servicioAutenticacion';

const ContextoSesion = createContext(null);

const SESION_ANONIMA = { usuario: null, roles: [], esAdministrador: false, permisos: null };
const ERROR_SALIDA = 'No se pudo confirmar el cierre de sesión. Reintente la salida antes de compartir el equipo.';

let confirmacionEnCurso = null;
function confirmarSalida() {
    if (!confirmacionEnCurso) confirmacionEnCurso = (async () => {
        try { await cerrarSesionEnServidor(); } catch (fallo) {
            if (fallo?.estado !== 401) throw fallo;
        }
        marcarSalidaPendiente(false);
    })().finally(() => { confirmacionEnCurso = null; });
    return confirmacionEnCurso;
}

function normalizarSesion(datos) {
    if (!datos?.usuario) return null;

    return {
        usuario: datos.usuario,
        roles: datos.roles ?? [],
        esAdministrador: Boolean(datos.es_administrador),
        permisos: Array.isArray(datos.permisos) ? datos.permisos : null,
    };
}

function mensajeDeError(fallo) {
    if (fallo instanceof TypeError) return 'No se pudo conectar con el servidor. Inténtelo de nuevo.';
    const primerError = Object.values(fallo?.errores ?? {}).flat()[0];

    return primerError ?? fallo?.message ?? 'No se pudo iniciar sesión.';
}

export function ProveedorSesion({ children, sesionInicial = null }) {
    const [sesion, establecerSesion] = useState(sesionInicial);
    const [cargando, establecerCargando] = useState(sesionInicial === null);
    const [enviando, establecerEnviando] = useState(false);
    const [error, establecerError] = useState(null);
    const generacion = useRef(0);

    useEffect(() => {
        if (sesionInicial !== null) return undefined;

        let vigente = true;

        const actual = generacion.current;
        const pendiente = haySalidaPendiente();
        (pendiente ? confirmarSalida().then(() => null) : obtenerSesion())
            .then((datos) => {
                if (vigente && actual === generacion.current && !haySalidaPendiente()) establecerSesion(normalizarSesion(datos));
            })
            .catch(() => {
                if (vigente && actual === generacion.current) {
                    establecerSesion(null);
                    if (pendiente) establecerError(ERROR_SALIDA);
                }
            })
            .finally(() => {
                if (vigente) establecerCargando(false);
            });

        return () => {
            vigente = false;
        };
    }, [sesionInicial]);

    const iniciarSesion = useCallback(async (credenciales) => {
        generacion.current++;
        establecerEnviando(true);
        establecerError(null);

        try {
            // El cierre puede estar impedido por una cuenta anterior bloqueada.
            // Una autenticación explícita válida regenera la sesión en Laravel.
            if (haySalidaPendiente()) await confirmarSalida().catch(() => {});
            const nuevaSesion = normalizarSesion(await iniciarSesionEnServidor(credenciales));
            if (!nuevaSesion) throw new Error('No se pudo verificar la nueva sesión. Inténtelo de nuevo.');
            marcarSalidaPendiente(false);
            establecerSesion(nuevaSesion);
            return true;
        } catch (fallo) {
            establecerError(mensajeDeError(fallo));
            return false;
        } finally {
            establecerEnviando(false);
        }
    }, []);

    const refrescar = useCallback(async () => {
        const actual = generacion.current;
        if (haySalidaPendiente()) return;
        try {
            const datos = await obtenerSesion();
            const normalizada = normalizarSesion(datos);
            if (actual === generacion.current && !haySalidaPendiente()) establecerSesion(normalizada);
        } catch {
            // La sesión en pantalla se conserva si el servidor no responde.
        }
    }, []);

    const cerrarSesion = useCallback(async () => {
        generacion.current++;
        marcarSalidaPendiente(true);
        establecerEnviando(true);
        establecerSesion(null);
        establecerError(null);
        try {
            await confirmarSalida();
        } catch {
            establecerError(ERROR_SALIDA);
        } finally {
            establecerSesion(null);
            establecerEnviando(false);
        }
    }, []);

    useEffect(() => {
        const bloquear = (evento) => {
            if (evento.key !== claveSalidaPendiente) return;
            if (evento.newValue === null) {
                marcarSalidaPendiente(false);
                establecerError(null);
                return;
            }
            if (evento.newValue !== '1') return;
            generacion.current++;
            establecerSesion(null);
            establecerError(ERROR_SALIDA);
        };
        const reintentar = async () => {
            if (!haySalidaPendiente()) return;
            establecerEnviando(true);
            try { await confirmarSalida(); establecerError(null); }
            catch { establecerError(ERROR_SALIDA); }
            finally { establecerEnviando(false); }
        };
        window.addEventListener('storage', bloquear);
        window.addEventListener('online', reintentar);
        return () => {
            window.removeEventListener('storage', bloquear);
            window.removeEventListener('online', reintentar);
        };
    }, []);

    const valor = useMemo(
        () => ({
            ...(sesion ?? SESION_ANONIMA),
            autenticado: sesion !== null,
            cargando,
            enviando,
            error,
            salidaPendiente: haySalidaPendiente(),
            iniciarSesion,
            cerrarSesion,
            refrescar,
        }),
        [sesion, cargando, enviando, error, iniciarSesion, cerrarSesion, refrescar],
    );

    return <ContextoSesion.Provider value={valor}>{children}</ContextoSesion.Provider>;
}

export function useSesion() {
    const valor = useContext(ContextoSesion);

    if (valor === null) {
        throw new Error('useSesion debe usarse dentro de ProveedorSesion.');
    }

    return valor;
}
