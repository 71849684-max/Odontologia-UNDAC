# Conformidad del odontograma con la NTS N.° 188-MINSA/DGIESP-2022

Matriz de verificación ítem por ítem entre la Norma Técnica del Odontograma (RM N.° 559-2022/MINSA,
texto y Anexo II del PDF aportado) y la implementación del frontend.

- Fuente normativa: `Norma-Tecnica-del-Odontograma.pdf` (12 páginas), numerales 1.1 a 1.33,
  disposiciones generales 1 a 7 y Anexo II "Partes del odontograma".
- Lámina oficial de referencia: gráfico del numeral 2 (página 8) y Anexo II (página 12).
- Complemento: `docs/odontograma-nts188.md`.

## Línea base de verificación

```sh
cd frontend
npm test -- --maxWorkers=1 --testTimeout=60000
npm run build
```

Estado al iniciar la Fase 0: **16 archivos, 153 pruebas, todas en verde.**
Estado tras la Fase 1: **17 archivos, 162 pruebas, todas en verde** (se añaden
`odontogramaGeometria.test.mjs` y dos casos DOM en `odontograma.test.jsx`).
El timeout de 5 s por defecto expira en esta máquina (los casos del odontograma tardan hasta 8 s),
por eso se eleva a 60000 ms.

## Leyenda de estados

| Estado | Significado |
| --- | --- |
| ✅ | Conforme a la norma |
| ⚠️ | Parcialmente conforme / divergencia menor |
| ❌ | Incumple o falta |
| ⏸️ | Pendiente de decisión (ver "Decisiones abiertas") |

## 1. Disposiciones generales

| Ítem | Requisito | Estado | Ubicación |
| --- | --- | --- | --- |
| DG 2 | Sistema FDI dígito doble (binario) | ✅ | `odontograma.config.mjs:1-18` |
| DG 3-5 | Odontograma individual, inalterable, sin plan de tratamiento | ✅ | Evaluaciones independientes con cierre de solo lectura |
| DG 6 | Respetar proporcionalmente tamaño, ubicación y forma del hallazgo | ✅ | Editor de trazos `ShapeEditor.jsx` |
| DG 7 | Solo colores rojo y azul para hallazgos | ✅ | `clinicalColor` (gris reservado a la selección de interfaz) |

## 2. Catálogo de hallazgos (numerales 1.x)

| Ítem | Requisito | Estado | Observación |
| --- | --- | --- | --- |
| 1.1.1 | Caries de corona ubicada en V / L-P / M / D / O-I | ⚠️ | Registra la superficie, pero `caries` solo ofrece MB/CE/CD/CDP |
| 1.1.2 | Caries **de raíz** (M / D / V / L-P) | ❌ | La raíz no es una zona interactiva |
| 1.1.3 | Caries cervical `C` | ❌ | Hallazgo inexistente |
| 1.2 | Estudios de consistencia (radiografías) | — | No corresponde al odontograma |
| 1.3 | Cálculo dental: línea cóncava a nivel cervical/oclusal | ❌ | Hallazgo inexistente |
| 1.4.1 | Tinciones extrínsecas: línea cóncava cervical | ❌ | Hallazgo inexistente |
| 1.4.2 | Opacidades `O` / pigmentación `PE` | ✅ | `defecto-esmalte` |
| 1.5 | Corona temporal: circunferencia roja que encierre la corona | ⚠️ | Dibuja rectángulo, no circunferencia |
| 1.6 | Desgaste `DES` en **azul**, en el recuadro | ❌ | Estado en rojo (`odontograma.config.mjs:86`) |
| 1.7 | Diastema `)(` azul entre piezas | ✅ | `diastema` |
| 1.8 | Diente ausente: aspa azul | ✅ | `ausente` |
| 1.9 | Diente discrómico `DIS` azul | ❌ | Hallazgo inexistente |
| 1.10 | Diente ectópico `E` azul | ✅ | `ectopico` |
| 1.11 | Diente en clavija: triángulo azul circunscribiendo el **número** | ⚠️ | El triángulo se dibuja sobre la raíz, no sobre el número |
| 1.12 | Extruido: flecha azul hacia el plano oclusal | ✅ | `extruido` |
| 1.13 | Intruido: flecha azul hacia el ápice | ✅ | `intruido` |
| 1.14 | Edéntulo total: línea horizontal azul sobre las coronas | ✅ | `edentulo` |
| 1.15 | Fractura: línea roja sobre corona **y/o raíz** | ⚠️ | Se puede trazar sobre la raíz, pero la raíz no se puede seleccionar |
| 1.16 | Geminación / fusión: circunferencias interceptadas azules | ✅ | `geminacion`, `fusion` (marcas por par) |
| 1.17 | Giroversión: flecha curva azul a nivel oclusal | ✅ | `giroversion` |
| 1.18 | Impactación `I` azul | ✅ | `impactacion` |
| 1.19 | Implante `IMP` azul | ✅ | `implante` |
| 1.20 | Macrodoncia `MAC` azul | ✅ | `macrodoncia` |
| 1.21 | Microdoncia `MIC` azul | ✅ | `microdoncia` |
| 1.22 | Migración: flecha horizontal azul | ❌ | Hallazgo inexistente |
| 1.23 | Movilidad `M1`-`M3` en **azul** | ❌ | Estado en rojo; lo fija la prueba `odontograma.test.jsx:55` |
| 1.25 | Prótesis removible: dos líneas paralelas en los ápices | ✅ | `protesis-removible` con condición (roja si mal estado) |
| 1.26 | Prótesis total: dos líneas paralelas sobre las coronas | ✅ | `protesis-completa` |
| 1.27 | Remanente radicular `RR` **rojo sobre la raíz** | ⚠️ | Se dibuja en la zona radicular, pero se selecciona desde la corona |
| 1.28 | Restauración: dibujada en la superficie, azul, siglas `AM/R/IV/IM/IE/C` | ✅ | `restauracion` |
| 1.29 | Restauración temporal: contorno rojo | ✅ | `restauracion-temporal` |
| 1.30 | Semi-impactación `SI` azul | ❌ | Hallazgo inexistente |
| 1.31 | Supernumerario: `S` en circunferencia azul entre los ápices | ✅ | `supernumerario` |
| 1.32 | Transposición: dos flechas curvas entrecruzadas | ✅ | `transposicion` |
| 1.33 | Tratamiento pulpar: **línea vertical azul en la raíz** + `TC`/`PC`/`PP` | ⚠️ | `endodoncia` correcto; `pulpotomia` se dibuja en la corona |
| Anexo | Nomenclatura de caras (M, D, V, L/P, proximal, oclusal, incisal, cervical) | ✅ | `superficiesDentales` y leyenda |

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

