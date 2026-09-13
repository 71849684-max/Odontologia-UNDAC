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

## Verificación reproducible

Desde `frontend`:

```sh
npm test -- --maxWorkers=1 --testTimeout=20000
npm run build
```

Las pruebas del odontograma cubren orden FDI, superficies, colores, coexistencia de hallazgos, validaciones de rangos, cierre, separación de pacientes, recuperación de registros, errores de almacenamiento y conflictos entre pestañas.
