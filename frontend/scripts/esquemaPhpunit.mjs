import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

// Solo genera una copia; la importación se realiza explícitamente en MySQL aislado.
const resultado = spawnSync('php', [resolve(import.meta.dirname, '../../backend/scripts/esquemaPruebas.php'), resolve(process.argv[2])], { stdio: 'inherit' });
process.exit(resultado.status ?? 1);
