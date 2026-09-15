import { useCallback, useEffect, useState } from 'react';
import PaginaAcceso from './paginas/PaginaAcceso';
import AppLayout from './disenos/AppLayout';
import { MENU_POR_ROL, perfilDesdeRoles } from './configuracion/menuPorRol';
import { useSesion } from './autenticacion/ContextoSesion';
import { puedeVerRuta } from './autenticacion/rutasProtegidas';
import AccesoDenegado from './paginas/AccesoDenegado';
import DashboardApp from './paginas/DashboardApp';
import PacientesApp from './paginas/PacientesApp';
import HistoriasApp from './paginas/HistoriasApp';
import NuevaHistoriaApp from './paginas/NuevaHistoriaApp';
import HistoriaClinicaApp from './paginas/HistoriaClinicaApp';
import PermisosUsuariosApp from './paginas/PermisosUsuariosApp';
import UsuariosApp from './paginas/UsuariosApp';
import AuditoriaApp from './paginas/AuditoriaApp';
import ConfiguracionApp from './paginas/ConfiguracionApp';
import SeguimientoApp from './paginas/SeguimientoApp';
import VistaNoDisponible from './paginas/VistaNoDisponible';

const routeAliases = {
    dashboard: 'inicio',
    inicio: 'inicio',
    pacientes: 'pacientes',
    historias: 'historias',
    'nueva-historia': 'nueva-historia',
    historia: 'historia-clinica',
    'historia-clinica': 'historia-clinica',
    permisos: 'permisos-usuarios',
    'permisos-usuarios': 'permisos-usuarios',
};

function normalizarRuta(ruta) {
    return routeAliases[ruta] ?? ruta ?? 'inicio';
}

