-- =============================================================
-- BD CLINICA ODONTOLOGICA UNDAC - MODELO V2.3
-- Generado para MySQL/MariaDB con importación compatible con phpMyAdmin
-- Fecha: 2026-10-06
--
-- Este script elimina y recrea la base de datos desde cero.
-- Realice una copia de seguridad antes de ejecutarlo sobre datos reales.
-- =============================================================

SET NAMES utf8mb4;
SET time_zone = '-05:00';
SET FOREIGN_KEY_CHECKS = 0;

DROP DATABASE IF EXISTS bd_clinica_undac;
CREATE DATABASE bd_clinica_undac
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE bd_clinica_undac;

DROP VIEW IF EXISTS vista_historia_resumen;
DROP VIEW IF EXISTS vista_historia_periodos;
DROP VIEW IF EXISTS vista_usuarios_sistema;
DROP VIEW IF EXISTS vista_accesos_rol;

DROP TRIGGER IF EXISTS trg_usuario_alumno_bi;
DROP TRIGGER IF EXISTS trg_usuario_alumno_bu;
DROP TRIGGER IF EXISTS trg_usuario_docente_bi;
DROP TRIGGER IF EXISTS trg_usuario_docente_bu;
DROP TRIGGER IF EXISTS trg_historia_estado_ai;
DROP TRIGGER IF EXISTS trg_historia_estado_au;
DROP TRIGGER IF EXISTS trg_historia_docente_bi;
DROP TRIGGER IF EXISTS trg_historia_docente_bu;

DROP TABLE IF EXISTS `auditoria`;
DROP TABLE IF EXISTS `configuracion_sistema`;
DROP TABLE IF EXISTS `epicrisis`;
DROP TABLE IF EXISTS `alta_clinica`;
DROP TABLE IF EXISTS `firma_seguimiento`;
DROP TABLE IF EXISTS `seguimiento_quirurgico`;
DROP TABLE IF EXISTS `prescripcion`;
DROP TABLE IF EXISTS `signo_vital_operatorio`;
DROP TABLE IF EXISTS `reporte_operatorio`;
DROP TABLE IF EXISTS `programacion_cirugia`;
DROP TABLE IF EXISTS `etapa_quirurgica`;
DROP TABLE IF EXISTS `plan_quirurgico`;
DROP TABLE IF EXISTS `firma_consentimiento`;
DROP TABLE IF EXISTS `consentimiento_clausula`;
DROP TABLE IF EXISTS `consentimiento_informado`;
DROP TABLE IF EXISTS `protesis`;
DROP TABLE IF EXISTS `plan_tratamiento_item`;
DROP TABLE IF EXISTS `fase_tratamiento`;
DROP TABLE IF EXISTS `plan_tratamiento`;
DROP TABLE IF EXISTS `catalogo_tratamiento_dental`;
DROP TABLE IF EXISTS `perdida_dental`;
DROP TABLE IF EXISTS `odontograma_hallazgo_pieza`;
DROP TABLE IF EXISTS `odontograma_hallazgo`;
DROP TABLE IF EXISTS `odontograma_superficie`;
DROP TABLE IF EXISTS `odontograma_pieza`;
DROP TABLE IF EXISTS `odontograma`;
DROP TABLE IF EXISTS `catalogo_hallazgo_dental`;
DROP TABLE IF EXISTS `pieza_dental`;
DROP TABLE IF EXISTS `pronostico_clinico`;
DROP TABLE IF EXISTS `diagnostico`;
DROP TABLE IF EXISTS `estudio_modelo`;
DROP TABLE IF EXISTS `evolucion_clinica`;
DROP TABLE IF EXISTS `archivo_clinico`;
DROP TABLE IF EXISTS `examen_auxiliar`;
DROP TABLE IF EXISTS `examen_oclusion`;
DROP TABLE IF EXISTS `hallazgo_estomatologico`;
DROP TABLE IF EXISTS `examen_estomatologico`;
DROP TABLE IF EXISTS `examen_clinico_general`;
DROP TABLE IF EXISTS `antecedente_familiar`;
DROP TABLE IF EXISTS `antecedente_exodoncia`;
DROP TABLE IF EXISTS `antecedente_anestesia`;
DROP TABLE IF EXISTS `antecedente_terapeutico`;
DROP TABLE IF EXISTS `antecedente_fisiologico`;
DROP TABLE IF EXISTS `antecedente_habito_nocivo`;
DROP TABLE IF EXISTS `antecedente_personal`;
DROP TABLE IF EXISTS `antecedente`;
DROP TABLE IF EXISTS `respuesta_salud`;
DROP TABLE IF EXISTS `pregunta_salud`;
DROP TABLE IF EXISTS `anamnesis_estado_psicologico`;
DROP TABLE IF EXISTS `anamnesis`;
DROP TABLE IF EXISTS `historia_seccion_estado`;
DROP TABLE IF EXISTS `historia_clinica_estado_historial`;
DROP TABLE IF EXISTS `historia_alumno`;
DROP TABLE IF EXISTS `historia_docente`;
DROP TABLE IF EXISTS `historia_clinica`;
DROP TABLE IF EXISTS `estado_historia_clinica`;
DROP TABLE IF EXISTS `rotacion_alumno`;
DROP TABLE IF EXISTS `rotacion_docente`;
DROP TABLE IF EXISTS `rotacion`;
DROP TABLE IF EXISTS `grupo_miembro`;
DROP TABLE IF EXISTS `grupo_academico`;
DROP TABLE IF EXISTS `curso`;
DROP TABLE IF EXISTS `alumno_periodo`;
DROP TABLE IF EXISTS `periodo_academico`;
DROP TABLE IF EXISTS `paciente_contacto`;
DROP TABLE IF EXISTS `paciente`;
DROP TABLE IF EXISTS `login_historial_docente`;
DROP TABLE IF EXISTS `login_historial_alumno`;
DROP TABLE IF EXISTS `usuario_docente`;
DROP TABLE IF EXISTS `usuario_alumno`;
DROP TABLE IF EXISTS `rol_submodulo`;
DROP TABLE IF EXISTS `submodulo`;
DROP TABLE IF EXISTS `modulo`;
DROP TABLE IF EXISTS `rol`;
DROP TABLE IF EXISTS `docente`;
DROP TABLE IF EXISTS `alumno`;

-- =============================================================
-- ACTORES Y SEGURIDAD
-- =============================================================

