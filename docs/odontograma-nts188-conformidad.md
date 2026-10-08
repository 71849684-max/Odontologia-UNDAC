# Conformidad del odontograma con la NTS N.° 188-MINSA/DGIESP-2022

Matriz de verificación ítem por ítem entre la Norma Técnica del Odontograma (RM N.° 559-2022/MINSA,
texto y Anexo II del PDF aportado) y la implementación del frontend.

- Fuente normativa de esta matriz: el PDF aportado `Norma-Tecnica-del-Odontograma.pdf` (12 páginas),
  que se titula **«Norma Técnica del Odontograma»** y lleva el membrete del Colegio Odontológico del
  Perú. Sus Disposiciones Generales son los numerales **1 a 15** (páginas 1 y 2) y sus Disposiciones
  Específicas van del **1.1 al 1.33** (páginas 2 a 8; el numeral **1.24 no existe**, la norma salta de
  1.23 a 1.25), más el Anexo II "Partes del odontograma" (página 12).
- Lámina oficial de referencia: gráfico del numeral 2 (página 8) y Anexo II (página 12).
- Complemento: `docs/odontograma-nts188.md`.
- ⚠️ **Identidad de la fuente por confirmar (Fase 5)**: el resto del proyecto referencia la
  *NTS N.° 188-MINSA/DGIESP-2022* (numerales 5.x, catálogo 6.1.1–6.1.38), pero **el PDF aportado no
  muestra ese número en su texto** y su numeración no coincide con la de ese otro documento. Las
  secciones siguientes citan el PDF aportado, que es lo que se auditaron y se implementó en la Fase 3.
- Las páginas 2 y 3 del PDF no traen capa de texto: sus numerales se leyeron sobre el render de la
  página (con `pypdfium2`). El 2026-10-07 se rehízo la sección 2 de esta matriz: sus renglones
  1.1.1, 1.1.2, 1.1.3, 1.2, 1.3, 1.4.1 y 1.4.2 **no existen en la norma** y había que corregirlos.

## Línea base de verificación

```sh
cd frontend
npm test -- --maxWorkers=1 --testTimeout=60000
npm run build
```

Estado al iniciar la Fase 0: **16 archivos, 153 pruebas, todas en verde.**
Estado tras la Fase 1: **17 archivos, 162 pruebas, todas en verde** (se añaden
`odontogramaGeometria.test.mjs` y dos casos DOM en `odontograma.test.jsx`).
Estado tras la Fase 2: **17 archivos, 166 pruebas, todas en verde** (se amplían las de
geometría radicular, la zona pulsable, la ausencia sobre seis secciones y la lectura
de odontogramas guardados sin zona radicular).
Estado tras la Fase 3: **17 archivos, 171 pruebas, todas en verde** (los cinco estados nuevos,
los colores de los numerales 1.6 y 1.23, la elipse de corona, la flecha de migración, las marcas
sobre el número y la asociación de hallazgos por `state` en el backend).
El timeout de 5 s por defecto expira en esta máquina (los casos del odontograma tardan hasta 8 s),
por eso se eleva a 60000 ms.

## Leyenda de estados

| Estado | Significado |
| --- | --- |
| ✅ | Conforme a la norma |
| ⚠️ | Parcialmente conforme / divergencia menor |
| ❌ | Incumple o falta |
| ⏸️ | Pendiente de decisión (ver "Decisiones abiertas") |

## 1. Disposiciones generales (numerales 1 a 15)

