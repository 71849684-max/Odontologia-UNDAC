# Adecuación del odontograma a la NTS 188

## Referencia revisada

NTS N.° 188-MINSA/DGIESP-2022, aprobada por RM N.° 559-2022/MINSA.

- Resolución: https://www.gob.pe/institucion/minsa/normas-legales/3304261-559-2022-minsa
- Publicación oficial consultada: https://bvs.minsa.gob.pe/local/MINSA/5925.pdf
- Numerales 5.4–5.18, catálogo 6.1.1–6.1.38 y anexo gráfico (página impresa 35).

Se consultó también el PDF aportado por el usuario, «Norma Técnica del Odontograma» (12 páginas,
membrete del Colegio Odontológico del Perú). Es la fuente que se audité y se implementó en la Fase 3,
y sus numerales mandan lo siguiente: corona definitiva y temporal como **circunferencia** que encierre
la corona (azul y roja respectivamente), `DES` (1.6) y `M` (1.23) **en azul**, siglas de corona
`CC/CF/CMC/3-4/4-5/7-8/CV/CJ` y de restauración `AM/R/IV/IM/IE`.

**Decisión D-10 (2026-10-08)**: el responsable del proyecto confirmó que la norma que rige es ese
PDF. La referencia a la *NTS N.° 188-MINSA/DGIESP-2022* (numerales 5.4–5.18, catálogo 6.1.1–6.1.38)
que aparecía más arriba queda como antecedente de la fase inicial y **no se usa para validar**; el
número de norma no aparece en el texto del PDF aportado y su numeración (Disposiciones Generales 1–15,
Disposiciones Específicas 1.1–1.33) es la que se audita. El proyecto conserva el nombre «nts188» en
sus ficheros y claves de almacenamiento.

## Cambios implementados

- 32 posiciones permanentes y 20 temporales, con filas superiores 18–11 / 21–28 y 55–51 / 61–65 e inferiores 85–81 / 71–75 y 48–41 / 31–38.
- Gráfico SVG de coronas, raíces, numeración y recuadros; orientación de superficies por cuadrante y arcada. Las cuatro filas permanecen visibles: no se supone que las 52 piezas estén presentes.
- Catálogo de los 38 tipos de hallazgo de 6.1. Opciones explícitas de clasificación/material y estado del tratamiento; rojo y azul para hallazgos.
- Marcas por superficie, por pieza, entre piezas y por arcada. Las ausencias y coronas se dibujan sobre la pieza; las prótesis y aparatos abarcan un conjunto. Validación de arcada y adyacencia.
- Dibujo de la forma observada para caries, restauraciones, fracturas, sellantes y desgaste, sin sustituirla por una letra o un relleno de toda la superficie.
- Varios hallazgos simultáneos sin sobrescribir los anteriores; siglas en recuadros y registro detallado para consultar los que exceden el espacio.
- Especificaciones y observaciones separadas. La fluorosis y clasificaciones adicionales pueden consignarse en especificaciones.
- Evaluaciones independientes por motivo, fecha, profesional y COP; cierre de borrador y consulta posterior en solo lectura. Una nueva evaluación inicia un esquema vacío para registrar lo observado nuevamente.
- Se retiró “extracción indicada” del catálogo: el plan de tratamiento corresponde a su sección.
- Persistencia local por identidad de historia, con detección de fallos de almacenamiento, registros ilegibles y cambios de otra pestaña. No se presenta un fallo de escritura como guardado exitoso.

## Alcance y límites

Esta implementación corresponde al frontend de demostración existente. `HistoriaClinica` todavía utiliza pacientes e historias ficticios. Se conserva el contrato del proyecto de no añadir llamadas al backend desde los componentes clínicos.

El almacenamiento en `localStorage` NO equivale a una historia clínica electrónica oficial: el usuario puede modificarlo o borrarlo y no es compartido entre dispositivos. El cierre protege contra cambios desde esta interfaz, no contra alteración del almacenamiento. El nombre/COP ingresados no autentican al profesional ni sustituyen su firma.

Antes de uso asistencial deben integrarse pacientes reales, persistencia del servidor, autorización del profesional, auditoría y firma/sello conforme al flujo institucional. También debe validarse clínicamente cada símbolo con el responsable de odontología y verificarse la salida impresa (incluida el área mínima de corona de 0,5 cm² del numeral 5.17). No se implementa ni certifica un formulario impreso en este cambio.

Los campos vacíos significan “sin hallazgo registrado”, no “sano”. El profesional debe revisar la evaluación antes de cerrarla.

