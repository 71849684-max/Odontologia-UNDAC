import { useEffect, useState } from 'react';
import PaginaAcceso from './paginas/PaginaAcceso';
import PaginaPanel from './paginas/PaginaPanel';

export default function Aplicacion() {
    const [pantalla, establecerPantalla] = useState('acceso');
    const [perfil, establecerPerfil] = useState('alumno');

    useEffect(() => {
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
    }, [pantalla]);

    if (pantalla === 'acceso') {
        return (
            <PaginaAcceso
                perfilSeleccionado={perfil}
                alCambiarPerfil={establecerPerfil}
                alIngresar={() => establecerPantalla('panel')}
            />
        );
    }

    return <PaginaPanel perfil={perfil} alCerrarSesion={() => establecerPantalla('acceso')} />;
}