| Ítem | Requisito | Estado | Ubicación |
| --- | --- | --- | --- |
| DG 1 | El odontograma forma parte de la Ficha Estomatológica y de la Historia Clínica | ✅ | El registro viaja con la historia clínica del paciente |
| DG 2 | Sistema FDI dígito doble (binario) | ✅ | `odontograma.config.mjs:1-18` |
| DG 3 | Individual por paciente, en la primera cita, **inalterable** | ✅ | Una evaluación por paciente; al cerrarse pasa a solo lectura |
| DG 4 | Segunda odontograma que registre la evolución de los tratamientos | ✅ | `addExamination()` encadena evaluaciones de seguimiento |
| DG 5 | Solo lo observado en el examen, **nunca** el plan de tratamiento | ✅ | El formulario no tiene campo de plan de tratamiento |
| DG 6 | Respetar proporcionalmente tamaño, ubicación y forma del hallazgo | ✅ | Editor de trazos `ShapeEditor.jsx` |
| DG 7 | Solo colores rojo y azul para hallazgos | ✅ | `clinicalColor` (gris reservado a la selección de interfaz) |
| DG 8 | Siglas en azul si el tratamiento está en buen estado y en rojo si está en mal estado; los **temporales**, siempre en rojo | ✅ | `condition: true` en los estados de tratamiento; `corona-temporal` y `restauracion-temporal` en rojo |
| DG 9 | En especificaciones, aclarar los hallazgos que no se registran gráficamente | ✅ | Campo `specifications` por evaluación y `note` por marca |
| DG 10 | Varias anomalías en la misma pieza → ítem de especificaciones | ✅ | `findings[]` admite más de una marca por pieza |
| DG 11 | Consignar los hallazgos radiográficos | ⚠️ | Sin sección propia: se anotan en especificaciones/observaciones |
| DG 12 | Gráfico único impreso en negro, corona ≥ 1 cm² y raíz proporcional (Anexo II) | ⚠️ | Se dibuja en negro y a proporción; la **impresión** queda para la Fase 4 |
| DG 13 | Sin enmendaduras ni tachaduras; las modificaciones, firmadas por el profesional | ⚠️ | Cerrada es de solo lectura y guarda profesional + COP, pero no firma cada modificación |
| DG 14 | Las especialidades **pueden adicionar** nomenclaturas; no, contradecir las de la norma | ✅ | Admitidos como propios: fosas y fisuras, sellante, erupción, posición anormal, prótesis fija, caries cervical y cálculo dental |
| DG 15 | El odontograma debe llenarse en un máximo de 10 minutos | — | Propiedad del clínico: el software no lo cronometra |

## 2. Catálogo de hallazgos (numerales 1.x)

