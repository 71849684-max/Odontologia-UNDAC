import { lazy, useCallback, useEffect, useRef, useState } from 'react';
import { solicitarSalidaClinica } from './utilidades/salidaClinica.js';
import CargaVista from './componentes/interfaz/CargaVista.jsx';
import EstadoCarga from './componentes/interfaz/EstadoCarga.jsx';
import PaginaAcceso from './paginas/PaginaAcceso';
import AppLayout from './disenos/AppLayout';
import { menuParaSesion, perfilDesdeRoles } from './configuracion/menuPorRol';
import { useSesion } from './autenticacion/ContextoSesion';
import { puedeVerRuta } from './autenticacion/rutasProtegidas';
import AccesoDenegado from './paginas/AccesoDenegado';
import VistaNoDisponible from './paginas/VistaNoDisponible';

const DashboardApp = lazy(() => import('./paginas/DashboardApp'));
const PacientesApp = lazy(() => import('./paginas/PacientesApp'));
const HistoriasApp = lazy(() => import('./paginas/HistoriasApp'));
const HistoriaClinicaApp = lazy(() => import('./paginas/HistoriaClinicaApp'));
const PermisosUsuariosApp = lazy(() => import('./paginas/PermisosUsuariosApp'));
const UsuariosApp = lazy(() => import('./paginas/UsuariosApp'));
const AuditoriaApp = lazy(() => import('./paginas/AuditoriaApp'));
const ConfiguracionApp = lazy(() => import('./paginas/ConfiguracionApp'));
const SeguimientoApp = lazy(() => import('./paginas/SeguimientoApp'));
const PerfilApp = lazy(() => import('./paginas/PerfilApp'));
const CursosApp = lazy(() => import('./paginas/CursosApp'));
const GruposAcademicosApp = lazy(() => import('./paginas/GruposAcademicosApp'));

const routeAliases = {
    dashboard: 'inicio',
    inicio: 'inicio',
    pacientes: 'pacientes',
    historias: 'historias',
    'nueva-historia': 'historias',
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
    'historia-clinica': HistoriaClinicaApp,
    usuarios: UsuariosApp,
    'permisos-usuarios': PermisosUsuariosApp,
    auditoria: AuditoriaApp,
    configuracion: ConfiguracionApp,
    pendientes: SeguimientoApp,
    seguimiento: SeguimientoApp,
    'mis-seguimientos': SeguimientoApp,
    perfil: PerfilApp,
    cursos: CursosApp,
    'grupos-academicos': GruposAcademicosApp,
};

function PantallaCargandoSesion() {
    return (
        <main className="pantalla-sesion">
            <EstadoCarga mensaje="Verificando tu sesión…" detalle="Estamos comprobando tu acceso al sistema." />
        </main>
    );
}

