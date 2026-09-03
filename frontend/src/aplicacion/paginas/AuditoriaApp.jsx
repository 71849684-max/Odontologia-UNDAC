import { useMemo, useState } from 'react';
import { Download, Search } from 'lucide-react';
import { StatusBadge } from '../componentes/clinica/ControlesClinicos';
import EstadoVacio from '../componentes/interfaz/EstadoVacio';

const EVENTOS = [
    { id: 1, fecha: '03 sep. 2026 · 10:24', usuario: 'María Quispe', rol: 'Alumno', accion: 'EDITAR', modulo: 'Historia clínica', registro: 'HC-2026-001', ip: '192.168.10.24' },
    { id: 2, fecha: '03 sep. 2026 · 09:58', usuario: 'Dra. Elena Salazar', rol: 'Docente', accion: 'VALIDAR', modulo: 'Diagnóstico', registro: 'HC-2026-003', ip: '192.168.10.18' },
    { id: 3, fecha: '03 sep. 2026 · 09:31', usuario: 'Carlos Mendoza', rol: 'Administrador', accion: 'CREAR', modulo: 'Usuarios', registro: 'USR-0087', ip: '192.168.10.05' },
    { id: 4, fecha: '03 sep. 2026 · 08:45', usuario: 'José Paredes', rol: 'Alumno', accion: 'FIRMAR', modulo: 'Consentimiento', registro: 'HC-2026-002', ip: '192.168.10.31' },
    { id: 5, fecha: '02 sep. 2026 · 17:12', usuario: 'Carlos Mendoza', rol: 'Administrador', accion: 'INICIAR SESIÓN', modulo: 'Seguridad', registro: 'SES-1842', ip: '192.168.10.05' },
];

export default function AuditoriaApp() {
    const [busqueda, setBusqueda] = useState('');
    const [accion, setAccion] = useState('');
    const filtrados = useMemo(() => EVENTOS.filter((evento) => (!accion || evento.accion === accion) && `${evento.usuario} ${evento.modulo} ${evento.registro}`.toLowerCase().includes(busqueda.toLowerCase())), [busqueda, accion]);

    return <div className="hc-page space-y-5">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><p className="hc-kicker">Trazabilidad</p><h1 className="hc-page-title">Auditoría del sistema</h1><p className="hc-page-subtitle">Bitácora demostrativa de accesos y operaciones sensibles realizadas en la plataforma.</p></div><button type="button" className="hc-button hc-button--ghost"><Download size={17} /> Exportar reporte</button></header>
        <div className="hc-filterbar"><label className="hc-search"><Search size={17} /><span className="sr-only">Buscar evento</span><input value={busqueda} onChange={(evento) => setBusqueda(evento.target.value)} placeholder="Buscar usuario, módulo o registro..." /></label><label className="hc-select-filter"><span>Acción</span><select value={accion} onChange={(evento) => setAccion(evento.target.value)}><option value="">Todas</option>{[...new Set(EVENTOS.map((evento) => evento.accion))].map((item) => <option key={item}>{item}</option>)}</select></label></div>
        {filtrados.length ? <div className="hc-table-card"><table className="hc-table"><thead><tr><th>Fecha y hora</th><th>Usuario</th><th>Rol</th><th>Acción</th><th>Módulo</th><th>Registro</th><th>IP</th></tr></thead><tbody>{filtrados.map((evento) => <tr key={evento.id}><td data-label="Fecha y hora">{evento.fecha}</td><td data-label="Usuario"><strong>{evento.usuario}</strong></td><td data-label="Rol">{evento.rol}</td><td data-label="Acción"><StatusBadge status={evento.accion} /></td><td data-label="Módulo">{evento.modulo}</td><td data-label="Registro">{evento.registro}</td><td data-label="IP">{evento.ip}</td></tr>)}</tbody></table></div> : <EstadoVacio titulo="No hay eventos para mostrar" descripcion="Ajusta los filtros para consultar otros movimientos." />}
    </div>;
}