| Ítem | Requisito (según el texto de la norma) | Estado | Observación |
| --- | --- | --- | --- |
| 1.1 | Aparato ortodóntico **fijo**: cuadrados con cruz unidos por una línea recta a nivel de los ápices; azul en buen estado, rojo en mal estado | ✅ | `ortodoncia-fija` + `RangeMark.brackets` y `condition`; el tipo de aparatología va en especificaciones |
| 1.2 | Aparato ortodóntico **removible**: línea en zig-zag a la altura de los ápices (roja si mal estado) | ✅ | `ortodoncia-removible` + `RangeMark.zigzag` |
| 1.3 | **Caries**: la lesión se dibuja siguiendo su forma en las superficies comprometidas y se pinta **de rojo** | ✅ | `caries` (`draw-fill`, rojo). El clasificador MB/CE/CD/CDP es adicional (DG 14) |
| 1.4 | **Corona definitiva**: circunferencia **azul** que encierre la corona y siglas en el recuadro (`CC`, `CF`, `CMC`, `3/4`, `4/5`, `7/8`, `CV`, `CJ`) | ✅ | **Fase 3**: la corona pasó de rectángulo a elipse y sus opciones son las de la norma |
| 1.5 | **Corona temporal**: circunferencia **roja** que encierre la corona y siglas en rojo | ✅ | **Fase 3**: misma elipse en rojo; `CT` se imprime en rojo en el recuadro |
| 1.6 | **Desgaste** `DES` en mayúsculas, **azul**, en el recuadro | ✅ | **Fase 3**: el estado pasó de rojo a azul (además traza la zona afectada) |
| 1.7 | Diastema: `)(` azul entre las piezas | ✅ | `diastema` (`RangeMark.diastema`) |
| 1.8 | Diente ausente: **aspa azul** sobre la figura | ✅ | `ausente` (el relleno azul de corona y raíz es una adición visual, la aspa está) |
| 1.9 | Diente **discrómico**: `DIS` en azul en el recuadro | ✅ | **Fase 3**: estado nuevo `discromico` + fila `DISCROMICO` en el catálogo |
| 1.10 | Diente **ectópico**: `E` en azul en el recuadro | ✅ | `ectopico` |
| 1.11 | Diente en **clavija**: triángulo azul circunscribiendo el **número** | ✅ | **Fase 3**: el triángulo pasó de la pieza al número (`.nts-clavija`, misma celda que el botón) |
| 1.12 | Extruido: flecha azul hacia el plano oclusal | ✅ | `extruido` |
| 1.13 | Intruido: flecha recta vertical azul hacia el ápice | ✅ | `intruido` |
| 1.14 | Edéntulo total: línea recta horizontal azul sobre las coronas | ✅ | `edentulo` (`RangeMark.edentulous`) |
| 1.15 | Fractura: línea recta **roja** sobre la corona y/o la raíz | ✅ | `fractura` sobre la superficie elegida; la raíz se habilitó en la Fase 2 |
| 1.16 | Geminación / fusión: dos circunferencias interceptadas azules que encierran los **números** | ✅ | **Fase 3**: `geminacion` pasó de no dibujar nada a los dos anillos sobre el número; `fusion` ya los tenía |
| 1.17 | Giroversión: flecha curva azul a nivel del plano oclusal | ✅ | `giroversion` (horario / antihorario) |
| 1.18 | Impactación: `I` en azul en el recuadro | ✅ | `impactacion` |
| 1.19 | Implante: `IMP` en azul en el recuadro | ✅ | `implante` |
| 1.20 | Macrodoncia: `MAC` en azul en el recuadro | ✅ | `macrodoncia` |
| 1.21 | Microdoncia: `MIC` en azul en el recuadro | ✅ | `microdoncia` |
| 1.22 | **Migración**: flecha recta **horizontal** azul en el sentido de la migración, a nivel del plano oclusal | ✅ | **Fase 3**: estado nuevo `migracion` con dirección (derecha / izquierda) |
| 1.23 | **Movilidad**: `M` + grado arábigo en **azul** en el recuadro | ✅ | **Fase 3**: el estado pasó de rojo a azul; `M1`, `M2`, `M3` |
| 1.24 | — | — | **No existe**: la norma salta de 1.23 a 1.25 |
| 1.25 | Prótesis removible: dos líneas horizontales paralelas a nivel de los **ápices** (roja si mal estado) | ✅ | `protesis-removible` con condición |
| 1.26 | Prótesis total: dos líneas rectas paralelas **sobre las coronas** (roja si mal estado) | ✅ | **Fase 3**: `protesis-completa` pasó de los ápices a las coronas |
| 1.27 | Remanente radicular: `RR` en **rojo sobre la raíz** | ✅ | `remanente` dibuja el `RR` en la zona radicular; la raíz es seleccionable desde la Fase 2 |
| 1.28 | Restauración: dibujada siguiendo su forma, pintada de **azul**, siglas `AM`, `R`, `IV`, `IM`, `IE` en el recuadro | ✅ | **Fase 3**: se quitó la `C`, que no figura en el numeral |
| 1.29 | Restauración temporal: **contorno en rojo** | ✅ | `restauracion-temporal` |
| 1.30 | Semi-impactación: `SI` en azul en el recuadro | ✅ | **Fase 3**: estado nuevo `semi-impactacion` + fila en el catálogo |
| 1.31 | Súpernumerario: `S` en mayúscula dentro de una circunferencia azul, entre los ápices de las piezas adyacentes | ✅ | `supernumerario` (`RangeMark.supernumerary`) |
| 1.32 | Transposición: dos flechas curvas azules entrecruzadas a la altura de los números | ✅ | `transposicion` (`RangeMark.transposition`) |
| 1.33 | Tratamiento pulpar: **línea recta vertical azul sobre la raíz** + siglas `TC`, `PC`, `PP` en el recuadro | ✅ | **Fase 3**: `pulpotomia` dejó de dibujarse en la corona y pasó a `root`, como `endodoncia` |
| Anexo | Nomenclatura de caras (M, D, V, L/P, proximal, oclusal, incisal, cervical) | ✅ | `superficiesDentales` y leyenda |

> Adiciones admitidas por el DG 14 (no figuran en la norma, pero no la contradicen): defectos de
> desarrollo del esmalte (`O`/`PE`), espigo-muñón, fosas y fisuras, sellante, erupción, posición
> anormal, prótesis fija, caries cervical (`C`) y cálculo dental (`CAL`).

## 3. Anexo II — Partes del odontograma

