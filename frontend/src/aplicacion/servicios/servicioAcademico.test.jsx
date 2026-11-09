import { beforeEach, expect, test, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { clienteHttp, ErrorHttp } from './clienteHttp.js';
import { sinRedEnPrueba } from './servicioClinico.js';
import * as academico from './servicioAcademico.js';
import CursosApp from '../formularios/cursos/CursosApp.jsx';

vi.mock('./clienteHttp.js', async (original) => ({
    ...await original(),
    clienteHttp: { obtener: vi.fn(), enviar: vi.fn(), actualizar: vi.fn(), parchear: vi.fn() },
}));
vi.mock('./servicioClinico.js', async (original) => ({
    ...await original(),
    sinRedEnPrueba: vi.fn(),
}));

beforeEach(async () => {
    vi.resetAllMocks();
    localStorage.clear();
    clienteHttp.obtener.mockResolvedValue({});
    await academico.sincronizarAcademico();
    clienteHttp.obtener.mockClear();
});

test('ignora los cursos y grupos antiguos del navegador cuando no carga el servidor', async () => {
    localStorage.setItem('undac:academico:frontend:v1', JSON.stringify({
        version: 2, perfil: {}, perfiles: {}, personas: [], cursos: [{ id: 'local' }],
        periodos: [], grupos: [{ id: 'local' }], membresias: [], rotaciones: [], docentesRotacion: [],
    }));
    clienteHttp.obtener.mockRejectedValue(new TypeError('Sin conexión'));
    await expect(academico.sincronizarAcademico()).rejects.toThrow('No se pudo cargar');
    expect(academico.obtenerEstadoAcademico()).toMatchObject({ cursos: [], grupos: [] });
});

test.each([
    ['crearPeriodo', [{ codigo: '2027-I' }], 'enviar'],
    ['crearCurso', [{ codigo: 'CIR' }], 'enviar'],
    ['actualizarCurso', [1, { nombre: 'Cirugía' }], 'actualizar'],
    ['crearGrupo', [{ codigo: 'A' }], 'enviar'],
    ['actualizarGrupo', [1, { nombre: 'Grupo A' }], 'actualizar'],
    ['guardarMembresias', [1, []], 'enviar'],
    ['finalizarMembresia', [1, '2027-07-01'], 'parchear'],
    ['crearRotacion', [{ grupoId: 1 }], 'enviar'],
    ['guardarDocentesRotacion', [1, []], 'enviar'],
    ['guardarAsignacionesExcepcionales', [1, []], 'enviar'],
])('%s rechaza fallos de red sin guardar en el navegador', async (metodo, argumentos, verbo) => {
    clienteHttp.obtener.mockRejectedValue(new TypeError('Sin conexión'));
    await expect(academico.sincronizarAcademico()).rejects.toThrow();
    const anterior = localStorage.getItem('undac:academico:frontend:v1');
    clienteHttp[verbo].mockRejectedValue(new TypeError('Sin conexión'));
    await expect(academico[metodo](...argumentos)).rejects.toThrow('No se pudo confirmar el guardado');
    expect(localStorage.getItem('undac:academico:frontend:v1')).toBe(anterior);
    expect(clienteHttp[verbo]).toHaveBeenCalledTimes(1);
});

test('actualiza el estado desde el servidor después de guardar sin carga inicial', async () => {
    const curso = { id: 12, codigo: 'CIR', nombre: 'Cirugía' };
    clienteHttp.enviar.mockResolvedValue(curso);
    clienteHttp.obtener.mockResolvedValue({ cursos: [curso] });
    await expect(academico.crearCurso(curso)).resolves.toEqual(curso);
    expect(clienteHttp.enviar).toHaveBeenCalledWith('/academico/cursos', curso);
    expect(academico.obtenerEstadoAcademico().cursos).toEqual([curso]);
});

test('conserva el guardado confirmado y avisa si falla la recarga, sin repetir la escritura', async () => {
    const curso = { id: 12, codigo: 'CIR', nombre: 'Cirugía' };
    clienteHttp.enviar.mockResolvedValue(curso);
    clienteHttp.obtener.mockRejectedValue(new TypeError('Sin conexión'));
    await expect(academico.crearCurso(curso)).resolves.toEqual(curso);
    expect(academico.obtenerEstadoAcademico().cursos).toEqual([curso]);
    expect(academico.obtenerEstadoAcademico().aviso).toContain('se guardaron en el servidor');
    expect(clienteHttp.enviar).toHaveBeenCalledTimes(1);
    clienteHttp.obtener.mockResolvedValue({ cursos: [curso] });
    await academico.sincronizarAcademico();
    expect(academico.obtenerEstadoAcademico().aviso).toBe('');
});

test('propaga validaciones del servidor sin recargar ni guardar localmente', async () => {
    const error = new ErrorHttp('Código duplicado', { estado: 422, errores: { codigo: ['Código duplicado'] } });
    clienteHttp.enviar.mockRejectedValue(error);
    await expect(academico.crearCurso({ codigo: 'CIR' })).rejects.toBe(error);
    expect(clienteHttp.obtener).not.toHaveBeenCalled();
    expect(academico.obtenerEstadoAcademico().cursos).toEqual([]);
});

test('impide consultar la red cuando la prueba no autoriza el adaptador', async () => {
    sinRedEnPrueba.mockImplementation(() => { throw new TypeError('Sin red en prueba'); });
    await expect(academico.sincronizarAcademico()).rejects.toThrow('Sin red en prueba');
    await expect(academico.crearCurso({})).rejects.toThrow('Sin red en prueba');
    expect(clienteHttp.obtener).not.toHaveBeenCalled();
    expect(clienteHttp.enviar).not.toHaveBeenCalled();
});

test('mantiene el formulario y permite reintentar después de un error al guardar', async () => {
    const usuario = userEvent.setup();
    render(<CursosApp />);
    await usuario.click(screen.getByRole('button', { name: 'Nuevo curso' }));
    await usuario.type(screen.getByLabelText('Código'), 'CIR');
    await usuario.type(screen.getByLabelText('Nombre'), 'Cirugía');
    clienteHttp.enviar.mockRejectedValueOnce(new TypeError('No se pudo conectar con el servidor'));
    await usuario.click(screen.getByRole('button', { name: 'Guardar curso' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo confirmar el guardado');
    expect(screen.getByLabelText('Código')).toHaveValue('CIR');
    expect(screen.getByLabelText('Nombre')).toHaveValue('Cirugía');
    const curso = { id: 1, codigo: 'CIR', nombre: 'Cirugía', descripcion: '', estado: 'activo' };
    clienteHttp.enviar.mockResolvedValue(curso);
    clienteHttp.obtener.mockResolvedValue({ cursos: [curso] });
    await usuario.click(screen.getByRole('button', { name: 'Guardar curso' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(screen.getByText('CIR')).toBeInTheDocument();
});

test('muestra el fallo de carga y permite recuperar los datos del servidor', async () => {
    clienteHttp.obtener.mockRejectedValue(new TypeError('Sin conexión'));
    render(<CursosApp />);
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo cargar');
    clienteHttp.obtener.mockResolvedValue({ cursos: [] });
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar carga' }));
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
});
