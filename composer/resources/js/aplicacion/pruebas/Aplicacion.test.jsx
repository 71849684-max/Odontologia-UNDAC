import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Aplicacion from '../Aplicacion';

test('muestra primero la página de acceso institucional', () => {
    render(<Aplicacion />);

    expect(
        screen.getByRole('heading', { name: /historia clínica digital/i }),
    ).toBeInTheDocument();
});

test('ingresa al panel docente y permite cerrar la sesión demostrativa', async () => {
    const usuario = userEvent.setup();
    render(<Aplicacion />);

    await usuario.selectOptions(
        screen.getByLabelText(/perfil de demostración/i),
        'docente',
    );
    await usuario.click(
        screen.getByRole('button', { name: /ingresar al sistema/i }),
    );

    expect(
        screen.getByRole('heading', { name: /supervisión académica y clínica/i }),
    ).toBeInTheDocument();
    expect(
        screen.getByRole('heading', { name: /actividad clínica reciente/i }),
    ).toBeInTheDocument();
    expect(
        screen.getByRole('heading', { name: /acciones rápidas/i }),
    ).toBeInTheDocument();
    expect(
        screen.getByRole('button', { name: /revisar historias pendientes/i }),
    ).toBeInTheDocument();

    await usuario.click(screen.getByRole('button', { name: /cerrar sesión/i }));

    expect(
        screen.getByRole('heading', { name: /historia clínica digital/i }),
    ).toBeInTheDocument();
});