## Corrección visual de coronas y raíces (2026-10-03)

La propuesta generada con ImageGen coincidía en orden FDI y disposición de las cuatro filas, pero simplificaba algunas raíces y coronas. Para corregir la vista se usó como referencia principal la imagen del odontograma aportada por el usuario, no la imagen generada.

La vista compacta y el editor de trazos ahora comparten el mismo dibujo SVG: anteriores con cuatro sectores diagonales y un borde incisal seleccionable sin casilla central; premolares con franja oclusal estrecha; molares con zona oclusal central. Se muestran raíces superiores hacia arriba e inferiores hacia abajo, con tres ramas en molares superiores y dos en inferiores, además de la línea discontinua de los primeros premolares superiores del esquema (defecto corregido el 2026-10-06, ver más abajo). Son convenciones gráficas de la referencia, no una inferencia de la anatomía de cada paciente.

Se mantienen las cinco superficies lógicas del registro, los datos guardados y las coordenadas de los trazos anteriores. Los tratamientos de conductos y el remanente radicular se muestran en la zona radicular, y las ausencias abarcan corona y raíces. La vista temporal, permanente y mixta continúa disponible.

El ajuste posterior de proporciones amplía cada columna a 60 px y cada SVG a 56 px de ancho, con escala vertical de 1,7 para evitar coronas aplanadas. El editor de trazos aplica la escala inversa al capturar el puntero, de modo que el registro sigue usando sus coordenadas originales. El borde incisal sin hallazgo queda transparente, los contornos son más gruesos y la línea media es recta.

## Corrección de la raíz de 14/24 y del centro fantasma (2026-10-06)

Dos defectos reportados en uso se corrigieron sacando la geometría del componente y centralizándola en `frontend/src/aplicacion/formularios/odontograma/odontogramaGeometria.mjs`, que clasifica la pieza (anterior, premolar o molar), traza sus raíces, define los polígonos de la corona y la banda del borde incisal.

- **Piezas 14 y 24**: se dibujaban dos trazos superpuestos, el triángulo radicular sólido y un `V` discontinuo con vértice desplazado que lo cruzaba. Ahora es un único contorno con dos ramas (puntas en x = 33 y x = 67, muesca a la altura de y = 60), sin trazos discontinuos. La lámina oficial sí distingue 14 y 24, pero con una marca punteada que, al superponerse al triángulo, producía el cruce visible.
- **Piezas anteriores**: el modelo forzaba la quinta superficie `oclusal`, que se dibujaba como una línea invisible en el centro de la X y se resaltaba con un rectángulo degenerado de 36 × 1 px. Las cuatro divisiones siguen compartiendo el punto central, pero el borde incisal pasa a ser una banda ancha en el borde orientado al plano oclusal (y ∈ [86, 95] en coordenadas locales: la arcada inferior se refleja al dibujar, por lo que ese borde es el incisal en ambas arcadas). El resaltado y el rótulo O/I se desplazan con ella y el centro deja de ofrecer una casilla vacía. Supera lo declarado en la sección del 2026-10-03.

Las cinco superficies de cada corona suman exactamente 84 × 35 unidades, es decir, sin huecos ni solapes; con la geometría anterior las piezas anteriores sumaban 2976 por la celda degenerada. La comprobación, el número de ramas por pieza y la ausencia de trazos discontinuos forman parte de `odontogramaGeometria.test.mjs`.

## Zona radicular como superficie de registro (2026-10-07)

La raíz deja de ser decorativa y pasa a ser una superficie de registro pulsable (decisión D-05), lo
que habilita los numerales 1.15, 1.27 y 1.33 de la norma: restauración de raíz, remanente y
tratamiento pulpar, además de las lesiones sobre la zona apical. Supera lo declarado en la sección del
2026-10-03
("se mantienen las cinco superficies lógicas"): ahora son **cinco caras de corona y una zona
radicular**, sin que la corona deje de tener exactamente cinco caras.

- `toothSurfaces` incorpora `raiz` (etiqueta "Raíz", sigla `R`) y `crownSurfaces` mantiene el conjunto
  de las cinco caras para el dibujo de la elipse.
- `toothRootPolygon()` deriva el polígono pulsable del mismo trazo de raíces que se dibuja: una sola
  fuente de verdad, sin geometría paralela que pueda divergir.
- La zona pulsable se dibuja **antes** que la corona, que solo cubre la elipse; su resaltado va sin
  `clipPath`, que la recortaría entera al quedar fuera de la elipse.
