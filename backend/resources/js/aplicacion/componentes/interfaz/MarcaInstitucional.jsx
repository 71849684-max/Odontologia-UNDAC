import { Cross } from 'lucide-react';

export default function MarcaInstitucional({ compacta = false, inversa = false }) {
    const clases = [
        'marca-institucional',
        compacta ? 'marca-institucional--compacta' : '',
        inversa ? 'marca-institucional--inversa' : '',
    ].filter(Boolean).join(' ');

    return (
        <div className={clases} aria-label="Odontología UNDAC">
            <span className="marca-institucional__sello" aria-hidden="true">
                <Cross size={compacta ? 18 : 23} strokeWidth={2.5} />
            </span>
            <span className="marca-institucional__texto">
                <strong>Odontología</strong>
                <small>Universidad Nacional Daniel Alcides Carrión</small>
            </span>
        </div>
    );
}