function leerDestinoActual() {
    if (typeof window === 'undefined') {
        return { ruta: 'inicio', historiaId: null, seccion: 'datos-paciente' };
    }

    const fragmento = window.location.hash.replace(/^#\/?/, '');
    if (!fragmento) {
        return { ruta: 'inicio', historiaId: null, seccion: 'datos-paciente' };
    }

    const [rutaCodificada, consulta = ''] = fragmento.split('?');
    let ruta = rutaCodificada;
    try { ruta = decodeURIComponent(rutaCodificada); } catch { ruta = rutaCodificada; }

    const parametros = new URLSearchParams(consulta);
    return {
        ruta: normalizarRuta(ruta),
        historiaId: parametros.get('historia'),
        seccion: parametros.get('seccion') ?? 'datos-paciente',
    };
}

function crearHashNavegacion(ruta, historiaId = null, seccion = null) {
    const parametros = new URLSearchParams();
    if (ruta === 'historia-clinica' && historiaId) parametros.set('historia', historiaId);
    if (ruta === 'historia-clinica' && seccion && seccion !== 'datos-paciente') parametros.set('seccion', seccion);
    const consulta = parametros.toString();
    return `#/${encodeURIComponent(ruta)}${consulta ? `?${consulta}` : ''}`;
}

const VIEW_COMPONENTS = {
    inicio: DashboardApp,
    pacientes: PacientesApp,
    'mis-pacientes': PacientesApp,
    historias: HistoriasApp,
    'mis-historias': HistoriasApp,
    'nueva-historia': NuevaHistoriaApp,
    'historia-clinica': HistoriaClinicaApp,
    usuarios: UsuariosApp,
    'permisos-usuarios': PermisosUsuariosApp,
    auditoria: AuditoriaApp,
    configuracion: ConfiguracionApp,
    pendientes: SeguimientoApp,
    seguimiento: SeguimientoApp,
    'mis-seguimientos': SeguimientoApp,
};

function PantallaCargandoSesion() {
    return (
        <main className="pantalla-sesion" role="status" aria-live="polite">
            <p>Verificando tu sesión…</p>
        </main>
    );
}

export default function Aplicacion() {
    const sesion = useSesion();
    const [destinoInicial] = useState(leerDestinoActual);
    const [route, setRoute] = useState(destinoInicial.ruta);
    const [openHistoriaId, setOpenHistoriaId] = useState(destinoInicial.historiaId);
    const [openSection, establecerSeccionAbierta] = useState(destinoInicial.seccion);

    const navigate = useCallback((payload, opciones = {}) => {
        if (!payload) return;

        let nextRoute;
        let historiaId = null;
        let seccion = 'datos-paciente';

        if (typeof payload === 'string') {
            nextRoute = normalizarRuta(payload);
        }

        if (typeof payload === 'object') {
            nextRoute = normalizarRuta(payload.view ?? payload.id);
            historiaId = payload.historiaId ?? payload.params?.historiaId ?? null;
            seccion = payload.section ?? payload.params?.section ?? 'datos-paciente';
        }

        if (!nextRoute) return;
        setRoute(nextRoute);
        setOpenHistoriaId(historiaId);
        establecerSeccionAbierta(seccion);

        if (typeof window !== 'undefined') {
            const hash = crearHashNavegacion(nextRoute, historiaId, seccion);
            if (window.location.hash !== hash) {
                window.history[opciones.reemplazar ? 'replaceState' : 'pushState'](
                    { ruta: nextRoute },
                    '',
                    hash,
                );
            }
        }
    }, []);

    useEffect(() => {
        window.onNavigate = navigate;

        function abrirHistoria(event) {
            if (!event.detail?.id) return;
            navigate({
                view: 'historia-clinica',
                historiaId: event.detail.id,
                section: event.detail.section,
            });
        }

        function navegarDesdeEvento(event) {
            navigate(event.detail);
        }

        window.addEventListener('hc:open', abrirHistoria);
        window.addEventListener('hc:navigate', navegarDesdeEvento);
        return () => {
            window.removeEventListener('hc:open', abrirHistoria);
            window.removeEventListener('hc:navigate', navegarDesdeEvento);
            try { delete window.onNavigate; } catch { window.onNavigate = undefined; }
        };
    }, [navigate]);

    useEffect(() => {
        function sincronizarConNavegador() {
            const destino = leerDestinoActual();
            setRoute(destino.ruta);
            setOpenHistoriaId(destino.historiaId);
            establecerSeccionAbierta(destino.seccion);
        }

        window.addEventListener('popstate', sincronizarConNavegador);
        window.addEventListener('hashchange', sincronizarConNavegador);
        return () => {
            window.removeEventListener('popstate', sincronizarConNavegador);
            window.removeEventListener('hashchange', sincronizarConNavegador);
        };
    }, []);

    useEffect(() => {
        if (sesion.autenticado && !window.location.hash) {
            window.history.replaceState({ ruta: route }, '', crearHashNavegacion(route, openHistoriaId, openSection));
        }
    }, [sesion.autenticado, route, openHistoriaId, openSection]);

    useEffect(() => {
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
    }, [route]);

    if (sesion.cargando) {
        return <PantallaCargandoSesion />;
    }

    if (!sesion.autenticado) {
        return (
            <PaginaAcceso
                enviando={sesion.enviando}
                error={sesion.error}
                alIngresar={async (credenciales) => {
                    if (await sesion.iniciarSesion(credenciales)) navigate('inicio', { reemplazar: true });
                }}
            />
        );
    }

    const perfil = perfilDesdeRoles(sesion.roles);
    const menu = MENU_POR_ROL[perfil] ?? MENU_POR_ROL.administrativo;
    const ComponenteVista = puedeVerRuta(route, sesion)
        ? VIEW_COMPONENTS[route] ?? VistaNoDisponible
        : AccesoDenegado;

    return (
        <AppLayout
            menu={menu}
            usuario={sesion.usuario}
            rol={perfil}
            activo={route}
            modoClinico={route === 'historia-clinica'}
            onNavigate={navigate}
            onLogout={() => {
                navigate('inicio', { reemplazar: true });
                sesion.cerrarSesion();
            }}
        >
            <ComponenteVista
                rol={perfil}
                usuario={sesion.usuario}
                tipo={route === 'pendientes' ? 'pendientes' : 'seguimiento'}
                historiaId={openHistoriaId}
                seccionInicial={openSection}
                onNavigate={navigate}
                onCreated={(historia) => {
                    navigate({ view: 'historia-clinica', historiaId: historia.id, section: 'datos-paciente' });
                }}
            />
        </AppLayout>
    );
}