- La ausencia marcada desde cualquier superficie colorea también la raíz: la pieza ausente cubre seis
  secciones, y la ayuda en pantalla se ajusta en consecuencia.
- `readRecord()` completa la superficie que falte en odontogramas guardados con anterioridad, de modo
  que ningún registro existente deja de abrirse, y rechaza el archivo si `raiz` existe pero está
  corrupta.

El backend no requiere cambios: `odontograma_superficie.superficie` admite texto libre de 30
caracteres y `normalizarHallazgos()` persiste cualquier superficie que reciba.

## Conformidad normativa (Fase 3, 2026-10-07)

Los símbolos y los colores pasan a reproducir el texto de la norma, numeral por numeral.

- **Colores**: `movilidad` (1.23) y `desgaste` (1.6) dejan el rojo por el **azul**; siguen en rojo los
  tratamientos temporales y el mal estado (Disposición General 8).
- **Siglas de recuadro**: la corona definitiva adopta las del 1.4 (`CC`, `CF`, `CMC`, `3/4`, `4/5`,
  `7/8`, `CV`, `CJ`) y la restauración definitiva pierde la `C`, que no figura en el 1.28 (`AM`, `R`,
  `IV`, `IM`, `IE`).
- **Dibujos**: corona definitiva y temporal se dibujan como **circunferencia** que encierra la corona
  (1.4 y 1.5) y no como rectángulo; la migración es una flecha horizontal a nivel del plano oclusal
  (1.22); el triángulo de clavija (1.11) y los anillos de geminación (1.16) rodean al **número**, no a
  la pieza; la prótesis total se dibuja sobre las coronas y no en los ápices (1.26); la pulpotomía
  comparte con la endodoncia la línea vertical sobre la raíz (1.33).
- **Cinco hallazgos nuevos**: discrómico `DIS`, semi-impactación `SI`, migración, caries cervical y
  cálculo dental, dados de alta en el frontend y en `catalogo_hallazgo_dental`, que pasa de 38 a 43
  filas. Los dos últimos son nomenclatura propia de la clínica, admitida por el Disposicional General 14.
- **Backend**: `normalizarHallazgos()` asocia cada marca por su estado y no por la sigla, con lo que
  dejan de perderse las marcas sin sigla y de colisionar la `M` de movilidad con la de posición anormal.

La matriz ítem por ítem, con lo que queda pendiente, está en
`docs/odontograma-nts188-conformidad.md`.

## Elementos de lámina y hoja de impresión (Fase 4, 2026-10-08)

La lámina pasa a tener las piezas del Anexo II, tomadas literalmente del gráfico de esa página:

