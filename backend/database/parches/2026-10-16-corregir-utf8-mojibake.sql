-- Corrige textos con doble codificación UTF-8 (mojibake: clÃ­nicas → clínicas).
-- Solo actualiza filas que aún contienen el patrón típico de corrupción.

UPDATE configuracion_sistema
SET
  descripcion = CASE WHEN BINARY descripcion LIKE '%Ã%' OR BINARY descripcion LIKE '%Â%' OR BINARY descripcion LIKE '%â%' THEN COALESCE(CONVERT(CAST(CONVERT(descripcion USING latin1) AS BINARY) USING utf8mb4), descripcion) ELSE descripcion END,
  valor = CASE WHEN BINARY valor LIKE '%Ã%' OR BINARY valor LIKE '%Â%' OR BINARY valor LIKE '%â%' THEN COALESCE(CONVERT(CAST(CONVERT(valor USING latin1) AS BINARY) USING utf8mb4), valor) ELSE valor END
WHERE BINARY descripcion LIKE '%Ã%' OR BINARY descripcion LIKE '%Â%'
   OR BINARY valor LIKE '%Ã%' OR BINARY valor LIKE '%Â%';

UPDATE estado_historia_clinica
SET
  nombre = CASE WHEN BINARY nombre LIKE '%Ã%' OR BINARY nombre LIKE '%Â%' OR BINARY nombre LIKE '%â%' THEN COALESCE(CONVERT(CAST(CONVERT(nombre USING latin1) AS BINARY) USING utf8mb4), nombre) ELSE nombre END,
  descripcion = CASE WHEN BINARY descripcion LIKE '%Ã%' OR BINARY descripcion LIKE '%Â%' OR BINARY descripcion LIKE '%â%' THEN COALESCE(CONVERT(CAST(CONVERT(descripcion USING latin1) AS BINARY) USING utf8mb4), descripcion) ELSE descripcion END
WHERE BINARY nombre LIKE '%Ã%' OR BINARY nombre LIKE '%Â%'
   OR BINARY descripcion LIKE '%Ã%' OR BINARY descripcion LIKE '%Â%';

UPDATE modulo
SET
  nombre_modulo = CASE WHEN BINARY nombre_modulo LIKE '%Ã%' OR BINARY nombre_modulo LIKE '%Â%' OR BINARY nombre_modulo LIKE '%â%' THEN COALESCE(CONVERT(CAST(CONVERT(nombre_modulo USING latin1) AS BINARY) USING utf8mb4), nombre_modulo) ELSE nombre_modulo END,
  descripcion = CASE WHEN BINARY descripcion LIKE '%Ã%' OR BINARY descripcion LIKE '%Â%' OR BINARY descripcion LIKE '%â%' THEN COALESCE(CONVERT(CAST(CONVERT(descripcion USING latin1) AS BINARY) USING utf8mb4), descripcion) ELSE descripcion END
WHERE BINARY nombre_modulo LIKE '%Ã%' OR BINARY nombre_modulo LIKE '%Â%'
   OR BINARY descripcion LIKE '%Ã%' OR BINARY descripcion LIKE '%Â%';

UPDATE submodulo
SET
  nombre_submodulo = CASE WHEN BINARY nombre_submodulo LIKE '%Ã%' OR BINARY nombre_submodulo LIKE '%Â%' OR BINARY nombre_submodulo LIKE '%â%' THEN COALESCE(CONVERT(CAST(CONVERT(nombre_submodulo USING latin1) AS BINARY) USING utf8mb4), nombre_submodulo) ELSE nombre_submodulo END,
  descripcion = CASE WHEN BINARY descripcion LIKE '%Ã%' OR BINARY descripcion LIKE '%Â%' OR BINARY descripcion LIKE '%â%' THEN COALESCE(CONVERT(CAST(CONVERT(descripcion USING latin1) AS BINARY) USING utf8mb4), descripcion) ELSE descripcion END
WHERE BINARY nombre_submodulo LIKE '%Ã%' OR BINARY nombre_submodulo LIKE '%Â%'
   OR BINARY descripcion LIKE '%Ã%' OR BINARY descripcion LIKE '%Â%';

UPDATE rol
SET
  nombre_rol = CASE WHEN BINARY nombre_rol LIKE '%Ã%' OR BINARY nombre_rol LIKE '%Â%' OR BINARY nombre_rol LIKE '%â%' THEN COALESCE(CONVERT(CAST(CONVERT(nombre_rol USING latin1) AS BINARY) USING utf8mb4), nombre_rol) ELSE nombre_rol END,
  descripcion = CASE WHEN BINARY descripcion LIKE '%Ã%' OR BINARY descripcion LIKE '%Â%' OR BINARY descripcion LIKE '%â%' THEN COALESCE(CONVERT(CAST(CONVERT(descripcion USING latin1) AS BINARY) USING utf8mb4), descripcion) ELSE descripcion END
WHERE BINARY nombre_rol LIKE '%Ã%' OR BINARY nombre_rol LIKE '%Â%'
   OR BINARY descripcion LIKE '%Ã%' OR BINARY descripcion LIKE '%Â%';

UPDATE catalogo_hallazgo_dental
SET
  nombre = CASE WHEN BINARY nombre LIKE '%Ã%' OR BINARY nombre LIKE '%Â%' OR BINARY nombre LIKE '%â%' THEN COALESCE(CONVERT(CAST(CONVERT(nombre USING latin1) AS BINARY) USING utf8mb4), nombre) ELSE nombre END,
  simbolo = CASE WHEN BINARY simbolo LIKE '%Ã%' OR BINARY simbolo LIKE '%Â%' OR BINARY simbolo LIKE '%â%' THEN COALESCE(CONVERT(CAST(CONVERT(simbolo USING latin1) AS BINARY) USING utf8mb4), simbolo) ELSE simbolo END
WHERE BINARY nombre LIKE '%Ã%' OR BINARY nombre LIKE '%Â%'
   OR BINARY simbolo LIKE '%Ã%' OR BINARY simbolo LIKE '%Â%' OR BINARY simbolo LIKE '%â%';

UPDATE catalogo_tratamiento_dental
SET
  nombre = CASE WHEN BINARY nombre LIKE '%Ã%' OR BINARY nombre LIKE '%Â%' OR BINARY nombre LIKE '%â%' THEN COALESCE(CONVERT(CAST(CONVERT(nombre USING latin1) AS BINARY) USING utf8mb4), nombre) ELSE nombre END
WHERE BINARY nombre LIKE '%Ã%' OR BINARY nombre LIKE '%Â%';

UPDATE pregunta_salud
SET
  pregunta = CASE WHEN BINARY pregunta LIKE '%Ã%' OR BINARY pregunta LIKE '%Â%' OR BINARY pregunta LIKE '%â%' THEN COALESCE(CONVERT(CAST(CONVERT(pregunta USING latin1) AS BINARY) USING utf8mb4), pregunta) ELSE pregunta END
WHERE BINARY pregunta LIKE '%Ã%' OR BINARY pregunta LIKE '%Â%';