| Elemento oficial | Estado | Observación |
| --- | --- | --- |
| Filas de **recuadros** de piezas dentarias (3 arriba, 3 abajo) | ⏸️ | Hoy solo se muestran siglas bajo cada pieza (`nts-tooth-codes`) |
| **Número de piezas dentarias** en fila | ✅ | `nts-tooth-number` |
| Dibujos de corona y raíces por pieza | ✅ | `GraficoOdontograma.jsx` |
| **Zona Oclusal** / **Zona Apical** rotuladas | ⏸️ | Solo existe el separador "Plano oclusal" |
| **Ítem Especificaciones** | ✅ | Campo de texto propio en la sección |

## 4. Errores visuales corregidos en la Fase 1

| # | Error reportado | Causa | Corrección |
| --- | --- | --- | --- |
| E-1 | Piezas 14 y 24 con las líneas de las raíces duplicadas | `GraficoOdontograma.jsx` dibujaba la raíz simple sólida **y encima** un `V` discontinuo con vértice desplazado que la cruzaba | La geometría pasa a `odontogramaGeometria.mjs`: 14/24 se dibujan con **bifurcación real** (dos ramas) y un solo contorno |
| E-2 | El diente de 4 divisiones ofrecía un "centro vacío" | El modelo forzaba la quinta superficie (`oclusal`) en piezas anteriores: se dibujaba como trazo invisible en el centro de la X y su resaltado era un rectángulo degenerado de 36×1 px | El borde incisal se mantiene seleccionable pero se traslada al **borde orientado al plano oclusal** y su zona pasa a ser una banda explícita y visible (`odontogramaGeometria.mjs`) |

## 5. Zona radicular (Fase 2, 2026-10-07)

La raíz pasa a ser una superficie de registro más, la sexta de `toothSurfaces`, sin dejar de ser una
cara de la corona (las cinco caras se conservan en `crownSurfaces`).

| Pieza del cambio | Qué hace |
| --- | --- |
| `odontogramaGeometria.mjs` → `toothRootPolygon()` | Convierte el trazo de las raíces en el polígono cerrado que se pulsa; es exactamente el mismo contorno dibujado |
| `odontograma.config.mjs` | Añade `raiz` a `toothSurfaces`, expone `crownSurfaces` y `completeToothSurfaces()` para migrar registros antiguos |
| `GraficoOdontograma.jsx` | Dibuja la zona pulsable **debajo** de la corona (esta solo cubre la elipse) y su resaltado **sin** `clipPath`, que la dejaría invisible |
| `odontogramaRegistro.mjs` → `readRecord()` | Lee odontogramas guardados sin `raiz` completándola al vuelo y rechaza una zona corrupta |
| `odontograma.css` → `.nts-root` | `pointer-events: fill`: el contorno no tiene relleno visible, así que se pulsa su área entera |
| `HerramientasOdontograma.jsx` | La ausencia ahora cubre **seis** secciones, no cinco |

Compatibilidad: los odontogramas guardados antes de esta fecha siguen abriendo; `readRecord()` rellena
la superficie que falte y solo rechaza el registro si `raiz` existe pero está corrupta. El backend no
cambia: `odontograma_superficie.superficie` es texto libre de 30 caracteres.

## 6. Conformidad normativa (Fase 3, 2026-10-07)

| Pieza del cambio | Qué hace |
| --- | --- |
| `odontograma.config.mjs` | `movilidad` y `desgaste` pasan a **azul** (1.6 y 1.23); `corona` adopta las siglas del 1.4 y `restauracion` pierde la `C` que no figura en el 1.28; `pulpotomia` se dibuja sobre la raíz (1.33); **cinco estados nuevos**: `discromico` (`DIS`), `semi-impactacion` (`SI`), `migracion` (flecha con dirección), `caries-cervical` y `calculo` |
| `GraficoOdontograma.jsx` | `crown` deja el rectángulo por la **elipse** que encierra la corona (1.4 y 1.5); aparece `migration`, flecha horizontal a nivel del plano oclusal (1.22); el triángulo de `clavija` (1.11) y los dos anillos de `geminacion` (1.16) pasan del dibujo de la pieza al **número**, compartiendo su celda con el botón; `protesis-completa` se dibuja sobre las coronas y no en los ápices (1.26) |
| `odontograma.css` | `.nts-clavija` y `.nts-gemination` ocupan la celda del número con `overflow: visible` y se invierten en la arcada inferior |
| `ServicioOdontograma.php` | `normalizarHallazgos()` identifica el hallazgo por `state` → `codigo` (véase la última sección) |
| `bd_clinica_undac.sql` y la BD viva | El catálogo pasa de 38 a **43** hallazgos (filas 39–43) y `CORONA` se corrige a simbolo `CC` |

