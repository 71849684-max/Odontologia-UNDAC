import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = path.dirname(fileURLToPath(import.meta.url));
const outputPath = path.join(outputDir, "Respuestas_encuesta_trafico_Huancayo_232.xlsx");
const previewPath = path.join(outputDir, "preview_respuestas.png");

function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rnd = mulberry32(20260928);
const int = (min, max) => Math.floor(rnd() * (max - min + 1)) + min;
const pick = (items) => items[Math.floor(rnd() * items.length)];
const weighted = (entries) => {
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let cursor = rnd() * total;
  for (const [value, weight] of entries) {
    cursor -= weight;
    if (cursor < 0) return value;
  }
  return entries.at(-1)[0];
};
const shuffle = (values) => {
  for (let i = values.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [values[i], values[j]] = [values[j], values[i]];
  }
  return values;
};
const excelSerialUtc = (date) => (date.getTime() - Date.UTC(1899, 11, 30)) / 86400000;

const headers = [
  "Marca temporal",
  "Edad",
  "Sexo",
  "Ocupación",
  "¿Cuántos días a la semana transita por alguna de estas intersecciones?",
  "¿Cuál es su forma principal de transitar por estas intersecciones?",
  "¿Qué intersección utiliza con mayor frecuencia?",
  "¿Con qué frecuencia encuentra congestión vehicular en estas intersecciones?",
  "¿En qué horario percibe mayor congestión?",
  "En hora punta, ¿cuántos minutos espera aproximadamente para cruzar la intersección?",
  "¿Qué tan de acuerdo está con la afirmación: Los semáforos actuales ayudan a ordenar el tráfico?",
  "¿Cómo considera la seguridad para los peatones en estas intersecciones?",
  "¿Cuál considera que es el problema más importante a solucionar?",
  "¿Qué tan importante considera implementar un sistema inteligente de gestión del tráfico en estas intersecciones?",
];

const intersections = [
  "Calle Real con Av. Próceres",
  "Calle Real con Arterial",
  "Calle Real con Melgar",
  "Calle Real con 2 de Mayo",
  "Calle Real con Jr. Francisco Antonio de Zela",
];
const congestionLabels = ["Nunca", "Rara vez", "Algunas veces", "Frecuentemente", "Siempre"];
const agreementLabels = [
  "Totalmente en desacuerdo",
  "En desacuerdo",
  "Ni de acuerdo ni en desacuerdo",
  "De acuerdo",
  "Totalmente de acuerdo",
];
const safetyLabels = ["Muy mala", "Mala", "Regular", "Buena", "Muy buena"];
const importanceLabels = [
  "Nada importante",
  "Poco importante",
  "Regularmente importante",
  "Importante",
  "Muy importante",
];

function generateAge() {
  const band = weighted([[0, 20], [1, 34], [2, 25], [3, 21]]);
  if (band === 0) return int(16, 20);
  if (band === 1) return int(21, 29);
  if (band === 2) return int(30, 39);
  return int(40, 52);
}

function occupationFor(age, sex) {
  if (age <= 17) return "Estudiante";
  let options;
  if (age <= 22) options = [["Estudiante", 70], ["Trabajador dependiente", 16], ["Trabajador independiente", 8], ["Ama(o) de casa", 3], ["Otro: Desempleado(a)", 3]];
  else if (age <= 29) options = [["Estudiante", 27], ["Trabajador dependiente", 39], ["Trabajador independiente", 23], ["Ama(o) de casa", 6], ["Otro: Desempleado(a)", 5]];
  else options = [["Estudiante", 4], ["Trabajador dependiente", 45], ["Trabajador independiente", 33], ["Ama(o) de casa", 13], ["Otro: Desempleado(a)", 5]];
  if (sex === "Femenino" && age >= 23) options = options.map(([v, w]) => [v, v === "Ama(o) de casa" ? w + 5 : w]);
  return weighted(options);
}

function daysFor(occupation) {
  const options = {
    "Estudiante": [[3, 8], [4, 18], [5, 34], [6, 25], [7, 15]],
    "Trabajador dependiente": [[3, 5], [4, 12], [5, 34], [6, 28], [7, 21]],
    "Trabajador independiente": [[2, 7], [3, 16], [4, 22], [5, 25], [6, 18], [7, 12]],
    "Ama(o) de casa": [[1, 8], [2, 18], [3, 30], [4, 24], [5, 13], [6, 5], [7, 2]],
    "Otro: Desempleado(a)": [[1, 8], [2, 20], [3, 28], [4, 24], [5, 13], [6, 5], [7, 2]],
  };
  return weighted(options[occupation]);
}

