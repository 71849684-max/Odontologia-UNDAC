import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import DashboardApp from '../paginas/DashboardApp.jsx';
import '../../css/app.css';

test('mantiene los mensajes vacíos dentro del área interna de sus paneles', () => {
    render(<DashboardApp rol="administrador" usuario={{ nombre: 'Administrador' }} />);

    for (const message of [
        'No hay actividad clínica registrada.',
        'No hay pendientes registrados.',
        'No hay historias clínicas recientes.',
    ]) {
        const emptyState = screen.getByText(message);
        expect(emptyState).toHaveClass('hc-panel-card__empty');
        expect(getComputedStyle(emptyState).paddingTop).toBe('10px');
        expect(getComputedStyle(emptyState).paddingLeft).toBe('18px');
        expect(getComputedStyle(emptyState).paddingBottom).toBe('18px');
    }
});
