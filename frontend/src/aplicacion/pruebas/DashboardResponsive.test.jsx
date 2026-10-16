import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import DashboardApp from '../paginas/DashboardApp.jsx';
import '../../css/app.css';

test('mantiene el mensaje vacío de historias recientes dentro del área interna del panel', () => {
    render(<DashboardApp rol="administrador" usuario={{ nombre: 'Administrador' }} />);

    const emptyState = screen.getByText('No hay historias clínicas recientes.');
    expect(emptyState).toHaveClass('hc-panel-card__empty');
    expect(getComputedStyle(emptyState).paddingTop).toBe('10px');
    expect(getComputedStyle(emptyState).paddingLeft).toBe('18px');
    expect(getComputedStyle(emptyState).paddingBottom).toBe('18px');
});
