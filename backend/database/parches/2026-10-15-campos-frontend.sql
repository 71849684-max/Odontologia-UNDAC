-- Columnas y tablas que exigen los formularios del frontend.
-- Idempotente: `php artisan clinica:parches` ignora columnas, índices y tablas ya existentes.

ALTER TABLE paciente MODIFY nombres VARCHAR(180) NOT NULL;

ALTER TABLE paciente_contacto ADD COLUMN informante VARCHAR(180) NULL AFTER nombre;

CREATE TABLE IF NOT EXISTS paciente_familiar (
  id_paciente_familiar BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_paciente BIGINT UNSIGNED NOT NULL,
  parentesco VARCHAR(20) NOT NULL,
  nombre VARCHAR(180) NULL,
  numero_documento VARCHAR(20) NULL,
  telefono VARCHAR(30) NULL,
  ocupacion VARCHAR(120) NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_paciente_familiar),
  UNIQUE KEY uq_paciente_familiar (id_paciente, parentesco),
  CONSTRAINT fk_paciente_familiar_paciente FOREIGN KEY (id_paciente) REFERENCES paciente(id_paciente) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE examen_oclusion ADD COLUMN motivos_perdida VARCHAR(255) NULL AFTER clasificacion_anterior;
ALTER TABLE examen_oclusion ADD COLUMN motivos_perdida_otros VARCHAR(255) NULL AFTER motivos_perdida;
ALTER TABLE examen_oclusion ADD COLUMN ultima_exodoncia TEXT NULL AFTER motivos_perdida_otros;
UPDATE examen_oclusion SET motivos_perdida = mordida, mordida = NULL WHERE motivos_perdida IS NULL AND mordida IS NOT NULL;
UPDATE examen_oclusion SET ultima_exodoncia = observaciones, observaciones = NULL WHERE ultima_exodoncia IS NULL AND observaciones IS NOT NULL;

ALTER TABLE pronostico_clinico ADD COLUMN pronostico_libre TEXT NULL AFTER justificacion;

ALTER TABLE reporte_operatorio ADD COLUMN pronostico TEXT NULL AFTER procedimiento_realizado;
ALTER TABLE reporte_operatorio ADD COLUMN id_archivo_firma_docente BIGINT UNSIGNED NULL AFTER observaciones;
ALTER TABLE reporte_operatorio ADD COLUMN id_archivo_firma_alumno BIGINT UNSIGNED NULL AFTER id_archivo_firma_docente;
ALTER TABLE reporte_operatorio ADD CONSTRAINT fk_reporte_firma_docente FOREIGN KEY (id_archivo_firma_docente) REFERENCES archivo_clinico(id_archivo) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE reporte_operatorio ADD CONSTRAINT fk_reporte_firma_alumno FOREIGN KEY (id_archivo_firma_alumno) REFERENCES archivo_clinico(id_archivo) ON UPDATE CASCADE ON DELETE SET NULL;

ALTER TABLE consentimiento_informado ADD COLUMN domicilio_acto VARCHAR(250) NULL AFTER intervencion_autorizada;
ALTER TABLE consentimiento_informado ADD COLUMN doctor_informante VARCHAR(180) NULL AFTER domicilio_acto;
ALTER TABLE consentimiento_informado ADD COLUMN firma_dia VARCHAR(2) NULL AFTER doctor_informante;
ALTER TABLE consentimiento_informado ADD COLUMN firma_mes VARCHAR(20) NULL AFTER firma_dia;
ALTER TABLE consentimiento_informado ADD COLUMN firma_anio VARCHAR(4) NULL AFTER firma_mes;

ALTER TABLE odontograma ADD COLUMN registro_json LONGTEXT NULL AFTER especificaciones;
UPDATE odontograma SET registro_json = especificaciones, especificaciones = NULL WHERE registro_json IS NULL AND especificaciones LIKE '{%';

ALTER TABLE archivo_clinico ADD COLUMN seccion VARCHAR(60) NULL AFTER categoria;
ALTER TABLE archivo_clinico ADD COLUMN clave_campo VARCHAR(80) NULL AFTER seccion;
ALTER TABLE archivo_clinico ADD COLUMN hash_sha256 CHAR(64) NULL AFTER tamano_bytes;
ALTER TABLE archivo_clinico ADD COLUMN tipo_usuario VARCHAR(20) NULL AFTER descripcion;
ALTER TABLE archivo_clinico ADD COLUMN id_usuario BIGINT UNSIGNED NULL AFTER tipo_usuario;
ALTER TABLE archivo_clinico ADD KEY idx_archivo_campo (id_historia_clinica, seccion, clave_campo, estado);

CREATE TABLE IF NOT EXISTS usuario_alumno_submodulo (
  id_usuario_alumno_submodulo BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_usuario_alumno BIGINT UNSIGNED NOT NULL,
  id_submodulo BIGINT UNSIGNED NOT NULL,
  permitido TINYINT(1) NOT NULL DEFAULT 1,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_usuario_alumno_submodulo),
  UNIQUE KEY uq_usuario_alumno_submodulo (id_usuario_alumno, id_submodulo),
  CONSTRAINT fk_uas_usuario FOREIGN KEY (id_usuario_alumno) REFERENCES usuario_alumno(id_usuario_alumno) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_uas_submodulo FOREIGN KEY (id_submodulo) REFERENCES submodulo(id_submodulo) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS usuario_docente_submodulo (
  id_usuario_docente_submodulo BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_usuario_docente BIGINT UNSIGNED NOT NULL,
  id_submodulo BIGINT UNSIGNED NOT NULL,
  permitido TINYINT(1) NOT NULL DEFAULT 1,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_usuario_docente_submodulo),
  UNIQUE KEY uq_usuario_docente_submodulo (id_usuario_docente, id_submodulo),
  CONSTRAINT fk_uds_usuario FOREIGN KEY (id_usuario_docente) REFERENCES usuario_docente(id_usuario_docente) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_uds_submodulo FOREIGN KEY (id_submodulo) REFERENCES submodulo(id_submodulo) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO configuracion_sistema (clave, valor, descripcion, estado) VALUES
('FACULTAD', 'Facultad de Odontología', 'Facultad mostrada en documentos e impresiones.', 1),
('TIPO_DENTICION_POR_DEFECTO', 'PERMANENTE', 'Dentición con la que abre el odontograma.', 1),
('TAMANO_MAXIMO_ARCHIVO_KB', '10240', 'Tamaño máximo por archivo clínico adjunto (KB).', 1);
