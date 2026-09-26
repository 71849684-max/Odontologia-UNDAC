import { render, screen } from '@testing-library/react';
import { Pencil } from 'lucide-react';
import { expect, test } from 'vitest';
import '../../../css/app.css';

test('mantiene el icono y el texto del boton mini en una sola fila', () => {
  render(<div className="hc-page"><button type="button" className="hc-mini-button"><Pencil size={14} /> Editar</button></div>);

  const boton = screen.getByRole('button', { name: 'Editar' });
  const estilo = getComputedStyle(boton);

  expect(estilo.display).toBe('inline-flex');
  expect(estilo.alignItems).toBe('center');
  expect(estilo.whiteSpace).toBe('nowrap');
});