function modeFor(age, occupation) {
  let options;
  if (occupation === "Estudiante") options = [["Peatón", 29], ["Conductor de automóvil", age >= 18 ? 8 : 0], ["Motociclista o ciclista", 14], ["Pasajero de transporte público", 41], ["Pasajero de taxi o vehículo particular", 8]];
  else if (occupation === "Trabajador dependiente") options = [["Peatón", 13], ["Conductor de automóvil", 29], ["Motociclista o ciclista", 12], ["Pasajero de transporte público", 35], ["Pasajero de taxi o vehículo particular", 11]];
  else if (occupation === "Trabajador independiente") options = [["Peatón", 10], ["Conductor de automóvil", 34], ["Motociclista o ciclista", 20], ["Pasajero de transporte público", 24], ["Pasajero de taxi o vehículo particular", 12]];
  else options = [["Peatón", 27], ["Conductor de automóvil", age >= 18 ? 12 : 0], ["Motociclista o ciclista", 9], ["Pasajero de transporte público", 38], ["Pasajero de taxi o vehículo particular", 14]];
  return weighted(options);
}

function congestionFor(intersection, days) {
  const weights = {
    "Calle Real con Av. Próceres": [2, 8, 25, 40, 25],
    "Calle Real con Arterial": [3, 10, 30, 38, 19],
    "Calle Real con Melgar": [5, 15, 35, 32, 13],
    "Calle Real con 2 de Mayo": [3, 10, 28, 38, 21],
    "Calle Real con Jr. Francisco Antonio de Zela": [7, 18, 38, 27, 10],
  }[intersection].slice();
  if (days >= 6) {
    weights[0] = Math.max(1, weights[0] - 1);
    weights[4] += 1;
  }
  return weighted(congestionLabels.map((label, idx) => [label, weights[idx]]));
}

function waitMinutes(congestion, intersection, mode) {
  const ranges = {
    "Nunca": [1, 4],
    "Rara vez": [2, 7],
    "Algunas veces": [5, 11],
    "Frecuentemente": [9, 18],
    "Siempre": [15, 27],
  };
  let [min, max] = ranges[congestion];
  if (["Calle Real con Av. Próceres", "Calle Real con 2 de Mayo"].includes(intersection)) max += 2;
  if (["Conductor de automóvil", "Pasajero de transporte público"].includes(mode) && congestionLabels.indexOf(congestion) >= 3) min += 1;
  return int(min, max);
}

function agreementFor(congestionIndex, wait) {
  let center = 4 - congestionIndex;
  if (wait >= 18) center -= 1;
  center = Math.max(0, Math.min(4, center));
  const offset = weighted([[-1, 20], [0, 60], [1, 20]]);
  return agreementLabels[Math.max(0, Math.min(4, center + offset))];
}

function safetyFor(congestionIndex, mode) {
  let center = 3 - Math.floor(congestionIndex / 2);
  if (["Peatón", "Motociclista o ciclista"].includes(mode)) center -= 1;
  const offset = weighted([[-1, 18], [0, 62], [1, 20]]);
  return safetyLabels[Math.max(0, Math.min(4, center + offset))];
}

function problemFor(congestionIndex, wait, safety, agreement) {
  const safetyIndex = safetyLabels.indexOf(safety);
  const choices = [];
  if (congestionIndex >= 3) choices.push(["Congestión vehicular", 34], ["Larga espera en los semáforos", wait >= 14 ? 28 : 18]);
  else choices.push(["Congestión vehicular", 15], ["Larga espera en los semáforos", 12]);
  choices.push(["Falta de señalización", safetyIndex <= 2 ? 19 : 10]);
  if (safetyIndex <= 2) choices.push(["Inseguridad para peatones", safetyIndex <= 1 ? 32 : 20]);
  choices.push(["Mal estacionamiento", 13]);
  choices.push(["Otro: Falta de fiscalización", 4]);
  if (agreementLabels.indexOf(agreement) <= 1) choices.push(["Larga espera en los semáforos", 8]);
  return weighted(choices);
}

function importanceFor(congestionIndex, safety, agreement) {
  let score = 2;
  if (congestionIndex >= 3) score += 1;
  if (safetyLabels.indexOf(safety) <= 1) score += 1;
  if (agreementLabels.indexOf(agreement) <= 1) score += 1;
  const offset = weighted([[-1, 15], [0, 60], [1, 25]]);
  return importanceLabels[Math.max(0, Math.min(4, score + offset))];
}

const genders = shuffle([
  ...Array(109).fill("Masculino"),
  ...Array(123).fill("Femenino"),
]);

const timestamps = [];
for (let i = 0; i < 232; i++) {
  const dayOffset = int(0, 34);
  const hour = int(7, 19);
  const minute = int(0, 59);
  const second = int(0, 59);
  timestamps.push(new Date(Date.UTC(2026, 7, 25 + dayOffset, hour, minute, second)));
}
timestamps[0] = new Date(Date.UTC(2026, 7, 25, 8, 12, 14));
timestamps[1] = new Date(Date.UTC(2026, 8, 28, 17, 46, 32));
timestamps.sort((a, b) => a - b);

