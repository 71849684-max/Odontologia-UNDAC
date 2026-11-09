ALTER TABLE historia_seccion_estado ADD COLUMN id_version_aprobada BIGINT UNSIGNED NULL;
ALTER TABLE historia_seccion_estado ADD CONSTRAINT fk_seccion_version_aprobada FOREIGN KEY (id_version_aprobada) REFERENCES historia_documento_version(id_version) ON UPDATE RESTRICT ON DELETE RESTRICT;
