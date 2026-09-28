-- phpMyAdmin SQL Dump
-- version 6.0.0-dev+20260810.843def3cd8
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Sep 27, 2026 at 04:27 PM
-- Server version: 8.4.3
-- PHP Version: 8.3.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `bd_clinica_undac`
--

-- --------------------------------------------------------

--
-- Table structure for table `alta_clinica`
--

CREATE TABLE `alta_clinica` (
  `id_alta` bigint NOT NULL,
  `id_reporte_operatorio` bigint NOT NULL,
  `fecha_alta` datetime NOT NULL,
  `condicion_paciente` varchar(180) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `indicaciones` text COLLATE utf8mb4_unicode_ci,
  `signos_alarma` text COLLATE utf8mb4_unicode_ci,
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `id_usuario_registro` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `alumno`
--

CREATE TABLE `alumno` (
  `id_alumno` int NOT NULL,
  `id_empleado` int NOT NULL,
  `codigo_alumno` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `semestre` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ano_academico` smallint DEFAULT NULL,
  `estado` bit(1) NOT NULL DEFAULT b'1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `anamnesis`
--

CREATE TABLE `anamnesis` (
  `id_anamnesis` bigint NOT NULL,
  `id_historia_clinica` bigint NOT NULL,
  `enfermedad_actual` text COLLATE utf8mb4_unicode_ci,
  `tiempo_enfermedad` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `forma_inicio` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `evolucion` text COLLATE utf8mb4_unicode_ci,
  `motivo_consulta` text COLLATE utf8mb4_unicode_ci,
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `antecedente`
--

CREATE TABLE `antecedente` (
  `id_antecedente` bigint NOT NULL,
  `id_historia_clinica` bigint NOT NULL,
  `tipo_antecedente` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `fecha_referencia` date DEFAULT NULL,
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `antecedente_anestesia`
--

CREATE TABLE `antecedente_anestesia` (
  `id_antecedente_anestesia` bigint NOT NULL,
  `id_historia_clinica` bigint NOT NULL,
  `fecha_reaccion` date DEFAULT NULL,
  `tipo_anestesia` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `hubo_reaccion` bit(1) NOT NULL DEFAULT b'0',
  `descripcion_reaccion` text COLLATE utf8mb4_unicode_ci,
  `observaciones` text COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `antecedente_exodoncia`
--

CREATE TABLE `antecedente_exodoncia` (
  `id_antecedente_exodoncia` bigint NOT NULL,
  `id_historia_clinica` bigint NOT NULL,
  `fecha_exodoncia` date DEFAULT NULL,
  `pieza_dental` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `motivo` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `complicaciones` text COLLATE utf8mb4_unicode_ci,
  `observaciones` text COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `antecedente_familiar`
--

CREATE TABLE `antecedente_familiar` (
  `id_antecedente_familiar` bigint NOT NULL,
  `id_historia_clinica` bigint NOT NULL,
  `familiar` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado_salud` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `enfermedad` varchar(180) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `observaciones` text COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `archivo_clinico`
--

CREATE TABLE `archivo_clinico` (
  `id_archivo` bigint NOT NULL,
  `id_historia_clinica` bigint NOT NULL,
  `tipo_archivo` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_original` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_guardado` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ruta_archivo` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `extension` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo_mime` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tamano_bytes` bigint DEFAULT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `fecha_carga` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `id_usuario_carga` int DEFAULT NULL,
  `estado` bit(1) NOT NULL DEFAULT b'1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `asignacion_historia`
--

CREATE TABLE `asignacion_historia` (
  `id_asignacion` bigint NOT NULL,
  `id_historia_clinica` bigint NOT NULL,
  `id_alumno` int NOT NULL,
  `id_docente` int DEFAULT NULL,
  `tipo_asignacion` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ASIGNACION',
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date DEFAULT NULL,
  `estado` bit(1) NOT NULL DEFAULT b'1',
  `observaciones` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `creado_por` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `auditoria`
--

CREATE TABLE `auditoria` (
  `id_auditoria` bigint NOT NULL,
  `tabla_afectada` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_registro` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `accion` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_usuario` int DEFAULT NULL,
  `nombre_usuario` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion_ip` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `agente_usuario` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `datos_antes` json DEFAULT NULL,
  `datos_despues` json DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `catalogo_hallazgo_dental`
--

CREATE TABLE `catalogo_hallazgo_dental` (
  `id_hallazgo_dental` smallint NOT NULL,
  `codigo_hallazgo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_hallazgo` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `categoria` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `permite_superficie` bit(1) NOT NULL DEFAULT b'1',
  `simbolo` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` bit(1) NOT NULL DEFAULT b'1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `catalogo_hallazgo_dental`
--

INSERT INTO `catalogo_hallazgo_dental` (`id_hallazgo_dental`, `codigo_hallazgo`, `nombre_hallazgo`, `categoria`, `permite_superficie`, `simbolo`, `descripcion`, `estado`) VALUES
(1, 'CARIES', 'Caries dental', 'PATOLOGIA', b'1', 'C', NULL, b'1'),
(2, 'RESTAURACION', 'Restauracion', 'TRATAMIENTO_EXISTENTE', b'1', 'R', NULL, b'1'),
(3, 'FRACTURA', 'Fractura dental', 'PATOLOGIA', b'1', 'F', NULL, b'1'),
(4, 'DESGASTE', 'Desgaste o atricion', 'PATOLOGIA', b'1', 'D', NULL, b'1'),
(5, 'SELLANTE', 'Sellante', 'TRATAMIENTO_EXISTENTE', b'1', 'S', NULL, b'1'),
(6, 'CORONA', 'Corona', 'REHABILITACION', b'0', 'COR', NULL, b'1'),
(7, 'PUENTE', 'Pieza de puente', 'REHABILITACION', b'0', 'P', NULL, b'1'),
(8, 'PROTESIS', 'Protesis', 'REHABILITACION', b'0', 'PR', NULL, b'1'),
(9, 'AUSENTE', 'Pieza ausente', 'ESTADO', b'0', 'A', NULL, b'1'),
(10, 'EXTRACCION_INDICADA', 'Extraccion indicada', 'PLAN', b'0', 'EI', NULL, b'1'),
(11, 'IMPLANTE', 'Implante', 'REHABILITACION', b'0', 'I', NULL, b'1'),
(12, 'ENDODONCIA', 'Tratamiento endodontico', 'TRATAMIENTO_EXISTENTE', b'0', 'EN', NULL, b'1');

-- --------------------------------------------------------

--
-- Table structure for table `catalogo_tratamiento_dental`
--

CREATE TABLE `catalogo_tratamiento_dental` (
  `id_tratamiento_dental` smallint NOT NULL,
  `codigo_tratamiento` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_tratamiento` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `categoria` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` bit(1) NOT NULL DEFAULT b'1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `catalogo_tratamiento_dental`
--

INSERT INTO `catalogo_tratamiento_dental` (`id_tratamiento_dental`, `codigo_tratamiento`, `nombre_tratamiento`, `categoria`, `descripcion`, `estado`) VALUES
(1, 'RESTAURACION', 'Restauracion dental', 'OPERATORIA', NULL, b'1'),
(2, 'SELLANTE', 'Sellante dental', 'PREVENTIVA', NULL, b'1'),
(3, 'EXODONCIA', 'Exodoncia', 'CIRUGIA', NULL, b'1'),
(4, 'ENDODONCIA', 'Tratamiento endodontico', 'ENDODONCIA', NULL, b'1'),
(5, 'CORONA', 'Corona dental', 'REHABILITACION', NULL, b'1'),
(6, 'PROTESIS_PARCIAL', 'Protesis parcial', 'REHABILITACION', NULL, b'1'),
(7, 'PROTESIS_TOTAL', 'Protesis total', 'REHABILITACION', NULL, b'1'),
(8, 'IMPLANTE', 'Implante dental', 'IMPLANTOLOGIA', NULL, b'1');

-- --------------------------------------------------------

--
-- Table structure for table `configuracion_sistema`
--

CREATE TABLE `configuracion_sistema` (
  `id_configuracion` int NOT NULL,
  `codigo_configuracion` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_configuracion` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `valor_texto` text COLLATE utf8mb4_unicode_ci,
  `tipo_valor` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'TEXTO',
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` bit(1) NOT NULL DEFAULT b'1',
  `actualizado_en` datetime DEFAULT NULL,
  `actualizado_por` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `configuracion_sistema`
--

INSERT INTO `configuracion_sistema` (`id_configuracion`, `codigo_configuracion`, `nombre_configuracion`, `valor_texto`, `tipo_valor`, `descripcion`, `estado`, `actualizado_en`, `actualizado_por`) VALUES
(1, 'NOMBRE_INSTITUCION', 'Nombre de la institucion', 'Universidad Nacional Daniel Alcides Carrion', 'TEXTO', 'Nombre institucional.', b'1', NULL, NULL),
(2, 'FACULTAD', 'Facultad', 'Facultad de Odontologia', 'TEXTO', 'Unidad academica.', b'1', NULL, NULL),
(3, 'ELIMINACION_CLINICA_PERMITIDA', 'Eliminacion clinica permitida', '0', 'BOOLEANO', 'Las historias clinicas no se eliminan fisicamente.', b'1', NULL, NULL),
(4, 'TIPO_DENTICION_POR_DEFECTO', 'Tipo de denticion por defecto', 'PERMANENTE', 'TEXTO', 'Valor inicial del odontograma.', b'1', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `consentimiento_informado`
--

CREATE TABLE `consentimiento_informado` (
  `id_consentimiento` bigint NOT NULL,
  `id_historia_clinica` bigint NOT NULL,
  `version_documento` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `texto_institucional` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_consentimiento` date DEFAULT NULL,
  `estado` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDIENTE',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `diagnostico`
--

CREATE TABLE `diagnostico` (
  `id_diagnostico` bigint NOT NULL,
  `id_historia_clinica` bigint NOT NULL,
  `tipo_diagnostico` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `numero_version` int NOT NULL DEFAULT '1',
  `descripcion` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `es_actual` bit(1) NOT NULL DEFAULT b'1',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `id_usuario_registro` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `docente`
--

CREATE TABLE `docente` (
  `id_docente` int NOT NULL,
  `id_empleado` int NOT NULL,
  `numero_colegiatura` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `especialidad` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` bit(1) NOT NULL DEFAULT b'1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `empleado`
--

CREATE TABLE `empleado` (
  `id_empleado` int NOT NULL,
  `id_persona` int NOT NULL,
  `codigo_empleado` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo_empleado` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'OTRO',
  `estado` bit(1) NOT NULL DEFAULT b'1',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `epicrisis`
--

CREATE TABLE `epicrisis` (
  `id_epicrisis` bigint NOT NULL,
  `id_reporte_operatorio` bigint NOT NULL,
  `resumen_clinico` text COLLATE utf8mb4_unicode_ci,
  `diagnostico_egreso` text COLLATE utf8mb4_unicode_ci,
  `procedimiento_realizado` text COLLATE utf8mb4_unicode_ci,
  `evolucion` text COLLATE utf8mb4_unicode_ci,
  `recomendaciones` text COLLATE utf8mb4_unicode_ci,
  `fecha_registro` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `id_usuario_registro` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `etapa_quirurgica`
--

CREATE TABLE `etapa_quirurgica` (
  `id_etapa_quirurgica` bigint NOT NULL,
  `id_plan_quirurgico` bigint NOT NULL,
  `etapa` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `orden` int NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `examen_auxiliar`
--

CREATE TABLE `examen_auxiliar` (
  `id_examen_auxiliar` bigint NOT NULL,
  `id_historia_clinica` bigint NOT NULL,
  `tipo_examen` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_examen` varchar(180) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_examen` date DEFAULT NULL,
  `resultado` text COLLATE utf8mb4_unicode_ci,
  `interpretacion` text COLLATE utf8mb4_unicode_ci,
  `id_archivo` bigint DEFAULT NULL,
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `examen_clinico_general`
--

CREATE TABLE `examen_clinico_general` (
  `id_examen_clinico` bigint NOT NULL,
  `id_historia_clinica` bigint NOT NULL,
  `presion_arterial` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `frecuencia_cardiaca` decimal(6,2) DEFAULT NULL,
  `frecuencia_respiratoria` decimal(6,2) DEFAULT NULL,
  `temperatura` decimal(4,1) DEFAULT NULL,
  `peso_kg` decimal(6,2) DEFAULT NULL,
  `talla_cm` decimal(6,2) DEFAULT NULL,
  `tipo_psicologico` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `marcha` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cabeza` text COLLATE utf8mb4_unicode_ci,
  `cuello` text COLLATE utf8mb4_unicode_ci,
  `extremidades` text COLLATE utf8mb4_unicode_ci,
  `torax` text COLLATE utf8mb4_unicode_ci,
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `examen_estomatologico`
--

CREATE TABLE `examen_estomatologico` (
  `id_examen_estomatologico` bigint NOT NULL,
  `id_historia_clinica` bigint NOT NULL,
  `tipo_examen` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `estructura_anatomica` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado_estructura` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NORMAL',
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `examen_oclusion`
--

CREATE TABLE `examen_oclusion` (
  `id_examen_oclusion` bigint NOT NULL,
  `id_historia_clinica` bigint NOT NULL,
  `clasificacion_posterior` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `clasificacion_anterior` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mordida` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `observaciones` text COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `fase_tratamiento`
--

CREATE TABLE `fase_tratamiento` (
  `id_fase_tratamiento` bigint NOT NULL,
  `id_plan_tratamiento` bigint NOT NULL,
  `numero_fase` int NOT NULL,
  `nombre_fase` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `orden` int NOT NULL DEFAULT '0',
  `estado` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDIENTE'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `firma_consentimiento`
--

CREATE TABLE `firma_consentimiento` (
  `id_firma` bigint NOT NULL,
  `id_consentimiento` bigint NOT NULL,
  `tipo_firmante` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_firmante` varchar(180) COLLATE utf8mb4_unicode_ci NOT NULL,
  `documento_firmante` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_archivo_firma` bigint DEFAULT NULL,
  `fecha_firma` datetime DEFAULT NULL,
  `observaciones` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `firma_seguimiento`
--

CREATE TABLE `firma_seguimiento` (
  `id_firma_seguimiento` bigint NOT NULL,
  `id_seguimiento` bigint NOT NULL,
  `tipo_firmante` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_usuario` int DEFAULT NULL,
  `id_archivo_firma` bigint DEFAULT NULL,
  `fecha_firma` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hallazgo_estomatologico`
--

CREATE TABLE `hallazgo_estomatologico` (
  `id_hallazgo` bigint NOT NULL,
  `id_examen_estomatologico` bigint NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_hallazgo` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `severidad` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `historia_clinica`
--

CREATE TABLE `historia_clinica` (
  `id_historia_clinica` bigint NOT NULL,
  `numero_historia` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_paciente` int NOT NULL,
  `id_alumno_operador` int NOT NULL,
  `id_docente_supervisor` int DEFAULT NULL,
  `semestre` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ano_academico` smallint DEFAULT NULL,
  `fecha_apertura` date NOT NULL,
  `tipo_atencion` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `motivo_consulta` text COLLATE utf8mb4_unicode_ci,
  `estado_historia` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ABIERTA',
  `fecha_cierre` date DEFAULT NULL,
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime DEFAULT NULL,
  `eliminado_en` datetime DEFAULT NULL,
  `creado_por` int DEFAULT NULL,
  `actualizado_por` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `login_historial`
--

CREATE TABLE `login_historial` (
  `id_login` bigint NOT NULL,
  `id_usuario` int DEFAULT NULL,
  `nombre_usuario` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `direccion_ip` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL,
  `agente_usuario` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `exito` bit(1) NOT NULL DEFAULT b'1',
  `motivo_fallo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `login_historial`
--

INSERT INTO `login_historial` (`id_login`, `id_usuario`, `nombre_usuario`, `direccion_ip`, `agente_usuario`, `exito`, `motivo_fallo`, `creado_en`) VALUES
(1, 1, 'admin', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.17.21 Chrome/144.0.7559.236 Electron/40.10.3 Safari/537.36', b'0', 'CONTRASENA_INCORRECTA', '2026-09-04 16:47:23'),
(2, 1, 'admin', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.17.21 Chrome/144.0.7559.236 Electron/40.10.3 Safari/537.36', b'0', 'CONTRASENA_INCORRECTA', '2026-09-04 16:47:26'),
(3, 1, 'admin', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.17.21 Chrome/144.0.7559.236 Electron/40.10.3 Safari/537.36', b'1', NULL, '2026-09-04 16:48:44'),
(4, NULL, 'asdads', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.17.21 Chrome/144.0.7559.236 Electron/40.10.3 Safari/537.36', b'0', 'USUARIO_INEXISTENTE', '2026-09-04 16:56:44'),
(5, NULL, 'asadasd', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.17.21 Chrome/144.0.7559.236 Electron/40.10.3 Safari/537.36', b'0', 'USUARIO_INEXISTENTE', '2026-09-04 16:56:49'),
(6, NULL, 'asdasd', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.17.21 Chrome/144.0.7559.236 Electron/40.10.3 Safari/537.36', b'0', 'USUARIO_INEXISTENTE', '2026-09-04 16:56:53'),
(7, NULL, 'dsasd', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.17.21 Chrome/144.0.7559.236 Electron/40.10.3 Safari/537.36', b'0', 'USUARIO_INEXISTENTE', '2026-09-04 16:56:55'),
(8, NULL, 'asd', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.17.21 Chrome/144.0.7559.236 Electron/40.10.3 Safari/537.36', b'0', 'USUARIO_INEXISTENTE', '2026-09-04 16:56:58'),
(9, NULL, 'asdasd', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.17.21 Chrome/144.0.7559.236 Electron/40.10.3 Safari/537.36', b'0', 'USUARIO_INEXISTENTE', '2026-09-04 16:57:01'),
(10, NULL, 'asdasd', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.17.21 Chrome/144.0.7559.236 Electron/40.10.3 Safari/537.36', b'0', 'USUARIO_INEXISTENTE', '2026-09-04 16:57:04'),
(11, NULL, 'asdasd', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.17.21 Chrome/144.0.7559.236 Electron/40.10.3 Safari/537.36', b'0', 'USUARIO_INEXISTENTE', '2026-09-04 16:57:05'),
(12, NULL, 'asdasd', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.17.21 Chrome/144.0.7559.236 Electron/40.10.3 Safari/537.36', b'0', 'USUARIO_INEXISTENTE', '2026-09-04 16:57:06'),
(13, NULL, 'asdasd', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.17.21 Chrome/144.0.7559.236 Electron/40.10.3 Safari/537.36', b'0', 'LIMITE_DE_INTENTOS', '2026-09-04 16:57:07'),
(14, NULL, 'asdasd', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.17.21 Chrome/144.0.7559.236 Electron/40.10.3 Safari/537.36', b'0', 'LIMITE_DE_INTENTOS', '2026-09-04 16:57:07'),
(15, NULL, 'asdasd', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.17.21 Chrome/144.0.7559.236 Electron/40.10.3 Safari/537.36', b'0', 'LIMITE_DE_INTENTOS', '2026-09-04 16:57:08'),
(16, NULL, 'asdasd', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.17.21 Chrome/144.0.7559.236 Electron/40.10.3 Safari/537.36', b'0', 'LIMITE_DE_INTENTOS', '2026-09-04 16:57:09'),
(17, NULL, 'asdasd', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.17.21 Chrome/144.0.7559.236 Electron/40.10.3 Safari/537.36', b'0', 'LIMITE_DE_INTENTOS', '2026-09-04 16:57:09'),
(18, NULL, 'asdasd', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.17.21 Chrome/144.0.7559.236 Electron/40.10.3 Safari/537.36', b'0', 'LIMITE_DE_INTENTOS', '2026-09-04 16:57:09'),
(19, NULL, 'asdasd', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.17.21 Chrome/144.0.7559.236 Electron/40.10.3 Safari/537.36', b'0', 'LIMITE_DE_INTENTOS', '2026-09-04 16:57:09'),
(20, NULL, 'asdasd', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.17.21 Chrome/144.0.7559.236 Electron/40.10.3 Safari/537.36', b'0', 'LIMITE_DE_INTENTOS', '2026-09-04 16:57:09'),
(21, NULL, 'asdasd', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.17.21 Chrome/144.0.7559.236 Electron/40.10.3 Safari/537.36', b'0', 'LIMITE_DE_INTENTOS', '2026-09-04 16:57:10'),
(22, NULL, 'asdasd', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.17.21 Chrome/144.0.7559.236 Electron/40.10.3 Safari/537.36', b'0', 'LIMITE_DE_INTENTOS', '2026-09-04 16:57:10'),
(23, NULL, 'asdasd', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.17.21 Chrome/144.0.7559.236 Electron/40.10.3 Safari/537.36', b'0', 'LIMITE_DE_INTENTOS', '2026-09-04 16:57:10'),
(24, NULL, 'asdasd', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.17.21 Chrome/144.0.7559.236 Electron/40.10.3 Safari/537.36', b'0', 'LIMITE_DE_INTENTOS', '2026-09-04 16:57:10'),
(25, NULL, 'asdasd', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.17.21 Chrome/144.0.7559.236 Electron/40.10.3 Safari/537.36', b'0', 'LIMITE_DE_INTENTOS', '2026-09-04 16:57:10'),
(26, NULL, 'asdasd', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.17.21 Chrome/144.0.7559.236 Electron/40.10.3 Safari/537.36', b'0', 'LIMITE_DE_INTENTOS', '2026-09-04 16:57:10'),
(27, NULL, 'asdasd', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.17.21 Chrome/144.0.7559.236 Electron/40.10.3 Safari/537.36', b'0', 'LIMITE_DE_INTENTOS', '2026-09-04 16:57:10'),
(28, NULL, 'asdasd', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.17.21 Chrome/144.0.7559.236 Electron/40.10.3 Safari/537.36', b'0', 'LIMITE_DE_INTENTOS', '2026-09-04 16:57:11'),
(29, NULL, 'sdd', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.17.21 Chrome/144.0.7559.236 Electron/40.10.3 Safari/537.36', b'0', 'USUARIO_INEXISTENTE', '2026-09-04 16:57:16'),
(30, 1, 'admin', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.17.21 Chrome/144.0.7559.236 Electron/40.10.3 Safari/537.36', b'1', NULL, '2026-09-04 16:57:26'),
(31, 1, 'admin', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.19.7 Chrome/148.0.7778.280 Electron/42.10.0 Safari/537.36', b'1', NULL, '2026-09-04 23:22:54'),
(32, 1, 'admin', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.20.21 Chrome/148.0.7778.280 Electron/42.10.0 Safari/537.36', b'1', NULL, '2026-09-16 14:31:46'),
(33, 1, 'admin', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.21.16 Chrome/148.0.7778.280 Electron/42.10.0 Safari/537.36', b'1', NULL, '2026-09-21 22:47:41'),
(34, 1, 'admin', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.22.7 Chrome/148.0.7778.280 Electron/42.10.0 Safari/537.36', b'1', NULL, '2026-09-27 16:23:02');

-- --------------------------------------------------------

--
-- Table structure for table `modulo`
--

CREATE TABLE `modulo` (
  `id_modulo` int NOT NULL,
  `codigo_modulo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_modulo` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion_modulo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `icono` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ruta` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `orden` int NOT NULL DEFAULT '0',
  `estado` bit(1) NOT NULL DEFAULT b'1',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `modulo`
--

INSERT INTO `modulo` (`id_modulo`, `codigo_modulo`, `nombre_modulo`, `descripcion_modulo`, `icono`, `ruta`, `orden`, `estado`, `creado_en`, `actualizado_en`) VALUES
(1, 'INICIO', 'Inicio', NULL, NULL, NULL, 1, b'1', '2026-09-04 10:46:59', NULL),
(2, 'PACIENTES', 'Pacientes', NULL, NULL, NULL, 2, b'1', '2026-09-04 10:46:59', NULL),
(3, 'HISTORIA_CLINICA', 'Historia clinica', NULL, NULL, NULL, 3, b'1', '2026-09-04 10:46:59', NULL),
(4, 'CIRUGIA', 'Cirugia bucal y maxilofacial', NULL, NULL, NULL, 4, b'1', '2026-09-04 10:46:59', NULL),
(5, 'REPORTES', 'Reportes y exportacion', NULL, NULL, NULL, 5, b'1', '2026-09-04 10:46:59', NULL),
(6, 'GESTION_PERSONAS', 'Gestion de personas', NULL, NULL, NULL, 6, b'1', '2026-09-04 10:46:59', NULL),
(7, 'CONFIGURACION', 'Configuracion del sistema', NULL, NULL, NULL, 7, b'1', '2026-09-04 10:46:59', NULL),
(8, 'AUDITORIA', 'Auditoria', NULL, NULL, NULL, 8, b'1', '2026-09-04 10:46:59', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `odontograma`
--

CREATE TABLE `odontograma` (
  `id_odontograma` bigint NOT NULL,
  `id_historia_clinica` bigint NOT NULL,
  `tipo_denticion` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PERMANENTE',
  `fecha_registro` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `es_actual` bit(1) NOT NULL DEFAULT b'1',
  `estado` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVO',
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `id_usuario_registro` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `odontograma_hallazgo`
--

CREATE TABLE `odontograma_hallazgo` (
  `id_odontograma_hallazgo` bigint NOT NULL,
  `id_odontograma_pieza` bigint NOT NULL,
  `id_hallazgo_dental` smallint NOT NULL,
  `id_odontograma_superficie` bigint DEFAULT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `activo` bit(1) NOT NULL DEFAULT b'1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `odontograma_pieza`
--

CREATE TABLE `odontograma_pieza` (
  `id_odontograma_pieza` bigint NOT NULL,
  `id_odontograma` bigint NOT NULL,
  `id_pieza_dental` smallint NOT NULL,
  `estado_pieza` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SANA',
  `movilidad` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `perdida` bit(1) NOT NULL DEFAULT b'0',
  `motivo_perdida` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `observaciones` text COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `odontograma_superficie`
--

CREATE TABLE `odontograma_superficie` (
  `id_odontograma_superficie` bigint NOT NULL,
  `id_odontograma_pieza` bigint NOT NULL,
  `superficie` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado_superficie` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'SANA',
  `observaciones` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `odontograma_tratamiento`
--

CREATE TABLE `odontograma_tratamiento` (
  `id_odontograma_tratamiento` bigint NOT NULL,
  `id_odontograma_pieza` bigint NOT NULL,
  `id_tratamiento_dental` smallint NOT NULL,
  `id_odontograma_superficie` bigint DEFAULT NULL,
  `estado_tratamiento` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PLANIFICADO',
  `fecha_tratamiento` date DEFAULT NULL,
  `observaciones` text COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `paciente`
--

CREATE TABLE `paciente` (
  `id_paciente` int NOT NULL,
  `id_persona` int NOT NULL,
  `ocupacion` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `procedencia` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado_civil` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` bit(1) NOT NULL DEFAULT b'1',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime DEFAULT NULL,
  `eliminado_en` datetime DEFAULT NULL,
  `creado_por` int DEFAULT NULL,
  `actualizado_por` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `paciente_contacto`
--

CREATE TABLE `paciente_contacto` (
  `id_contacto` int NOT NULL,
  `id_paciente` int NOT NULL,
  `tipo_contacto` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_completo` varchar(180) COLLATE utf8mb4_unicode_ci NOT NULL,
  `parentesco` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `correo` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `es_principal` bit(1) NOT NULL DEFAULT b'0',
  `observaciones` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` bit(1) NOT NULL DEFAULT b'1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `perdida_dental`
--

CREATE TABLE `perdida_dental` (
  `id_perdida_dental` bigint NOT NULL,
  `id_historia_clinica` bigint NOT NULL,
  `id_pieza_dental` smallint DEFAULT NULL,
  `fecha_perdida` date DEFAULT NULL,
  `motivo` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `permiso`
--

CREATE TABLE `permiso` (
  `id_permiso` int NOT NULL,
  `id_modulo` int NOT NULL,
  `id_submodulo` int DEFAULT NULL,
  `codigo_permiso` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_permiso` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `accion` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion_permiso` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` bit(1) NOT NULL DEFAULT b'1',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `permiso`
--

INSERT INTO `permiso` (`id_permiso`, `id_modulo`, `id_submodulo`, `codigo_permiso`, `nombre_permiso`, `accion`, `descripcion_permiso`, `estado`, `creado_en`, `actualizado_en`) VALUES
(1, 8, NULL, 'AUDITORIA.VER', 'Ver modulo', 'VER', 'Permite visualizar el modulo.', b'1', '2026-09-04 10:47:00', NULL),
(2, 4, NULL, 'CIRUGIA.VER', 'Ver modulo', 'VER', 'Permite visualizar el modulo.', b'1', '2026-09-04 10:47:00', NULL),
(3, 7, NULL, 'CONFIGURACION.VER', 'Ver modulo', 'VER', 'Permite visualizar el modulo.', b'1', '2026-09-04 10:47:00', NULL),
(4, 6, NULL, 'GESTION_PERSONAS.VER', 'Ver modulo', 'VER', 'Permite visualizar el modulo.', b'1', '2026-09-04 10:47:00', NULL),
(5, 3, NULL, 'HISTORIA_CLINICA.VER', 'Ver modulo', 'VER', 'Permite visualizar el modulo.', b'1', '2026-09-04 10:47:00', NULL),
(6, 1, NULL, 'INICIO.VER', 'Ver modulo', 'VER', 'Permite visualizar el modulo.', b'1', '2026-09-04 10:47:00', NULL),
(7, 2, NULL, 'PACIENTES.VER', 'Ver modulo', 'VER', 'Permite visualizar el modulo.', b'1', '2026-09-04 10:47:00', NULL),
(8, 5, NULL, 'REPORTES.VER', 'Ver modulo', 'VER', 'Permite visualizar el modulo.', b'1', '2026-09-04 10:47:00', NULL),
(16, 8, NULL, 'AUDITORIA.CREAR', 'Crear en modulo', 'CREAR', 'Permite crear registros.', b'1', '2026-09-04 10:47:00', NULL),
(17, 4, NULL, 'CIRUGIA.CREAR', 'Crear en modulo', 'CREAR', 'Permite crear registros.', b'1', '2026-09-04 10:47:00', NULL),
(18, 7, NULL, 'CONFIGURACION.CREAR', 'Crear en modulo', 'CREAR', 'Permite crear registros.', b'1', '2026-09-04 10:47:00', NULL),
(19, 6, NULL, 'GESTION_PERSONAS.CREAR', 'Crear en modulo', 'CREAR', 'Permite crear registros.', b'1', '2026-09-04 10:47:00', NULL),
(20, 3, NULL, 'HISTORIA_CLINICA.CREAR', 'Crear en modulo', 'CREAR', 'Permite crear registros.', b'1', '2026-09-04 10:47:00', NULL),
(21, 1, NULL, 'INICIO.CREAR', 'Crear en modulo', 'CREAR', 'Permite crear registros.', b'1', '2026-09-04 10:47:00', NULL),
(22, 2, NULL, 'PACIENTES.CREAR', 'Crear en modulo', 'CREAR', 'Permite crear registros.', b'1', '2026-09-04 10:47:00', NULL),
(23, 5, NULL, 'REPORTES.CREAR', 'Crear en modulo', 'CREAR', 'Permite crear registros.', b'1', '2026-09-04 10:47:00', NULL),
(31, 8, NULL, 'AUDITORIA.EDITAR', 'Editar en modulo', 'EDITAR', 'Permite editar registros.', b'1', '2026-09-04 10:47:00', NULL),
(32, 4, NULL, 'CIRUGIA.EDITAR', 'Editar en modulo', 'EDITAR', 'Permite editar registros.', b'1', '2026-09-04 10:47:00', NULL),
(33, 7, NULL, 'CONFIGURACION.EDITAR', 'Editar en modulo', 'EDITAR', 'Permite editar registros.', b'1', '2026-09-04 10:47:00', NULL),
(34, 6, NULL, 'GESTION_PERSONAS.EDITAR', 'Editar en modulo', 'EDITAR', 'Permite editar registros.', b'1', '2026-09-04 10:47:00', NULL),
(35, 3, NULL, 'HISTORIA_CLINICA.EDITAR', 'Editar en modulo', 'EDITAR', 'Permite editar registros.', b'1', '2026-09-04 10:47:00', NULL),
(36, 1, NULL, 'INICIO.EDITAR', 'Editar en modulo', 'EDITAR', 'Permite editar registros.', b'1', '2026-09-04 10:47:00', NULL),
(37, 2, NULL, 'PACIENTES.EDITAR', 'Editar en modulo', 'EDITAR', 'Permite editar registros.', b'1', '2026-09-04 10:47:00', NULL),
(38, 5, NULL, 'REPORTES.EDITAR', 'Editar en modulo', 'EDITAR', 'Permite editar registros.', b'1', '2026-09-04 10:47:00', NULL),
(46, 8, NULL, 'AUDITORIA.ELIMINAR', 'Eliminar en modulo', 'ELIMINAR', 'Permite eliminar o anular registros.', b'1', '2026-09-04 10:47:00', NULL),
(47, 4, NULL, 'CIRUGIA.ELIMINAR', 'Eliminar en modulo', 'ELIMINAR', 'Permite eliminar o anular registros.', b'1', '2026-09-04 10:47:00', NULL),
(48, 7, NULL, 'CONFIGURACION.ELIMINAR', 'Eliminar en modulo', 'ELIMINAR', 'Permite eliminar o anular registros.', b'1', '2026-09-04 10:47:00', NULL),
(49, 6, NULL, 'GESTION_PERSONAS.ELIMINAR', 'Eliminar en modulo', 'ELIMINAR', 'Permite eliminar o anular registros.', b'1', '2026-09-04 10:47:00', NULL),
(50, 3, NULL, 'HISTORIA_CLINICA.ELIMINAR', 'Eliminar en modulo', 'ELIMINAR', 'Permite eliminar o anular registros.', b'1', '2026-09-04 10:47:00', NULL),
(51, 1, NULL, 'INICIO.ELIMINAR', 'Eliminar en modulo', 'ELIMINAR', 'Permite eliminar o anular registros.', b'1', '2026-09-04 10:47:00', NULL),
(52, 2, NULL, 'PACIENTES.ELIMINAR', 'Eliminar en modulo', 'ELIMINAR', 'Permite eliminar o anular registros.', b'1', '2026-09-04 10:47:00', NULL),
(53, 5, NULL, 'REPORTES.ELIMINAR', 'Eliminar en modulo', 'ELIMINAR', 'Permite eliminar o anular registros.', b'1', '2026-09-04 10:47:00', NULL),
(61, 8, NULL, 'AUDITORIA.EXPORTAR', 'Exportar modulo', 'EXPORTAR', 'Permite exportar informacion.', b'1', '2026-09-04 10:47:00', NULL),
(62, 4, NULL, 'CIRUGIA.EXPORTAR', 'Exportar modulo', 'EXPORTAR', 'Permite exportar informacion.', b'1', '2026-09-04 10:47:00', NULL),
(63, 7, NULL, 'CONFIGURACION.EXPORTAR', 'Exportar modulo', 'EXPORTAR', 'Permite exportar informacion.', b'1', '2026-09-04 10:47:00', NULL),
(64, 6, NULL, 'GESTION_PERSONAS.EXPORTAR', 'Exportar modulo', 'EXPORTAR', 'Permite exportar informacion.', b'1', '2026-09-04 10:47:00', NULL),
(65, 3, NULL, 'HISTORIA_CLINICA.EXPORTAR', 'Exportar modulo', 'EXPORTAR', 'Permite exportar informacion.', b'1', '2026-09-04 10:47:00', NULL),
(66, 1, NULL, 'INICIO.EXPORTAR', 'Exportar modulo', 'EXPORTAR', 'Permite exportar informacion.', b'1', '2026-09-04 10:47:00', NULL),
(67, 2, NULL, 'PACIENTES.EXPORTAR', 'Exportar modulo', 'EXPORTAR', 'Permite exportar informacion.', b'1', '2026-09-04 10:47:00', NULL),
(68, 5, NULL, 'REPORTES.EXPORTAR', 'Exportar modulo', 'EXPORTAR', 'Permite exportar informacion.', b'1', '2026-09-04 10:47:00', NULL),
(76, 1, 1, 'INICIO.TABLERO.VER', 'Ver Tablero', 'VER', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(77, 2, 2, 'PACIENTES.PACIENTES.VER', 'Ver Pacientes', 'VER', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(78, 3, 3, 'HISTORIA_CLINICA.HISTORIAS.VER', 'Ver Historias clinicas', 'VER', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(79, 3, 4, 'HISTORIA_CLINICA.ODONTOGRAMA.VER', 'Ver Odontograma', 'VER', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(80, 3, 5, 'HISTORIA_CLINICA.EXAMEN_CLINICO.VER', 'Ver Examen clinico', 'VER', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(81, 3, 6, 'HISTORIA_CLINICA.DIAGNOSTICO_TRATAMIENTO.VER', 'Ver Diagnostico y tratamiento', 'VER', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(82, 3, 7, 'HISTORIA_CLINICA.EXAMENES_AUXILIARES.VER', 'Ver Examenes auxiliares', 'VER', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(83, 4, 8, 'CIRUGIA.CONSENTIMIENTO.VER', 'Ver Consentimiento informado', 'VER', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(84, 4, 9, 'CIRUGIA.PROGRAMACION.VER', 'Ver Programacion de cirugia', 'VER', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(85, 4, 10, 'CIRUGIA.REPORTE_OPERATORIO.VER', 'Ver Reporte operatorio', 'VER', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(86, 4, 11, 'CIRUGIA.SEGUIMIENTO.VER', 'Ver Seguimiento quirurgico', 'VER', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(87, 5, 12, 'REPORTES.EXPORTAR_PDF.VER', 'Ver Exportar PDF', 'VER', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(88, 6, 13, 'GESTION_PERSONAS.USUARIOS.VER', 'Ver Usuarios', 'VER', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(89, 6, 14, 'GESTION_PERSONAS.ROLES.VER', 'Ver Roles y permisos', 'VER', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(90, 6, 15, 'GESTION_PERSONAS.PACIENTES_PERSONAS.VER', 'Ver Personas y pacientes', 'VER', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(91, 7, 16, 'CONFIGURACION.PARAMETROS.VER', 'Ver Parametros', 'VER', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(92, 7, 17, 'CONFIGURACION.CATALOGOS_CLINICOS.VER', 'Ver Catalogos clinicos', 'VER', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(93, 8, 18, 'AUDITORIA.BITACORA.VER', 'Ver Bitacora de auditoria', 'VER', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(107, 1, 1, 'INICIO.TABLERO.CREAR', 'Crear en Tablero', 'CREAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(108, 2, 2, 'PACIENTES.PACIENTES.CREAR', 'Crear en Pacientes', 'CREAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(109, 3, 3, 'HISTORIA_CLINICA.HISTORIAS.CREAR', 'Crear en Historias clinicas', 'CREAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(110, 3, 4, 'HISTORIA_CLINICA.ODONTOGRAMA.CREAR', 'Crear en Odontograma', 'CREAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(111, 3, 5, 'HISTORIA_CLINICA.EXAMEN_CLINICO.CREAR', 'Crear en Examen clinico', 'CREAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(112, 3, 6, 'HISTORIA_CLINICA.DIAGNOSTICO_TRATAMIENTO.CREAR', 'Crear en Diagnostico y tratamiento', 'CREAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(113, 3, 7, 'HISTORIA_CLINICA.EXAMENES_AUXILIARES.CREAR', 'Crear en Examenes auxiliares', 'CREAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(114, 4, 8, 'CIRUGIA.CONSENTIMIENTO.CREAR', 'Crear en Consentimiento informado', 'CREAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(115, 4, 9, 'CIRUGIA.PROGRAMACION.CREAR', 'Crear en Programacion de cirugia', 'CREAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(116, 4, 10, 'CIRUGIA.REPORTE_OPERATORIO.CREAR', 'Crear en Reporte operatorio', 'CREAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(117, 4, 11, 'CIRUGIA.SEGUIMIENTO.CREAR', 'Crear en Seguimiento quirurgico', 'CREAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(118, 5, 12, 'REPORTES.EXPORTAR_PDF.CREAR', 'Crear en Exportar PDF', 'CREAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(119, 6, 13, 'GESTION_PERSONAS.USUARIOS.CREAR', 'Crear en Usuarios', 'CREAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(120, 6, 14, 'GESTION_PERSONAS.ROLES.CREAR', 'Crear en Roles y permisos', 'CREAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(121, 6, 15, 'GESTION_PERSONAS.PACIENTES_PERSONAS.CREAR', 'Crear en Personas y pacientes', 'CREAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(122, 7, 16, 'CONFIGURACION.PARAMETROS.CREAR', 'Crear en Parametros', 'CREAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(123, 7, 17, 'CONFIGURACION.CATALOGOS_CLINICOS.CREAR', 'Crear en Catalogos clinicos', 'CREAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(124, 8, 18, 'AUDITORIA.BITACORA.CREAR', 'Crear en Bitacora de auditoria', 'CREAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(138, 1, 1, 'INICIO.TABLERO.EDITAR', 'Editar Tablero', 'EDITAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(139, 2, 2, 'PACIENTES.PACIENTES.EDITAR', 'Editar Pacientes', 'EDITAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(140, 3, 3, 'HISTORIA_CLINICA.HISTORIAS.EDITAR', 'Editar Historias clinicas', 'EDITAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(141, 3, 4, 'HISTORIA_CLINICA.ODONTOGRAMA.EDITAR', 'Editar Odontograma', 'EDITAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(142, 3, 5, 'HISTORIA_CLINICA.EXAMEN_CLINICO.EDITAR', 'Editar Examen clinico', 'EDITAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(143, 3, 6, 'HISTORIA_CLINICA.DIAGNOSTICO_TRATAMIENTO.EDITAR', 'Editar Diagnostico y tratamiento', 'EDITAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(144, 3, 7, 'HISTORIA_CLINICA.EXAMENES_AUXILIARES.EDITAR', 'Editar Examenes auxiliares', 'EDITAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(145, 4, 8, 'CIRUGIA.CONSENTIMIENTO.EDITAR', 'Editar Consentimiento informado', 'EDITAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(146, 4, 9, 'CIRUGIA.PROGRAMACION.EDITAR', 'Editar Programacion de cirugia', 'EDITAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(147, 4, 10, 'CIRUGIA.REPORTE_OPERATORIO.EDITAR', 'Editar Reporte operatorio', 'EDITAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(148, 4, 11, 'CIRUGIA.SEGUIMIENTO.EDITAR', 'Editar Seguimiento quirurgico', 'EDITAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(149, 5, 12, 'REPORTES.EXPORTAR_PDF.EDITAR', 'Editar Exportar PDF', 'EDITAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(150, 6, 13, 'GESTION_PERSONAS.USUARIOS.EDITAR', 'Editar Usuarios', 'EDITAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(151, 6, 14, 'GESTION_PERSONAS.ROLES.EDITAR', 'Editar Roles y permisos', 'EDITAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(152, 6, 15, 'GESTION_PERSONAS.PACIENTES_PERSONAS.EDITAR', 'Editar Personas y pacientes', 'EDITAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(153, 7, 16, 'CONFIGURACION.PARAMETROS.EDITAR', 'Editar Parametros', 'EDITAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(154, 7, 17, 'CONFIGURACION.CATALOGOS_CLINICOS.EDITAR', 'Editar Catalogos clinicos', 'EDITAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(155, 8, 18, 'AUDITORIA.BITACORA.EDITAR', 'Editar Bitacora de auditoria', 'EDITAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(169, 1, 1, 'INICIO.TABLERO.ELIMINAR', 'Eliminar Tablero', 'ELIMINAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(170, 2, 2, 'PACIENTES.PACIENTES.ELIMINAR', 'Eliminar Pacientes', 'ELIMINAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(171, 3, 3, 'HISTORIA_CLINICA.HISTORIAS.ELIMINAR', 'Eliminar Historias clinicas', 'ELIMINAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(172, 3, 4, 'HISTORIA_CLINICA.ODONTOGRAMA.ELIMINAR', 'Eliminar Odontograma', 'ELIMINAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(173, 3, 5, 'HISTORIA_CLINICA.EXAMEN_CLINICO.ELIMINAR', 'Eliminar Examen clinico', 'ELIMINAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(174, 3, 6, 'HISTORIA_CLINICA.DIAGNOSTICO_TRATAMIENTO.ELIMINAR', 'Eliminar Diagnostico y tratamiento', 'ELIMINAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(175, 3, 7, 'HISTORIA_CLINICA.EXAMENES_AUXILIARES.ELIMINAR', 'Eliminar Examenes auxiliares', 'ELIMINAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(176, 4, 8, 'CIRUGIA.CONSENTIMIENTO.ELIMINAR', 'Eliminar Consentimiento informado', 'ELIMINAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(177, 4, 9, 'CIRUGIA.PROGRAMACION.ELIMINAR', 'Eliminar Programacion de cirugia', 'ELIMINAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(178, 4, 10, 'CIRUGIA.REPORTE_OPERATORIO.ELIMINAR', 'Eliminar Reporte operatorio', 'ELIMINAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(179, 4, 11, 'CIRUGIA.SEGUIMIENTO.ELIMINAR', 'Eliminar Seguimiento quirurgico', 'ELIMINAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(180, 5, 12, 'REPORTES.EXPORTAR_PDF.ELIMINAR', 'Eliminar Exportar PDF', 'ELIMINAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(181, 6, 13, 'GESTION_PERSONAS.USUARIOS.ELIMINAR', 'Eliminar Usuarios', 'ELIMINAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(182, 6, 14, 'GESTION_PERSONAS.ROLES.ELIMINAR', 'Eliminar Roles y permisos', 'ELIMINAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(183, 6, 15, 'GESTION_PERSONAS.PACIENTES_PERSONAS.ELIMINAR', 'Eliminar Personas y pacientes', 'ELIMINAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(184, 7, 16, 'CONFIGURACION.PARAMETROS.ELIMINAR', 'Eliminar Parametros', 'ELIMINAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(185, 7, 17, 'CONFIGURACION.CATALOGOS_CLINICOS.ELIMINAR', 'Eliminar Catalogos clinicos', 'ELIMINAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(186, 8, 18, 'AUDITORIA.BITACORA.ELIMINAR', 'Eliminar Bitacora de auditoria', 'ELIMINAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(200, 1, 1, 'INICIO.TABLERO.EXPORTAR', 'Exportar Tablero', 'EXPORTAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(201, 2, 2, 'PACIENTES.PACIENTES.EXPORTAR', 'Exportar Pacientes', 'EXPORTAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(202, 3, 3, 'HISTORIA_CLINICA.HISTORIAS.EXPORTAR', 'Exportar Historias clinicas', 'EXPORTAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(203, 3, 4, 'HISTORIA_CLINICA.ODONTOGRAMA.EXPORTAR', 'Exportar Odontograma', 'EXPORTAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(204, 3, 5, 'HISTORIA_CLINICA.EXAMEN_CLINICO.EXPORTAR', 'Exportar Examen clinico', 'EXPORTAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(205, 3, 6, 'HISTORIA_CLINICA.DIAGNOSTICO_TRATAMIENTO.EXPORTAR', 'Exportar Diagnostico y tratamiento', 'EXPORTAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(206, 3, 7, 'HISTORIA_CLINICA.EXAMENES_AUXILIARES.EXPORTAR', 'Exportar Examenes auxiliares', 'EXPORTAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(207, 4, 8, 'CIRUGIA.CONSENTIMIENTO.EXPORTAR', 'Exportar Consentimiento informado', 'EXPORTAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(208, 4, 9, 'CIRUGIA.PROGRAMACION.EXPORTAR', 'Exportar Programacion de cirugia', 'EXPORTAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(209, 4, 10, 'CIRUGIA.REPORTE_OPERATORIO.EXPORTAR', 'Exportar Reporte operatorio', 'EXPORTAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(210, 4, 11, 'CIRUGIA.SEGUIMIENTO.EXPORTAR', 'Exportar Seguimiento quirurgico', 'EXPORTAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(211, 5, 12, 'REPORTES.EXPORTAR_PDF.EXPORTAR', 'Exportar Exportar PDF', 'EXPORTAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(212, 6, 13, 'GESTION_PERSONAS.USUARIOS.EXPORTAR', 'Exportar Usuarios', 'EXPORTAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(213, 6, 14, 'GESTION_PERSONAS.ROLES.EXPORTAR', 'Exportar Roles y permisos', 'EXPORTAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(214, 6, 15, 'GESTION_PERSONAS.PACIENTES_PERSONAS.EXPORTAR', 'Exportar Personas y pacientes', 'EXPORTAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(215, 7, 16, 'CONFIGURACION.PARAMETROS.EXPORTAR', 'Exportar Parametros', 'EXPORTAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(216, 7, 17, 'CONFIGURACION.CATALOGOS_CLINICOS.EXPORTAR', 'Exportar Catalogos clinicos', 'EXPORTAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL),
(217, 8, 18, 'AUDITORIA.BITACORA.EXPORTAR', 'Exportar Bitacora de auditoria', 'EXPORTAR', 'Permiso configurable por submodulo.', b'1', '2026-09-04 10:47:00', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `persona`
--

CREATE TABLE `persona` (
  `id_persona` int NOT NULL,
  `tipo_documento` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DNI',
  `numero_documento` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nombres` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellidos` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `sexo` char(1) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `correo` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` varchar(250) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` bit(1) NOT NULL DEFAULT b'1',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime DEFAULT NULL,
  `eliminado_en` datetime DEFAULT NULL,
  `creado_por` int DEFAULT NULL,
  `actualizado_por` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `persona`
--

INSERT INTO `persona` (`id_persona`, `tipo_documento`, `numero_documento`, `nombres`, `apellidos`, `fecha_nacimiento`, `sexo`, `telefono`, `correo`, `direccion`, `estado`, `creado_en`, `actualizado_en`, `eliminado_en`, `creado_por`, `actualizado_por`) VALUES
(1, 'DNI', '00000001', 'Administrador', 'del Sistema', NULL, NULL, NULL, NULL, NULL, b'1', '2026-09-04 16:31:44', '2026-09-04 16:31:44', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `pieza_dental`
--

CREATE TABLE `pieza_dental` (
  `id_pieza_dental` smallint NOT NULL,
  `codigo_fdi` varchar(3) COLLATE utf8mb4_unicode_ci NOT NULL,
  `denticion` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `cuadrante` smallint NOT NULL,
  `tipo_pieza` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_pieza` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `orden_visual` smallint NOT NULL,
  `estado` bit(1) NOT NULL DEFAULT b'1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `pieza_dental`
--

INSERT INTO `pieza_dental` (`id_pieza_dental`, `codigo_fdi`, `denticion`, `cuadrante`, `tipo_pieza`, `nombre_pieza`, `orden_visual`, `estado`) VALUES
(1, '11', 'PERMANENTE', 1, 'INCISIVO', 'Incisivo central superior derecho', 11, b'1'),
(2, '12', 'PERMANENTE', 1, 'INCISIVO', 'Incisivo lateral superior derecho', 12, b'1'),
(3, '13', 'PERMANENTE', 1, 'CANINO', 'Canino superior derecho', 13, b'1'),
(4, '14', 'PERMANENTE', 1, 'PREMOLAR', 'Primer premolar superior derecho', 14, b'1'),
(5, '15', 'PERMANENTE', 1, 'PREMOLAR', 'Segundo premolar superior derecho', 15, b'1'),
(6, '16', 'PERMANENTE', 1, 'MOLAR', 'Primer molar superior derecho', 16, b'1'),
(7, '17', 'PERMANENTE', 1, 'MOLAR', 'Segundo molar superior derecho', 17, b'1'),
(8, '18', 'PERMANENTE', 1, 'MOLAR', 'Tercer molar superior derecho', 18, b'1'),
(9, '21', 'PERMANENTE', 2, 'INCISIVO', 'Incisivo central superior izquierdo', 21, b'1'),
(10, '22', 'PERMANENTE', 2, 'INCISIVO', 'Incisivo lateral superior izquierdo', 22, b'1'),
(11, '23', 'PERMANENTE', 2, 'CANINO', 'Canino superior izquierdo', 23, b'1'),
(12, '24', 'PERMANENTE', 2, 'PREMOLAR', 'Primer premolar superior izquierdo', 24, b'1'),
(13, '25', 'PERMANENTE', 2, 'PREMOLAR', 'Segundo premolar superior izquierdo', 25, b'1'),
(14, '26', 'PERMANENTE', 2, 'MOLAR', 'Primer molar superior izquierdo', 26, b'1'),
(15, '27', 'PERMANENTE', 2, 'MOLAR', 'Segundo molar superior izquierdo', 27, b'1'),
(16, '28', 'PERMANENTE', 2, 'MOLAR', 'Tercer molar superior izquierdo', 28, b'1'),
(17, '31', 'PERMANENTE', 3, 'INCISIVO', 'Incisivo central inferior izquierdo', 31, b'1'),
(18, '32', 'PERMANENTE', 3, 'INCISIVO', 'Incisivo lateral inferior izquierdo', 32, b'1'),
(19, '33', 'PERMANENTE', 3, 'CANINO', 'Canino inferior izquierdo', 33, b'1'),
(20, '34', 'PERMANENTE', 3, 'PREMOLAR', 'Primer premolar inferior izquierdo', 34, b'1'),
(21, '35', 'PERMANENTE', 3, 'PREMOLAR', 'Segundo premolar inferior izquierdo', 35, b'1'),
(22, '36', 'PERMANENTE', 3, 'MOLAR', 'Primer molar inferior izquierdo', 36, b'1'),
(23, '37', 'PERMANENTE', 3, 'MOLAR', 'Segundo molar inferior izquierdo', 37, b'1'),
(24, '38', 'PERMANENTE', 3, 'MOLAR', 'Tercer molar inferior izquierdo', 38, b'1'),
(25, '41', 'PERMANENTE', 4, 'INCISIVO', 'Incisivo central inferior derecho', 41, b'1'),
(26, '42', 'PERMANENTE', 4, 'INCISIVO', 'Incisivo lateral inferior derecho', 42, b'1'),
(27, '43', 'PERMANENTE', 4, 'CANINO', 'Canino inferior derecho', 43, b'1'),
(28, '44', 'PERMANENTE', 4, 'PREMOLAR', 'Primer premolar inferior derecho', 44, b'1'),
(29, '45', 'PERMANENTE', 4, 'PREMOLAR', 'Segundo premolar inferior derecho', 45, b'1'),
(30, '46', 'PERMANENTE', 4, 'MOLAR', 'Primer molar inferior derecho', 46, b'1'),
(31, '47', 'PERMANENTE', 4, 'MOLAR', 'Segundo molar inferior derecho', 47, b'1'),
(32, '48', 'PERMANENTE', 4, 'MOLAR', 'Tercer molar inferior derecho', 48, b'1'),
(33, '51', 'TEMPORAL', 5, 'INCISIVO', 'Incisivo central superior derecho temporal', 51, b'1'),
(34, '52', 'TEMPORAL', 5, 'INCISIVO', 'Incisivo lateral superior derecho temporal', 52, b'1'),
(35, '53', 'TEMPORAL', 5, 'CANINO', 'Canino superior derecho temporal', 53, b'1'),
(36, '54', 'TEMPORAL', 5, 'MOLAR', 'Primer molar superior derecho temporal', 54, b'1'),
(37, '55', 'TEMPORAL', 5, 'MOLAR', 'Segundo molar superior derecho temporal', 55, b'1'),
(38, '61', 'TEMPORAL', 6, 'INCISIVO', 'Incisivo central superior izquierdo temporal', 61, b'1'),
(39, '62', 'TEMPORAL', 6, 'INCISIVO', 'Incisivo lateral superior izquierdo temporal', 62, b'1'),
(40, '63', 'TEMPORAL', 6, 'CANINO', 'Canino superior izquierdo temporal', 63, b'1'),
(41, '64', 'TEMPORAL', 6, 'MOLAR', 'Primer molar superior izquierdo temporal', 64, b'1'),
(42, '65', 'TEMPORAL', 6, 'MOLAR', 'Segundo molar superior izquierdo temporal', 65, b'1'),
(43, '71', 'TEMPORAL', 7, 'INCISIVO', 'Incisivo central inferior izquierdo temporal', 71, b'1'),
(44, '72', 'TEMPORAL', 7, 'INCISIVO', 'Incisivo lateral inferior izquierdo temporal', 72, b'1'),
(45, '73', 'TEMPORAL', 7, 'CANINO', 'Canino inferior izquierdo temporal', 73, b'1'),
(46, '74', 'TEMPORAL', 7, 'MOLAR', 'Primer molar inferior izquierdo temporal', 74, b'1'),
(47, '75', 'TEMPORAL', 7, 'MOLAR', 'Segundo molar inferior izquierdo temporal', 75, b'1'),
(48, '81', 'TEMPORAL', 8, 'INCISIVO', 'Incisivo central inferior derecho temporal', 81, b'1'),
(49, '82', 'TEMPORAL', 8, 'INCISIVO', 'Incisivo lateral inferior derecho temporal', 82, b'1'),
(50, '83', 'TEMPORAL', 8, 'CANINO', 'Canino inferior derecho temporal', 83, b'1'),
(51, '84', 'TEMPORAL', 8, 'MOLAR', 'Primer molar inferior derecho temporal', 84, b'1'),
(52, '85', 'TEMPORAL', 8, 'MOLAR', 'Segundo molar inferior derecho temporal', 85, b'1');

-- --------------------------------------------------------

--
-- Table structure for table `plan_quirurgico`
--

CREATE TABLE `plan_quirurgico` (
  `id_plan_quirurgico` bigint NOT NULL,
  `id_historia_clinica` bigint NOT NULL,
  `procedimiento` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `diagnostico_preoperatorio` text COLLATE utf8mb4_unicode_ci,
  `indicacion_quirurgica` text COLLATE utf8mb4_unicode_ci,
  `estado` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PLANIFICADO',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `plan_tratamiento`
--

CREATE TABLE `plan_tratamiento` (
  `id_plan_tratamiento` bigint NOT NULL,
  `id_historia_clinica` bigint NOT NULL,
  `tipo_plan` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'INTEGRAL',
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `estado` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'BORRADOR',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pregunta_salud`
--

CREATE TABLE `pregunta_salud` (
  `id_pregunta_salud` smallint NOT NULL,
  `numero` smallint NOT NULL,
  `texto_pregunta` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `requiere_detalle` bit(1) NOT NULL DEFAULT b'0',
  `texto_detalle` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `orden` smallint NOT NULL,
  `estado` bit(1) NOT NULL DEFAULT b'1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `prescripcion`
--

CREATE TABLE `prescripcion` (
  `id_prescripcion` bigint NOT NULL,
  `id_reporte_operatorio` bigint NOT NULL,
  `medicamento` varchar(180) COLLATE utf8mb4_unicode_ci NOT NULL,
  `dosis` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `via_administracion` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `frecuencia` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duracion` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `indicaciones` text COLLATE utf8mb4_unicode_ci,
  `observaciones` text COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `programacion_cirugia`
--

CREATE TABLE `programacion_cirugia` (
  `id_programacion` bigint NOT NULL,
  `id_historia_clinica` bigint NOT NULL,
  `id_plan_quirurgico` bigint DEFAULT NULL,
  `fecha_programada` date NOT NULL,
  `hora_programada` time DEFAULT NULL,
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `estado` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PROGRAMADA'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `protesis`
--

CREATE TABLE `protesis` (
  `id_protesis` bigint NOT NULL,
  `id_historia_clinica` bigint NOT NULL,
  `tipo_protesis` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `confeccionada_por` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `estado` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `observaciones` text COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reporte_operatorio`
--

CREATE TABLE `reporte_operatorio` (
  `id_reporte_operatorio` bigint NOT NULL,
  `id_historia_clinica` bigint NOT NULL,
  `id_plan_quirurgico` bigint DEFAULT NULL,
  `fecha_cirugia` date DEFAULT NULL,
  `hora_inicio` time DEFAULT NULL,
  `hora_fin` time DEFAULT NULL,
  `procedimiento_realizado` text COLLATE utf8mb4_unicode_ci,
  `hallazgos_operatorios` text COLLATE utf8mb4_unicode_ci,
  `tecnica_quirurgica` text COLLATE utf8mb4_unicode_ci,
  `complicaciones` text COLLATE utf8mb4_unicode_ci,
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `id_docente_responsable` int DEFAULT NULL,
  `id_alumno_operador` int DEFAULT NULL,
  `estado` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'BORRADOR',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `respuesta_salud`
--

CREATE TABLE `respuesta_salud` (
  `id_respuesta_salud` bigint NOT NULL,
  `id_historia_clinica` bigint NOT NULL,
  `id_pregunta_salud` smallint NOT NULL,
  `respuesta` bit(1) NOT NULL,
  `detalle` text COLLATE utf8mb4_unicode_ci,
  `actualizado_en` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rol`
--

CREATE TABLE `rol` (
  `id_rol` int NOT NULL,
  `codigo_rol` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_rol` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion_rol` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `es_supervisor_general` bit(1) NOT NULL DEFAULT b'0',
  `estado` bit(1) NOT NULL DEFAULT b'1',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `rol`
--

INSERT INTO `rol` (`id_rol`, `codigo_rol`, `nombre_rol`, `descripcion_rol`, `es_supervisor_general`, `estado`, `creado_en`, `actualizado_en`) VALUES
(1, 'ADMINISTRADOR', 'Administrador', 'Gestion integral del sistema y configuracion.', b'1', b'1', '2026-09-04 10:46:59', NULL),
(2, 'DOCENTE', 'Docente', 'Supervision y validacion de historias clinicas.', b'0', b'1', '2026-09-04 10:46:59', NULL),
(3, 'ALUMNO_OPERADOR', 'Alumno operador', 'Registro y edicion de historias asignadas o propias.', b'0', b'1', '2026-09-04 10:46:59', NULL),
(4, 'ADMINISTRATIVO', 'Personal administrativo', 'Consulta y operaciones administrativas autorizadas.', b'0', b'1', '2026-09-04 10:46:59', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `rol_modulo`
--

CREATE TABLE `rol_modulo` (
  `id_rol_modulo` bigint NOT NULL,
  `id_rol` int NOT NULL,
  `id_modulo` int NOT NULL,
  `activo` bit(1) NOT NULL DEFAULT b'1',
  `actualizado_en` datetime DEFAULT NULL,
  `actualizado_por` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `rol_modulo`
--

INSERT INTO `rol_modulo` (`id_rol_modulo`, `id_rol`, `id_modulo`, `activo`, `actualizado_en`, `actualizado_por`) VALUES
(1, 1, 8, b'1', NULL, NULL),
(2, 1, 4, b'1', NULL, NULL),
(3, 1, 7, b'1', NULL, NULL),
(4, 1, 6, b'1', NULL, NULL),
(5, 1, 3, b'1', NULL, NULL),
(6, 1, 1, b'1', NULL, NULL),
(7, 1, 2, b'1', NULL, NULL),
(8, 1, 5, b'1', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `rol_permiso`
--

CREATE TABLE `rol_permiso` (
  `id_rol_permiso` bigint NOT NULL,
  `id_rol` int NOT NULL,
  `id_permiso` int NOT NULL,
  `permitido` bit(1) NOT NULL DEFAULT b'1',
  `alcance_datos` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'GLOBAL',
  `actualizado_en` datetime DEFAULT NULL,
  `actualizado_por` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `rol_permiso`
--

INSERT INTO `rol_permiso` (`id_rol_permiso`, `id_rol`, `id_permiso`, `permitido`, `alcance_datos`, `actualizado_en`, `actualizado_por`) VALUES
(1, 1, 6, b'1', 'GLOBAL', NULL, NULL),
(2, 1, 21, b'1', 'GLOBAL', NULL, NULL),
(3, 1, 36, b'1', 'GLOBAL', NULL, NULL),
(4, 1, 51, b'1', 'GLOBAL', NULL, NULL),
(5, 1, 66, b'1', 'GLOBAL', NULL, NULL),
(6, 1, 76, b'1', 'GLOBAL', NULL, NULL),
(7, 1, 107, b'1', 'GLOBAL', NULL, NULL),
(8, 1, 138, b'1', 'GLOBAL', NULL, NULL),
(9, 1, 169, b'1', 'GLOBAL', NULL, NULL),
(10, 1, 200, b'1', 'GLOBAL', NULL, NULL),
(11, 1, 7, b'1', 'GLOBAL', NULL, NULL),
(12, 1, 22, b'1', 'GLOBAL', NULL, NULL),
(13, 1, 37, b'1', 'GLOBAL', NULL, NULL),
(14, 1, 52, b'1', 'GLOBAL', NULL, NULL),
(15, 1, 67, b'1', 'GLOBAL', NULL, NULL),
(16, 1, 77, b'1', 'GLOBAL', NULL, NULL),
(17, 1, 108, b'1', 'GLOBAL', NULL, NULL),
(18, 1, 139, b'1', 'GLOBAL', NULL, NULL),
(19, 1, 170, b'1', 'GLOBAL', NULL, NULL),
(20, 1, 201, b'1', 'GLOBAL', NULL, NULL),
(21, 1, 5, b'1', 'GLOBAL', NULL, NULL),
(22, 1, 20, b'1', 'GLOBAL', NULL, NULL),
(23, 1, 35, b'1', 'GLOBAL', NULL, NULL),
(24, 1, 50, b'1', 'GLOBAL', NULL, NULL),
(25, 1, 65, b'1', 'GLOBAL', NULL, NULL),
(26, 1, 78, b'1', 'GLOBAL', NULL, NULL),
(27, 1, 79, b'1', 'GLOBAL', NULL, NULL),
(28, 1, 80, b'1', 'GLOBAL', NULL, NULL),
(29, 1, 81, b'1', 'GLOBAL', NULL, NULL),
(30, 1, 82, b'1', 'GLOBAL', NULL, NULL),
(31, 1, 109, b'1', 'GLOBAL', NULL, NULL),
(32, 1, 110, b'1', 'GLOBAL', NULL, NULL),
(33, 1, 111, b'1', 'GLOBAL', NULL, NULL),
(34, 1, 112, b'1', 'GLOBAL', NULL, NULL),
(35, 1, 113, b'1', 'GLOBAL', NULL, NULL),
(36, 1, 140, b'1', 'GLOBAL', NULL, NULL),
(37, 1, 141, b'1', 'GLOBAL', NULL, NULL),
(38, 1, 142, b'1', 'GLOBAL', NULL, NULL),
(39, 1, 143, b'1', 'GLOBAL', NULL, NULL),
(40, 1, 144, b'1', 'GLOBAL', NULL, NULL),
(41, 1, 171, b'1', 'GLOBAL', NULL, NULL),
(42, 1, 172, b'1', 'GLOBAL', NULL, NULL),
(43, 1, 173, b'1', 'GLOBAL', NULL, NULL),
(44, 1, 174, b'1', 'GLOBAL', NULL, NULL),
(45, 1, 175, b'1', 'GLOBAL', NULL, NULL),
(46, 1, 202, b'1', 'GLOBAL', NULL, NULL),
(47, 1, 203, b'1', 'GLOBAL', NULL, NULL),
(48, 1, 204, b'1', 'GLOBAL', NULL, NULL),
(49, 1, 205, b'1', 'GLOBAL', NULL, NULL),
(50, 1, 206, b'1', 'GLOBAL', NULL, NULL),
(51, 1, 2, b'1', 'GLOBAL', NULL, NULL),
(52, 1, 17, b'1', 'GLOBAL', NULL, NULL),
(53, 1, 32, b'1', 'GLOBAL', NULL, NULL),
(54, 1, 47, b'1', 'GLOBAL', NULL, NULL),
(55, 1, 62, b'1', 'GLOBAL', NULL, NULL),
(56, 1, 83, b'1', 'GLOBAL', NULL, NULL),
(57, 1, 84, b'1', 'GLOBAL', NULL, NULL),
(58, 1, 85, b'1', 'GLOBAL', NULL, NULL),
(59, 1, 86, b'1', 'GLOBAL', NULL, NULL),
(60, 1, 114, b'1', 'GLOBAL', NULL, NULL),
(61, 1, 115, b'1', 'GLOBAL', NULL, NULL),
(62, 1, 116, b'1', 'GLOBAL', NULL, NULL),
(63, 1, 117, b'1', 'GLOBAL', NULL, NULL),
(64, 1, 145, b'1', 'GLOBAL', NULL, NULL),
(65, 1, 146, b'1', 'GLOBAL', NULL, NULL),
(66, 1, 147, b'1', 'GLOBAL', NULL, NULL),
(67, 1, 148, b'1', 'GLOBAL', NULL, NULL),
(68, 1, 176, b'1', 'GLOBAL', NULL, NULL),
(69, 1, 177, b'1', 'GLOBAL', NULL, NULL),
(70, 1, 178, b'1', 'GLOBAL', NULL, NULL),
(71, 1, 179, b'1', 'GLOBAL', NULL, NULL),
(72, 1, 207, b'1', 'GLOBAL', NULL, NULL),
(73, 1, 208, b'1', 'GLOBAL', NULL, NULL),
(74, 1, 209, b'1', 'GLOBAL', NULL, NULL),
(75, 1, 210, b'1', 'GLOBAL', NULL, NULL),
(76, 1, 8, b'1', 'GLOBAL', NULL, NULL),
(77, 1, 23, b'1', 'GLOBAL', NULL, NULL),
(78, 1, 38, b'1', 'GLOBAL', NULL, NULL),
(79, 1, 53, b'1', 'GLOBAL', NULL, NULL),
(80, 1, 68, b'1', 'GLOBAL', NULL, NULL),
(81, 1, 87, b'1', 'GLOBAL', NULL, NULL),
(82, 1, 118, b'1', 'GLOBAL', NULL, NULL),
(83, 1, 149, b'1', 'GLOBAL', NULL, NULL),
(84, 1, 180, b'1', 'GLOBAL', NULL, NULL),
(85, 1, 211, b'1', 'GLOBAL', NULL, NULL),
(86, 1, 4, b'1', 'GLOBAL', NULL, NULL),
(87, 1, 19, b'1', 'GLOBAL', NULL, NULL),
(88, 1, 34, b'1', 'GLOBAL', NULL, NULL),
(89, 1, 49, b'1', 'GLOBAL', NULL, NULL),
(90, 1, 64, b'1', 'GLOBAL', NULL, NULL),
(91, 1, 88, b'1', 'GLOBAL', NULL, NULL),
(92, 1, 89, b'1', 'GLOBAL', NULL, NULL),
(93, 1, 90, b'1', 'GLOBAL', NULL, NULL),
(94, 1, 119, b'1', 'GLOBAL', NULL, NULL),
(95, 1, 120, b'1', 'GLOBAL', NULL, NULL),
(96, 1, 121, b'1', 'GLOBAL', NULL, NULL),
(97, 1, 150, b'1', 'GLOBAL', NULL, NULL),
(98, 1, 151, b'1', 'GLOBAL', NULL, NULL),
(99, 1, 152, b'1', 'GLOBAL', NULL, NULL),
(100, 1, 181, b'1', 'GLOBAL', NULL, NULL),
(101, 1, 182, b'1', 'GLOBAL', NULL, NULL),
(102, 1, 183, b'1', 'GLOBAL', NULL, NULL),
(103, 1, 212, b'1', 'GLOBAL', NULL, NULL),
(104, 1, 213, b'1', 'GLOBAL', NULL, NULL),
(105, 1, 214, b'1', 'GLOBAL', NULL, NULL),
(106, 1, 3, b'1', 'GLOBAL', NULL, NULL),
(107, 1, 18, b'1', 'GLOBAL', NULL, NULL),
(108, 1, 33, b'1', 'GLOBAL', NULL, NULL),
(109, 1, 48, b'1', 'GLOBAL', NULL, NULL),
(110, 1, 63, b'1', 'GLOBAL', NULL, NULL),
(111, 1, 91, b'1', 'GLOBAL', NULL, NULL),
(112, 1, 92, b'1', 'GLOBAL', NULL, NULL),
(113, 1, 122, b'1', 'GLOBAL', NULL, NULL),
(114, 1, 123, b'1', 'GLOBAL', NULL, NULL),
(115, 1, 153, b'1', 'GLOBAL', NULL, NULL),
(116, 1, 154, b'1', 'GLOBAL', NULL, NULL),
(117, 1, 184, b'1', 'GLOBAL', NULL, NULL),
(118, 1, 185, b'1', 'GLOBAL', NULL, NULL),
(119, 1, 215, b'1', 'GLOBAL', NULL, NULL),
(120, 1, 216, b'1', 'GLOBAL', NULL, NULL),
(121, 1, 1, b'1', 'GLOBAL', NULL, NULL),
(122, 1, 16, b'1', 'GLOBAL', NULL, NULL),
(123, 1, 31, b'1', 'GLOBAL', NULL, NULL),
(124, 1, 46, b'1', 'GLOBAL', NULL, NULL),
(125, 1, 61, b'1', 'GLOBAL', NULL, NULL),
(126, 1, 93, b'1', 'GLOBAL', NULL, NULL),
(127, 1, 124, b'1', 'GLOBAL', NULL, NULL),
(128, 1, 155, b'1', 'GLOBAL', NULL, NULL),
(129, 1, 186, b'1', 'GLOBAL', NULL, NULL),
(130, 1, 217, b'1', 'GLOBAL', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `rol_submodulo`
--

CREATE TABLE `rol_submodulo` (
  `id_rol_submodulo` bigint NOT NULL,
  `id_rol` int NOT NULL,
  `id_submodulo` int NOT NULL,
  `activo` bit(1) NOT NULL DEFAULT b'1',
  `actualizado_en` datetime DEFAULT NULL,
  `actualizado_por` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `rol_submodulo`
--

INSERT INTO `rol_submodulo` (`id_rol_submodulo`, `id_rol`, `id_submodulo`, `activo`, `actualizado_en`, `actualizado_por`) VALUES
(1, 1, 1, b'1', NULL, NULL),
(2, 1, 2, b'1', NULL, NULL),
(3, 1, 6, b'1', NULL, NULL),
(4, 1, 5, b'1', NULL, NULL),
(5, 1, 7, b'1', NULL, NULL),
(6, 1, 3, b'1', NULL, NULL),
(7, 1, 4, b'1', NULL, NULL),
(8, 1, 8, b'1', NULL, NULL),
(9, 1, 9, b'1', NULL, NULL),
(10, 1, 10, b'1', NULL, NULL),
(11, 1, 11, b'1', NULL, NULL),
(12, 1, 12, b'1', NULL, NULL),
(13, 1, 15, b'1', NULL, NULL),
(14, 1, 14, b'1', NULL, NULL),
(15, 1, 13, b'1', NULL, NULL),
(16, 1, 17, b'1', NULL, NULL),
(17, 1, 16, b'1', NULL, NULL),
(18, 1, 18, b'1', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `seguimiento_quirurgico`
--

CREATE TABLE `seguimiento_quirurgico` (
  `id_seguimiento` bigint NOT NULL,
  `id_historia_clinica` bigint NOT NULL,
  `id_reporte_operatorio` bigint DEFAULT NULL,
  `numero_control` int NOT NULL,
  `fecha_control` date NOT NULL,
  `procedimiento_realizado` text COLLATE utf8mb4_unicode_ci,
  `evolucion` text COLLATE utf8mb4_unicode_ci,
  `hallazgos` text COLLATE utf8mb4_unicode_ci,
  `indicaciones` text COLLATE utf8mb4_unicode_ci,
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `id_docente` int DEFAULT NULL,
  `id_alumno` int DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `signo_vital_operatorio`
--

CREATE TABLE `signo_vital_operatorio` (
  `id_signo_vital` bigint NOT NULL,
  `id_reporte_operatorio` bigint NOT NULL,
  `momento` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `presion_arterial` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `frecuencia_cardiaca` decimal(6,2) DEFAULT NULL,
  `frecuencia_respiratoria` decimal(6,2) DEFAULT NULL,
  `temperatura` decimal(4,1) DEFAULT NULL,
  `saturacion_oxigeno` decimal(5,2) DEFAULT NULL,
  `registrado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `submodulo`
--

CREATE TABLE `submodulo` (
  `id_submodulo` int NOT NULL,
  `id_modulo` int NOT NULL,
  `codigo_submodulo` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_submodulo` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion_submodulo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ruta` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `orden` int NOT NULL DEFAULT '0',
  `estado` bit(1) NOT NULL DEFAULT b'1',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `submodulo`
--

INSERT INTO `submodulo` (`id_submodulo`, `id_modulo`, `codigo_submodulo`, `nombre_submodulo`, `descripcion_submodulo`, `ruta`, `orden`, `estado`, `creado_en`, `actualizado_en`) VALUES
(1, 1, 'TABLERO', 'Tablero', NULL, NULL, 1, b'1', '2026-09-04 10:46:59', NULL),
(2, 2, 'PACIENTES', 'Pacientes', NULL, NULL, 2, b'1', '2026-09-04 10:47:00', NULL),
(3, 3, 'HISTORIAS', 'Historias clinicas', NULL, NULL, 3, b'1', '2026-09-04 10:47:00', NULL),
(4, 3, 'ODONTOGRAMA', 'Odontograma', NULL, NULL, 4, b'1', '2026-09-04 10:47:00', NULL),
(5, 3, 'EXAMEN_CLINICO', 'Examen clinico', NULL, NULL, 5, b'1', '2026-09-04 10:47:00', NULL),
(6, 3, 'DIAGNOSTICO_TRATAMIENTO', 'Diagnostico y tratamiento', NULL, NULL, 6, b'1', '2026-09-04 10:47:00', NULL),
(7, 3, 'EXAMENES_AUXILIARES', 'Examenes auxiliares', NULL, NULL, 7, b'1', '2026-09-04 10:47:00', NULL),
(8, 4, 'CONSENTIMIENTO', 'Consentimiento informado', NULL, NULL, 8, b'1', '2026-09-04 10:47:00', NULL),
(9, 4, 'PROGRAMACION', 'Programacion de cirugia', NULL, NULL, 9, b'1', '2026-09-04 10:47:00', NULL),
(10, 4, 'REPORTE_OPERATORIO', 'Reporte operatorio', NULL, NULL, 10, b'1', '2026-09-04 10:47:00', NULL),
(11, 4, 'SEGUIMIENTO', 'Seguimiento quirurgico', NULL, NULL, 11, b'1', '2026-09-04 10:47:00', NULL),
(12, 5, 'EXPORTAR_PDF', 'Exportar PDF', NULL, NULL, 12, b'1', '2026-09-04 10:47:00', NULL),
(13, 6, 'USUARIOS', 'Usuarios', NULL, NULL, 13, b'1', '2026-09-04 10:47:00', NULL),
(14, 6, 'ROLES', 'Roles y permisos', NULL, NULL, 14, b'1', '2026-09-04 10:47:00', NULL),
(15, 6, 'PACIENTES_PERSONAS', 'Personas y pacientes', NULL, NULL, 15, b'1', '2026-09-04 10:47:00', NULL),
(16, 7, 'PARAMETROS', 'Parametros', NULL, NULL, 16, b'1', '2026-09-04 10:47:00', NULL),
(17, 7, 'CATALOGOS_CLINICOS', 'Catalogos clinicos', NULL, NULL, 17, b'1', '2026-09-04 10:47:00', NULL),
(18, 8, 'BITACORA', 'Bitacora de auditoria', NULL, NULL, 18, b'1', '2026-09-04 10:47:00', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `usuario`
--

CREATE TABLE `usuario` (
  `id_usuario` int NOT NULL,
  `id_persona` int DEFAULT NULL,
  `nombre_usuario` varchar(80) COLLATE utf8mb4_unicode_ci NOT NULL,
  `contrasena_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` bit(1) NOT NULL DEFAULT b'1',
  `ultimo_inicio_sesion` datetime DEFAULT NULL,
  `contrasena_cambiada_en` datetime DEFAULT NULL,
  `intentos_fallidos` int NOT NULL DEFAULT '0',
  `bloqueado_hasta` datetime DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime DEFAULT NULL,
  `creado_por` int DEFAULT NULL,
  `actualizado_por` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `usuario`
--

INSERT INTO `usuario` (`id_usuario`, `id_persona`, `nombre_usuario`, `contrasena_hash`, `estado`, `ultimo_inicio_sesion`, `contrasena_cambiada_en`, `intentos_fallidos`, `bloqueado_hasta`, `creado_en`, `actualizado_en`, `creado_por`, `actualizado_por`) VALUES
(1, 1, 'admin', '$2y$12$d3D8gXVNudx5kK1Mfx3zIOhrkGVJO.Sh5CA.yyJMzNa5gAx72I5xu', b'1', '2026-09-27 16:23:02', '2026-09-04 16:31:44', 0, NULL, '2026-09-04 16:31:44', '2026-09-27 16:23:02', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `usuario_modulo`
--

CREATE TABLE `usuario_modulo` (
  `id_usuario_modulo` bigint NOT NULL,
  `id_usuario` int NOT NULL,
  `id_modulo` int NOT NULL,
  `activo` bit(1) NOT NULL DEFAULT b'1',
  `actualizado_en` datetime DEFAULT NULL,
  `actualizado_por` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `usuario_permiso`
--

CREATE TABLE `usuario_permiso` (
  `id_usuario_permiso` bigint NOT NULL,
  `id_usuario` int NOT NULL,
  `id_permiso` int NOT NULL,
  `permitido` bit(1) NOT NULL DEFAULT b'1',
  `alcance_datos` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'GLOBAL',
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `motivo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `actualizado_en` datetime DEFAULT NULL,
  `actualizado_por` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `usuario_rol`
--

CREATE TABLE `usuario_rol` (
  `id_usuario_rol` bigint NOT NULL,
  `id_usuario` int NOT NULL,
  `id_rol` int NOT NULL,
  `permitido` bit(1) NOT NULL DEFAULT b'1',
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `asignado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `asignado_por` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `usuario_rol`
--

INSERT INTO `usuario_rol` (`id_usuario_rol`, `id_usuario`, `id_rol`, `permitido`, `fecha_inicio`, `fecha_fin`, `asignado_en`, `asignado_por`) VALUES
(1, 1, 1, b'1', NULL, NULL, '2026-09-04 16:31:44', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `usuario_submodulo`
--

CREATE TABLE `usuario_submodulo` (
  `id_usuario_submodulo` bigint NOT NULL,
  `id_usuario` int NOT NULL,
  `id_submodulo` int NOT NULL,
  `activo` bit(1) NOT NULL DEFAULT b'1',
  `actualizado_en` datetime DEFAULT NULL,
  `actualizado_por` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Stand-in structure for view `vista_permisos_efectivos`
-- (See below for the actual view)
--
CREATE TABLE `vista_permisos_efectivos` (
`id_usuario` int
,`id_permiso` int
,`codigo_permiso` varchar(100)
,`accion` varchar(30)
,`permitido` bit(1)
,`alcance_datos` varchar(30)
,`origen` varchar(7)
);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `alta_clinica`
--
ALTER TABLE `alta_clinica`
  ADD PRIMARY KEY (`id_alta`),
  ADD UNIQUE KEY `uk_alta_clinica_1` (`id_reporte_operatorio`),
  ADD KEY `fk_alta_clinica_id_usuario_registro` (`id_usuario_registro`);

--
-- Indexes for table `alumno`
--
ALTER TABLE `alumno`
  ADD PRIMARY KEY (`id_alumno`),
  ADD UNIQUE KEY `uk_alumno_1` (`id_empleado`),
  ADD UNIQUE KEY `uk_alumno_2` (`codigo_alumno`);

--
-- Indexes for table `anamnesis`
--
ALTER TABLE `anamnesis`
  ADD PRIMARY KEY (`id_anamnesis`),
  ADD UNIQUE KEY `uk_anamnesis_1` (`id_historia_clinica`);

--
-- Indexes for table `antecedente`
--
ALTER TABLE `antecedente`
  ADD PRIMARY KEY (`id_antecedente`),
  ADD KEY `fk_antecedente_id_historia_clinica` (`id_historia_clinica`);

--
-- Indexes for table `antecedente_anestesia`
--
ALTER TABLE `antecedente_anestesia`
  ADD PRIMARY KEY (`id_antecedente_anestesia`),
  ADD KEY `fk_antecedente_anestesia_id_historia_clinica` (`id_historia_clinica`);

--
-- Indexes for table `antecedente_exodoncia`
--
ALTER TABLE `antecedente_exodoncia`
  ADD PRIMARY KEY (`id_antecedente_exodoncia`),
  ADD KEY `fk_antecedente_exodoncia_id_historia_clinica` (`id_historia_clinica`);

--
-- Indexes for table `antecedente_familiar`
--
ALTER TABLE `antecedente_familiar`
  ADD PRIMARY KEY (`id_antecedente_familiar`),
  ADD KEY `fk_antecedente_familiar_id_historia_clinica` (`id_historia_clinica`);

--
-- Indexes for table `archivo_clinico`
--
ALTER TABLE `archivo_clinico`
  ADD PRIMARY KEY (`id_archivo`),
  ADD KEY `fk_archivo_clinico_id_historia_clinica` (`id_historia_clinica`),
  ADD KEY `fk_archivo_clinico_id_usuario_carga` (`id_usuario_carga`);

--
-- Indexes for table `asignacion_historia`
--
ALTER TABLE `asignacion_historia`
  ADD PRIMARY KEY (`id_asignacion`),
  ADD KEY `fk_asignacion_historia_id_historia_clinica` (`id_historia_clinica`),
  ADD KEY `fk_asignacion_historia_id_alumno` (`id_alumno`),
  ADD KEY `fk_asignacion_historia_id_docente` (`id_docente`);

--
-- Indexes for table `auditoria`
--
ALTER TABLE `auditoria`
  ADD PRIMARY KEY (`id_auditoria`),
  ADD KEY `fk_auditoria_id_usuario` (`id_usuario`);

--
-- Indexes for table `catalogo_hallazgo_dental`
--
ALTER TABLE `catalogo_hallazgo_dental`
  ADD PRIMARY KEY (`id_hallazgo_dental`),
  ADD UNIQUE KEY `uk_catalogo_hallazgo_dental_1` (`codigo_hallazgo`);

--
-- Indexes for table `catalogo_tratamiento_dental`
--
ALTER TABLE `catalogo_tratamiento_dental`
  ADD PRIMARY KEY (`id_tratamiento_dental`),
  ADD UNIQUE KEY `uk_catalogo_tratamiento_dental_1` (`codigo_tratamiento`);

--
-- Indexes for table `configuracion_sistema`
--
ALTER TABLE `configuracion_sistema`
  ADD PRIMARY KEY (`id_configuracion`),
  ADD UNIQUE KEY `uk_configuracion_sistema_1` (`codigo_configuracion`);

--
-- Indexes for table `consentimiento_informado`
--
ALTER TABLE `consentimiento_informado`
  ADD PRIMARY KEY (`id_consentimiento`),
  ADD UNIQUE KEY `uk_consentimiento_informado_1` (`id_historia_clinica`,`version_documento`);

--
-- Indexes for table `diagnostico`
--
ALTER TABLE `diagnostico`
  ADD PRIMARY KEY (`id_diagnostico`),
  ADD UNIQUE KEY `uk_diagnostico_1` (`id_historia_clinica`,`tipo_diagnostico`,`numero_version`),
  ADD KEY `fk_diagnostico_id_usuario_registro` (`id_usuario_registro`);

--
-- Indexes for table `docente`
--
ALTER TABLE `docente`
  ADD PRIMARY KEY (`id_docente`),
  ADD UNIQUE KEY `uk_docente_1` (`id_empleado`);

--
-- Indexes for table `empleado`
--
ALTER TABLE `empleado`
  ADD PRIMARY KEY (`id_empleado`),
  ADD UNIQUE KEY `uk_empleado_1` (`id_persona`),
  ADD UNIQUE KEY `uk_empleado_2` (`codigo_empleado`);

--
-- Indexes for table `epicrisis`
--
ALTER TABLE `epicrisis`
  ADD PRIMARY KEY (`id_epicrisis`),
  ADD UNIQUE KEY `uk_epicrisis_1` (`id_reporte_operatorio`),
  ADD KEY `fk_epicrisis_id_usuario_registro` (`id_usuario_registro`);

--
-- Indexes for table `etapa_quirurgica`
--
ALTER TABLE `etapa_quirurgica`
  ADD PRIMARY KEY (`id_etapa_quirurgica`),
  ADD KEY `fk_etapa_quirurgica_id_plan_quirurgico` (`id_plan_quirurgico`);

--
-- Indexes for table `examen_auxiliar`
--
ALTER TABLE `examen_auxiliar`
  ADD PRIMARY KEY (`id_examen_auxiliar`),
  ADD KEY `fk_examen_auxiliar_id_historia_clinica` (`id_historia_clinica`),
  ADD KEY `fk_examen_auxiliar_id_archivo` (`id_archivo`);

--
-- Indexes for table `examen_clinico_general`
--
ALTER TABLE `examen_clinico_general`
  ADD PRIMARY KEY (`id_examen_clinico`),
  ADD UNIQUE KEY `uk_examen_clinico_general_1` (`id_historia_clinica`);

--
-- Indexes for table `examen_estomatologico`
--
ALTER TABLE `examen_estomatologico`
  ADD PRIMARY KEY (`id_examen_estomatologico`),
  ADD KEY `fk_examen_estomatologico_id_historia_clinica` (`id_historia_clinica`);

--
-- Indexes for table `examen_oclusion`
--
ALTER TABLE `examen_oclusion`
  ADD PRIMARY KEY (`id_examen_oclusion`),
  ADD UNIQUE KEY `uk_examen_oclusion_1` (`id_historia_clinica`);

--
-- Indexes for table `fase_tratamiento`
--
ALTER TABLE `fase_tratamiento`
  ADD PRIMARY KEY (`id_fase_tratamiento`),
  ADD UNIQUE KEY `uk_fase_tratamiento_1` (`id_plan_tratamiento`,`numero_fase`);

--
-- Indexes for table `firma_consentimiento`
--
ALTER TABLE `firma_consentimiento`
  ADD PRIMARY KEY (`id_firma`),
  ADD KEY `fk_firma_consentimiento_id_consentimiento` (`id_consentimiento`),
  ADD KEY `fk_firma_consentimiento_id_archivo_firma` (`id_archivo_firma`);

--
-- Indexes for table `firma_seguimiento`
--
ALTER TABLE `firma_seguimiento`
  ADD PRIMARY KEY (`id_firma_seguimiento`),
  ADD KEY `fk_firma_seguimiento_id_seguimiento` (`id_seguimiento`),
  ADD KEY `fk_firma_seguimiento_id_usuario` (`id_usuario`),
  ADD KEY `fk_firma_seguimiento_id_archivo_firma` (`id_archivo_firma`);

--
-- Indexes for table `hallazgo_estomatologico`
--
ALTER TABLE `hallazgo_estomatologico`
  ADD PRIMARY KEY (`id_hallazgo`),
  ADD KEY `fk_hallazgo_estomatologico_id_examen_estomatologico` (`id_examen_estomatologico`);

--
-- Indexes for table `historia_clinica`
--
ALTER TABLE `historia_clinica`
  ADD PRIMARY KEY (`id_historia_clinica`),
  ADD UNIQUE KEY `uk_historia_clinica_1` (`numero_historia`),
  ADD KEY `fk_historia_clinica_id_paciente` (`id_paciente`),
  ADD KEY `fk_historia_clinica_id_alumno_operador` (`id_alumno_operador`),
  ADD KEY `fk_historia_clinica_id_docente_supervisor` (`id_docente_supervisor`);

--
-- Indexes for table `login_historial`
--
ALTER TABLE `login_historial`
  ADD PRIMARY KEY (`id_login`),
  ADD KEY `fk_login_historial_id_usuario` (`id_usuario`);

--
-- Indexes for table `modulo`
--
ALTER TABLE `modulo`
  ADD PRIMARY KEY (`id_modulo`),
  ADD UNIQUE KEY `uk_modulo_1` (`codigo_modulo`),
  ADD UNIQUE KEY `uk_modulo_2` (`nombre_modulo`);

--
-- Indexes for table `odontograma`
--
ALTER TABLE `odontograma`
  ADD PRIMARY KEY (`id_odontograma`),
  ADD KEY `fk_odontograma_id_historia_clinica` (`id_historia_clinica`),
  ADD KEY `fk_odontograma_id_usuario_registro` (`id_usuario_registro`);

--
-- Indexes for table `odontograma_hallazgo`
--
ALTER TABLE `odontograma_hallazgo`
  ADD PRIMARY KEY (`id_odontograma_hallazgo`),
  ADD KEY `fk_odontograma_hallazgo_id_odontograma_pieza` (`id_odontograma_pieza`),
  ADD KEY `fk_odontograma_hallazgo_id_hallazgo_dental` (`id_hallazgo_dental`),
  ADD KEY `fk_odontograma_hallazgo_id_odontograma_superficie` (`id_odontograma_superficie`);

--
-- Indexes for table `odontograma_pieza`
--
ALTER TABLE `odontograma_pieza`
  ADD PRIMARY KEY (`id_odontograma_pieza`),
  ADD UNIQUE KEY `uk_odontograma_pieza_1` (`id_odontograma`,`id_pieza_dental`),
  ADD KEY `fk_odontograma_pieza_id_pieza_dental` (`id_pieza_dental`);

--
-- Indexes for table `odontograma_superficie`
--
ALTER TABLE `odontograma_superficie`
  ADD PRIMARY KEY (`id_odontograma_superficie`),
  ADD UNIQUE KEY `uk_odontograma_superficie_1` (`id_odontograma_pieza`,`superficie`);

--
-- Indexes for table `odontograma_tratamiento`
--
ALTER TABLE `odontograma_tratamiento`
  ADD PRIMARY KEY (`id_odontograma_tratamiento`),
  ADD KEY `fk_odontograma_tratamiento_id_odontograma_pieza` (`id_odontograma_pieza`),
  ADD KEY `fk_odontograma_tratamiento_id_tratamiento_dental` (`id_tratamiento_dental`),
  ADD KEY `fk_odontograma_tratamiento_id_odontograma_superficie` (`id_odontograma_superficie`);

--
-- Indexes for table `paciente`
--
ALTER TABLE `paciente`
  ADD PRIMARY KEY (`id_paciente`),
  ADD UNIQUE KEY `uk_paciente_1` (`id_persona`);

--
-- Indexes for table `paciente_contacto`
--
ALTER TABLE `paciente_contacto`
  ADD PRIMARY KEY (`id_contacto`),
  ADD KEY `fk_paciente_contacto_id_paciente` (`id_paciente`);

--
-- Indexes for table `perdida_dental`
--
ALTER TABLE `perdida_dental`
  ADD PRIMARY KEY (`id_perdida_dental`),
  ADD KEY `fk_perdida_dental_id_historia_clinica` (`id_historia_clinica`),
  ADD KEY `fk_perdida_dental_id_pieza_dental` (`id_pieza_dental`);

--
-- Indexes for table `permiso`
--
ALTER TABLE `permiso`
  ADD PRIMARY KEY (`id_permiso`),
  ADD UNIQUE KEY `uk_permiso_1` (`codigo_permiso`),
  ADD KEY `fk_permiso_id_modulo` (`id_modulo`),
  ADD KEY `fk_permiso_id_submodulo` (`id_submodulo`);

--
-- Indexes for table `persona`
--
ALTER TABLE `persona`
  ADD PRIMARY KEY (`id_persona`),
  ADD UNIQUE KEY `uk_persona_1` (`tipo_documento`,`numero_documento`);

--
-- Indexes for table `pieza_dental`
--
ALTER TABLE `pieza_dental`
  ADD PRIMARY KEY (`id_pieza_dental`),
  ADD UNIQUE KEY `uk_pieza_dental_1` (`codigo_fdi`);

--
-- Indexes for table `plan_quirurgico`
--
ALTER TABLE `plan_quirurgico`
  ADD PRIMARY KEY (`id_plan_quirurgico`),
  ADD KEY `fk_plan_quirurgico_id_historia_clinica` (`id_historia_clinica`);

--
-- Indexes for table `plan_tratamiento`
--
ALTER TABLE `plan_tratamiento`
  ADD PRIMARY KEY (`id_plan_tratamiento`),
  ADD KEY `fk_plan_tratamiento_id_historia_clinica` (`id_historia_clinica`);

--
-- Indexes for table `pregunta_salud`
--
ALTER TABLE `pregunta_salud`
  ADD PRIMARY KEY (`id_pregunta_salud`),
  ADD UNIQUE KEY `uk_pregunta_salud_1` (`numero`),
  ADD UNIQUE KEY `uk_pregunta_salud_2` (`orden`);

--
-- Indexes for table `prescripcion`
--
ALTER TABLE `prescripcion`
  ADD PRIMARY KEY (`id_prescripcion`),
  ADD KEY `fk_prescripcion_id_reporte_operatorio` (`id_reporte_operatorio`);

--
-- Indexes for table `programacion_cirugia`
--
ALTER TABLE `programacion_cirugia`
  ADD PRIMARY KEY (`id_programacion`),
  ADD KEY `fk_programacion_cirugia_id_historia_clinica` (`id_historia_clinica`),
  ADD KEY `fk_programacion_cirugia_id_plan_quirurgico` (`id_plan_quirurgico`);

--
-- Indexes for table `protesis`
--
ALTER TABLE `protesis`
  ADD PRIMARY KEY (`id_protesis`),
  ADD KEY `fk_protesis_id_historia_clinica` (`id_historia_clinica`);

--
-- Indexes for table `reporte_operatorio`
--
ALTER TABLE `reporte_operatorio`
  ADD PRIMARY KEY (`id_reporte_operatorio`),
  ADD KEY `fk_reporte_operatorio_id_historia_clinica` (`id_historia_clinica`),
  ADD KEY `fk_reporte_operatorio_id_plan_quirurgico` (`id_plan_quirurgico`),
  ADD KEY `fk_reporte_operatorio_id_docente_responsable` (`id_docente_responsable`),
  ADD KEY `fk_reporte_operatorio_id_alumno_operador` (`id_alumno_operador`);

--
-- Indexes for table `respuesta_salud`
--
ALTER TABLE `respuesta_salud`
  ADD PRIMARY KEY (`id_respuesta_salud`),
  ADD UNIQUE KEY `uk_respuesta_salud_1` (`id_historia_clinica`,`id_pregunta_salud`),
  ADD KEY `fk_respuesta_salud_id_pregunta_salud` (`id_pregunta_salud`);

--
-- Indexes for table `rol`
--
ALTER TABLE `rol`
  ADD PRIMARY KEY (`id_rol`),
  ADD UNIQUE KEY `uk_rol_1` (`codigo_rol`),
  ADD UNIQUE KEY `uk_rol_2` (`nombre_rol`);

--
-- Indexes for table `rol_modulo`
--
ALTER TABLE `rol_modulo`
  ADD PRIMARY KEY (`id_rol_modulo`),
  ADD UNIQUE KEY `uk_rol_modulo_1` (`id_rol`,`id_modulo`),
  ADD KEY `fk_rol_modulo_id_modulo` (`id_modulo`);

--
-- Indexes for table `rol_permiso`
--
ALTER TABLE `rol_permiso`
  ADD PRIMARY KEY (`id_rol_permiso`),
  ADD UNIQUE KEY `uk_rol_permiso_1` (`id_rol`,`id_permiso`),
  ADD KEY `fk_rol_permiso_id_permiso` (`id_permiso`);

--
-- Indexes for table `rol_submodulo`
--
ALTER TABLE `rol_submodulo`
  ADD PRIMARY KEY (`id_rol_submodulo`),
  ADD UNIQUE KEY `uk_rol_submodulo_1` (`id_rol`,`id_submodulo`),
  ADD KEY `fk_rol_submodulo_id_submodulo` (`id_submodulo`);

--
-- Indexes for table `seguimiento_quirurgico`
--
ALTER TABLE `seguimiento_quirurgico`
  ADD PRIMARY KEY (`id_seguimiento`),
  ADD UNIQUE KEY `uk_seguimiento_quirurgico_1` (`id_historia_clinica`,`numero_control`),
  ADD KEY `fk_seguimiento_quirurgico_id_reporte_operatorio` (`id_reporte_operatorio`),
  ADD KEY `fk_seguimiento_quirurgico_id_docente` (`id_docente`),
  ADD KEY `fk_seguimiento_quirurgico_id_alumno` (`id_alumno`);

--
-- Indexes for table `signo_vital_operatorio`
--
ALTER TABLE `signo_vital_operatorio`
  ADD PRIMARY KEY (`id_signo_vital`),
  ADD KEY `fk_signo_vital_operatorio_id_reporte_operatorio` (`id_reporte_operatorio`);

--
-- Indexes for table `submodulo`
--
ALTER TABLE `submodulo`
  ADD PRIMARY KEY (`id_submodulo`),
  ADD UNIQUE KEY `uk_submodulo_1` (`id_modulo`,`codigo_submodulo`);

--
-- Indexes for table `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `uk_usuario_1` (`nombre_usuario`),
  ADD UNIQUE KEY `uk_usuario_2` (`id_persona`);

--
-- Indexes for table `usuario_modulo`
--
ALTER TABLE `usuario_modulo`
  ADD PRIMARY KEY (`id_usuario_modulo`),
  ADD UNIQUE KEY `uk_usuario_modulo_1` (`id_usuario`,`id_modulo`),
  ADD KEY `fk_usuario_modulo_id_modulo` (`id_modulo`);

--
-- Indexes for table `usuario_permiso`
--
ALTER TABLE `usuario_permiso`
  ADD PRIMARY KEY (`id_usuario_permiso`),
  ADD UNIQUE KEY `uk_usuario_permiso_1` (`id_usuario`,`id_permiso`),
  ADD KEY `fk_usuario_permiso_id_permiso` (`id_permiso`);

--
-- Indexes for table `usuario_rol`
--
ALTER TABLE `usuario_rol`
  ADD PRIMARY KEY (`id_usuario_rol`),
  ADD KEY `fk_usuario_rol_id_usuario` (`id_usuario`),
  ADD KEY `fk_usuario_rol_id_rol` (`id_rol`);

--
-- Indexes for table `usuario_submodulo`
--
ALTER TABLE `usuario_submodulo`
  ADD PRIMARY KEY (`id_usuario_submodulo`),
  ADD UNIQUE KEY `uk_usuario_submodulo_1` (`id_usuario`,`id_submodulo`),
  ADD KEY `fk_usuario_submodulo_id_submodulo` (`id_submodulo`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `alta_clinica`
--
ALTER TABLE `alta_clinica`
  MODIFY `id_alta` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `alumno`
--
ALTER TABLE `alumno`
  MODIFY `id_alumno` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `anamnesis`
--
ALTER TABLE `anamnesis`
  MODIFY `id_anamnesis` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `antecedente`
--
ALTER TABLE `antecedente`
  MODIFY `id_antecedente` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `antecedente_anestesia`
--
ALTER TABLE `antecedente_anestesia`
  MODIFY `id_antecedente_anestesia` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `antecedente_exodoncia`
--
ALTER TABLE `antecedente_exodoncia`
  MODIFY `id_antecedente_exodoncia` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `antecedente_familiar`
--
ALTER TABLE `antecedente_familiar`
  MODIFY `id_antecedente_familiar` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `archivo_clinico`
--
ALTER TABLE `archivo_clinico`
  MODIFY `id_archivo` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `asignacion_historia`
--
ALTER TABLE `asignacion_historia`
  MODIFY `id_asignacion` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `auditoria`
--
ALTER TABLE `auditoria`
  MODIFY `id_auditoria` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `catalogo_hallazgo_dental`
--
ALTER TABLE `catalogo_hallazgo_dental`
  MODIFY `id_hallazgo_dental` smallint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `catalogo_tratamiento_dental`
--
ALTER TABLE `catalogo_tratamiento_dental`
  MODIFY `id_tratamiento_dental` smallint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `configuracion_sistema`
--
ALTER TABLE `configuracion_sistema`
  MODIFY `id_configuracion` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `consentimiento_informado`
--
ALTER TABLE `consentimiento_informado`
  MODIFY `id_consentimiento` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `diagnostico`
--
ALTER TABLE `diagnostico`
  MODIFY `id_diagnostico` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `docente`
--
ALTER TABLE `docente`
  MODIFY `id_docente` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `empleado`
--
ALTER TABLE `empleado`
  MODIFY `id_empleado` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `epicrisis`
--
ALTER TABLE `epicrisis`
  MODIFY `id_epicrisis` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `etapa_quirurgica`
--
ALTER TABLE `etapa_quirurgica`
  MODIFY `id_etapa_quirurgica` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `examen_auxiliar`
--
ALTER TABLE `examen_auxiliar`
  MODIFY `id_examen_auxiliar` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `examen_clinico_general`
--
ALTER TABLE `examen_clinico_general`
  MODIFY `id_examen_clinico` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `examen_estomatologico`
--
ALTER TABLE `examen_estomatologico`
  MODIFY `id_examen_estomatologico` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `examen_oclusion`
--
ALTER TABLE `examen_oclusion`
  MODIFY `id_examen_oclusion` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `fase_tratamiento`
--
ALTER TABLE `fase_tratamiento`
  MODIFY `id_fase_tratamiento` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `firma_consentimiento`
--
ALTER TABLE `firma_consentimiento`
  MODIFY `id_firma` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `firma_seguimiento`
--
ALTER TABLE `firma_seguimiento`
  MODIFY `id_firma_seguimiento` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `hallazgo_estomatologico`
--
ALTER TABLE `hallazgo_estomatologico`
  MODIFY `id_hallazgo` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `historia_clinica`
--
ALTER TABLE `historia_clinica`
  MODIFY `id_historia_clinica` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `login_historial`
--
ALTER TABLE `login_historial`
  MODIFY `id_login` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT for table `modulo`
--
ALTER TABLE `modulo`
  MODIFY `id_modulo` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `odontograma`
--
ALTER TABLE `odontograma`
  MODIFY `id_odontograma` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `odontograma_hallazgo`
--
ALTER TABLE `odontograma_hallazgo`
  MODIFY `id_odontograma_hallazgo` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `odontograma_pieza`
--
ALTER TABLE `odontograma_pieza`
  MODIFY `id_odontograma_pieza` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `odontograma_superficie`
--
ALTER TABLE `odontograma_superficie`
  MODIFY `id_odontograma_superficie` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `odontograma_tratamiento`
--
ALTER TABLE `odontograma_tratamiento`
  MODIFY `id_odontograma_tratamiento` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `paciente`
--
ALTER TABLE `paciente`
  MODIFY `id_paciente` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `paciente_contacto`
--
ALTER TABLE `paciente_contacto`
  MODIFY `id_contacto` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `perdida_dental`
--
ALTER TABLE `perdida_dental`
  MODIFY `id_perdida_dental` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `permiso`
--
ALTER TABLE `permiso`
  MODIFY `id_permiso` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=218;

--
-- AUTO_INCREMENT for table `persona`
--
ALTER TABLE `persona`
  MODIFY `id_persona` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `pieza_dental`
--
ALTER TABLE `pieza_dental`
  MODIFY `id_pieza_dental` smallint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- AUTO_INCREMENT for table `plan_quirurgico`
--
ALTER TABLE `plan_quirurgico`
  MODIFY `id_plan_quirurgico` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `plan_tratamiento`
--
ALTER TABLE `plan_tratamiento`
  MODIFY `id_plan_tratamiento` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pregunta_salud`
--
ALTER TABLE `pregunta_salud`
  MODIFY `id_pregunta_salud` smallint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `prescripcion`
--
ALTER TABLE `prescripcion`
  MODIFY `id_prescripcion` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `programacion_cirugia`
--
ALTER TABLE `programacion_cirugia`
  MODIFY `id_programacion` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `protesis`
--
ALTER TABLE `protesis`
  MODIFY `id_protesis` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reporte_operatorio`
--
ALTER TABLE `reporte_operatorio`
  MODIFY `id_reporte_operatorio` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `respuesta_salud`
--
ALTER TABLE `respuesta_salud`
  MODIFY `id_respuesta_salud` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `rol`
--
ALTER TABLE `rol`
  MODIFY `id_rol` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `rol_modulo`
--
ALTER TABLE `rol_modulo`
  MODIFY `id_rol_modulo` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `rol_permiso`
--
ALTER TABLE `rol_permiso`
  MODIFY `id_rol_permiso` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=131;

--
-- AUTO_INCREMENT for table `rol_submodulo`
--
ALTER TABLE `rol_submodulo`
  MODIFY `id_rol_submodulo` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `seguimiento_quirurgico`
--
ALTER TABLE `seguimiento_quirurgico`
  MODIFY `id_seguimiento` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `signo_vital_operatorio`
--
ALTER TABLE `signo_vital_operatorio`
  MODIFY `id_signo_vital` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `submodulo`
--
ALTER TABLE `submodulo`
  MODIFY `id_submodulo` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id_usuario` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `usuario_modulo`
--
ALTER TABLE `usuario_modulo`
  MODIFY `id_usuario_modulo` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `usuario_permiso`
--
ALTER TABLE `usuario_permiso`
  MODIFY `id_usuario_permiso` bigint NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `usuario_rol`
--
ALTER TABLE `usuario_rol`
  MODIFY `id_usuario_rol` bigint NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `usuario_submodulo`
--
ALTER TABLE `usuario_submodulo`
  MODIFY `id_usuario_submodulo` bigint NOT NULL AUTO_INCREMENT;

-- --------------------------------------------------------

--
-- Structure for view `vista_permisos_efectivos`
--
DROP TABLE IF EXISTS `vista_permisos_efectivos`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `vista_permisos_efectivos`  AS SELECT `u`.`id_usuario` AS `id_usuario`, `p`.`id_permiso` AS `id_permiso`, `p`.`codigo_permiso` AS `codigo_permiso`, `p`.`accion` AS `accion`, `up`.`permitido` AS `permitido`, `up`.`alcance_datos` AS `alcance_datos`, 'USUARIO' AS `origen` FROM ((`usuario` `u` join `usuario_permiso` `up` on((`up`.`id_usuario` = `u`.`id_usuario`))) join `permiso` `p` on((`p`.`id_permiso` = `up`.`id_permiso`))) WHERE ((`u`.`estado` = 1) AND (`p`.`estado` = 1))union all select `ur`.`id_usuario` AS `id_usuario`,`p`.`id_permiso` AS `id_permiso`,`p`.`codigo_permiso` AS `codigo_permiso`,`p`.`accion` AS `accion`,`rp`.`permitido` AS `permitido`,`rp`.`alcance_datos` AS `alcance_datos`,'ROL' AS `origen` from ((`usuario_rol` `ur` join `rol_permiso` `rp` on((`rp`.`id_rol` = `ur`.`id_rol`))) join `permiso` `p` on((`p`.`id_permiso` = `rp`.`id_permiso`))) where ((`ur`.`permitido` = 1) and (`p`.`estado` = 1) and exists(select 1 from `usuario_permiso` `ux` where ((`ux`.`id_usuario` = `ur`.`id_usuario`) and (`ux`.`id_permiso` = `rp`.`id_permiso`))) is false)  ;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `alta_clinica`
--
ALTER TABLE `alta_clinica`
  ADD CONSTRAINT `fk_alta_clinica_id_reporte_operatorio` FOREIGN KEY (`id_reporte_operatorio`) REFERENCES `reporte_operatorio` (`id_reporte_operatorio`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_alta_clinica_id_usuario_registro` FOREIGN KEY (`id_usuario_registro`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL;

--
-- Constraints for table `alumno`
--
ALTER TABLE `alumno`
  ADD CONSTRAINT `fk_alumno_id_empleado` FOREIGN KEY (`id_empleado`) REFERENCES `empleado` (`id_empleado`) ON DELETE CASCADE;

--
-- Constraints for table `anamnesis`
--
ALTER TABLE `anamnesis`
  ADD CONSTRAINT `fk_anamnesis_id_historia_clinica` FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica` (`id_historia_clinica`) ON DELETE CASCADE;

--
-- Constraints for table `antecedente`
--
ALTER TABLE `antecedente`
  ADD CONSTRAINT `fk_antecedente_id_historia_clinica` FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica` (`id_historia_clinica`) ON DELETE CASCADE;

--
-- Constraints for table `antecedente_anestesia`
--
ALTER TABLE `antecedente_anestesia`
  ADD CONSTRAINT `fk_antecedente_anestesia_id_historia_clinica` FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica` (`id_historia_clinica`) ON DELETE CASCADE;

--
-- Constraints for table `antecedente_exodoncia`
--
ALTER TABLE `antecedente_exodoncia`
  ADD CONSTRAINT `fk_antecedente_exodoncia_id_historia_clinica` FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica` (`id_historia_clinica`) ON DELETE CASCADE;

--
-- Constraints for table `antecedente_familiar`
--
ALTER TABLE `antecedente_familiar`
  ADD CONSTRAINT `fk_antecedente_familiar_id_historia_clinica` FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica` (`id_historia_clinica`) ON DELETE CASCADE;

--
-- Constraints for table `archivo_clinico`
--
ALTER TABLE `archivo_clinico`
  ADD CONSTRAINT `fk_archivo_clinico_id_historia_clinica` FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica` (`id_historia_clinica`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_archivo_clinico_id_usuario_carga` FOREIGN KEY (`id_usuario_carga`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL;

--
-- Constraints for table `asignacion_historia`
--
ALTER TABLE `asignacion_historia`
  ADD CONSTRAINT `fk_asignacion_historia_id_alumno` FOREIGN KEY (`id_alumno`) REFERENCES `alumno` (`id_alumno`) ON DELETE RESTRICT,
  ADD CONSTRAINT `fk_asignacion_historia_id_docente` FOREIGN KEY (`id_docente`) REFERENCES `docente` (`id_docente`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_asignacion_historia_id_historia_clinica` FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica` (`id_historia_clinica`) ON DELETE CASCADE;

--
-- Constraints for table `auditoria`
--
ALTER TABLE `auditoria`
  ADD CONSTRAINT `fk_auditoria_id_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL;

--
-- Constraints for table `consentimiento_informado`
--
ALTER TABLE `consentimiento_informado`
  ADD CONSTRAINT `fk_consentimiento_informado_id_historia_clinica` FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica` (`id_historia_clinica`) ON DELETE CASCADE;

--
-- Constraints for table `diagnostico`
--
ALTER TABLE `diagnostico`
  ADD CONSTRAINT `fk_diagnostico_id_historia_clinica` FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica` (`id_historia_clinica`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_diagnostico_id_usuario_registro` FOREIGN KEY (`id_usuario_registro`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL;

--
-- Constraints for table `docente`
--
ALTER TABLE `docente`
  ADD CONSTRAINT `fk_docente_id_empleado` FOREIGN KEY (`id_empleado`) REFERENCES `empleado` (`id_empleado`) ON DELETE CASCADE;

--
-- Constraints for table `empleado`
--
ALTER TABLE `empleado`
  ADD CONSTRAINT `fk_empleado_id_persona` FOREIGN KEY (`id_persona`) REFERENCES `persona` (`id_persona`) ON DELETE RESTRICT;

--
-- Constraints for table `epicrisis`
--
ALTER TABLE `epicrisis`
  ADD CONSTRAINT `fk_epicrisis_id_reporte_operatorio` FOREIGN KEY (`id_reporte_operatorio`) REFERENCES `reporte_operatorio` (`id_reporte_operatorio`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_epicrisis_id_usuario_registro` FOREIGN KEY (`id_usuario_registro`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL;

--
-- Constraints for table `etapa_quirurgica`
--
ALTER TABLE `etapa_quirurgica`
  ADD CONSTRAINT `fk_etapa_quirurgica_id_plan_quirurgico` FOREIGN KEY (`id_plan_quirurgico`) REFERENCES `plan_quirurgico` (`id_plan_quirurgico`) ON DELETE CASCADE;

--
-- Constraints for table `examen_auxiliar`
--
ALTER TABLE `examen_auxiliar`
  ADD CONSTRAINT `fk_examen_auxiliar_id_archivo` FOREIGN KEY (`id_archivo`) REFERENCES `archivo_clinico` (`id_archivo`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_examen_auxiliar_id_historia_clinica` FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica` (`id_historia_clinica`) ON DELETE CASCADE;

--
-- Constraints for table `examen_clinico_general`
--
ALTER TABLE `examen_clinico_general`
  ADD CONSTRAINT `fk_examen_clinico_general_id_historia_clinica` FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica` (`id_historia_clinica`) ON DELETE CASCADE;

--
-- Constraints for table `examen_estomatologico`
--
ALTER TABLE `examen_estomatologico`
  ADD CONSTRAINT `fk_examen_estomatologico_id_historia_clinica` FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica` (`id_historia_clinica`) ON DELETE CASCADE;

--
-- Constraints for table `examen_oclusion`
--
ALTER TABLE `examen_oclusion`
  ADD CONSTRAINT `fk_examen_oclusion_id_historia_clinica` FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica` (`id_historia_clinica`) ON DELETE CASCADE;

--
-- Constraints for table `fase_tratamiento`
--
ALTER TABLE `fase_tratamiento`
  ADD CONSTRAINT `fk_fase_tratamiento_id_plan_tratamiento` FOREIGN KEY (`id_plan_tratamiento`) REFERENCES `plan_tratamiento` (`id_plan_tratamiento`) ON DELETE CASCADE;

--
-- Constraints for table `firma_consentimiento`
--
ALTER TABLE `firma_consentimiento`
  ADD CONSTRAINT `fk_firma_consentimiento_id_archivo_firma` FOREIGN KEY (`id_archivo_firma`) REFERENCES `archivo_clinico` (`id_archivo`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_firma_consentimiento_id_consentimiento` FOREIGN KEY (`id_consentimiento`) REFERENCES `consentimiento_informado` (`id_consentimiento`) ON DELETE CASCADE;

--
-- Constraints for table `firma_seguimiento`
--
ALTER TABLE `firma_seguimiento`
  ADD CONSTRAINT `fk_firma_seguimiento_id_archivo_firma` FOREIGN KEY (`id_archivo_firma`) REFERENCES `archivo_clinico` (`id_archivo`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_firma_seguimiento_id_seguimiento` FOREIGN KEY (`id_seguimiento`) REFERENCES `seguimiento_quirurgico` (`id_seguimiento`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_firma_seguimiento_id_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL;

--
-- Constraints for table `hallazgo_estomatologico`
--
ALTER TABLE `hallazgo_estomatologico`
  ADD CONSTRAINT `fk_hallazgo_estomatologico_id_examen_estomatologico` FOREIGN KEY (`id_examen_estomatologico`) REFERENCES `examen_estomatologico` (`id_examen_estomatologico`) ON DELETE CASCADE;

--
-- Constraints for table `historia_clinica`
--
ALTER TABLE `historia_clinica`
  ADD CONSTRAINT `fk_historia_clinica_id_alumno_operador` FOREIGN KEY (`id_alumno_operador`) REFERENCES `alumno` (`id_alumno`) ON DELETE RESTRICT,
  ADD CONSTRAINT `fk_historia_clinica_id_docente_supervisor` FOREIGN KEY (`id_docente_supervisor`) REFERENCES `docente` (`id_docente`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_historia_clinica_id_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `paciente` (`id_paciente`) ON DELETE RESTRICT;

--
-- Constraints for table `login_historial`
--
ALTER TABLE `login_historial`
  ADD CONSTRAINT `fk_login_historial_id_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL;

--
-- Constraints for table `odontograma`
--
ALTER TABLE `odontograma`
  ADD CONSTRAINT `fk_odontograma_id_historia_clinica` FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica` (`id_historia_clinica`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_odontograma_id_usuario_registro` FOREIGN KEY (`id_usuario_registro`) REFERENCES `usuario` (`id_usuario`) ON DELETE SET NULL;

--
-- Constraints for table `odontograma_hallazgo`
--
ALTER TABLE `odontograma_hallazgo`
  ADD CONSTRAINT `fk_odontograma_hallazgo_id_hallazgo_dental` FOREIGN KEY (`id_hallazgo_dental`) REFERENCES `catalogo_hallazgo_dental` (`id_hallazgo_dental`) ON DELETE RESTRICT,
  ADD CONSTRAINT `fk_odontograma_hallazgo_id_odontograma_pieza` FOREIGN KEY (`id_odontograma_pieza`) REFERENCES `odontograma_pieza` (`id_odontograma_pieza`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_odontograma_hallazgo_id_odontograma_superficie` FOREIGN KEY (`id_odontograma_superficie`) REFERENCES `odontograma_superficie` (`id_odontograma_superficie`) ON DELETE SET NULL;

--
-- Constraints for table `odontograma_pieza`
--
ALTER TABLE `odontograma_pieza`
  ADD CONSTRAINT `fk_odontograma_pieza_id_odontograma` FOREIGN KEY (`id_odontograma`) REFERENCES `odontograma` (`id_odontograma`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_odontograma_pieza_id_pieza_dental` FOREIGN KEY (`id_pieza_dental`) REFERENCES `pieza_dental` (`id_pieza_dental`) ON DELETE RESTRICT;

--
-- Constraints for table `odontograma_superficie`
--
ALTER TABLE `odontograma_superficie`
  ADD CONSTRAINT `fk_odontograma_superficie_id_odontograma_pieza` FOREIGN KEY (`id_odontograma_pieza`) REFERENCES `odontograma_pieza` (`id_odontograma_pieza`) ON DELETE CASCADE;

--
-- Constraints for table `odontograma_tratamiento`
--
ALTER TABLE `odontograma_tratamiento`
  ADD CONSTRAINT `fk_odontograma_tratamiento_id_odontograma_pieza` FOREIGN KEY (`id_odontograma_pieza`) REFERENCES `odontograma_pieza` (`id_odontograma_pieza`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_odontograma_tratamiento_id_odontograma_superficie` FOREIGN KEY (`id_odontograma_superficie`) REFERENCES `odontograma_superficie` (`id_odontograma_superficie`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_odontograma_tratamiento_id_tratamiento_dental` FOREIGN KEY (`id_tratamiento_dental`) REFERENCES `catalogo_tratamiento_dental` (`id_tratamiento_dental`) ON DELETE RESTRICT;

--
-- Constraints for table `paciente`
--
ALTER TABLE `paciente`
  ADD CONSTRAINT `fk_paciente_id_persona` FOREIGN KEY (`id_persona`) REFERENCES `persona` (`id_persona`) ON DELETE RESTRICT;

--
-- Constraints for table `paciente_contacto`
--
ALTER TABLE `paciente_contacto`
  ADD CONSTRAINT `fk_paciente_contacto_id_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `paciente` (`id_paciente`) ON DELETE CASCADE;

--
-- Constraints for table `perdida_dental`
--
ALTER TABLE `perdida_dental`
  ADD CONSTRAINT `fk_perdida_dental_id_historia_clinica` FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica` (`id_historia_clinica`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_perdida_dental_id_pieza_dental` FOREIGN KEY (`id_pieza_dental`) REFERENCES `pieza_dental` (`id_pieza_dental`) ON DELETE SET NULL;

--
-- Constraints for table `permiso`
--
ALTER TABLE `permiso`
  ADD CONSTRAINT `fk_permiso_id_modulo` FOREIGN KEY (`id_modulo`) REFERENCES `modulo` (`id_modulo`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_permiso_id_submodulo` FOREIGN KEY (`id_submodulo`) REFERENCES `submodulo` (`id_submodulo`) ON DELETE CASCADE;

--
-- Constraints for table `plan_quirurgico`
--
ALTER TABLE `plan_quirurgico`
  ADD CONSTRAINT `fk_plan_quirurgico_id_historia_clinica` FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica` (`id_historia_clinica`) ON DELETE CASCADE;

--
-- Constraints for table `plan_tratamiento`
--
ALTER TABLE `plan_tratamiento`
  ADD CONSTRAINT `fk_plan_tratamiento_id_historia_clinica` FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica` (`id_historia_clinica`) ON DELETE CASCADE;

--
-- Constraints for table `prescripcion`
--
ALTER TABLE `prescripcion`
  ADD CONSTRAINT `fk_prescripcion_id_reporte_operatorio` FOREIGN KEY (`id_reporte_operatorio`) REFERENCES `reporte_operatorio` (`id_reporte_operatorio`) ON DELETE CASCADE;

--
-- Constraints for table `programacion_cirugia`
--
ALTER TABLE `programacion_cirugia`
  ADD CONSTRAINT `fk_programacion_cirugia_id_historia_clinica` FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica` (`id_historia_clinica`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_programacion_cirugia_id_plan_quirurgico` FOREIGN KEY (`id_plan_quirurgico`) REFERENCES `plan_quirurgico` (`id_plan_quirurgico`) ON DELETE SET NULL;

--
-- Constraints for table `protesis`
--
ALTER TABLE `protesis`
  ADD CONSTRAINT `fk_protesis_id_historia_clinica` FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica` (`id_historia_clinica`) ON DELETE CASCADE;

--
-- Constraints for table `reporte_operatorio`
--
ALTER TABLE `reporte_operatorio`
  ADD CONSTRAINT `fk_reporte_operatorio_id_alumno_operador` FOREIGN KEY (`id_alumno_operador`) REFERENCES `alumno` (`id_alumno`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_reporte_operatorio_id_docente_responsable` FOREIGN KEY (`id_docente_responsable`) REFERENCES `docente` (`id_docente`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_reporte_operatorio_id_historia_clinica` FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica` (`id_historia_clinica`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_reporte_operatorio_id_plan_quirurgico` FOREIGN KEY (`id_plan_quirurgico`) REFERENCES `plan_quirurgico` (`id_plan_quirurgico`) ON DELETE SET NULL;

--
-- Constraints for table `respuesta_salud`
--
ALTER TABLE `respuesta_salud`
  ADD CONSTRAINT `fk_respuesta_salud_id_historia_clinica` FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica` (`id_historia_clinica`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_respuesta_salud_id_pregunta_salud` FOREIGN KEY (`id_pregunta_salud`) REFERENCES `pregunta_salud` (`id_pregunta_salud`) ON DELETE RESTRICT;

--
-- Constraints for table `rol_modulo`
--
ALTER TABLE `rol_modulo`
  ADD CONSTRAINT `fk_rol_modulo_id_modulo` FOREIGN KEY (`id_modulo`) REFERENCES `modulo` (`id_modulo`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_rol_modulo_id_rol` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`) ON DELETE CASCADE;

--
-- Constraints for table `rol_permiso`
--
ALTER TABLE `rol_permiso`
  ADD CONSTRAINT `fk_rol_permiso_id_permiso` FOREIGN KEY (`id_permiso`) REFERENCES `permiso` (`id_permiso`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_rol_permiso_id_rol` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`) ON DELETE CASCADE;

--
-- Constraints for table `rol_submodulo`
--
ALTER TABLE `rol_submodulo`
  ADD CONSTRAINT `fk_rol_submodulo_id_rol` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_rol_submodulo_id_submodulo` FOREIGN KEY (`id_submodulo`) REFERENCES `submodulo` (`id_submodulo`) ON DELETE CASCADE;

--
-- Constraints for table `seguimiento_quirurgico`
--
ALTER TABLE `seguimiento_quirurgico`
  ADD CONSTRAINT `fk_seguimiento_quirurgico_id_alumno` FOREIGN KEY (`id_alumno`) REFERENCES `alumno` (`id_alumno`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_seguimiento_quirurgico_id_docente` FOREIGN KEY (`id_docente`) REFERENCES `docente` (`id_docente`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_seguimiento_quirurgico_id_historia_clinica` FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica` (`id_historia_clinica`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_seguimiento_quirurgico_id_reporte_operatorio` FOREIGN KEY (`id_reporte_operatorio`) REFERENCES `reporte_operatorio` (`id_reporte_operatorio`) ON DELETE SET NULL;

--
-- Constraints for table `signo_vital_operatorio`
--
ALTER TABLE `signo_vital_operatorio`
  ADD CONSTRAINT `fk_signo_vital_operatorio_id_reporte_operatorio` FOREIGN KEY (`id_reporte_operatorio`) REFERENCES `reporte_operatorio` (`id_reporte_operatorio`) ON DELETE CASCADE;

--
-- Constraints for table `submodulo`
--
ALTER TABLE `submodulo`
  ADD CONSTRAINT `fk_submodulo_id_modulo` FOREIGN KEY (`id_modulo`) REFERENCES `modulo` (`id_modulo`) ON DELETE CASCADE;

--
-- Constraints for table `usuario`
--
ALTER TABLE `usuario`
  ADD CONSTRAINT `fk_usuario_id_persona` FOREIGN KEY (`id_persona`) REFERENCES `persona` (`id_persona`) ON DELETE SET NULL;

--
-- Constraints for table `usuario_modulo`
--
ALTER TABLE `usuario_modulo`
  ADD CONSTRAINT `fk_usuario_modulo_id_modulo` FOREIGN KEY (`id_modulo`) REFERENCES `modulo` (`id_modulo`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_usuario_modulo_id_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE;

--
-- Constraints for table `usuario_permiso`
--
ALTER TABLE `usuario_permiso`
  ADD CONSTRAINT `fk_usuario_permiso_id_permiso` FOREIGN KEY (`id_permiso`) REFERENCES `permiso` (`id_permiso`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_usuario_permiso_id_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE;

--
-- Constraints for table `usuario_rol`
--
ALTER TABLE `usuario_rol`
  ADD CONSTRAINT `fk_usuario_rol_id_rol` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_usuario_rol_id_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE;

--
-- Constraints for table `usuario_submodulo`
--
ALTER TABLE `usuario_submodulo`
  ADD CONSTRAINT `fk_usuario_submodulo_id_submodulo` FOREIGN KEY (`id_submodulo`) REFERENCES `submodulo` (`id_submodulo`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_usuario_submodulo_id_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuario` (`id_usuario`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
