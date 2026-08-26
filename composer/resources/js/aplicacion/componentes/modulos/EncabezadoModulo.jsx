import { Plus } from 'lucide-react';

export default function EncabezadoModulo({ perfil, modulo }) {
    return (
        <header className="encabezado-modulo">
            <div>
                <p className="rotulo-panel">{perfil} · {modulo.etiqueta}</p>
                <h1>{modulo.titulo}</h1>
                <p>{modulo.descripcion}</p>
            </div>
            <button type="button" className="accion-principal">
                <Plus size={18} />{modulo.accion}
            </button>
        </header>
    );
}
