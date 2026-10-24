import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { UserRound, X } from 'lucide-react';
import { obtenerUsuario } from '../../servicios/servicioAdministracion.js';
import { ErrorHttp } from '../../servicios/clienteHttp.js';
import { formatearFechaHora } from '../../utilidades/fechas.mjs';
import { etiquetaCodigoRol, etiquetaRol } from '../../configuracion/etiquetasRoles.js';

function fecha(iso) {
    if (!iso) return 'Sin registros';
    return formatearFechaHora(iso) || iso;
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

    useEffect(() => {
        const onKey = (evento) => { if (evento.key === 'Escape') onClose?.(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    const titulo = usuario?.nombre || 'Perfil del usuario';
    const filas = usuario ? [
        ['Usuario', usuario.nombre_usuario],
        ['Documento', [usuario.tipo_documento, usuario.numero_documento].filter(Boolean).join(' ') || '—'],
        ['Correo', usuario.correo || '—'],
        ['Teléfono', usuario.telefono || '—'],
        ['Rol', etiquetaCodigoRol(usuario.codigo_rol, etiquetaRol(usuario.rol, usuario.rol || 'Sin rol'))],
        ['Estado', usuario.bloqueado ? 'Bloqueado' : usuario.estado ? 'Activo' : 'Inactivo'],
        ['Último acceso', fecha(usuario.ultimo_inicio_sesion)],
    ] : [];

    return createPortal(
        <div className="admin-dialogo-fondo" role="presentation" onClick={onClose}>
            <section
                className="admin-dialogo permisos-ficha permisos-ficha--modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="ficha-usuario-titulo"
                onClick={(evento) => evento.stopPropagation()}
            >
                <header className="permisos-ficha__cabecera">
                    <span className="usuario-avatar"><UserRound size={18} /></span>
                    <h3 id="ficha-usuario-titulo">{titulo}</h3>
                    <button type="button" className="hc-mini-button" aria-label="Cerrar perfil" onClick={onClose}><X size={16} /></button>
                </header>
                {error && <p className="hc-form-error" role="alert">{error}</p>}
                {!usuario && !error && <p role="status">Cargando perfil…</p>}
                {usuario && (
                    <dl className="permisos-ficha__datos">
                        {filas.map(([etiqueta, valor]) => (
                            <div key={etiqueta}>
                                <dt>{etiqueta}</dt>
                                <dd>{valor}</dd>
                            </div>
                        ))}
                    </dl>
                )}
                {usuario && onManage ? (
                    <footer>
                        <button type="button" className="btn-principal permisos-ficha__accion" onClick={onManage}>
                            Gestionar en Usuarios
                        </button>
                    </footer>
                ) : null}
            </section>
        </div>,
        document.body,
    );
}
