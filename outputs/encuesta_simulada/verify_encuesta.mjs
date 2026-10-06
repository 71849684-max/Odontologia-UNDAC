import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SpreadsheetFile } from "@oai/artifact-tool";

const outputDir = path.dirname(fileURLToPath(import.meta.url));
const filePath = path.join(outputDir, "Respuestas_encuesta_trafico_Huancayo_232.xlsx");
const bytes = await fs.readFile(filePath);
const arrayBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
const workbook = await SpreadsheetFile.importXlsx(arrayBuffer);
const sheet = workbook.worksheets.getItem("Respuestas de formulario 1");
const values = sheet.getRange("A1:N233").values;
const rows = values.slice(1);
const males = rows.filter((r) => r[2] === "Masculino").length;
const females = rows.filter((r) => r[2] === "Femenino").length;
const ages = rows.map((r) => Number(r[1]));
const timestamps = rows.map((r) => Number(r[0]));
const blanks = rows.reduce((count, row) => count + row.filter((cell) => cell === "" || cell == null).length, 0);
const daysOutsideRange = rows.filter((r) => Number(r[4]) < 0 || Number(r[4]) > 7).length;
const minorDrivers = rows.filter((r) => Number(r[1]) < 18 && r[5] === "Conductor de automóvil").length;
const minorWorkers = rows.filter((r) => Number(r[1]) < 18 && r[3] !== "Estudiante").length;

const summary = {
  sheetNames: workbook.worksheets.items.map((s) => s.name),
  rows: rows.length,
  columns: values[0].length,
  males,
  females,
  malePct: Number((males / rows.length * 100).toFixed(2)),
  femalePct: Number((females / rows.length * 100).toFixed(2)),
  minAge: Math.min(...ages),
  maxAge: Math.max(...ages),
  minTimestampSerial: Math.min(...timestamps),
  maxTimestampSerial: Math.max(...timestamps),
  blanks,
  daysOutsideRange,
  minorDrivers,
  minorWorkers,
  xlsxBytes: bytes.length,
};

console.log(JSON.stringify(summary, null, 2));
if (
  summary.rows !== 232 || summary.columns !== 14 || males !== 109 || females !== 123 ||
  summary.minAge !== 16 || summary.maxAge !== 52 || blanks !== 0 || daysOutsideRange !== 0 ||
  minorDrivers !== 0 || minorWorkers !== 0
) {
  throw new Error("La validación del archivo exportado no superó todos los controles.");
}

