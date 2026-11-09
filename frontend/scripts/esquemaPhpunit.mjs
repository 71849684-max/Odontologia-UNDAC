import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

// Solo genera una copia; la importación se realiza explícitamente en MySQL aislado.
const origen = resolve(import.meta.dirname, '../../bd_clinica_undac.sql');
let sql = readFileSync(origen, 'utf8');
for (const instruccion of ['DROP DATABASE IF EXISTS ', 'CREATE DATABASE ', 'USE ']) {
    sql = sql.replace(`${instruccion}bd_clinica_undac`, `${instruccion}bd_clinica_undac_test`);
}
if (/\bbd_clinica_undac\b/.test(sql)) throw new Error('Quedan referencias al destino de trabajo.');
writeFileSync(process.argv[2], sql);
