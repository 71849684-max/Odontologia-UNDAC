import React from 'react';
import { afterEach, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import PacienteForm from './PacienteForm.jsx';

afterEach(cleanup);
test('crear historia también valida correo y teléfono antes de enviar', () => {
    const guardar = vi.fn();
    render(<PacienteForm onSave={guardar} />);
    fireEvent.change(screen.getByLabelText('Nombres'), { target: { value: 'Ana' } });
    fireEvent.change(screen.getByLabelText('Apellido paterno'), { target: { value: 'Rojas' } });
    fireEvent.change(screen.getByLabelText('Número documento'), { target: { value: '12345678' } });
    fireEvent.change(screen.getByLabelText('Correo'), { target: { value: 'sin-correo' } });
    fireEvent.click(screen.getByRole('button', { name: 'Crear historia clínica' }));
    expect(guardar).not.toHaveBeenCalled();
    expect(screen.getByText('Ingrese un correo electrónico válido.')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Correo'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Teléfono'), { target: { value: '987654321' } });
    fireEvent.click(screen.getByRole('button', { name: 'Crear historia clínica' }));
    expect(guardar).toHaveBeenCalledWith(expect.objectContaining({ dni: '12345678' }), { crearHistoria: true });
});
