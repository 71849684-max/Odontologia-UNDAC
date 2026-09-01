import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { clinicalSections, dashboardServices, healthQuestions, consentParagraphs, intraoralTissues, labFields } from '../configuracion/historiaClinica.config.mjs';
import { permanentTeeth, toothSurfaces, odontogramStates, createEmptyOdontogram, applyOdontogramMark } from '../configuracion/odontograma.config.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = path.resolve(__dirname, '../..');
const app = path.join(src, 'aplicacion');
const css = path.join(src, 'css', 'aplicacion');
const read = (relative) => fs.readFileSync(path.join(src, relative), 'utf8');

const expectedSections = [
  'datos-paciente','anamnesis','cuestionario-salud','antecedentes','examen-clinico',
  'examen-extraoral','examen-intraoral','odontograma','oclusion','examenes-auxiliares',
  'diagnostico','modelos','plan-tratamiento','consentimiento','cirugia','reporte-operatorio','seguimiento'
];

test('la historia clinica conserva las 17 secciones institucionales', () => {
  assert.equal(clinicalSections.length, 17);
  assert.deepEqual(clinicalSections.map((s) => s.id), expectedSections);
});

test('el cuestionario de salud mantiene 24 preguntas institucionales', () => {
  assert.equal(healthQuestions.length, 24);
  assert.deepEqual(healthQuestions.map((q) => q.number), Array.from({ length: 24 }, (_, i) => i + 1));
  assert.match(healthQuestions[0].text, /m[eé]dico/i);
  assert.match(healthQuestions[23].text, /dificultad para respirar/i);
});

test('se conservan bloques institucionales de consentimiento, tejidos y laboratorio', () => {
  assert.equal(consentParagraphs.length, 9);
  assert.deepEqual(intraoralTissues, ['Vestíbulo','Paladar blando','Úvula','Lengua','Frenillos','Encías','Paladar duro','Orofaringe','Piso de boca','Carrillos']);
  assert.equal(labFields.length, 8);
});

test('el dashboard ofrece accesos KPI a los servicios clinicos', () => {
  assert.equal(dashboardServices.length, 9);
  assert.ok(dashboardServices.some((s) => s.target.section === 'odontograma'));
  assert.ok(dashboardServices.some((s) => s.target.section === 'examenes-auxiliares'));
  assert.ok(dashboardServices.some((s) => s.target.section === 'seguimiento'));
});

test('el odontograma usa denticion permanente FDI de 32 piezas y cinco superficies', () => {
  assert.equal(permanentTeeth.length, 32);
  assert.equal(new Set(permanentTeeth.map((t) => t.number)).size, 32);
  assert.equal(toothSurfaces.length, 5);
  assert.deepEqual(toothSurfaces.map((s) => s.id), ['vestibular','lingual','mesial','distal','oclusal']);
});

test('los estados del odontograma tienen etiqueta y simbolo ademas del color', () => {
  assert.ok(odontogramStates.length >= 8);
  for (const state of odontogramStates) {
    assert.ok(state.label);
    assert.ok(state.symbol);
    assert.ok(state.className);
  }
});

test('registrar un hallazgo cambia solo la superficie elegida', () => {
  const original = createEmptyOdontogram();
  const next = applyOdontogramMark(original, '11', 'vestibular', 'caries', 'Hallazgo de prueba');
  assert.equal(original['11'].surfaces.vestibular.state, 'sin-registro');
  assert.equal(next['11'].surfaces.vestibular.state, 'caries');
  assert.equal(next['11'].surfaces.vestibular.note, 'Hallazgo de prueba');
  assert.equal(next['11'].surfaces.mesial.state, 'sin-registro');
});

test('existen las cinco paginas que consume Aplicacion.jsx', () => {
  for (const name of ['DashboardApp.jsx','PacientesApp.jsx','HistoriasApp.jsx','NuevaHistoriaApp.jsx','HistoriaClinicaApp.jsx']) {
    assert.ok(fs.existsSync(path.join(app, 'paginas', name)), `falta ${name}`);
  }
});

test('la historia clinica integrada expone las 17 secciones y campos criticos del Word', () => {
  const file = path.join(app, 'componentes', 'clinica', 'SeccionesClinicas.jsx');
  assert.ok(fs.existsSync(file), 'falta componentes/clinica/SeccionesClinicas.jsx');
  const source = fs.readFileSync(file, 'utf8') + JSON.stringify(labFields);
  for (const label of [
    'Tiempo de residencia en Cerro de Pasco','Motivo de consulta','Ectoscopía','Hábitos nocivos',
    'Signos vitales','Forma del cráneo','Ángulo nasolabial','Tejidos blandos','Oclusión',
    'Hemoglobina','Informe RX panorámico','DX. clínico radiográfico','Informe del maxilar',
    'Plan de tratamiento integral','Intervención quirúrgica autorizada','Control de signos',
    'Ficha de seguimiento de los procedimientos'
  ]) assert.ok(source.includes(label), `falta campo/bloque: ${label}`);
});

test('Aplicacion permite navegar desde KPI a una seccion clinica especifica', () => {
  const source = read('aplicacion/Aplicacion.jsx');
  assert.match(source, /seccionInicial/);
  assert.match(source, /setOpenSection|establecerSeccionAbierta/);
  assert.match(source, /HistoriaClinicaApp/);
});

test('el CSS clinico existe, es responsive y contiene estilos semanticos', () => {
  const file = path.join(css, 'historia-clinica.css');
  assert.ok(fs.existsSync(file));
  const source = fs.readFileSync(file, 'utf8') + JSON.stringify(labFields);
  for (const token of ['.hc-dashboard-kpis','.hc-clinical-shell','.hc-section-nav','.hc-odontogram','.hc-clinical-card','@media (max-width: 768px)']) {
    assert.ok(source.includes(token), `falta estilo ${token}`);
  }
});

test('no se introducen llamadas backend en el frontend clinico', () => {
  const roots = [path.join(app, 'componentes', 'clinica'), path.join(app, 'paginas')];
  for (const root of roots) {
    if (!fs.existsSync(root)) continue;
    for (const file of fs.readdirSync(root, { recursive: true })) {
      const full = path.join(root, file);
      if (!fs.statSync(full).isFile() || !/\.(jsx|js|mjs)$/.test(full)) continue;
      const source = fs.readFileSync(full, 'utf8');
      assert.doesNotMatch(source, /\bfetch\s*\(|\baxios\b|\/api\//, `backend detectado en ${full}`);
    }
  }
});
