import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PaginaPanel from '../paginas/PaginaPanel';

test.each([
    ['administrador', 'Usuarios y roles', 'Gestión de usuarios y roles', 'Registrar usuario', 'Usuarios institucionales'],
    ['administrador', 'Historias clínicas', 'Gestión de historias clínicas', 'Nueva historia clínica', 'Historias registradas'],
    ['administrador', 'Pacientes', 'Directorio general de pacientes', 'Registrar paciente', 'Directorio de pacientes'],
    ['administrador', 'Auditoría', 'Registro de auditoría', 'Exportar reporte', 'Actividad registrada'],
    ['administrador', 'Configuración', 'Configuración institucional', 'Guardar configuración', 'Identidad institucional'],
    ['docente', 'Alumnos asignados', 'Alumnos asignados', 'Ver distribución', 'Progreso del grupo'],
    ['docente', 'Historias supervisadas', 'Historias clínicas supervisadas', 'Revisar siguiente', 'Bandeja de supervisión'],
    ['docente', 'Validaciones', 'Cola de validaciones clínicas', 'Iniciar revisión', 'Solicitudes pendientes'],
    ['docente', 'Seguimientos', 'Agenda de seguimientos', 'Programar seguimiento', 'Próximos seguimientos'],
    ['docente', 'Auditoría académica', 'Auditoría académica', 'Generar informe', 'Actividad registrada'],
    ['alumno', 'Mis historias clínicas', 'Mis historias clínicas', 'Nueva historia clínica', 'Avance de historias'],
    ['alumno', 'Pacientes', 'Mis pacientes asignados', 'Registrar paciente', 'Pacientes asignados'],
    ['alumno', 'Seguimientos', 'Mis seguimientos clínicos', 'Registrar control', 'Próximos seguimientos'],
    ['alumno', 'Recursos clínicos', 'Biblioteca de recursos clínicos', 'Explorar biblioteca', 'Recursos destacados'],
])('abre una vista propia del perfil %s: %s', async (perfil, opcion, titulo, accion, contenido) => {
    const usuario = userEvent.setup();
    render(<PaginaPanel perfil={perfil} alCerrarSesion={() => {}} />);

    await usuario.click(screen.getByRole('button', { name: opcion }));

    expect(screen.getByRole('heading', { name: titulo })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: accion })).toBeInTheDocument();
    expect(screen.getByText(contenido)).toBeInTheDocument();
});

test('restablece el resumen cuando cambia el perfil', async () => {
    const usuario = userEvent.setup();
    const { rerender } = render(
        <PaginaPanel perfil="administrador" alCerrarSesion={() => {}} />,
    );

    await usuario.click(screen.getByRole('button', { name: 'Auditoría' }));
    expect(
        screen.getByRole('heading', { name: 'Registro de auditoría' }),
    ).toBeInTheDocument();

    rerender(<PaginaPanel perfil="docente" alCerrarSesion={() => {}} />);

    expect(
        screen.getByRole('heading', { name: 'Supervisión académica y clínica' }),
    ).toBeInTheDocument();
});