- **Recuadros de piezas dentarias**: dos filas de 16 casillas sobre (o bajo) cada arcada permanente y
  una de 10 sobre cada arcada temporal, alineadas columna a columna con los dibujos. La sigla de cada
  hallazgo se escribe en la casilla de su pieza, que es lo que piden los numerales ("en el recuadro
  correspondiente a la pieza dentaria"); cuando una pieza acumula más siglas que casillas, la última
  casilla añade `+n` y el `title` lista todas. Las siglas dejan de flotar sobre el dibujo.
- **Rotulación de zonas**: el separador central se rotula **"Zona Oclusal"** (el plano oclusal queda en
  el `title` del elemento) y al pie de la lámina aparece **"Zona Apical"**. La sección de texto libre
  pasa a llamarse **"Ítem Especificaciones"**, como en el Anexo.
- **Impresión (DG 12)**: hoja de impresión en horizontal que esconde los controles (`.nts-no-print`),
  anula el halo de selección de la interfaz y ensancha la pieza a 60 px, con lo que la corona impresa
  mide ≈ 1,02 cm², por encima del mínimo de 1 cm² del DG 12. El trazo base ya era negro.

Desviación anotada en `docs/odontograma-nts188-conformidad.md`: el gráfico oficial junta las tres
filas de recuadros en el borde de la lámina; aquí la fila estrecha va junto a las piezas temporales a
las que pertenece, para no separar la sigla de su columna.

La matriz completa, con el estado de cada numeral y de las cinco fases, sigue en
`docs/odontograma-nts188-conformidad.md`.

## Uso real (Track B, 2026-10-08)

La lámina cumple la norma; falta que el registro sea firme para usarlo con pacientes reales.
Este es el frente de **uso real** (Track B), distinto de las fases 0–5 del Track A.

| Tarea | Contenido | Estado |
| --- | --- | --- |
| B1 | Datos clínicos en el servidor con aviso visible cuando la red falla | ⏳ |
| B2 | El odontograma se lee y se escribe en la historia clínica, sin carreras de guardado | ✅ |
| B3 | Responsabilidad profesional: COP ligado a la sesión y bloqueo server-side de evaluaciones cerradas | ⏳ |
| B4 | Auditoría de escrituras clínicas y firma digital | ⏳ |

### B2 — Persistencia del odontograma (2026-10-08)

**Lectura.** `leerOdontograma()` en `servicioClinico.js` consulta
`GET /api/historias/{id}/odontograma`, que ya existía en el backend pero nunca se llamaba.
`Odontograma.jsx` lo usa al montar: sin copia local espera la historia («Cargando el odontograma de
la historia clínica…») en lugar de abrir una lámina vacía, y si la red no responde en 10 s vuelve a
la copia local.

**Regla de conflicto.** Manda el servidor, salvo que el autoguardado local haya fallado: ese caso
queda marcado con `<clave>:pendiente` en `localStorage` y la copia local se sube en lugar de ser
reemplazada. Si el servidor aún no tiene odontograma, la copia local se sube (historia abierta sin
conexión). Una vez subida, la marca se borra.

**Una sola vía de escritura.** `ServicioExpediente::guardar()` dejó de reescribir el odontograma:
`formData.odontograma` es un eco de lectura que `obtener()` devuelve, y persistirlo de nuevo hacía
que **cualquier autoguardado de otra sección pisara los cambios recientes** del odontograma. La
carrera se reprodujo (la prueba de regresión falla con el código viejo) y quedó cerrada con
`PUT /api/historias/{id}/odontograma` como única escritura.

**Cadena vacía no es `null`.** La prueba en vivo destapó que el middleware global del framework
convierte cada `""` en `null` en la entrada (`professional`, `cop`, `observations`, `code` y `note`
de cada hallazgo). El registro se guardaba bien, pero al volver a leerlo `readRecord` lo rechazaba
como malformado: odontograma guardado **pero ilegible**, un fallo silencioso que solo aparece al
reabrir la historia desde otro equipo. Corregido en los dos extremos: el backend restaura las
cadenas vacías antes de persistir (`ServicioOdontograma::restaurarCadenasVacias()`) y el navegador
lee un `null` de esos campos como campo vacío (`restaurarTextos()` en `odontogramaRegistro.mjs`),
de modo que los registros ya guardados con `null` siguen siendo legibles sin migración.

**Verificación.** 6 pruebas nuevas en `odontograma.test.jsx` (hidratación, `null` heredado, copia
local vencida, subida al servidor, conflicto con pendiente y guardado sin conexión) y 4 en
`backend/tests/Feature/OdontogramaPersistenciaTest.php`; las de backend se comprobaron con el
arreglo retirado para confirmar que detectan la carrera y la pérdida de cadenas vacías.

## Verificación reproducible

Desde `frontend`:

```sh
npx.cmd vitest run --testTimeout=60000
npm.cmd run build
```

Desde `backend` (requiere la BD de pruebas, ver abajo):

```sh
php artisan test
```

Línea base tras la B2: **17 archivos / 182 pruebas** en el frontend y **40 pruebas** en el backend,
más `npm run build` sin errores.

Comprobación de extremo a extremo en navegador (Vite + `php artisan serve` sobre
`bd_clinica_undac`): paciente y historia creados por la interfaz, marca puesta en el odontograma y
verificada en `odontograma` + `odontograma_hallazgo` de MySQL, después se borró `localStorage` y se
recargó: la lámina volvió desde el servidor con la misma marca y sin errores de consola.

La BD de pruebas `bd_clinica_undac_test` no venía creada. El volcado `bd_clinica_undac.sql` elimina
y recrea la base con su nombre original, así que hay que sustituir el nombre antes de importarlo:

```powershell
$texto = (Get-Content ..\bd_clinica_undac.sql -Raw) -replace 'bd_clinica_undac','bd_clinica_undac_test'
[System.IO.File]::WriteAllText("$env:TEMP\bd_clinica_undac_test.sql", $texto, (New-Object System.Text.UTF8Encoding($false)))
cmd /c 'mysql -u root --default-character-set=utf8mb4 < "%TEMP%\bd_clinica_undac_test.sql"'
```

Las pruebas del odontograma cubren orden FDI, superficies, colores, coexistencia de hallazgos, validaciones de rangos, cierre, separación de pacientes, recuperación de registros, errores de almacenamiento, conflictos entre pestañas y sincronización con la historia clínica.
