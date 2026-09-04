import { render, screen, waitFor } from '@testing-library/react';
import Aplicacion from '../../Aplicacion';
import { ProveedorSesion } from '../../autenticacion/ContextoSesion';

export const SESIONES = {
    administrador: {
        usuario: { id: 1, nombre_usuario: 'admin', nombre: 'Carlos Mendoza' },
        roles: ['ADMINISTRADOR'],
        es_administrador: true,
    },
    docente: {
        usuario: { id: 2, nombre_usuario: 'esalazar', nombre: 'Dra. Elena Salazar' },
        roles: ['DOCENTE'],
        es_administrador: false,
    },
    alumno: {
        usuario: { id: 3, nombre_usuario: 'mquispe', nombre: 'María Quispe' },
        roles: ['ALUMNO_OPERADOR'],
        es_administrador: false,
    },
};

/**
 * Monta la aplicacion y espera a que termine la rehidratacion de sesion.
 */
export async function renderizarAplicacion() {
    const resultado = render(
        <ProveedorSesion>
            <Aplicacion />
        </ProveedorSesion>,
    );

    await waitFor(() => {
        expect(screen.queryByText(/verificando tu sesión/i)).not.toBeInTheDocument();
    });

    return resultado;
}

/**
 * Completa el formulario de acceso y espera a que aparezca el panel o el error.
 */
export async function ingresar(usuario, { nombreUsuario = 'admin', contrasena = 'clave-de-prueba' } = {}) {
    await usuario.type(screen.getByLabelText(/^usuario$/i), nombreUsuario);
    await usuario.type(screen.getByLabelText(/^contraseña$/i), contrasena);
    await usuario.click(screen.getByRole('button', { name: /ingresar al sistema/i }));
}
