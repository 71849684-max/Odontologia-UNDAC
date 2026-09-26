import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';
import Paginacion from './Paginacion.jsx';
import '../../../css/app.css';

describe('Paginacion', () => {
  test('cambia de página y permite modificar la cantidad visible', async () => {
    const usuario = userEvent.setup();
    const elementos = Array.from({ length: 12 }, (_, indice) => `Registro ${indice + 1}`);
    render(<Paginacion elementos={elementos} tamanos={[5, 10]} inicial={5} etiqueta="registros">
      {(pagina) => <ul>{pagina.map((item) => <li key={item}>{item}</li>)}</ul>}
    </Paginacion>);

    expect(screen.getByText('Registro 1')).toBeInTheDocument();
    expect(screen.queryByText('Registro 6')).not.toBeInTheDocument();
    await usuario.click(screen.getByRole('button', { name: 'Siguiente' }));
    expect(screen.getByText('Registro 6')).toBeInTheDocument();

    await usuario.selectOptions(screen.getByLabelText('Registros por página'), '10');
    expect(screen.getByText('Registro 10')).toBeInTheDocument();
    expect(screen.getByText('Mostrando 1–10 de 12 registros')).toBeInTheDocument();
  });

  test('separa el texto de resumen del borde sin mover los controles', () => {
    render(<Paginacion elementos={['Grupo único']} etiqueta="grupos">
      {(pagina) => <div>{pagina[0]}</div>}
    </Paginacion>);

    const resumen = screen.getByText('Mostrando 1–1 de 1 grupos');
    expect(resumen).toHaveClass('hc-pagination__summary');
    expect(getComputedStyle(resumen).marginLeft).toBe('4px');
  });
});
