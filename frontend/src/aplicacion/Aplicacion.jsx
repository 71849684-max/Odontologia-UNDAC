import { useEffect, useState } from 'react';
import PaginaAcceso from './paginas/PaginaAcceso';
import AppLayout from './disenos/AppLayout';
import { MENU_POR_ROL } from './configuracion/menuPorRol';
import DashboardApp from './paginas/DashboardApp';
import PacientesApp from './paginas/PacientesApp';
import HistoriasApp from './paginas/HistoriasApp';
import NuevaHistoriaApp from './paginas/NuevaHistoriaApp';
import HistoriaClinicaApp from './paginas/HistoriaClinicaApp';

export default function Aplicacion() {
    const [pantalla, establecerPantalla] = useState('acceso');
    const [perfil, establecerPerfil] = useState('alumno');
    const [route, setRoute] = useState('inicio');
    const [openHistoriaId, setOpenHistoriaId] = useState(null);

    useEffect(() => {
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;

        function handler(e) {
            if (e.detail?.id) setRoute(e.detail.id);
        }
        function abrirHistoria(e) {
            if (e.detail?.id) {
                setOpenHistoriaId(e.detail.id);
                setRoute('historia-clinica');
            }
        }
        // expose navigation helper on window for legacy code and simple components
        function navigate(payload) {
            if (!payload) return;
            if (typeof payload === 'string') {
                setRoute(payload);
            } else if (typeof payload === 'object' && payload.id) {
                setRoute(payload.id);
                if (payload.params?.historiaId) setOpenHistoriaId(payload.params.historiaId);
                if (payload.params?.pacienteId) {/* placeholder for future */}
            }
        }
        window.onNavigate = navigate;

        window.addEventListener('hc:navigate', handler);
        window.addEventListener('hc:open', abrirHistoria);
        return () => {
            window.removeEventListener('hc:navigate', handler);
            window.removeEventListener('hc:open', abrirHistoria);
            // clean up global helper
            try { delete window.onNavigate; } catch (e) { window.onNavigate = undefined; }
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

    function handleNavigate(id) {
        setRoute(id);
    }

    return (
        <AppLayout menu={menu} usuario={{ nombre: 'Demo Usuario' }} rol={perfil} onNavigate={handleNavigate}>
            {route === 'inicio' && <DashboardApp rol={perfil} />}
            {route === 'pacientes' && <PacientesApp />}
            {route === 'mis-pacientes' && <PacientesApp />}
            {route === 'historias' && <HistoriasApp rol={perfil} />}
            {route === 'mis-historias' && <HistoriasApp rol={perfil} />}
            {route === 'nueva-historia' && <NuevaHistoriaApp onCreated={(h) => { setOpenHistoriaId(h.id); setRoute('historia-clinica'); }} />}
            {route === 'historia-clinica' && <HistoriaClinicaApp historiaId={openHistoriaId} />}
            {/* placeholders for other routes */}
        </AppLayout>
    );
}
