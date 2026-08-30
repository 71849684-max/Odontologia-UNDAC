import { CircleAlert } from 'lucide-react';

export default function EstadoError({
    titulo = 'No pudimos cargar la información',
    descripcion = 'Intenta nuevamente o comunícate con soporte institucional.',
}) {
    return (
        <div className="estado-visual estado-visual--error" role="alert">
            <CircleAlert size={30} aria-hidden="true" />
            <strong>{titulo}</strong>
            <p>{descripcion}</p>
        </div>
    );
}
