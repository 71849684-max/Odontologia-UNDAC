import { useMemo, useState } from 'react';
import { Search, UserPlus, UsersRound } from 'lucide-react';
import { MOCK_USUARIOS } from '../configuracion/mockUsuarios';
import { StatusBadge } from '../componentes/clinica/ControlesClinicos';
import EstadoVacio from '../componentes/interfaz/EstadoVacio';

const USUARIOS = MOCK_USUARIOS.map((usuario, indice) => ({
    ...usuario,
    documento: ['20210318', '19874562', '10456789'][indice],
    estado: indice === 0 ? 'Activo' : indice === 1 ? 'Activo' : 'Activo',
    ultimoAcceso: ['Hoy, 10:24', 'Hoy, 08:45', 'Ayer, 17:12'][indice],
}));

export default function UsuariosApp() {
    const [busqueda, setBusqueda] = useState('');
    const [rol, setRol] = useState('');
    const filtrados = useMemo(() => USUARIOS.filter((usuario) => {
        const coincideTexto = `${usuario.nombre} ${usuario.documento} ${usuario.rol}`.toLowerCase().includes(busqueda.toLowerCase());
        return coincideTexto && (!rol || usuario.rol.toLowerCase().includes(rol));
    }), [busqueda, rol]);

    const indicadores = [
        ['Usuarios activos', USUARIOS.filter((item) => item.estado === 'Activo').length],
        ['Alumnos', USUARIOS.filter((item) => item.rol.toLowerCase().includes('alumno')).length],
        ['Docentes', USUARIOS.filter((item) => item.rol.toLowerCase().includes('docente')).length],
        ['Administrativos', USUARIOS.filter((item) => item.rol.toLowerCase().includes('admin')).length],
    ];

    return <div className="hc-page space-y-5">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div><p className="hc-kicker">Administración</p><h1 className="hc-page-title">Usuarios</h1><p className="hc-page-subtitle">Gestión visual de estudiantes, docentes y personal administrativo de la clínica.</p></div>
            <button type="button" className="hc-button hc-button--primary"><UserPlus size={17} /> Registrar usuario</button>
        </header>
        <section className="hc-compact-stats" aria-label="Resumen de usuarios">
            {indicadores.map(([etiqueta, valor]) => <article key={etiqueta}><span><UsersRound size={17} /></span><strong>{valor}</strong><small>{etiqueta}</small></article>)}
        </section>
        <div className="hc-filterbar">
            <label className="hc-search"><Search size={17} /><span className="sr-only">Buscar usuario</span><input value={busqueda} onChange={(evento) => setBusqueda(evento.target.value)} placeholder="Buscar por nombre, documento o rol..." /></label>
            <label className="hc-select-filter"><span>Rol</span><select value={rol} onChange={(evento) => setRol(evento.target.value)}><option value="">Todos</option><option value="alumno">Alumnos</option><option value="docente">Docentes</option><option value="admin">Administradores</option></select></label>
        </div>
        {filtrados.length ? <div className="hc-table-card"><table className="hc-table"><thead><tr><th>Usuario</th><th>Documento / código</th><th>Rol</th><th>Estado</th><th>Último acceso</th><th>Acciones</th></tr></thead><tbody>{filtrados.map((item) => <tr key={item.id}><td data-label="Usuario"><div className="hc-person"><span className="hc-avatar">{item.nombre.split(' ').slice(0, 2).map((parte) => parte[0]).join('')}</span><span><strong>{item.nombre}</strong><small>Cuenta institucional</small></span></div></td><td data-label="Documento / código">{item.documento}</td><td data-label="Rol">{item.rol}</td><td data-label="Estado"><StatusBadge status={item.estado} /></td><td data-label="Último acceso">{item.ultimoAcceso}</td><td data-label="Acciones"><button type="button" className="hc-mini-button">Administrar</button></td></tr>)}</tbody></table></div> : <EstadoVacio titulo="No se encontraron usuarios" descripcion="Prueba con otros términos o elimina el filtro de rol." />}
    </div>;
}
