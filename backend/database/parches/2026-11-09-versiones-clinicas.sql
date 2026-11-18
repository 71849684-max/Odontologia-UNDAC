CREATE TABLE IF NOT EXISTS historia_documento_version (
  id_version BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  id_historia_clinica BIGINT UNSIGNED NOT NULL,
  clase VARCHAR(40) NOT NULL,
  evento VARCHAR(40) NOT NULL,
  tipo_usuario VARCHAR(20) NOT NULL,
  id_usuario BIGINT UNSIGNED NOT NULL,
  nombre_usuario VARCHAR(190) NOT NULL,
  contenido LONGTEXT NOT NULL,
  motivo VARCHAR(1000) NULL,
  hash_anterior CHAR(64) NOT NULL,
  hash_integridad CHAR(64) NOT NULL,
  creado_en DATETIME(6) NOT NULL,
  INDEX ix_version_historia (id_historia_clinica, id_version)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TRIGGER IF NOT EXISTS proteger_version_actualizacion BEFORE UPDATE ON historia_documento_version FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Las versiones clínicas conservadas no se pueden modificar';
CREATE TRIGGER IF NOT EXISTS proteger_version_eliminacion BEFORE DELETE ON historia_documento_version FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Las versiones clínicas conservadas no se pueden eliminar';
