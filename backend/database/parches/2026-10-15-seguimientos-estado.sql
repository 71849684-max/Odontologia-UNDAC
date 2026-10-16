-- Estado y hora en controles de seguimiento quirúrgico.
-- Idempotente: clinica:parches tolera columnas ya existentes.

ALTER TABLE seguimiento_quirurgico ADD COLUMN estado VARCHAR(30) NOT NULL DEFAULT 'PROGRAMADO' AFTER indicaciones;
ALTER TABLE seguimiento_quirurgico ADD COLUMN hora TIME NULL AFTER fecha;