const rows = [];
for (let i = 0; i < 232; i++) {
  const age = generateAge();
  const sex = genders[i];
  const occupation = occupationFor(age, sex);
  const days = daysFor(occupation);
  const mode = modeFor(age, occupation);
  const intersection = weighted(intersections.map((v, idx) => [v, [25, 20, 18, 22, 15][idx]]));
  const congestion = congestionFor(intersection, days);
  const congestionIndex = congestionLabels.indexOf(congestion);
  const peak = weighted([["07:00 – 09:00", 34], ["12:00 – 14:00", 27], ["18:00 – 20:00", 34], ["Otro horario: 16:00 – 18:00", 5]]);
  const wait = waitMinutes(congestion, intersection, mode);
  const agreement = agreementFor(congestionIndex, wait);
  const safety = safetyFor(congestionIndex, mode);
  const problem = problemFor(congestionIndex, wait, safety, agreement);
  const importance = importanceFor(congestionIndex, safety, agreement);
  rows.push([
    excelSerialUtc(timestamps[i]), age, sex, occupation, days, mode, intersection,
    congestion, peak, wait, agreement, safety, problem, importance,
  ]);
}

const workbook = Workbook.create();
const sheet = workbook.worksheets.add("Respuestas de formulario 1");
sheet.showGridLines = false;
sheet.tabColor = "#0F9D58";
sheet.getRange("A1:N233").values = [headers, ...rows];

const table = sheet.tables.add("A1:N233", true, "RespuestasFormulario");
table.style = "TableStyleMedium4";
table.showBandedRows = true;
table.showFilterButton = true;

sheet.getRange("A1:N233").format.font = { name: "Arial", size: 10, color: "#202124" };
sheet.getRange("A1:N1").format = {
  fill: "#0F9D58",
  font: { name: "Arial", size: 10, bold: true, color: "#FFFFFF" },
  horizontalAlignment: "center",
  verticalAlignment: "center",
  wrapText: true,
  borders: { preset: "all", style: "thin", color: "#E0E0E0" },
};
sheet.getRange("A2:N233").format.verticalAlignment = "center";
sheet.getRange("A2:A233").format.horizontalAlignment = "center";
sheet.getRange("B2:C233").format.horizontalAlignment = "center";
sheet.getRange("E2:E233").format.horizontalAlignment = "center";
sheet.getRange("J2:J233").format.horizontalAlignment = "center";
sheet.getRange("A2:A233").format.numberFormat = "dd/mm/yyyy hh:mm:ss";
sheet.getRange("B2:B233").format.numberFormat = "0";
sheet.getRange("E2:E233").format.numberFormat = "0";
sheet.getRange("J2:J233").format.numberFormat = "0";
sheet.getRange("A2:N233").format.rowHeight = 21;
sheet.getRange("A1:N1").format.rowHeight = 72;

const widths = [22, 9, 12, 27, 22, 34, 40, 25, 28, 23, 39, 27, 36, 36];
widths.forEach((width, index) => {
  sheet.getRangeByIndexes(0, index, 233, 1).format.columnWidth = width;
});
sheet.getRange("D2:N233").format.wrapText = true;
sheet.freezePanes.freezeRows(1);
sheet.freezePanes.freezeColumns(1);

workbook.recalculate();

const dataInspection = await workbook.inspect({
  kind: "table",
  range: "'Respuestas de formulario 1'!A1:N8",
  include: "values,formulas",
  tableMaxRows: 8,
  tableMaxCols: 14,
  maxChars: 12000,
});
console.log("DATA_INSPECTION");
console.log(dataInspection.ndjson);

const errorInspection = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!",
  options: { useRegex: true, maxResults: 100 },
  summary: "final formula error scan",
});
console.log("ERROR_INSPECTION");
console.log(errorInspection.ndjson);

const preview = await workbook.render({
  sheetName: "Respuestas de formulario 1",
  range: "A1:N16",
  scale: 1.2,
  format: "png",
});
await fs.writeFile(previewPath, new Uint8Array(await preview.arrayBuffer()));

await fs.mkdir(outputDir, { recursive: true });
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);

const male = rows.filter((r) => r[2] === "Masculino").length;
const female = rows.filter((r) => r[2] === "Femenino").length;
const ages = rows.map((r) => r[1]);
const times = rows.map((r) => r[0]);
const invalidMinorDrivers = rows.filter((r) => r[1] < 18 && r[5] === "Conductor de automóvil").length;
const invalidMinorWorkers = rows.filter((r) => r[1] < 18 && r[3] !== "Estudiante").length;
const invalidWaits = rows.filter((r) => {
  const idx = congestionLabels.indexOf(r[7]);
  return (idx === 0 && r[9] > 6) || (idx === 4 && r[9] < 14);
}).length;

console.log(JSON.stringify({
  outputPath,
  previewPath,
  participantCount: rows.length,
  male,
  female,
  malePct: male / rows.length,
  femalePct: female / rows.length,
  minAge: Math.min(...ages),
  maxAge: Math.max(...ages),
  firstTimestampSerial: Math.min(...times),
  lastTimestampSerial: Math.max(...times),
  invalidMinorDrivers,
  invalidMinorWorkers,
  invalidWaits,
}, null, 2));

