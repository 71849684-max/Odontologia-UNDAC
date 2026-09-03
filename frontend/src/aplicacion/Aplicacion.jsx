import { useEffect, useState } from 'react';
import PaginaAcceso from './paginas/PaginaAcceso';
import AppLayout from './disenos/AppLayout';
import { MENU_POR_ROL } from './configuracion/menuPorRol';
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

export default function Aplicacion() {
    const [pantalla, establecerPantalla] = useState('acceso');
    const [perfil, establecerPerfil] = useState('alumno');
    const [usuario, establecerUsuario] = useState({ nombre: 'María Quispe' });
    const [route, setRoute] = useState('inicio');
    const [openHistoriaId, setOpenHistoriaId] = useState(null);
    const [openSection, establecerSeccionAbierta] = useState('datos-paciente');

    function navigate(payload) {
        if (!payload) return;

        if (typeof payload === 'string') {
            setRoute(routeAliases[payload] ?? payload);
            return;
        }

        if (typeof payload === 'object') {
            const nextRoute = routeAliases[payload.view ?? payload.id] ?? payload.view ?? payload.id;
            if (nextRoute) setRoute(nextRoute);
            if (payload.section) establecerSeccionAbierta(payload.section);
            if (payload.params?.section) establecerSeccionAbierta(payload.params.section);
            if (payload.historiaId) setOpenHistoriaId(payload.historiaId);
            if (payload.params?.historiaId) setOpenHistoriaId(payload.params.historiaId);
        }
    }

    useEffect(() => {
        window.onNavigate = navigate;

        function abrirHistoria(event) {
            if (!event.detail?.id) return;
            setOpenHistoriaId(event.detail.id);
            if (event.detail.section) establecerSeccionAbierta(event.detail.section);
            setRoute('historia-clinica');
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
    }, []);

    useEffect(() => {
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
    }, [route]);

    if (pantalla === 'acceso') {
        return (
            <PaginaAcceso
                alIngresar={(identidad) => {
                    establecerPerfil(identidad?.rol ?? 'alumno');
                    establecerUsuario({ nombre: identidad?.nombre ?? 'Usuario institucional' });
                    setRoute('inicio');
                    establecerPantalla('panel');
                }}
            />
        );
    }

    const menu = MENU_POR_ROL[perfil] ?? MENU_POR_ROL.alumno;
    const ComponenteVista = VIEW_COMPONENTS[route] ?? VistaNoDisponible;

    return (
        <AppLayout
            menu={menu}
            usuario={usuario}
            rol={perfil}
            activo={route}
            onNavigate={navigate}
            onLogout={() => establecerPantalla('acceso')}
        >
            <ComponenteVista
                rol={perfil}
                usuario={usuario}
                tipo={route === 'pendientes' ? 'pendientes' : 'seguimiento'}
                historiaId={openHistoriaId}
                seccionInicial={openSection}
                onNavigate={navigate}
                onCreated={(historia) => {
                    setOpenHistoriaId(historia.id);
                    establecerSeccionAbierta('datos-paciente');
                    setRoute('historia-clinica');
                }}
            />
        </AppLayout>
    );
}
