import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
    cerrarSesion as cerrarSesionEnServidor,
    iniciarSesion as iniciarSesionEnServidor,
    obtenerSesion,
} from '../servicios/servicioAutenticacion';

const ContextoSesion = createContext(null);

const SESION_ANONIMA = { usuario: null, roles: [], esAdministrador: false };

function normalizarSesion(datos) {
    if (!datos?.usuario) return null;

    return {
        usuario: datos.usuario,
        roles: datos.roles ?? [],
        esAdministrador: Boolean(datos.es_administrador),
    };
}

function mensajeDeError(fallo) {
    const primerError = Object.values(fallo?.errores ?? {}).flat()[0];

    return primerError ?? fallo?.message ?? 'No se pudo iniciar sesión.';
}

export function ProveedorSesion({ children, sesionInicial = null }) {
    const [sesion, establecerSesion] = useState(sesionInicial);
    const [cargando, establecerCargando] = useState(sesionInicial === null);
    const [enviando, establecerEnviando] = useState(false);
    const [error, establecerError] = useState(null);

    useEffect(() => {
        if (sesionInicial !== null) return undefined;

        let vigente = true;

        obtenerSesion()
            .then((datos) => {
                if (vigente) establecerSesion(normalizarSesion(datos));
            })
            .catch(() => {
                if (vigente) establecerSesion(null);
            })
            .finally(() => {
                if (vigente) establecerCargando(false);
            });

        return () => {
            vigente = false;
        };
    }, [sesionInicial]);

    const iniciarSesion = useCallback(async (credenciales) => {
        establecerEnviando(true);
        establecerError(null);

        try {
            establecerSesion(normalizarSesion(await iniciarSesionEnServidor(credenciales)));
            return true;
        } catch (fallo) {
            establecerError(mensajeDeError(fallo));
            return false;
        } finally {
            establecerEnviando(false);
        }
    }, []);

    const cerrarSesion = useCallback(async () => {
        try {
            await cerrarSesionEnServidor();
        } catch {
            // Si la peticion no llega, igual se descarta la sesion local para no
            // dejar la interfaz abierta; al recargar se revalida contra el servidor.
        } finally {
            establecerSesion(null);
            establecerError(null);
        }
    }, []);

    const valor = useMemo(
        () => ({
            ...(sesion ?? SESION_ANONIMA),
            autenticado: sesion !== null,
            cargando,
            enviando,
            error,
            iniciarSesion,
            cerrarSesion,
        }),
        [sesion, cargando, enviando, error, iniciarSesion, cerrarSesion],
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