## Decisiones registradas

| ID | Decisión | Fundamento |
| --- | --- | --- |
| D-01 | La raíz sigue sin ser una superficie de registro en la Fase 1 | La zona radicular interactiva es la Fase 2 y obliga a tocar el modelo de datos y sus guardas |
| D-02 | 14/24 se dibujan con dos ramas sólidas, sin trazo discontinuo | Elimina la duplicación reportada; la lámina oficial sí marca 14/24, pero con una marca punteada que al superponerse al triángulo sólido producía el cruce visible |
| D-03 | El borde incisal permanece como quinta superficie lógica | Exigido por el numeral 1.1.1/1.1.3 (cara incisal) y por la prueba `odontograma.test.jsx:30` |
| D-04 | El borde incisal se sitúa en el borde orientado al plano oclusal, no en el centro de la X | En el espacio local del SVG, `y` creciente siempre mira hacia el plano oclusal en ambas arcadas (lo confirman las flechas de extruido/intruido) |

## Decisiones abiertas (Fase 0 pendiente de confirmación)

| ID | Pregunta | Recomendación |
| --- | --- | --- |
| D-05 | ¿Hacer la raíz clickeable como superficie `raiz`? | Sí: es lo que habilita los ítems 1.1.2, 1.15, 1.27 y 1.33 |
| D-06 | ¿Implementar las filas de recuadros del Anexo II? | Sí, son prescriptivas |
| D-07 | ¿Corregir `desgaste` y `movilidad` a azul? | Sí, es lo que exige la norma (implica actualizar una prueba) |
| D-08 | ¿Dar de alta `DIS`, `SI`, `MIGRACIÓN`, caries cervical y cálculo dental? | Sí, al menos los que use la clínica |
| D-09 | ¿Corona temporal como circunferencia en vez de rectángulo? | Sí, es literal del ítem 1.5 |

## Alcance por fase

| Fase | Contenido | Estado |
| --- | --- | --- |
| 0 | Matriz de conformidad y decisiones | ✅ |
| 1 | Módulo de geometría, corrección de 14/24 y del centro fantasma | ✅ |
| 2 | Zona radicular interactiva (modelo de datos) | ⏸️ |
| 3 | Conformidad normativa (hallazgos, colores, catálogo BD) | ⏸️ |
| 4 | Elementos de lámina (recuadros, zonas, impresión) | ⏸️ |
| 5 | Validación y checklist clínico | ⏸️ |

## Hallazgo transversal detectado (para la Fase 3)

`ServicioOdontograma::normalizarHallazgos()` (`backend/app/Clinica/Odontograma/ServicioOdontograma.php:110`)
identifica el hallazgo por `marca['code']` (la sigla de clasificación: `CE`, `AM`, `DEX`, o vacía) y la
compara con `simbolo`/`codigo` de `catalogo_hallazgo_dental`. Los hallazgos sin sigla o con una sigla
que no figure en el catálogo se descartan con `continue` y **no llegan a las tablas relacionales**,
aunque sí persisten en el JSON de `odontograma.especificaciones`. Debe compararse por `marca['state']`.
