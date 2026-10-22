-- Extracción programada: estado clínico distinto de la pieza ya ausente/extraída.
-- No marca la pieza como perdida; el frontend la dibuja con aspa roja discontinua.
-- Se inserta sin id fijo para no chocar con catálogos que ya usan ese identificador.

INSERT INTO catalogo_hallazgo_dental
  (codigo, nombre, categoria, alcance, permite_superficie, requiere_condicion, simbolo, descripcion, estado)
SELECT 'EXTRACCION_PROGRAMADA', 'Extracción programada', 'ESTADO', 'PIEZA', 0, 0, 'EXP',
       'Extracción indicada y aún no realizada; no marca la pieza como perdida.', 1
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM catalogo_hallazgo_dental WHERE codigo = 'EXTRACCION_PROGRAMADA'
);
