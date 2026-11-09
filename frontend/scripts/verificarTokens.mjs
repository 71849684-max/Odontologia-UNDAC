import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve, relative } from 'node:path';
import postcss from 'postcss';

const raiz = resolve(import.meta.dirname, '..');
const origen = resolve(raiz, 'src');
const patron = /#[\da-f]{3,8}\b|rgba?\([^)]*\)|hsla?\([^)]*\)|(?<![\w-])(?:white|black|red|blue)(?![\w-])/gi;
const hallazgos = [];
for (const nombre of readdirSync(origen, { recursive: true }).filter(nombre => /\.(css|jsx|mjs|js)$/.test(nombre) && !/\.test\./.test(nombre))) {
    const archivo = relative(raiz, resolve(origen, nombre)).replaceAll('\\', '/');
    if (archivo.endsWith('/variables.css')) continue;
    const texto = readFileSync(resolve(origen, nombre), 'utf8');
    if (nombre.endsWith('.css')) {
        postcss.parse(texto).walkDecls(declaracion => {
            const selector = declaracion.parent.selector ?? declaracion.parent.name ?? '';
            if (declaracion.prop === 'z-index' && !/^var\(--ou-z-[\w-]+\)$/.test(declaracion.value)) {
                hallazgos.push({ archivo, selector, propiedad: declaracion.prop, valor: declaracion.value, tipo: 'capa', linea: declaracion.source.start.line });
            }
            for (const coincidencia of declaracion.value.matchAll(patron)) {
                hallazgos.push({ archivo, selector, propiedad: declaracion.prop, valor: coincidencia[0], tipo: 'color', linea: declaracion.source.start.line });
            }
        });
    } else {
        for (const coincidencia of texto.matchAll(/['"](#[\da-f]{3,8}|rgba?\([^)'"\n]*\))['"]/gi)) {
            hallazgos.push({ archivo, selector: 'Código o SVG', propiedad: 'color', valor: coincidencia[1], tipo: 'color', linea: texto.slice(0, coincidencia.index).split('\n').length });
        }
    }
}
const rutaDeuda = resolve(raiz, '../docs/deuda-tokens-visuales.json');
const agrupar = datos => {
    const resultado = {};
    for (const dato of datos) {
        const clave = JSON.stringify([dato.archivo, dato.selector, dato.propiedad, dato.valor, dato.tipo]);
        resultado[clave] = (resultado[clave] ?? 0) + 1;
    }
    return resultado;
};
if (process.argv.includes('--registrar-inventario')) {
    writeFileSync(rutaDeuda, JSON.stringify(agrupar(hallazgos), null, 2) + '\n');
    writeFileSync(resolve(raiz, '../docs/INVENTARIO_TOKENS_VISUALES.md'), `# Inventario de tokens visuales\n\nLa deuda siguiente queda registrada por selector y valor. La comprobación falla si aumenta; los valores clínicos requieren revisión clínica antes de modificarse. Las definiciones de paleta se concentran en variables.css.\n\n| Archivo:línea | Selector | Propiedad | Valor | Tipo |\n| --- | --- | --- | --- | --- |\n${hallazgos.map(dato => `| ${dato.archivo}:${dato.linea} | ${dato.selector.replaceAll('|', '\\|')} | ${dato.propiedad} | ${dato.valor} | ${dato.tipo} |`).join('\n')}\n`);
}
const deuda = JSON.parse(readFileSync(rutaDeuda, 'utf8'));
const actuales = agrupar(hallazgos);
const nuevos = Object.entries(actuales).filter(([clave, cantidad]) => cantidad > (deuda[clave] ?? 0));
if (hallazgos.some(dato => dato.tipo === 'capa') || nuevos.length) {
    console.error('Se encontraron capas fuera de la escala o colores nuevos fuera de los tokens.', nuevos);
    process.exitCode = 1;
} else console.log(`Tokens verificados. Colores pendientes inventariados: ${hallazgos.length}. Capas numéricas: 0.`);
