/* SISTEMA DE HISTORIA CLINICA ODONTOLOGICA - FACULTAD DE ODONTOLOGIA UNDAC / MYSQL 8.4+ */

CREATE DATABASE IF NOT EXISTS bd_clinica_undac CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE bd_clinica_undac;

SET NAMES utf8mb4;

SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS `configuracion_sistema`;

DROP TABLE IF EXISTS `auditoria`;

DROP TABLE IF EXISTS `login_historial`;

DROP TABLE IF EXISTS `firma_seguimiento`;

DROP TABLE IF EXISTS `seguimiento_quirurgico`;

DROP TABLE IF EXISTS `epicrisis`;

DROP TABLE IF EXISTS `alta_clinica`;

DROP TABLE IF EXISTS `prescripcion`;

DROP TABLE IF EXISTS `signo_vital_operatorio`;

DROP TABLE IF EXISTS `reporte_operatorio`;

DROP TABLE IF EXISTS `programacion_cirugia`;

DROP TABLE IF EXISTS `firma_consentimiento`;

DROP TABLE IF EXISTS `consentimiento_informado`;

DROP TABLE IF EXISTS `etapa_quirurgica`;

DROP TABLE IF EXISTS `plan_quirurgico`;

DROP TABLE IF EXISTS `fase_tratamiento`;

DROP TABLE IF EXISTS `plan_tratamiento`;

DROP TABLE IF EXISTS `diagnostico`;

DROP TABLE IF EXISTS `protesis`;

DROP TABLE IF EXISTS `perdida_dental`;

DROP TABLE IF EXISTS `examen_oclusion`;

DROP TABLE IF EXISTS `odontograma_tratamiento`;

DROP TABLE IF EXISTS `odontograma_hallazgo`;

DROP TABLE IF EXISTS `odontograma_superficie`;

DROP TABLE IF EXISTS `odontograma_pieza`;

DROP TABLE IF EXISTS `odontograma`;

DROP TABLE IF EXISTS `catalogo_tratamiento_dental`;

DROP TABLE IF EXISTS `catalogo_hallazgo_dental`;

DROP TABLE IF EXISTS `pieza_dental`;

DROP TABLE IF EXISTS `hallazgo_estomatologico`;

DROP TABLE IF EXISTS `examen_estomatologico`;

DROP TABLE IF EXISTS `examen_clinico_general`;

DROP TABLE IF EXISTS `examen_auxiliar`;

DROP TABLE IF EXISTS `archivo_clinico`;

DROP TABLE IF EXISTS `antecedente_familiar`;

DROP TABLE IF EXISTS `antecedente_anestesia`;

DROP TABLE IF EXISTS `antecedente_exodoncia`;

DROP TABLE IF EXISTS `antecedente`;

DROP TABLE IF EXISTS `respuesta_salud`;

DROP TABLE IF EXISTS `pregunta_salud`;

DROP TABLE IF EXISTS `anamnesis`;

DROP TABLE IF EXISTS `asignacion_historia`;

DROP TABLE IF EXISTS `historia_clinica`;

DROP TABLE IF EXISTS `paciente_contacto`;

DROP TABLE IF EXISTS `paciente`;

DROP TABLE IF EXISTS `alumno`;

DROP TABLE IF EXISTS `docente`;

DROP TABLE IF EXISTS `empleado`;

DROP TABLE IF EXISTS `usuario_permiso`;

DROP TABLE IF EXISTS `rol_permiso`;

DROP TABLE IF EXISTS `permiso`;

DROP TABLE IF EXISTS `usuario_submodulo`;

DROP TABLE IF EXISTS `rol_submodulo`;

DROP TABLE IF EXISTS `usuario_modulo`;

DROP TABLE IF EXISTS `rol_modulo`;

DROP TABLE IF EXISTS `usuario_rol`;

DROP TABLE IF EXISTS `usuario`;

DROP TABLE IF EXISTS `persona`;

DROP TABLE IF EXISTS `submodulo`;

DROP TABLE IF EXISTS `modulo`;

DROP TABLE IF EXISTS `rol`;

