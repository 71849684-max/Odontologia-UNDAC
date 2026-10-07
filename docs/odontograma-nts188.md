# Adecuación del odontograma a la NTS 188

## Referencia revisada

NTS N.° 188-MINSA/DGIESP-2022, aprobada por RM N.° 559-2022/MINSA.

- Resolución: https://www.gob.pe/institucion/minsa/normas-legales/3304261-559-2022-minsa
- Publicación oficial consultada: https://bvs.minsa.gob.pe/local/MINSA/5925.pdf
- Numerales 5.4–5.18, catálogo 6.1.1–6.1.38 y anexo gráfico (página impresa 35).

Se consultó también el PDF aportado por el usuario. No se copiaron sus convenciones antiguas cuando difieren de la edición de 2022: esta representa coronas con un cuadrado y siglas CM/CF/CMC/CV/CLM; movilidad y desgaste en rojo; ausencias con aspa azul y DNE/DEX/DAO.

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

## Verificación reproducible

Desde `frontend`:

```sh
npm test -- --maxWorkers=1 --testTimeout=20000
npm run build
```

Las pruebas del odontograma cubren orden FDI, superficies, colores, coexistencia de hallazgos, validaciones de rangos, cierre, separación de pacientes, recuperación de registros, errores de almacenamiento y conflictos entre pestañas.
