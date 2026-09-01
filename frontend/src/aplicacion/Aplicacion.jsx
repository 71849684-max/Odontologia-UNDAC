import { useEffect, useState } from 'react';
import PaginaAcceso from './paginas/PaginaAcceso';
import AppLayout from './disenos/AppLayout';
import { MENU_POR_ROL } from './configuracion/menuPorRol';
import DashboardApp from './paginas/DashboardApp';
import PacientesApp from './paginas/PacientesApp';
import HistoriasApp from './paginas/HistoriasApp';
import NuevaHistoriaApp from './paginas/NuevaHistoriaApp';
import HistoriaClinicaApp from './paginas/HistoriaClinicaApp';

const routeAliases = {
    dashboard: 'inicio',
    inicio: 'inicio',
    pacientes: 'pacientes',
    historias: 'historias',
    'nueva-historia': 'nueva-historia',
    historia: 'historia-clinica',
    'historia-clinica': 'historia-clinica',
};

export default function Aplicacion() {
    const [pantalla, establecerPantalla] = useState('acceso');
    const [perfil, establecerPerfil] = useState('alumno');
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
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        window.onNavigate = navigate;

        function abrirHistoria(event) {
            if (!event.detail?.id) return;
            setOpenHistoriaId(event.detail.id);
            if (event.detail.section) establecerSeccionAbierta(event.detail.section);
            setRoute('historia-clinica');
        }

        window.addEventListener('hc:open', abrirHistoria);
        return () => {
            window.removeEventListener('hc:open', abrirHistoria);
            try { delete window.onNavigate; } catch { window.onNavigate = undefined; }
        };
    }, []);

    if (pantalla === 'acceso') {
        return (
            <PaginaAcceso
                perfilSeleccionado={perfil}
                alCambiarPerfil={establecerPerfil}
                alIngresar={() => establecerPantalla('panel')}
            />
        );
    }

    const menu = MENU_POR_ROL[perfil] ?? MENU_POR_ROL.alumno;

    return (
        <AppLayout menu={menu} usuario={{ nombre: 'Demo Usuario' }} rol={perfil} onNavigate={navigate}>
            {route === 'inicio' && <DashboardApp rol={perfil} onNavigate={navigate} />}
            {(route === 'pacientes' || route === 'mis-pacientes') && <PacientesApp onNavigate={navigate} />}
            {(route === 'historias' || route === 'mis-historias') && <HistoriasApp rol={perfil} onNavigate={navigate} />}
            {route === 'nueva-historia' && (
                <NuevaHistoriaApp
                    onNavigate={navigate}
                    onCreated={(historia) => {
                        setOpenHistoriaId(historia.id);
                        establecerSeccionAbierta('datos-paciente');
                        setRoute('historia-clinica');
                    }}
                />
            )}
            {route === 'historia-clinica' && (
                <HistoriaClinicaApp
                    historiaId={openHistoriaId}
                    seccionInicial={openSection}
                    onNavigate={navigate}
                />
            )}
        </AppLayout>
    );
}
