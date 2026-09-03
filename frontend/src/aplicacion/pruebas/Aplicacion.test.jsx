import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Aplicacion from '../Aplicacion';

async function ingresarComo(usuario, correo) {
    await usuario.type(screen.getByLabelText(/correo institucional/i), correo);
    await usuario.click(screen.getByRole('button', { name: /ingresar al sistema/i }));
}

test('muestra primero el acceso sin selector manual de perfil', () => {
    render(<Aplicacion />);
    expect(screen.getByRole('heading', { name: /historia clínica digital/i })).toBeInTheDocument();
    expect(screen.queryByLabelText(/perfil de demostración/i)).not.toBeInTheDocument();
    expect(screen.getByText(/perfil automático/i)).toBeInTheDocument();
});

test('detecta el perfil docente y permite cerrar sesión', async () => {
    const usuario = userEvent.setup();
    render(<Aplicacion />);
    await ingresarComo(usuario, 'docente@undac.edu.pe');

    expect(screen.getByRole('heading', { name: /elena/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /actividad reciente/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ver pendientes/i })).toBeInTheDocument();

    await usuario.click(screen.getByRole('button', { name: /cerrar sesión/i }));
    expect(screen.getByRole('heading', { name: /historia clínica digital/i })).toBeInTheDocument();
});

test('el sidebar despliega grupos y todas las vistas administrativas muestran contenido', async () => {
    const usuario = userEvent.setup();
    render(<Aplicacion />);
    await ingresarComo(usuario, 'administrador@undac.edu.pe');

    const gestion = screen.getByRole('button', { name: 'Gestión clínica' });
    expect(gestion).toHaveAttribute('aria-expanded', 'false');
    await usuario.click(gestion);
    expect(gestion).toHaveAttribute('aria-expanded', 'true');
    await usuario.click(screen.getByRole('button', { name: 'Pacientes' }));
    expect(screen.getByRole('heading', { name: 'Pacientes' })).toBeInTheDocument();

    await usuario.click(screen.getByRole('button', { name: 'Administración' }));
    await usuario.click(screen.getByRole('button', { name: 'Usuarios' }));
    expect(screen.getByRole('heading', { name: 'Usuarios' })).toBeInTheDocument();
    await usuario.click(screen.getByRole('button', { name: 'Permisos por usuario' }));
    expect(screen.getByRole('heading', { name: 'Permisos por usuario' })).toBeInTheDocument();
    await usuario.click(screen.getByRole('button', { name: 'Auditoría' }));
    expect(screen.getByRole('heading', { name: 'Auditoría del sistema' })).toBeInTheDocument();

    await usuario.click(screen.getByRole('button', { name: 'Sistema' }));
    await usuario.click(screen.getByRole('button', { name: 'Configuración' }));
    expect(screen.getByRole('heading', { name: 'Configuración' })).toBeInTheDocument();
});
