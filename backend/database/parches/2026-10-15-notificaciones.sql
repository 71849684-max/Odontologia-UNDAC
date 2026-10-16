-- Notificaciones in-app (revisión de sección, sin SMTP).
-- Idempotente: clinica:parches tolera tabla ya existente.

CREATE TABLE IF NOT EXISTS notificacion (
  id_notificacion BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  tipo_destinatario VARCHAR(20) NOT NULL COMMENT 'ALUMNO o DOCENTE',
  id_destinatario BIGINT UNSIGNED NOT NULL,
  tipo VARCHAR(40) NOT NULL,
  titulo VARCHAR(180) NOT NULL,
  mensaje VARCHAR(500) NOT NULL,
  id_historia_clinica BIGINT UNSIGNED NULL,
  codigo_seccion VARCHAR(80) NULL,
  leida TINYINT(1) NOT NULL DEFAULT 0,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_notificacion),
  KEY idx_notificacion_destinatario (tipo_destinatario, id_destinatario, leida, creado_en),
  KEY idx_notificacion_historia (id_historia_clinica),
  CONSTRAINT fk_notificacion_historia FOREIGN KEY (id_historia_clinica) REFERENCES historia_clinica(id_historia_clinica) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
