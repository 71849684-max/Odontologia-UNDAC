-- Corrige textos con doble codificación UTF-8 (mojibake: clÃ­nicas → clínicas).
-- Solo actualiza filas que aún contienen el patrón típico de corrupción.

UPDATE configuracion_sistema
SET
  descripcion = CONVERT(CAST(CONVERT(descripcion USING latin1) AS BINARY) USING utf8mb4),
  valor = CONVERT(CAST(CONVERT(valor USING latin1) AS BINARY) USING utf8mb4)
WHERE descripcion LIKE '%Ã%' OR descripcion LIKE '%Â%'
   OR valor LIKE '%Ã%' OR valor LIKE '%Â%';

UPDATE estado_historia_clinica
SET
  nombre = CONVERT(CAST(CONVERT(nombre USING latin1) AS BINARY) USING utf8mb4),
  descripcion = CONVERT(CAST(CONVERT(descripcion USING latin1) AS BINARY) USING utf8mb4)
WHERE nombre LIKE '%Ã%' OR nombre LIKE '%Â%'
   OR descripcion LIKE '%Ã%' OR descripcion LIKE '%Â%';

UPDATE modulo
SET
  nombre_modulo = CONVERT(CAST(CONVERT(nombre_modulo USING latin1) AS BINARY) USING utf8mb4),
  descripcion = CONVERT(CAST(CONVERT(descripcion USING latin1) AS BINARY) USING utf8mb4)
WHERE nombre_modulo LIKE '%Ã%' OR nombre_modulo LIKE '%Â%'
   OR descripcion LIKE '%Ã%' OR descripcion LIKE '%Â%';

UPDATE submodulo
SET
  nombre_submodulo = CONVERT(CAST(CONVERT(nombre_submodulo USING latin1) AS BINARY) USING utf8mb4),
  descripcion = CONVERT(CAST(CONVERT(descripcion USING latin1) AS BINARY) USING utf8mb4)
WHERE nombre_submodulo LIKE '%Ã%' OR nombre_submodulo LIKE '%Â%'
   OR descripcion LIKE '%Ã%' OR descripcion LIKE '%Â%';

UPDATE rol
SET
  nombre_rol = CONVERT(CAST(CONVERT(nombre_rol USING latin1) AS BINARY) USING utf8mb4),
  descripcion = CONVERT(CAST(CONVERT(descripcion USING latin1) AS BINARY) USING utf8mb4)
WHERE nombre_rol LIKE '%Ã%' OR nombre_rol LIKE '%Â%'
   OR descripcion LIKE '%Ã%' OR descripcion LIKE '%Â%';

UPDATE catalogo_hallazgo_dental
SET
  nombre = CONVERT(CAST(CONVERT(nombre USING latin1) AS BINARY) USING utf8mb4),
  simbolo = CONVERT(CAST(CONVERT(simbolo USING latin1) AS BINARY) USING utf8mb4)
WHERE nombre LIKE '%Ã%' OR nombre LIKE '%Â%'
   OR simbolo LIKE '%Ã%' OR simbolo LIKE '%Â%' OR simbolo LIKE '%â%';

UPDATE catalogo_tratamiento_dental
SET
  nombre = CONVERT(CAST(CONVERT(nombre USING latin1) AS BINARY) USING utf8mb4)
WHERE nombre LIKE '%Ã%' OR nombre LIKE '%Â%';

UPDATE pregunta_salud
SET
  pregunta = CONVERT(CAST(CONVERT(pregunta USING latin1) AS BINARY) USING utf8mb4)
WHERE pregunta LIKE '%Ã%' OR pregunta LIKE '%Â%';
