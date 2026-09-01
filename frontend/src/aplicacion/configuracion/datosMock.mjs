export const mockUsuarios = [
  { id: 1, nombre: 'María Fernández', rol: 'Alumno', iniciales: 'MF' },
  { id: 2, nombre: 'Dr. Carlos Rojas', rol: 'Docente', iniciales: 'CR' },
];

export const mockPacientes = [
  { id: 1, hc: 'HC-2026-001', dni: '70000001', nombres: 'Andrea Salazar Huamán', edad: 23, sexo: 'F', telefono: '900 000 001', estado: 'En proceso', progreso: 62 },
  { id: 2, hc: 'HC-2026-002', dni: '70000002', nombres: 'Luis Paredes Rojas', edad: 31, sexo: 'M', telefono: '900 000 002', estado: 'Pendiente de revisión', progreso: 86 },
  { id: 3, hc: 'HC-2026-003', dni: '70000003', nombres: 'Camila Torres Vega', edad: 19, sexo: 'F', telefono: '900 000 003', estado: 'Borrador', progreso: 28 },
  { id: 4, hc: 'HC-2026-004', dni: '70000004', nombres: 'José Quispe Mendoza', edad: 42, sexo: 'M', telefono: '900 000 004', estado: 'Validada', progreso: 100 },
];

export const mockHistorias = mockPacientes.map((patient, index) => ({
  id: patient.id,
  codigo: patient.hc,
  paciente: patient.nombres,
  dni: patient.dni,
  operador: index % 2 === 0 ? 'María Fernández' : 'Diego Ramos',
  docente: 'Dr. Carlos Rojas',
  fecha: `2026-08-${String(20 + index).padStart(2, '0')}`,
  estado: patient.estado,
  progreso: patient.progreso,
}));

export const mockHistoriaMeta = {
  codigo: 'HC-2026-001',
  estado: 'En proceso',
  progreso: 62,
  operador: 'María Fernández',
  semestre: 'VIII',
  anioAcademico: '2026',
  fecha: '2026-09-01',
  docente: 'Dr. Carlos Rojas',
  cop: '00000',
};
