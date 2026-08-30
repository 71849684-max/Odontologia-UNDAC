import { FolderSearch } from 'lucide-react';

export default function EstadoVacio({
    titulo = 'Aún no hay información',
    descripcion = 'Cuando se registren datos, aparecerán organizados en este espacio.',
}) {
    return (
        <section className="estado-visual" aria-label={titulo}>
            <FolderSearch size={30} aria-hidden="true" />
            <strong>{titulo}</strong>
            <p>{descripcion}</p>
        </section>
    );
}
