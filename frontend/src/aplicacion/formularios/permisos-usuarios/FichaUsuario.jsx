import { useEffect, useState } from 'react';
import { UserRound, X } from 'lucide-react';
import { obtenerUsuario } from '../../servicios/servicioAdministracion.js';
import { ErrorHttp } from '../../servicios/clienteHttp.js';

function fecha(iso) {
    if (!iso) return 'Sin registros';
    try {
        return new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
    } catch {
        return iso;
    }
}

export default function FichaUsuario({ id, onClose, onManage }) {
    const [usuario, setUsuario] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        let vigente = true;
        setUsuario(null);
        setError('');
        obtenerUsuario(id)
            .then((respuesta) => { if (vigente) setUsuario(respuesta?.data ?? respuesta); })
            .catch((err) => { if (vigente) setError(err instanceof ErrorHttp ? err.message : 'No se pudo cargar el perfil.'); });
        return () => { vigente = false; };
    }, [id]);

    const filas = usuario ? [
        ['Usuario', usuario.nombre_usuario],
        ['Documento', [usuario.tipo_documento, usuario.numero_documento].filter(Boolean).join(' ') || '—'],
        ['Correo', usuario.correo || '—'],
        ['Teléfono', usuario.telefono || '—'],
        ['Rol', usuario.rol || usuario.codigo_rol || 'Sin rol'],
        ['Estado', usuario.bloqueado ? 'Bloqueado' : usuario.estado ? 'Activo' : 'Inactivo'],
        ['Último acceso', fecha(usuario.ultimo_inicio_sesion)],
    ] : [];

    return <section className="permisos-card permisos-ficha" aria-labelledby="ficha-usuario-titulo">
        <header className="permisos-ficha__cabecera">
            <span className="usuario-avatar"><UserRound size={18} /></span>
            <h3 id="ficha-usuario-titulo">{usuario ? `Perfil de ${usuario.nombre}` : 'Perfil del usuario'}</h3>
            <button type="button" className="hc-mini-button" aria-label="Cerrar perfil" onClick={onClose}><X size={16} /></button>
        </header>
        {error && <p role="alert">{error}</p>}
        {!usuario && !error && <p role="status">Cargando perfil…</p>}
        {usuario && <dl className="permisos-ficha__datos">
            {filas.map(([etiqueta, valor]) => <div key={etiqueta}><dt>{etiqueta}</dt><dd>{valor}</dd></div>)}
        </dl>}
        {usuario && onManage && <footer><button type="button" className="btn-secundario" onClick={onManage}>Gestionar en Usuarios</button></footer>}
    </section>;
}