export default function Aplicacion() {
    const sesion = useSesion();
    const [destinoInicial] = useState(leerDestinoActual);
    const [route, setRoute] = useState(destinoInicial.ruta);
    const [openHistoriaId, setOpenHistoriaId] = useState(destinoInicial.historiaId);
    const [openSection, establecerSeccionAbierta] = useState(destinoInicial.seccion);
    const [pacienteInicialHistoria, setPacienteInicialHistoria] = useState(null);
    const [abrirNuevaHistoria, setAbrirNuevaHistoria] = useState(false);
    const navegacionActual = useRef({ hash: window.location.hash, indice: window.history.state?.indiceUndac ?? 0 });
    const solicitudHistorica = useRef(null);

    useEffect(() => {
        window.history.replaceState({ ...window.history.state, indiceUndac: navegacionActual.current.indice }, '', window.location.href);
    }, []);

    const navigate = useCallback((payload, opciones = {}) => {
        if (!payload) return;

        let nextRoute;
        let historiaId = null;
        let seccion = 'datos-paciente';
        let pacienteInicial = null;
        let abrirNueva = false;
        const vistaOriginal = typeof payload === 'object' ? (payload.view ?? payload.id) : payload;

        if (typeof payload === 'string') {
            nextRoute = normalizarRuta(payload);
            abrirNueva = payload === 'nueva-historia';
        }

        if (typeof payload === 'object') {
            nextRoute = normalizarRuta(payload.view ?? payload.id);
            historiaId = payload.historiaId ?? payload.params?.historiaId ?? null;
            seccion = payload.section ?? payload.params?.section ?? 'datos-paciente';
            pacienteInicial = payload.paciente ?? null;
            abrirNueva = Boolean(payload.abrirNueva || pacienteInicial || vistaOriginal === 'nueva-historia');
        }

        if (!nextRoute) return;
        const hash = crearHashNavegacion(nextRoute, historiaId, seccion);
        const continuar = () => {
            setRoute(nextRoute);
            setOpenHistoriaId(historiaId);
            establecerSeccionAbierta(seccion);
            const esListaHistorias = nextRoute === 'historias' || nextRoute === 'mis-historias';
            setPacienteInicialHistoria(esListaHistorias ? pacienteInicial : null);
            setAbrirNuevaHistoria(esListaHistorias && abrirNueva);

            if (typeof window !== 'undefined') {
                if (window.location.hash !== hash) {
                    const indice = navegacionActual.current.indice + (opciones.reemplazar ? 0 : 1);
                    navegacionActual.current = { hash, indice };
                    window.history[opciones.reemplazar ? 'replaceState' : 'pushState'](
                        { ruta: nextRoute, indiceUndac: indice },
                        '',
                        hash,
                    );
                }
            }
            navegacionActual.current = { hash, indice: window.history.state?.indiceUndac ?? navegacionActual.current.indice };
            opciones.alNavegar?.();
        };
        if (hash !== navegacionActual.current.hash && !solicitarSalidaClinica(continuar)) return;
        continuar();
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
        function sincronizarConNavegador(evento) {
            const hash = window.location.hash;
            if (hash === navegacionActual.current.hash) return;
            if (hash === solicitudHistorica.current) return;
            solicitudHistorica.current = hash;
            const destino = leerDestinoActual();
            const indiceConocido = Number.isInteger(window.history.state?.indiceUndac);
            const entradaNueva = !indiceConocido && evento.type === 'hashchange';
            const indice = indiceConocido ? window.history.state.indiceUndac : navegacionActual.current.indice + 1;
            if (!indiceConocido) window.history.replaceState({ ...window.history.state, indiceUndac: indice }, '', window.location.href);
            const continuar = () => {
                solicitudHistorica.current = null;
                navegacionActual.current = { hash, indice };
                setRoute(destino.ruta);
                setOpenHistoriaId(destino.historiaId);
                establecerSeccionAbierta(destino.seccion);
                setPacienteInicialHistoria(null);
                setAbrirNuevaHistoria(false);
            };
            const cancelar = () => {
                solicitudHistorica.current = null;
                const distancia = navegacionActual.current.indice - indice;
                if (distancia && (indiceConocido || entradaNueva)) window.history.go(distancia);
                else window.history.replaceState({ ...window.history.state, indiceUndac: navegacionActual.current.indice }, '', navegacionActual.current.hash);
            };
            if (solicitarSalidaClinica(continuar, cancelar)) continuar();
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
            const hash = crearHashNavegacion(route, openHistoriaId, openSection);
            navegacionActual.current.hash = hash;
            window.history.replaceState({ ruta: route, indiceUndac: navegacionActual.current.indice }, '', hash);
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
                alReintentarSalida={sesion.salidaPendiente ? sesion.cerrarSesion : null}
                alIngresar={async (credenciales) => {
                    if (await sesion.iniciarSesion(credenciales)) navigate('inicio', { reemplazar: true });
                }}
            />
        );
    }

    const perfil = perfilDesdeRoles(sesion.roles);
    const menu = menuParaSesion(perfil, sesion.permisos);
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
                navigate('inicio', { reemplazar: true, alNavegar: () => sesion.cerrarSesion() });
            }}
        >
            <CargaVista key={route}>
                <ComponenteVista
                    rol={perfil}
                    usuario={sesion.usuario}
                    permisos={sesion.permisos}
                    tipo={route === 'pendientes' ? 'pendientes' : 'seguimiento'}
                    historiaId={openHistoriaId}
                    seccionInicial={openSection}
                    pacienteInicial={pacienteInicialHistoria}
                    abrirNueva={abrirNuevaHistoria}
                    onNavigate={navigate}
                    onCreated={(historia) => {
                        navigate({ view: 'historia-clinica', historiaId: historia.id, section: 'datos-paciente' });
                    }}
                />
            </CargaVista>
        </AppLayout>
    );
}
