import { useState } from 'react';
import { X } from 'lucide-react';
import { inactivarHistoria, mensajeError } from '../../servicios/servicioClinico.js';

export default function BotonEliminacionClinica({ historiaId, codigo, onInactivada, className = 'hc-mini-button' }) {
    const [abierto, setAbierto] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [error, setError] = useState('');

    async function confirmar(event) {
        event.preventDefault();
        setEnviando(true);
        setError('');
        try {
            await inactivarHistoria(historiaId);
            setAbierto(false);
            onInactivada?.();
        } catch (err) {
            setError(mensajeError(err, 'No se pudo inactivar la historia.'));
        } finally {
            setEnviando(false);
        }
    }

    return <>
        <button type="button" className={className} aria-label={`Eliminación clínica ${codigo}`} onClick={() => { setError(''); setAbierto(true); }}>Eliminación clínica</button>
        {abierto ? <div className="admin-dialogo-fondo" role="presentation" onClick={() => !enviando && setAbierto(false)}>
            <form className="admin-dialogo" role="dialog" aria-modal="true" aria-labelledby="titulo-inactivar-historia" onClick={(event) => event.stopPropagation()} onSubmit={confirmar}>
                <header className="admin-dialogo__cabecera">
                    <h2 id="titulo-inactivar-historia">Eliminación clínica</h2>
                    <button type="button" className="hc-mini-button" aria-label="Cerrar" disabled={enviando} onClick={() => setAbierto(false)}><X size={16} /></button>
                </header>
                <p>La historia {codigo} pasará de activa a inactiva y dejará de mostrarse. El registro se conserva.</p>
                {error ? <p className="hc-form-error" role="alert">{error}</p> : null}
                <footer className="admin-dialogo__acciones">
                    <button type="button" className="hc-button hc-button--ghost" disabled={enviando} onClick={() => setAbierto(false)}>Cancelar</button>
                    <button type="submit" className="hc-button hc-button--primary" disabled={enviando}>{enviando ? 'Inactivando…' : 'Inactivar historia'}</button>
                </footer>
            </form>
        </div> : null}
    </>;
}