La comprobación visual se hizo sobre una lámina generada con las piezas marcadas (clavija, geminación,
corona definitiva y temporal, migración, ausencia, endodoncia, desgaste, movilidad y discrómico) y
revisada en el navegador.

## Decisiones registradas

| ID | Decisión | Fundamento |
| --- | --- | --- |
| D-01 | La raíz sigue sin ser una superficie de registro en la Fase 1 | La zona radicular interactiva es la Fase 2 y obliga a tocar el modelo de datos y sus guardas |
| D-02 | 14/24 se dibujan con dos ramas sólidas, sin trazo discontinuo | Elimina la duplicación reportada; la lámina oficial sí marca 14/24, pero con una marca punteada que al superponerse al triángulo sólido producía el cruce visible |
| D-03 | El borde incisal permanece como quinta superficie lógica | Exigido por la nomenclatura de caras (cara incisal, numeral 1.x del Anexo) y por la prueba `odontograma.test.jsx:30` |
| D-04 | El borde incisal se sitúa en el borde orientado al plano oclusal, no en el centro de la X | En el espacio local del SVG, `y` creciente siempre mira hacia el plano oclusal en ambas arcadas (lo confirman las flechas de extruido/intruido) |

## Decisiones abiertas

| ID | Pregunta | Recomendación | Estado (2026-10-07) |
| --- | --- | --- | --- |
| D-05 | ¿Hacer la raíz clickeable como superficie `raiz`? | Sí: es lo que habilita los ítems 1.15, 1.27 y 1.33 | ✅ **Aprobada** — implementada en la Fase 2 |
| D-06 | ¿Implementar las filas de recuadros del Anexo II? | Sí, son prescriptivas | ⏸️ **Aprobada** — pendiente de la Fase 4 |
| D-07 | ¿Corregir `desgaste` y `movilidad` a azul? | Sí, es lo que exige la norma (implica actualizar una prueba) | ✅ **Aprobada** — implementada en la Fase 3 |
| D-08 | ¿Dar de alta `DIS`, `SI`, `MIGRACIÓN`, caries cervical y cálculo dental? | Sí, al menos los que use la clínica | ✅ **Aprobada** (los 5) — implementada en la Fase 3 |
| D-09 | ¿Corona temporal como circunferencia en vez de rectángulo? | Sí, es literal del ítem 1.5 | ✅ **Confirmada** — implementada en la Fase 3 |

## Alcance por fase

| Fase | Contenido | Estado |
| --- | --- | --- |
| 0 | Matriz de conformidad y decisiones | ✅ |
| 1 | Módulo de geometría, corrección de 14/24 y del centro fantasma | ✅ |
| 2 | Zona radicular interactiva (modelo de datos) | ✅ |
| 3 | Conformidad normativa (hallazgos, colores, catálogo BD) | ✅ |
| 4 | Elementos de lámina (recuadros, zonas, impresión) | ⏸️ |
| 5 | Validación y checklist clínico | ⏸️ |

## Hallazgo transversal corregido en la Fase 3

`ServicioOdontograma::normalizarHallazgos()` identificaba el hallazgo por `marca['code']` (la sigla de
clasificación: `CE`, `AM`, `DEX`, o vacía) y lo comparaba con `simbolo`/`codigo` de
`catalogo_hallazgo_dental`. Dos fallos: los hallazgos sin sigla se descartaban con `continue` (no
llegaban a las tablas relacionales, aunque sí persistían en el JSON de `odontograma.especificaciones`)
y las siglas que colisionaban se asociaban al catálogo equivocado (la `M` es a la vez **movilidad** y
**posición anormal**).

Hoy se compara por `marca['state']` → `codigoCatalogo()`, que traduce el estado del frontend al código
del catálogo (`ectopico` → `ECTOPICA`, `extruido` → `EXTRUIDA`, `intruido` → `INTRUIDA`,
`supernumerario` → `SUPERNUMERARIA`, `posicion` → `POSICION_ANORMAL`; el resto es literal
conversión a mayúsculas y `_`).