CREATE TABLE `rol` (
  `id_rol` INT AUTO_INCREMENT NOT NULL,
  `codigo_rol` VARCHAR(50) NOT NULL,
  `nombre_rol` VARCHAR(80) NOT NULL,
  `descripcion_rol` VARCHAR(255) NULL,
  `es_supervisor_general` BIT NOT NULL DEFAULT 0,
  `estado` BIT NOT NULL DEFAULT 1,
  `creado_en` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` DATETIME NULL,
  PRIMARY KEY (`id_rol`),
  CONSTRAINT uk_rol_1 UNIQUE (`codigo_rol`),
  CONSTRAINT uk_rol_2 UNIQUE (`nombre_rol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `modulo` (
  `id_modulo` INT AUTO_INCREMENT NOT NULL,
  `codigo_modulo` VARCHAR(50) NOT NULL,
  `nombre_modulo` VARCHAR(100) NOT NULL,
  `descripcion_modulo` VARCHAR(255) NULL,
  `icono` VARCHAR(80) NULL,
  `ruta` VARCHAR(255) NULL,
  `orden` INT NOT NULL DEFAULT 0,
  `estado` BIT NOT NULL DEFAULT 1,
  `creado_en` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` DATETIME NULL,
  PRIMARY KEY (`id_modulo`),
  CONSTRAINT uk_modulo_1 UNIQUE (`codigo_modulo`),
  CONSTRAINT uk_modulo_2 UNIQUE (`nombre_modulo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `submodulo` (
  `id_submodulo` INT AUTO_INCREMENT NOT NULL,
  `id_modulo` INT NOT NULL,
  `codigo_submodulo` VARCHAR(60) NOT NULL,
  `nombre_submodulo` VARCHAR(100) NOT NULL,
  `descripcion_submodulo` VARCHAR(255) NULL,
  `ruta` VARCHAR(255) NULL,
  `orden` INT NOT NULL DEFAULT 0,
  `estado` BIT NOT NULL DEFAULT 1,
  `creado_en` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` DATETIME NULL,
  PRIMARY KEY (`id_submodulo`),
  CONSTRAINT uk_submodulo_1 UNIQUE (`id_modulo`, `codigo_submodulo`),
  CONSTRAINT fk_submodulo_id_modulo FOREIGN KEY (`id_modulo`) REFERENCES `modulo`(`id_modulo`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `persona` (
  `id_persona` INT AUTO_INCREMENT NOT NULL,
  `tipo_documento` VARCHAR(20) NOT NULL DEFAULT 'DNI',
  `numero_documento` VARCHAR(20) NULL,
  `nombres` VARCHAR(100) NOT NULL,
  `apellidos` VARCHAR(120) NOT NULL,
  `fecha_nacimiento` DATE NULL,
  `sexo` CHAR(1) NULL,
  `telefono` VARCHAR(30) NULL,
  `correo` VARCHAR(150) NULL,
  `direccion` VARCHAR(250) NULL,
  `estado` BIT NOT NULL DEFAULT 1,
  `creado_en` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` DATETIME NULL,
  `eliminado_en` DATETIME NULL,
  `creado_por` INT NULL,
  `actualizado_por` INT NULL,
  PRIMARY KEY (`id_persona`),
  CONSTRAINT uk_persona_1 UNIQUE (`tipo_documento`, `numero_documento`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `usuario` (
  `id_usuario` INT AUTO_INCREMENT NOT NULL,
  `id_persona` INT NULL,
  `nombre_usuario` VARCHAR(80) NOT NULL,
  `contrasena_hash` VARCHAR(255) NOT NULL,
  `estado` BIT NOT NULL DEFAULT 1,
  `ultimo_inicio_sesion` DATETIME NULL,
  `contrasena_cambiada_en` DATETIME NULL,
  `intentos_fallidos` INT NOT NULL DEFAULT 0,
  `bloqueado_hasta` DATETIME NULL,
  `creado_en` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` DATETIME NULL,
  `creado_por` INT NULL,
  `actualizado_por` INT NULL,
  PRIMARY KEY (`id_usuario`),
  CONSTRAINT uk_usuario_1 UNIQUE (`nombre_usuario`),
  CONSTRAINT uk_usuario_2 UNIQUE (`id_persona`),
  CONSTRAINT fk_usuario_id_persona FOREIGN KEY (`id_persona`) REFERENCES `persona`(`id_persona`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `usuario_rol` (
  `id_usuario_rol` BIGINT AUTO_INCREMENT NOT NULL,
  `id_usuario` INT NOT NULL,
  `id_rol` INT NOT NULL,
  `permitido` BIT NOT NULL DEFAULT 1,
  `fecha_inicio` DATE NULL,
  `fecha_fin` DATE NULL,
  `asignado_en` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `asignado_por` INT NULL,
  PRIMARY KEY (`id_usuario_rol`),
  CONSTRAINT fk_usuario_rol_id_usuario FOREIGN KEY (`id_usuario`) REFERENCES `usuario`(`id_usuario`) ON DELETE CASCADE,
  CONSTRAINT fk_usuario_rol_id_rol FOREIGN KEY (`id_rol`) REFERENCES `rol`(`id_rol`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `rol_modulo` (
  `id_rol_modulo` BIGINT AUTO_INCREMENT NOT NULL,
  `id_rol` INT NOT NULL,
  `id_modulo` INT NOT NULL,
  `activo` BIT NOT NULL DEFAULT 1,
  `actualizado_en` DATETIME NULL,
  `actualizado_por` INT NULL,
  PRIMARY KEY (`id_rol_modulo`),
  CONSTRAINT uk_rol_modulo_1 UNIQUE (`id_rol`, `id_modulo`),
  CONSTRAINT fk_rol_modulo_id_rol FOREIGN KEY (`id_rol`) REFERENCES `rol`(`id_rol`) ON DELETE CASCADE,
  CONSTRAINT fk_rol_modulo_id_modulo FOREIGN KEY (`id_modulo`) REFERENCES `modulo`(`id_modulo`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `usuario_modulo` (
  `id_usuario_modulo` BIGINT AUTO_INCREMENT NOT NULL,
  `id_usuario` INT NOT NULL,
  `id_modulo` INT NOT NULL,
  `activo` BIT NOT NULL DEFAULT 1,
  `actualizado_en` DATETIME NULL,
  `actualizado_por` INT NULL,
  PRIMARY KEY (`id_usuario_modulo`),
  CONSTRAINT uk_usuario_modulo_1 UNIQUE (`id_usuario`, `id_modulo`),
  CONSTRAINT fk_usuario_modulo_id_usuario FOREIGN KEY (`id_usuario`) REFERENCES `usuario`(`id_usuario`) ON DELETE CASCADE,
  CONSTRAINT fk_usuario_modulo_id_modulo FOREIGN KEY (`id_modulo`) REFERENCES `modulo`(`id_modulo`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `rol_submodulo` (
  `id_rol_submodulo` BIGINT AUTO_INCREMENT NOT NULL,
  `id_rol` INT NOT NULL,
  `id_submodulo` INT NOT NULL,
  `activo` BIT NOT NULL DEFAULT 1,
  `actualizado_en` DATETIME NULL,
  `actualizado_por` INT NULL,
  PRIMARY KEY (`id_rol_submodulo`),
  CONSTRAINT uk_rol_submodulo_1 UNIQUE (`id_rol`, `id_submodulo`),
  CONSTRAINT fk_rol_submodulo_id_rol FOREIGN KEY (`id_rol`) REFERENCES `rol`(`id_rol`) ON DELETE CASCADE,
  CONSTRAINT fk_rol_submodulo_id_submodulo FOREIGN KEY (`id_submodulo`) REFERENCES `submodulo`(`id_submodulo`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `usuario_submodulo` (
  `id_usuario_submodulo` BIGINT AUTO_INCREMENT NOT NULL,
  `id_usuario` INT NOT NULL,
  `id_submodulo` INT NOT NULL,
  `activo` BIT NOT NULL DEFAULT 1,
  `actualizado_en` DATETIME NULL,
  `actualizado_por` INT NULL,
  PRIMARY KEY (`id_usuario_submodulo`),
  CONSTRAINT uk_usuario_submodulo_1 UNIQUE (`id_usuario`, `id_submodulo`),
  CONSTRAINT fk_usuario_submodulo_id_usuario FOREIGN KEY (`id_usuario`) REFERENCES `usuario`(`id_usuario`) ON DELETE CASCADE,
  CONSTRAINT fk_usuario_submodulo_id_submodulo FOREIGN KEY (`id_submodulo`) REFERENCES `submodulo`(`id_submodulo`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `permiso` (
  `id_permiso` INT AUTO_INCREMENT NOT NULL,
  `id_modulo` INT NOT NULL,
  `id_submodulo` INT NULL,
  `codigo_permiso` VARCHAR(100) NOT NULL,
  `nombre_permiso` VARCHAR(120) NOT NULL,
  `accion` VARCHAR(30) NOT NULL,
  `descripcion_permiso` VARCHAR(255) NULL,
  `estado` BIT NOT NULL DEFAULT 1,
  `creado_en` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` DATETIME NULL,
  PRIMARY KEY (`id_permiso`),
  CONSTRAINT uk_permiso_1 UNIQUE (`codigo_permiso`),
  CONSTRAINT fk_permiso_id_modulo FOREIGN KEY (`id_modulo`) REFERENCES `modulo`(`id_modulo`) ON DELETE CASCADE,
  CONSTRAINT fk_permiso_id_submodulo FOREIGN KEY (`id_submodulo`) REFERENCES `submodulo`(`id_submodulo`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `rol_permiso` (
  `id_rol_permiso` BIGINT AUTO_INCREMENT NOT NULL,
  `id_rol` INT NOT NULL,
  `id_permiso` INT NOT NULL,
  `permitido` BIT NOT NULL DEFAULT 1,
  `alcance_datos` VARCHAR(30) NOT NULL DEFAULT 'GLOBAL',
  `actualizado_en` DATETIME NULL,
  `actualizado_por` INT NULL,
  PRIMARY KEY (`id_rol_permiso`),
  CONSTRAINT uk_rol_permiso_1 UNIQUE (`id_rol`, `id_permiso`),
  CONSTRAINT fk_rol_permiso_id_rol FOREIGN KEY (`id_rol`) REFERENCES `rol`(`id_rol`) ON DELETE CASCADE,
  CONSTRAINT fk_rol_permiso_id_permiso FOREIGN KEY (`id_permiso`) REFERENCES `permiso`(`id_permiso`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `usuario_permiso` (
  `id_usuario_permiso` BIGINT AUTO_INCREMENT NOT NULL,
  `id_usuario` INT NOT NULL,
  `id_permiso` INT NOT NULL,
  `permitido` BIT NOT NULL DEFAULT 1,
  `alcance_datos` VARCHAR(30) NOT NULL DEFAULT 'GLOBAL',
  `fecha_inicio` DATE NULL,
  `fecha_fin` DATE NULL,
  `motivo` VARCHAR(255) NULL,
  `actualizado_en` DATETIME NULL,
  `actualizado_por` INT NULL,
  PRIMARY KEY (`id_usuario_permiso`),
  CONSTRAINT uk_usuario_permiso_1 UNIQUE (`id_usuario`, `id_permiso`),
  CONSTRAINT fk_usuario_permiso_id_usuario FOREIGN KEY (`id_usuario`) REFERENCES `usuario`(`id_usuario`) ON DELETE CASCADE,
  CONSTRAINT fk_usuario_permiso_id_permiso FOREIGN KEY (`id_permiso`) REFERENCES `permiso`(`id_permiso`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `empleado` (
  `id_empleado` INT AUTO_INCREMENT NOT NULL,
  `id_persona` INT NOT NULL,
  `codigo_empleado` VARCHAR(30) NULL,
  `tipo_empleado` VARCHAR(30) NOT NULL DEFAULT 'OTRO',
  `estado` BIT NOT NULL DEFAULT 1,
  `creado_en` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` DATETIME NULL,
  PRIMARY KEY (`id_empleado`),
  CONSTRAINT uk_empleado_1 UNIQUE (`id_persona`),
  CONSTRAINT uk_empleado_2 UNIQUE (`codigo_empleado`),
  CONSTRAINT fk_empleado_id_persona FOREIGN KEY (`id_persona`) REFERENCES `persona`(`id_persona`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `docente` (
  `id_docente` INT AUTO_INCREMENT NOT NULL,
  `id_empleado` INT NOT NULL,
  `numero_colegiatura` VARCHAR(30) NULL,
  `especialidad` VARCHAR(150) NULL,
  `estado` BIT NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_docente`),
  CONSTRAINT uk_docente_1 UNIQUE (`id_empleado`),
  CONSTRAINT fk_docente_id_empleado FOREIGN KEY (`id_empleado`) REFERENCES `empleado`(`id_empleado`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `alumno` (
  `id_alumno` INT AUTO_INCREMENT NOT NULL,
  `id_empleado` INT NOT NULL,
  `codigo_alumno` VARCHAR(30) NULL,
  `semestre` VARCHAR(30) NULL,
  `ano_academico` SMALLINT NULL,
  `estado` BIT NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_alumno`),
  CONSTRAINT uk_alumno_1 UNIQUE (`id_empleado`),
  CONSTRAINT uk_alumno_2 UNIQUE (`codigo_alumno`),
  CONSTRAINT fk_alumno_id_empleado FOREIGN KEY (`id_empleado`) REFERENCES `empleado`(`id_empleado`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `paciente` (
  `id_paciente` INT AUTO_INCREMENT NOT NULL,
  `id_persona` INT NOT NULL,
  `ocupacion` VARCHAR(120) NULL,
  `procedencia` VARCHAR(150) NULL,
  `estado_civil` VARCHAR(40) NULL,
  `estado` BIT NOT NULL DEFAULT 1,
  `creado_en` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` DATETIME NULL,
  `eliminado_en` DATETIME NULL,
  `creado_por` INT NULL,
  `actualizado_por` INT NULL,
  PRIMARY KEY (`id_paciente`),
  CONSTRAINT uk_paciente_1 UNIQUE (`id_persona`),
  CONSTRAINT fk_paciente_id_persona FOREIGN KEY (`id_persona`) REFERENCES `persona`(`id_persona`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `paciente_contacto` (
  `id_contacto` INT AUTO_INCREMENT NOT NULL,
  `id_paciente` INT NOT NULL,
  `tipo_contacto` VARCHAR(30) NOT NULL,
  `nombre_completo` VARCHAR(180) NOT NULL,
  `parentesco` VARCHAR(80) NULL,
  `telefono` VARCHAR(30) NULL,
  `correo` VARCHAR(150) NULL,
  `es_principal` BIT NOT NULL DEFAULT 0,
  `observaciones` VARCHAR(255) NULL,
  `estado` BIT NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_contacto`),
  CONSTRAINT fk_paciente_contacto_id_paciente FOREIGN KEY (`id_paciente`) REFERENCES `paciente`(`id_paciente`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `historia_clinica` (
  `id_historia_clinica` BIGINT AUTO_INCREMENT NOT NULL,
  `numero_historia` VARCHAR(30) NOT NULL,
  `id_paciente` INT NOT NULL,
  `id_alumno_operador` INT NOT NULL,
  `id_docente_supervisor` INT NULL,
  `semestre` VARCHAR(30) NULL,
  `ano_academico` SMALLINT NULL,
  `fecha_apertura` DATE NOT NULL,
  `tipo_atencion` VARCHAR(30) NULL,
  `motivo_consulta` TEXT NULL,
  `estado_historia` VARCHAR(30) NOT NULL DEFAULT 'ABIERTA',
  `fecha_cierre` DATE NULL,
  `observaciones` TEXT NULL,
  `creado_en` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` DATETIME NULL,
  `eliminado_en` DATETIME NULL,
  `creado_por` INT NULL,
  `actualizado_por` INT NULL,
  PRIMARY KEY (`id_historia_clinica`),
  CONSTRAINT uk_historia_clinica_1 UNIQUE (`numero_historia`),
  CONSTRAINT fk_historia_clinica_id_paciente FOREIGN KEY (`id_paciente`) REFERENCES `paciente`(`id_paciente`) ON DELETE RESTRICT,
  CONSTRAINT fk_historia_clinica_id_alumno_operador FOREIGN KEY (`id_alumno_operador`) REFERENCES `alumno`(`id_alumno`) ON DELETE RESTRICT,
  CONSTRAINT fk_historia_clinica_id_docente_supervisor FOREIGN KEY (`id_docente_supervisor`) REFERENCES `docente`(`id_docente`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `asignacion_historia` (
  `id_asignacion` BIGINT AUTO_INCREMENT NOT NULL,
  `id_historia_clinica` BIGINT NOT NULL,
  `id_alumno` INT NOT NULL,
  `id_docente` INT NULL,
  `tipo_asignacion` VARCHAR(30) NOT NULL DEFAULT 'ASIGNACION',
  `fecha_inicio` DATE NOT NULL,
  `fecha_fin` DATE NULL,
  `estado` BIT NOT NULL DEFAULT 1,
  `observaciones` VARCHAR(255) NULL,
  `creado_en` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `creado_por` INT NULL,
  PRIMARY KEY (`id_asignacion`),
  CONSTRAINT fk_asignacion_historia_id_historia_clinica FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica`(`id_historia_clinica`) ON DELETE CASCADE,
  CONSTRAINT fk_asignacion_historia_id_alumno FOREIGN KEY (`id_alumno`) REFERENCES `alumno`(`id_alumno`) ON DELETE RESTRICT,
  CONSTRAINT fk_asignacion_historia_id_docente FOREIGN KEY (`id_docente`) REFERENCES `docente`(`id_docente`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `anamnesis` (
  `id_anamnesis` BIGINT AUTO_INCREMENT NOT NULL,
  `id_historia_clinica` BIGINT NOT NULL,
  `enfermedad_actual` TEXT NULL,
  `tiempo_enfermedad` VARCHAR(100) NULL,
  `forma_inicio` VARCHAR(100) NULL,
  `evolucion` TEXT NULL,
  `motivo_consulta` TEXT NULL,
  `observaciones` TEXT NULL,
  `creado_en` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` DATETIME NULL,
  PRIMARY KEY (`id_anamnesis`),
  CONSTRAINT uk_anamnesis_1 UNIQUE (`id_historia_clinica`),
  CONSTRAINT fk_anamnesis_id_historia_clinica FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica`(`id_historia_clinica`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `pregunta_salud` (
  `id_pregunta_salud` SMALLINT AUTO_INCREMENT NOT NULL,
  `numero` SMALLINT NOT NULL,
  `texto_pregunta` TEXT NOT NULL,
  `requiere_detalle` BIT NOT NULL DEFAULT 0,
  `texto_detalle` VARCHAR(255) NULL,
  `orden` SMALLINT NOT NULL,
  `estado` BIT NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_pregunta_salud`),
  CONSTRAINT uk_pregunta_salud_1 UNIQUE (`numero`),
  CONSTRAINT uk_pregunta_salud_2 UNIQUE (`orden`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `respuesta_salud` (
  `id_respuesta_salud` BIGINT AUTO_INCREMENT NOT NULL,
  `id_historia_clinica` BIGINT NOT NULL,
  `id_pregunta_salud` SMALLINT NOT NULL,
  `respuesta` BIT NOT NULL,
  `detalle` TEXT NULL,
  `actualizado_en` DATETIME NULL,
  PRIMARY KEY (`id_respuesta_salud`),
  CONSTRAINT uk_respuesta_salud_1 UNIQUE (`id_historia_clinica`, `id_pregunta_salud`),
  CONSTRAINT fk_respuesta_salud_id_historia_clinica FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica`(`id_historia_clinica`) ON DELETE CASCADE,
  CONSTRAINT fk_respuesta_salud_id_pregunta_salud FOREIGN KEY (`id_pregunta_salud`) REFERENCES `pregunta_salud`(`id_pregunta_salud`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `antecedente` (
  `id_antecedente` BIGINT AUTO_INCREMENT NOT NULL,
  `id_historia_clinica` BIGINT NOT NULL,
  `tipo_antecedente` VARCHAR(30) NOT NULL,
  `descripcion` TEXT NULL,
  `fecha_referencia` DATE NULL,
  `observaciones` TEXT NULL,
  `creado_en` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` DATETIME NULL,
  PRIMARY KEY (`id_antecedente`),
  CONSTRAINT fk_antecedente_id_historia_clinica FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica`(`id_historia_clinica`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `antecedente_exodoncia` (
  `id_antecedente_exodoncia` BIGINT AUTO_INCREMENT NOT NULL,
  `id_historia_clinica` BIGINT NOT NULL,
  `fecha_exodoncia` DATE NULL,
  `pieza_dental` VARCHAR(10) NULL,
  `motivo` VARCHAR(100) NULL,
  `complicaciones` TEXT NULL,
  `observaciones` TEXT NULL,
  PRIMARY KEY (`id_antecedente_exodoncia`),
  CONSTRAINT fk_antecedente_exodoncia_id_historia_clinica FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica`(`id_historia_clinica`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `antecedente_anestesia` (
  `id_antecedente_anestesia` BIGINT AUTO_INCREMENT NOT NULL,
  `id_historia_clinica` BIGINT NOT NULL,
  `fecha_reaccion` DATE NULL,
  `tipo_anestesia` VARCHAR(100) NULL,
  `hubo_reaccion` BIT NOT NULL DEFAULT 0,
  `descripcion_reaccion` TEXT NULL,
  `observaciones` TEXT NULL,
  PRIMARY KEY (`id_antecedente_anestesia`),
  CONSTRAINT fk_antecedente_anestesia_id_historia_clinica FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica`(`id_historia_clinica`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `antecedente_familiar` (
  `id_antecedente_familiar` BIGINT AUTO_INCREMENT NOT NULL,
  `id_historia_clinica` BIGINT NOT NULL,
  `familiar` VARCHAR(80) NOT NULL,
  `estado_salud` VARCHAR(120) NULL,
  `enfermedad` VARCHAR(180) NULL,
  `observaciones` TEXT NULL,
  PRIMARY KEY (`id_antecedente_familiar`),
  CONSTRAINT fk_antecedente_familiar_id_historia_clinica FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica`(`id_historia_clinica`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `archivo_clinico` (
  `id_archivo` BIGINT AUTO_INCREMENT NOT NULL,
  `id_historia_clinica` BIGINT NOT NULL,
  `tipo_archivo` VARCHAR(40) NOT NULL,
  `nombre_original` VARCHAR(255) NOT NULL,
  `nombre_guardado` VARCHAR(255) NOT NULL,
  `ruta_archivo` VARCHAR(500) NOT NULL,
  `extension` VARCHAR(20) NULL,
  `tipo_mime` VARCHAR(120) NULL,
  `tamano_bytes` BIGINT NULL,
  `descripcion` TEXT NULL,
  `fecha_carga` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `id_usuario_carga` INT NULL,
  `estado` BIT NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_archivo`),
  CONSTRAINT fk_archivo_clinico_id_historia_clinica FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica`(`id_historia_clinica`) ON DELETE CASCADE,
  CONSTRAINT fk_archivo_clinico_id_usuario_carga FOREIGN KEY (`id_usuario_carga`) REFERENCES `usuario`(`id_usuario`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `examen_auxiliar` (
  `id_examen_auxiliar` BIGINT AUTO_INCREMENT NOT NULL,
  `id_historia_clinica` BIGINT NOT NULL,
  `tipo_examen` VARCHAR(40) NOT NULL,
  `nombre_examen` VARCHAR(180) NULL,
  `fecha_examen` DATE NULL,
  `resultado` TEXT NULL,
  `interpretacion` TEXT NULL,
  `id_archivo` BIGINT NULL,
  `observaciones` TEXT NULL,
  `creado_en` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` DATETIME NULL,
  PRIMARY KEY (`id_examen_auxiliar`),
  CONSTRAINT fk_examen_auxiliar_id_historia_clinica FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica`(`id_historia_clinica`) ON DELETE CASCADE,
  CONSTRAINT fk_examen_auxiliar_id_archivo FOREIGN KEY (`id_archivo`) REFERENCES `archivo_clinico`(`id_archivo`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `examen_clinico_general` (
  `id_examen_clinico` BIGINT AUTO_INCREMENT NOT NULL,
  `id_historia_clinica` BIGINT NOT NULL,
  `presion_arterial` VARCHAR(30) NULL,
  `frecuencia_cardiaca` DECIMAL(6,2) NULL,
  `frecuencia_respiratoria` DECIMAL(6,2) NULL,
  `temperatura` DECIMAL(4,1) NULL,
  `peso_kg` DECIMAL(6,2) NULL,
  `talla_cm` DECIMAL(6,2) NULL,
  `tipo_psicologico` VARCHAR(100) NULL,
  `marcha` VARCHAR(100) NULL,
  `cabeza` TEXT NULL,
  `cuello` TEXT NULL,
  `extremidades` TEXT NULL,
  `torax` TEXT NULL,
  `observaciones` TEXT NULL,
  `creado_en` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` DATETIME NULL,
  PRIMARY KEY (`id_examen_clinico`),
  CONSTRAINT uk_examen_clinico_general_1 UNIQUE (`id_historia_clinica`),
  CONSTRAINT fk_examen_clinico_general_id_historia_clinica FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica`(`id_historia_clinica`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `examen_estomatologico` (
  `id_examen_estomatologico` BIGINT AUTO_INCREMENT NOT NULL,
  `id_historia_clinica` BIGINT NOT NULL,
  `tipo_examen` VARCHAR(30) NOT NULL,
  `estructura_anatomica` VARCHAR(100) NOT NULL,
  `estado_estructura` VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
  `descripcion` TEXT NULL,
  `observaciones` TEXT NULL,
  `creado_en` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` DATETIME NULL,
  PRIMARY KEY (`id_examen_estomatologico`),
  CONSTRAINT fk_examen_estomatologico_id_historia_clinica FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica`(`id_historia_clinica`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `hallazgo_estomatologico` (
  `id_hallazgo` BIGINT AUTO_INCREMENT NOT NULL,
  `id_examen_estomatologico` BIGINT NOT NULL,
  `descripcion` TEXT NOT NULL,
  `tipo_hallazgo` VARCHAR(60) NULL,
  `severidad` VARCHAR(30) NULL,
  PRIMARY KEY (`id_hallazgo`),
  CONSTRAINT fk_hallazgo_estomatologico_id_examen_estomatologico FOREIGN KEY (`id_examen_estomatologico`) REFERENCES `examen_estomatologico`(`id_examen_estomatologico`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `pieza_dental` (
  `id_pieza_dental` SMALLINT AUTO_INCREMENT NOT NULL,
  `codigo_fdi` VARCHAR(3) NOT NULL,
  `denticion` VARCHAR(20) NOT NULL,
  `cuadrante` SMALLINT NOT NULL,
  `tipo_pieza` VARCHAR(30) NOT NULL,
  `nombre_pieza` VARCHAR(100) NOT NULL,
  `orden_visual` SMALLINT NOT NULL,
  `estado` BIT NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_pieza_dental`),
  CONSTRAINT uk_pieza_dental_1 UNIQUE (`codigo_fdi`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `catalogo_hallazgo_dental` (
  `id_hallazgo_dental` SMALLINT AUTO_INCREMENT NOT NULL,
  `codigo_hallazgo` VARCHAR(50) NOT NULL,
  `nombre_hallazgo` VARCHAR(120) NOT NULL,
  `categoria` VARCHAR(60) NOT NULL,
  `permite_superficie` BIT NOT NULL DEFAULT 1,
  `simbolo` VARCHAR(30) NULL,
  `descripcion` VARCHAR(255) NULL,
  `estado` BIT NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_hallazgo_dental`),
  CONSTRAINT uk_catalogo_hallazgo_dental_1 UNIQUE (`codigo_hallazgo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `catalogo_tratamiento_dental` (
  `id_tratamiento_dental` SMALLINT AUTO_INCREMENT NOT NULL,
  `codigo_tratamiento` VARCHAR(50) NOT NULL,
  `nombre_tratamiento` VARCHAR(150) NOT NULL,
  `categoria` VARCHAR(60) NULL,
  `descripcion` VARCHAR(255) NULL,
  `estado` BIT NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_tratamiento_dental`),
  CONSTRAINT uk_catalogo_tratamiento_dental_1 UNIQUE (`codigo_tratamiento`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `odontograma` (
  `id_odontograma` BIGINT AUTO_INCREMENT NOT NULL,
  `id_historia_clinica` BIGINT NOT NULL,
  `tipo_denticion` VARCHAR(20) NOT NULL DEFAULT 'PERMANENTE',
  `fecha_registro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `es_actual` BIT NOT NULL DEFAULT 1,
  `estado` VARCHAR(20) NOT NULL DEFAULT 'ACTIVO',
  `observaciones` TEXT NULL,
  `id_usuario_registro` INT NULL,
  PRIMARY KEY (`id_odontograma`),
  CONSTRAINT fk_odontograma_id_historia_clinica FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica`(`id_historia_clinica`) ON DELETE CASCADE,
  CONSTRAINT fk_odontograma_id_usuario_registro FOREIGN KEY (`id_usuario_registro`) REFERENCES `usuario`(`id_usuario`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `odontograma_pieza` (
  `id_odontograma_pieza` BIGINT AUTO_INCREMENT NOT NULL,
  `id_odontograma` BIGINT NOT NULL,
  `id_pieza_dental` SMALLINT NOT NULL,
  `estado_pieza` VARCHAR(40) NOT NULL DEFAULT 'SANA',
  `movilidad` VARCHAR(30) NULL,
  `perdida` BIT NOT NULL DEFAULT 0,
  `motivo_perdida` VARCHAR(80) NULL,
  `observaciones` TEXT NULL,
  PRIMARY KEY (`id_odontograma_pieza`),
  CONSTRAINT uk_odontograma_pieza_1 UNIQUE (`id_odontograma`, `id_pieza_dental`),
  CONSTRAINT fk_odontograma_pieza_id_odontograma FOREIGN KEY (`id_odontograma`) REFERENCES `odontograma`(`id_odontograma`) ON DELETE CASCADE,
  CONSTRAINT fk_odontograma_pieza_id_pieza_dental FOREIGN KEY (`id_pieza_dental`) REFERENCES `pieza_dental`(`id_pieza_dental`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `odontograma_superficie` (
  `id_odontograma_superficie` BIGINT AUTO_INCREMENT NOT NULL,
  `id_odontograma_pieza` BIGINT NOT NULL,
  `superficie` VARCHAR(20) NOT NULL,
  `estado_superficie` VARCHAR(40) NOT NULL DEFAULT 'SANA',
  `observaciones` VARCHAR(255) NULL,
  PRIMARY KEY (`id_odontograma_superficie`),
  CONSTRAINT uk_odontograma_superficie_1 UNIQUE (`id_odontograma_pieza`, `superficie`),
  CONSTRAINT fk_odontograma_superficie_id_odontograma_pieza FOREIGN KEY (`id_odontograma_pieza`) REFERENCES `odontograma_pieza`(`id_odontograma_pieza`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `odontograma_hallazgo` (
  `id_odontograma_hallazgo` BIGINT AUTO_INCREMENT NOT NULL,
  `id_odontograma_pieza` BIGINT NOT NULL,
  `id_hallazgo_dental` SMALLINT NOT NULL,
  `id_odontograma_superficie` BIGINT NULL,
  `descripcion` TEXT NULL,
  `activo` BIT NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_odontograma_hallazgo`),
  CONSTRAINT fk_odontograma_hallazgo_id_odontograma_pieza FOREIGN KEY (`id_odontograma_pieza`) REFERENCES `odontograma_pieza`(`id_odontograma_pieza`) ON DELETE CASCADE,
  CONSTRAINT fk_odontograma_hallazgo_id_hallazgo_dental FOREIGN KEY (`id_hallazgo_dental`) REFERENCES `catalogo_hallazgo_dental`(`id_hallazgo_dental`) ON DELETE RESTRICT,
  CONSTRAINT fk_odontograma_hallazgo_id_odontograma_superficie FOREIGN KEY (`id_odontograma_superficie`) REFERENCES `odontograma_superficie`(`id_odontograma_superficie`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `odontograma_tratamiento` (
  `id_odontograma_tratamiento` BIGINT AUTO_INCREMENT NOT NULL,
  `id_odontograma_pieza` BIGINT NOT NULL,
  `id_tratamiento_dental` SMALLINT NOT NULL,
  `id_odontograma_superficie` BIGINT NULL,
  `estado_tratamiento` VARCHAR(30) NOT NULL DEFAULT 'PLANIFICADO',
  `fecha_tratamiento` DATE NULL,
  `observaciones` TEXT NULL,
  PRIMARY KEY (`id_odontograma_tratamiento`),
  CONSTRAINT fk_odontograma_tratamiento_id_odontograma_pieza FOREIGN KEY (`id_odontograma_pieza`) REFERENCES `odontograma_pieza`(`id_odontograma_pieza`) ON DELETE CASCADE,
  CONSTRAINT fk_odontograma_tratamiento_id_tratamiento_dental FOREIGN KEY (`id_tratamiento_dental`) REFERENCES `catalogo_tratamiento_dental`(`id_tratamiento_dental`) ON DELETE RESTRICT,
  CONSTRAINT fk_odontograma_tratamiento_id_odontograma_superficie FOREIGN KEY (`id_odontograma_superficie`) REFERENCES `odontograma_superficie`(`id_odontograma_superficie`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `examen_oclusion` (
  `id_examen_oclusion` BIGINT AUTO_INCREMENT NOT NULL,
  `id_historia_clinica` BIGINT NOT NULL,
  `clasificacion_posterior` VARCHAR(60) NULL,
  `clasificacion_anterior` VARCHAR(60) NULL,
  `mordida` VARCHAR(100) NULL,
  `observaciones` TEXT NULL,
  PRIMARY KEY (`id_examen_oclusion`),
  CONSTRAINT uk_examen_oclusion_1 UNIQUE (`id_historia_clinica`),
  CONSTRAINT fk_examen_oclusion_id_historia_clinica FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica`(`id_historia_clinica`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `perdida_dental` (
  `id_perdida_dental` BIGINT AUTO_INCREMENT NOT NULL,
  `id_historia_clinica` BIGINT NOT NULL,
  `id_pieza_dental` SMALLINT NULL,
  `fecha_perdida` DATE NULL,
  `motivo` VARCHAR(80) NOT NULL,
  `descripcion` TEXT NULL,
  PRIMARY KEY (`id_perdida_dental`),
  CONSTRAINT fk_perdida_dental_id_historia_clinica FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica`(`id_historia_clinica`) ON DELETE CASCADE,
  CONSTRAINT fk_perdida_dental_id_pieza_dental FOREIGN KEY (`id_pieza_dental`) REFERENCES `pieza_dental`(`id_pieza_dental`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `protesis` (
  `id_protesis` BIGINT AUTO_INCREMENT NOT NULL,
  `id_historia_clinica` BIGINT NOT NULL,
  `tipo_protesis` VARCHAR(40) NOT NULL,
  `confeccionada_por` VARCHAR(40) NULL,
  `descripcion` TEXT NULL,
  `estado` VARCHAR(30) NULL,
  `observaciones` TEXT NULL,
  PRIMARY KEY (`id_protesis`),
  CONSTRAINT fk_protesis_id_historia_clinica FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica`(`id_historia_clinica`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `diagnostico` (
  `id_diagnostico` BIGINT AUTO_INCREMENT NOT NULL,
  `id_historia_clinica` BIGINT NOT NULL,
  `tipo_diagnostico` VARCHAR(40) NOT NULL,
  `numero_version` INT NOT NULL DEFAULT 1,
  `descripcion` TEXT NOT NULL,
  `es_actual` BIT NOT NULL DEFAULT 1,
  `creado_en` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `id_usuario_registro` INT NULL,
  PRIMARY KEY (`id_diagnostico`),
  CONSTRAINT uk_diagnostico_1 UNIQUE (`id_historia_clinica`, `tipo_diagnostico`, `numero_version`),
  CONSTRAINT fk_diagnostico_id_historia_clinica FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica`(`id_historia_clinica`) ON DELETE CASCADE,
  CONSTRAINT fk_diagnostico_id_usuario_registro FOREIGN KEY (`id_usuario_registro`) REFERENCES `usuario`(`id_usuario`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `plan_tratamiento` (
  `id_plan_tratamiento` BIGINT AUTO_INCREMENT NOT NULL,
  `id_historia_clinica` BIGINT NOT NULL,
  `tipo_plan` VARCHAR(30) NOT NULL DEFAULT 'INTEGRAL',
  `descripcion` TEXT NULL,
  `estado` VARCHAR(30) NOT NULL DEFAULT 'BORRADOR',
  `creado_en` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` DATETIME NULL,
  PRIMARY KEY (`id_plan_tratamiento`),
  CONSTRAINT fk_plan_tratamiento_id_historia_clinica FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica`(`id_historia_clinica`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `fase_tratamiento` (
  `id_fase_tratamiento` BIGINT AUTO_INCREMENT NOT NULL,
  `id_plan_tratamiento` BIGINT NOT NULL,
  `numero_fase` INT NOT NULL,
  `nombre_fase` VARCHAR(150) NOT NULL,
  `descripcion` TEXT NULL,
  `orden` INT NOT NULL DEFAULT 0,
  `estado` VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE',
  PRIMARY KEY (`id_fase_tratamiento`),
  CONSTRAINT uk_fase_tratamiento_1 UNIQUE (`id_plan_tratamiento`, `numero_fase`),
  CONSTRAINT fk_fase_tratamiento_id_plan_tratamiento FOREIGN KEY (`id_plan_tratamiento`) REFERENCES `plan_tratamiento`(`id_plan_tratamiento`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `plan_quirurgico` (
  `id_plan_quirurgico` BIGINT AUTO_INCREMENT NOT NULL,
  `id_historia_clinica` BIGINT NOT NULL,
  `procedimiento` VARCHAR(255) NULL,
  `diagnostico_preoperatorio` TEXT NULL,
  `indicacion_quirurgica` TEXT NULL,
  `estado` VARCHAR(30) NOT NULL DEFAULT 'PLANIFICADO',
  `creado_en` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` DATETIME NULL,
  PRIMARY KEY (`id_plan_quirurgico`),
  CONSTRAINT fk_plan_quirurgico_id_historia_clinica FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica`(`id_historia_clinica`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `etapa_quirurgica` (
  `id_etapa_quirurgica` BIGINT AUTO_INCREMENT NOT NULL,
  `id_plan_quirurgico` BIGINT NOT NULL,
  `etapa` VARCHAR(30) NOT NULL,
  `descripcion` TEXT NULL,
  `orden` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id_etapa_quirurgica`),
  CONSTRAINT fk_etapa_quirurgica_id_plan_quirurgico FOREIGN KEY (`id_plan_quirurgico`) REFERENCES `plan_quirurgico`(`id_plan_quirurgico`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `consentimiento_informado` (
  `id_consentimiento` BIGINT AUTO_INCREMENT NOT NULL,
  `id_historia_clinica` BIGINT NOT NULL,
  `version_documento` VARCHAR(30) NOT NULL,
  `texto_institucional` TEXT NOT NULL,
  `fecha_consentimiento` DATE NULL,
  `estado` VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE',
  `creado_en` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` DATETIME NULL,
  PRIMARY KEY (`id_consentimiento`),
  CONSTRAINT uk_consentimiento_informado_1 UNIQUE (`id_historia_clinica`, `version_documento`),
  CONSTRAINT fk_consentimiento_informado_id_historia_clinica FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica`(`id_historia_clinica`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `firma_consentimiento` (
  `id_firma` BIGINT AUTO_INCREMENT NOT NULL,
  `id_consentimiento` BIGINT NOT NULL,
  `tipo_firmante` VARCHAR(30) NOT NULL,
  `nombre_firmante` VARCHAR(180) NOT NULL,
  `documento_firmante` VARCHAR(30) NULL,
  `id_archivo_firma` BIGINT NULL,
  `fecha_firma` DATETIME NULL,
  `observaciones` VARCHAR(255) NULL,
  PRIMARY KEY (`id_firma`),
  CONSTRAINT fk_firma_consentimiento_id_consentimiento FOREIGN KEY (`id_consentimiento`) REFERENCES `consentimiento_informado`(`id_consentimiento`) ON DELETE CASCADE,
  CONSTRAINT fk_firma_consentimiento_id_archivo_firma FOREIGN KEY (`id_archivo_firma`) REFERENCES `archivo_clinico`(`id_archivo`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `programacion_cirugia` (
  `id_programacion` BIGINT AUTO_INCREMENT NOT NULL,
  `id_historia_clinica` BIGINT NOT NULL,
  `id_plan_quirurgico` BIGINT NULL,
  `fecha_programada` DATE NOT NULL,
  `hora_programada` TIME NULL,
  `observaciones` TEXT NULL,
  `estado` VARCHAR(30) NOT NULL DEFAULT 'PROGRAMADA',
  PRIMARY KEY (`id_programacion`),
  CONSTRAINT fk_programacion_cirugia_id_historia_clinica FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica`(`id_historia_clinica`) ON DELETE CASCADE,
  CONSTRAINT fk_programacion_cirugia_id_plan_quirurgico FOREIGN KEY (`id_plan_quirurgico`) REFERENCES `plan_quirurgico`(`id_plan_quirurgico`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `reporte_operatorio` (
  `id_reporte_operatorio` BIGINT AUTO_INCREMENT NOT NULL,
  `id_historia_clinica` BIGINT NOT NULL,
  `id_plan_quirurgico` BIGINT NULL,
  `fecha_cirugia` DATE NULL,
  `hora_inicio` TIME NULL,
  `hora_fin` TIME NULL,
  `procedimiento_realizado` TEXT NULL,
  `hallazgos_operatorios` TEXT NULL,
  `tecnica_quirurgica` TEXT NULL,
  `complicaciones` TEXT NULL,
  `observaciones` TEXT NULL,
  `id_docente_responsable` INT NULL,
  `id_alumno_operador` INT NULL,
  `estado` VARCHAR(30) NOT NULL DEFAULT 'BORRADOR',
  `creado_en` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` DATETIME NULL,
  PRIMARY KEY (`id_reporte_operatorio`),
  CONSTRAINT fk_reporte_operatorio_id_historia_clinica FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica`(`id_historia_clinica`) ON DELETE CASCADE,
  CONSTRAINT fk_reporte_operatorio_id_plan_quirurgico FOREIGN KEY (`id_plan_quirurgico`) REFERENCES `plan_quirurgico`(`id_plan_quirurgico`) ON DELETE SET NULL,
  CONSTRAINT fk_reporte_operatorio_id_docente_responsable FOREIGN KEY (`id_docente_responsable`) REFERENCES `docente`(`id_docente`) ON DELETE SET NULL,
  CONSTRAINT fk_reporte_operatorio_id_alumno_operador FOREIGN KEY (`id_alumno_operador`) REFERENCES `alumno`(`id_alumno`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `signo_vital_operatorio` (
  `id_signo_vital` BIGINT AUTO_INCREMENT NOT NULL,
  `id_reporte_operatorio` BIGINT NOT NULL,
  `momento` VARCHAR(20) NOT NULL,
  `presion_arterial` VARCHAR(30) NULL,
  `frecuencia_cardiaca` DECIMAL(6,2) NULL,
  `frecuencia_respiratoria` DECIMAL(6,2) NULL,
  `temperatura` DECIMAL(4,1) NULL,
  `saturacion_oxigeno` DECIMAL(5,2) NULL,
  `registrado_en` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_signo_vital`),
  CONSTRAINT fk_signo_vital_operatorio_id_reporte_operatorio FOREIGN KEY (`id_reporte_operatorio`) REFERENCES `reporte_operatorio`(`id_reporte_operatorio`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `prescripcion` (
  `id_prescripcion` BIGINT AUTO_INCREMENT NOT NULL,
  `id_reporte_operatorio` BIGINT NOT NULL,
  `medicamento` VARCHAR(180) NOT NULL,
  `dosis` VARCHAR(100) NULL,
  `via_administracion` VARCHAR(80) NULL,
  `frecuencia` VARCHAR(100) NULL,
  `duracion` VARCHAR(100) NULL,
  `indicaciones` TEXT NULL,
  `observaciones` TEXT NULL,
  PRIMARY KEY (`id_prescripcion`),
  CONSTRAINT fk_prescripcion_id_reporte_operatorio FOREIGN KEY (`id_reporte_operatorio`) REFERENCES `reporte_operatorio`(`id_reporte_operatorio`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `alta_clinica` (
  `id_alta` BIGINT AUTO_INCREMENT NOT NULL,
  `id_reporte_operatorio` BIGINT NOT NULL,
  `fecha_alta` DATETIME NOT NULL,
  `condicion_paciente` VARCHAR(180) NULL,
  `indicaciones` TEXT NULL,
  `signos_alarma` TEXT NULL,
  `observaciones` TEXT NULL,
  `id_usuario_registro` INT NULL,
  PRIMARY KEY (`id_alta`),
  CONSTRAINT uk_alta_clinica_1 UNIQUE (`id_reporte_operatorio`),
  CONSTRAINT fk_alta_clinica_id_reporte_operatorio FOREIGN KEY (`id_reporte_operatorio`) REFERENCES `reporte_operatorio`(`id_reporte_operatorio`) ON DELETE CASCADE,
  CONSTRAINT fk_alta_clinica_id_usuario_registro FOREIGN KEY (`id_usuario_registro`) REFERENCES `usuario`(`id_usuario`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `epicrisis` (
  `id_epicrisis` BIGINT AUTO_INCREMENT NOT NULL,
  `id_reporte_operatorio` BIGINT NOT NULL,
  `resumen_clinico` TEXT NULL,
  `diagnostico_egreso` TEXT NULL,
  `procedimiento_realizado` TEXT NULL,
  `evolucion` TEXT NULL,
  `recomendaciones` TEXT NULL,
  `fecha_registro` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `id_usuario_registro` INT NULL,
  PRIMARY KEY (`id_epicrisis`),
  CONSTRAINT uk_epicrisis_1 UNIQUE (`id_reporte_operatorio`),
  CONSTRAINT fk_epicrisis_id_reporte_operatorio FOREIGN KEY (`id_reporte_operatorio`) REFERENCES `reporte_operatorio`(`id_reporte_operatorio`) ON DELETE CASCADE,
  CONSTRAINT fk_epicrisis_id_usuario_registro FOREIGN KEY (`id_usuario_registro`) REFERENCES `usuario`(`id_usuario`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `seguimiento_quirurgico` (
  `id_seguimiento` BIGINT AUTO_INCREMENT NOT NULL,
  `id_historia_clinica` BIGINT NOT NULL,
  `id_reporte_operatorio` BIGINT NULL,
  `numero_control` INT NOT NULL,
  `fecha_control` DATE NOT NULL,
  `procedimiento_realizado` TEXT NULL,
  `evolucion` TEXT NULL,
  `hallazgos` TEXT NULL,
  `indicaciones` TEXT NULL,
  `observaciones` TEXT NULL,
  `id_docente` INT NULL,
  `id_alumno` INT NULL,
  `creado_en` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_seguimiento`),
  CONSTRAINT uk_seguimiento_quirurgico_1 UNIQUE (`id_historia_clinica`, `numero_control`),
  CONSTRAINT fk_seguimiento_quirurgico_id_historia_clinica FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica`(`id_historia_clinica`) ON DELETE CASCADE,
  CONSTRAINT fk_seguimiento_quirurgico_id_reporte_operatorio FOREIGN KEY (`id_reporte_operatorio`) REFERENCES `reporte_operatorio`(`id_reporte_operatorio`) ON DELETE SET NULL,
  CONSTRAINT fk_seguimiento_quirurgico_id_docente FOREIGN KEY (`id_docente`) REFERENCES `docente`(`id_docente`) ON DELETE SET NULL,
  CONSTRAINT fk_seguimiento_quirurgico_id_alumno FOREIGN KEY (`id_alumno`) REFERENCES `alumno`(`id_alumno`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `firma_seguimiento` (
  `id_firma_seguimiento` BIGINT AUTO_INCREMENT NOT NULL,
  `id_seguimiento` BIGINT NOT NULL,
  `tipo_firmante` VARCHAR(30) NOT NULL,
  `id_usuario` INT NULL,
  `id_archivo_firma` BIGINT NULL,
  `fecha_firma` DATETIME NULL,
  PRIMARY KEY (`id_firma_seguimiento`),
  CONSTRAINT fk_firma_seguimiento_id_seguimiento FOREIGN KEY (`id_seguimiento`) REFERENCES `seguimiento_quirurgico`(`id_seguimiento`) ON DELETE CASCADE,
  CONSTRAINT fk_firma_seguimiento_id_usuario FOREIGN KEY (`id_usuario`) REFERENCES `usuario`(`id_usuario`) ON DELETE SET NULL,
  CONSTRAINT fk_firma_seguimiento_id_archivo_firma FOREIGN KEY (`id_archivo_firma`) REFERENCES `archivo_clinico`(`id_archivo`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `login_historial` (
  `id_login` BIGINT AUTO_INCREMENT NOT NULL,
  `id_usuario` INT NULL,
  `nombre_usuario` VARCHAR(80) NOT NULL,
  `direccion_ip` VARCHAR(45) NOT NULL,
  `agente_usuario` VARCHAR(500) NULL,
  `exito` BIT NOT NULL DEFAULT 1,
  `motivo_fallo` VARCHAR(255) NULL,
  `creado_en` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_login`),
  CONSTRAINT fk_login_historial_id_usuario FOREIGN KEY (`id_usuario`) REFERENCES `usuario`(`id_usuario`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `auditoria` (
  `id_auditoria` BIGINT AUTO_INCREMENT NOT NULL,
  `tabla_afectada` VARCHAR(100) NOT NULL,
  `id_registro` VARCHAR(100) NOT NULL,
  `accion` VARCHAR(30) NOT NULL,
  `id_usuario` INT NULL,
  `nombre_usuario` VARCHAR(80) NULL,
  `direccion_ip` VARCHAR(45) NULL,
  `agente_usuario` VARCHAR(500) NULL,
  `datos_antes` JSON NULL,
  `datos_despues` JSON NULL,
  `creado_en` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_auditoria`),
  CONSTRAINT fk_auditoria_id_usuario FOREIGN KEY (`id_usuario`) REFERENCES `usuario`(`id_usuario`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `configuracion_sistema` (
  `id_configuracion` INT AUTO_INCREMENT NOT NULL,
  `codigo_configuracion` VARCHAR(100) NOT NULL,
  `nombre_configuracion` VARCHAR(150) NOT NULL,
  `valor_texto` TEXT NULL,
  `tipo_valor` VARCHAR(30) NOT NULL DEFAULT 'TEXTO',
  `descripcion` VARCHAR(255) NULL,
  `estado` BIT NOT NULL DEFAULT 1,
  `actualizado_en` DATETIME NULL,
  `actualizado_por` INT NULL,
  PRIMARY KEY (`id_configuracion`),
  CONSTRAINT uk_configuracion_sistema_1 UNIQUE (`codigo_configuracion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO rol (codigo_rol,nombre_rol,descripcion_rol,es_supervisor_general) VALUES
('ADMINISTRADOR','Administrador','Gestion integral del sistema y configuracion.',1),
('DOCENTE','Docente','Supervision y validacion de historias clinicas.',0),
('ALUMNO_OPERADOR','Alumno operador','Registro y edicion de historias asignadas o propias.',0),
('ADMINISTRATIVO','Personal administrativo','Consulta y operaciones administrativas autorizadas.',0);
INSERT INTO modulo (codigo_modulo,nombre_modulo,orden) VALUES
('INICIO','Inicio',1),
('PACIENTES','Pacientes',2),
('HISTORIA_CLINICA','Historia clinica',3),
('CIRUGIA','Cirugia bucal y maxilofacial',4),
('REPORTES','Reportes y exportacion',5),
('GESTION_PERSONAS','Gestion de personas',6),
('CONFIGURACION','Configuracion del sistema',7),
('AUDITORIA','Auditoria',8);
INSERT INTO submodulo (id_modulo,codigo_submodulo,nombre_submodulo,orden) SELECT id_modulo,'TABLERO','Tablero',1 FROM modulo WHERE codigo_modulo='INICIO';
INSERT INTO submodulo (id_modulo,codigo_submodulo,nombre_submodulo,orden) SELECT id_modulo,'PACIENTES','Pacientes',2 FROM modulo WHERE codigo_modulo='PACIENTES';
INSERT INTO submodulo (id_modulo,codigo_submodulo,nombre_submodulo,orden) SELECT id_modulo,'HISTORIAS','Historias clinicas',3 FROM modulo WHERE codigo_modulo='HISTORIA_CLINICA';
INSERT INTO submodulo (id_modulo,codigo_submodulo,nombre_submodulo,orden) SELECT id_modulo,'ODONTOGRAMA','Odontograma',4 FROM modulo WHERE codigo_modulo='HISTORIA_CLINICA';
INSERT INTO submodulo (id_modulo,codigo_submodulo,nombre_submodulo,orden) SELECT id_modulo,'EXAMEN_CLINICO','Examen clinico',5 FROM modulo WHERE codigo_modulo='HISTORIA_CLINICA';
INSERT INTO submodulo (id_modulo,codigo_submodulo,nombre_submodulo,orden) SELECT id_modulo,'DIAGNOSTICO_TRATAMIENTO','Diagnostico y tratamiento',6 FROM modulo WHERE codigo_modulo='HISTORIA_CLINICA';
INSERT INTO submodulo (id_modulo,codigo_submodulo,nombre_submodulo,orden) SELECT id_modulo,'EXAMENES_AUXILIARES','Examenes auxiliares',7 FROM modulo WHERE codigo_modulo='HISTORIA_CLINICA';
INSERT INTO submodulo (id_modulo,codigo_submodulo,nombre_submodulo,orden) SELECT id_modulo,'CONSENTIMIENTO','Consentimiento informado',8 FROM modulo WHERE codigo_modulo='CIRUGIA';
INSERT INTO submodulo (id_modulo,codigo_submodulo,nombre_submodulo,orden) SELECT id_modulo,'PROGRAMACION','Programacion de cirugia',9 FROM modulo WHERE codigo_modulo='CIRUGIA';
INSERT INTO submodulo (id_modulo,codigo_submodulo,nombre_submodulo,orden) SELECT id_modulo,'REPORTE_OPERATORIO','Reporte operatorio',10 FROM modulo WHERE codigo_modulo='CIRUGIA';
INSERT INTO submodulo (id_modulo,codigo_submodulo,nombre_submodulo,orden) SELECT id_modulo,'SEGUIMIENTO','Seguimiento quirurgico',11 FROM modulo WHERE codigo_modulo='CIRUGIA';
INSERT INTO submodulo (id_modulo,codigo_submodulo,nombre_submodulo,orden) SELECT id_modulo,'EXPORTAR_PDF','Exportar PDF',12 FROM modulo WHERE codigo_modulo='REPORTES';
INSERT INTO submodulo (id_modulo,codigo_submodulo,nombre_submodulo,orden) SELECT id_modulo,'USUARIOS','Usuarios',13 FROM modulo WHERE codigo_modulo='GESTION_PERSONAS';
INSERT INTO submodulo (id_modulo,codigo_submodulo,nombre_submodulo,orden) SELECT id_modulo,'ROLES','Roles y permisos',14 FROM modulo WHERE codigo_modulo='GESTION_PERSONAS';
INSERT INTO submodulo (id_modulo,codigo_submodulo,nombre_submodulo,orden) SELECT id_modulo,'PACIENTES_PERSONAS','Personas y pacientes',15 FROM modulo WHERE codigo_modulo='GESTION_PERSONAS';
INSERT INTO submodulo (id_modulo,codigo_submodulo,nombre_submodulo,orden) SELECT id_modulo,'PARAMETROS','Parametros',16 FROM modulo WHERE codigo_modulo='CONFIGURACION';
INSERT INTO submodulo (id_modulo,codigo_submodulo,nombre_submodulo,orden) SELECT id_modulo,'CATALOGOS_CLINICOS','Catalogos clinicos',17 FROM modulo WHERE codigo_modulo='CONFIGURACION';
INSERT INTO submodulo (id_modulo,codigo_submodulo,nombre_submodulo,orden) SELECT id_modulo,'BITACORA','Bitacora de auditoria',18 FROM modulo WHERE codigo_modulo='AUDITORIA';
INSERT INTO permiso (id_modulo,id_submodulo,codigo_permiso,nombre_permiso,accion,descripcion_permiso) SELECT id_modulo,NULL,CONCAT(codigo_modulo,'.VER'),'Ver modulo','VER','Permite visualizar el modulo.' FROM modulo;
INSERT INTO permiso (id_modulo,id_submodulo,codigo_permiso,nombre_permiso,accion,descripcion_permiso) SELECT id_modulo,NULL,CONCAT(codigo_modulo,'.CREAR'),'Crear en modulo','CREAR','Permite crear registros.' FROM modulo;
INSERT INTO permiso (id_modulo,id_submodulo,codigo_permiso,nombre_permiso,accion,descripcion_permiso) SELECT id_modulo,NULL,CONCAT(codigo_modulo,'.EDITAR'),'Editar en modulo','EDITAR','Permite editar registros.' FROM modulo;
INSERT INTO permiso (id_modulo,id_submodulo,codigo_permiso,nombre_permiso,accion,descripcion_permiso) SELECT id_modulo,NULL,CONCAT(codigo_modulo,'.ELIMINAR'),'Eliminar en modulo','ELIMINAR','Permite eliminar o anular registros.' FROM modulo;
INSERT INTO permiso (id_modulo,id_submodulo,codigo_permiso,nombre_permiso,accion,descripcion_permiso) SELECT id_modulo,NULL,CONCAT(codigo_modulo,'.EXPORTAR'),'Exportar modulo','EXPORTAR','Permite exportar informacion.' FROM modulo;
INSERT INTO permiso (id_modulo,id_submodulo,codigo_permiso,nombre_permiso,accion,descripcion_permiso) SELECT s.id_modulo,s.id_submodulo,CONCAT(m.codigo_modulo,'.',s.codigo_submodulo,'.VER'),CONCAT('Ver ',s.nombre_submodulo),'VER','Permiso configurable por submodulo.' FROM submodulo s JOIN modulo m ON m.id_modulo=s.id_modulo;
INSERT INTO permiso (id_modulo,id_submodulo,codigo_permiso,nombre_permiso,accion,descripcion_permiso) SELECT s.id_modulo,s.id_submodulo,CONCAT(m.codigo_modulo,'.',s.codigo_submodulo,'.CREAR'),CONCAT('Crear en ',s.nombre_submodulo),'CREAR','Permiso configurable por submodulo.' FROM submodulo s JOIN modulo m ON m.id_modulo=s.id_modulo;
INSERT INTO permiso (id_modulo,id_submodulo,codigo_permiso,nombre_permiso,accion,descripcion_permiso) SELECT s.id_modulo,s.id_submodulo,CONCAT(m.codigo_modulo,'.',s.codigo_submodulo,'.EDITAR'),CONCAT('Editar ',s.nombre_submodulo),'EDITAR','Permiso configurable por submodulo.' FROM submodulo s JOIN modulo m ON m.id_modulo=s.id_modulo;
INSERT INTO permiso (id_modulo,id_submodulo,codigo_permiso,nombre_permiso,accion,descripcion_permiso) SELECT s.id_modulo,s.id_submodulo,CONCAT(m.codigo_modulo,'.',s.codigo_submodulo,'.ELIMINAR'),CONCAT('Eliminar ',s.nombre_submodulo),'ELIMINAR','Permiso configurable por submodulo.' FROM submodulo s JOIN modulo m ON m.id_modulo=s.id_modulo;
INSERT INTO permiso (id_modulo,id_submodulo,codigo_permiso,nombre_permiso,accion,descripcion_permiso) SELECT s.id_modulo,s.id_submodulo,CONCAT(m.codigo_modulo,'.',s.codigo_submodulo,'.EXPORTAR'),CONCAT('Exportar ',s.nombre_submodulo),'EXPORTAR','Permiso configurable por submodulo.' FROM submodulo s JOIN modulo m ON m.id_modulo=s.id_modulo;
INSERT INTO rol_modulo (id_rol,id_modulo,activo) SELECT r.id_rol,m.id_modulo,1 FROM rol r CROSS JOIN modulo m WHERE r.codigo_rol='ADMINISTRADOR';
INSERT INTO rol_submodulo (id_rol,id_submodulo,activo) SELECT r.id_rol,s.id_submodulo,1 FROM rol r CROSS JOIN submodulo s WHERE r.codigo_rol='ADMINISTRADOR';
INSERT INTO rol_permiso (id_rol,id_permiso,permitido,alcance_datos) SELECT r.id_rol,p.id_permiso,1,'GLOBAL' FROM rol r CROSS JOIN permiso p WHERE r.codigo_rol='ADMINISTRADOR';
INSERT INTO configuracion_sistema (codigo_configuracion,nombre_configuracion,valor_texto,tipo_valor,descripcion) VALUES ('NOMBRE_INSTITUCION','Nombre de la institucion','Universidad Nacional Daniel Alcides Carrion','TEXTO','Nombre institucional.'),('FACULTAD','Facultad','Facultad de Odontologia','TEXTO','Unidad academica.'),('ELIMINACION_CLINICA_PERMITIDA','Eliminacion clinica permitida','0','BOOLEANO','Las historias clinicas no se eliminan fisicamente.'),('TIPO_DENTICION_POR_DEFECTO','Tipo de denticion por defecto','PERMANENTE','TEXTO','Valor inicial del odontograma.');
INSERT INTO pieza_dental (codigo_fdi,denticion,cuadrante,tipo_pieza,nombre_pieza,orden_visual) VALUES
('11','PERMANENTE',1,'INCISIVO','Incisivo central superior derecho',11),
('12','PERMANENTE',1,'INCISIVO','Incisivo lateral superior derecho',12),
('13','PERMANENTE',1,'CANINO','Canino superior derecho',13),
('14','PERMANENTE',1,'PREMOLAR','Primer premolar superior derecho',14),
('15','PERMANENTE',1,'PREMOLAR','Segundo premolar superior derecho',15),
('16','PERMANENTE',1,'MOLAR','Primer molar superior derecho',16),
('17','PERMANENTE',1,'MOLAR','Segundo molar superior derecho',17),
('18','PERMANENTE',1,'MOLAR','Tercer molar superior derecho',18),
('21','PERMANENTE',2,'INCISIVO','Incisivo central superior izquierdo',21),
('22','PERMANENTE',2,'INCISIVO','Incisivo lateral superior izquierdo',22),
('23','PERMANENTE',2,'CANINO','Canino superior izquierdo',23),
('24','PERMANENTE',2,'PREMOLAR','Primer premolar superior izquierdo',24),
('25','PERMANENTE',2,'PREMOLAR','Segundo premolar superior izquierdo',25),
('26','PERMANENTE',2,'MOLAR','Primer molar superior izquierdo',26),
('27','PERMANENTE',2,'MOLAR','Segundo molar superior izquierdo',27),
('28','PERMANENTE',2,'MOLAR','Tercer molar superior izquierdo',28),
('31','PERMANENTE',3,'INCISIVO','Incisivo central inferior izquierdo',31),
('32','PERMANENTE',3,'INCISIVO','Incisivo lateral inferior izquierdo',32),
('33','PERMANENTE',3,'CANINO','Canino inferior izquierdo',33),
('34','PERMANENTE',3,'PREMOLAR','Primer premolar inferior izquierdo',34),
('35','PERMANENTE',3,'PREMOLAR','Segundo premolar inferior izquierdo',35),
('36','PERMANENTE',3,'MOLAR','Primer molar inferior izquierdo',36),
('37','PERMANENTE',3,'MOLAR','Segundo molar inferior izquierdo',37),
('38','PERMANENTE',3,'MOLAR','Tercer molar inferior izquierdo',38),
('41','PERMANENTE',4,'INCISIVO','Incisivo central inferior derecho',41),
('42','PERMANENTE',4,'INCISIVO','Incisivo lateral inferior derecho',42),
('43','PERMANENTE',4,'CANINO','Canino inferior derecho',43),
('44','PERMANENTE',4,'PREMOLAR','Primer premolar inferior derecho',44),
('45','PERMANENTE',4,'PREMOLAR','Segundo premolar inferior derecho',45),
('46','PERMANENTE',4,'MOLAR','Primer molar inferior derecho',46),
('47','PERMANENTE',4,'MOLAR','Segundo molar inferior derecho',47),
('48','PERMANENTE',4,'MOLAR','Tercer molar inferior derecho',48),
('51','TEMPORAL',5,'INCISIVO','Incisivo central superior derecho temporal',51),
('52','TEMPORAL',5,'INCISIVO','Incisivo lateral superior derecho temporal',52),
('53','TEMPORAL',5,'CANINO','Canino superior derecho temporal',53),
('54','TEMPORAL',5,'MOLAR','Primer molar superior derecho temporal',54),
('55','TEMPORAL',5,'MOLAR','Segundo molar superior derecho temporal',55),
('61','TEMPORAL',6,'INCISIVO','Incisivo central superior izquierdo temporal',61),
('62','TEMPORAL',6,'INCISIVO','Incisivo lateral superior izquierdo temporal',62),
('63','TEMPORAL',6,'CANINO','Canino superior izquierdo temporal',63),
('64','TEMPORAL',6,'MOLAR','Primer molar superior izquierdo temporal',64),
('65','TEMPORAL',6,'MOLAR','Segundo molar superior izquierdo temporal',65),
('71','TEMPORAL',7,'INCISIVO','Incisivo central inferior izquierdo temporal',71),
('72','TEMPORAL',7,'INCISIVO','Incisivo lateral inferior izquierdo temporal',72),
('73','TEMPORAL',7,'CANINO','Canino inferior izquierdo temporal',73),
('74','TEMPORAL',7,'MOLAR','Primer molar inferior izquierdo temporal',74),
('75','TEMPORAL',7,'MOLAR','Segundo molar inferior izquierdo temporal',75),
('81','TEMPORAL',8,'INCISIVO','Incisivo central inferior derecho temporal',81),
('82','TEMPORAL',8,'INCISIVO','Incisivo lateral inferior derecho temporal',82),
('83','TEMPORAL',8,'CANINO','Canino inferior derecho temporal',83),
('84','TEMPORAL',8,'MOLAR','Primer molar inferior derecho temporal',84),
('85','TEMPORAL',8,'MOLAR','Segundo molar inferior derecho temporal',85);
INSERT INTO catalogo_hallazgo_dental (codigo_hallazgo,nombre_hallazgo,categoria,permite_superficie,simbolo) VALUES ('CARIES','Caries dental','PATOLOGIA',1,'C'),('RESTAURACION','Restauracion','TRATAMIENTO_EXISTENTE',1,'R'),('FRACTURA','Fractura dental','PATOLOGIA',1,'F'),('DESGASTE','Desgaste o atricion','PATOLOGIA',1,'D'),('SELLANTE','Sellante','TRATAMIENTO_EXISTENTE',1,'S'),('CORONA','Corona','REHABILITACION',0,'COR'),('PUENTE','Pieza de puente','REHABILITACION',0,'P'),('PROTESIS','Protesis','REHABILITACION',0,'PR'),('AUSENTE','Pieza ausente','ESTADO',0,'A'),('EXTRACCION_INDICADA','Extraccion indicada','PLAN',0,'EI'),('IMPLANTE','Implante','REHABILITACION',0,'I'),('ENDODONCIA','Tratamiento endodontico','TRATAMIENTO_EXISTENTE',0,'EN');
INSERT INTO catalogo_tratamiento_dental (codigo_tratamiento,nombre_tratamiento,categoria) VALUES ('RESTAURACION','Restauracion dental','OPERATORIA'),('SELLANTE','Sellante dental','PREVENTIVA'),('EXODONCIA','Exodoncia','CIRUGIA'),('ENDODONCIA','Tratamiento endodontico','ENDODONCIA'),('CORONA','Corona dental','REHABILITACION'),('PROTESIS_PARCIAL','Protesis parcial','REHABILITACION'),('PROTESIS_TOTAL','Protesis total','REHABILITACION'),('IMPLANTE','Implante dental','IMPLANTOLOGIA');
-- Las 24 preguntas del cuestionario deben cargarse con el texto institucional aprobado por la Facultad; no se inventa contenido clinico.

SET FOREIGN_KEY_CHECKS=1;

CREATE OR REPLACE VIEW vista_permisos_efectivos AS SELECT u.id_usuario,p.id_permiso,p.codigo_permiso,p.accion,up.permitido,up.alcance_datos,'USUARIO' AS origen FROM usuario u JOIN usuario_permiso up ON up.id_usuario=u.id_usuario JOIN permiso p ON p.id_permiso=up.id_permiso WHERE u.estado=1 AND p.estado=1 UNION ALL SELECT ur.id_usuario,p.id_permiso,p.codigo_permiso,p.accion,rp.permitido,rp.alcance_datos,'ROL' AS origen FROM usuario_rol ur JOIN rol_permiso rp ON rp.id_rol=ur.id_rol JOIN permiso p ON p.id_permiso=rp.id_permiso WHERE ur.permitido=1 AND p.estado=1 AND NOT EXISTS (SELECT 1 FROM usuario_permiso ux WHERE ux.id_usuario=ur.id_usuario AND ux.id_permiso=rp.id_permiso);