CREATE TABLE alumno (
  id_alumno BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  codigo_alumno VARCHAR(30) NOT NULL,
  tipo_documento VARCHAR(20) NOT NULL DEFAULT 'DNI',
  numero_documento VARCHAR(20) NOT NULL,
  nombres VARCHAR(100) NOT NULL,
  apellidos VARCHAR(120) NOT NULL,
  fecha_nacimiento DATE NULL,
  sexo CHAR(1) NULL,
  telefono VARCHAR(30) NULL,
  correo VARCHAR(150) NULL,
  direccion VARCHAR(250) NULL,
  estado TINYINT(1) NOT NULL DEFAULT 1,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_alumno),
  UNIQUE KEY uq_alumno_codigo (codigo_alumno),
  UNIQUE KEY uq_alumno_documento (tipo_documento, numero_documento),
  KEY idx_alumno_nombre (apellidos, nombres)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE docente (
  id_docente BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  codigo_docente VARCHAR(30) NOT NULL,
  tipo_documento VARCHAR(20) NOT NULL DEFAULT 'DNI',
  numero_documento VARCHAR(20) NOT NULL,
  nombres VARCHAR(100) NOT NULL,
  apellidos VARCHAR(120) NOT NULL,
  fecha_nacimiento DATE NULL,
  sexo CHAR(1) NULL,
  telefono VARCHAR(30) NULL,
  correo VARCHAR(150) NULL,
  direccion VARCHAR(250) NULL,
  numero_colegiatura VARCHAR(30) NULL,
  especialidad VARCHAR(120) NULL,
  estado TINYINT(1) NOT NULL DEFAULT 1,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_docente),
  UNIQUE KEY uq_docente_codigo (codigo_docente),
  UNIQUE KEY uq_docente_documento (tipo_documento, numero_documento),
  UNIQUE KEY uq_docente_colegiatura (numero_colegiatura),
  KEY idx_docente_nombre (apellidos, nombres)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE rol (
  id_rol BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  codigo_rol VARCHAR(50) NOT NULL,
  nombre_rol VARCHAR(100) NOT NULL,
  tipo_usuario VARCHAR(20) NOT NULL COMMENT 'ALUMNO o DOCENTE; filtra los roles disponibles al crear una cuenta',
  descripcion VARCHAR(255) NULL,
  estado TINYINT(1) NOT NULL DEFAULT 1,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_rol),
  UNIQUE KEY uq_rol_codigo (codigo_rol),
  UNIQUE KEY uq_rol_tipo_nombre (tipo_usuario, nombre_rol),
  KEY idx_rol_tipo_estado (tipo_usuario, estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE modulo (
  id_modulo BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  codigo_modulo VARCHAR(60) NOT NULL,
  nombre_modulo VARCHAR(120) NOT NULL,
  descripcion VARCHAR(255) NULL,
  icono VARCHAR(80) NULL,
  ruta VARCHAR(180) NULL,
  orden INT NOT NULL DEFAULT 0,
  estado TINYINT(1) NOT NULL DEFAULT 1,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_modulo),
  UNIQUE KEY uq_modulo_codigo (codigo_modulo),
  UNIQUE KEY uq_modulo_nombre (nombre_modulo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE submodulo (
  id_submodulo BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_modulo BIGINT UNSIGNED NOT NULL,
  codigo_submodulo VARCHAR(80) NOT NULL,
  nombre_submodulo VARCHAR(120) NOT NULL,
  descripcion VARCHAR(255) NULL,
  ruta VARCHAR(180) NULL,
  orden INT NOT NULL DEFAULT 0,
  estado TINYINT(1) NOT NULL DEFAULT 1,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_submodulo),
  UNIQUE KEY uq_submodulo_modulo_codigo (id_modulo, codigo_submodulo),
  KEY idx_submodulo_modulo (id_modulo, estado, orden),
  CONSTRAINT fk_submodulo_modulo FOREIGN KEY (id_modulo) REFERENCES modulo(id_modulo) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE rol_submodulo (
  id_rol_submodulo BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_rol BIGINT UNSIGNED NOT NULL,
  id_submodulo BIGINT UNSIGNED NOT NULL,
  estado TINYINT(1) NOT NULL DEFAULT 1,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_rol_submodulo),
  UNIQUE KEY uq_rol_submodulo (id_rol, id_submodulo),
  KEY idx_rol_submodulo_submodulo (id_submodulo, estado),
  CONSTRAINT fk_rol_submodulo_rol FOREIGN KEY (id_rol) REFERENCES rol(id_rol) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_rol_submodulo_submodulo FOREIGN KEY (id_submodulo) REFERENCES submodulo(id_submodulo) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE usuario_alumno (
  id_usuario_alumno BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_alumno BIGINT UNSIGNED NOT NULL,
  id_rol BIGINT UNSIGNED NOT NULL,
  nombre_usuario VARCHAR(120) NOT NULL,
  contrasena_hash VARCHAR(255) NOT NULL,
  estado TINYINT(1) NOT NULL DEFAULT 1,
  ultimo_inicio_sesion DATETIME NULL,
  contrasena_cambiada_en DATETIME NULL,
  intentos_fallidos SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  bloqueado_hasta DATETIME NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_usuario_alumno),
  UNIQUE KEY uq_usuario_alumno_nombre (nombre_usuario),
  KEY idx_usuario_alumno_alumno (id_alumno, estado),
  KEY idx_usuario_alumno_rol (id_rol, estado),
  CONSTRAINT fk_usuario_alumno_alumno FOREIGN KEY (id_alumno) REFERENCES alumno(id_alumno) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_usuario_alumno_rol FOREIGN KEY (id_rol) REFERENCES rol(id_rol) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE usuario_docente (
  id_usuario_docente BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_docente BIGINT UNSIGNED NOT NULL,
  id_rol BIGINT UNSIGNED NOT NULL,
  nombre_usuario VARCHAR(120) NOT NULL,
  contrasena_hash VARCHAR(255) NOT NULL,
  estado TINYINT(1) NOT NULL DEFAULT 1,
  ultimo_inicio_sesion DATETIME NULL,
  contrasena_cambiada_en DATETIME NULL,
  intentos_fallidos SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  bloqueado_hasta DATETIME NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_usuario_docente),
  UNIQUE KEY uq_usuario_docente_nombre (nombre_usuario),
  KEY idx_usuario_docente_docente (id_docente, estado),
  KEY idx_usuario_docente_rol (id_rol, estado),
  CONSTRAINT fk_usuario_docente_docente FOREIGN KEY (id_docente) REFERENCES docente(id_docente) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_usuario_docente_rol FOREIGN KEY (id_rol) REFERENCES rol(id_rol) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE login_historial_alumno (
  id_login_alumno BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_usuario_alumno BIGINT UNSIGNED NULL,
  nombre_usuario VARCHAR(120) NOT NULL,
  direccion_ip VARCHAR(45) NULL,
  agente_usuario VARCHAR(500) NULL,
  exito TINYINT(1) NOT NULL,
  motivo_fallo VARCHAR(255) NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_login_alumno),
  KEY idx_login_alumno_usuario_fecha (id_usuario_alumno, creado_en),
  KEY idx_login_alumno_nombre_fecha (nombre_usuario, creado_en),
  KEY idx_login_alumno_fecha (creado_en),
  CONSTRAINT fk_login_alumno_usuario FOREIGN KEY (id_usuario_alumno) REFERENCES usuario_alumno(id_usuario_alumno) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE login_historial_docente (
  id_login_docente BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_usuario_docente BIGINT UNSIGNED NULL,
  nombre_usuario VARCHAR(120) NOT NULL,
  direccion_ip VARCHAR(45) NULL,
  agente_usuario VARCHAR(500) NULL,
  exito TINYINT(1) NOT NULL,
  motivo_fallo VARCHAR(255) NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_login_docente),
  KEY idx_login_docente_usuario_fecha (id_usuario_docente, creado_en),
  KEY idx_login_docente_nombre_fecha (nombre_usuario, creado_en),
  KEY idx_login_docente_fecha (creado_en),
  CONSTRAINT fk_login_docente_usuario FOREIGN KEY (id_usuario_docente) REFERENCES usuario_docente(id_usuario_docente) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- PACIENTES
-- =============================================================

CREATE TABLE paciente (
  id_paciente BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  tipo_documento VARCHAR(20) NOT NULL DEFAULT 'DNI',
  numero_documento VARCHAR(20) NOT NULL,
  nombres VARCHAR(100) NOT NULL,
  apellidos VARCHAR(120) NOT NULL,
  fecha_nacimiento DATE NULL,
  sexo CHAR(1) NULL,
  lugar_nacimiento VARCHAR(150) NULL,
  telefono VARCHAR(30) NULL,
  correo VARCHAR(150) NULL,
  direccion VARCHAR(250) NULL,
  ocupacion VARCHAR(120) NULL,
  procedencia VARCHAR(150) NULL,
  estado_civil VARCHAR(40) NULL,
  grado_instruccion VARCHAR(40) NULL,
  centro_estudios VARCHAR(150) NULL,
  idioma_materno VARCHAR(80) NULL,
  religion VARCHAR(80) NULL,
  lugar_trabajo VARCHAR(150) NULL,
  tiempo_residencia VARCHAR(80) NULL,
  modalidad_asistencia VARCHAR(30) NULL,
  departamento VARCHAR(80) NULL,
  provincia VARCHAR(80) NULL,
  distrito VARCHAR(80) NULL,
  direccion_alternativa VARCHAR(250) NULL,
  telefono_adicional VARCHAR(30) NULL,
  observaciones TEXT NULL,
  estado_atencion VARCHAR(40) NOT NULL DEFAULT 'Registrado',
  estado TINYINT(1) NOT NULL DEFAULT 1,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  eliminado_en DATETIME NULL,
  PRIMARY KEY (id_paciente),
  UNIQUE KEY uq_paciente_documento (tipo_documento, numero_documento),
  KEY idx_paciente_nombre (apellidos, nombres),
  KEY idx_paciente_estado_atencion (estado_atencion, estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE paciente_contacto (
  id_paciente_contacto BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_paciente BIGINT UNSIGNED NOT NULL,
  tipo_contacto VARCHAR(40) NOT NULL DEFAULT 'OTRO',
  nombre VARCHAR(180) NOT NULL,
  parentesco VARCHAR(80) NULL,
  telefono VARCHAR(30) NULL,
  numero_documento VARCHAR(20) NULL,
  ocupacion VARCHAR(120) NULL,
  direccion VARCHAR(250) NULL,
  confiabilidad VARCHAR(40) NULL,
  es_principal TINYINT(1) NOT NULL DEFAULT 0,
  estado TINYINT(1) NOT NULL DEFAULT 1,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_paciente_contacto),
  KEY idx_contacto_paciente (id_paciente, estado),
  CONSTRAINT fk_contacto_paciente FOREIGN KEY (id_paciente) REFERENCES paciente(id_paciente) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- ESTRUCTURA ACADEMICA
-- =============================================================

CREATE TABLE periodo_academico (
  id_periodo_academico BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  codigo VARCHAR(30) NOT NULL,
  nombre VARCHAR(120) NOT NULL,
  anio SMALLINT UNSIGNED NOT NULL,
  semestre VARCHAR(20) NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  estado TINYINT(1) NOT NULL DEFAULT 1,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_periodo_academico),
  UNIQUE KEY uq_periodo_codigo (codigo),
  UNIQUE KEY uq_periodo_anio_semestre (anio, semestre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE alumno_periodo (
  id_alumno_periodo BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_alumno BIGINT UNSIGNED NOT NULL,
  id_periodo_academico BIGINT UNSIGNED NOT NULL,
  ciclo VARCHAR(30) NULL,
  estado TINYINT(1) NOT NULL DEFAULT 1,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_alumno_periodo),
  UNIQUE KEY uq_alumno_periodo (id_alumno, id_periodo_academico),
  KEY idx_alumno_periodo_periodo (id_periodo_academico, estado),
  CONSTRAINT fk_alumno_periodo_alumno FOREIGN KEY (id_alumno) REFERENCES alumno(id_alumno) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_alumno_periodo_periodo FOREIGN KEY (id_periodo_academico) REFERENCES periodo_academico(id_periodo_academico) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE curso (
  id_curso BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  codigo VARCHAR(30) NOT NULL,
  nombre VARCHAR(120) NOT NULL,
  descripcion VARCHAR(255) NULL,
  estado TINYINT(1) NOT NULL DEFAULT 1,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_curso),
  UNIQUE KEY uq_curso_codigo (codigo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE grupo_academico (
  id_grupo BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  codigo VARCHAR(30) NOT NULL,
  nombre VARCHAR(120) NOT NULL,
  semestre VARCHAR(30) NOT NULL,
  estado TINYINT(1) NOT NULL DEFAULT 1,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_grupo),
  UNIQUE KEY uq_grupo_codigo (codigo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE grupo_miembro (
  id_grupo_miembro BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_grupo BIGINT UNSIGNED NOT NULL,
  id_alumno BIGINT UNSIGNED NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'ACTIVA',
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_grupo_miembro),
  UNIQUE KEY uq_grupo_miembro_inicio (id_grupo, id_alumno, fecha_inicio),
  KEY idx_grupo_miembro_alumno (id_alumno, estado, fecha_fin),
  CONSTRAINT fk_grupo_miembro_grupo FOREIGN KEY (id_grupo) REFERENCES grupo_academico(id_grupo) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_grupo_miembro_alumno FOREIGN KEY (id_alumno) REFERENCES alumno(id_alumno) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE rotacion (
  id_rotacion BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_grupo BIGINT UNSIGNED NOT NULL,
  id_curso BIGINT UNSIGNED NOT NULL,
  id_periodo_academico BIGINT UNSIGNED NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  estado VARCHAR(30) NOT NULL DEFAULT 'PROGRAMADA',
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_rotacion),
  KEY idx_rotacion_grupo_periodo (id_grupo, id_periodo_academico),
  KEY idx_rotacion_curso_periodo (id_curso, id_periodo_academico),
  CONSTRAINT fk_rotacion_grupo FOREIGN KEY (id_grupo) REFERENCES grupo_academico(id_grupo) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_rotacion_curso FOREIGN KEY (id_curso) REFERENCES curso(id_curso) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_rotacion_periodo FOREIGN KEY (id_periodo_academico) REFERENCES periodo_academico(id_periodo_academico) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE rotacion_docente (
  id_rotacion_docente BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_rotacion BIGINT UNSIGNED NOT NULL,
  id_docente BIGINT UNSIGNED NOT NULL,
  funcion VARCHAR(40) NOT NULL DEFAULT 'COLABORADOR',
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_rotacion_docente),
  UNIQUE KEY uq_rotacion_docente (id_rotacion, id_docente),
  CONSTRAINT fk_rotacion_docente_rotacion FOREIGN KEY (id_rotacion) REFERENCES rotacion(id_rotacion) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_rotacion_docente_docente FOREIGN KEY (id_docente) REFERENCES docente(id_docente) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE rotacion_alumno (
  id_rotacion_alumno BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_rotacion BIGINT UNSIGNED NOT NULL,
  id_alumno BIGINT UNSIGNED NOT NULL,
  tipo_asignacion VARCHAR(30) NOT NULL DEFAULT 'EXCEPCIONAL',
  fecha_inicio DATE NULL,
  fecha_fin DATE NULL,
  estado TINYINT(1) NOT NULL DEFAULT 1,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_rotacion_alumno),
  UNIQUE KEY uq_rotacion_alumno (id_rotacion, id_alumno),
  CONSTRAINT fk_rotacion_alumno_rotacion FOREIGN KEY (id_rotacion) REFERENCES rotacion(id_rotacion) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_rotacion_alumno_alumno FOREIGN KEY (id_alumno) REFERENCES alumno(id_alumno) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- HISTORIA CLINICA, ESTADOS Y ASIGNACIONES
-- =============================================================

CREATE TABLE estado_historia_clinica (
  id_estado_historia SMALLINT UNSIGNED NOT NULL AUTO_INCREMENT,
  codigo VARCHAR(40) NOT NULL,
  nombre VARCHAR(60) NOT NULL,
  descripcion VARCHAR(255) NULL,
  orden TINYINT UNSIGNED NOT NULL DEFAULT 0,
  es_final TINYINT(1) NOT NULL DEFAULT 0,
  estado TINYINT(1) NOT NULL DEFAULT 1,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_estado_historia),
  UNIQUE KEY uq_estado_historia_codigo (codigo),
  UNIQUE KEY uq_estado_historia_nombre (nombre),
  KEY idx_estado_historia_orden (estado, orden)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE historia_clinica (
  id_historia_clinica BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  numero_historia VARCHAR(30) NOT NULL,
  id_paciente BIGINT UNSIGNED NOT NULL,
  id_periodo_academico BIGINT UNSIGNED NOT NULL,
  id_estado_historia SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  fecha_apertura DATE NOT NULL,
  fecha_cierre DATE NULL,
  tipo_atencion VARCHAR(40) NULL,
  motivo_consulta TEXT NULL,
  observaciones TEXT NULL,
  creado_por_tipo VARCHAR(20) NULL,
  creado_por_id BIGINT UNSIGNED NULL,
  actualizado_por_tipo VARCHAR(20) NULL,
  actualizado_por_id BIGINT UNSIGNED NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  anulado_en DATETIME NULL,
  motivo_anulacion VARCHAR(255) NULL,
  PRIMARY KEY (id_historia_clinica),
  UNIQUE KEY uq_historia_numero (numero_historia),
  KEY idx_historia_paciente_estado (id_paciente, id_estado_historia),
  KEY idx_historia_periodo_estado (id_periodo_academico, id_estado_historia),
  KEY idx_historia_actualizado (actualizado_en),
  CONSTRAINT fk_historia_paciente FOREIGN KEY (id_paciente) REFERENCES paciente(id_paciente) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_historia_periodo FOREIGN KEY (id_periodo_academico) REFERENCES periodo_academico(id_periodo_academico) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_historia_estado FOREIGN KEY (id_estado_historia) REFERENCES estado_historia_clinica(id_estado_historia) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE historia_clinica_estado_historial (
  id_historial_estado BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_historia_clinica BIGINT UNSIGNED NOT NULL,
  id_estado_historia SMALLINT UNSIGNED NOT NULL,
  fecha_estado DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  observacion VARCHAR(500) NULL,
  tipo_usuario VARCHAR(20) NULL,
  id_usuario BIGINT UNSIGNED NULL,
  PRIMARY KEY (id_historial_estado),
  KEY idx_historial_estado_historia_fecha (id_historia_clinica, fecha_estado),
  KEY idx_historial_estado_estado_fecha (id_estado_historia, fecha_estado),
  CONSTRAINT fk_historial_estado_historia FOREIGN KEY (id_historia_clinica) REFERENCES historia_clinica(id_historia_clinica) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_historial_estado_catalogo FOREIGN KEY (id_estado_historia) REFERENCES estado_historia_clinica(id_estado_historia) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE historia_docente (
  id_historia_docente BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_historia_clinica BIGINT UNSIGNED NOT NULL,
  id_docente BIGINT UNSIGNED NOT NULL,
  tipo_participacion VARCHAR(30) NOT NULL DEFAULT 'COLABORADOR',
  fecha_asignacion DATE NOT NULL,
  fecha_fin DATE NULL,
  estado TINYINT(1) NOT NULL DEFAULT 1,
  asignado_por_tipo VARCHAR(20) NULL,
  asignado_por_id BIGINT UNSIGNED NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_historia_docente),
  UNIQUE KEY uq_historia_docente_inicio (id_historia_clinica, id_docente, fecha_asignacion),
  KEY idx_historia_docente_docente (id_docente, estado, fecha_fin),
  KEY idx_historia_docente_historia (id_historia_clinica, estado, tipo_participacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE historia_docente
  ADD CONSTRAINT fk_hd_historia FOREIGN KEY (id_historia_clinica)
    REFERENCES historia_clinica (id_historia_clinica) ON DELETE RESTRICT,
  ADD CONSTRAINT fk_hd_docente FOREIGN KEY (id_docente)
    REFERENCES docente (id_docente) ON DELETE RESTRICT;

CREATE TABLE historia_alumno (
  id_historia_alumno BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_historia_clinica BIGINT UNSIGNED NOT NULL,
  id_alumno BIGINT UNSIGNED NOT NULL,
  tipo_participacion VARCHAR(30) NOT NULL DEFAULT 'OPERADOR',
  fecha_asignacion DATE NOT NULL,
  fecha_fin DATE NULL,
  estado TINYINT(1) NOT NULL DEFAULT 1,
  asignado_por_tipo VARCHAR(20) NULL,
  asignado_por_id BIGINT UNSIGNED NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_historia_alumno),
  UNIQUE KEY uq_historia_alumno_inicio (id_historia_clinica, id_alumno, fecha_asignacion),
  KEY idx_historia_alumno_alumno (id_alumno, estado, fecha_fin),
  CONSTRAINT fk_historia_alumno_historia FOREIGN KEY (id_historia_clinica) REFERENCES historia_clinica(id_historia_clinica) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_historia_alumno_alumno FOREIGN KEY (id_alumno) REFERENCES alumno(id_alumno) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE historia_seccion_estado (
  id_historia_seccion_estado BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_historia_clinica BIGINT UNSIGNED NOT NULL,
  codigo_seccion VARCHAR(80) NOT NULL,
  estado VARCHAR(30) NOT NULL DEFAULT 'Pendiente',
  tipo_usuario VARCHAR(20) NULL,
  id_usuario BIGINT UNSIGNED NULL,
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_historia_seccion_estado),
  UNIQUE KEY uq_historia_seccion (id_historia_clinica, codigo_seccion),
  KEY idx_seccion_estado (codigo_seccion, estado),
  CONSTRAINT fk_seccion_estado_historia FOREIGN KEY (id_historia_clinica) REFERENCES historia_clinica(id_historia_clinica) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- ANAMNESIS, SALUD Y ANTECEDENTES
-- =============================================================

CREATE TABLE anamnesis (
  id_anamnesis BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_historia_clinica BIGINT UNSIGNED NOT NULL,
  enfermedad_actual TEXT NULL,
  motivo_consulta TEXT NULL,
  estado_general VARCHAR(20) NULL,
  ectoscopia TEXT NULL,
  ultima_visita_dentista VARCHAR(120) NULL,
  motivo_visita_dentista TEXT NULL,
  observaciones TEXT NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_anamnesis),
  UNIQUE KEY uq_anamnesis_historia (id_historia_clinica),
  CONSTRAINT fk_anamnesis_historia FOREIGN KEY (id_historia_clinica) REFERENCES historia_clinica(id_historia_clinica) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE anamnesis_estado_psicologico (
  id_anamnesis_estado BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_anamnesis BIGINT UNSIGNED NOT NULL,
  estado VARCHAR(40) NOT NULL,
  PRIMARY KEY (id_anamnesis_estado),
  UNIQUE KEY uq_anamnesis_estado (id_anamnesis, estado),
  CONSTRAINT fk_anamnesis_estado_anamnesis FOREIGN KEY (id_anamnesis) REFERENCES anamnesis(id_anamnesis) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE pregunta_salud (
  id_pregunta BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  numero SMALLINT UNSIGNED NOT NULL,
  pregunta VARCHAR(500) NOT NULL,
  orden SMALLINT UNSIGNED NOT NULL,
  requiere_detalle TINYINT(1) NOT NULL DEFAULT 1,
  requiere_detalle_adicional TINYINT(1) NOT NULL DEFAULT 0,
  estado TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (id_pregunta),
  UNIQUE KEY uq_pregunta_numero (numero),
  UNIQUE KEY uq_pregunta_orden (orden)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE respuesta_salud (
  id_respuesta_salud BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_historia_clinica BIGINT UNSIGNED NOT NULL,
  id_pregunta BIGINT UNSIGNED NOT NULL,
  respuesta TINYINT(1) NOT NULL,
  detalle TEXT NULL,
  detalle_adicional TEXT NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_respuesta_salud),
  UNIQUE KEY uq_respuesta_historia_pregunta (id_historia_clinica, id_pregunta),
  CONSTRAINT fk_respuesta_historia FOREIGN KEY (id_historia_clinica) REFERENCES historia_clinica(id_historia_clinica) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_respuesta_pregunta FOREIGN KEY (id_pregunta) REFERENCES pregunta_salud(id_pregunta) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE antecedente (
  id_antecedente BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_historia_clinica BIGINT UNSIGNED NOT NULL,
  tipo_antecedente VARCHAR(60) NOT NULL,
  descripcion TEXT NOT NULL,
  fecha_antecedente DATE NULL,
  observaciones TEXT NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_antecedente),
  KEY idx_antecedente_historia_tipo (id_historia_clinica, tipo_antecedente),
  CONSTRAINT fk_antecedente_historia FOREIGN KEY (id_historia_clinica) REFERENCES historia_clinica(id_historia_clinica) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE antecedente_personal (
  id_antecedente_personal BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_historia_clinica BIGINT UNSIGNED NOT NULL,
  hijos_numero SMALLINT UNSIGNED NULL,
  hijos_vivos SMALLINT UNSIGNED NULL,
  hijos_fallecidos SMALLINT UNSIGNED NULL,
  ningun_hijo TINYINT(1) NULL,
  vivienda VARCHAR(40) NULL,
  vivienda_otros VARCHAR(150) NULL,
  material_vivienda VARCHAR(40) NULL,
  material_otros VARCHAR(150) NULL,
  viajes VARCHAR(40) NULL,
  viajes_otros VARCHAR(150) NULL,
  alimentacion VARCHAR(80) NULL,
  alimentacion_otros VARCHAR(150) NULL,
  inmunizaciones TINYINT(1) NULL,
  situacion_socioeconomica VARCHAR(30) NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_antecedente_personal),
  UNIQUE KEY uq_antecedente_personal_historia (id_historia_clinica),
  CONSTRAINT fk_antecedente_personal_historia FOREIGN KEY (id_historia_clinica) REFERENCES historia_clinica(id_historia_clinica) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE antecedente_habito_nocivo (
  id_antecedente_habito BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_antecedente_personal BIGINT UNSIGNED NOT NULL,
  tipo_habito VARCHAR(40) NOT NULL,
  detalle VARCHAR(255) NULL,
  PRIMARY KEY (id_antecedente_habito),
  UNIQUE KEY uq_antecedente_habito (id_antecedente_personal, tipo_habito),
  CONSTRAINT fk_habito_antecedente_personal FOREIGN KEY (id_antecedente_personal) REFERENCES antecedente_personal(id_antecedente_personal) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE antecedente_fisiologico (
  id_antecedente_fisiologico BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_historia_clinica BIGINT UNSIGNED NOT NULL,
  prenatal VARCHAR(40) NULL,
  prenatal_detalle VARCHAR(255) NULL,
  natal VARCHAR(40) NULL,
  natal_detalle VARCHAR(255) NULL,
  lactancia VARCHAR(40) NULL,
  lactancia_otros VARCHAR(150) NULL,
  menarquia VARCHAR(40) NULL,
  menstruacion_caracteristicas VARCHAR(80) NULL,
  menstruacion_final VARCHAR(40) NULL,
  gestacion TINYINT(1) NULL,
  gestacion_tiempo VARCHAR(80) NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_antecedente_fisiologico),
  UNIQUE KEY uq_antecedente_fisiologico_historia (id_historia_clinica),
  CONSTRAINT fk_antecedente_fisiologico_historia FOREIGN KEY (id_historia_clinica) REFERENCES historia_clinica(id_historia_clinica) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE antecedente_terapeutico (
  id_antecedente_terapeutico BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_historia_clinica BIGINT UNSIGNED NOT NULL,
  alergia_medicamento TINYINT(1) NULL,
  alergia_medicamento_detalle VARCHAR(255) NULL,
  medicacion_anterior_nombre VARCHAR(180) NULL,
  medicacion_anterior_dosis VARCHAR(120) NULL,
  medicacion_actual TINYINT(1) NULL,
  medicacion_actual_nombre VARCHAR(180) NULL,
  medicacion_actual_dosis VARCHAR(120) NULL,
  medicacion_actual_motivo VARCHAR(255) NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_antecedente_terapeutico),
  UNIQUE KEY uq_antecedente_terapeutico_historia (id_historia_clinica),
  CONSTRAINT fk_antecedente_terapeutico_historia FOREIGN KEY (id_historia_clinica) REFERENCES historia_clinica(id_historia_clinica) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE antecedente_anestesia (
  id_antecedente_anestesia BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_historia_clinica BIGINT UNSIGNED NOT NULL,
  anestesia_total TINYINT(1) NULL,
  tipo_intervencion VARCHAR(255) NULL,
  reaccion_anestesia VARCHAR(80) NULL,
  reaccion_detalle TEXT NULL,
  hemorragia_intervencion TINYINT(1) NULL,
  hemorragia_dias VARCHAR(40) NULL,
  cicatrizacion VARCHAR(60) NULL,
  cicatrizacion_otros VARCHAR(255) NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_antecedente_anestesia),
  KEY idx_antecedente_anestesia_historia (id_historia_clinica),
  CONSTRAINT fk_antecedente_anestesia_historia FOREIGN KEY (id_historia_clinica) REFERENCES historia_clinica(id_historia_clinica) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE antecedente_exodoncia (
  id_antecedente_exodoncia BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_historia_clinica BIGINT UNSIGNED NOT NULL,
  id_pieza_dental BIGINT UNSIGNED NULL,
  realizo_exodoncias TINYINT(1) NULL,
  problemas_anestesico TINYINT(1) NULL,
  hemorragia_post_exodoncia TINYINT(1) NULL,
  hemorragia_dias VARCHAR(40) NULL,
  realizada_por VARCHAR(60) NULL,
  fecha_exodoncia DATE NULL,
  observaciones TEXT NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_antecedente_exodoncia),
  KEY idx_antecedente_exodoncia_historia (id_historia_clinica),
  CONSTRAINT fk_antecedente_exodoncia_historia FOREIGN KEY (id_historia_clinica) REFERENCES historia_clinica(id_historia_clinica) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE antecedente_familiar (
  id_antecedente_familiar BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_historia_clinica BIGINT UNSIGNED NOT NULL,
  parentesco VARCHAR(40) NOT NULL,
  estado_familiar VARCHAR(80) NULL,
  cantidad_total SMALLINT UNSIGNED NULL,
  vivos SMALLINT UNSIGNED NULL,
  fallecidos SMALLINT UNSIGNED NULL,
  detalle TEXT NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_antecedente_familiar),
  UNIQUE KEY uq_antecedente_familiar (id_historia_clinica, parentesco),
  CONSTRAINT fk_antecedente_familiar_historia FOREIGN KEY (id_historia_clinica) REFERENCES historia_clinica(id_historia_clinica) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- EXAMEN CLINICO Y EXAMENES COMPLEMENTARIOS
-- =============================================================

CREATE TABLE examen_clinico_general (
  id_examen_clinico_general BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_historia_clinica BIGINT UNSIGNED NOT NULL,
  tipo_psicologico VARCHAR(40) NULL,
  marcha VARCHAR(40) NULL,
  fatiga VARCHAR(5) NULL,
  raza VARCHAR(40) NULL,
  raza_otros VARCHAR(100) NULL,
  peso DECIMAL(6,2) NULL,
  talla DECIMAL(6,2) NULL,
  temperatura DECIMAL(5,2) NULL,
  presion_arterial VARCHAR(30) NULL,
  frecuencia_respiratoria DECIMAL(6,2) NULL,
  pulso DECIMAL(6,2) NULL,
  frecuencia_cardiaca DECIMAL(6,2) NULL,
  forma_craneo VARCHAR(60) NULL,
  cabello_implantacion VARCHAR(60) NULL,
  cabello_color VARCHAR(60) NULL,
  ojos_estado VARCHAR(80) NULL,
  ojos_patologia VARCHAR(255) NULL,
  ojos_color VARCHAR(60) NULL,
  ojos_forma VARCHAR(60) NULL,
  oidos_estado VARCHAR(80) NULL,
  oidos_patologia VARCHAR(255) NULL,
  audicion VARCHAR(80) NULL,
  nariz_estado VARCHAR(80) NULL,
  nariz_forma VARCHAR(80) NULL,
  labios_estado VARCHAR(80) NULL,
  labios_patologia VARCHAR(255) NULL,
  labios_forma VARCHAR(80) NULL,
  fascies_estado VARCHAR(80) NULL,
  fascies_color VARCHAR(80) NULL,
  cuello_forma VARCHAR(80) NULL,
  cuello_patologia VARCHAR(255) NULL,
  cadena_linfatica VARCHAR(80) NULL,
  cadena_linfatica_patologia VARCHAR(255) NULL,
  atm VARCHAR(80) NULL,
  atm_otros VARCHAR(255) NULL,
  tiroides VARCHAR(80) NULL,
  tiroides_patologia VARCHAR(255) NULL,
  miembros_superiores VARCHAR(80) NULL,
  miembros_superiores_detalle VARCHAR(255) NULL,
  miembros_inferiores VARCHAR(80) NULL,
  miembros_inferiores_detalle VARCHAR(255) NULL,
  torax VARCHAR(80) NULL,
  torax_patologia VARCHAR(255) NULL,
  observaciones TEXT NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_examen_clinico_general),
  UNIQUE KEY uq_examen_general_historia (id_historia_clinica),
  CONSTRAINT fk_examen_general_historia FOREIGN KEY (id_historia_clinica) REFERENCES historia_clinica(id_historia_clinica) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE examen_estomatologico (
  id_examen_estomatologico BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_historia_clinica BIGINT UNSIGNED NOT NULL,
  tipo_examen VARCHAR(30) NOT NULL,
  estructura_anatomica VARCHAR(100) NOT NULL,
  estado_estructura VARCHAR(80) NOT NULL DEFAULT 'NORMAL',
  descripcion TEXT NULL,
  observaciones TEXT NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_examen_estomatologico),
  UNIQUE KEY uq_examen_estomatologico_estructura (id_historia_clinica, tipo_examen, estructura_anatomica),
  KEY idx_examen_estomatologico_historia_tipo (id_historia_clinica, tipo_examen),
  CONSTRAINT fk_examen_estomatologico_historia FOREIGN KEY (id_historia_clinica) REFERENCES historia_clinica(id_historia_clinica) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE hallazgo_estomatologico (
  id_hallazgo_estomatologico BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_examen_estomatologico BIGINT UNSIGNED NOT NULL,
  hallazgo VARCHAR(180) NOT NULL,
  descripcion TEXT NULL,
  estado TINYINT(1) NOT NULL DEFAULT 1,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_hallazgo_estomatologico),
  KEY idx_hallazgo_estomatologico_examen (id_examen_estomatologico, estado),
  CONSTRAINT fk_hallazgo_estomatologico_examen FOREIGN KEY (id_examen_estomatologico) REFERENCES examen_estomatologico(id_examen_estomatologico) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE examen_oclusion (
  id_examen_oclusion BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_historia_clinica BIGINT UNSIGNED NOT NULL,
  clasificacion_posterior VARCHAR(60) NULL,
  clasificacion_anterior VARCHAR(60) NULL,
  mordida VARCHAR(100) NULL,
  diagnostico_presuntivo TEXT NULL,
  observaciones TEXT NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_examen_oclusion),
  UNIQUE KEY uq_examen_oclusion_historia (id_historia_clinica),
  CONSTRAINT fk_examen_oclusion_historia FOREIGN KEY (id_historia_clinica) REFERENCES historia_clinica(id_historia_clinica) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE archivo_clinico (
  id_archivo BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_historia_clinica BIGINT UNSIGNED NOT NULL,
  categoria VARCHAR(60) NULL,
  nombre_original VARCHAR(255) NOT NULL,
  nombre_guardado VARCHAR(255) NOT NULL,
  ruta VARCHAR(500) NOT NULL,
  extension VARCHAR(20) NULL,
  mime_type VARCHAR(120) NULL,
  tamano_bytes BIGINT UNSIGNED NULL,
  descripcion VARCHAR(255) NULL,
  estado TINYINT(1) NOT NULL DEFAULT 1,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_archivo),
  KEY idx_archivo_historia_categoria (id_historia_clinica, categoria, estado),
  CONSTRAINT fk_archivo_historia FOREIGN KEY (id_historia_clinica) REFERENCES historia_clinica(id_historia_clinica) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE examen_auxiliar (
  id_examen_auxiliar BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_historia_clinica BIGINT UNSIGNED NOT NULL,
  tipo_examen VARCHAR(40) NOT NULL,
  nombre_examen VARCHAR(180) NULL,
  fecha_examen DATE NULL,
  resultado TEXT NULL,
  interpretacion TEXT NULL,
  id_archivo BIGINT UNSIGNED NULL,
  observaciones TEXT NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_examen_auxiliar),
  KEY idx_examen_auxiliar_historia_tipo (id_historia_clinica, tipo_examen),
  CONSTRAINT fk_examen_auxiliar_historia FOREIGN KEY (id_historia_clinica) REFERENCES historia_clinica(id_historia_clinica) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_examen_auxiliar_archivo FOREIGN KEY (id_archivo) REFERENCES archivo_clinico(id_archivo) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE estudio_modelo (
  id_estudio_modelo BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_historia_clinica BIGINT UNSIGNED NOT NULL,
  informe_maxilar TEXT NULL,
  informe_mandibula TEXT NULL,
  planificacion TEXT NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_estudio_modelo),
  UNIQUE KEY uq_estudio_modelo_historia (id_historia_clinica),
  CONSTRAINT fk_estudio_modelo_historia FOREIGN KEY (id_historia_clinica) REFERENCES historia_clinica(id_historia_clinica) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE evolucion_clinica (
  id_evolucion_clinica BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_historia_clinica BIGINT UNSIGNED NOT NULL,
  fecha_referencia DATE NULL,
  evolucion TEXT NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_evolucion_clinica),
  UNIQUE KEY uq_evolucion_historia (id_historia_clinica),
  CONSTRAINT fk_evolucion_historia FOREIGN KEY (id_historia_clinica) REFERENCES historia_clinica(id_historia_clinica) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- DIAGNOSTICO Y PRONOSTICO
-- =============================================================

CREATE TABLE diagnostico (
  id_diagnostico BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_historia_clinica BIGINT UNSIGNED NOT NULL,
  codigo VARCHAR(20) NULL,
  tipo_diagnostico VARCHAR(40) NOT NULL,
  pieza_region VARCHAR(80) NULL,
  severidad VARCHAR(20) NULL,
  descripcion TEXT NOT NULL,
  evidencia_clinica TEXT NULL,
  observaciones TEXT NULL,
  numero_version SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  es_actual TINYINT(1) NOT NULL DEFAULT 1,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_diagnostico),
  UNIQUE KEY uq_diagnostico_version (id_historia_clinica, tipo_diagnostico, numero_version, codigo),
  KEY idx_diagnostico_historia_actual (id_historia_clinica, es_actual),
  CONSTRAINT fk_diagnostico_historia FOREIGN KEY (id_historia_clinica) REFERENCES historia_clinica(id_historia_clinica) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE pronostico_clinico (
  id_pronostico_clinico BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_historia_clinica BIGINT UNSIGNED NOT NULL,
  pronostico VARCHAR(20) NOT NULL,
  justificacion TEXT NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_pronostico_clinico),
  UNIQUE KEY uq_pronostico_historia (id_historia_clinica),
  CONSTRAINT fk_pronostico_historia FOREIGN KEY (id_historia_clinica) REFERENCES historia_clinica(id_historia_clinica) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- ODONTOGRAMA
-- =============================================================

CREATE TABLE pieza_dental (
  id_pieza_dental BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  codigo_fdi VARCHAR(4) NOT NULL,
  denticion VARCHAR(20) NOT NULL,
  cuadrante TINYINT UNSIGNED NOT NULL,
  tipo_pieza VARCHAR(50) NOT NULL,
  nombre_pieza VARCHAR(100) NOT NULL,
  orden_visual SMALLINT UNSIGNED NOT NULL,
  estado TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (id_pieza_dental),
  UNIQUE KEY uq_pieza_fdi (codigo_fdi),
  KEY idx_pieza_denticion_orden (denticion, orden_visual)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE catalogo_hallazgo_dental (
  id_hallazgo_dental BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  codigo VARCHAR(60) NOT NULL,
  nombre VARCHAR(180) NOT NULL,
  categoria VARCHAR(60) NULL,
  alcance VARCHAR(20) NOT NULL DEFAULT 'PIEZA',
  permite_superficie TINYINT(1) NOT NULL DEFAULT 0,
  requiere_condicion TINYINT(1) NOT NULL DEFAULT 0,
  simbolo VARCHAR(30) NULL,
  descripcion VARCHAR(255) NULL,
  estado TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (id_hallazgo_dental),
  UNIQUE KEY uq_hallazgo_codigo (codigo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE odontograma (
  id_odontograma BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_historia_clinica BIGINT UNSIGNED NOT NULL,
  id_docente_responsable BIGINT UNSIGNED NULL,
  tipo_denticion VARCHAR(20) NOT NULL DEFAULT 'PERMANENTE',
  fecha_evaluacion DATE NOT NULL,
  motivo_evaluacion VARCHAR(80) NULL,
  numero_cop VARCHAR(8) NULL,
  especificaciones TEXT NULL,
  observaciones TEXT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'BORRADOR',
  cerrado_en DATETIME NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_odontograma),
  KEY idx_odontograma_historia_fecha (id_historia_clinica, fecha_evaluacion),
  KEY idx_odontograma_docente (id_docente_responsable),
  CONSTRAINT fk_odontograma_historia FOREIGN KEY (id_historia_clinica) REFERENCES historia_clinica(id_historia_clinica) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_odontograma_docente FOREIGN KEY (id_docente_responsable) REFERENCES docente(id_docente) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE odontograma_pieza (
  id_odontograma_pieza BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_odontograma BIGINT UNSIGNED NOT NULL,
  id_pieza_dental BIGINT UNSIGNED NOT NULL,
  movilidad DECIMAL(4,2) NULL,
  perdida TINYINT(1) NOT NULL DEFAULT 0,
  observaciones TEXT NULL,
  PRIMARY KEY (id_odontograma_pieza),
  UNIQUE KEY uq_odontograma_pieza (id_odontograma, id_pieza_dental),
  CONSTRAINT fk_odontograma_pieza_odontograma FOREIGN KEY (id_odontograma) REFERENCES odontograma(id_odontograma) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_odontograma_pieza_pieza FOREIGN KEY (id_pieza_dental) REFERENCES pieza_dental(id_pieza_dental) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE odontograma_superficie (
  id_odontograma_superficie BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_odontograma_pieza BIGINT UNSIGNED NOT NULL,
  superficie VARCHAR(30) NOT NULL,
  observaciones TEXT NULL,
  PRIMARY KEY (id_odontograma_superficie),
  UNIQUE KEY uq_odontograma_superficie (id_odontograma_pieza, superficie),
  CONSTRAINT fk_odontograma_superficie_pieza FOREIGN KEY (id_odontograma_pieza) REFERENCES odontograma_pieza(id_odontograma_pieza) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE odontograma_hallazgo (
  id_odontograma_hallazgo BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_odontograma BIGINT UNSIGNED NOT NULL,
  id_hallazgo_dental BIGINT UNSIGNED NOT NULL,
  id_odontograma_superficie BIGINT UNSIGNED NULL,
  clasificacion VARCHAR(20) NULL,
  condicion VARCHAR(10) NULL,
  representacion VARCHAR(20) NOT NULL DEFAULT 'ESQUEMATICA',
  trazo JSON NULL,
  descripcion TEXT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_odontograma_hallazgo),
  KEY idx_odontograma_hallazgo_odontograma (id_odontograma, activo),
  KEY idx_odontograma_hallazgo_catalogo (id_hallazgo_dental),
  CONSTRAINT fk_odontograma_hallazgo_odontograma FOREIGN KEY (id_odontograma) REFERENCES odontograma(id_odontograma) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_odontograma_hallazgo_catalogo FOREIGN KEY (id_hallazgo_dental) REFERENCES catalogo_hallazgo_dental(id_hallazgo_dental) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_odontograma_hallazgo_superficie FOREIGN KEY (id_odontograma_superficie) REFERENCES odontograma_superficie(id_odontograma_superficie) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE odontograma_hallazgo_pieza (
  id_odontograma_hallazgo_pieza BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_odontograma_hallazgo BIGINT UNSIGNED NOT NULL,
  id_odontograma_pieza BIGINT UNSIGNED NOT NULL,
  orden SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (id_odontograma_hallazgo_pieza),
  UNIQUE KEY uq_hallazgo_pieza (id_odontograma_hallazgo, id_odontograma_pieza),
  CONSTRAINT fk_hallazgo_pieza_hallazgo FOREIGN KEY (id_odontograma_hallazgo) REFERENCES odontograma_hallazgo(id_odontograma_hallazgo) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_hallazgo_pieza_pieza FOREIGN KEY (id_odontograma_pieza) REFERENCES odontograma_pieza(id_odontograma_pieza) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE perdida_dental (
  id_perdida_dental BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_historia_clinica BIGINT UNSIGNED NOT NULL,
  id_pieza_dental BIGINT UNSIGNED NOT NULL,
  fecha_perdida DATE NULL,
  motivo VARCHAR(120) NULL,
  descripcion TEXT NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_perdida_dental),
  KEY idx_perdida_historia_pieza (id_historia_clinica, id_pieza_dental),
  CONSTRAINT fk_perdida_historia FOREIGN KEY (id_historia_clinica) REFERENCES historia_clinica(id_historia_clinica) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_perdida_pieza FOREIGN KEY (id_pieza_dental) REFERENCES pieza_dental(id_pieza_dental) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- PLAN DE TRATAMIENTO Y PROTESIS
-- =============================================================

CREATE TABLE catalogo_tratamiento_dental (
  id_tratamiento_dental BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  codigo VARCHAR(60) NOT NULL,
  nombre VARCHAR(180) NOT NULL,
  descripcion VARCHAR(255) NULL,
  estado TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (id_tratamiento_dental),
  UNIQUE KEY uq_tratamiento_codigo (codigo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE plan_tratamiento (
  id_plan_tratamiento BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_historia_clinica BIGINT UNSIGNED NOT NULL,
  tipo_plan VARCHAR(40) NOT NULL DEFAULT 'INTEGRAL',
  descripcion TEXT NULL,
  estado VARCHAR(30) NOT NULL DEFAULT 'BORRADOR',
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_plan_tratamiento),
  KEY idx_plan_historia_estado (id_historia_clinica, estado),
  CONSTRAINT fk_plan_historia FOREIGN KEY (id_historia_clinica) REFERENCES historia_clinica(id_historia_clinica) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE fase_tratamiento (
  id_fase_tratamiento BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_plan_tratamiento BIGINT UNSIGNED NOT NULL,
  numero_fase SMALLINT UNSIGNED NOT NULL,
  nombre VARCHAR(120) NOT NULL,
  descripcion TEXT NULL,
  orden SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  estado VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE',
  PRIMARY KEY (id_fase_tratamiento),
  UNIQUE KEY uq_fase_plan_numero (id_plan_tratamiento, numero_fase),
  CONSTRAINT fk_fase_plan FOREIGN KEY (id_plan_tratamiento) REFERENCES plan_tratamiento(id_plan_tratamiento) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE plan_tratamiento_item (
  id_plan_tratamiento_item BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_fase_tratamiento BIGINT UNSIGNED NOT NULL,
  id_tratamiento_dental BIGINT UNSIGNED NULL,
  id_pieza_dental BIGINT UNSIGNED NULL,
  pieza_region VARCHAR(80) NULL,
  superficie VARCHAR(30) NULL,
  descripcion_procedimiento VARCHAR(255) NULL,
  prioridad VARCHAR(10) NULL,
  estado VARCHAR(30) NOT NULL DEFAULT 'Pendiente',
  observaciones TEXT NULL,
  orden SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_plan_tratamiento_item),
  KEY idx_plan_item_fase_estado (id_fase_tratamiento, estado, orden),
  CONSTRAINT fk_plan_item_fase FOREIGN KEY (id_fase_tratamiento) REFERENCES fase_tratamiento(id_fase_tratamiento) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_plan_item_tratamiento FOREIGN KEY (id_tratamiento_dental) REFERENCES catalogo_tratamiento_dental(id_tratamiento_dental) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_plan_item_pieza FOREIGN KEY (id_pieza_dental) REFERENCES pieza_dental(id_pieza_dental) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE protesis (
  id_protesis BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_historia_clinica BIGINT UNSIGNED NOT NULL,
  tipo_protesis VARCHAR(60) NOT NULL,
  confeccionada_por VARCHAR(80) NULL,
  fecha_colocacion DATE NULL,
  estado VARCHAR(40) NULL,
  observaciones TEXT NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_protesis),
  KEY idx_protesis_historia (id_historia_clinica),
  CONSTRAINT fk_protesis_historia FOREIGN KEY (id_historia_clinica) REFERENCES historia_clinica(id_historia_clinica) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- CONSENTIMIENTO INFORMADO
-- =============================================================

CREATE TABLE consentimiento_informado (
  id_consentimiento BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_historia_clinica BIGINT UNSIGNED NOT NULL,
  id_docente_informante BIGINT UNSIGNED NULL,
  version_documento SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  fecha_consentimiento DATE NOT NULL,
  intervencion_autorizada TEXT NULL,
  texto_documento LONGTEXT NULL,
  estado VARCHAR(30) NOT NULL DEFAULT 'BORRADOR',
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_consentimiento),
  UNIQUE KEY uq_consentimiento_version (id_historia_clinica, version_documento),
  CONSTRAINT fk_consentimiento_historia FOREIGN KEY (id_historia_clinica) REFERENCES historia_clinica(id_historia_clinica) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_consentimiento_docente FOREIGN KEY (id_docente_informante) REFERENCES docente(id_docente) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE consentimiento_clausula (
  id_consentimiento_clausula BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_consentimiento BIGINT UNSIGNED NOT NULL,
  numero SMALLINT UNSIGNED NOT NULL,
  texto TEXT NOT NULL,
  aceptada TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (id_consentimiento_clausula),
  UNIQUE KEY uq_consentimiento_clausula (id_consentimiento, numero),
  CONSTRAINT fk_clausula_consentimiento FOREIGN KEY (id_consentimiento) REFERENCES consentimiento_informado(id_consentimiento) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE firma_consentimiento (
  id_firma_consentimiento BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_consentimiento BIGINT UNSIGNED NOT NULL,
  tipo_firmante VARCHAR(40) NOT NULL,
  nombre_firmante VARCHAR(180) NOT NULL,
  documento_firmante VARCHAR(20) NULL,
  parentesco_firmante VARCHAR(80) NULL,
  direccion_firmante VARCHAR(250) NULL,
  id_archivo BIGINT UNSIGNED NULL,
  fecha_firma DATETIME NULL,
  observaciones TEXT NULL,
  PRIMARY KEY (id_firma_consentimiento),
  KEY idx_firma_consentimiento (id_consentimiento, tipo_firmante),
  CONSTRAINT fk_firma_consentimiento FOREIGN KEY (id_consentimiento) REFERENCES consentimiento_informado(id_consentimiento) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_firma_consentimiento_archivo FOREIGN KEY (id_archivo) REFERENCES archivo_clinico(id_archivo) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- CIRUGIA, REPORTE Y SEGUIMIENTO
-- =============================================================

CREATE TABLE plan_quirurgico (
  id_plan_quirurgico BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_historia_clinica BIGINT UNSIGNED NOT NULL,
  procedimiento VARCHAR(255) NOT NULL,
  diagnostico_preoperatorio TEXT NULL,
  indicacion_quirurgica TEXT NULL,
  estado VARCHAR(30) NOT NULL DEFAULT 'BORRADOR',
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_plan_quirurgico),
  KEY idx_plan_quirurgico_historia (id_historia_clinica, estado),
  CONSTRAINT fk_plan_quirurgico_historia FOREIGN KEY (id_historia_clinica) REFERENCES historia_clinica(id_historia_clinica) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE etapa_quirurgica (
  id_etapa_quirurgica BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_plan_quirurgico BIGINT UNSIGNED NOT NULL,
  etapa VARCHAR(30) NOT NULL,
  descripcion TEXT NULL,
  orden SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (id_etapa_quirurgica),
  UNIQUE KEY uq_etapa_plan (id_plan_quirurgico, etapa),
  CONSTRAINT fk_etapa_plan_quirurgico FOREIGN KEY (id_plan_quirurgico) REFERENCES plan_quirurgico(id_plan_quirurgico) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE programacion_cirugia (
  id_programacion_cirugia BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_plan_quirurgico BIGINT UNSIGNED NOT NULL,
  fecha DATE NOT NULL,
  hora TIME NULL,
  observaciones TEXT NULL,
  estado VARCHAR(30) NOT NULL DEFAULT 'PROGRAMADA',
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_programacion_cirugia),
  KEY idx_programacion_plan_fecha (id_plan_quirurgico, fecha, estado),
  CONSTRAINT fk_programacion_plan FOREIGN KEY (id_plan_quirurgico) REFERENCES plan_quirurgico(id_plan_quirurgico) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE reporte_operatorio (
  id_reporte_operatorio BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_plan_quirurgico BIGINT UNSIGNED NOT NULL,
  id_docente_responsable BIGINT UNSIGNED NULL,
  id_alumno_operador BIGINT UNSIGNED NULL,
  fecha DATE NOT NULL,
  asistente VARCHAR(180) NULL,
  lugar VARCHAR(150) NULL,
  caso_clinico VARCHAR(180) NULL,
  tipo_anestesia VARCHAR(100) NULL,
  tecnica_anestesia VARCHAR(150) NULL,
  procedimiento_realizado TEXT NULL,
  hallazgos TEXT NULL,
  tecnica_quirurgica TEXT NULL,
  complicaciones TEXT NULL,
  hora_inicio TIME NULL,
  hora_termino TIME NULL,
  observaciones TEXT NULL,
  estado VARCHAR(30) NOT NULL DEFAULT 'BORRADOR',
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_reporte_operatorio),
  KEY idx_reporte_plan_fecha (id_plan_quirurgico, fecha),
  CONSTRAINT fk_reporte_plan FOREIGN KEY (id_plan_quirurgico) REFERENCES plan_quirurgico(id_plan_quirurgico) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_reporte_docente FOREIGN KEY (id_docente_responsable) REFERENCES docente(id_docente) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_reporte_alumno FOREIGN KEY (id_alumno_operador) REFERENCES alumno(id_alumno) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE signo_vital_operatorio (
  id_signo_vital_operatorio BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_reporte_operatorio BIGINT UNSIGNED NOT NULL,
  momento VARCHAR(20) NOT NULL,
  presion_arterial VARCHAR(30) NULL,
  temperatura DECIMAL(5,2) NULL,
  frecuencia_respiratoria DECIMAL(6,2) NULL,
  frecuencia_cardiaca DECIMAL(6,2) NULL,
  pulso DECIMAL(6,2) NULL,
  saturacion_oxigeno DECIMAL(5,2) NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_signo_vital_operatorio),
  UNIQUE KEY uq_signo_reporte_momento (id_reporte_operatorio, momento),
  CONSTRAINT fk_signo_reporte FOREIGN KEY (id_reporte_operatorio) REFERENCES reporte_operatorio(id_reporte_operatorio) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE prescripcion (
  id_prescripcion BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_reporte_operatorio BIGINT UNSIGNED NOT NULL,
  medicamento VARCHAR(180) NULL,
  dosis VARCHAR(100) NULL,
  via VARCHAR(80) NULL,
  frecuencia VARCHAR(100) NULL,
  duracion VARCHAR(100) NULL,
  indicaciones TEXT NULL,
  resumen TEXT NULL,
  observaciones TEXT NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_prescripcion),
  KEY idx_prescripcion_reporte (id_reporte_operatorio),
  CONSTRAINT fk_prescripcion_reporte FOREIGN KEY (id_reporte_operatorio) REFERENCES reporte_operatorio(id_reporte_operatorio) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE seguimiento_quirurgico (
  id_seguimiento_quirurgico BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_reporte_operatorio BIGINT UNSIGNED NOT NULL,
  numero_control SMALLINT UNSIGNED NOT NULL,
  fecha DATE NOT NULL,
  procedimiento VARCHAR(255) NULL,
  evolucion TEXT NULL,
  indicaciones TEXT NULL,
  id_docente BIGINT UNSIGNED NULL,
  id_alumno BIGINT UNSIGNED NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_seguimiento_quirurgico),
  UNIQUE KEY uq_seguimiento_reporte_control (id_reporte_operatorio, numero_control),
  CONSTRAINT fk_seguimiento_reporte FOREIGN KEY (id_reporte_operatorio) REFERENCES reporte_operatorio(id_reporte_operatorio) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_seguimiento_docente FOREIGN KEY (id_docente) REFERENCES docente(id_docente) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_seguimiento_alumno FOREIGN KEY (id_alumno) REFERENCES alumno(id_alumno) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE firma_seguimiento (
  id_firma_seguimiento BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_seguimiento_quirurgico BIGINT UNSIGNED NOT NULL,
  tipo_firmante VARCHAR(30) NOT NULL,
  id_docente BIGINT UNSIGNED NULL,
  id_alumno BIGINT UNSIGNED NULL,
  nombre_firmante VARCHAR(180) NULL,
  id_archivo BIGINT UNSIGNED NULL,
  fecha_firma DATETIME NULL,
  PRIMARY KEY (id_firma_seguimiento),
  KEY idx_firma_seguimiento (id_seguimiento_quirurgico, tipo_firmante),
  CONSTRAINT fk_firma_seguimiento_control FOREIGN KEY (id_seguimiento_quirurgico) REFERENCES seguimiento_quirurgico(id_seguimiento_quirurgico) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_firma_seguimiento_docente FOREIGN KEY (id_docente) REFERENCES docente(id_docente) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_firma_seguimiento_alumno FOREIGN KEY (id_alumno) REFERENCES alumno(id_alumno) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_firma_seguimiento_archivo FOREIGN KEY (id_archivo) REFERENCES archivo_clinico(id_archivo) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE alta_clinica (
  id_alta_clinica BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_reporte_operatorio BIGINT UNSIGNED NOT NULL,
  fecha_alta DATETIME NULL,
  condicion_alta VARCHAR(120) NULL,
  indicaciones TEXT NULL,
  observaciones TEXT NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_alta_clinica),
  UNIQUE KEY uq_alta_reporte (id_reporte_operatorio),
  CONSTRAINT fk_alta_reporte FOREIGN KEY (id_reporte_operatorio) REFERENCES reporte_operatorio(id_reporte_operatorio) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE epicrisis (
  id_epicrisis BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_reporte_operatorio BIGINT UNSIGNED NOT NULL,
  resumen_clinico TEXT NULL,
  diagnostico TEXT NULL,
  procedimiento_realizado TEXT NULL,
  evolucion TEXT NULL,
  recomendaciones TEXT NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_epicrisis),
  UNIQUE KEY uq_epicrisis_reporte (id_reporte_operatorio),
  CONSTRAINT fk_epicrisis_reporte FOREIGN KEY (id_reporte_operatorio) REFERENCES reporte_operatorio(id_reporte_operatorio) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================
-- CONFIGURACION Y AUDITORIA
-- =============================================================

CREATE TABLE configuracion_sistema (
  id_configuracion BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  clave VARCHAR(100) NOT NULL,
  valor TEXT NULL,
  descripcion VARCHAR(255) NULL,
  estado TINYINT(1) NOT NULL DEFAULT 1,
  actualizado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_configuracion),
  UNIQUE KEY uq_configuracion_clave (clave)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE auditoria (
  id_auditoria BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  tabla_afectada VARCHAR(120) NOT NULL,
  id_registro VARCHAR(80) NULL,
  accion VARCHAR(30) NOT NULL,
  tipo_usuario VARCHAR(20) NULL,
  id_usuario BIGINT UNSIGNED NULL,
  nombre_usuario VARCHAR(120) NULL,
  direccion_ip VARCHAR(45) NULL,
  agente_usuario VARCHAR(500) NULL,
  valores_anteriores JSON NULL,
  valores_nuevos JSON NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_auditoria),
  KEY idx_auditoria_tabla_registro (tabla_afectada, id_registro),
  KEY idx_auditoria_usuario_fecha (tipo_usuario, id_usuario, creado_en),
  KEY idx_auditoria_fecha (creado_en)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE antecedente_exodoncia
  ADD CONSTRAINT fk_antecedente_exodoncia_pieza
  FOREIGN KEY (id_pieza_dental) REFERENCES pieza_dental(id_pieza_dental)
  ON UPDATE CASCADE ON DELETE RESTRICT;

-- =============================================================
-- DATOS SEMILLA: ROLES, MODULOS Y SUBMODULOS
-- =============================================================

-- Los roles se clasifican por tipo de cuenta. El frontend debe filtrar por tipo_usuario
-- y el backend/BD validan que no se pueda asignar un rol de DOCENTE a un ALUMNO ni viceversa.
INSERT INTO rol (id_rol, codigo_rol, nombre_rol, tipo_usuario, descripcion) VALUES
(1,'ADMINISTRADOR','Administrador','DOCENTE','Administración integral del sistema; asignable únicamente a cuentas de docente.'),
(2,'DOCENTE','Docente','DOCENTE','Docente de la clínica odontológica.'),
(3,'ALUMNO','Alumno','ALUMNO','Alumno de pregrado de la clínica odontológica.');

INSERT INTO modulo (id_modulo, codigo_modulo, nombre_modulo, descripcion, ruta, orden) VALUES
(1,'INICIO','Inicio','Panel principal.','/inicio',1),
(2,'PACIENTES','Pacientes','Gestión de pacientes.','/pacientes',2),
(3,'HISTORIA_CLINICA','Historia clínica','Gestión integral de historias clínicas.','/historias',3),
(4,'CIRUGIA','Cirugía','Consentimiento, cirugía y seguimiento.','/cirugia',4),
(5,'ACADEMICO','Gestión académica','Cursos, periodos, grupos y rotaciones.','/academico',5),
(6,'ADMINISTRACION','Administración','Usuarios y roles.','/administracion',6),
(7,'REPORTES','Reportes','Consulta y exportación de información.','/reportes',7),
(8,'CONFIGURACION','Configuración','Parámetros y catálogos.','/configuracion',8),
(9,'AUDITORIA','Auditoría','Bitácora de acciones.','/auditoria',9);

INSERT INTO submodulo (id_submodulo, id_modulo, codigo_submodulo, nombre_submodulo, ruta, orden) VALUES
(1,1,'TABLERO','Tablero','/inicio',1),
(2,2,'PACIENTES','Pacientes','/pacientes',1),
(3,3,'HISTORIAS','Historias clínicas','/historias',1),
(4,3,'EXAMEN_CLINICO','Examen clínico','/historias/examen-clinico',2),
(5,3,'ODONTOGRAMA','Odontograma','/historias/odontograma',3),
(6,3,'EXAMENES_AUXILIARES','Exámenes auxiliares','/historias/examenes-auxiliares',4),
(7,3,'DIAGNOSTICO_TRATAMIENTO','Diagnóstico y tratamiento','/historias/diagnostico-tratamiento',5),
(8,4,'CONSENTIMIENTO','Consentimiento informado','/cirugia/consentimiento',1),
(9,4,'PROGRAMACION','Programación de cirugía','/cirugia/programacion',2),
(10,4,'REPORTE_OPERATORIO','Reporte operatorio','/cirugia/reporte-operatorio',3),
(11,4,'SEGUIMIENTO','Seguimiento quirúrgico','/cirugia/seguimiento',4),
(12,5,'CURSOS','Cursos','/academico/cursos',1),
(13,5,'PERIODOS','Periodos académicos','/academico/periodos',2),
(14,5,'GRUPOS','Grupos académicos','/academico/grupos',3),
(15,5,'ROTACIONES','Rotaciones','/academico/rotaciones',4),
(16,6,'USUARIOS','Usuarios','/administracion/usuarios',1),
(17,6,'ROLES','Roles y accesos','/administracion/roles',2),
(18,7,'EXPORTAR_PDF','Exportar PDF','/reportes/exportar',1),
(19,8,'PARAMETROS','Parámetros','/configuracion/parametros',1),
(20,8,'CATALOGOS_CLINICOS','Catálogos clínicos','/configuracion/catalogos',2),
(21,9,'BITACORA','Bitácora','/auditoria/bitacora',1);

-- Administrador: todos los submódulos.
INSERT INTO rol_submodulo (id_rol, id_submodulo)
SELECT 1, id_submodulo FROM submodulo;

-- Docente: operación clínica, pacientes y consulta académica relevante.
INSERT INTO rol_submodulo (id_rol, id_submodulo) VALUES
(2,1),(2,2),(2,3),(2,4),(2,5),(2,6),(2,7),(2,8),(2,9),(2,10),(2,11),(2,12),(2,13),(2,14),(2,15),(2,18);

-- Alumno: módulos clínicos asignados y consulta básica.
INSERT INTO rol_submodulo (id_rol, id_submodulo) VALUES
(3,1),(3,2),(3,3),(3,4),(3,5),(3,6),(3,7),(3,8),(3,9),(3,10),(3,11);

-- =============================================================
-- DATOS SEMILLA: ESTADOS DE HISTORIA CLINICA
-- =============================================================

INSERT INTO estado_historia_clinica
  (id_estado_historia, codigo, nombre, descripcion, orden, es_final, estado) VALUES
(1,'BORRADOR','Borrador','Historia creada y aún en elaboración.',1,0,1),
(2,'EN_PROCESO','En proceso','Historia clínica en desarrollo por el equipo asignado.',2,0,1),
(3,'PENDIENTE_REVISION','Pendiente de revisión','Historia enviada para revisión docente.',3,0,1),
(4,'OBSERVADA','Observada','Historia revisada con observaciones pendientes de subsanar.',4,0,1),
(5,'VALIDADA','Validada','Historia revisada y validada.',5,1,1);

-- =============================================================
-- DATOS SEMILLA: CUESTIONARIO DE SALUD
-- =============================================================

INSERT INTO pregunta_salud (id_pregunta, numero, pregunta, orden, requiere_detalle, requiere_detalle_adicional, estado) VALUES
(1,1,'¿Fue atendido por un médico últimamente?',1,1,1,1),
(2,2,'¿Ha tenido Ud. un problema de tipo cardiaco?',2,1,0,1),
(3,3,'¿Ha tenido Ud. un problema de tipo renal?',3,1,0,1),
(4,4,'¿Ha tenido Ud. un problema de tipo pulmonar?',4,1,0,1),
(5,5,'¿Ha tenido Ud. un problema de tipo gástrico?',5,1,0,1),
(6,6,'¿Ha tenido Ud. alguna alteración del SNC?',6,1,0,1),
(7,7,'¿Ha tenido Ud. un problema de tipo digestivo?',7,1,0,1),
(8,8,'¿Ha tenido Ud. un problema en el sistema hepático (Hepatitis)?',8,1,0,1),
(9,9,'¿Ha tenido Ud. un problema de hipertensión?',9,1,0,1),
(10,10,'¿Ha tenido Ud. alguna vez una enfermedad venérea?',10,1,0,1),
(11,11,'¿Ha tenido Ud. un trastorno de tipo tiroideo?',11,1,0,1),
(12,12,'¿Ha tenido Ud. alguna vez pápulas o hipersensibilidades?',12,1,0,1),
(13,13,'¿Es Ud. alérgico a la penicilina?',13,1,0,1),
(14,14,'¿Es Ud. alérgico a otro tipo de medicamento?',14,1,0,1),
(15,15,'¿Ha sido internado alguna vez en un hospital?',15,1,0,1),
(16,16,'¿Le han realizado alguna vez transfusión sanguínea?',16,1,0,1),
(17,17,'¿Ud. tiene algún problema con las articulaciones óseas?',17,1,0,1),
(18,18,'¿Ud. tiene algún problema hematológico?',18,1,0,1),
(19,19,'¿Ha sufrido algún tipo de desmayo o convulsiones?',19,1,0,1),
(20,20,'¿Ud. sufre o tiene diabetes?',20,1,0,1),
(21,21,'Si tiene Ud. diabetes, ¿está compensado?',21,1,0,1),
(22,22,'¿Ud. tiene o presentó algún problema en la piel?',22,1,0,1),
(23,23,'¿Tiene o presenta un proceso infeccioso o respiratorio?',23,1,0,1),
(24,24,'¿Tiene o presenta una dificultad para respirar?',24,1,0,1);

-- =============================================================
-- DATOS SEMILLA: PIEZAS DENTALES FDI
-- =============================================================

INSERT INTO pieza_dental (id_pieza_dental, codigo_fdi, denticion, cuadrante, tipo_pieza, nombre_pieza, orden_visual, estado) VALUES
(1,'18','PERMANENTE',1,'Tercer molar','Pieza 18 - Tercer molar',1,1),
(2,'17','PERMANENTE',1,'Segundo molar','Pieza 17 - Segundo molar',2,1),
(3,'16','PERMANENTE',1,'Primer molar','Pieza 16 - Primer molar',3,1),
(4,'15','PERMANENTE',1,'Segundo premolar','Pieza 15 - Segundo premolar',4,1),
(5,'14','PERMANENTE',1,'Primer premolar','Pieza 14 - Primer premolar',5,1),
(6,'13','PERMANENTE',1,'Canino','Pieza 13 - Canino',6,1),
(7,'12','PERMANENTE',1,'Incisivo lateral','Pieza 12 - Incisivo lateral',7,1),
(8,'11','PERMANENTE',1,'Incisivo central','Pieza 11 - Incisivo central',8,1),
(9,'21','PERMANENTE',2,'Incisivo central','Pieza 21 - Incisivo central',9,1),
(10,'22','PERMANENTE',2,'Incisivo lateral','Pieza 22 - Incisivo lateral',10,1),
(11,'23','PERMANENTE',2,'Canino','Pieza 23 - Canino',11,1),
(12,'24','PERMANENTE',2,'Primer premolar','Pieza 24 - Primer premolar',12,1),
(13,'25','PERMANENTE',2,'Segundo premolar','Pieza 25 - Segundo premolar',13,1),
(14,'26','PERMANENTE',2,'Primer molar','Pieza 26 - Primer molar',14,1),
(15,'27','PERMANENTE',2,'Segundo molar','Pieza 27 - Segundo molar',15,1),
(16,'28','PERMANENTE',2,'Tercer molar','Pieza 28 - Tercer molar',16,1),
(17,'48','PERMANENTE',4,'Tercer molar','Pieza 48 - Tercer molar',17,1),
(18,'47','PERMANENTE',4,'Segundo molar','Pieza 47 - Segundo molar',18,1),
(19,'46','PERMANENTE',4,'Primer molar','Pieza 46 - Primer molar',19,1),
(20,'45','PERMANENTE',4,'Segundo premolar','Pieza 45 - Segundo premolar',20,1),
(21,'44','PERMANENTE',4,'Primer premolar','Pieza 44 - Primer premolar',21,1),
(22,'43','PERMANENTE',4,'Canino','Pieza 43 - Canino',22,1),
(23,'42','PERMANENTE',4,'Incisivo lateral','Pieza 42 - Incisivo lateral',23,1),
(24,'41','PERMANENTE',4,'Incisivo central','Pieza 41 - Incisivo central',24,1),
(25,'31','PERMANENTE',3,'Incisivo central','Pieza 31 - Incisivo central',25,1),
(26,'32','PERMANENTE',3,'Incisivo lateral','Pieza 32 - Incisivo lateral',26,1),
(27,'33','PERMANENTE',3,'Canino','Pieza 33 - Canino',27,1),
(28,'34','PERMANENTE',3,'Primer premolar','Pieza 34 - Primer premolar',28,1),
(29,'35','PERMANENTE',3,'Segundo premolar','Pieza 35 - Segundo premolar',29,1),
(30,'36','PERMANENTE',3,'Primer molar','Pieza 36 - Primer molar',30,1),
(31,'37','PERMANENTE',3,'Segundo molar','Pieza 37 - Segundo molar',31,1),
(32,'38','PERMANENTE',3,'Tercer molar','Pieza 38 - Tercer molar',32,1),
(33,'55','TEMPORAL',5,'Segundo molar temporal','Pieza 55 - Segundo molar temporal',33,1),
(34,'54','TEMPORAL',5,'Primer molar temporal','Pieza 54 - Primer molar temporal',34,1),
(35,'53','TEMPORAL',5,'Canino temporal','Pieza 53 - Canino temporal',35,1),
(36,'52','TEMPORAL',5,'Incisivo lateral temporal','Pieza 52 - Incisivo lateral temporal',36,1),
(37,'51','TEMPORAL',5,'Incisivo central temporal','Pieza 51 - Incisivo central temporal',37,1),
(38,'61','TEMPORAL',6,'Incisivo central temporal','Pieza 61 - Incisivo central temporal',38,1),
(39,'62','TEMPORAL',6,'Incisivo lateral temporal','Pieza 62 - Incisivo lateral temporal',39,1),
(40,'63','TEMPORAL',6,'Canino temporal','Pieza 63 - Canino temporal',40,1),
(41,'64','TEMPORAL',6,'Primer molar temporal','Pieza 64 - Primer molar temporal',41,1),
(42,'65','TEMPORAL',6,'Segundo molar temporal','Pieza 65 - Segundo molar temporal',42,1),
(43,'85','TEMPORAL',8,'Segundo molar temporal','Pieza 85 - Segundo molar temporal',43,1),
(44,'84','TEMPORAL',8,'Primer molar temporal','Pieza 84 - Primer molar temporal',44,1),
(45,'83','TEMPORAL',8,'Canino temporal','Pieza 83 - Canino temporal',45,1),
(46,'82','TEMPORAL',8,'Incisivo lateral temporal','Pieza 82 - Incisivo lateral temporal',46,1),
(47,'81','TEMPORAL',8,'Incisivo central temporal','Pieza 81 - Incisivo central temporal',47,1),
(48,'71','TEMPORAL',7,'Incisivo central temporal','Pieza 71 - Incisivo central temporal',48,1),
(49,'72','TEMPORAL',7,'Incisivo lateral temporal','Pieza 72 - Incisivo lateral temporal',49,1),
(50,'73','TEMPORAL',7,'Canino temporal','Pieza 73 - Canino temporal',50,1),
(51,'74','TEMPORAL',7,'Primer molar temporal','Pieza 74 - Primer molar temporal',51,1),
(52,'75','TEMPORAL',7,'Segundo molar temporal','Pieza 75 - Segundo molar temporal',52,1);

-- =============================================================
-- DATOS SEMILLA: CATALOGO DE HALLAZGOS DENTALES
-- =============================================================

-- NTS N.° 188 (1.9 discrómico, 1.22 migración, 1.30 semi-impactación) más dos
-- nomenclaturas propias de la clínica admitidas por el DG 14 (caries cervical, cálculo).
INSERT INTO catalogo_hallazgo_dental (id_hallazgo_dental, codigo, nombre, categoria, alcance, permite_superficie, requiere_condicion, simbolo, descripcion, estado) VALUES
(1,'ORTODONCIA_FIJA','Aparato ortodóntico fijo','ORTODONCIA','RANGO',0,1,'⊞—⊞',NULL,1),
(2,'ORTODONCIA_REMOVIBLE','Aparato ortodóntico removible','ORTODONCIA','RANGO',0,1,'⌁',NULL,1),
(3,'CORONA','Corona definitiva','TRATAMIENTO_EXISTENTE','PIEZA',0,1,'CC',NULL,1),
(4,'CORONA_TEMPORAL','Corona temporal','TRATAMIENTO_EXISTENTE','PIEZA',0,0,'CT',NULL,1),
(5,'DEFECTO_ESMALTE','Defectos de desarrollo del esmalte','PATOLOGIA','SUPERFICIE',1,0,'O',NULL,1),
(6,'DIASTEMA','Diastema','ESTADO','PAR',0,0,')(',NULL,1),
(7,'EDENTULO','Edéntulo total','ESTADO','ARCADA',0,0,'—',NULL,1),
(8,'ESPIGO','Espigo – muñón','TRATAMIENTO_EXISTENTE','PIEZA',0,1,'▣',NULL,1),
(9,'FOSAS','Fosas y fisuras profundas','PATOLOGIA','PIEZA',0,0,'FFP',NULL,1),
(10,'FRACTURA','Fractura dental','PATOLOGIA','PIEZA',0,0,'╱',NULL,1),
(11,'FUSION','Fusión','ANOMALIA','PAR',0,0,'◯◯',NULL,1),
(12,'GEMINACION','Geminación','ANOMALIA','PIEZA',0,0,'◯',NULL,1),
(13,'GIROVERSION','Giroversión','POSICION','PIEZA',0,0,'↷',NULL,1),
(14,'IMPACTACION','Impactación','POSICION','PIEZA',0,0,'I',NULL,1),
(15,'IMPLANTE','Implante dental','REHABILITACION','PIEZA',0,1,'IMP',NULL,1),
(16,'CARIES','Lesión de caries dental','PATOLOGIA','SUPERFICIE',1,0,'CE',NULL,1),
(17,'MACRODONCIA','Macrodoncia','ANOMALIA','PIEZA',0,0,'MAC',NULL,1),
(18,'MICRODONCIA','Microdoncia','ANOMALIA','PIEZA',0,0,'MIC',NULL,1),
(19,'MOVILIDAD','Movilidad patológica','PATOLOGIA','PIEZA',0,0,'M',NULL,1),
(20,'AUSENTE','Pieza dentaria ausente / extraída','ESTADO','PIEZA',0,0,'DAO',NULL,1),
(21,'CLAVIJA','Pieza dentaria en clavija','ANOMALIA','PIEZA',0,0,'△',NULL,1),
(22,'ECTOPICA','Pieza dentaria ectópica','POSICION','PIEZA',0,0,'E',NULL,1),
(23,'ERUPCION','Pieza dentaria en erupción','POSICION','PIEZA',0,0,'↯',NULL,1),
(24,'EXTRUIDA','Pieza dentaria extruida','POSICION','PIEZA',0,0,'↓',NULL,1),
(25,'INTRUIDA','Pieza dentaria intruida','POSICION','PIEZA',0,0,'↑',NULL,1),
(26,'SUPERNUMERARIA','Pieza dentaria supernumeraria','ANOMALIA','PAR',0,0,'Ⓢ',NULL,1),
(27,'PULPOTOMIA','Pulpotomía','TRATAMIENTO_EXISTENTE','PIEZA',0,1,'PP',NULL,1),
(28,'POSICION_ANORMAL','Posición anormal dentaria','POSICION','PIEZA',0,0,'M',NULL,1),
(29,'PROTESIS_FIJA','Prótesis dental parcial fija','REHABILITACION','RANGO',0,1,'┬─┬',NULL,1),
(30,'PROTESIS_COMPLETA','Prótesis dental completa','REHABILITACION','ARCADA',0,1,'═',NULL,1),
(31,'PROTESIS_REMOVIBLE','Prótesis dental parcial removible','REHABILITACION','RANGO',0,1,'═',NULL,1),
(32,'REMANENTE','Remanente radicular','PATOLOGIA','PIEZA',0,0,'RR',NULL,1),
(33,'RESTAURACION','Restauración definitiva','TRATAMIENTO_EXISTENTE','SUPERFICIE',1,1,'R',NULL,1),
(34,'RESTAURACION_TEMPORAL','Restauración temporal','TRATAMIENTO_EXISTENTE','SUPERFICIE',1,0,'Contorno',NULL,1),
(35,'SELLANTE','Sellante','TRATAMIENTO_EXISTENTE','SUPERFICIE',1,1,'S',NULL,1),
(36,'DESGASTE','Superficie desgastada','PATOLOGIA','SUPERFICIE',1,0,'DES',NULL,1),
(37,'ENDODONCIA','Tratamiento de conductos / pulpectomía','TRATAMIENTO_EXISTENTE','PIEZA',0,1,'TC',NULL,1),
(38,'TRANSPOSICION','Transposición dentaria','POSICION','PAR',0,0,'⇄',NULL,1),
(39,'DISCROMICO','Diente discrómico','ANOMALIA','PIEZA',0,0,'DIS',NULL,1),
(40,'SEMI_IMPACTACION','Semi-impactación','POSICION','PIEZA',0,0,'SI',NULL,1),
(41,'MIGRACION','Migración','POSICION','PIEZA',0,0,'→',NULL,1),
(42,'CARIES_CERVICAL','Caries cervical','PATOLOGIA','PIEZA',0,0,'C',NULL,1),
(43,'CALCULO','Cálculo dental','PATOLOGIA','PIEZA',0,0,'CAL',NULL,1);

-- =============================================================
-- DATOS SEMILLA: CATALOGO DE TRATAMIENTOS
-- =============================================================

INSERT INTO catalogo_tratamiento_dental (id_tratamiento_dental, codigo, nombre, descripcion, estado) VALUES
(1,'RESTAURACION','Restauración',NULL,1),
(2,'SELLANTE','Sellante',NULL,1),
(3,'EXODONCIA','Exodoncia',NULL,1),
(4,'ENDODONCIA','Endodoncia',NULL,1),
(5,'CORONA','Corona',NULL,1),
(6,'PROTESIS_PARCIAL','Prótesis parcial',NULL,1),
(7,'PROTESIS_TOTAL','Prótesis total',NULL,1),
(8,'IMPLANTE','Implante',NULL,1),
(9,'PROFILAXIS','Profilaxis',NULL,1),
(10,'PERIODONCIA','Tratamiento periodontal',NULL,1),
(11,'OTRO','Otro procedimiento',NULL,1);

-- =============================================================
-- CONFIGURACION INICIAL
-- =============================================================

INSERT INTO configuracion_sistema (clave, valor, descripcion) VALUES
('ELIMINACION_CLINICA_PERMITIDA','0','Las historias clínicas y registros clínicos no se eliminan físicamente.'),
('NOMBRE_INSTITUCION','Universidad Nacional Daniel Alcides Carrión','Nombre institucional mostrado en documentos.'),
('ZONA_HORARIA','America/Lima','Zona horaria de operación del sistema.');

-- =============================================================
-- TRIGGERS DE INTEGRIDAD PARA NOMBRES DE USUARIO GLOBALES
-- =============================================================

DELIMITER $$

CREATE TRIGGER trg_usuario_alumno_bi
BEFORE INSERT ON usuario_alumno
FOR EACH ROW
BEGIN
  IF NOT EXISTS (SELECT 1 FROM rol WHERE id_rol = NEW.id_rol AND tipo_usuario = 'ALUMNO' AND estado = 1) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El rol seleccionado no corresponde a un usuario alumno o se encuentra inactivo.';
  END IF;
  IF EXISTS (SELECT 1 FROM usuario_docente WHERE nombre_usuario = NEW.nombre_usuario) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El nombre de usuario ya existe en usuario_docente.';
  END IF;
END$$

CREATE TRIGGER trg_usuario_alumno_bu
BEFORE UPDATE ON usuario_alumno
FOR EACH ROW
BEGIN
  IF NOT EXISTS (SELECT 1 FROM rol WHERE id_rol = NEW.id_rol AND tipo_usuario = 'ALUMNO' AND estado = 1) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El rol seleccionado no corresponde a un usuario alumno o se encuentra inactivo.';
  END IF;
  IF EXISTS (SELECT 1 FROM usuario_docente WHERE nombre_usuario = NEW.nombre_usuario) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El nombre de usuario ya existe en usuario_docente.';
  END IF;
END$$

CREATE TRIGGER trg_usuario_docente_bi
BEFORE INSERT ON usuario_docente
FOR EACH ROW
BEGIN
  IF NOT EXISTS (SELECT 1 FROM rol WHERE id_rol = NEW.id_rol AND tipo_usuario = 'DOCENTE' AND estado = 1) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El rol seleccionado no corresponde a un usuario docente o se encuentra inactivo.';
  END IF;
  IF EXISTS (SELECT 1 FROM usuario_alumno WHERE nombre_usuario = NEW.nombre_usuario) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El nombre de usuario ya existe en usuario_alumno.';
  END IF;
END$$

CREATE TRIGGER trg_usuario_docente_bu
BEFORE UPDATE ON usuario_docente
FOR EACH ROW
BEGIN
  IF NOT EXISTS (SELECT 1 FROM rol WHERE id_rol = NEW.id_rol AND tipo_usuario = 'DOCENTE' AND estado = 1) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El rol seleccionado no corresponde a un usuario docente o se encuentra inactivo.';
  END IF;
  IF EXISTS (SELECT 1 FROM usuario_alumno WHERE nombre_usuario = NEW.nombre_usuario) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El nombre de usuario ya existe en usuario_alumno.';
  END IF;
END$$

CREATE TRIGGER trg_historia_docente_bi
BEFORE INSERT ON historia_docente
FOR EACH ROW
BEGIN
  IF NEW.tipo_participacion NOT IN ('ENCARGADO','SUPERVISOR','COLABORADOR') THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'tipo_participacion de historia_docente no válido.';
  END IF;
  IF NEW.fecha_fin IS NOT NULL AND NEW.fecha_fin < NEW.fecha_asignacion THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'fecha_fin no puede ser anterior a fecha_asignacion.';
  END IF;
  IF NEW.asignado_por_tipo IS NOT NULL AND NEW.asignado_por_tipo NOT IN ('ALUMNO','DOCENTE') THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'asignado_por_tipo debe ser ALUMNO o DOCENTE.';
  END IF;
  IF NEW.estado = 1 AND NEW.tipo_participacion = 'ENCARGADO'
     AND EXISTS (
       SELECT 1
       FROM historia_docente hd
       WHERE hd.id_historia_clinica = NEW.id_historia_clinica
         AND hd.estado = 1
         AND hd.tipo_participacion = 'ENCARGADO'
     ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La historia clínica ya tiene un docente ENCARGADO activo.';
  END IF;
END$$

CREATE TRIGGER trg_historia_docente_bu
BEFORE UPDATE ON historia_docente
FOR EACH ROW
BEGIN
  IF NEW.tipo_participacion NOT IN ('ENCARGADO','SUPERVISOR','COLABORADOR') THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'tipo_participacion de historia_docente no válido.';
  END IF;
  IF NEW.fecha_fin IS NOT NULL AND NEW.fecha_fin < NEW.fecha_asignacion THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'fecha_fin no puede ser anterior a fecha_asignacion.';
  END IF;
  IF NEW.asignado_por_tipo IS NOT NULL AND NEW.asignado_por_tipo NOT IN ('ALUMNO','DOCENTE') THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'asignado_por_tipo debe ser ALUMNO o DOCENTE.';
  END IF;
  IF NEW.estado = 1 AND NEW.tipo_participacion = 'ENCARGADO'
     AND EXISTS (
       SELECT 1
       FROM historia_docente hd
       WHERE hd.id_historia_clinica = NEW.id_historia_clinica
         AND hd.estado = 1
         AND hd.tipo_participacion = 'ENCARGADO'
         AND hd.id_historia_docente <> NEW.id_historia_docente
     ) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La historia clínica ya tiene un docente ENCARGADO activo.';
  END IF;
END$$

CREATE TRIGGER trg_historia_estado_ai
AFTER INSERT ON historia_clinica
FOR EACH ROW
BEGIN
  INSERT INTO historia_clinica_estado_historial
    (id_historia_clinica, id_estado_historia, fecha_estado, tipo_usuario, id_usuario)
  VALUES
    (NEW.id_historia_clinica, NEW.id_estado_historia, NEW.creado_en,
     COALESCE(NEW.creado_por_tipo, 'SISTEMA'), NEW.creado_por_id);
END$$

CREATE TRIGGER trg_historia_estado_au
AFTER UPDATE ON historia_clinica
FOR EACH ROW
BEGIN
  IF NEW.id_estado_historia <> OLD.id_estado_historia THEN
    INSERT INTO historia_clinica_estado_historial
      (id_historia_clinica, id_estado_historia, fecha_estado, tipo_usuario, id_usuario)
    VALUES
      (NEW.id_historia_clinica, NEW.id_estado_historia, NEW.actualizado_en,
       COALESCE(NEW.actualizado_por_tipo, 'SISTEMA'), NEW.actualizado_por_id);
  END IF;
END$$

DELIMITER ;

-- =============================================================
-- VISTAS DE APOYO
-- =============================================================

CREATE VIEW vista_usuarios_sistema AS
SELECT
  ua.id_usuario_alumno AS id_usuario,
  'ALUMNO' AS tipo_usuario,
  ua.id_alumno AS id_actor,
  CONCAT(a.nombres, ' ', a.apellidos) AS nombre_completo,
  a.tipo_documento,
  a.numero_documento,
  ua.nombre_usuario,
  ua.id_rol,
  r.codigo_rol,
  r.nombre_rol,
  ua.estado,
  ua.ultimo_inicio_sesion,
  ua.bloqueado_hasta
FROM usuario_alumno ua
JOIN alumno a ON a.id_alumno = ua.id_alumno
JOIN rol r ON r.id_rol = ua.id_rol
UNION ALL
SELECT
  ud.id_usuario_docente AS id_usuario,
  'DOCENTE' AS tipo_usuario,
  ud.id_docente AS id_actor,
  CONCAT(d.nombres, ' ', d.apellidos) AS nombre_completo,
  d.tipo_documento,
  d.numero_documento,
  ud.nombre_usuario,
  ud.id_rol,
  r.codigo_rol,
  r.nombre_rol,
  ud.estado,
  ud.ultimo_inicio_sesion,
  ud.bloqueado_hasta
FROM usuario_docente ud
JOIN docente d ON d.id_docente = ud.id_docente
JOIN rol r ON r.id_rol = ud.id_rol;

CREATE VIEW vista_accesos_rol AS
SELECT
  r.id_rol,
  r.codigo_rol,
  r.nombre_rol,
  r.tipo_usuario,
  m.id_modulo,
  m.codigo_modulo,
  m.nombre_modulo,
  s.id_submodulo,
  s.codigo_submodulo,
  s.nombre_submodulo
FROM rol_submodulo rs
JOIN rol r ON r.id_rol = rs.id_rol AND r.estado = 1
JOIN submodulo s ON s.id_submodulo = rs.id_submodulo AND s.estado = 1
JOIN modulo m ON m.id_modulo = s.id_modulo AND m.estado = 1
WHERE rs.estado = 1;

CREATE VIEW vista_historia_resumen AS
SELECT
  h.id_historia_clinica,
  h.numero_historia,
  h.id_paciente,
  p.id_periodo_academico,
  p.codigo AS periodo_academico,
  p.anio,
  p.semestre,
  e.id_estado_historia,
  e.codigo AS codigo_estado,
  e.nombre AS estado_actual,
  h.fecha_apertura,
  h.fecha_cierre,
  h.creado_en,
  h.actualizado_en
FROM historia_clinica h
JOIN periodo_academico p ON p.id_periodo_academico = h.id_periodo_academico
JOIN estado_historia_clinica e ON e.id_estado_historia = h.id_estado_historia;

SET FOREIGN_KEY_CHECKS = 1;

-- FIN DEL SCRIPT
