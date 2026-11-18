-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Nov 09, 2026 at 04:28 AM
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
  `id_alta_clinica` bigint UNSIGNED NOT NULL,
  `id_reporte_operatorio` bigint UNSIGNED NOT NULL,
  `fecha_alta` datetime DEFAULT NULL,
  `condicion_alta` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `indicaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `alumno`
--

CREATE TABLE `alumno` (
  `id_alumno` bigint UNSIGNED NOT NULL,
  `codigo_alumno` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_documento` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DNI',
  `numero_documento` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombres` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellidos` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `sexo` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `correo` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `alumno`
--

INSERT INTO `alumno` (`id_alumno`, `codigo_alumno`, `tipo_documento`, `numero_documento`, `nombres`, `apellidos`, `fecha_nacimiento`, `sexo`, `telefono`, `correo`, `direccion`, `estado`, `creado_en`, `actualizado_en`) VALUES
(1, 'ALU-11225487', 'DNI', '11225487', 'Lopez', 'Curiñaupa', NULL, NULL, NULL, NULL, NULL, 1, '2026-11-08 13:57:53', NULL),
(2, 'ALU-15481556', 'DNI', '15481556', 'Pomodoro', 'ASD', NULL, NULL, NULL, NULL, NULL, 1, '2026-11-08 14:30:25', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `alumno_periodo`
--

CREATE TABLE `alumno_periodo` (
  `id_alumno_periodo` bigint UNSIGNED NOT NULL,
  `id_alumno` bigint UNSIGNED NOT NULL,
  `id_periodo_academico` bigint UNSIGNED NOT NULL,
  `ciclo` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `anamnesis`
--

CREATE TABLE `anamnesis` (
  `id_anamnesis` bigint UNSIGNED NOT NULL,
  `id_historia_clinica` bigint UNSIGNED NOT NULL,
  `enfermedad_actual` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `motivo_consulta` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `estado_general` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ectoscopia` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `ultima_visita_dentista` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `motivo_visita_dentista` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `anamnesis`
--

INSERT INTO `anamnesis` (`id_anamnesis`, `id_historia_clinica`, `enfermedad_actual`, `motivo_consulta`, `estado_general`, `ectoscopia`, `ultima_visita_dentista`, `motivo_visita_dentista`, `observaciones`, `creado_en`, `actualizado_en`) VALUES
(1, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 13:44:55', NULL),
(2, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 13:54:04', NULL),
(3, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 14:00:27', NULL),
(4, 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 14:20:05', NULL),
(5, 6, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 14:36:18', NULL),
(6, 8, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 15:43:47', NULL),
(7, 9, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 15:49:48', NULL),
(8, 10, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 15:53:23', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `anamnesis_estado_psicologico`
--

CREATE TABLE `anamnesis_estado_psicologico` (
  `id_anamnesis_estado` bigint UNSIGNED NOT NULL,
  `id_anamnesis` bigint UNSIGNED NOT NULL,
  `estado` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `antecedente`
--

CREATE TABLE `antecedente` (
  `id_antecedente` bigint UNSIGNED NOT NULL,
  `id_historia_clinica` bigint UNSIGNED NOT NULL,
  `tipo_antecedente` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_antecedente` date DEFAULT NULL,
  `observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `antecedente_anestesia`
--

CREATE TABLE `antecedente_anestesia` (
  `id_antecedente_anestesia` bigint UNSIGNED NOT NULL,
  `id_historia_clinica` bigint UNSIGNED NOT NULL,
  `anestesia_total` tinyint(1) DEFAULT NULL,
  `tipo_intervencion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reaccion_anestesia` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reaccion_detalle` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `hemorragia_intervencion` tinyint(1) DEFAULT NULL,
  `hemorragia_dias` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cicatrizacion` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cicatrizacion_otros` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `antecedente_anestesia`
--

INSERT INTO `antecedente_anestesia` (`id_antecedente_anestesia`, `id_historia_clinica`, `anestesia_total`, `tipo_intervencion`, `reaccion_anestesia`, `reaccion_detalle`, `hemorragia_intervencion`, `hemorragia_dias`, `cicatrizacion`, `cicatrizacion_otros`, `creado_en`) VALUES
(17, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 13:54:04'),
(28, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 14:09:44'),
(30, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 14:17:19'),
(37, 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 14:27:57'),
(52, 6, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 14:38:00'),
(60, 8, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 15:47:47'),
(135, 9, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 16:11:19'),
(138, 10, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 21:28:36');

-- --------------------------------------------------------

--
-- Table structure for table `antecedente_exodoncia`
--

CREATE TABLE `antecedente_exodoncia` (
  `id_antecedente_exodoncia` bigint UNSIGNED NOT NULL,
  `id_historia_clinica` bigint UNSIGNED NOT NULL,
  `id_pieza_dental` bigint UNSIGNED DEFAULT NULL,
  `realizo_exodoncias` tinyint(1) DEFAULT NULL,
  `problemas_anestesico` tinyint(1) DEFAULT NULL,
  `hemorragia_post_exodoncia` tinyint(1) DEFAULT NULL,
  `hemorragia_dias` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `realizada_por` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_exodoncia` date DEFAULT NULL,
  `observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `antecedente_exodoncia`
--

INSERT INTO `antecedente_exodoncia` (`id_antecedente_exodoncia`, `id_historia_clinica`, `id_pieza_dental`, `realizo_exodoncias`, `problemas_anestesico`, `hemorragia_post_exodoncia`, `hemorragia_dias`, `realizada_por`, `fecha_exodoncia`, `observaciones`, `creado_en`) VALUES
(17, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 13:54:04'),
(28, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 14:09:44'),
(30, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 14:17:19'),
(37, 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 14:27:57'),
(52, 6, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 14:38:00'),
(60, 8, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 15:47:47'),
(135, 9, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 16:11:19'),
(138, 10, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 21:28:36');

-- --------------------------------------------------------

--
-- Table structure for table `antecedente_familiar`
--

CREATE TABLE `antecedente_familiar` (
  `id_antecedente_familiar` bigint UNSIGNED NOT NULL,
  `id_historia_clinica` bigint UNSIGNED NOT NULL,
  `parentesco` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado_familiar` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cantidad_total` smallint UNSIGNED DEFAULT NULL,
  `vivos` smallint UNSIGNED DEFAULT NULL,
  `fallecidos` smallint UNSIGNED DEFAULT NULL,
  `detalle` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `antecedente_familiar`
--

INSERT INTO `antecedente_familiar` (`id_antecedente_familiar`, `id_historia_clinica`, `parentesco`, `estado_familiar`, `cantidad_total`, `vivos`, `fallecidos`, `detalle`, `creado_en`) VALUES
(49, 2, 'PADRE', NULL, NULL, NULL, NULL, NULL, '2026-11-08 13:54:04'),
(50, 2, 'MADRE', NULL, NULL, NULL, NULL, NULL, '2026-11-08 13:54:04'),
(51, 2, 'HERMANOS', NULL, NULL, NULL, NULL, NULL, '2026-11-08 13:54:04'),
(82, 3, 'PADRE', NULL, NULL, NULL, NULL, NULL, '2026-11-08 14:09:44'),
(83, 3, 'MADRE', NULL, NULL, NULL, NULL, NULL, '2026-11-08 14:09:44'),
(84, 3, 'HERMANOS', NULL, NULL, NULL, NULL, NULL, '2026-11-08 14:09:44'),
(88, 1, 'PADRE', NULL, NULL, NULL, NULL, NULL, '2026-11-08 14:17:19'),
(89, 1, 'MADRE', NULL, NULL, NULL, NULL, NULL, '2026-11-08 14:17:19'),
(90, 1, 'HERMANOS', NULL, NULL, NULL, NULL, NULL, '2026-11-08 14:17:19'),
(109, 4, 'PADRE', NULL, NULL, NULL, NULL, NULL, '2026-11-08 14:27:57'),
(110, 4, 'MADRE', NULL, NULL, NULL, NULL, NULL, '2026-11-08 14:27:57'),
(111, 4, 'HERMANOS', NULL, NULL, NULL, NULL, NULL, '2026-11-08 14:27:57'),
(154, 6, 'PADRE', NULL, NULL, NULL, NULL, NULL, '2026-11-08 14:38:00'),
(155, 6, 'MADRE', NULL, NULL, NULL, NULL, NULL, '2026-11-08 14:38:00'),
(156, 6, 'HERMANOS', NULL, NULL, NULL, NULL, NULL, '2026-11-08 14:38:00'),
(178, 8, 'PADRE', NULL, NULL, NULL, NULL, NULL, '2026-11-08 15:47:47'),
(179, 8, 'MADRE', NULL, NULL, NULL, NULL, NULL, '2026-11-08 15:47:47'),
(180, 8, 'HERMANOS', NULL, NULL, NULL, NULL, NULL, '2026-11-08 15:47:47'),
(403, 9, 'PADRE', NULL, NULL, NULL, NULL, NULL, '2026-11-08 16:11:19'),
(404, 9, 'MADRE', NULL, NULL, NULL, NULL, NULL, '2026-11-08 16:11:19'),
(405, 9, 'HERMANOS', NULL, NULL, NULL, NULL, NULL, '2026-11-08 16:11:19'),
(412, 10, 'PADRE', NULL, NULL, NULL, NULL, NULL, '2026-11-08 21:28:36'),
(413, 10, 'MADRE', NULL, NULL, NULL, NULL, NULL, '2026-11-08 21:28:36'),
(414, 10, 'HERMANOS', NULL, NULL, NULL, NULL, NULL, '2026-11-08 21:28:36');

-- --------------------------------------------------------

--
-- Table structure for table `antecedente_fisiologico`
--

CREATE TABLE `antecedente_fisiologico` (
  `id_antecedente_fisiologico` bigint UNSIGNED NOT NULL,
  `id_historia_clinica` bigint UNSIGNED NOT NULL,
  `prenatal` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `prenatal_detalle` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `natal` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `natal_detalle` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lactancia` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lactancia_otros` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `menarquia` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `menstruacion_caracteristicas` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `menstruacion_final` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `gestacion` tinyint(1) DEFAULT NULL,
  `gestacion_tiempo` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `antecedente_fisiologico`
--

INSERT INTO `antecedente_fisiologico` (`id_antecedente_fisiologico`, `id_historia_clinica`, `prenatal`, `prenatal_detalle`, `natal`, `natal_detalle`, `lactancia`, `lactancia_otros`, `menarquia`, `menstruacion_caracteristicas`, `menstruacion_final`, `gestacion`, `gestacion_tiempo`, `creado_en`, `actualizado_en`) VALUES
(1, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 13:44:55', NULL),
(2, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 13:54:04', NULL),
(3, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 14:00:27', NULL),
(4, 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 14:20:05', NULL),
(5, 6, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 14:36:18', NULL),
(6, 8, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 15:43:47', NULL),
(7, 9, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 15:49:48', NULL),
(8, 10, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 15:53:23', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `antecedente_habito_nocivo`
--

CREATE TABLE `antecedente_habito_nocivo` (
  `id_antecedente_habito` bigint UNSIGNED NOT NULL,
  `id_antecedente_personal` bigint UNSIGNED NOT NULL,
  `tipo_habito` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `detalle` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `antecedente_personal`
--

CREATE TABLE `antecedente_personal` (
  `id_antecedente_personal` bigint UNSIGNED NOT NULL,
  `id_historia_clinica` bigint UNSIGNED NOT NULL,
  `hijos_numero` smallint UNSIGNED DEFAULT NULL,
  `hijos_vivos` smallint UNSIGNED DEFAULT NULL,
  `hijos_fallecidos` smallint UNSIGNED DEFAULT NULL,
  `ningun_hijo` tinyint(1) DEFAULT NULL,
  `vivienda` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `vivienda_otros` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `material_vivienda` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `material_otros` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `viajes` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `viajes_otros` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `alimentacion` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `alimentacion_otros` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `inmunizaciones` tinyint(1) DEFAULT NULL,
  `situacion_socioeconomica` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `antecedente_personal`
--

INSERT INTO `antecedente_personal` (`id_antecedente_personal`, `id_historia_clinica`, `hijos_numero`, `hijos_vivos`, `hijos_fallecidos`, `ningun_hijo`, `vivienda`, `vivienda_otros`, `material_vivienda`, `material_otros`, `viajes`, `viajes_otros`, `alimentacion`, `alimentacion_otros`, `inmunizaciones`, `situacion_socioeconomica`, `creado_en`, `actualizado_en`) VALUES
(1, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 13:44:55', NULL),
(2, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 13:54:04', NULL),
(3, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 14:00:27', NULL),
(4, 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 14:20:05', NULL),
(5, 6, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 14:36:18', NULL),
(6, 8, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 15:43:47', NULL),
(7, 9, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 15:49:48', NULL),
(8, 10, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 15:53:23', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `antecedente_terapeutico`
--

CREATE TABLE `antecedente_terapeutico` (
  `id_antecedente_terapeutico` bigint UNSIGNED NOT NULL,
  `id_historia_clinica` bigint UNSIGNED NOT NULL,
  `alergia_medicamento` tinyint(1) DEFAULT NULL,
  `alergia_medicamento_detalle` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `medicacion_anterior_nombre` varchar(180) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `medicacion_anterior_dosis` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `medicacion_actual` tinyint(1) DEFAULT NULL,
  `medicacion_actual_nombre` varchar(180) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `medicacion_actual_dosis` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `medicacion_actual_motivo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `antecedente_terapeutico`
--

INSERT INTO `antecedente_terapeutico` (`id_antecedente_terapeutico`, `id_historia_clinica`, `alergia_medicamento`, `alergia_medicamento_detalle`, `medicacion_anterior_nombre`, `medicacion_anterior_dosis`, `medicacion_actual`, `medicacion_actual_nombre`, `medicacion_actual_dosis`, `medicacion_actual_motivo`, `creado_en`, `actualizado_en`) VALUES
(1, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 13:44:55', NULL),
(2, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 13:54:04', NULL),
(3, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 14:00:27', NULL),
(4, 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 14:20:05', NULL),
(5, 6, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 14:36:18', NULL),
(6, 8, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 15:43:47', NULL),
(7, 9, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 15:49:48', NULL),
(8, 10, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 15:53:23', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `archivo_clinico`
--

CREATE TABLE `archivo_clinico` (
  `id_archivo` bigint UNSIGNED NOT NULL,
  `id_historia_clinica` bigint UNSIGNED NOT NULL,
  `categoria` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `seccion` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `clave_campo` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nombre_original` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_guardado` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `ruta` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `extension` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mime_type` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tamano_bytes` bigint UNSIGNED DEFAULT NULL,
  `hash_sha256` char(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descripcion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo_usuario` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_usuario` bigint UNSIGNED DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `auditoria`
--

CREATE TABLE `auditoria` (
  `id_auditoria` bigint UNSIGNED NOT NULL,
  `tabla_afectada` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_registro` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `accion` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_usuario` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_usuario` bigint UNSIGNED DEFAULT NULL,
  `nombre_usuario` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion_ip` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `agente_usuario` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `valores_anteriores` json DEFAULT NULL,
  `valores_nuevos` json DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `auditoria`
--

INSERT INTO `auditoria` (`id_auditoria`, `tabla_afectada`, `id_registro`, `accion`, `tipo_usuario`, `id_usuario`, `nombre_usuario`, `direccion_ip`, `agente_usuario`, `valores_anteriores`, `valores_nuevos`, `creado_en`) VALUES
(1, 'historia_seccion_estado', '1', 'REVISAR_SECCION', 'DOCENTE', 1, 'SUPER-@dmin', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '{\"datos-paciente\": \"in-progress\"}', '{\"datos-paciente\": \"approved\"}', '2026-11-08 13:45:28'),
(2, 'historia_seccion_estado', '1', 'REVISAR_SECCION', 'DOCENTE', 1, 'SUPER-@dmin', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '{\"datos-paciente\": \"in-progress\"}', '{\"datos-paciente\": \"approved\"}', '2026-11-08 13:45:44'),
(3, 'historia_seccion_estado', '1', 'REVISAR_SECCION', 'DOCENTE', 1, 'SUPER-@dmin', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '{\"datos-paciente\": \"complete\"}', '{\"datos-paciente\": \"approved\"}', '2026-11-08 13:45:58'),
(4, 'historia_clinica', '1', 'CAMBIAR_ESTADO', 'DOCENTE', 1, 'SUPER-@dmin', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '{\"estado\": \"EN_PROCESO\"}', '{\"estado\": \"PENDIENTE_REVISION\", \"observacion\": null}', '2026-11-08 13:46:11'),
(5, 'historia_clinica', '1', 'CAMBIAR_ESTADO', 'DOCENTE', 1, 'SUPER-@dmin', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '{\"estado\": \"PENDIENTE_REVISION\"}', '{\"estado\": \"VALIDADA\", \"observacion\": null}', '2026-11-08 13:46:22'),
(6, 'usuario_docente', 'DOCENTE-2', 'CREAR', 'DOCENTE', 1, 'SUPER-@dmin', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', NULL, '{\"id\": \"DOCENTE-2\", \"rol\": \"Docente\", \"roles\": [\"DOCENTE\"], \"correo\": null, \"estado\": true, \"nombre\": \"Juan Carlo\", \"nombres\": \"Juan\", \"telefono\": \"956956956\", \"apellidos\": \"Carlo\", \"bloqueado\": false, \"creado_en\": \"2026-11-08T13:51:08-05:00\", \"codigo_rol\": \"DOCENTE\", \"tipo_usuario\": \"DOCENTE\", \"nombre_usuario\": \"juan@gmail.com\", \"tipo_documento\": \"DNI\", \"numero_documento\": \"15452615\", \"ultimo_inicio_sesion\": null}', '2026-11-08 13:51:08'),
(7, 'usuario_docente', 'DOCENTE-3', 'CREAR', 'DOCENTE', 1, 'SUPER-@dmin', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', NULL, '{\"id\": \"DOCENTE-3\", \"rol\": \"Administrador\", \"roles\": [\"ADMINISTRADOR\"], \"correo\": null, \"estado\": true, \"nombre\": \"Lopez CAR\", \"nombres\": \"Lopez\", \"telefono\": null, \"apellidos\": \"CAR\", \"bloqueado\": false, \"creado_en\": \"2026-11-08T13:56:52-05:00\", \"codigo_rol\": \"ADMINISTRADOR\", \"tipo_usuario\": \"DOCENTE\", \"nombre_usuario\": \"lopez@gmail.com\", \"tipo_documento\": \"DNI\", \"numero_documento\": \"78455959\", \"ultimo_inicio_sesion\": null}', '2026-11-08 13:56:52'),
(8, 'usuario_docente', 'DOCENTE-3', 'DESACTIVAR', 'DOCENTE', 1, 'SUPER-@dmin', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '{\"id\": \"DOCENTE-3\", \"rol\": \"Administrador\", \"roles\": [\"ADMINISTRADOR\"], \"correo\": null, \"estado\": true, \"nombre\": \"Lopez CAR\", \"nombres\": \"Lopez\", \"telefono\": null, \"apellidos\": \"CAR\", \"bloqueado\": false, \"creado_en\": \"2026-11-08T13:56:52-05:00\", \"codigo_rol\": \"ADMINISTRADOR\", \"tipo_usuario\": \"DOCENTE\", \"nombre_usuario\": \"lopez@gmail.com\", \"tipo_documento\": \"DNI\", \"numero_documento\": \"78455959\", \"ultimo_inicio_sesion\": null}', '{\"id\": \"DOCENTE-3\", \"rol\": \"Administrador\", \"roles\": [\"ADMINISTRADOR\"], \"correo\": null, \"estado\": false, \"nombre\": \"Lopez CAR\", \"nombres\": \"Lopez\", \"telefono\": null, \"apellidos\": \"CAR\", \"bloqueado\": false, \"creado_en\": \"2026-11-08T13:56:52-05:00\", \"codigo_rol\": \"ADMINISTRADOR\", \"tipo_usuario\": \"DOCENTE\", \"nombre_usuario\": \"lopez@gmail.com\", \"tipo_documento\": \"DNI\", \"numero_documento\": \"78455959\", \"ultimo_inicio_sesion\": null}', '2026-11-08 13:57:19'),
(9, 'usuario_alumno', 'ALUMNO-1', 'CREAR', 'DOCENTE', 1, 'SUPER-@dmin', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', NULL, '{\"id\": \"ALUMNO-1\", \"rol\": \"Alumno\", \"roles\": [\"ALUMNO\"], \"correo\": null, \"estado\": true, \"nombre\": \"Lopez Curiñaupa\", \"nombres\": \"Lopez\", \"telefono\": null, \"apellidos\": \"Curiñaupa\", \"bloqueado\": false, \"creado_en\": \"2026-11-08T13:57:53-05:00\", \"codigo_rol\": \"ALUMNO\", \"tipo_usuario\": \"ALUMNO\", \"nombre_usuario\": \"lopez8@gmail.com\", \"tipo_documento\": \"DNI\", \"numero_documento\": \"11225487\", \"ultimo_inicio_sesion\": null}', '2026-11-08 13:57:54'),
(10, 'usuario_docente', 'DOCENTE-3', 'EDITAR', 'DOCENTE', 1, 'SUPER-@dmin', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '{\"id\": \"DOCENTE-3\", \"rol\": \"Administrador\", \"roles\": [\"ADMINISTRADOR\"], \"correo\": null, \"estado\": false, \"nombre\": \"Lopez CAR\", \"nombres\": \"Lopez\", \"telefono\": null, \"apellidos\": \"CAR\", \"bloqueado\": false, \"creado_en\": \"2026-11-08T13:56:52-05:00\", \"codigo_rol\": \"ADMINISTRADOR\", \"tipo_usuario\": \"DOCENTE\", \"nombre_usuario\": \"lopez@gmail.com\", \"tipo_documento\": \"DNI\", \"numero_documento\": \"78455959\", \"ultimo_inicio_sesion\": null}', '{\"id\": \"DOCENTE-3\", \"rol\": \"Docente\", \"roles\": [\"DOCENTE\"], \"correo\": null, \"estado\": false, \"nombre\": \"Lopez CAR\", \"nombres\": \"Lopez\", \"telefono\": null, \"apellidos\": \"CAR\", \"bloqueado\": false, \"creado_en\": \"2026-11-08T13:56:52-05:00\", \"codigo_rol\": \"DOCENTE\", \"tipo_usuario\": \"DOCENTE\", \"nombre_usuario\": \"lopez@gmail.com\", \"tipo_documento\": \"DNI\", \"numero_documento\": \"78455959\", \"ultimo_inicio_sesion\": null}', '2026-11-08 13:58:06'),
(11, 'historia_clinica', '3', 'CAMBIAR_ESTADO', 'ALUMNO', 1, 'lopez8@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '{\"estado\": \"EN_PROCESO\"}', '{\"estado\": \"PENDIENTE_REVISION\", \"observacion\": null}', '2026-11-08 14:01:00'),
(12, 'historia_clinica', '3', 'CAMBIAR_ESTADO', 'DOCENTE', 1, 'SUPER-@dmin', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"estado\": \"PENDIENTE_REVISION\"}', '{\"estado\": \"VALIDADA\", \"observacion\": null}', '2026-11-08 14:02:35'),
(13, 'historia_clinica', '2', 'CAMBIAR_ESTADO', 'DOCENTE', 1, 'SUPER-@dmin', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"estado\": \"EN_PROCESO\"}', '{\"estado\": \"PENDIENTE_REVISION\", \"observacion\": null}', '2026-11-08 14:02:54'),
(14, 'historia_clinica', '2', 'CAMBIAR_ESTADO', 'DOCENTE', 1, 'SUPER-@dmin', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"estado\": \"PENDIENTE_REVISION\"}', '{\"estado\": \"OBSERVADA\", \"observacion\": \"asdasdads\"}', '2026-11-08 14:02:58'),
(15, 'historia_clinica', '3', 'ASIGNAR_PERSONAL', 'DOCENTE', 1, 'SUPER-@dmin', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', NULL, '{\"personal\": \"DOCENTE-3\"}', '2026-11-08 14:09:43'),
(16, 'historia_seccion_estado', '1', 'REVISAR_SECCION', 'DOCENTE', 1, 'SUPER-@dmin', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '{\"datos-paciente\": \"in-progress\"}', '{\"datos-paciente\": \"approved\"}', '2026-11-08 14:17:19'),
(17, 'historia_clinica', '2', 'CAMBIAR_ESTADO', 'DOCENTE', 1, 'SUPER-@dmin', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '{\"estado\": \"OBSERVADA\"}', '{\"estado\": \"PENDIENTE_REVISION\", \"observacion\": null}', '2026-11-08 14:17:41'),
(18, 'historia_clinica', '2', 'CAMBIAR_ESTADO', 'DOCENTE', 1, 'SUPER-@dmin', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '{\"estado\": \"PENDIENTE_REVISION\"}', '{\"estado\": \"VALIDADA\", \"observacion\": null}', '2026-11-08 14:17:47'),
(19, 'historia_seccion_estado', '4', 'REVISAR_SECCION', 'ALUMNO', 1, 'lopez8@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"datos-paciente\": \"complete\"}', '{\"datos-paciente\": \"review\"}', '2026-11-08 14:20:08'),
(20, 'historia_seccion_estado', '4', 'REVISAR_SECCION', 'ALUMNO', 1, 'lopez8@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"datos-paciente\": \"in-progress\"}', '{\"datos-paciente\": \"review\"}', '2026-11-08 14:20:13'),
(21, 'historia_clinica', '4', 'ASIGNAR_PERSONAL', 'ALUMNO', 1, 'lopez8@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', NULL, '{\"personal\": \"DOCENTE-2\"}', '2026-11-08 14:27:57'),
(22, 'usuario_docente', 'DOCENTE-3', 'ACTIVAR', 'DOCENTE', 1, 'SUPER-@dmin', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '{\"id\": \"DOCENTE-3\", \"rol\": \"Docente\", \"roles\": [\"DOCENTE\"], \"correo\": null, \"estado\": false, \"nombre\": \"Lopez CAR\", \"nombres\": \"Lopez\", \"telefono\": null, \"apellidos\": \"CAR\", \"bloqueado\": false, \"creado_en\": \"2026-11-08T13:56:52-05:00\", \"codigo_rol\": \"DOCENTE\", \"tipo_usuario\": \"DOCENTE\", \"nombre_usuario\": \"lopez@gmail.com\", \"tipo_documento\": \"DNI\", \"numero_documento\": \"78455959\", \"ultimo_inicio_sesion\": null}', '{\"id\": \"DOCENTE-3\", \"rol\": \"Docente\", \"roles\": [\"DOCENTE\"], \"correo\": null, \"estado\": true, \"nombre\": \"Lopez CAR\", \"nombres\": \"Lopez\", \"telefono\": null, \"apellidos\": \"CAR\", \"bloqueado\": false, \"creado_en\": \"2026-11-08T13:56:52-05:00\", \"codigo_rol\": \"DOCENTE\", \"tipo_usuario\": \"DOCENTE\", \"nombre_usuario\": \"lopez@gmail.com\", \"tipo_documento\": \"DNI\", \"numero_documento\": \"78455959\", \"ultimo_inicio_sesion\": null}', '2026-11-08 14:28:38'),
(23, 'usuario_alumno', 'ALUMNO-2', 'CREAR', 'DOCENTE', 1, 'SUPER-@dmin', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', NULL, '{\"id\": \"ALUMNO-2\", \"rol\": \"Alumno\", \"roles\": [\"ALUMNO\"], \"correo\": null, \"estado\": true, \"nombre\": \"Pomodoro ASD\", \"nombres\": \"Pomodoro\", \"telefono\": null, \"apellidos\": \"ASD\", \"bloqueado\": false, \"creado_en\": \"2026-11-08T14:30:25-05:00\", \"codigo_rol\": \"ALUMNO\", \"tipo_usuario\": \"ALUMNO\", \"nombre_usuario\": \"pomodoro@gmail.com\", \"tipo_documento\": \"DNI\", \"numero_documento\": \"15481556\", \"ultimo_inicio_sesion\": null}', '2026-11-08 14:30:25'),
(24, 'historia_clinica', '5', 'ASIGNAR_PERSONAL', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', NULL, '{\"personal\": \"ALUMNO-2\"}', '2026-11-08 14:33:24'),
(25, 'historia_clinica', '6', 'ASIGNAR_PERSONAL', 'ALUMNO', 2, 'pomodoro@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', NULL, '{\"personal\": \"DOCENTE-2\"}', '2026-11-08 14:36:18'),
(26, 'historia_seccion_estado', '6', 'REVISAR_SECCION', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"datos-paciente\": \"complete\"}', '{\"datos-paciente\": \"approved\"}', '2026-11-08 14:37:09'),
(27, 'historia_seccion_estado', '6', 'REVISAR_SECCION', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '[]', '{\"examen-clinico\": \"approved\"}', '2026-11-08 14:37:20'),
(28, 'historia_clinica', '6', 'ASIGNAR_PERSONAL', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', NULL, '{\"personal\": \"ALUMNO-1\"}', '2026-11-08 14:40:45'),
(29, 'historia_clinica', '6', 'INACTIVAR', 'DOCENTE', 1, 'SUPER-@dmin', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '{\"estado\": \"activa\"}', '{\"estado\": \"inactiva\"}', '2026-11-08 15:25:56'),
(30, 'historia_clinica', '5', 'INACTIVAR', 'DOCENTE', 1, 'SUPER-@dmin', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '{\"estado\": \"activa\"}', '{\"estado\": \"inactiva\"}', '2026-11-08 15:26:26'),
(31, 'historia_clinica', '7', 'CREAR', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', NULL, '{\"codigo\": \"HC-2026-007\"}', '2026-11-08 15:30:06'),
(32, 'historia_clinica', '7', 'ASIGNAR_PERSONAL', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', NULL, '{\"personal\": \"ALUMNO-2\"}', '2026-11-08 15:30:12'),
(33, 'historia_clinica', '7', 'ASIGNAR_PERSONAL', 'DOCENTE', 1, 'SUPER-@dmin', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', NULL, '{\"personal\": \"ALUMNO-1\"}', '2026-11-08 15:34:48'),
(34, 'historia_clinica', '8', 'CREAR', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', NULL, '{\"codigo\": \"HC-2026-008\"}', '2026-11-08 15:42:41'),
(35, 'historia_clinica', '8', 'ASIGNAR_PERSONAL', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"asistente_responsable\": \"Sin asignar\"}', '{\"asistente_responsable\": \"Pomodoro ASD\"}', '2026-11-08 15:42:46'),
(36, 'historia_clinica', '8', 'CAMBIAR_ESTADO', 'ALUMNO', 2, 'pomodoro@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"estado\": \"BORRADOR\"}', '{\"estado\": \"PENDIENTE_REVISION\", \"observacion\": null}', '2026-11-08 15:43:06'),
(37, 'historia_clinica', '8', 'CAMBIAR_ESTADO', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"estado\": \"PENDIENTE_REVISION\"}', '{\"estado\": \"VALIDADA\", \"observacion\": null}', '2026-11-08 15:43:22'),
(38, 'historia_clinica', '8', 'EDITAR', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"consentimiento\": []}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 15:43:47'),
(39, 'historia_seccion_estado', '8', 'MARCAR_COMPLETADO', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '[]', '{\"datos-paciente\": \"complete\"}', '2026-11-08 15:43:47'),
(40, 'historia_clinica', '8', 'EDITAR', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}, \"reporte-operatorio\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}, \"reporte-operatorio\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 15:43:49'),
(41, 'historia_clinica', '8', 'EDITAR', 'DOCENTE', 1, 'SUPER-@dmin', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 15:44:13'),
(42, 'historia_seccion_estado', '8', 'REVISAR_SECCION', 'DOCENTE', 1, 'SUPER-@dmin', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '{\"datos-paciente\": \"complete\"}', '{\"datos-paciente\": \"approved\"}', '2026-11-08 15:44:13'),
(43, 'historia_clinica', '8', 'EDITAR', 'DOCENTE', 1, 'SUPER-@dmin', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 15:44:14'),
(44, 'historia_seccion_estado', '8', 'REABRIR_SECCION', 'DOCENTE', 1, 'SUPER-@dmin', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '{\"datos-paciente\": \"approved\"}', '{\"datos-paciente\": \"in-progress\"}', '2026-11-08 15:44:14'),
(45, 'historia_clinica', '8', 'EDITAR', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 15:44:37'),
(46, 'historia_seccion_estado', '8', 'REVISAR_SECCION', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"datos-paciente\": \"in-progress\"}', '{\"datos-paciente\": \"approved\"}', '2026-11-08 15:44:37'),
(47, 'historia_clinica', '8', 'EDITAR', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 15:44:40'),
(48, 'historia_seccion_estado', '8', 'REABRIR_SECCION', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"datos-paciente\": \"approved\"}', '{\"datos-paciente\": \"in-progress\"}', '2026-11-08 15:44:40'),
(49, 'historia_clinica', '8', 'ASIGNAR_PERSONAL', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"asistente_responsable\": \"Pomodoro ASD\"}', '{\"asistente_responsable\": \"Lopez Curiñaupa\"}', '2026-11-08 15:46:26'),
(50, 'historia_clinica', '8', 'EDITAR', 'DOCENTE', 1, 'SUPER-@dmin', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 15:47:40'),
(51, 'historia_seccion_estado', '8', 'REVISAR_SECCION', 'DOCENTE', 1, 'SUPER-@dmin', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '{\"datos-paciente\": \"in-progress\"}', '{\"datos-paciente\": \"approved\"}', '2026-11-08 15:47:40'),
(52, 'historia_clinica', '8', 'EDITAR', 'DOCENTE', 1, 'SUPER-@dmin', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 15:47:47'),
(53, 'historia_seccion_estado', '8', 'REVISAR_SECCION', 'DOCENTE', 1, 'SUPER-@dmin', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '[]', '{\"examen-clinico\": \"approved\"}', '2026-11-08 15:47:47'),
(54, 'historia_clinica', '9', 'CREAR', 'DOCENTE', 1, 'SUPER-@dmin', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', NULL, '{\"codigo\": \"HC-2026-009\"}', '2026-11-08 15:49:29'),
(55, 'historia_clinica', '9', 'ASIGNAR_PERSONAL', 'DOCENTE', 1, 'SUPER-@dmin', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '{\"asistente_responsable\": \"Sin asignar\"}', '{\"asistente_responsable\": \"Pomodoro ASD\"}', '2026-11-08 15:49:34'),
(56, 'historia_clinica', '9', 'EDITAR', 'ALUMNO', 2, 'pomodoro@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"consentimiento\": [], \"datos-paciente\": {\"dni\": \"56598995\", \"edad\": 27, \"sexo\": \"F\", \"celular\": \"985965956\", \"nombres\": \"Mari\", \"operador\": \"Pomodoro ASD\", \"apellidos\": \"Canchanya Chambergo\", \"fechaPaciente\": \"2026-11-08T15:49\", \"apellidoMaterno\": \"Chambergo\", \"apellidoPaterno\": \"Canchanya\", \"fechaNacimiento\": \"1998-12-04\", \"modalidadAsistencia\": \"acompanado\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}, \"datos-paciente\": {\"dni\": \"56598995\", \"edad\": 27, \"sexo\": \"F\", \"correo\": \"asdasd\", \"idioma\": \"asdasd\", \"celular\": \"985965956\", \"nombres\": \"Mari\", \"operador\": \"Pomodoro ASD\", \"apellidos\": \"Canchanya Chambergo\", \"fechaPaciente\": \"2026-11-08T15:49\", \"centroEstudios\": \"asdasd\", \"apellidoMaterno\": \"Chambergo\", \"apellidoPaterno\": \"Canchanya\", \"fechaNacimiento\": \"1998-12-04\", \"modalidadAsistencia\": \"acompanado\"}}', '2026-11-08 15:49:48'),
(57, 'historia_clinica', '9', 'EDITAR', 'ALUMNO', 2, 'pomodoro@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}, \"datos-paciente\": {\"dni\": \"56598995\", \"edad\": 27, \"sexo\": \"F\", \"correo\": \"asdasd\", \"idioma\": \"asdasd\", \"celular\": \"985965956\", \"nombres\": \"Mari\", \"operador\": \"Pomodoro ASD\", \"apellidos\": \"Canchanya Chambergo\", \"fechaPaciente\": \"2026-11-08T15:49\", \"centroEstudios\": \"asdasd\", \"apellidoMaterno\": \"Chambergo\", \"apellidoPaterno\": \"Canchanya\", \"fechaNacimiento\": \"1998-12-04\", \"modalidadAsistencia\": \"acompanado\"}, \"reporte-operatorio\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}, \"datos-paciente\": {\"dni\": \"56598995\", \"edad\": 27, \"sexo\": \"F\", \"correo\": \"asdasd\", \"idioma\": \"asdasd\", \"celular\": \"985965956\", \"nombres\": \"Mari\", \"operador\": \"Pomodoro ASD\", \"apellidos\": \"Canchanya Chambergo\", \"fechaPaciente\": \"2026-11-08T15:49\", \"centroEstudios\": \"asdasd\", \"apellidoMaterno\": \"Chambergo\", \"apellidoPaterno\": \"Canchanya\", \"fechaNacimiento\": \"1998-12-04\", \"modalidadAsistencia\": \"acompanado\"}, \"reporte-operatorio\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 15:49:49'),
(58, 'historia_seccion_estado', '9', 'REVISAR_SECCION', 'ALUMNO', 2, 'pomodoro@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"datos-paciente\": \"in-progress\"}', '{\"datos-paciente\": \"review\"}', '2026-11-08 15:49:49'),
(59, 'historia_clinica', '9', 'EDITAR', 'ALUMNO', 2, 'pomodoro@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}, \"datos-paciente\": {\"dni\": \"56598995\", \"edad\": 27, \"sexo\": \"F\", \"correo\": \"asdasd\", \"idioma\": \"asdasd\", \"celular\": \"985965956\", \"nombres\": \"Mari\", \"operador\": \"Pomodoro ASD\", \"apellidos\": \"Canchanya Chambergo\", \"fechaPaciente\": \"2026-11-08T15:49\", \"centroEstudios\": \"asdasd\", \"apellidoMaterno\": \"Chambergo\", \"apellidoPaterno\": \"Canchanya\", \"fechaNacimiento\": \"1998-12-04\", \"modalidadAsistencia\": \"acompanado\"}, \"reporte-operatorio\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}, \"datos-paciente\": {\"dni\": \"56598995\", \"edad\": 27, \"sexo\": \"F\", \"correo\": \"asdasd\", \"idioma\": \"asdasd\", \"celular\": \"985965956\", \"nombres\": \"Mari\", \"operador\": \"Pomodoro ASD\", \"apellidos\": \"Canchanya Chambergo\", \"fechaPaciente\": \"2026-11-08T15:49\", \"centroEstudios\": \"asdasd\", \"apellidoMaterno\": \"Chambergo\", \"apellidoPaterno\": \"Canchanya\", \"fechaNacimiento\": \"1998-12-04\", \"modalidadAsistencia\": \"acompanado\"}, \"reporte-operatorio\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 15:49:50'),
(60, 'historia_clinica', '9', 'EDITAR', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 15:50:21'),
(61, 'historia_seccion_estado', '9', 'REABRIR_SECCION', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"datos-paciente\": \"review\"}', '{\"datos-paciente\": \"in-progress\"}', '2026-11-08 15:50:21'),
(62, 'historia_clinica', '9', 'EDITAR', 'ALUMNO', 2, 'pomodoro@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}, \"datos-paciente\": {\"dni\": \"56598995\", \"edad\": 27, \"sexo\": \"F\", \"correo\": \"asdasd\", \"idioma\": \"asdasd\", \"celular\": \"985965956\", \"nombres\": \"Mari\", \"operador\": \"Pomodoro ASD\", \"apellidos\": \"Canchanya Chambergo\", \"fechaPaciente\": \"2026-11-08T15:49\", \"centroEstudios\": \"asdasd\", \"apellidoMaterno\": \"Chambergo\", \"apellidoPaterno\": \"Canchanya\", \"fechaNacimiento\": \"1998-12-04\", \"modalidadAsistencia\": \"acompanado\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}, \"datos-paciente\": {\"dni\": \"56598995\", \"edad\": 27, \"sexo\": \"F\", \"correo\": \"asdasd\", \"idioma\": \"asdasdasdasd\", \"celular\": \"985965956\", \"nombres\": \"Mari\", \"operador\": \"Pomodoro ASD\", \"apellidos\": \"Canchanya Chambergo\", \"fechaPaciente\": \"2026-11-08T15:49\", \"centroEstudios\": \"asdasdasdasd\", \"apellidoMaterno\": \"Chambergo\", \"apellidoPaterno\": \"Canchanya\", \"fechaNacimiento\": \"1998-12-04\", \"modalidadAsistencia\": \"acompanado\"}}', '2026-11-08 15:50:38'),
(63, 'historia_clinica', '9', 'EDITAR', 'ALUMNO', 2, 'pomodoro@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 15:50:40'),
(64, 'historia_seccion_estado', '9', 'REVISAR_SECCION', 'ALUMNO', 2, 'pomodoro@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"datos-paciente\": \"in-progress\"}', '{\"datos-paciente\": \"review\"}', '2026-11-08 15:50:40'),
(65, 'historia_clinica', '9', 'EDITAR', 'ALUMNO', 2, 'pomodoro@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 15:50:40'),
(66, 'historia_clinica', '9', 'EDITAR', 'ALUMNO', 2, 'pomodoro@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}, \"datos-paciente\": {\"dni\": \"56598995\", \"edad\": 27, \"sexo\": \"F\", \"correo\": \"asdasd\", \"idioma\": \"asdasdasdasd\", \"celular\": \"985965956\", \"nombres\": \"Mari\", \"operador\": \"Pomodoro ASD\", \"apellidos\": \"Canchanya Chambergo\", \"fechaPaciente\": \"2026-11-08T15:49\", \"centroEstudios\": \"asdasdasdasd\", \"apellidoMaterno\": \"Chambergo\", \"apellidoPaterno\": \"Canchanya\", \"fechaNacimiento\": \"1998-12-04\", \"modalidadAsistencia\": \"acompanado\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}, \"datos-paciente\": {\"dni\": \"56598995\", \"edad\": 27, \"sexo\": \"F\", \"correo\": \"asdasd\", \"idioma\": \"asdasdasdasd\", \"celular\": \"985965956\", \"nombres\": \"Mari\", \"operador\": \"Pomodoro ASD\", \"religion\": \"asdasdasd\", \"apellidos\": \"Canchanya Chambergo\", \"fechaPaciente\": \"2026-11-08T15:49\", \"centroEstudios\": \"asdasdasdasd\", \"apellidoMaterno\": \"Chambergo\", \"apellidoPaterno\": \"Canchanya\", \"fechaNacimiento\": \"1998-12-04\", \"modalidadAsistencia\": \"acompanado\"}}', '2026-11-08 15:50:46'),
(67, 'historia_clinica', '9', 'EDITAR', 'ALUMNO', 2, 'pomodoro@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}, \"datos-paciente\": {\"dni\": \"56598995\", \"edad\": 27, \"sexo\": \"F\", \"correo\": \"asdasd\", \"idioma\": \"asdasdasdasd\", \"celular\": \"985965956\", \"nombres\": \"Mari\", \"operador\": \"Pomodoro ASD\", \"religion\": \"asdasdasd\", \"apellidos\": \"Canchanya Chambergo\", \"fechaPaciente\": \"2026-11-08T15:49\", \"centroEstudios\": \"asdasdasdasd\", \"apellidoMaterno\": \"Chambergo\", \"apellidoPaterno\": \"Canchanya\", \"fechaNacimiento\": \"1998-12-04\", \"modalidadAsistencia\": \"acompanado\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}, \"datos-paciente\": {\"dni\": \"56598995\", \"edad\": 27, \"sexo\": \"F\", \"correo\": \"asdasd\", \"idioma\": \"asdasdasdasd\", \"celular\": \"985965956\", \"nombres\": \"Mari\", \"operador\": \"Pomodoro ASD\", \"religion\": \"asdasdasd\", \"apellidos\": \"Canchanya Chambergo\", \"fechaPaciente\": \"2026-11-08T15:49\", \"centroEstudios\": \"asdasdasdasd\", \"apellidoMaterno\": \"Chambergo\", \"apellidoPaterno\": \"Canchanya\", \"fechaNacimiento\": \"1998-12-04\", \"modalidadAsistencia\": \"acompanado\"}}', '2026-11-08 15:50:48'),
(68, 'historia_seccion_estado', '9', 'REABRIR_SECCION', 'ALUMNO', 2, 'pomodoro@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"datos-paciente\": \"review\"}', '{\"datos-paciente\": \"in-progress\"}', '2026-11-08 15:50:48'),
(69, 'historia_clinica', '9', 'EDITAR', 'ALUMNO', 2, 'pomodoro@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}, \"datos-paciente\": {\"dni\": \"56598995\", \"edad\": 27, \"sexo\": \"F\", \"correo\": \"asdasd\", \"idioma\": \"asdasdasdasd\", \"celular\": \"985965956\", \"nombres\": \"Mari\", \"operador\": \"Pomodoro ASD\", \"religion\": \"asdasdasd\", \"apellidos\": \"Canchanya Chambergo\", \"fechaPaciente\": \"2026-11-08T15:49\", \"centroEstudios\": \"asdasdasdasd\", \"apellidoMaterno\": \"Chambergo\", \"apellidoPaterno\": \"Canchanya\", \"fechaNacimiento\": \"1998-12-04\", \"modalidadAsistencia\": \"acompanado\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}, \"datos-paciente\": {\"dni\": \"56598995\", \"edad\": 27, \"sexo\": \"F\", \"correo\": \"asdasd\", \"idioma\": \"asdasdasdasd\", \"celular\": \"985965956\", \"nombres\": \"Mari\", \"operador\": \"Pomodoro ASD\", \"religion\": \"asdasdasd\", \"apellidos\": \"Canchanya Chambergo\", \"lugarTrabajo\": \"asdasdasd\", \"fechaPaciente\": \"2026-11-08T15:49\", \"centroEstudios\": \"asdasdasdasd\", \"apellidoMaterno\": \"Chambergo\", \"apellidoPaterno\": \"Canchanya\", \"fechaNacimiento\": \"1998-12-04\", \"modalidadAsistencia\": \"acompanado\"}}', '2026-11-08 15:50:51'),
(70, 'historia_seccion_estado', '9', 'REVISAR_SECCION', 'ALUMNO', 2, 'pomodoro@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"datos-paciente\": \"in-progress\"}', '{\"datos-paciente\": \"review\"}', '2026-11-08 15:50:51'),
(71, 'historia_clinica', '9', 'EDITAR', 'ALUMNO', 2, 'pomodoro@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}, \"datos-paciente\": {\"dni\": \"56598995\", \"edad\": 27, \"sexo\": \"F\", \"correo\": \"asdasd\", \"idioma\": \"asdasdasdasd\", \"celular\": \"985965956\", \"nombres\": \"Mari\", \"operador\": \"Pomodoro ASD\", \"religion\": \"asdasdasd\", \"apellidos\": \"Canchanya Chambergo\", \"lugarTrabajo\": \"asdasdasd\", \"fechaPaciente\": \"2026-11-08T15:49\", \"centroEstudios\": \"asdasdasdasd\", \"apellidoMaterno\": \"Chambergo\", \"apellidoPaterno\": \"Canchanya\", \"fechaNacimiento\": \"1998-12-04\", \"modalidadAsistencia\": \"acompanado\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}, \"datos-paciente\": {\"dni\": \"56598995\", \"edad\": 27, \"sexo\": \"F\", \"correo\": \"asdasd\", \"idioma\": \"asdasdasdasd\", \"celular\": \"985965956\", \"nombres\": \"Mari\", \"operador\": \"Pomodoro ASD\", \"religion\": \"asdasdasd\", \"apellidos\": \"Canchanya Chambergo\", \"lugarTrabajo\": \"asdasdasd\", \"fechaPaciente\": \"2026-11-08T15:49\", \"centroEstudios\": \"asdasdasdasd\", \"apellidoMaterno\": \"Chambergo\", \"apellidoPaterno\": \"Canchanya\", \"fechaNacimiento\": \"1998-12-04\", \"modalidadAsistencia\": \"acompanado\"}}', '2026-11-08 15:50:51'),
(72, 'historia_clinica', '9', 'EDITAR', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 15:51:11'),
(73, 'historia_seccion_estado', '9', 'REVISAR_SECCION', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"datos-paciente\": \"review\"}', '{\"datos-paciente\": \"approved\"}', '2026-11-08 15:51:11'),
(74, 'historia_clinica', '9', 'EDITAR', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 15:51:24'),
(75, 'historia_seccion_estado', '9', 'REABRIR_SECCION', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"datos-paciente\": \"approved\"}', '{\"datos-paciente\": \"in-progress\"}', '2026-11-08 15:51:24'),
(76, 'historia_clinica', '9', 'EDITAR', 'ALUMNO', 2, 'pomodoro@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 15:51:31'),
(77, 'historia_seccion_estado', '9', 'REVISAR_SECCION', 'ALUMNO', 2, 'pomodoro@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"datos-paciente\": \"in-progress\"}', '{\"datos-paciente\": \"review\"}', '2026-11-08 15:51:31'),
(78, 'historia_clinica', '9', 'EDITAR', 'ALUMNO', 2, 'pomodoro@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 15:51:31'),
(79, 'historia_clinica', '9', 'EDITAR', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 15:51:43'),
(80, 'historia_seccion_estado', '9', 'REVISAR_SECCION', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"datos-paciente\": \"review\"}', '{\"datos-paciente\": \"approved\"}', '2026-11-08 15:51:43'),
(81, 'historia_clinica', '9', 'EDITAR', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 15:51:45'),
(82, 'historia_seccion_estado', '9', 'REABRIR_SECCION', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"datos-paciente\": \"approved\"}', '{\"datos-paciente\": \"in-progress\"}', '2026-11-08 15:51:45'),
(83, 'historia_clinica', '9', 'EDITAR', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 15:51:47'),
(84, 'historia_seccion_estado', '9', 'REVISAR_SECCION', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"datos-paciente\": \"in-progress\"}', '{\"datos-paciente\": \"approved\"}', '2026-11-08 15:51:47'),
(85, 'historia_clinica', '9', 'EDITAR', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 15:51:50'),
(86, 'historia_seccion_estado', '9', 'REABRIR_SECCION', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"datos-paciente\": \"approved\"}', '{\"datos-paciente\": \"in-progress\"}', '2026-11-08 15:51:50'),
(87, 'historia_clinica', '10', 'CREAR', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', NULL, '{\"codigo\": \"HC-2026-010\"}', '2026-11-08 15:52:24'),
(88, 'historia_clinica', '10', 'ASIGNAR_PERSONAL', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"asistente_responsable\": \"Sin asignar\"}', '{\"asistente_responsable\": \"Pomodoro ASD\"}', '2026-11-08 15:53:00'),
(89, 'historia_clinica', '10', 'EDITAR', 'ALUMNO', 2, 'pomodoro@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"consentimiento\": [], \"datos-paciente\": {\"dni\": \"56598995\", \"edad\": 27, \"sexo\": \"F\", \"correo\": \"asdasd\", \"idioma\": \"asdasdasdasd\", \"celular\": \"985965956\", \"nombres\": \"Mari\", \"operador\": \"Pomodoro ASD\", \"religion\": \"asdasdasd\", \"apellidos\": \"Canchanya Chambergo\", \"lugarTrabajo\": \"asdasdasd\", \"fechaPaciente\": \"2026-11-08T15:52\", \"centroEstudios\": \"asdasdasdasd\", \"apellidoMaterno\": \"Chambergo\", \"apellidoPaterno\": \"Canchanya\", \"fechaNacimiento\": \"1998-12-04\", \"modalidadAsistencia\": \"acompanado\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}, \"datos-paciente\": {\"dni\": \"56598995\", \"edad\": 27, \"sexo\": \"F\", \"correo\": \"asdasd\", \"idioma\": \"asdasdasdasd\", \"celular\": \"985965956\", \"nombres\": \"Mari\", \"operador\": \"Pomodoro ASD\", \"religion\": \"asdasdasd\", \"apellidos\": \"Canchanya Chambergo\", \"ocupacion\": \"asdasdasdasdasd\", \"lugarTrabajo\": \"asdasdasd\", \"fechaPaciente\": \"2026-11-08T15:52\", \"centroEstudios\": \"asdasdasdasd\", \"apellidoMaterno\": \"Chambergo\", \"apellidoPaterno\": \"Canchanya\", \"fechaNacimiento\": \"1998-12-04\", \"modalidadAsistencia\": \"acompanado\"}}', '2026-11-08 15:53:23'),
(90, 'historia_clinica', '10', 'EDITAR', 'ALUMNO', 2, 'pomodoro@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}, \"datos-paciente\": {\"dni\": \"56598995\", \"edad\": 27, \"sexo\": \"F\", \"correo\": \"asdasd\", \"idioma\": \"asdasdasdasd\", \"celular\": \"985965956\", \"nombres\": \"Mari\", \"operador\": \"Pomodoro ASD\", \"religion\": \"asdasdasd\", \"apellidos\": \"Canchanya Chambergo\", \"ocupacion\": \"asdasdasdasdasd\", \"lugarTrabajo\": \"asdasdasd\", \"fechaPaciente\": \"2026-11-08T15:52\", \"centroEstudios\": \"asdasdasdasd\", \"apellidoMaterno\": \"Chambergo\", \"apellidoPaterno\": \"Canchanya\", \"fechaNacimiento\": \"1998-12-04\", \"modalidadAsistencia\": \"acompanado\"}, \"reporte-operatorio\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}, \"datos-paciente\": {\"dni\": \"56598995\", \"edad\": 27, \"sexo\": \"F\", \"correo\": \"asdasd\", \"idioma\": \"asdasdasdasd\", \"celular\": \"985965956\", \"nombres\": \"Mari\", \"operador\": \"Pomodoro ASD\", \"religion\": \"asdasdasd\", \"apellidos\": \"Canchanya Chambergo\", \"ocupacion\": \"asdasdasdasdasd\", \"lugarTrabajo\": \"asdasdasd\", \"fechaPaciente\": \"2026-11-08T15:52\", \"centroEstudios\": \"asdasdasdasd\", \"apellidoMaterno\": \"Chambergo\", \"apellidoPaterno\": \"Canchanya\", \"fechaNacimiento\": \"1998-12-04\", \"telefonoRegistro2\": \"asdasdasdasd\", \"domicilioRegistro2\": \"asdasdasd\", \"modalidadAsistencia\": \"acompanado\"}, \"reporte-operatorio\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 15:53:26'),
(91, 'historia_clinica', '10', 'EDITAR', 'ALUMNO', 2, 'pomodoro@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}, \"datos-paciente\": {\"dni\": \"56598995\", \"edad\": 27, \"sexo\": \"F\", \"correo\": \"asdasd\", \"idioma\": \"asdasdasdasd\", \"celular\": \"985965956\", \"nombres\": \"Mari\", \"operador\": \"Pomodoro ASD\", \"religion\": \"asdasdasd\", \"apellidos\": \"Canchanya Chambergo\", \"ocupacion\": \"asdasdasdasdasd\", \"lugarTrabajo\": \"asdasdasd\", \"fechaPaciente\": \"2026-11-08T15:52\", \"centroEstudios\": \"asdasdasdasd\", \"apellidoMaterno\": \"Chambergo\", \"apellidoPaterno\": \"Canchanya\", \"fechaNacimiento\": \"1998-12-04\", \"telefonoRegistro2\": \"asdasdasdasd\", \"domicilioRegistro2\": \"asdasdasd\", \"modalidadAsistencia\": \"acompanado\"}, \"reporte-operatorio\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}, \"datos-paciente\": {\"dni\": \"56598995\", \"edad\": 27, \"sexo\": \"F\", \"idioma\": \"asdasdasdasd\", \"celular\": \"985965956\", \"nombres\": \"Mari\", \"operador\": \"Pomodoro ASD\", \"religion\": \"asdasdasd\", \"apellidos\": \"Canchanya Chambergo\", \"ocupacion\": \"asdasdasdasdasd\", \"lugarTrabajo\": \"asdasdasd\", \"fechaPaciente\": \"2026-11-08T15:52\", \"centroEstudios\": \"asdasdasdasd\", \"apellidoMaterno\": \"Chambergo\", \"apellidoPaterno\": \"Canchanya\", \"fechaNacimiento\": \"1998-12-04\", \"telefonoRegistro2\": \"asdasdasdasd\", \"domicilioRegistro2\": \"asdasdasd\", \"modalidadAsistencia\": \"acompanado\"}, \"reporte-operatorio\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 15:53:33'),
(92, 'historia_clinica', '10', 'EDITAR', 'ALUMNO', 2, 'pomodoro@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}, \"datos-paciente\": {\"dni\": \"56598995\", \"edad\": 27, \"sexo\": \"F\", \"idioma\": \"asdasdasdasd\", \"celular\": \"985965956\", \"nombres\": \"Mari\", \"operador\": \"Pomodoro ASD\", \"religion\": \"asdasdasd\", \"apellidos\": \"Canchanya Chambergo\", \"ocupacion\": \"asdasdasdasdasd\", \"lugarTrabajo\": \"asdasdasd\", \"fechaPaciente\": \"2026-11-08T15:52\", \"centroEstudios\": \"asdasdasdasd\", \"apellidoMaterno\": \"Chambergo\", \"apellidoPaterno\": \"Canchanya\", \"fechaNacimiento\": \"1998-12-04\", \"telefonoRegistro2\": \"asdasdasdasd\", \"domicilioRegistro2\": \"asdasdasd\", \"modalidadAsistencia\": \"acompanado\"}, \"reporte-operatorio\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}, \"datos-paciente\": {\"dni\": \"56598995\", \"edad\": 27, \"sexo\": \"F\", \"idioma\": \"asdasdasdasd\", \"celular\": \"985965956\", \"nombres\": \"Mari\", \"operador\": \"Pomodoro ASD\", \"religion\": \"asdasdasd\", \"apellidos\": \"Canchanya Chambergo\", \"ocupacion\": \"asdasdasdasdasd\", \"lugarTrabajo\": \"asdasdasd\", \"fechaPaciente\": \"2026-11-08T15:52\", \"centroEstudios\": \"asdasdasdasd\", \"apellidoMaterno\": \"Chambergo\", \"apellidoPaterno\": \"Canchanya\", \"fechaNacimiento\": \"1998-12-04\", \"telefonoRegistro2\": \"asdasdasdasd\", \"domicilioRegistro2\": \"asdasdasd\", \"modalidadAsistencia\": \"acompanado\"}, \"reporte-operatorio\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 15:53:35'),
(93, 'historia_seccion_estado', '10', 'REVISAR_SECCION', 'ALUMNO', 2, 'pomodoro@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"datos-paciente\": \"in-progress\"}', '{\"datos-paciente\": \"review\"}', '2026-11-08 15:53:36'),
(94, 'historia_clinica', '10', 'EDITAR', 'ALUMNO', 2, 'pomodoro@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}, \"datos-paciente\": {\"dni\": \"56598995\", \"edad\": 27, \"sexo\": \"F\", \"idioma\": \"asdasdasdasd\", \"celular\": \"985965956\", \"nombres\": \"Mari\", \"operador\": \"Pomodoro ASD\", \"religion\": \"asdasdasd\", \"apellidos\": \"Canchanya Chambergo\", \"ocupacion\": \"asdasdasdasdasd\", \"lugarTrabajo\": \"asdasdasd\", \"fechaPaciente\": \"2026-11-08T15:52\", \"centroEstudios\": \"asdasdasdasd\", \"apellidoMaterno\": \"Chambergo\", \"apellidoPaterno\": \"Canchanya\", \"fechaNacimiento\": \"1998-12-04\", \"telefonoRegistro2\": \"asdasdasdasd\", \"domicilioRegistro2\": \"asdasdasd\", \"modalidadAsistencia\": \"acompanado\"}, \"reporte-operatorio\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}, \"datos-paciente\": {\"dni\": \"56598995\", \"edad\": 27, \"sexo\": \"F\", \"idioma\": \"asdasdasdasd\", \"celular\": \"985965956\", \"nombres\": \"Mari\", \"operador\": \"Pomodoro ASD\", \"religion\": \"asdasdasd\", \"apellidos\": \"Canchanya Chambergo\", \"ocupacion\": \"asdasdasdasdasd\", \"lugarTrabajo\": \"asdasdasd\", \"fechaPaciente\": \"2026-11-08T15:52\", \"centroEstudios\": \"asdasdasdasd\", \"apellidoMaterno\": \"Chambergo\", \"apellidoPaterno\": \"Canchanya\", \"fechaNacimiento\": \"1998-12-04\", \"telefonoRegistro2\": \"asdasdasdasd\", \"domicilioRegistro2\": \"asdasdasd\", \"modalidadAsistencia\": \"acompanado\"}, \"reporte-operatorio\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 15:53:36');
INSERT INTO `auditoria` (`id_auditoria`, `tabla_afectada`, `id_registro`, `accion`, `tipo_usuario`, `id_usuario`, `nombre_usuario`, `direccion_ip`, `agente_usuario`, `valores_anteriores`, `valores_nuevos`, `creado_en`) VALUES
(95, 'historia_clinica', '10', 'EDITAR', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 15:53:59'),
(96, 'historia_seccion_estado', '10', 'REVISAR_SECCION', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"datos-paciente\": \"review\"}', '{\"datos-paciente\": \"approved\"}', '2026-11-08 15:53:59'),
(97, 'historia_clinica', '10', 'EDITAR', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 15:54:20'),
(98, 'historia_seccion_estado', '10', 'REABRIR_SECCION', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"datos-paciente\": \"approved\"}', '{\"datos-paciente\": \"in-progress\"}', '2026-11-08 15:54:20'),
(99, 'historia_clinica', '10', 'EDITAR', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 15:54:26'),
(100, 'historia_seccion_estado', '10', 'REVISAR_SECCION', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"datos-paciente\": \"in-progress\"}', '{\"datos-paciente\": \"approved\"}', '2026-11-08 15:54:26'),
(101, 'historia_clinica', '10', 'EDITAR', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 15:54:29'),
(102, 'historia_seccion_estado', '10', 'REABRIR_SECCION', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"datos-paciente\": \"approved\"}', '{\"datos-paciente\": \"in-progress\"}', '2026-11-08 15:54:29'),
(103, 'historia_clinica', '10', 'EDITAR', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 15:54:30'),
(104, 'historia_seccion_estado', '10', 'MARCAR_COMPLETADO', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"datos-paciente\": \"in-progress\"}', '{\"datos-paciente\": \"complete\"}', '2026-11-08 15:54:30'),
(105, 'historia_clinica', '10', 'EDITAR', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 15:54:34'),
(106, 'historia_seccion_estado', '10', 'MARCAR_COMPLETADO', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '[]', '{\"examen-clinico\": \"complete\"}', '2026-11-08 15:54:34'),
(107, 'historia_clinica', '10', 'EDITAR', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 15:54:38'),
(108, 'historia_seccion_estado', '10', 'MARCAR_COMPLETADO', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '[]', '{\"examen-extraoral\": \"complete\"}', '2026-11-08 15:54:38'),
(109, 'historia_clinica', '10', 'EDITAR', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 15:54:43'),
(110, 'historia_seccion_estado', '10', 'MARCAR_COMPLETADO', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '[]', '{\"examen-intraoral\": \"complete\"}', '2026-11-08 15:54:43'),
(111, 'historia_clinica', '10', 'EDITAR', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 15:54:48'),
(112, 'historia_clinica', '10', 'EDITAR', 'ALUMNO', 2, 'pomodoro@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}, \"datos-paciente\": {\"dni\": \"56598995\", \"edad\": 27, \"sexo\": \"F\", \"idioma\": \"asdasdasdasd\", \"celular\": \"985965956\", \"nombres\": \"Mari\", \"operador\": \"Pomodoro ASD\", \"religion\": \"asdasdasd\", \"apellidos\": \"Canchanya Chambergo\", \"ocupacion\": \"asdasdasdasdasd\", \"lugarTrabajo\": \"asdasdasd\", \"fechaPaciente\": \"2026-11-08T15:52\", \"centroEstudios\": \"asdasdasdasd\", \"apellidoMaterno\": \"Chambergo\", \"apellidoPaterno\": \"Canchanya\", \"fechaNacimiento\": \"1998-12-04\", \"telefonoRegistro2\": \"asdasdasdasd\", \"domicilioRegistro2\": \"asdasdasd\", \"modalidadAsistencia\": \"acompanado\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}, \"datos-paciente\": {\"dni\": \"56598995\", \"edad\": 27, \"sexo\": \"F\", \"idioma\": \"asdasdasdasd\", \"celular\": \"985965956\", \"nombres\": \"Mari\", \"operador\": \"Pomodoro ASD\", \"religion\": \"asdasdasd\", \"apellidos\": \"Canchanya Chambergoas\", \"ocupacion\": \"asdasdasdasdasd\", \"lugarTrabajo\": \"asdasdasd\", \"fechaPaciente\": \"2026-11-08T15:52\", \"centroEstudios\": \"asdasdasdasd\", \"apellidoMaterno\": \"Chambergoas\", \"apellidoPaterno\": \"Canchanya\", \"fechaNacimiento\": \"1998-12-04\", \"telefonoRegistro2\": \"asdasdasdasd\", \"domicilioRegistro2\": \"asdasdasd\", \"modalidadAsistencia\": \"acompanado\"}}', '2026-11-08 15:54:55'),
(113, 'historia_seccion_estado', '10', 'REABRIR_SECCION', 'ALUMNO', 2, 'pomodoro@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"datos-paciente\": \"complete\"}', '{\"datos-paciente\": \"in-progress\"}', '2026-11-08 15:54:55'),
(114, 'historia_clinica', '10', 'EDITAR', 'ALUMNO', 2, 'pomodoro@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}, \"datos-paciente\": {\"dni\": \"56598995\", \"edad\": 27, \"sexo\": \"F\", \"idioma\": \"asdasdasdasd\", \"celular\": \"985965956\", \"nombres\": \"Mari\", \"operador\": \"Pomodoro ASD\", \"religion\": \"asdasdasd\", \"apellidos\": \"Canchanya Chambergoas\", \"ocupacion\": \"asdasdasdasdasd\", \"lugarTrabajo\": \"asdasdasd\", \"fechaPaciente\": \"2026-11-08T15:52\", \"centroEstudios\": \"asdasdasdasd\", \"apellidoMaterno\": \"Chambergoas\", \"apellidoPaterno\": \"Canchanya\", \"fechaNacimiento\": \"1998-12-04\", \"telefonoRegistro2\": \"asdasdasdasd\", \"domicilioRegistro2\": \"asdasdasd\", \"modalidadAsistencia\": \"acompanado\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}, \"datos-paciente\": {\"dni\": \"56598995\", \"edad\": 27, \"sexo\": \"F\", \"idioma\": \"asdasdasdasd\", \"celular\": \"985965956\", \"nombres\": \"Mari\", \"operador\": \"Pomodoro ASD\", \"religion\": \"asdasdasd\", \"apellidos\": \"Canchanya Chambergo\", \"ocupacion\": \"asdasdasdasdasd\", \"lugarTrabajo\": \"asdasdasd\", \"fechaPaciente\": \"2026-11-08T15:52\", \"centroEstudios\": \"asdasdasdasd\", \"apellidoMaterno\": \"Chambergo\", \"apellidoPaterno\": \"Canchanya\", \"fechaNacimiento\": \"1998-12-04\", \"telefonoRegistro2\": \"asdasdasdasd\", \"domicilioRegistro2\": \"asdasdasd\", \"modalidadAsistencia\": \"acompanado\"}}', '2026-11-08 15:54:56'),
(115, 'historia_clinica', '10', 'EDITAR', 'ALUMNO', 2, 'pomodoro@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 15:55:04'),
(116, 'historia_seccion_estado', '10', 'MARCAR_COMPLETADO', 'ALUMNO', 2, 'pomodoro@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"datos-paciente\": \"in-progress\"}', '{\"datos-paciente\": \"complete\"}', '2026-11-08 15:55:04'),
(117, 'historia_clinica', '10', 'EDITAR', 'ALUMNO', 2, 'pomodoro@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 15:55:05'),
(118, 'historia_seccion_estado', '10', 'REVISAR_SECCION', 'ALUMNO', 2, 'pomodoro@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"datos-paciente\": \"complete\"}', '{\"datos-paciente\": \"review\"}', '2026-11-08 15:55:05'),
(119, 'historia_clinica', '10', 'EDITAR', 'ALUMNO', 2, 'pomodoro@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 15:55:05'),
(120, 'historia_clinica', '9', 'CAMBIAR_ESTADO', 'DOCENTE', 1, 'SUPER-@dmin', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '{\"estado\": \"EN_PROCESO\"}', '{\"estado\": \"PENDIENTE_REVISION\", \"observacion\": null}', '2026-11-08 15:55:22'),
(121, 'historia_clinica', '9', 'EDITAR', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 15:55:56'),
(122, 'historia_seccion_estado', '9', 'REVISAR_SECCION', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"datos-paciente\": \"in-progress\"}', '{\"datos-paciente\": \"approved\"}', '2026-11-08 15:55:56'),
(123, 'historia_clinica', '9', 'EDITAR', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 15:56:03'),
(124, 'historia_seccion_estado', '9', 'REVISAR_SECCION', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '[]', '{\"examen-clinico\": \"approved\"}', '2026-11-08 15:56:03'),
(125, 'historia_clinica', '9', 'EDITAR', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 15:56:07'),
(126, 'historia_seccion_estado', '9', 'REVISAR_SECCION', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '[]', '{\"examen-extraoral\": \"approved\"}', '2026-11-08 15:56:07'),
(127, 'historia_clinica', '9', 'EDITAR', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 15:56:09'),
(128, 'historia_seccion_estado', '9', 'REVISAR_SECCION', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '[]', '{\"examen-intraoral\": \"approved\"}', '2026-11-08 15:56:09'),
(129, 'historia_clinica', '9', 'EDITAR', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 15:56:12'),
(130, 'historia_seccion_estado', '9', 'REVISAR_SECCION', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '[]', '{\"odontograma\": \"approved\"}', '2026-11-08 15:56:12'),
(131, 'historia_clinica', '9', 'EDITAR', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 15:56:14'),
(132, 'historia_seccion_estado', '9', 'REVISAR_SECCION', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '[]', '{\"oclusion\": \"approved\"}', '2026-11-08 15:56:14'),
(133, 'historia_clinica', '9', 'EDITAR', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 15:56:17'),
(134, 'historia_seccion_estado', '9', 'REVISAR_SECCION', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '[]', '{\"examenes-auxiliares\": \"approved\"}', '2026-11-08 15:56:17'),
(135, 'historia_clinica', '9', 'EDITAR', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 15:56:23'),
(136, 'historia_seccion_estado', '9', 'REVISAR_SECCION', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '[]', '{\"modelos\": \"approved\"}', '2026-11-08 15:56:23'),
(137, 'historia_clinica', '9', 'EDITAR', 'DOCENTE', 1, 'SUPER-@dmin', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 15:56:36'),
(138, 'historia_seccion_estado', '9', 'REABRIR_SECCION', 'DOCENTE', 1, 'SUPER-@dmin', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '{\"datos-paciente\": \"approved\"}', '{\"datos-paciente\": \"in-progress\"}', '2026-11-08 15:56:36'),
(139, 'historia_clinica', '10', 'EDITAR', 'ALUMNO', 2, 'pomodoro@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 15:58:46'),
(140, 'historia_seccion_estado', '10', 'REABRIR_SECCION', 'ALUMNO', 2, 'pomodoro@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"datos-paciente\": \"review\"}', '{\"datos-paciente\": \"in-progress\"}', '2026-11-08 15:58:46'),
(141, 'historia_clinica', '10', 'EDITAR', 'ALUMNO', 2, 'pomodoro@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}, \"datos-paciente\": {\"dni\": \"56598995\", \"edad\": 27, \"sexo\": \"F\", \"idioma\": \"asdasdasdasd\", \"celular\": \"985965956\", \"nombres\": \"Mari\", \"operador\": \"Pomodoro ASD\", \"religion\": \"asdasdasd\", \"apellidos\": \"Canchanya Chambergo\", \"ocupacion\": \"asdasdasdasdasd\", \"lugarTrabajo\": \"asdasdasd\", \"fechaPaciente\": \"2026-11-08T15:52\", \"centroEstudios\": \"asdasdasdasd\", \"apellidoMaterno\": \"Chambergo\", \"apellidoPaterno\": \"Canchanya\", \"fechaNacimiento\": \"1998-12-04\", \"telefonoRegistro2\": \"asdasdasdasd\", \"domicilioRegistro2\": \"asdasdasd\", \"modalidadAsistencia\": \"acompanado\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}, \"datos-paciente\": {\"dni\": \"56598995\", \"edad\": 27, \"sexo\": \"F\", \"idioma\": \"asdasdasdasd\", \"celular\": \"985965956\", \"nombres\": \"Mari\", \"operador\": \"Pomodoro ASD\", \"religion\": \"asdasdasdasdasd\", \"apellidos\": \"Canchanya Chambergo\", \"ocupacion\": \"asdasdasdasdasd\", \"lugarTrabajo\": \"asdasdasd\", \"fechaPaciente\": \"2026-11-08T15:52\", \"centroEstudios\": \"asdasdasdasd\", \"apellidoMaterno\": \"Chambergo\", \"apellidoPaterno\": \"Canchanya\", \"fechaNacimiento\": \"1998-12-04\", \"telefonoRegistro2\": \"asdasdasdasd\", \"domicilioRegistro2\": \"asdasdasd\", \"modalidadAsistencia\": \"acompanado\"}}', '2026-11-08 15:58:51'),
(142, 'historia_clinica', '10', 'EDITAR', 'ALUMNO', 2, 'pomodoro@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 15:58:51'),
(143, 'historia_seccion_estado', '10', 'REVISAR_SECCION', 'ALUMNO', 2, 'pomodoro@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"datos-paciente\": \"in-progress\"}', '{\"datos-paciente\": \"review\"}', '2026-11-08 15:58:51'),
(144, 'historia_clinica', '10', 'EDITAR', 'ALUMNO', 2, 'pomodoro@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 15:58:51'),
(145, 'historia_clinica', '10', 'EDITAR', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 15:59:08'),
(146, 'historia_seccion_estado', '10', 'REVISAR_SECCION', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"datos-paciente\": \"review\"}', '{\"datos-paciente\": \"approved\"}', '2026-11-08 15:59:08'),
(147, 'historia_clinica', '10', 'EDITAR', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 15:59:09'),
(148, 'historia_seccion_estado', '10', 'REABRIR_SECCION', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"datos-paciente\": \"approved\"}', '{\"datos-paciente\": \"in-progress\"}', '2026-11-08 15:59:09'),
(149, 'historia_clinica', '10', 'EDITAR', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 15:59:11'),
(150, 'historia_seccion_estado', '10', 'REVISAR_SECCION', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"datos-paciente\": \"in-progress\"}', '{\"datos-paciente\": \"approved\"}', '2026-11-08 15:59:11'),
(151, 'historia_clinica', '10', 'EDITAR', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 15:59:12'),
(152, 'historia_seccion_estado', '10', 'REABRIR_SECCION', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"datos-paciente\": \"approved\"}', '{\"datos-paciente\": \"in-progress\"}', '2026-11-08 15:59:12'),
(153, 'historia_clinica', '10', 'EDITAR', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 15:59:15'),
(154, 'historia_seccion_estado', '10', 'REVISAR_SECCION', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"datos-paciente\": \"in-progress\"}', '{\"datos-paciente\": \"approved\"}', '2026-11-08 15:59:15'),
(155, 'historia_clinica', '10', 'EDITAR', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 15:59:16'),
(156, 'historia_seccion_estado', '10', 'REABRIR_SECCION', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"datos-paciente\": \"approved\"}', '{\"datos-paciente\": \"in-progress\"}', '2026-11-08 15:59:16'),
(157, 'historia_clinica', '10', 'EDITAR', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 15:59:17'),
(158, 'historia_seccion_estado', '10', 'REVISAR_SECCION', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"datos-paciente\": \"in-progress\"}', '{\"datos-paciente\": \"approved\"}', '2026-11-08 15:59:17'),
(159, 'historia_clinica', '10', 'EDITAR', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 15:59:17'),
(160, 'historia_seccion_estado', '10', 'REABRIR_SECCION', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"datos-paciente\": \"approved\"}', '{\"datos-paciente\": \"in-progress\"}', '2026-11-08 15:59:17'),
(161, 'historia_clinica', '10', 'EDITAR', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 15:59:18'),
(162, 'historia_seccion_estado', '10', 'REVISAR_SECCION', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"datos-paciente\": \"in-progress\"}', '{\"datos-paciente\": \"approved\"}', '2026-11-08 15:59:18'),
(163, 'historia_clinica', '10', 'EDITAR', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 15:59:19'),
(164, 'historia_seccion_estado', '10', 'REABRIR_SECCION', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"datos-paciente\": \"approved\"}', '{\"datos-paciente\": \"in-progress\"}', '2026-11-08 15:59:19'),
(165, 'historia_clinica', '10', 'EDITAR', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 15:59:55'),
(166, 'historia_seccion_estado', '10', 'REVISAR_SECCION', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"datos-paciente\": \"in-progress\"}', '{\"datos-paciente\": \"approved\"}', '2026-11-08 15:59:55'),
(167, 'historia_clinica', '10', 'EDITAR', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 15:59:56'),
(168, 'historia_seccion_estado', '10', 'REABRIR_SECCION', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"datos-paciente\": \"approved\"}', '{\"datos-paciente\": \"in-progress\"}', '2026-11-08 15:59:56'),
(169, 'historia_clinica', '10', 'EDITAR', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 15:59:57'),
(170, 'historia_clinica', '9', 'EDITAR', 'DOCENTE', 1, 'SUPER-@dmin', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 16:01:12'),
(171, 'historia_seccion_estado', '9', 'REVISAR_SECCION', 'DOCENTE', 1, 'SUPER-@dmin', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '{\"datos-paciente\": \"in-progress\"}', '{\"datos-paciente\": \"approved\"}', '2026-11-08 16:01:12'),
(172, 'historia_clinica', '10', 'EDITAR', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 16:01:21'),
(173, 'historia_seccion_estado', '10', 'REVISAR_SECCION', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"datos-paciente\": \"in-progress\"}', '{\"datos-paciente\": \"approved\"}', '2026-11-08 16:01:22'),
(174, 'historia_clinica', '10', 'EDITAR', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 16:02:00'),
(175, 'historia_seccion_estado', '10', 'REABRIR_SECCION', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"datos-paciente\": \"approved\"}', '{\"datos-paciente\": \"in-progress\"}', '2026-11-08 16:02:00'),
(176, 'historia_clinica', '10', 'EDITAR', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 16:02:01'),
(177, 'historia_seccion_estado', '10', 'REVISAR_SECCION', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"datos-paciente\": \"in-progress\"}', '{\"datos-paciente\": \"approved\"}', '2026-11-08 16:02:01'),
(178, 'historia_clinica', '10', 'ASIGNAR_PERSONAL', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"asistente_responsable\": \"Pomodoro ASD\"}', '{\"asistente_responsable\": \"Lopez Curiñaupa\"}', '2026-11-08 16:02:15'),
(179, 'historia_clinica', '9', 'CAMBIAR_ESTADO', 'ALUMNO', 2, 'pomodoro@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"estado\": \"PENDIENTE_REVISION\"}', '{\"estado\": \"EN_PROCESO\", \"observacion\": null}', '2026-11-08 16:02:28'),
(180, 'historia_clinica', '9', 'CAMBIAR_ESTADO', 'ALUMNO', 2, 'pomodoro@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"estado\": \"EN_PROCESO\"}', '{\"estado\": \"PENDIENTE_REVISION\", \"observacion\": null}', '2026-11-08 16:02:31'),
(181, 'historia_clinica', '9', 'CAMBIAR_ESTADO', 'ALUMNO', 2, 'pomodoro@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"estado\": \"PENDIENTE_REVISION\"}', '{\"estado\": \"EN_PROCESO\", \"observacion\": null}', '2026-11-08 16:02:32'),
(182, 'historia_clinica', '9', 'CAMBIAR_ESTADO', 'ALUMNO', 2, 'pomodoro@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"estado\": \"EN_PROCESO\"}', '{\"estado\": \"PENDIENTE_REVISION\", \"observacion\": null}', '2026-11-08 16:02:33'),
(183, 'historia_clinica', '9', 'CAMBIAR_ESTADO', 'ALUMNO', 2, 'pomodoro@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"estado\": \"PENDIENTE_REVISION\"}', '{\"estado\": \"EN_PROCESO\", \"observacion\": null}', '2026-11-08 16:02:33'),
(184, 'historia_clinica', '9', 'CAMBIAR_ESTADO', 'ALUMNO', 2, 'pomodoro@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"estado\": \"EN_PROCESO\"}', '{\"estado\": \"PENDIENTE_REVISION\", \"observacion\": null}', '2026-11-08 16:02:34'),
(185, 'historia_clinica', '9', 'CAMBIAR_ESTADO', 'ALUMNO', 2, 'pomodoro@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"estado\": \"PENDIENTE_REVISION\"}', '{\"estado\": \"EN_PROCESO\", \"observacion\": null}', '2026-11-08 16:02:35'),
(186, 'historia_clinica', '9', 'CAMBIAR_ESTADO', 'ALUMNO', 2, 'pomodoro@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"estado\": \"EN_PROCESO\"}', '{\"estado\": \"PENDIENTE_REVISION\", \"observacion\": null}', '2026-11-08 16:02:36'),
(187, 'historia_clinica', '9', 'CAMBIAR_ESTADO', 'ALUMNO', 2, 'pomodoro@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"estado\": \"PENDIENTE_REVISION\"}', '{\"estado\": \"EN_PROCESO\", \"observacion\": null}', '2026-11-08 16:02:37'),
(188, 'historia_clinica', '9', 'CAMBIAR_ESTADO', 'ALUMNO', 2, 'pomodoro@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"estado\": \"EN_PROCESO\"}', '{\"estado\": \"PENDIENTE_REVISION\", \"observacion\": null}', '2026-11-08 16:02:48'),
(189, 'historia_clinica', '9', 'CAMBIAR_ESTADO', 'ALUMNO', 2, 'pomodoro@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"estado\": \"PENDIENTE_REVISION\"}', '{\"estado\": \"EN_PROCESO\", \"observacion\": null}', '2026-11-08 16:02:51'),
(190, 'historia_clinica', '9', 'CAMBIAR_ESTADO', 'ALUMNO', 2, 'pomodoro@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"estado\": \"EN_PROCESO\"}', '{\"estado\": \"PENDIENTE_REVISION\", \"observacion\": null}', '2026-11-08 16:02:54'),
(191, 'historia_clinica', '9', 'CAMBIAR_ESTADO', 'ALUMNO', 2, 'pomodoro@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"estado\": \"PENDIENTE_REVISION\"}', '{\"estado\": \"EN_PROCESO\", \"observacion\": null}', '2026-11-08 16:02:56'),
(192, 'historia_clinica', '10', 'ASIGNAR_PERSONAL', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"asistente_responsable\": \"Lopez Curiñaupa\"}', '{\"asistente_responsable\": \"Pomodoro ASD\"}', '2026-11-08 16:06:32'),
(193, 'historia_clinica', '10', 'EDITAR', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 16:07:06'),
(194, 'historia_seccion_estado', '10', 'REABRIR_SECCION', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"datos-paciente\": \"approved\"}', '{\"datos-paciente\": \"in-progress\"}', '2026-11-08 16:07:06'),
(195, 'historia_clinica', '10', 'EDITAR', 'ALUMNO', 2, 'pomodoro@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}, \"datos-paciente\": {\"dni\": \"56598995\", \"edad\": 27, \"sexo\": \"F\", \"idioma\": \"asdasdasdasd\", \"celular\": \"985965956\", \"nombres\": \"Mari\", \"operador\": \"Pomodoro ASD\", \"religion\": \"asdasdasdasdasd\", \"apellidos\": \"Canchanya Chambergo\", \"ocupacion\": \"asdasdasdasdasd\", \"lugarTrabajo\": \"asdasdasd\", \"fechaPaciente\": \"2026-11-08T15:52\", \"centroEstudios\": \"asdasdasdasd\", \"apellidoMaterno\": \"Chambergo\", \"apellidoPaterno\": \"Canchanya\", \"fechaNacimiento\": \"1998-12-04\", \"telefonoRegistro2\": \"asdasdasdasd\", \"domicilioRegistro2\": \"asdasdasd\", \"modalidadAsistencia\": \"acompanado\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}, \"datos-paciente\": {\"dni\": \"56598995\", \"edad\": 27, \"sexo\": \"F\", \"idioma\": \"asdasdasdasd\", \"celular\": \"985965956\", \"nombres\": \"Mari\", \"operador\": \"Pomodoro ASD\", \"religion\": \"asdasdasdasdasd\", \"apellidos\": \"Canchanya Chambergo\", \"ocupacion\": \"asdasdasdasdasd\", \"lugarTrabajo\": \"asdasdasdasdasdasdasdasd\", \"fechaPaciente\": \"2026-11-08T15:52\", \"centroEstudios\": \"asdasdasdasd\", \"apellidoMaterno\": \"Chambergo\", \"apellidoPaterno\": \"Canchanya\", \"fechaNacimiento\": \"1998-12-04\", \"telefonoRegistro2\": \"asdasdasdasd\", \"domicilioRegistro2\": \"asdasdasd\", \"modalidadAsistencia\": \"acompanado\"}}', '2026-11-08 16:07:19'),
(196, 'historia_clinica', '10', 'EDITAR', 'ALUMNO', 2, 'pomodoro@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 16:07:20'),
(197, 'historia_seccion_estado', '10', 'REVISAR_SECCION', 'ALUMNO', 2, 'pomodoro@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"datos-paciente\": \"in-progress\"}', '{\"datos-paciente\": \"review\"}', '2026-11-08 16:07:20'),
(198, 'historia_clinica', '10', 'EDITAR', 'ALUMNO', 2, 'pomodoro@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 16:07:20'),
(199, 'historia_clinica', '9', 'CAMBIAR_ESTADO', 'DOCENTE', 1, 'SUPER-@dmin', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '{\"estado\": \"EN_PROCESO\"}', '{\"estado\": \"PENDIENTE_REVISION\", \"observacion\": null}', '2026-11-08 16:08:33'),
(200, 'historia_clinica', '9', 'CAMBIAR_ESTADO', 'DOCENTE', 1, 'SUPER-@dmin', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '{\"estado\": \"PENDIENTE_REVISION\"}', '{\"estado\": \"OBSERVADA\", \"observacion\": \"asdfasdasd\"}', '2026-11-08 16:08:56'),
(201, 'historia_clinica', '9', 'EDITAR', 'DOCENTE', 1, 'SUPER-@dmin', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 16:10:17'),
(202, 'historia_seccion_estado', '9', 'REABRIR_SECCION', 'DOCENTE', 1, 'SUPER-@dmin', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '{\"datos-paciente\": \"approved\"}', '{\"datos-paciente\": \"in-progress\"}', '2026-11-08 16:10:17'),
(203, 'historia_clinica', '9', 'EDITAR', 'DOCENTE', 1, 'SUPER-@dmin', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 16:11:18'),
(204, 'historia_clinica', '9', 'EDITAR', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 16:11:19'),
(205, 'historia_clinica', '10', 'EDITAR', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 21:26:00'),
(206, 'historia_seccion_estado', '10', 'REVISAR_SECCION', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"datos-paciente\": \"review\"}', '{\"datos-paciente\": \"approved\"}', '2026-11-08 21:26:00'),
(207, 'historia_clinica', '10', 'EDITAR', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 21:28:34'),
(208, 'historia_seccion_estado', '10', 'REABRIR_SECCION', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"datos-paciente\": \"approved\"}', '{\"datos-paciente\": \"in-progress\"}', '2026-11-08 21:28:34'),
(209, 'historia_clinica', '10', 'EDITAR', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '{\"consentimiento\": {\"fecha\": \"2026-11-08\"}}', '2026-11-08 21:28:36'),
(210, 'historia_seccion_estado', '10', 'REVISAR_SECCION', 'DOCENTE', 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', '{\"datos-paciente\": \"in-progress\"}', '{\"datos-paciente\": \"approved\"}', '2026-11-08 21:28:36'),
(211, 'historia_clinica', '11', 'CREAR', 'DOCENTE', 1, 'SUPER-@dmin', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', NULL, '{\"codigo\": \"HC-2026-011\"}', '2026-11-08 21:33:16'),
(212, 'historia_clinica', '12', 'CREAR', 'DOCENTE', 1, 'SUPER-@dmin', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', NULL, '{\"codigo\": \"HC-2026-012\"}', '2026-11-08 21:36:27'),
(213, 'historia_clinica', '13', 'CREAR', 'DOCENTE', 1, 'SUPER-@dmin', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', NULL, '{\"codigo\": \"HC-2026-013\"}', '2026-11-08 23:14:15');

-- --------------------------------------------------------

--
-- Table structure for table `catalogo_hallazgo_dental`
--

CREATE TABLE `catalogo_hallazgo_dental` (
  `id_hallazgo_dental` bigint UNSIGNED NOT NULL,
  `codigo` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(180) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `categoria` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `alcance` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PIEZA',
  `permite_superficie` tinyint(1) NOT NULL DEFAULT '0',
  `requiere_condicion` tinyint(1) NOT NULL DEFAULT '0',
  `simbolo` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descripcion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `catalogo_hallazgo_dental`
--

INSERT INTO `catalogo_hallazgo_dental` (`id_hallazgo_dental`, `codigo`, `nombre`, `categoria`, `alcance`, `permite_superficie`, `requiere_condicion`, `simbolo`, `descripcion`, `estado`) VALUES
(1, 'ORTODONCIA_FIJA', 'Aparato ortodóntico fijo', 'ORTODONCIA', 'RANGO', 0, 1, '⊞—⊞', NULL, 1),
(2, 'ORTODONCIA_REMOVIBLE', 'Aparato ortodóntico removible', 'ORTODONCIA', 'RANGO', 0, 1, '⌁', NULL, 1),
(3, 'CORONA', 'Corona', 'TRATAMIENTO_EXISTENTE', 'PIEZA', 0, 1, 'CM', NULL, 1),
(4, 'CORONA_TEMPORAL', 'Corona temporal', 'TRATAMIENTO_EXISTENTE', 'PIEZA', 0, 0, 'CT', NULL, 1),
(5, 'DEFECTO_ESMALTE', 'Defectos de desarrollo del esmalte', 'PATOLOGIA', 'SUPERFICIE', 1, 0, 'O', NULL, 1),
(6, 'DIASTEMA', 'Diastema', 'ESTADO', 'PAR', 0, 0, ')(', NULL, 1),
(7, 'EDENTULO', 'Edéntulo total', 'ESTADO', 'ARCADA', 0, 0, '—', NULL, 1),
(8, 'ESPIGO', 'Espigo – muñón', 'TRATAMIENTO_EXISTENTE', 'PIEZA', 0, 1, '▣', NULL, 1),
(9, 'FOSAS', 'Fosas y fisuras profundas', 'PATOLOGIA', 'PIEZA', 0, 0, 'FFP', NULL, 1),
(10, 'FRACTURA', 'Fractura dental', 'PATOLOGIA', 'PIEZA', 0, 0, '╱', NULL, 1),
(11, 'FUSION', 'Fusión', 'ANOMALIA', 'PAR', 0, 0, '◯◯', NULL, 1),
(12, 'GEMINACION', 'Geminación', 'ANOMALIA', 'PIEZA', 0, 0, '◯', NULL, 1),
(13, 'GIROVERSION', 'Giroversión', 'POSICION', 'PIEZA', 0, 0, '↷', NULL, 1),
(14, 'IMPACTACION', 'Impactación', 'POSICION', 'PIEZA', 0, 0, 'I', NULL, 1),
(15, 'IMPLANTE', 'Implante dental', 'REHABILITACION', 'PIEZA', 0, 1, 'IMP', NULL, 1),
(16, 'CARIES', 'Lesión de caries dental', 'PATOLOGIA', 'SUPERFICIE', 1, 0, 'CE', NULL, 1),
(17, 'MACRODONCIA', 'Macrodoncia', 'ANOMALIA', 'PIEZA', 0, 0, 'MAC', NULL, 1),
(18, 'MICRODONCIA', 'Microdoncia', 'ANOMALIA', 'PIEZA', 0, 0, 'MIC', NULL, 1),
(19, 'MOVILIDAD', 'Movilidad patológica', 'PATOLOGIA', 'PIEZA', 0, 0, 'M', NULL, 1),
(20, 'AUSENTE', 'Pieza dentaria ausente / extraída', 'ESTADO', 'PIEZA', 0, 0, 'DAO', NULL, 1),
(21, 'CLAVIJA', 'Pieza dentaria en clavija', 'ANOMALIA', 'PIEZA', 0, 0, '△', NULL, 1),
(22, 'ECTOPICA', 'Pieza dentaria ectópica', 'POSICION', 'PIEZA', 0, 0, 'E', NULL, 1),
(23, 'ERUPCION', 'Pieza dentaria en erupción', 'POSICION', 'PIEZA', 0, 0, '↯', NULL, 1),
(24, 'EXTRUIDA', 'Pieza dentaria extruida', 'POSICION', 'PIEZA', 0, 0, '↓', NULL, 1),
(25, 'INTRUIDA', 'Pieza dentaria intruida', 'POSICION', 'PIEZA', 0, 0, '↑', NULL, 1),
(26, 'SUPERNUMERARIA', 'Pieza dentaria supernumeraria', 'ANOMALIA', 'PAR', 0, 0, 'Ⓢ', NULL, 1),
(27, 'PULPOTOMIA', 'Pulpotomía', 'TRATAMIENTO_EXISTENTE', 'PIEZA', 0, 1, 'PP', NULL, 1),
(28, 'POSICION_ANORMAL', 'Posición anormal dentaria', 'POSICION', 'PIEZA', 0, 0, 'M', NULL, 1),
(29, 'PROTESIS_FIJA', 'Prótesis dental parcial fija', 'REHABILITACION', 'RANGO', 0, 1, '┬─┬', NULL, 1),
(30, 'PROTESIS_COMPLETA', 'Prótesis dental completa', 'REHABILITACION', 'ARCADA', 0, 1, '═', NULL, 1),
(31, 'PROTESIS_REMOVIBLE', 'Prótesis dental parcial removible', 'REHABILITACION', 'RANGO', 0, 1, '═', NULL, 1),
(32, 'REMANENTE', 'Remanente radicular', 'PATOLOGIA', 'PIEZA', 0, 0, 'RR', NULL, 1),
(33, 'RESTAURACION', 'Restauración definitiva', 'TRATAMIENTO_EXISTENTE', 'SUPERFICIE', 1, 1, 'R', NULL, 1),
(34, 'RESTAURACION_TEMPORAL', 'Restauración temporal', 'TRATAMIENTO_EXISTENTE', 'SUPERFICIE', 1, 0, 'Contorno', NULL, 1),
(35, 'SELLANTE', 'Sellante', 'TRATAMIENTO_EXISTENTE', 'SUPERFICIE', 1, 1, 'S', NULL, 1),
(36, 'DESGASTE', 'Superficie desgastada', 'PATOLOGIA', 'SUPERFICIE', 1, 0, 'DES', NULL, 1),
(37, 'ENDODONCIA', 'Tratamiento de conductos / pulpectomía', 'TRATAMIENTO_EXISTENTE', 'PIEZA', 0, 1, 'TC', NULL, 1),
(38, 'TRANSPOSICION', 'Transposición dentaria', 'POSICION', 'PAR', 0, 0, '⇄', NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `catalogo_tratamiento_dental`
--

CREATE TABLE `catalogo_tratamiento_dental` (
  `id_tratamiento_dental` bigint UNSIGNED NOT NULL,
  `codigo` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(180) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `catalogo_tratamiento_dental`
--

INSERT INTO `catalogo_tratamiento_dental` (`id_tratamiento_dental`, `codigo`, `nombre`, `descripcion`, `estado`) VALUES
(1, 'RESTAURACION', 'Restauración', NULL, 1),
(2, 'SELLANTE', 'Sellante', NULL, 1),
(3, 'EXODONCIA', 'Exodoncia', NULL, 1),
(4, 'ENDODONCIA', 'Endodoncia', NULL, 1),
(5, 'CORONA', 'Corona', NULL, 1),
(6, 'PROTESIS_PARCIAL', 'Prótesis parcial', NULL, 1),
(7, 'PROTESIS_TOTAL', 'Prótesis total', NULL, 1),
(8, 'IMPLANTE', 'Implante', NULL, 1),
(9, 'PROFILAXIS', 'Profilaxis', NULL, 1),
(10, 'PERIODONCIA', 'Tratamiento periodontal', NULL, 1),
(11, 'OTRO', 'Otro procedimiento', NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `configuracion_sistema`
--

CREATE TABLE `configuracion_sistema` (
  `id_configuracion` bigint UNSIGNED NOT NULL,
  `clave` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `valor` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `descripcion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  `actualizado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `configuracion_sistema`
--

INSERT INTO `configuracion_sistema` (`id_configuracion`, `clave`, `valor`, `descripcion`, `estado`, `actualizado_en`) VALUES
(1, 'ELIMINACION_CLINICA_PERMITIDA', '1', 'Al activarla, la historia clínica pasa de activa a inactiva y deja de mostrarse. El registro no se borra.', 1, '2026-10-20 21:37:14'),
(2, 'NOMBRE_INSTITUCION', 'Universidad Nacional Daniel Alcides Carrión', 'Nombre institucional mostrado en documentos.', 1, '2026-10-20 21:37:14'),
(3, 'ZONA_HORARIA', 'America/Lima', 'Zona horaria de operación del sistema.', 1, '2026-10-20 21:37:14'),
(4, 'FACULTAD', 'Facultad de Odontología', 'Facultad mostrada en documentos e impresiones.', 1, '2026-10-20 21:37:14'),
(5, 'TIPO_DENTICION_POR_DEFECTO', 'PERMANENTE', 'Dentición con la que abre el odontograma.', 1, '2026-10-20 21:37:14'),
(6, 'TAMANO_MAXIMO_ARCHIVO_KB', '10240', 'Tamaño máximo por archivo clínico adjunto (KB).', 1, '2026-10-20 21:37:14');

-- --------------------------------------------------------

--
-- Table structure for table `consentimiento_clausula`
--

CREATE TABLE `consentimiento_clausula` (
  `id_consentimiento_clausula` bigint UNSIGNED NOT NULL,
  `id_consentimiento` bigint UNSIGNED NOT NULL,
  `numero` smallint UNSIGNED NOT NULL,
  `texto` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `aceptada` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `consentimiento_informado`
--

CREATE TABLE `consentimiento_informado` (
  `id_consentimiento` bigint UNSIGNED NOT NULL,
  `id_historia_clinica` bigint UNSIGNED NOT NULL,
  `id_docente_informante` bigint UNSIGNED DEFAULT NULL,
  `version_documento` smallint UNSIGNED NOT NULL DEFAULT '1',
  `fecha_consentimiento` date NOT NULL,
  `intervencion_autorizada` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `domicilio_acto` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `doctor_informante` varchar(180) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `firma_dia` varchar(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `firma_mes` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `firma_anio` varchar(4) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `texto_documento` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `estado` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'BORRADOR',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `consentimiento_informado`
--

INSERT INTO `consentimiento_informado` (`id_consentimiento`, `id_historia_clinica`, `id_docente_informante`, `version_documento`, `fecha_consentimiento`, `intervencion_autorizada`, `domicilio_acto`, `doctor_informante`, `firma_dia`, `firma_mes`, `firma_anio`, `texto_documento`, `estado`, `creado_en`, `actualizado_en`) VALUES
(1, 1, NULL, 1, '2026-11-08', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'BORRADOR', '2026-11-08 13:44:55', NULL),
(2, 2, NULL, 1, '2026-11-08', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'BORRADOR', '2026-11-08 13:54:04', NULL),
(3, 3, NULL, 1, '2026-11-08', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'BORRADOR', '2026-11-08 14:00:27', NULL),
(4, 4, NULL, 1, '2026-11-08', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'BORRADOR', '2026-11-08 14:20:05', NULL),
(5, 6, NULL, 1, '2026-11-08', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'BORRADOR', '2026-11-08 14:36:18', NULL),
(6, 8, NULL, 1, '2026-11-08', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'BORRADOR', '2026-11-08 15:43:47', NULL),
(7, 9, NULL, 1, '2026-11-08', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'BORRADOR', '2026-11-08 15:49:48', NULL),
(8, 10, NULL, 1, '2026-11-08', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'BORRADOR', '2026-11-08 15:53:23', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `curso`
--

CREATE TABLE `curso` (
  `id_curso` bigint UNSIGNED NOT NULL,
  `codigo` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `diagnostico`
--

CREATE TABLE `diagnostico` (
  `id_diagnostico` bigint UNSIGNED NOT NULL,
  `id_historia_clinica` bigint UNSIGNED NOT NULL,
  `codigo` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo_diagnostico` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `pieza_region` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `severidad` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `evidencia_clinica` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `numero_version` smallint UNSIGNED NOT NULL DEFAULT '1',
  `es_actual` tinyint(1) NOT NULL DEFAULT '1',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `docente`
--

CREATE TABLE `docente` (
  `id_docente` bigint UNSIGNED NOT NULL,
  `codigo_docente` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_documento` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DNI',
  `numero_documento` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombres` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellidos` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `sexo` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `correo` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `numero_colegiatura` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `especialidad` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `docente`
--

INSERT INTO `docente` (`id_docente`, `codigo_docente`, `tipo_documento`, `numero_documento`, `nombres`, `apellidos`, `fecha_nacimiento`, `sexo`, `telefono`, `correo`, `direccion`, `numero_colegiatura`, `especialidad`, `estado`, `creado_en`, `actualizado_en`) VALUES
(1, 'DOC-00000001', 'DNI', '00000001', 'Administrador', 'del Sistema', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '2026-11-08 13:34:22', NULL),
(2, 'DOC-15452615', 'DNI', '15452615', 'Juan', 'Carlo', NULL, NULL, '956956956', NULL, NULL, NULL, NULL, 1, '2026-11-08 13:51:08', NULL),
(3, 'DOC-78455959', 'DNI', '78455959', 'Lopez', 'CAR', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 1, '2026-11-08 13:56:52', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `epicrisis`
--

CREATE TABLE `epicrisis` (
  `id_epicrisis` bigint UNSIGNED NOT NULL,
  `id_reporte_operatorio` bigint UNSIGNED NOT NULL,
  `resumen_clinico` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `diagnostico` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `procedimiento_realizado` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `evolucion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `recomendaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `estado_historia_clinica`
--

CREATE TABLE `estado_historia_clinica` (
  `id_estado_historia` smallint UNSIGNED NOT NULL,
  `codigo` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `orden` tinyint UNSIGNED NOT NULL DEFAULT '0',
  `es_final` tinyint(1) NOT NULL DEFAULT '0',
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `estado_historia_clinica`
--

INSERT INTO `estado_historia_clinica` (`id_estado_historia`, `codigo`, `nombre`, `descripcion`, `orden`, `es_final`, `estado`, `creado_en`, `actualizado_en`) VALUES
(1, 'BORRADOR', 'Borrador', 'Historia creada y aún en elaboración.', 1, 0, 1, '2026-10-15 22:23:00', '2026-10-16 10:42:48'),
(2, 'EN_PROCESO', 'En proceso', 'Historia clínica en desarrollo por el equipo asignado.', 2, 0, 1, '2026-10-15 22:23:00', '2026-10-16 10:42:48'),
(3, 'PENDIENTE_REVISION', 'Pendiente de revisión', 'Historia enviada para revisión docente.', 3, 0, 1, '2026-10-15 22:23:00', '2026-10-16 10:42:48'),
(4, 'OBSERVADA', 'Observada', 'Historia revisada con observaciones pendientes de subsanar.', 4, 0, 1, '2026-10-15 22:23:00', NULL),
(5, 'VALIDADA', 'Validada', 'Historia revisada y validada.', 5, 1, 1, '2026-10-15 22:23:00', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `estudio_modelo`
--

CREATE TABLE `estudio_modelo` (
  `id_estudio_modelo` bigint UNSIGNED NOT NULL,
  `id_historia_clinica` bigint UNSIGNED NOT NULL,
  `informe_maxilar` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `informe_mandibula` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `planificacion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `estudio_modelo`
--

INSERT INTO `estudio_modelo` (`id_estudio_modelo`, `id_historia_clinica`, `informe_maxilar`, `informe_mandibula`, `planificacion`, `creado_en`, `actualizado_en`) VALUES
(1, 1, NULL, NULL, NULL, '2026-11-08 13:44:55', NULL),
(2, 2, NULL, NULL, NULL, '2026-11-08 13:54:04', NULL),
(3, 3, NULL, NULL, NULL, '2026-11-08 14:00:27', NULL),
(4, 4, NULL, NULL, NULL, '2026-11-08 14:20:05', NULL),
(5, 6, NULL, NULL, NULL, '2026-11-08 14:36:18', NULL),
(6, 8, NULL, NULL, NULL, '2026-11-08 15:43:47', NULL),
(7, 9, NULL, NULL, NULL, '2026-11-08 15:49:48', NULL),
(8, 10, NULL, NULL, NULL, '2026-11-08 15:53:23', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `etapa_quirurgica`
--

CREATE TABLE `etapa_quirurgica` (
  `id_etapa_quirurgica` bigint UNSIGNED NOT NULL,
  `id_plan_quirurgico` bigint UNSIGNED NOT NULL,
  `etapa` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `orden` smallint UNSIGNED NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `evolucion_clinica`
--

CREATE TABLE `evolucion_clinica` (
  `id_evolucion_clinica` bigint UNSIGNED NOT NULL,
  `id_historia_clinica` bigint UNSIGNED NOT NULL,
  `fecha_referencia` date DEFAULT NULL,
  `evolucion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `evolucion_clinica`
--

INSERT INTO `evolucion_clinica` (`id_evolucion_clinica`, `id_historia_clinica`, `fecha_referencia`, `evolucion`, `creado_en`, `actualizado_en`) VALUES
(1, 1, NULL, NULL, '2026-11-08 13:44:55', NULL),
(2, 2, NULL, NULL, '2026-11-08 13:54:04', NULL),
(3, 3, NULL, NULL, '2026-11-08 14:00:27', NULL),
(4, 4, NULL, NULL, '2026-11-08 14:20:05', NULL),
(5, 6, NULL, NULL, '2026-11-08 14:36:18', NULL),
(6, 8, NULL, NULL, '2026-11-08 15:43:47', NULL),
(7, 9, NULL, NULL, '2026-11-08 15:49:48', NULL),
(8, 10, NULL, NULL, '2026-11-08 15:53:23', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `examen_auxiliar`
--

CREATE TABLE `examen_auxiliar` (
  `id_examen_auxiliar` bigint UNSIGNED NOT NULL,
  `id_historia_clinica` bigint UNSIGNED NOT NULL,
  `tipo_examen` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_examen` varchar(180) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_examen` date DEFAULT NULL,
  `resultado` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `interpretacion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `id_archivo` bigint UNSIGNED DEFAULT NULL,
  `observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `examen_clinico_general`
--

CREATE TABLE `examen_clinico_general` (
  `id_examen_clinico_general` bigint UNSIGNED NOT NULL,
  `id_historia_clinica` bigint UNSIGNED NOT NULL,
  `tipo_psicologico` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `marcha` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fatiga` varchar(5) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `raza` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `raza_otros` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `peso` decimal(6,2) DEFAULT NULL,
  `talla` decimal(6,2) DEFAULT NULL,
  `temperatura` decimal(5,2) DEFAULT NULL,
  `presion_arterial` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `frecuencia_respiratoria` decimal(6,2) DEFAULT NULL,
  `pulso` decimal(6,2) DEFAULT NULL,
  `frecuencia_cardiaca` decimal(6,2) DEFAULT NULL,
  `forma_craneo` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cabello_implantacion` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cabello_color` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ojos_estado` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ojos_patologia` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ojos_color` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ojos_forma` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `oidos_estado` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `oidos_patologia` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `audicion` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nariz_estado` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nariz_forma` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `labios_estado` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `labios_patologia` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `labios_forma` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fascies_estado` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fascies_color` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cuello_forma` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cuello_patologia` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cadena_linfatica` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cadena_linfatica_patologia` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `atm` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `atm_otros` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tiroides` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tiroides_patologia` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `miembros_superiores` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `miembros_superiores_detalle` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `miembros_inferiores` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `miembros_inferiores_detalle` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `torax` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `torax_patologia` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `examen_clinico_general`
--

INSERT INTO `examen_clinico_general` (`id_examen_clinico_general`, `id_historia_clinica`, `tipo_psicologico`, `marcha`, `fatiga`, `raza`, `raza_otros`, `peso`, `talla`, `temperatura`, `presion_arterial`, `frecuencia_respiratoria`, `pulso`, `frecuencia_cardiaca`, `forma_craneo`, `cabello_implantacion`, `cabello_color`, `ojos_estado`, `ojos_patologia`, `ojos_color`, `ojos_forma`, `oidos_estado`, `oidos_patologia`, `audicion`, `nariz_estado`, `nariz_forma`, `labios_estado`, `labios_patologia`, `labios_forma`, `fascies_estado`, `fascies_color`, `cuello_forma`, `cuello_patologia`, `cadena_linfatica`, `cadena_linfatica_patologia`, `atm`, `atm_otros`, `tiroides`, `tiroides_patologia`, `miembros_superiores`, `miembros_superiores_detalle`, `miembros_inferiores`, `miembros_inferiores_detalle`, `torax`, `torax_patologia`, `observaciones`, `creado_en`, `actualizado_en`) VALUES
(1, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 13:44:55', NULL),
(2, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 13:54:04', NULL),
(3, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 14:00:27', NULL),
(4, 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 14:20:05', NULL),
(5, 6, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 14:36:18', NULL),
(6, 8, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 15:43:47', NULL),
(7, 9, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 15:49:48', NULL),
(8, 10, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 15:53:23', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `examen_estomatologico`
--

CREATE TABLE `examen_estomatologico` (
  `id_examen_estomatologico` bigint UNSIGNED NOT NULL,
  `id_historia_clinica` bigint UNSIGNED NOT NULL,
  `tipo_examen` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `estructura_anatomica` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado_estructura` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'NORMAL',
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `examen_oclusion`
--

CREATE TABLE `examen_oclusion` (
  `id_examen_oclusion` bigint UNSIGNED NOT NULL,
  `id_historia_clinica` bigint UNSIGNED NOT NULL,
  `clasificacion_posterior` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `clasificacion_anterior` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `motivos_perdida` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `motivos_perdida_otros` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ultima_exodoncia` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `mordida` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `diagnostico_presuntivo` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `examen_oclusion`
--

INSERT INTO `examen_oclusion` (`id_examen_oclusion`, `id_historia_clinica`, `clasificacion_posterior`, `clasificacion_anterior`, `motivos_perdida`, `motivos_perdida_otros`, `ultima_exodoncia`, `mordida`, `diagnostico_presuntivo`, `observaciones`, `creado_en`, `actualizado_en`) VALUES
(1, 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 13:44:55', NULL),
(2, 2, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 13:54:04', NULL),
(3, 3, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 14:00:27', NULL),
(4, 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 14:20:05', NULL),
(5, 6, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 14:36:18', NULL),
(6, 8, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 15:43:47', NULL),
(7, 9, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 15:49:48', NULL),
(8, 10, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 15:53:23', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `fase_tratamiento`
--

CREATE TABLE `fase_tratamiento` (
  `id_fase_tratamiento` bigint UNSIGNED NOT NULL,
  `id_plan_tratamiento` bigint UNSIGNED NOT NULL,
  `numero_fase` smallint UNSIGNED NOT NULL,
  `nombre` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `orden` smallint UNSIGNED NOT NULL DEFAULT '0',
  `estado` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDIENTE'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `firma_consentimiento`
--

CREATE TABLE `firma_consentimiento` (
  `id_firma_consentimiento` bigint UNSIGNED NOT NULL,
  `id_consentimiento` bigint UNSIGNED NOT NULL,
  `tipo_firmante` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_firmante` varchar(180) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `documento_firmante` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `parentesco_firmante` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion_firmante` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_archivo` bigint UNSIGNED DEFAULT NULL,
  `fecha_firma` datetime DEFAULT NULL,
  `observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `firma_seguimiento`
--

CREATE TABLE `firma_seguimiento` (
  `id_firma_seguimiento` bigint UNSIGNED NOT NULL,
  `id_seguimiento_quirurgico` bigint UNSIGNED NOT NULL,
  `tipo_firmante` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_docente` bigint UNSIGNED DEFAULT NULL,
  `id_alumno` bigint UNSIGNED DEFAULT NULL,
  `nombre_firmante` varchar(180) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_archivo` bigint UNSIGNED DEFAULT NULL,
  `fecha_firma` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `grupo_academico`
--

CREATE TABLE `grupo_academico` (
  `id_grupo` bigint UNSIGNED NOT NULL,
  `codigo` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `semestre` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `grupo_miembro`
--

CREATE TABLE `grupo_miembro` (
  `id_grupo_miembro` bigint UNSIGNED NOT NULL,
  `id_grupo` bigint UNSIGNED NOT NULL,
  `id_alumno` bigint UNSIGNED NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date DEFAULT NULL,
  `estado` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ACTIVA',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `hallazgo_estomatologico`
--

CREATE TABLE `hallazgo_estomatologico` (
  `id_hallazgo_estomatologico` bigint UNSIGNED NOT NULL,
  `id_examen_estomatologico` bigint UNSIGNED NOT NULL,
  `hallazgo` varchar(180) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `historia_alumno`
--

CREATE TABLE `historia_alumno` (
  `id_historia_alumno` bigint UNSIGNED NOT NULL,
  `id_historia_clinica` bigint UNSIGNED NOT NULL,
  `id_alumno` bigint UNSIGNED NOT NULL,
  `tipo_participacion` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'OPERADOR',
  `fecha_asignacion` date NOT NULL,
  `fecha_fin` date DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  `asignado_por_tipo` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `asignado_por_id` bigint UNSIGNED DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `historia_alumno`
--

INSERT INTO `historia_alumno` (`id_historia_alumno`, `id_historia_clinica`, `id_alumno`, `tipo_participacion`, `fecha_asignacion`, `fecha_fin`, `estado`, `asignado_por_tipo`, `asignado_por_id`, `creado_en`) VALUES
(1, 3, 1, 'OPERADOR', '2026-11-08', NULL, 1, 'ALUMNO', 1, '2026-11-08 13:59:22'),
(2, 4, 1, 'OPERADOR', '2026-11-08', NULL, 1, 'ALUMNO', 1, '2026-11-08 14:19:38'),
(3, 5, 2, 'OPERADOR', '2026-11-08', NULL, 1, 'DOCENTE', 3, '2026-11-08 14:33:24'),
(4, 6, 2, 'OPERADOR', '2026-11-08', '2026-11-08', 0, 'ALUMNO', 2, '2026-11-08 14:36:06'),
(5, 6, 1, 'OPERADOR', '2026-11-08', NULL, 1, 'DOCENTE', 3, '2026-11-08 14:40:45'),
(6, 7, 2, 'OPERADOR', '2026-11-08', '2026-11-08', 0, 'DOCENTE', 3, '2026-11-08 15:30:12'),
(7, 7, 1, 'OPERADOR', '2026-11-08', NULL, 1, 'DOCENTE', 1, '2026-11-08 15:34:48'),
(8, 8, 2, 'OPERADOR', '2026-11-08', '2026-11-08', 0, 'DOCENTE', 3, '2026-11-08 15:42:46'),
(9, 8, 1, 'OPERADOR', '2026-11-08', NULL, 1, 'DOCENTE', 3, '2026-11-08 15:46:26'),
(12, 9, 2, 'OPERADOR', '2026-11-08', NULL, 1, 'DOCENTE', 1, '2026-11-08 15:49:34'),
(13, 10, 2, 'OPERADOR', '2026-11-08', NULL, 1, 'DOCENTE', 3, '2026-11-08 15:53:00'),
(14, 10, 1, 'OPERADOR', '2026-11-08', '2026-11-08', 0, 'DOCENTE', 3, '2026-11-08 16:02:15');

-- --------------------------------------------------------

--
-- Table structure for table `historia_clinica`
--

CREATE TABLE `historia_clinica` (
  `id_historia_clinica` bigint UNSIGNED NOT NULL,
  `numero_historia` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_paciente` bigint UNSIGNED NOT NULL,
  `id_periodo_academico` bigint UNSIGNED NOT NULL,
  `id_estado_historia` smallint UNSIGNED NOT NULL DEFAULT '1',
  `fecha_apertura` date NOT NULL,
  `fecha_cierre` date DEFAULT NULL,
  `tipo_atencion` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `motivo_consulta` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `creado_por_tipo` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `creado_por_id` bigint UNSIGNED DEFAULT NULL,
  `actualizado_por_tipo` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `actualizado_por_id` bigint UNSIGNED DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `anulado_en` datetime DEFAULT NULL,
  `motivo_anulacion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `historia_clinica`
--

INSERT INTO `historia_clinica` (`id_historia_clinica`, `numero_historia`, `id_paciente`, `id_periodo_academico`, `id_estado_historia`, `fecha_apertura`, `fecha_cierre`, `tipo_atencion`, `motivo_consulta`, `observaciones`, `creado_por_tipo`, `creado_por_id`, `actualizado_por_tipo`, `actualizado_por_id`, `creado_en`, `actualizado_en`, `anulado_en`, `motivo_anulacion`) VALUES
(1, 'HC-2026-001', 1, 1, 5, '2026-11-08', '2026-11-08', NULL, NULL, NULL, 'DOCENTE', 1, 'DOCENTE', 1, '2026-11-08 13:44:07', '2026-11-08 13:46:22', NULL, NULL),
(2, 'HC-2026-002', 1, 1, 5, '2026-11-08', '2026-11-08', NULL, NULL, NULL, 'DOCENTE', 1, 'DOCENTE', 1, '2026-11-08 13:46:49', '2026-11-08 14:17:47', NULL, NULL),
(3, 'HC-2026-003', 2, 1, 5, '2026-11-08', '2026-11-08', NULL, NULL, NULL, 'ALUMNO', 1, 'DOCENTE', 1, '2026-11-08 13:59:22', '2026-11-08 14:02:35', NULL, NULL),
(4, 'HC-2026-004', 2, 1, 2, '2026-11-08', NULL, NULL, NULL, NULL, 'ALUMNO', 1, 'ALUMNO', 1, '2026-11-08 14:19:38', '2026-11-08 14:20:05', NULL, NULL),
(5, 'HC-2026-005', 2, 1, 1, '2026-11-08', NULL, NULL, NULL, NULL, 'DOCENTE', 3, 'DOCENTE', 1, '2026-11-08 14:33:05', '2026-11-08 15:26:26', '2026-11-08 15:26:26', 'Inactiva'),
(6, 'HC-2026-006', 3, 1, 2, '2026-11-08', NULL, NULL, NULL, NULL, 'ALUMNO', 2, 'DOCENTE', 1, '2026-11-08 14:36:06', '2026-11-08 15:25:56', '2026-11-08 15:25:56', 'Inactiva'),
(7, 'HC-2026-007', 2, 1, 1, '2026-11-08', NULL, NULL, NULL, NULL, 'DOCENTE', 3, 'DOCENTE', 3, '2026-11-08 15:30:06', '2026-11-08 15:30:06', NULL, NULL),
(8, 'HC-2026-008', 2, 1, 5, '2026-11-08', '2026-11-08', NULL, NULL, NULL, 'DOCENTE', 3, 'DOCENTE', 3, '2026-11-08 15:42:41', '2026-11-08 15:43:22', NULL, NULL),
(9, 'HC-2026-009', 3, 1, 4, '2026-11-08', NULL, NULL, NULL, NULL, 'DOCENTE', 1, 'DOCENTE', 1, '2026-11-08 15:49:29', '2026-11-08 16:08:56', NULL, NULL),
(10, 'HC-2026-010', 3, 1, 2, '2026-11-08', NULL, NULL, NULL, NULL, 'DOCENTE', 3, 'ALUMNO', 2, '2026-11-08 15:52:24', '2026-11-08 15:53:23', NULL, NULL),
(11, 'HC-2026-011', 3, 1, 1, '2026-11-08', NULL, NULL, NULL, NULL, 'DOCENTE', 1, 'DOCENTE', 1, '2026-11-08 21:33:16', '2026-11-08 21:33:16', NULL, NULL),
(12, 'HC-2026-012', 4, 1, 1, '2026-11-08', NULL, NULL, NULL, NULL, 'DOCENTE', 1, 'DOCENTE', 1, '2026-11-08 21:36:27', '2026-11-08 21:36:27', NULL, NULL),
(13, 'HC-2026-013', 5, 1, 1, '2026-11-08', NULL, NULL, NULL, NULL, 'DOCENTE', 1, 'DOCENTE', 1, '2026-11-08 23:14:15', '2026-11-08 23:14:15', NULL, NULL);

--
-- Triggers `historia_clinica`
--
DELIMITER $$
CREATE TRIGGER `trg_historia_estado_ai` AFTER INSERT ON `historia_clinica` FOR EACH ROW BEGIN
  INSERT INTO historia_clinica_estado_historial
    (id_historia_clinica, id_estado_historia, fecha_estado, tipo_usuario, id_usuario)
  VALUES
    (NEW.id_historia_clinica, NEW.id_estado_historia, NEW.creado_en,
     COALESCE(NEW.creado_por_tipo, 'SISTEMA'), NEW.creado_por_id);
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_historia_estado_au` AFTER UPDATE ON `historia_clinica` FOR EACH ROW BEGIN
  IF NEW.id_estado_historia <> OLD.id_estado_historia THEN
    INSERT INTO historia_clinica_estado_historial
      (id_historia_clinica, id_estado_historia, fecha_estado, tipo_usuario, id_usuario)
    VALUES
      (NEW.id_historia_clinica, NEW.id_estado_historia, NEW.actualizado_en,
       COALESCE(NEW.actualizado_por_tipo, 'SISTEMA'), NEW.actualizado_por_id);
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `historia_clinica_estado_historial`
--

CREATE TABLE `historia_clinica_estado_historial` (
  `id_historial_estado` bigint UNSIGNED NOT NULL,
  `id_historia_clinica` bigint UNSIGNED NOT NULL,
  `id_estado_historia` smallint UNSIGNED NOT NULL,
  `fecha_estado` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `observacion` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo_usuario` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_usuario` bigint UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `historia_clinica_estado_historial`
--

INSERT INTO `historia_clinica_estado_historial` (`id_historial_estado`, `id_historia_clinica`, `id_estado_historia`, `fecha_estado`, `observacion`, `tipo_usuario`, `id_usuario`) VALUES
(1, 1, 1, '2026-11-08 13:44:07', NULL, 'DOCENTE', 1),
(2, 1, 2, '2026-11-08 13:44:55', NULL, 'DOCENTE', 1),
(3, 1, 3, '2026-11-08 13:46:11', NULL, 'DOCENTE', 1),
(4, 1, 5, '2026-11-08 13:46:22', NULL, 'DOCENTE', 1),
(5, 2, 1, '2026-11-08 13:46:49', NULL, 'DOCENTE', 1),
(6, 2, 2, '2026-11-08 13:54:04', NULL, 'DOCENTE', 2),
(7, 3, 1, '2026-11-08 13:59:22', NULL, 'ALUMNO', 1),
(8, 3, 2, '2026-11-08 14:00:27', NULL, 'ALUMNO', 1),
(9, 3, 3, '2026-11-08 14:01:00', NULL, 'ALUMNO', 1),
(10, 3, 5, '2026-11-08 14:02:35', NULL, 'DOCENTE', 1),
(11, 2, 3, '2026-11-08 14:02:54', NULL, 'DOCENTE', 1),
(12, 2, 4, '2026-11-08 14:02:58', 'asdasdads', 'DOCENTE', 1),
(13, 2, 3, '2026-11-08 14:17:41', NULL, 'DOCENTE', 1),
(14, 2, 5, '2026-11-08 14:17:47', NULL, 'DOCENTE', 1),
(15, 4, 1, '2026-11-08 14:19:38', NULL, 'ALUMNO', 1),
(16, 4, 2, '2026-11-08 14:20:05', NULL, 'ALUMNO', 1),
(17, 5, 1, '2026-11-08 14:33:05', NULL, 'DOCENTE', 3),
(18, 6, 1, '2026-11-08 14:36:06', NULL, 'ALUMNO', 2),
(19, 6, 2, '2026-11-08 14:36:18', NULL, 'ALUMNO', 2),
(20, 7, 1, '2026-11-08 15:30:06', NULL, 'DOCENTE', 3),
(21, 8, 1, '2026-11-08 15:42:41', NULL, 'DOCENTE', 3),
(22, 8, 3, '2026-11-08 15:43:05', NULL, 'ALUMNO', 2),
(23, 8, 5, '2026-11-08 15:43:22', NULL, 'DOCENTE', 3),
(24, 9, 1, '2026-11-08 15:49:29', NULL, 'DOCENTE', 1),
(25, 9, 2, '2026-11-08 15:49:48', NULL, 'ALUMNO', 2),
(26, 10, 1, '2026-11-08 15:52:24', NULL, 'DOCENTE', 3),
(27, 10, 2, '2026-11-08 15:53:23', NULL, 'ALUMNO', 2),
(28, 9, 3, '2026-11-08 15:55:22', NULL, 'DOCENTE', 1),
(29, 9, 2, '2026-11-08 16:02:28', NULL, 'ALUMNO', 2),
(30, 9, 3, '2026-11-08 16:02:31', NULL, 'ALUMNO', 2),
(31, 9, 2, '2026-11-08 16:02:32', NULL, 'ALUMNO', 2),
(32, 9, 3, '2026-11-08 16:02:32', NULL, 'ALUMNO', 2),
(33, 9, 2, '2026-11-08 16:02:33', NULL, 'ALUMNO', 2),
(34, 9, 3, '2026-11-08 16:02:34', NULL, 'ALUMNO', 2),
(35, 9, 2, '2026-11-08 16:02:35', NULL, 'ALUMNO', 2),
(36, 9, 3, '2026-11-08 16:02:36', NULL, 'ALUMNO', 2),
(37, 9, 2, '2026-11-08 16:02:37', NULL, 'ALUMNO', 2),
(38, 9, 3, '2026-11-08 16:02:48', NULL, 'ALUMNO', 2),
(39, 9, 2, '2026-11-08 16:02:51', NULL, 'ALUMNO', 2),
(40, 9, 3, '2026-11-08 16:02:54', NULL, 'ALUMNO', 2),
(41, 9, 2, '2026-11-08 16:02:56', NULL, 'ALUMNO', 2),
(42, 9, 3, '2026-11-08 16:08:33', NULL, 'DOCENTE', 1),
(43, 9, 4, '2026-11-08 16:08:56', 'asdfasdasd', 'DOCENTE', 1),
(44, 11, 1, '2026-11-08 21:33:16', NULL, 'DOCENTE', 1),
(45, 12, 1, '2026-11-08 21:36:27', NULL, 'DOCENTE', 1),
(46, 13, 1, '2026-11-08 23:14:15', NULL, 'DOCENTE', 1);

-- --------------------------------------------------------

--
-- Table structure for table `historia_docente`
--

CREATE TABLE `historia_docente` (
  `id_historia_docente` bigint UNSIGNED NOT NULL,
  `id_historia_clinica` bigint UNSIGNED NOT NULL,
  `id_docente` bigint UNSIGNED NOT NULL,
  `tipo_participacion` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'COLABORADOR',
  `fecha_asignacion` date NOT NULL,
  `fecha_fin` date DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  `asignado_por_tipo` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `asignado_por_id` bigint UNSIGNED DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `historia_docente`
--

INSERT INTO `historia_docente` (`id_historia_docente`, `id_historia_clinica`, `id_docente`, `tipo_participacion`, `fecha_asignacion`, `fecha_fin`, `estado`, `asignado_por_tipo`, `asignado_por_id`, `creado_en`) VALUES
(1, 1, 1, 'ENCARGADO', '2026-11-08', NULL, 1, 'DOCENTE', 1, '2026-11-08 13:44:07'),
(2, 2, 1, 'ENCARGADO', '2026-11-08', NULL, 1, 'DOCENTE', 1, '2026-11-08 13:46:49'),
(3, 3, 3, 'ENCARGADO', '2026-11-08', NULL, 1, 'DOCENTE', 1, '2026-11-08 14:09:43'),
(4, 4, 2, 'ENCARGADO', '2026-11-08', NULL, 1, 'ALUMNO', 1, '2026-11-08 14:27:57'),
(5, 5, 3, 'ENCARGADO', '2026-11-08', NULL, 1, 'DOCENTE', 3, '2026-11-08 14:33:05'),
(6, 6, 2, 'ENCARGADO', '2026-11-08', NULL, 1, 'ALUMNO', 2, '2026-11-08 14:36:18'),
(7, 7, 3, 'ENCARGADO', '2026-11-08', NULL, 1, 'DOCENTE', 3, '2026-11-08 15:30:06'),
(8, 8, 3, 'ENCARGADO', '2026-11-08', NULL, 1, 'DOCENTE', 3, '2026-11-08 15:42:41'),
(9, 9, 1, 'ENCARGADO', '2026-11-08', NULL, 1, 'DOCENTE', 1, '2026-11-08 15:49:29'),
(10, 10, 3, 'ENCARGADO', '2026-11-08', NULL, 1, 'DOCENTE', 3, '2026-11-08 15:52:24'),
(11, 11, 1, 'ENCARGADO', '2026-11-08', NULL, 1, 'DOCENTE', 1, '2026-11-08 21:33:16'),
(12, 12, 1, 'ENCARGADO', '2026-11-08', NULL, 1, 'DOCENTE', 1, '2026-11-08 21:36:27'),
(13, 13, 1, 'ENCARGADO', '2026-11-08', NULL, 1, 'DOCENTE', 1, '2026-11-08 23:14:15');

--
-- Triggers `historia_docente`
--
DELIMITER $$
CREATE TRIGGER `trg_historia_docente_bi` BEFORE INSERT ON `historia_docente` FOR EACH ROW BEGIN
  IF NEW.tipo_participacion NOT IN ('ENCARGADO','SUPERVISOR','COLABORADOR') THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'tipo_participacion de historia_docente no vÃ¡lido.';
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
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La historia clÃ­nica ya tiene un docente ENCARGADO activo.';
  END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_historia_docente_bu` BEFORE UPDATE ON `historia_docente` FOR EACH ROW BEGIN
  IF NEW.tipo_participacion NOT IN ('ENCARGADO','SUPERVISOR','COLABORADOR') THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'tipo_participacion de historia_docente no vÃ¡lido.';
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
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La historia clÃ­nica ya tiene un docente ENCARGADO activo.';
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `historia_seccion_estado`
--

CREATE TABLE `historia_seccion_estado` (
  `id_historia_seccion_estado` bigint UNSIGNED NOT NULL,
  `id_historia_clinica` bigint UNSIGNED NOT NULL,
  `codigo_seccion` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pendiente',
  `tipo_usuario` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_usuario` bigint UNSIGNED DEFAULT NULL,
  `actualizado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `historia_seccion_estado`
--

INSERT INTO `historia_seccion_estado` (`id_historia_seccion_estado`, `id_historia_clinica`, `codigo_seccion`, `estado`, `tipo_usuario`, `id_usuario`, `actualizado_en`) VALUES
(1, 1, 'datos-paciente', 'approved', 'DOCENTE', 1, '2026-11-08 14:17:19'),
(2, 2, 'datos-paciente', 'in-progress', 'DOCENTE', 2, '2026-11-08 13:54:04'),
(3, 3, 'datos-paciente', 'in-progress', 'DOCENTE', 1, '2026-11-08 14:09:44'),
(4, 4, 'datos-paciente', 'review', 'ALUMNO', 1, '2026-11-08 14:27:57'),
(5, 6, 'datos-paciente', 'approved', 'DOCENTE', 3, '2026-11-08 14:38:00'),
(6, 6, 'examen-clinico', 'complete', 'DOCENTE', 3, '2026-11-08 14:38:00'),
(7, 6, 'examen-extraoral', 'complete', 'DOCENTE', 3, '2026-11-08 14:38:00'),
(8, 6, 'examen-intraoral', 'complete', 'DOCENTE', 3, '2026-11-08 14:38:00'),
(9, 6, 'odontograma', 'complete', 'DOCENTE', 3, '2026-11-08 14:38:00'),
(10, 6, 'oclusion', 'complete', 'DOCENTE', 3, '2026-11-08 14:38:00'),
(11, 6, 'examenes-auxiliares', 'complete', 'DOCENTE', 3, '2026-11-08 14:38:00'),
(12, 6, 'modelos', 'complete', 'DOCENTE', 3, '2026-11-08 14:38:00'),
(13, 6, 'plan-tratamiento', 'complete', 'DOCENTE', 3, '2026-11-08 14:38:00'),
(14, 8, 'datos-paciente', 'approved', 'DOCENTE', 1, '2026-11-08 15:47:47'),
(15, 8, 'examen-clinico', 'approved', 'DOCENTE', 1, '2026-11-08 15:47:47'),
(16, 9, 'datos-paciente', 'in-progress', 'DOCENTE', 3, '2026-11-08 16:11:19'),
(17, 10, 'datos-paciente', 'approved', 'DOCENTE', 3, '2026-11-08 21:28:36'),
(18, 10, 'examen-clinico', 'complete', 'DOCENTE', 3, '2026-11-08 21:28:36'),
(19, 10, 'examen-extraoral', 'complete', 'DOCENTE', 3, '2026-11-08 21:28:36'),
(20, 10, 'examen-intraoral', 'complete', 'DOCENTE', 3, '2026-11-08 21:28:36'),
(21, 9, 'examen-clinico', 'approved', 'DOCENTE', 3, '2026-11-08 16:11:19'),
(22, 9, 'examen-extraoral', 'approved', 'DOCENTE', 3, '2026-11-08 16:11:19'),
(23, 9, 'examen-intraoral', 'approved', 'DOCENTE', 3, '2026-11-08 16:11:19'),
(24, 9, 'odontograma', 'approved', 'DOCENTE', 3, '2026-11-08 16:11:19'),
(25, 9, 'oclusion', 'approved', 'DOCENTE', 3, '2026-11-08 16:11:19'),
(26, 9, 'examenes-auxiliares', 'approved', 'DOCENTE', 3, '2026-11-08 16:11:19'),
(27, 9, 'modelos', 'approved', 'DOCENTE', 3, '2026-11-08 16:11:19');

-- --------------------------------------------------------

--
-- Table structure for table `login_historial_alumno`
--

CREATE TABLE `login_historial_alumno` (
  `id_login_alumno` bigint UNSIGNED NOT NULL,
  `id_usuario_alumno` bigint UNSIGNED DEFAULT NULL,
  `nombre_usuario` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `direccion_ip` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `agente_usuario` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `exito` tinyint(1) NOT NULL,
  `motivo_fallo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `login_historial_alumno`
--

INSERT INTO `login_historial_alumno` (`id_login_alumno`, `id_usuario_alumno`, `nombre_usuario`, `direccion_ip`, `agente_usuario`, `exito`, `motivo_fallo`, `creado_en`) VALUES
(1, 1, 'lopez8@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', 1, NULL, '2026-11-08 13:58:32'),
(2, 1, 'lopez8@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', 1, NULL, '2026-11-08 14:19:03'),
(3, 2, 'pomodoro@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', 1, NULL, '2026-11-08 14:30:55'),
(4, 2, 'pomodoro@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', 1, NULL, '2026-11-08 14:33:42'),
(5, 2, 'pomodoro@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', 1, NULL, '2026-11-08 21:27:49');

-- --------------------------------------------------------

--
-- Table structure for table `login_historial_docente`
--

CREATE TABLE `login_historial_docente` (
  `id_login_docente` bigint UNSIGNED NOT NULL,
  `id_usuario_docente` bigint UNSIGNED DEFAULT NULL,
  `nombre_usuario` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `direccion_ip` varchar(45) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `agente_usuario` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `exito` tinyint(1) NOT NULL,
  `motivo_fallo` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `login_historial_docente`
--

INSERT INTO `login_historial_docente` (`id_login_docente`, `id_usuario_docente`, `nombre_usuario`, `direccion_ip`, `agente_usuario`, `exito`, `motivo_fallo`, `creado_en`) VALUES
(1, 1, 'SUPER-@dmin', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', 1, NULL, '2026-11-08 13:35:06'),
(2, 1, 'SUPER-@dmin', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', 1, NULL, '2026-11-08 13:38:45'),
(3, 1, 'SUPER-@dmin', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', 1, NULL, '2026-11-08 13:39:47'),
(4, 1, 'SUPER-@dmin', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', 1, NULL, '2026-11-08 13:42:28'),
(5, 2, 'juan@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', 1, NULL, '2026-11-08 13:52:25'),
(6, 1, 'SUPER-@dmin', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', 1, NULL, '2026-11-08 13:55:34'),
(7, 1, 'SUPER-@dmin', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', 1, NULL, '2026-11-08 14:01:28'),
(8, 1, 'SUPER-@dmin', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', 1, NULL, '2026-11-08 14:12:41'),
(9, 1, 'SUPER-@dmin', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', 1, NULL, '2026-11-08 14:14:08'),
(10, 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', 1, NULL, '2026-11-08 14:29:03'),
(11, 1, 'SUPER-@dmin', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', 1, NULL, '2026-11-08 14:30:40'),
(12, 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36', 1, NULL, '2026-11-08 14:31:27'),
(13, 1, 'SUPER-@dmin', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/157.0.0.0 Safari/537.36', 1, NULL, '2026-11-08 21:24:43'),
(14, 3, 'lopez@gmail.com', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Cursor/3.29.9 Chrome/150.0.7871.250 Electron/43.8.4 Safari/537.36', 1, NULL, '2026-11-08 21:25:22');

-- --------------------------------------------------------

--
-- Table structure for table `modulo`
--

CREATE TABLE `modulo` (
  `id_modulo` bigint UNSIGNED NOT NULL,
  `codigo_modulo` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_modulo` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `icono` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ruta` varchar(180) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `orden` int NOT NULL DEFAULT '0',
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `modulo`
--

INSERT INTO `modulo` (`id_modulo`, `codigo_modulo`, `nombre_modulo`, `descripcion`, `icono`, `ruta`, `orden`, `estado`, `creado_en`, `actualizado_en`) VALUES
(1, 'INICIO', 'Inicio', 'Panel principal.', NULL, '/inicio', 1, 1, '2026-10-15 22:23:00', NULL),
(2, 'PACIENTES', 'Pacientes', 'Gestión de pacientes.', NULL, '/pacientes', 2, 1, '2026-10-15 22:23:00', '2026-10-16 10:42:48'),
(3, 'HISTORIA_CLINICA', 'Historia clínica', 'Gestión integral de historias clínicas.', NULL, '/historias', 3, 1, '2026-10-15 22:23:00', '2026-10-16 10:42:48'),
(4, 'CIRUGIA', 'Cirugía', 'Consentimiento, cirugía y seguimiento.', NULL, '/cirugia', 4, 1, '2026-10-15 22:23:00', '2026-10-16 10:42:48'),
(5, 'ACADEMICO', 'Gestión académica', 'Cursos, periodos, grupos y rotaciones.', NULL, '/academico', 5, 1, '2026-10-15 22:23:00', '2026-10-16 10:42:48'),
(6, 'ADMINISTRACION', 'Administración', 'Usuarios y roles.', NULL, '/administracion', 6, 1, '2026-10-15 22:23:00', '2026-10-16 10:42:48'),
(7, 'REPORTES', 'Reportes', 'Consulta y exportación de información.', NULL, '/reportes', 7, 1, '2026-10-15 22:23:00', '2026-10-16 10:42:48'),
(8, 'CONFIGURACION', 'Configuración', 'Parámetros y catálogos.', NULL, '/configuracion', 8, 1, '2026-10-15 22:23:00', '2026-10-16 10:42:48'),
(9, 'AUDITORIA', 'Auditoría', 'Bitácora de acciones.', NULL, '/auditoria', 9, 1, '2026-10-15 22:23:00', '2026-10-16 10:42:48');

-- --------------------------------------------------------

--
-- Table structure for table `notificacion`
--

CREATE TABLE `notificacion` (
  `id_notificacion` bigint UNSIGNED NOT NULL,
  `tipo_destinatario` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ALUMNO o DOCENTE',
  `id_destinatario` bigint UNSIGNED NOT NULL,
  `tipo` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `titulo` varchar(180) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `mensaje` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `id_historia_clinica` bigint UNSIGNED DEFAULT NULL,
  `codigo_seccion` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `leida` tinyint(1) NOT NULL DEFAULT '0',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notificacion`
--

INSERT INTO `notificacion` (`id_notificacion`, `tipo_destinatario`, `id_destinatario`, `tipo`, `titulo`, `mensaje`, `id_historia_clinica`, `codigo_seccion`, `leida`, `creado_en`) VALUES
(1, 'ALUMNO', 2, 'HISTORIA_ASIGNADA', 'Historia clínica asignada', 'Lopez CAR le asignó la historia HC-2026-007.', 7, NULL, 1, '2026-11-08 15:30:12'),
(2, 'ALUMNO', 1, 'HISTORIA_ASIGNADA', 'Historia clínica asignada', 'Administrador del Sistema le asignó la historia HC-2026-007.', 7, NULL, 0, '2026-11-08 15:34:48'),
(3, 'ALUMNO', 2, 'HISTORIA_ASIGNADA', 'Historia clínica asignada', 'Lopez CAR le asignó la historia HC-2026-008.', 8, NULL, 1, '2026-11-08 15:42:46'),
(4, 'DOCENTE', 3, 'ESTADO_HISTORIA', 'Historia clínica lista para revisión', 'Pomodoro ASD: HC-2026-008. Abra la historia para revisar los detalles.', 8, NULL, 1, '2026-11-08 15:43:06'),
(5, 'ALUMNO', 2, 'ESTADO_HISTORIA', 'Historia clínica validada', 'Lopez CAR: HC-2026-008. Abra la historia para revisar los detalles.', 8, NULL, 1, '2026-11-08 15:43:22'),
(6, 'ALUMNO', 2, 'ESTADO_HISTORIA', 'Sección clínica validada', 'Administrador del Sistema: HC-2026-008 · datos paciente. Abra la historia para revisar los detalles.', 8, 'datos-paciente', 1, '2026-11-08 15:44:13'),
(7, 'ALUMNO', 2, 'ESTADO_HISTORIA', 'Sección devuelta para corrección', 'Administrador del Sistema: HC-2026-008 · datos paciente. Abra la historia para revisar los detalles.', 8, 'datos-paciente', 1, '2026-11-08 15:44:14'),
(8, 'ALUMNO', 2, 'ESTADO_HISTORIA', 'Sección clínica validada', 'Lopez CAR: HC-2026-008 · datos paciente. Abra la historia para revisar los detalles.', 8, 'datos-paciente', 1, '2026-11-08 15:44:37'),
(9, 'ALUMNO', 2, 'ESTADO_HISTORIA', 'Sección devuelta para corrección', 'Lopez CAR: HC-2026-008 · datos paciente. Abra la historia para revisar los detalles.', 8, 'datos-paciente', 1, '2026-11-08 15:44:40'),
(10, 'ALUMNO', 1, 'HISTORIA_ASIGNADA', 'Historia clínica asignada', 'Lopez CAR le asignó la historia HC-2026-008.', 8, NULL, 0, '2026-11-08 15:46:26'),
(11, 'ALUMNO', 2, 'ASIGNACION_RETIRADA', 'Cambio de responsable de historia clínica', 'Lopez CAR cambió al responsable de la historia HC-2026-008. Usted ya no está asignado como asistente responsable.', 8, NULL, 1, '2026-11-08 15:46:26'),
(12, 'ALUMNO', 1, 'ESTADO_HISTORIA', 'Sección clínica validada', 'Administrador del Sistema: HC-2026-008 · datos paciente. Abra la historia para revisar los detalles.', 8, 'datos-paciente', 0, '2026-11-08 15:47:40'),
(13, 'ALUMNO', 1, 'ESTADO_HISTORIA', 'Sección clínica validada', 'Administrador del Sistema: HC-2026-008 · examen clinico. Abra la historia para revisar los detalles.', 8, 'examen-clinico', 0, '2026-11-08 15:47:47'),
(14, 'ALUMNO', 2, 'HISTORIA_ASIGNADA', 'Historia clínica asignada', 'Administrador del Sistema le asignó la historia HC-2026-009.', 9, NULL, 1, '2026-11-08 15:49:34'),
(15, 'DOCENTE', 1, 'SECCION_REVISION', 'Sección lista para revisión', 'Pomodoro ASD envió «datos paciente» de HC-2026-009 a revisión.', 9, 'datos-paciente', 1, '2026-11-08 15:49:49'),
(16, 'ALUMNO', 2, 'ESTADO_HISTORIA', 'Sección devuelta para corrección', 'Lopez CAR: HC-2026-009 · datos paciente. Abra la historia para revisar los detalles.', 9, 'datos-paciente', 1, '2026-11-08 15:50:21'),
(17, 'DOCENTE', 1, 'SECCION_REVISION', 'Sección lista para revisión', 'Pomodoro ASD envió «datos paciente» de HC-2026-009 a revisión.', 9, 'datos-paciente', 1, '2026-11-08 15:50:40'),
(18, 'DOCENTE', 1, 'SECCION_REVISION', 'Sección lista para revisión', 'Pomodoro ASD envió «datos paciente» de HC-2026-009 a revisión.', 9, 'datos-paciente', 1, '2026-11-08 15:50:51'),
(19, 'ALUMNO', 2, 'ESTADO_HISTORIA', 'Sección clínica validada', 'Lopez CAR: HC-2026-009 · datos paciente. Abra la historia para revisar los detalles.', 9, 'datos-paciente', 1, '2026-11-08 15:51:11'),
(20, 'ALUMNO', 2, 'ESTADO_HISTORIA', 'Sección devuelta para corrección', 'Lopez CAR: HC-2026-009 · datos paciente. Abra la historia para revisar los detalles.', 9, 'datos-paciente', 1, '2026-11-08 15:51:24'),
(21, 'DOCENTE', 1, 'SECCION_REVISION', 'Sección lista para revisión', 'Pomodoro ASD envió «datos paciente» de HC-2026-009 a revisión.', 9, 'datos-paciente', 1, '2026-11-08 15:51:31'),
(22, 'ALUMNO', 2, 'ESTADO_HISTORIA', 'Sección clínica validada', 'Lopez CAR: HC-2026-009 · datos paciente. Abra la historia para revisar los detalles.', 9, 'datos-paciente', 1, '2026-11-08 15:51:43'),
(23, 'ALUMNO', 2, 'ESTADO_HISTORIA', 'Sección devuelta para corrección', 'Lopez CAR: HC-2026-009 · datos paciente. Abra la historia para revisar los detalles.', 9, 'datos-paciente', 1, '2026-11-08 15:51:45'),
(24, 'ALUMNO', 2, 'ESTADO_HISTORIA', 'Sección clínica validada', 'Lopez CAR: HC-2026-009 · datos paciente. Abra la historia para revisar los detalles.', 9, 'datos-paciente', 1, '2026-11-08 15:51:47'),
(25, 'ALUMNO', 2, 'ESTADO_HISTORIA', 'Sección devuelta para corrección', 'Lopez CAR: HC-2026-009 · datos paciente. Abra la historia para revisar los detalles.', 9, 'datos-paciente', 1, '2026-11-08 15:51:50'),
(26, 'ALUMNO', 2, 'HISTORIA_ASIGNADA', 'Historia clínica asignada', 'Lopez CAR le asignó la historia HC-2026-010.', 10, NULL, 1, '2026-11-08 15:53:00'),
(27, 'DOCENTE', 3, 'SECCION_REVISION', 'Sección lista para revisión', 'Pomodoro ASD envió «datos paciente» de HC-2026-010 a revisión.', 10, 'datos-paciente', 1, '2026-11-08 15:53:36'),
(28, 'ALUMNO', 2, 'ESTADO_HISTORIA', 'Sección clínica validada', 'Lopez CAR: HC-2026-010 · datos paciente. Abra la historia para revisar los detalles.', 10, 'datos-paciente', 1, '2026-11-08 15:53:59'),
(29, 'ALUMNO', 2, 'ESTADO_HISTORIA', 'Sección devuelta para corrección', 'Lopez CAR: HC-2026-010 · datos paciente. Abra la historia para revisar los detalles.', 10, 'datos-paciente', 1, '2026-11-08 15:54:20'),
(30, 'ALUMNO', 2, 'ESTADO_HISTORIA', 'Sección clínica validada', 'Lopez CAR: HC-2026-010 · datos paciente. Abra la historia para revisar los detalles.', 10, 'datos-paciente', 1, '2026-11-08 15:54:26'),
(31, 'ALUMNO', 2, 'ESTADO_HISTORIA', 'Sección devuelta para corrección', 'Lopez CAR: HC-2026-010 · datos paciente. Abra la historia para revisar los detalles.', 10, 'datos-paciente', 1, '2026-11-08 15:54:29'),
(32, 'DOCENTE', 3, 'SECCION_REVISION', 'Sección lista para revisión', 'Pomodoro ASD envió «datos paciente» de HC-2026-010 a revisión.', 10, 'datos-paciente', 1, '2026-11-08 15:55:05'),
(33, 'ALUMNO', 2, 'ESTADO_HISTORIA', 'Sección clínica validada', 'Lopez CAR: HC-2026-009 · datos paciente. Abra la historia para revisar los detalles.', 9, 'datos-paciente', 1, '2026-11-08 15:55:56'),
(34, 'ALUMNO', 2, 'ESTADO_HISTORIA', 'Sección clínica validada', 'Lopez CAR: HC-2026-009 · examen clinico. Abra la historia para revisar los detalles.', 9, 'examen-clinico', 1, '2026-11-08 15:56:03'),
(35, 'ALUMNO', 2, 'ESTADO_HISTORIA', 'Sección clínica validada', 'Lopez CAR: HC-2026-009 · examen extraoral. Abra la historia para revisar los detalles.', 9, 'examen-extraoral', 1, '2026-11-08 15:56:07'),
(36, 'ALUMNO', 2, 'ESTADO_HISTORIA', 'Sección clínica validada', 'Lopez CAR: HC-2026-009 · examen intraoral. Abra la historia para revisar los detalles.', 9, 'examen-intraoral', 1, '2026-11-08 15:56:09'),
(37, 'ALUMNO', 2, 'ESTADO_HISTORIA', 'Sección clínica validada', 'Lopez CAR: HC-2026-009 · odontograma. Abra la historia para revisar los detalles.', 9, 'odontograma', 1, '2026-11-08 15:56:12'),
(38, 'ALUMNO', 2, 'ESTADO_HISTORIA', 'Sección clínica validada', 'Lopez CAR: HC-2026-009 · oclusion. Abra la historia para revisar los detalles.', 9, 'oclusion', 1, '2026-11-08 15:56:14'),
(39, 'ALUMNO', 2, 'ESTADO_HISTORIA', 'Sección clínica validada', 'Lopez CAR: HC-2026-009 · examenes auxiliares. Abra la historia para revisar los detalles.', 9, 'examenes-auxiliares', 1, '2026-11-08 15:56:17'),
(40, 'ALUMNO', 2, 'ESTADO_HISTORIA', 'Sección clínica validada', 'Lopez CAR: HC-2026-009 · modelos. Abra la historia para revisar los detalles.', 9, 'modelos', 1, '2026-11-08 15:56:23'),
(41, 'ALUMNO', 2, 'ESTADO_HISTORIA', 'Sección devuelta para corrección', 'Administrador del Sistema: HC-2026-009 · datos paciente. Abra la historia para revisar los detalles.', 9, 'datos-paciente', 1, '2026-11-08 15:56:36'),
(42, 'DOCENTE', 3, 'SECCION_REVISION', 'Sección lista para revisión', 'Pomodoro ASD envió «datos paciente» de HC-2026-010 a revisión.', 10, 'datos-paciente', 1, '2026-11-08 15:58:51'),
(43, 'ALUMNO', 2, 'ESTADO_HISTORIA', 'Sección clínica validada', 'Lopez CAR: HC-2026-010 · datos paciente. Abra la historia para revisar los detalles.', 10, 'datos-paciente', 1, '2026-11-08 15:59:08'),
(44, 'ALUMNO', 2, 'ESTADO_HISTORIA', 'Sección devuelta para corrección', 'Lopez CAR: HC-2026-010 · datos paciente. Abra la historia para revisar los detalles.', 10, 'datos-paciente', 1, '2026-11-08 15:59:09'),
(45, 'ALUMNO', 2, 'ESTADO_HISTORIA', 'Sección clínica validada', 'Lopez CAR: HC-2026-010 · datos paciente. Abra la historia para revisar los detalles.', 10, 'datos-paciente', 1, '2026-11-08 15:59:11'),
(46, 'ALUMNO', 2, 'ESTADO_HISTORIA', 'Sección devuelta para corrección', 'Lopez CAR: HC-2026-010 · datos paciente. Abra la historia para revisar los detalles.', 10, 'datos-paciente', 1, '2026-11-08 15:59:12'),
(47, 'ALUMNO', 2, 'ESTADO_HISTORIA', 'Sección clínica validada', 'Lopez CAR: HC-2026-010 · datos paciente. Abra la historia para revisar los detalles.', 10, 'datos-paciente', 1, '2026-11-08 15:59:15'),
(48, 'ALUMNO', 2, 'ESTADO_HISTORIA', 'Sección devuelta para corrección', 'Lopez CAR: HC-2026-010 · datos paciente. Abra la historia para revisar los detalles.', 10, 'datos-paciente', 1, '2026-11-08 15:59:16'),
(49, 'ALUMNO', 2, 'ESTADO_HISTORIA', 'Sección clínica validada', 'Lopez CAR: HC-2026-010 · datos paciente. Abra la historia para revisar los detalles.', 10, 'datos-paciente', 1, '2026-11-08 15:59:17'),
(50, 'ALUMNO', 2, 'ESTADO_HISTORIA', 'Sección devuelta para corrección', 'Lopez CAR: HC-2026-010 · datos paciente. Abra la historia para revisar los detalles.', 10, 'datos-paciente', 1, '2026-11-08 15:59:17'),
(51, 'ALUMNO', 2, 'ESTADO_HISTORIA', 'Sección clínica validada', 'Lopez CAR: HC-2026-010 · datos paciente. Abra la historia para revisar los detalles.', 10, 'datos-paciente', 1, '2026-11-08 15:59:18'),
(52, 'ALUMNO', 2, 'ESTADO_HISTORIA', 'Sección devuelta para corrección', 'Lopez CAR: HC-2026-010 · datos paciente. Abra la historia para revisar los detalles.', 10, 'datos-paciente', 1, '2026-11-08 15:59:19'),
(53, 'ALUMNO', 2, 'ESTADO_HISTORIA', 'Sección clínica validada', 'Lopez CAR: HC-2026-010 · datos paciente. Abra la historia para revisar los detalles.', 10, 'datos-paciente', 1, '2026-11-08 15:59:55'),
(54, 'ALUMNO', 2, 'ESTADO_HISTORIA', 'Sección devuelta para corrección', 'Lopez CAR: HC-2026-010 · datos paciente. Abra la historia para revisar los detalles.', 10, 'datos-paciente', 1, '2026-11-08 15:59:56'),
(55, 'ALUMNO', 2, 'ESTADO_HISTORIA', 'Sección clínica validada', 'Administrador del Sistema: HC-2026-009 · datos paciente. Abra la historia para revisar los detalles.', 9, 'datos-paciente', 1, '2026-11-08 16:01:12'),
(56, 'ALUMNO', 2, 'ESTADO_HISTORIA', 'Sección clínica validada', 'Lopez CAR: HC-2026-010 · datos paciente. Abra la historia para revisar los detalles.', 10, 'datos-paciente', 1, '2026-11-08 16:01:22'),
(57, 'ALUMNO', 2, 'ESTADO_HISTORIA', 'Sección devuelta para corrección', 'Lopez CAR: HC-2026-010 · datos paciente. Abra la historia para revisar los detalles.', 10, 'datos-paciente', 1, '2026-11-08 16:02:00'),
(58, 'ALUMNO', 2, 'ESTADO_HISTORIA', 'Sección clínica validada', 'Lopez CAR: HC-2026-010 · datos paciente. Abra la historia para revisar los detalles.', 10, 'datos-paciente', 1, '2026-11-08 16:02:01'),
(59, 'ALUMNO', 1, 'HISTORIA_ASIGNADA', 'Historia clínica asignada', 'Lopez CAR le asignó la historia HC-2026-010.', 10, NULL, 0, '2026-11-08 16:02:15'),
(60, 'ALUMNO', 2, 'ASIGNACION_RETIRADA', 'Cambio de responsable de historia clínica', 'Lopez CAR cambió al responsable de la historia HC-2026-010. Usted ya no está asignado como asistente responsable.', 10, NULL, 1, '2026-11-08 16:02:15'),
(61, 'DOCENTE', 1, 'ESTADO_HISTORIA', 'Historia clínica lista para revisión', 'Pomodoro ASD: HC-2026-009. Abra la historia para revisar los detalles.', 9, NULL, 1, '2026-11-08 16:02:31'),
(62, 'DOCENTE', 1, 'ESTADO_HISTORIA', 'Historia clínica lista para revisión', 'Pomodoro ASD: HC-2026-009. Abra la historia para revisar los detalles.', 9, NULL, 1, '2026-11-08 16:02:33'),
(63, 'DOCENTE', 1, 'ESTADO_HISTORIA', 'Historia clínica lista para revisión', 'Pomodoro ASD: HC-2026-009. Abra la historia para revisar los detalles.', 9, NULL, 1, '2026-11-08 16:02:34'),
(64, 'DOCENTE', 1, 'ESTADO_HISTORIA', 'Historia clínica lista para revisión', 'Pomodoro ASD: HC-2026-009. Abra la historia para revisar los detalles.', 9, NULL, 1, '2026-11-08 16:02:36'),
(65, 'DOCENTE', 1, 'ESTADO_HISTORIA', 'Historia clínica lista para revisión', 'Pomodoro ASD: HC-2026-009. Abra la historia para revisar los detalles.', 9, NULL, 1, '2026-11-08 16:02:48'),
(66, 'DOCENTE', 1, 'ESTADO_HISTORIA', 'Historia clínica lista para revisión', 'Pomodoro ASD: HC-2026-009. Abra la historia para revisar los detalles.', 9, NULL, 1, '2026-11-08 16:02:54'),
(67, 'ALUMNO', 2, 'HISTORIA_ASIGNADA', 'Historia clínica asignada', 'Lopez CAR le asignó la historia HC-2026-010.', 10, NULL, 1, '2026-11-08 16:06:32'),
(68, 'ALUMNO', 1, 'ASIGNACION_RETIRADA', 'Cambio de responsable de historia clínica', 'Lopez CAR cambió al responsable de la historia HC-2026-010. Usted ya no está asignado como asistente responsable.', 10, NULL, 0, '2026-11-08 16:06:32'),
(69, 'ALUMNO', 2, 'ESTADO_HISTORIA', 'Historia clínica con observaciones', 'Administrador del Sistema: HC-2026-009. Abra la historia para revisar los detalles.', 9, NULL, 1, '2026-11-08 16:08:56'),
(70, 'ALUMNO', 2, 'ESTADO_HISTORIA', 'Sección devuelta para corrección', 'Administrador del Sistema: HC-2026-009 · datos paciente. Abra la historia para revisar los detalles.', 9, 'datos-paciente', 1, '2026-11-08 16:10:17'),
(71, 'ALUMNO', 2, 'ESTADO_HISTORIA', 'Sección clínica validada', 'Lopez CAR: HC-2026-010 · datos paciente. Abra la historia para revisar los detalles.', 10, 'datos-paciente', 1, '2026-11-08 21:26:00'),
(72, 'ALUMNO', 2, 'ESTADO_HISTORIA', 'Sección devuelta para corrección', 'Lopez CAR: HC-2026-010 · datos paciente. Abra la historia para revisar los detalles.', 10, 'datos-paciente', 1, '2026-11-08 21:28:34');

-- --------------------------------------------------------

--
-- Table structure for table `odontograma`
--

CREATE TABLE `odontograma` (
  `id_odontograma` bigint UNSIGNED NOT NULL,
  `id_historia_clinica` bigint UNSIGNED NOT NULL,
  `id_docente_responsable` bigint UNSIGNED DEFAULT NULL,
  `tipo_denticion` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PERMANENTE',
  `fecha_evaluacion` date NOT NULL,
  `motivo_evaluacion` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `numero_cop` varchar(8) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `especificaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `registro_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `estado` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'BORRADOR',
  `cerrado_en` datetime DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `odontograma_hallazgo`
--

CREATE TABLE `odontograma_hallazgo` (
  `id_odontograma_hallazgo` bigint UNSIGNED NOT NULL,
  `id_odontograma` bigint UNSIGNED NOT NULL,
  `id_hallazgo_dental` bigint UNSIGNED NOT NULL,
  `id_odontograma_superficie` bigint UNSIGNED DEFAULT NULL,
  `clasificacion` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `condicion` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `representacion` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ESQUEMATICA',
  `trazo` json DEFAULT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `activo` tinyint(1) NOT NULL DEFAULT '1',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `odontograma_hallazgo_pieza`
--

CREATE TABLE `odontograma_hallazgo_pieza` (
  `id_odontograma_hallazgo_pieza` bigint UNSIGNED NOT NULL,
  `id_odontograma_hallazgo` bigint UNSIGNED NOT NULL,
  `id_odontograma_pieza` bigint UNSIGNED NOT NULL,
  `orden` smallint UNSIGNED NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `odontograma_pieza`
--

CREATE TABLE `odontograma_pieza` (
  `id_odontograma_pieza` bigint UNSIGNED NOT NULL,
  `id_odontograma` bigint UNSIGNED NOT NULL,
  `id_pieza_dental` bigint UNSIGNED NOT NULL,
  `movilidad` decimal(4,2) DEFAULT NULL,
  `perdida` tinyint(1) NOT NULL DEFAULT '0',
  `observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `odontograma_superficie`
--

CREATE TABLE `odontograma_superficie` (
  `id_odontograma_superficie` bigint UNSIGNED NOT NULL,
  `id_odontograma_pieza` bigint UNSIGNED NOT NULL,
  `superficie` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `paciente`
--

CREATE TABLE `paciente` (
  `id_paciente` bigint UNSIGNED NOT NULL,
  `tipo_documento` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'DNI',
  `numero_documento` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombres` varchar(180) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `apellidos` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `sexo` char(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lugar_nacimiento` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `correo` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ocupacion` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `procedencia` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado_civil` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `grado_instruccion` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `centro_estudios` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `idioma_materno` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `religion` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lugar_trabajo` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tiempo_residencia` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `modalidad_asistencia` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `departamento` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `provincia` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `distrito` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion_alternativa` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono_adicional` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `estado_atencion` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Registrado',
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `eliminado_en` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `paciente`
--

INSERT INTO `paciente` (`id_paciente`, `tipo_documento`, `numero_documento`, `nombres`, `apellidos`, `fecha_nacimiento`, `sexo`, `lugar_nacimiento`, `telefono`, `correo`, `direccion`, `ocupacion`, `procedencia`, `estado_civil`, `grado_instruccion`, `centro_estudios`, `idioma_materno`, `religion`, `lugar_trabajo`, `tiempo_residencia`, `modalidad_asistencia`, `departamento`, `provincia`, `distrito`, `direccion_alternativa`, `telefono_adicional`, `observaciones`, `estado_atencion`, `estado`, `creado_en`, `actualizado_en`, `eliminado_en`) VALUES
(1, 'DNI', '78451526', 'Carlos', 'Ricardo Rodrigues', '2002-05-01', 'M', NULL, '985956923', 'carlos@gmail.com', 'ASD', 'Estidiante', NULL, 'Soltero', 'Superior técnica', 'asd', 'asd', 'asdsad', 'asd', NULL, 'acompanado', NULL, NULL, NULL, 'asd', 'asd', 'ASD', 'Validada', 1, '2026-11-08 13:43:58', '2026-11-08 14:17:47', NULL),
(2, 'DNI', '78451525', 'Carlos', 'Ricardo Rodrigues', '2010-05-01', 'M', NULL, '985956923', 'carlos@gmail.com', 'asdasd', NULL, 'asdasd', NULL, NULL, NULL, NULL, NULL, NULL, '12', 'acompanado', 'La Libertad', 'Santiago de Chuco', 'Santiago de Chuco', NULL, NULL, NULL, 'Validada', 1, '2026-11-08 13:59:20', '2026-11-08 15:43:22', NULL),
(3, 'DNI', '56598995', 'Mari', 'Canchanya Chambergo', '1998-12-04', 'F', NULL, '985965956', NULL, NULL, 'asdasdasdasdasd', NULL, NULL, NULL, 'asdasdasdasd', 'asdasdasdasd', 'asdasdasdasdasd', 'asdasdasdasdasdasdasdasd', NULL, 'acompanado', NULL, NULL, NULL, 'asdasdasd', 'asdasdasdasd', NULL, 'Borrador', 1, '2026-11-08 14:36:02', '2026-11-08 21:33:16', NULL),
(4, 'DNI', '78451523', 'Carlos', 'Ricardo Chambergo', '2012-05-01', 'M', NULL, '985956923', NULL, 'asdasdasd', 'asdasdasd', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'asdasdasd', 'Borrador', 1, '2026-11-08 21:34:17', '2026-11-08 21:36:27', NULL),
(5, 'DNI', '15489562', 'Carla', 'Romo Cardenas', '2002-05-08', 'F', NULL, '925952952', 'casd@gmail.com', 'asdasd', 'aasdasd', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Borrador', 1, '2026-11-08 23:14:11', '2026-11-08 23:14:15', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `paciente_contacto`
--

CREATE TABLE `paciente_contacto` (
  `id_paciente_contacto` bigint UNSIGNED NOT NULL,
  `id_paciente` bigint UNSIGNED NOT NULL,
  `tipo_contacto` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'OTRO',
  `nombre` varchar(180) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `informante` varchar(180) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `parentesco` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `numero_documento` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ocupacion` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` varchar(250) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `confiabilidad` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `es_principal` tinyint(1) NOT NULL DEFAULT '0',
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `paciente_familiar`
--

CREATE TABLE `paciente_familiar` (
  `id_paciente_familiar` bigint UNSIGNED NOT NULL,
  `id_paciente` bigint UNSIGNED NOT NULL,
  `parentesco` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(180) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `numero_documento` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ocupacion` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `parche_aplicado`
--

CREATE TABLE `parche_aplicado` (
  `nombre` varchar(190) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `aplicado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `perdida_dental`
--

CREATE TABLE `perdida_dental` (
  `id_perdida_dental` bigint UNSIGNED NOT NULL,
  `id_historia_clinica` bigint UNSIGNED NOT NULL,
  `id_pieza_dental` bigint UNSIGNED NOT NULL,
  `fecha_perdida` date DEFAULT NULL,
  `motivo` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `periodo_academico`
--

CREATE TABLE `periodo_academico` (
  `id_periodo_academico` bigint UNSIGNED NOT NULL,
  `codigo` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `anio` smallint UNSIGNED NOT NULL,
  `semestre` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `periodo_academico`
--

INSERT INTO `periodo_academico` (`id_periodo_academico`, `codigo`, `nombre`, `anio`, `semestre`, `fecha_inicio`, `fecha_fin`, `estado`, `creado_en`, `actualizado_en`) VALUES
(1, '2026-II', 'Periodo 2026-II', 2026, 'II', '2026-08-01', '2026-12-15', 1, '2026-11-08 13:44:07', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `pieza_dental`
--

CREATE TABLE `pieza_dental` (
  `id_pieza_dental` bigint UNSIGNED NOT NULL,
  `codigo_fdi` varchar(4) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `denticion` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `cuadrante` tinyint UNSIGNED NOT NULL,
  `tipo_pieza` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_pieza` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `orden_visual` smallint UNSIGNED NOT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `pieza_dental`
--

INSERT INTO `pieza_dental` (`id_pieza_dental`, `codigo_fdi`, `denticion`, `cuadrante`, `tipo_pieza`, `nombre_pieza`, `orden_visual`, `estado`) VALUES
(1, '18', 'PERMANENTE', 1, 'Tercer molar', 'Pieza 18 - Tercer molar', 1, 1),
(2, '17', 'PERMANENTE', 1, 'Segundo molar', 'Pieza 17 - Segundo molar', 2, 1),
(3, '16', 'PERMANENTE', 1, 'Primer molar', 'Pieza 16 - Primer molar', 3, 1),
(4, '15', 'PERMANENTE', 1, 'Segundo premolar', 'Pieza 15 - Segundo premolar', 4, 1),
(5, '14', 'PERMANENTE', 1, 'Primer premolar', 'Pieza 14 - Primer premolar', 5, 1),
(6, '13', 'PERMANENTE', 1, 'Canino', 'Pieza 13 - Canino', 6, 1),
(7, '12', 'PERMANENTE', 1, 'Incisivo lateral', 'Pieza 12 - Incisivo lateral', 7, 1),
(8, '11', 'PERMANENTE', 1, 'Incisivo central', 'Pieza 11 - Incisivo central', 8, 1),
(9, '21', 'PERMANENTE', 2, 'Incisivo central', 'Pieza 21 - Incisivo central', 9, 1),
(10, '22', 'PERMANENTE', 2, 'Incisivo lateral', 'Pieza 22 - Incisivo lateral', 10, 1),
(11, '23', 'PERMANENTE', 2, 'Canino', 'Pieza 23 - Canino', 11, 1),
(12, '24', 'PERMANENTE', 2, 'Primer premolar', 'Pieza 24 - Primer premolar', 12, 1),
(13, '25', 'PERMANENTE', 2, 'Segundo premolar', 'Pieza 25 - Segundo premolar', 13, 1),
(14, '26', 'PERMANENTE', 2, 'Primer molar', 'Pieza 26 - Primer molar', 14, 1),
(15, '27', 'PERMANENTE', 2, 'Segundo molar', 'Pieza 27 - Segundo molar', 15, 1),
(16, '28', 'PERMANENTE', 2, 'Tercer molar', 'Pieza 28 - Tercer molar', 16, 1),
(17, '48', 'PERMANENTE', 4, 'Tercer molar', 'Pieza 48 - Tercer molar', 17, 1),
(18, '47', 'PERMANENTE', 4, 'Segundo molar', 'Pieza 47 - Segundo molar', 18, 1),
(19, '46', 'PERMANENTE', 4, 'Primer molar', 'Pieza 46 - Primer molar', 19, 1),
(20, '45', 'PERMANENTE', 4, 'Segundo premolar', 'Pieza 45 - Segundo premolar', 20, 1),
(21, '44', 'PERMANENTE', 4, 'Primer premolar', 'Pieza 44 - Primer premolar', 21, 1),
(22, '43', 'PERMANENTE', 4, 'Canino', 'Pieza 43 - Canino', 22, 1),
(23, '42', 'PERMANENTE', 4, 'Incisivo lateral', 'Pieza 42 - Incisivo lateral', 23, 1),
(24, '41', 'PERMANENTE', 4, 'Incisivo central', 'Pieza 41 - Incisivo central', 24, 1),
(25, '31', 'PERMANENTE', 3, 'Incisivo central', 'Pieza 31 - Incisivo central', 25, 1),
(26, '32', 'PERMANENTE', 3, 'Incisivo lateral', 'Pieza 32 - Incisivo lateral', 26, 1),
(27, '33', 'PERMANENTE', 3, 'Canino', 'Pieza 33 - Canino', 27, 1),
(28, '34', 'PERMANENTE', 3, 'Primer premolar', 'Pieza 34 - Primer premolar', 28, 1),
(29, '35', 'PERMANENTE', 3, 'Segundo premolar', 'Pieza 35 - Segundo premolar', 29, 1),
(30, '36', 'PERMANENTE', 3, 'Primer molar', 'Pieza 36 - Primer molar', 30, 1),
(31, '37', 'PERMANENTE', 3, 'Segundo molar', 'Pieza 37 - Segundo molar', 31, 1),
(32, '38', 'PERMANENTE', 3, 'Tercer molar', 'Pieza 38 - Tercer molar', 32, 1),
(33, '55', 'TEMPORAL', 5, 'Segundo molar temporal', 'Pieza 55 - Segundo molar temporal', 33, 1),
(34, '54', 'TEMPORAL', 5, 'Primer molar temporal', 'Pieza 54 - Primer molar temporal', 34, 1),
(35, '53', 'TEMPORAL', 5, 'Canino temporal', 'Pieza 53 - Canino temporal', 35, 1),
(36, '52', 'TEMPORAL', 5, 'Incisivo lateral temporal', 'Pieza 52 - Incisivo lateral temporal', 36, 1),
(37, '51', 'TEMPORAL', 5, 'Incisivo central temporal', 'Pieza 51 - Incisivo central temporal', 37, 1),
(38, '61', 'TEMPORAL', 6, 'Incisivo central temporal', 'Pieza 61 - Incisivo central temporal', 38, 1),
(39, '62', 'TEMPORAL', 6, 'Incisivo lateral temporal', 'Pieza 62 - Incisivo lateral temporal', 39, 1),
(40, '63', 'TEMPORAL', 6, 'Canino temporal', 'Pieza 63 - Canino temporal', 40, 1),
(41, '64', 'TEMPORAL', 6, 'Primer molar temporal', 'Pieza 64 - Primer molar temporal', 41, 1),
(42, '65', 'TEMPORAL', 6, 'Segundo molar temporal', 'Pieza 65 - Segundo molar temporal', 42, 1),
(43, '85', 'TEMPORAL', 8, 'Segundo molar temporal', 'Pieza 85 - Segundo molar temporal', 43, 1),
(44, '84', 'TEMPORAL', 8, 'Primer molar temporal', 'Pieza 84 - Primer molar temporal', 44, 1),
(45, '83', 'TEMPORAL', 8, 'Canino temporal', 'Pieza 83 - Canino temporal', 45, 1),
(46, '82', 'TEMPORAL', 8, 'Incisivo lateral temporal', 'Pieza 82 - Incisivo lateral temporal', 46, 1),
(47, '81', 'TEMPORAL', 8, 'Incisivo central temporal', 'Pieza 81 - Incisivo central temporal', 47, 1),
(48, '71', 'TEMPORAL', 7, 'Incisivo central temporal', 'Pieza 71 - Incisivo central temporal', 48, 1),
(49, '72', 'TEMPORAL', 7, 'Incisivo lateral temporal', 'Pieza 72 - Incisivo lateral temporal', 49, 1),
(50, '73', 'TEMPORAL', 7, 'Canino temporal', 'Pieza 73 - Canino temporal', 50, 1),
(51, '74', 'TEMPORAL', 7, 'Primer molar temporal', 'Pieza 74 - Primer molar temporal', 51, 1),
(52, '75', 'TEMPORAL', 7, 'Segundo molar temporal', 'Pieza 75 - Segundo molar temporal', 52, 1);

-- --------------------------------------------------------

--
-- Table structure for table `plan_quirurgico`
--

CREATE TABLE `plan_quirurgico` (
  `id_plan_quirurgico` bigint UNSIGNED NOT NULL,
  `id_historia_clinica` bigint UNSIGNED NOT NULL,
  `procedimiento` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `diagnostico_preoperatorio` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `indicacion_quirurgica` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `estado` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'BORRADOR',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `plan_quirurgico`
--

INSERT INTO `plan_quirurgico` (`id_plan_quirurgico`, `id_historia_clinica`, `procedimiento`, `diagnostico_preoperatorio`, `indicacion_quirurgica`, `estado`, `creado_en`, `actualizado_en`) VALUES
(1, 1, 'Plan quirúrgico', NULL, NULL, 'BORRADOR', '2026-11-08 13:44:55', NULL),
(2, 2, 'Control clínico', NULL, NULL, 'BORRADOR', '2026-11-08 13:53:15', NULL),
(3, 3, 'Plan quirúrgico', NULL, NULL, 'BORRADOR', '2026-11-08 14:00:27', NULL),
(4, 4, 'Plan quirúrgico', NULL, NULL, 'BORRADOR', '2026-11-08 14:20:05', NULL),
(5, 6, 'Plan quirúrgico', NULL, NULL, 'BORRADOR', '2026-11-08 14:36:18', NULL),
(6, 8, 'Plan quirúrgico', NULL, NULL, 'BORRADOR', '2026-11-08 15:43:47', NULL),
(7, 9, 'Plan quirúrgico', NULL, NULL, 'BORRADOR', '2026-11-08 15:49:48', NULL),
(8, 10, 'Plan quirúrgico', NULL, NULL, 'BORRADOR', '2026-11-08 15:53:23', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `plan_tratamiento`
--

CREATE TABLE `plan_tratamiento` (
  `id_plan_tratamiento` bigint UNSIGNED NOT NULL,
  `id_historia_clinica` bigint UNSIGNED NOT NULL,
  `tipo_plan` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'INTEGRAL',
  `descripcion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `estado` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'BORRADOR',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `plan_tratamiento`
--

INSERT INTO `plan_tratamiento` (`id_plan_tratamiento`, `id_historia_clinica`, `tipo_plan`, `descripcion`, `estado`, `creado_en`, `actualizado_en`) VALUES
(17, 2, 'INTEGRAL', NULL, 'BORRADOR', '2026-11-08 13:54:04', NULL),
(28, 3, 'INTEGRAL', NULL, 'BORRADOR', '2026-11-08 14:09:44', NULL),
(30, 1, 'INTEGRAL', NULL, 'BORRADOR', '2026-11-08 14:17:19', NULL),
(37, 4, 'INTEGRAL', NULL, 'BORRADOR', '2026-11-08 14:27:57', NULL),
(52, 6, 'INTEGRAL', NULL, 'BORRADOR', '2026-11-08 14:38:00', NULL),
(60, 8, 'INTEGRAL', NULL, 'BORRADOR', '2026-11-08 15:47:47', NULL),
(135, 9, 'INTEGRAL', NULL, 'BORRADOR', '2026-11-08 16:11:19', NULL),
(138, 10, 'INTEGRAL', NULL, 'BORRADOR', '2026-11-08 21:28:36', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `plan_tratamiento_item`
--

CREATE TABLE `plan_tratamiento_item` (
  `id_plan_tratamiento_item` bigint UNSIGNED NOT NULL,
  `id_fase_tratamiento` bigint UNSIGNED NOT NULL,
  `id_tratamiento_dental` bigint UNSIGNED DEFAULT NULL,
  `id_pieza_dental` bigint UNSIGNED DEFAULT NULL,
  `pieza_region` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `superficie` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `descripcion_procedimiento` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `prioridad` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Pendiente',
  `observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `orden` smallint UNSIGNED NOT NULL DEFAULT '0',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pregunta_salud`
--

CREATE TABLE `pregunta_salud` (
  `id_pregunta` bigint UNSIGNED NOT NULL,
  `numero` smallint UNSIGNED NOT NULL,
  `pregunta` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `orden` smallint UNSIGNED NOT NULL,
  `requiere_detalle` tinyint(1) NOT NULL DEFAULT '1',
  `requiere_detalle_adicional` tinyint(1) NOT NULL DEFAULT '0',
  `estado` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `pregunta_salud`
--

INSERT INTO `pregunta_salud` (`id_pregunta`, `numero`, `pregunta`, `orden`, `requiere_detalle`, `requiere_detalle_adicional`, `estado`) VALUES
(1, 1, '¿Fue atendido por un médico últimamente?', 1, 1, 1, 1),
(2, 2, '¿Ha tenido Ud. un problema de tipo cardiaco?', 2, 1, 0, 1),
(3, 3, '¿Ha tenido Ud. un problema de tipo renal?', 3, 1, 0, 1),
(4, 4, '¿Ha tenido Ud. un problema de tipo pulmonar?', 4, 1, 0, 1),
(5, 5, '¿Ha tenido Ud. un problema de tipo gástrico?', 5, 1, 0, 1),
(6, 6, '¿Ha tenido Ud. alguna alteración del SNC?', 6, 1, 0, 1),
(7, 7, '¿Ha tenido Ud. un problema de tipo digestivo?', 7, 1, 0, 1),
(8, 8, '¿Ha tenido Ud. un problema en el sistema hepático (Hepatitis)?', 8, 1, 0, 1),
(9, 9, '¿Ha tenido Ud. un problema de hipertensión?', 9, 1, 0, 1),
(10, 10, '¿Ha tenido Ud. alguna vez una enfermedad venérea?', 10, 1, 0, 1),
(11, 11, '¿Ha tenido Ud. un trastorno de tipo tiroideo?', 11, 1, 0, 1),
(12, 12, '¿Ha tenido Ud. alguna vez pápulas o hipersensibilidades?', 12, 1, 0, 1),
(13, 13, '¿Es Ud. alérgico a la penicilina?', 13, 1, 0, 1),
(14, 14, '¿Es Ud. alérgico a otro tipo de medicamento?', 14, 1, 0, 1),
(15, 15, '¿Ha sido internado alguna vez en un hospital?', 15, 1, 0, 1),
(16, 16, '¿Le han realizado alguna vez transfusión sanguínea?', 16, 1, 0, 1),
(17, 17, '¿Ud. tiene algún problema con las articulaciones óseas?', 17, 1, 0, 1),
(18, 18, '¿Ud. tiene algún problema hematológico?', 18, 1, 0, 1),
(19, 19, '¿Ha sufrido algún tipo de desmayo o convulsiones?', 19, 1, 0, 1),
(20, 20, '¿Ud. sufre o tiene diabetes?', 20, 1, 0, 1),
(21, 21, 'Si tiene Ud. diabetes, ¿está compensado?', 21, 1, 0, 1),
(22, 22, '¿Ud. tiene o presentó algún problema en la piel?', 22, 1, 0, 1),
(23, 23, '¿Tiene o presenta un proceso infeccioso o respiratorio?', 23, 1, 0, 1),
(24, 24, '¿Tiene o presenta una dificultad para respirar?', 24, 1, 0, 1);

-- --------------------------------------------------------

--
-- Table structure for table `prescripcion`
--

CREATE TABLE `prescripcion` (
  `id_prescripcion` bigint UNSIGNED NOT NULL,
  `id_reporte_operatorio` bigint UNSIGNED NOT NULL,
  `medicamento` varchar(180) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dosis` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `via` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `frecuencia` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `duracion` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `indicaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `resumen` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `programacion_cirugia`
--

CREATE TABLE `programacion_cirugia` (
  `id_programacion_cirugia` bigint UNSIGNED NOT NULL,
  `id_plan_quirurgico` bigint UNSIGNED NOT NULL,
  `fecha` date NOT NULL,
  `hora` time DEFAULT NULL,
  `observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `estado` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PROGRAMADA',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pronostico_clinico`
--

CREATE TABLE `pronostico_clinico` (
  `id_pronostico_clinico` bigint UNSIGNED NOT NULL,
  `id_historia_clinica` bigint UNSIGNED NOT NULL,
  `pronostico` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `justificacion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `pronostico_libre` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `protesis`
--

CREATE TABLE `protesis` (
  `id_protesis` bigint UNSIGNED NOT NULL,
  `id_historia_clinica` bigint UNSIGNED NOT NULL,
  `tipo_protesis` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `confeccionada_por` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `fecha_colocacion` date DEFAULT NULL,
  `estado` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `reporte_operatorio`
--

CREATE TABLE `reporte_operatorio` (
  `id_reporte_operatorio` bigint UNSIGNED NOT NULL,
  `id_plan_quirurgico` bigint UNSIGNED NOT NULL,
  `id_docente_responsable` bigint UNSIGNED DEFAULT NULL,
  `id_alumno_operador` bigint UNSIGNED DEFAULT NULL,
  `fecha` date NOT NULL,
  `asistente` varchar(180) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lugar` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `caso_clinico` varchar(180) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo_anestesia` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tecnica_anestesia` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `procedimiento_realizado` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `pronostico` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `hallazgos` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `tecnica_quirurgica` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `complicaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `hora_inicio` time DEFAULT NULL,
  `hora_termino` time DEFAULT NULL,
  `observaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `id_archivo_firma_docente` bigint UNSIGNED DEFAULT NULL,
  `id_archivo_firma_alumno` bigint UNSIGNED DEFAULT NULL,
  `estado` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'BORRADOR',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `reporte_operatorio`
--

INSERT INTO `reporte_operatorio` (`id_reporte_operatorio`, `id_plan_quirurgico`, `id_docente_responsable`, `id_alumno_operador`, `fecha`, `asistente`, `lugar`, `caso_clinico`, `tipo_anestesia`, `tecnica_anestesia`, `procedimiento_realizado`, `pronostico`, `hallazgos`, `tecnica_quirurgica`, `complicaciones`, `hora_inicio`, `hora_termino`, `observaciones`, `id_archivo_firma_docente`, `id_archivo_firma_alumno`, `estado`, `creado_en`, `actualizado_en`) VALUES
(1, 1, NULL, NULL, '2026-11-08', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'BORRADOR', '2026-11-08 13:44:55', NULL),
(2, 2, NULL, NULL, '2026-11-08', NULL, NULL, NULL, NULL, NULL, 'Control clínico', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'BORRADOR', '2026-11-08 13:53:15', NULL),
(3, 3, NULL, NULL, '2026-11-08', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'BORRADOR', '2026-11-08 14:00:27', NULL),
(4, 4, NULL, NULL, '2026-11-08', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'BORRADOR', '2026-11-08 14:20:05', NULL),
(5, 5, NULL, NULL, '2026-11-08', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'BORRADOR', '2026-11-08 14:36:18', NULL),
(6, 6, NULL, NULL, '2026-11-08', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'BORRADOR', '2026-11-08 15:43:47', NULL),
(7, 7, NULL, NULL, '2026-11-08', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'BORRADOR', '2026-11-08 15:49:48', NULL),
(8, 8, NULL, NULL, '2026-11-08', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'BORRADOR', '2026-11-08 15:53:23', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `respuesta_salud`
--

CREATE TABLE `respuesta_salud` (
  `id_respuesta_salud` bigint UNSIGNED NOT NULL,
  `id_historia_clinica` bigint UNSIGNED NOT NULL,
  `id_pregunta` bigint UNSIGNED NOT NULL,
  `respuesta` tinyint(1) NOT NULL,
  `detalle` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `detalle_adicional` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rol`
--

CREATE TABLE `rol` (
  `id_rol` bigint UNSIGNED NOT NULL,
  `codigo_rol` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_rol` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_usuario` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'ALUMNO o DOCENTE; filtra los roles disponibles al crear una cuenta',
  `descripcion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `rol`
--

INSERT INTO `rol` (`id_rol`, `codigo_rol`, `nombre_rol`, `tipo_usuario`, `descripcion`, `estado`, `creado_en`, `actualizado_en`) VALUES
(1, 'ADMINISTRADOR', 'Administrador', 'DOCENTE', 'Administración integral del sistema; asignable únicamente a cuentas de docente.', 1, '2026-10-15 22:23:00', '2026-10-16 10:42:48'),
(2, 'DOCENTE', 'Docente', 'DOCENTE', 'Docente de la clínica odontológica.', 1, '2026-10-15 22:23:00', '2026-10-16 10:42:48'),
(3, 'ALUMNO', 'Alumno', 'ALUMNO', 'Alumno de pregrado de la clínica odontológica.', 1, '2026-10-15 22:23:00', '2026-10-16 10:42:48');

-- --------------------------------------------------------

--
-- Table structure for table `rol_submodulo`
--

CREATE TABLE `rol_submodulo` (
  `id_rol_submodulo` bigint UNSIGNED NOT NULL,
  `id_rol` bigint UNSIGNED NOT NULL,
  `id_submodulo` bigint UNSIGNED NOT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `rol_submodulo`
--

INSERT INTO `rol_submodulo` (`id_rol_submodulo`, `id_rol`, `id_submodulo`, `estado`, `creado_en`, `actualizado_en`) VALUES
(1, 1, 1, 1, '2026-10-15 22:23:00', NULL),
(2, 1, 2, 1, '2026-10-15 22:23:00', NULL),
(3, 1, 3, 1, '2026-10-15 22:23:00', NULL),
(4, 1, 4, 1, '2026-10-15 22:23:00', NULL),
(5, 1, 5, 1, '2026-10-15 22:23:00', NULL),
(6, 1, 6, 1, '2026-10-15 22:23:00', NULL),
(7, 1, 7, 1, '2026-10-15 22:23:00', NULL),
(8, 1, 8, 1, '2026-10-15 22:23:00', NULL),
(9, 1, 9, 1, '2026-10-15 22:23:00', NULL),
(10, 1, 10, 1, '2026-10-15 22:23:00', NULL),
(11, 1, 11, 1, '2026-10-15 22:23:00', NULL),
(12, 1, 12, 1, '2026-10-15 22:23:00', NULL),
(13, 1, 13, 1, '2026-10-15 22:23:00', NULL),
(14, 1, 14, 1, '2026-10-15 22:23:00', NULL),
(15, 1, 15, 1, '2026-10-15 22:23:00', NULL),
(16, 1, 16, 1, '2026-10-15 22:23:00', NULL),
(17, 1, 17, 1, '2026-10-15 22:23:00', NULL),
(18, 1, 18, 1, '2026-10-15 22:23:00', NULL),
(19, 1, 19, 1, '2026-10-15 22:23:00', NULL),
(20, 1, 20, 1, '2026-10-15 22:23:00', NULL),
(21, 1, 21, 1, '2026-10-15 22:23:00', NULL),
(32, 2, 1, 1, '2026-10-15 22:23:00', NULL),
(33, 2, 2, 1, '2026-10-15 22:23:00', NULL),
(34, 2, 3, 1, '2026-10-15 22:23:00', NULL),
(35, 2, 4, 1, '2026-10-15 22:23:00', NULL),
(36, 2, 5, 1, '2026-10-15 22:23:00', NULL),
(37, 2, 6, 1, '2026-10-15 22:23:00', NULL),
(38, 2, 7, 1, '2026-10-15 22:23:00', NULL),
(39, 2, 8, 1, '2026-10-15 22:23:00', NULL),
(40, 2, 9, 1, '2026-10-15 22:23:00', NULL),
(41, 2, 10, 1, '2026-10-15 22:23:00', NULL),
(42, 2, 11, 1, '2026-10-15 22:23:00', NULL),
(43, 2, 12, 1, '2026-10-15 22:23:00', NULL),
(44, 2, 13, 1, '2026-10-15 22:23:00', NULL),
(45, 2, 14, 1, '2026-10-15 22:23:00', NULL),
(46, 2, 15, 1, '2026-10-15 22:23:00', NULL),
(47, 2, 18, 1, '2026-10-15 22:23:00', NULL),
(48, 3, 1, 1, '2026-10-15 22:23:00', NULL),
(49, 3, 2, 1, '2026-10-15 22:23:00', NULL),
(50, 3, 3, 1, '2026-10-15 22:23:00', NULL),
(51, 3, 4, 1, '2026-10-15 22:23:00', NULL),
(52, 3, 5, 1, '2026-10-15 22:23:00', NULL),
(53, 3, 6, 1, '2026-10-15 22:23:00', NULL),
(54, 3, 7, 1, '2026-10-15 22:23:00', NULL),
(55, 3, 8, 1, '2026-10-15 22:23:00', NULL),
(56, 3, 9, 1, '2026-10-15 22:23:00', NULL),
(57, 3, 10, 1, '2026-10-15 22:23:00', NULL),
(58, 3, 11, 1, '2026-10-15 22:23:00', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `rotacion`
--

CREATE TABLE `rotacion` (
  `id_rotacion` bigint UNSIGNED NOT NULL,
  `id_grupo` bigint UNSIGNED NOT NULL,
  `id_curso` bigint UNSIGNED NOT NULL,
  `id_periodo_academico` bigint UNSIGNED NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `estado` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PROGRAMADA',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rotacion_alumno`
--

CREATE TABLE `rotacion_alumno` (
  `id_rotacion_alumno` bigint UNSIGNED NOT NULL,
  `id_rotacion` bigint UNSIGNED NOT NULL,
  `id_alumno` bigint UNSIGNED NOT NULL,
  `tipo_asignacion` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'EXCEPCIONAL',
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `rotacion_docente`
--

CREATE TABLE `rotacion_docente` (
  `id_rotacion_docente` bigint UNSIGNED NOT NULL,
  `id_rotacion` bigint UNSIGNED NOT NULL,
  `id_docente` bigint UNSIGNED NOT NULL,
  `funcion` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'COLABORADOR',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `seguimiento_quirurgico`
--

CREATE TABLE `seguimiento_quirurgico` (
  `id_seguimiento_quirurgico` bigint UNSIGNED NOT NULL,
  `id_reporte_operatorio` bigint UNSIGNED NOT NULL,
  `numero_control` smallint UNSIGNED NOT NULL,
  `fecha` date NOT NULL,
  `hora` time DEFAULT NULL,
  `procedimiento` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `evolucion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `indicaciones` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `estado` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PROGRAMADO',
  `id_docente` bigint UNSIGNED DEFAULT NULL,
  `id_alumno` bigint UNSIGNED DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `seguimiento_quirurgico`
--

INSERT INTO `seguimiento_quirurgico` (`id_seguimiento_quirurgico`, `id_reporte_operatorio`, `numero_control`, `fecha`, `hora`, `procedimiento`, `evolucion`, `indicaciones`, `estado`, `id_docente`, `id_alumno`, `creado_en`) VALUES
(2, 2, 1, '2026-11-08', NULL, 'Control clínico', NULL, NULL, 'REALIZADO', NULL, NULL, '2026-11-08 13:54:04');

-- --------------------------------------------------------

--
-- Table structure for table `signo_vital_operatorio`
--

CREATE TABLE `signo_vital_operatorio` (
  `id_signo_vital_operatorio` bigint UNSIGNED NOT NULL,
  `id_reporte_operatorio` bigint UNSIGNED NOT NULL,
  `momento` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `presion_arterial` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `temperatura` decimal(5,2) DEFAULT NULL,
  `frecuencia_respiratoria` decimal(6,2) DEFAULT NULL,
  `frecuencia_cardiaca` decimal(6,2) DEFAULT NULL,
  `pulso` decimal(6,2) DEFAULT NULL,
  `saturacion_oxigeno` decimal(5,2) DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `signo_vital_operatorio`
--

INSERT INTO `signo_vital_operatorio` (`id_signo_vital_operatorio`, `id_reporte_operatorio`, `momento`, `presion_arterial`, `temperatura`, `frecuencia_respiratoria`, `frecuencia_cardiaca`, `pulso`, `saturacion_oxigeno`, `creado_en`) VALUES
(49, 2, 'PRE', NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 13:54:04'),
(50, 2, 'INTRA', NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 13:54:04'),
(51, 2, 'POST', NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 13:54:04'),
(82, 3, 'PRE', NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 14:09:44'),
(83, 3, 'INTRA', NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 14:09:44'),
(84, 3, 'POST', NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 14:09:44'),
(88, 1, 'PRE', NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 14:17:19'),
(89, 1, 'INTRA', NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 14:17:19'),
(90, 1, 'POST', NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 14:17:19'),
(109, 4, 'PRE', NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 14:27:57'),
(110, 4, 'INTRA', NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 14:27:57'),
(111, 4, 'POST', NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 14:27:57'),
(154, 5, 'PRE', NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 14:38:00'),
(155, 5, 'INTRA', NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 14:38:00'),
(156, 5, 'POST', NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 14:38:00'),
(178, 6, 'PRE', NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 15:47:47'),
(179, 6, 'INTRA', NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 15:47:47'),
(180, 6, 'POST', NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 15:47:47'),
(403, 7, 'PRE', NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 16:11:19'),
(404, 7, 'INTRA', NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 16:11:19'),
(405, 7, 'POST', NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 16:11:19'),
(412, 8, 'PRE', NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 21:28:36'),
(413, 8, 'INTRA', NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 21:28:36'),
(414, 8, 'POST', NULL, NULL, NULL, NULL, NULL, NULL, '2026-11-08 21:28:36');

-- --------------------------------------------------------

--
-- Table structure for table `submodulo`
--

CREATE TABLE `submodulo` (
  `id_submodulo` bigint UNSIGNED NOT NULL,
  `id_modulo` bigint UNSIGNED NOT NULL,
  `codigo_submodulo` varchar(80) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `nombre_submodulo` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ruta` varchar(180) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `orden` int NOT NULL DEFAULT '0',
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `submodulo`
--

INSERT INTO `submodulo` (`id_submodulo`, `id_modulo`, `codigo_submodulo`, `nombre_submodulo`, `descripcion`, `ruta`, `orden`, `estado`, `creado_en`, `actualizado_en`) VALUES
(1, 1, 'TABLERO', 'Tablero', NULL, '/inicio', 1, 1, '2026-10-15 22:23:00', NULL),
(2, 2, 'PACIENTES', 'Pacientes', NULL, '/pacientes', 1, 1, '2026-10-15 22:23:00', NULL),
(3, 3, 'HISTORIAS', 'Historias clínicas', NULL, '/historias', 1, 1, '2026-10-15 22:23:00', '2026-10-16 10:42:48'),
(4, 3, 'EXAMEN_CLINICO', 'Examen clínico', NULL, '/historias/examen-clinico', 2, 1, '2026-10-15 22:23:00', '2026-10-16 10:42:48'),
(5, 3, 'ODONTOGRAMA', 'Odontograma', NULL, '/historias/odontograma', 3, 1, '2026-10-15 22:23:00', NULL),
(6, 3, 'EXAMENES_AUXILIARES', 'Exámenes auxiliares', NULL, '/historias/examenes-auxiliares', 4, 1, '2026-10-15 22:23:00', '2026-10-16 10:42:48'),
(7, 3, 'DIAGNOSTICO_TRATAMIENTO', 'Diagnóstico y tratamiento', NULL, '/historias/diagnostico-tratamiento', 5, 1, '2026-10-15 22:23:00', '2026-10-16 10:42:48'),
(8, 4, 'CONSENTIMIENTO', 'Consentimiento informado', NULL, '/cirugia/consentimiento', 1, 1, '2026-10-15 22:23:00', NULL),
(9, 4, 'PROGRAMACION', 'Programación de cirugía', NULL, '/cirugia/programacion', 2, 1, '2026-10-15 22:23:00', '2026-10-16 10:42:48'),
(10, 4, 'REPORTE_OPERATORIO', 'Reporte operatorio', NULL, '/cirugia/reporte-operatorio', 3, 1, '2026-10-15 22:23:00', NULL),
(11, 4, 'SEGUIMIENTO', 'Seguimiento quirúrgico', NULL, '/cirugia/seguimiento', 4, 1, '2026-10-15 22:23:00', '2026-10-16 10:42:48'),
(12, 5, 'CURSOS', 'Cursos', NULL, '/academico/cursos', 1, 1, '2026-10-15 22:23:00', NULL),
(13, 5, 'PERIODOS', 'Periodos académicos', NULL, '/academico/periodos', 2, 1, '2026-10-15 22:23:00', '2026-10-16 10:42:48'),
(14, 5, 'GRUPOS', 'Grupos académicos', NULL, '/academico/grupos', 3, 1, '2026-10-15 22:23:00', '2026-10-16 10:42:48'),
(15, 5, 'ROTACIONES', 'Rotaciones', NULL, '/academico/rotaciones', 4, 1, '2026-10-15 22:23:00', NULL),
(16, 6, 'USUARIOS', 'Usuarios', NULL, '/administracion/usuarios', 1, 1, '2026-10-15 22:23:00', NULL),
(17, 6, 'ROLES', 'Roles y accesos', NULL, '/administracion/roles', 2, 1, '2026-10-15 22:23:00', NULL),
(18, 7, 'EXPORTAR_PDF', 'Exportar PDF', NULL, '/reportes/exportar', 1, 1, '2026-10-15 22:23:00', NULL),
(19, 8, 'PARAMETROS', 'Parámetros', NULL, '/configuracion/parametros', 1, 1, '2026-10-15 22:23:00', '2026-10-16 10:42:48'),
(20, 8, 'CATALOGOS_CLINICOS', 'Catálogos clínicos', NULL, '/configuracion/catalogos', 2, 1, '2026-10-15 22:23:00', '2026-10-16 10:42:48'),
(21, 9, 'BITACORA', 'Bitácora', NULL, '/auditoria/bitacora', 1, 1, '2026-10-15 22:23:00', '2026-10-16 10:42:48');

-- --------------------------------------------------------

--
-- Table structure for table `usuario_alumno`
--

CREATE TABLE `usuario_alumno` (
  `id_usuario_alumno` bigint UNSIGNED NOT NULL,
  `id_alumno` bigint UNSIGNED NOT NULL,
  `id_rol` bigint UNSIGNED NOT NULL,
  `nombre_usuario` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `contrasena_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  `ultimo_inicio_sesion` datetime DEFAULT NULL,
  `contrasena_cambiada_en` datetime DEFAULT NULL,
  `intentos_fallidos` smallint UNSIGNED NOT NULL DEFAULT '0',
  `bloqueado_hasta` datetime DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `usuario_alumno`
--

INSERT INTO `usuario_alumno` (`id_usuario_alumno`, `id_alumno`, `id_rol`, `nombre_usuario`, `contrasena_hash`, `estado`, `ultimo_inicio_sesion`, `contrasena_cambiada_en`, `intentos_fallidos`, `bloqueado_hasta`, `creado_en`, `actualizado_en`) VALUES
(1, 1, 3, 'lopez8@gmail.com', '$2y$12$RS/7AEwvWZRDv527imdkOusYZgy81URPGQz9dT0uSdD3dy.uHMm4a', 1, '2026-11-08 14:19:03', '2026-11-08 13:57:53', 0, NULL, '2026-11-08 13:57:53', '2026-11-08 14:19:03'),
(2, 2, 3, 'pomodoro@gmail.com', '$2y$12$9KotSS/08XP8EaE/zs8k7e3JPIwSaQUfk4/bxCFKjKtVzgbLuUSXi', 1, '2026-11-08 21:27:49', '2026-11-08 14:30:25', 0, NULL, '2026-11-08 14:30:25', '2026-11-08 21:27:49');

--
-- Triggers `usuario_alumno`
--
DELIMITER $$
CREATE TRIGGER `trg_usuario_alumno_bi` BEFORE INSERT ON `usuario_alumno` FOR EACH ROW BEGIN
  IF NOT EXISTS (SELECT 1 FROM rol WHERE id_rol = NEW.id_rol AND tipo_usuario = 'ALUMNO' AND estado = 1) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El rol seleccionado no corresponde a un usuario alumno o se encuentra inactivo.';
  END IF;
  IF EXISTS (SELECT 1 FROM usuario_docente WHERE nombre_usuario = NEW.nombre_usuario) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El nombre de usuario ya existe en usuario_docente.';
  END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_usuario_alumno_bu` BEFORE UPDATE ON `usuario_alumno` FOR EACH ROW BEGIN
  IF NOT EXISTS (SELECT 1 FROM rol WHERE id_rol = NEW.id_rol AND tipo_usuario = 'ALUMNO' AND estado = 1) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El rol seleccionado no corresponde a un usuario alumno o se encuentra inactivo.';
  END IF;
  IF EXISTS (SELECT 1 FROM usuario_docente WHERE nombre_usuario = NEW.nombre_usuario) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El nombre de usuario ya existe en usuario_docente.';
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `usuario_alumno_submodulo`
--

CREATE TABLE `usuario_alumno_submodulo` (
  `id_usuario_alumno_submodulo` bigint UNSIGNED NOT NULL,
  `id_usuario_alumno` bigint UNSIGNED NOT NULL,
  `id_submodulo` bigint UNSIGNED NOT NULL,
  `permitido` tinyint(1) NOT NULL DEFAULT '1',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `usuario_docente`
--

CREATE TABLE `usuario_docente` (
  `id_usuario_docente` bigint UNSIGNED NOT NULL,
  `id_docente` bigint UNSIGNED NOT NULL,
  `id_rol` bigint UNSIGNED NOT NULL,
  `nombre_usuario` varchar(120) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `contrasena_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `estado` tinyint(1) NOT NULL DEFAULT '1',
  `ultimo_inicio_sesion` datetime DEFAULT NULL,
  `contrasena_cambiada_en` datetime DEFAULT NULL,
  `intentos_fallidos` smallint UNSIGNED NOT NULL DEFAULT '0',
  `bloqueado_hasta` datetime DEFAULT NULL,
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` datetime DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `usuario_docente`
--

INSERT INTO `usuario_docente` (`id_usuario_docente`, `id_docente`, `id_rol`, `nombre_usuario`, `contrasena_hash`, `estado`, `ultimo_inicio_sesion`, `contrasena_cambiada_en`, `intentos_fallidos`, `bloqueado_hasta`, `creado_en`, `actualizado_en`) VALUES
(1, 1, 1, 'SUPER-@dmin', '$2y$12$07QuEhULozTyAmKpDkuoEegofrZBGHtPrmKmeo7wFfNBs11P0eq.K', 1, '2026-11-08 21:24:43', '2026-11-08 13:34:22', 0, NULL, '2026-11-08 13:34:22', '2026-11-08 21:24:43'),
(2, 2, 2, 'juan@gmail.com', '$2y$12$gJsfU48acj78YEjd9QEvcumnz06Fvgq7RjCjKH14mATQOSx57MYLi', 1, '2026-11-08 13:52:25', '2026-11-08 13:51:08', 0, NULL, '2026-11-08 13:51:08', '2026-11-08 13:52:25'),
(3, 3, 2, 'lopez@gmail.com', '$2y$12$9NvPf5QWcP8Jcdjuu6VkueW2oYGZmBUUU2nlkXjQadlOf9dPSNBDS', 1, '2026-11-08 21:25:22', '2026-11-08 13:56:52', 0, NULL, '2026-11-08 13:56:52', '2026-11-08 21:25:22');

--
-- Triggers `usuario_docente`
--
DELIMITER $$
CREATE TRIGGER `trg_usuario_docente_bi` BEFORE INSERT ON `usuario_docente` FOR EACH ROW BEGIN
  IF NOT EXISTS (SELECT 1 FROM rol WHERE id_rol = NEW.id_rol AND tipo_usuario = 'DOCENTE' AND estado = 1) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El rol seleccionado no corresponde a un usuario docente o se encuentra inactivo.';
  END IF;
  IF EXISTS (SELECT 1 FROM usuario_alumno WHERE nombre_usuario = NEW.nombre_usuario) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El nombre de usuario ya existe en usuario_alumno.';
  END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_usuario_docente_bu` BEFORE UPDATE ON `usuario_docente` FOR EACH ROW BEGIN
  IF NOT EXISTS (SELECT 1 FROM rol WHERE id_rol = NEW.id_rol AND tipo_usuario = 'DOCENTE' AND estado = 1) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El rol seleccionado no corresponde a un usuario docente o se encuentra inactivo.';
  END IF;
  IF EXISTS (SELECT 1 FROM usuario_alumno WHERE nombre_usuario = NEW.nombre_usuario) THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El nombre de usuario ya existe en usuario_alumno.';
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `usuario_docente_submodulo`
--

CREATE TABLE `usuario_docente_submodulo` (
  `id_usuario_docente_submodulo` bigint UNSIGNED NOT NULL,
  `id_usuario_docente` bigint UNSIGNED NOT NULL,
  `id_submodulo` bigint UNSIGNED NOT NULL,
  `permitido` tinyint(1) NOT NULL DEFAULT '1',
  `creado_en` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Stand-in structure for view `vista_accesos_rol`
-- (See below for the actual view)
--
CREATE TABLE `vista_accesos_rol` (
`id_rol` bigint unsigned
,`codigo_rol` varchar(50)
,`nombre_rol` varchar(100)
,`tipo_usuario` varchar(20)
,`id_modulo` bigint unsigned
,`codigo_modulo` varchar(60)
,`nombre_modulo` varchar(120)
,`id_submodulo` bigint unsigned
,`codigo_submodulo` varchar(80)
,`nombre_submodulo` varchar(120)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `vista_historia_resumen`
-- (See below for the actual view)
--
CREATE TABLE `vista_historia_resumen` (
`id_historia_clinica` bigint unsigned
,`numero_historia` varchar(30)
,`id_paciente` bigint unsigned
,`id_periodo_academico` bigint unsigned
,`periodo_academico` varchar(30)
,`anio` smallint unsigned
,`semestre` varchar(20)
,`id_estado_historia` smallint unsigned
,`codigo_estado` varchar(40)
,`estado_actual` varchar(60)
,`fecha_apertura` date
,`fecha_cierre` date
,`creado_en` datetime
,`actualizado_en` datetime
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `vista_usuarios_sistema`
-- (See below for the actual view)
--
CREATE TABLE `vista_usuarios_sistema` (
`id_usuario` bigint unsigned
,`tipo_usuario` varchar(7)
,`id_actor` bigint unsigned
,`nombre_completo` varchar(221)
,`tipo_documento` varchar(20)
,`numero_documento` varchar(20)
,`nombre_usuario` varchar(120)
,`id_rol` bigint unsigned
,`codigo_rol` varchar(50)
,`nombre_rol` varchar(100)
,`estado` tinyint
,`ultimo_inicio_sesion` datetime
,`bloqueado_hasta` datetime
);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `alta_clinica`
--
ALTER TABLE `alta_clinica`
  ADD PRIMARY KEY (`id_alta_clinica`),
  ADD UNIQUE KEY `uq_alta_reporte` (`id_reporte_operatorio`);

--
-- Indexes for table `alumno`
--
ALTER TABLE `alumno`
  ADD PRIMARY KEY (`id_alumno`),
  ADD UNIQUE KEY `uq_alumno_codigo` (`codigo_alumno`),
  ADD UNIQUE KEY `uq_alumno_documento` (`tipo_documento`,`numero_documento`),
  ADD KEY `idx_alumno_nombre` (`apellidos`,`nombres`);

--
-- Indexes for table `alumno_periodo`
--
ALTER TABLE `alumno_periodo`
  ADD PRIMARY KEY (`id_alumno_periodo`),
  ADD UNIQUE KEY `uq_alumno_periodo` (`id_alumno`,`id_periodo_academico`),
  ADD KEY `idx_alumno_periodo_periodo` (`id_periodo_academico`,`estado`);

--
-- Indexes for table `anamnesis`
--
ALTER TABLE `anamnesis`
  ADD PRIMARY KEY (`id_anamnesis`),
  ADD UNIQUE KEY `uq_anamnesis_historia` (`id_historia_clinica`);

--
-- Indexes for table `anamnesis_estado_psicologico`
--
ALTER TABLE `anamnesis_estado_psicologico`
  ADD PRIMARY KEY (`id_anamnesis_estado`),
  ADD UNIQUE KEY `uq_anamnesis_estado` (`id_anamnesis`,`estado`);

--
-- Indexes for table `antecedente`
--
ALTER TABLE `antecedente`
  ADD PRIMARY KEY (`id_antecedente`),
  ADD KEY `idx_antecedente_historia_tipo` (`id_historia_clinica`,`tipo_antecedente`);

--
-- Indexes for table `antecedente_anestesia`
--
ALTER TABLE `antecedente_anestesia`
  ADD PRIMARY KEY (`id_antecedente_anestesia`),
  ADD KEY `idx_antecedente_anestesia_historia` (`id_historia_clinica`);

--
-- Indexes for table `antecedente_exodoncia`
--
ALTER TABLE `antecedente_exodoncia`
  ADD PRIMARY KEY (`id_antecedente_exodoncia`),
  ADD KEY `idx_antecedente_exodoncia_historia` (`id_historia_clinica`),
  ADD KEY `fk_antecedente_exodoncia_pieza` (`id_pieza_dental`);

--
-- Indexes for table `antecedente_familiar`
--
ALTER TABLE `antecedente_familiar`
  ADD PRIMARY KEY (`id_antecedente_familiar`),
  ADD UNIQUE KEY `uq_antecedente_familiar` (`id_historia_clinica`,`parentesco`);

--
-- Indexes for table `antecedente_fisiologico`
--
ALTER TABLE `antecedente_fisiologico`
  ADD PRIMARY KEY (`id_antecedente_fisiologico`),
  ADD UNIQUE KEY `uq_antecedente_fisiologico_historia` (`id_historia_clinica`);

--
-- Indexes for table `antecedente_habito_nocivo`
--
ALTER TABLE `antecedente_habito_nocivo`
  ADD PRIMARY KEY (`id_antecedente_habito`),
  ADD UNIQUE KEY `uq_antecedente_habito` (`id_antecedente_personal`,`tipo_habito`);

--
-- Indexes for table `antecedente_personal`
--
ALTER TABLE `antecedente_personal`
  ADD PRIMARY KEY (`id_antecedente_personal`),
  ADD UNIQUE KEY `uq_antecedente_personal_historia` (`id_historia_clinica`);

--
-- Indexes for table `antecedente_terapeutico`
--
ALTER TABLE `antecedente_terapeutico`
  ADD PRIMARY KEY (`id_antecedente_terapeutico`),
  ADD UNIQUE KEY `uq_antecedente_terapeutico_historia` (`id_historia_clinica`);

--
-- Indexes for table `archivo_clinico`
--
ALTER TABLE `archivo_clinico`
  ADD PRIMARY KEY (`id_archivo`),
  ADD KEY `idx_archivo_historia_categoria` (`id_historia_clinica`,`categoria`,`estado`),
  ADD KEY `idx_archivo_campo` (`id_historia_clinica`,`seccion`,`clave_campo`,`estado`);

--
-- Indexes for table `auditoria`
--
ALTER TABLE `auditoria`
  ADD PRIMARY KEY (`id_auditoria`),
  ADD KEY `idx_auditoria_tabla_registro` (`tabla_afectada`,`id_registro`),
  ADD KEY `idx_auditoria_usuario_fecha` (`tipo_usuario`,`id_usuario`,`creado_en`),
  ADD KEY `idx_auditoria_fecha` (`creado_en`);

--
-- Indexes for table `catalogo_hallazgo_dental`
--
ALTER TABLE `catalogo_hallazgo_dental`
  ADD PRIMARY KEY (`id_hallazgo_dental`),
  ADD UNIQUE KEY `uq_hallazgo_codigo` (`codigo`);

--
-- Indexes for table `catalogo_tratamiento_dental`
--
ALTER TABLE `catalogo_tratamiento_dental`
  ADD PRIMARY KEY (`id_tratamiento_dental`),
  ADD UNIQUE KEY `uq_tratamiento_codigo` (`codigo`);

--
-- Indexes for table `configuracion_sistema`
--
ALTER TABLE `configuracion_sistema`
  ADD PRIMARY KEY (`id_configuracion`),
  ADD UNIQUE KEY `uq_configuracion_clave` (`clave`);

--
-- Indexes for table `consentimiento_clausula`
--
ALTER TABLE `consentimiento_clausula`
  ADD PRIMARY KEY (`id_consentimiento_clausula`),
  ADD UNIQUE KEY `uq_consentimiento_clausula` (`id_consentimiento`,`numero`);

--
-- Indexes for table `consentimiento_informado`
--
ALTER TABLE `consentimiento_informado`
  ADD PRIMARY KEY (`id_consentimiento`),
  ADD UNIQUE KEY `uq_consentimiento_version` (`id_historia_clinica`,`version_documento`),
  ADD KEY `fk_consentimiento_docente` (`id_docente_informante`);

--
-- Indexes for table `curso`
--
ALTER TABLE `curso`
  ADD PRIMARY KEY (`id_curso`),
  ADD UNIQUE KEY `uq_curso_codigo` (`codigo`);

--
-- Indexes for table `diagnostico`
--
ALTER TABLE `diagnostico`
  ADD PRIMARY KEY (`id_diagnostico`),
  ADD UNIQUE KEY `uq_diagnostico_version` (`id_historia_clinica`,`tipo_diagnostico`,`numero_version`,`codigo`),
  ADD KEY `idx_diagnostico_historia_actual` (`id_historia_clinica`,`es_actual`);

--
-- Indexes for table `docente`
--
ALTER TABLE `docente`
  ADD PRIMARY KEY (`id_docente`),
  ADD UNIQUE KEY `uq_docente_codigo` (`codigo_docente`),
  ADD UNIQUE KEY `uq_docente_documento` (`tipo_documento`,`numero_documento`),
  ADD UNIQUE KEY `uq_docente_colegiatura` (`numero_colegiatura`),
  ADD KEY `idx_docente_nombre` (`apellidos`,`nombres`);

--
-- Indexes for table `epicrisis`
--
ALTER TABLE `epicrisis`
  ADD PRIMARY KEY (`id_epicrisis`),
  ADD UNIQUE KEY `uq_epicrisis_reporte` (`id_reporte_operatorio`);

--
-- Indexes for table `estado_historia_clinica`
--
ALTER TABLE `estado_historia_clinica`
  ADD PRIMARY KEY (`id_estado_historia`),
  ADD UNIQUE KEY `uq_estado_historia_codigo` (`codigo`),
  ADD UNIQUE KEY `uq_estado_historia_nombre` (`nombre`),
  ADD KEY `idx_estado_historia_orden` (`estado`,`orden`);

--
-- Indexes for table `estudio_modelo`
--
ALTER TABLE `estudio_modelo`
  ADD PRIMARY KEY (`id_estudio_modelo`),
  ADD UNIQUE KEY `uq_estudio_modelo_historia` (`id_historia_clinica`);

--
-- Indexes for table `etapa_quirurgica`
--
ALTER TABLE `etapa_quirurgica`
  ADD PRIMARY KEY (`id_etapa_quirurgica`),
  ADD UNIQUE KEY `uq_etapa_plan` (`id_plan_quirurgico`,`etapa`);

--
-- Indexes for table `evolucion_clinica`
--
ALTER TABLE `evolucion_clinica`
  ADD PRIMARY KEY (`id_evolucion_clinica`),
  ADD UNIQUE KEY `uq_evolucion_historia` (`id_historia_clinica`);

--
-- Indexes for table `examen_auxiliar`
--
ALTER TABLE `examen_auxiliar`
  ADD PRIMARY KEY (`id_examen_auxiliar`),
  ADD KEY `idx_examen_auxiliar_historia_tipo` (`id_historia_clinica`,`tipo_examen`),
  ADD KEY `fk_examen_auxiliar_archivo` (`id_archivo`);

--
-- Indexes for table `examen_clinico_general`
--
ALTER TABLE `examen_clinico_general`
  ADD PRIMARY KEY (`id_examen_clinico_general`),
  ADD UNIQUE KEY `uq_examen_general_historia` (`id_historia_clinica`);

--
-- Indexes for table `examen_estomatologico`
--
ALTER TABLE `examen_estomatologico`
  ADD PRIMARY KEY (`id_examen_estomatologico`),
  ADD UNIQUE KEY `uq_examen_estomatologico_estructura` (`id_historia_clinica`,`tipo_examen`,`estructura_anatomica`),
  ADD KEY `idx_examen_estomatologico_historia_tipo` (`id_historia_clinica`,`tipo_examen`);

--
-- Indexes for table `examen_oclusion`
--
ALTER TABLE `examen_oclusion`
  ADD PRIMARY KEY (`id_examen_oclusion`),
  ADD UNIQUE KEY `uq_examen_oclusion_historia` (`id_historia_clinica`);

--
-- Indexes for table `fase_tratamiento`
--
ALTER TABLE `fase_tratamiento`
  ADD PRIMARY KEY (`id_fase_tratamiento`),
  ADD UNIQUE KEY `uq_fase_plan_numero` (`id_plan_tratamiento`,`numero_fase`);

--
-- Indexes for table `firma_consentimiento`
--
ALTER TABLE `firma_consentimiento`
  ADD PRIMARY KEY (`id_firma_consentimiento`),
  ADD KEY `idx_firma_consentimiento` (`id_consentimiento`,`tipo_firmante`),
  ADD KEY `fk_firma_consentimiento_archivo` (`id_archivo`);

--
-- Indexes for table `firma_seguimiento`
--
ALTER TABLE `firma_seguimiento`
  ADD PRIMARY KEY (`id_firma_seguimiento`),
  ADD KEY `idx_firma_seguimiento` (`id_seguimiento_quirurgico`,`tipo_firmante`),
  ADD KEY `fk_firma_seguimiento_docente` (`id_docente`),
  ADD KEY `fk_firma_seguimiento_alumno` (`id_alumno`),
  ADD KEY `fk_firma_seguimiento_archivo` (`id_archivo`);

--
-- Indexes for table `grupo_academico`
--
ALTER TABLE `grupo_academico`
  ADD PRIMARY KEY (`id_grupo`),
  ADD UNIQUE KEY `uq_grupo_codigo` (`codigo`);

--
-- Indexes for table `grupo_miembro`
--
ALTER TABLE `grupo_miembro`
  ADD PRIMARY KEY (`id_grupo_miembro`),
  ADD UNIQUE KEY `uq_grupo_miembro_inicio` (`id_grupo`,`id_alumno`,`fecha_inicio`),
  ADD KEY `idx_grupo_miembro_alumno` (`id_alumno`,`estado`,`fecha_fin`);

--
-- Indexes for table `hallazgo_estomatologico`
--
ALTER TABLE `hallazgo_estomatologico`
  ADD PRIMARY KEY (`id_hallazgo_estomatologico`),
  ADD KEY `idx_hallazgo_estomatologico_examen` (`id_examen_estomatologico`,`estado`);

--
-- Indexes for table `historia_alumno`
--
ALTER TABLE `historia_alumno`
  ADD PRIMARY KEY (`id_historia_alumno`),
  ADD UNIQUE KEY `uq_historia_alumno_inicio` (`id_historia_clinica`,`id_alumno`,`fecha_asignacion`),
  ADD KEY `idx_historia_alumno_alumno` (`id_alumno`,`estado`,`fecha_fin`);

--
-- Indexes for table `historia_clinica`
--
ALTER TABLE `historia_clinica`
  ADD PRIMARY KEY (`id_historia_clinica`),
  ADD UNIQUE KEY `uq_historia_numero` (`numero_historia`),
  ADD KEY `idx_historia_paciente_estado` (`id_paciente`,`id_estado_historia`),
  ADD KEY `idx_historia_periodo_estado` (`id_periodo_academico`,`id_estado_historia`),
  ADD KEY `idx_historia_actualizado` (`actualizado_en`),
  ADD KEY `fk_historia_estado` (`id_estado_historia`);

--
-- Indexes for table `historia_clinica_estado_historial`
--
ALTER TABLE `historia_clinica_estado_historial`
  ADD PRIMARY KEY (`id_historial_estado`),
  ADD KEY `idx_historial_estado_historia_fecha` (`id_historia_clinica`,`fecha_estado`),
  ADD KEY `idx_historial_estado_estado_fecha` (`id_estado_historia`,`fecha_estado`);

--
-- Indexes for table `historia_docente`
--
ALTER TABLE `historia_docente`
  ADD PRIMARY KEY (`id_historia_docente`),
  ADD UNIQUE KEY `uq_historia_docente_inicio` (`id_historia_clinica`,`id_docente`,`fecha_asignacion`),
  ADD KEY `idx_historia_docente_docente` (`id_docente`,`estado`,`fecha_fin`),
  ADD KEY `idx_historia_docente_historia` (`id_historia_clinica`,`estado`,`tipo_participacion`);

--
-- Indexes for table `historia_seccion_estado`
--
ALTER TABLE `historia_seccion_estado`
  ADD PRIMARY KEY (`id_historia_seccion_estado`),
  ADD UNIQUE KEY `uq_historia_seccion` (`id_historia_clinica`,`codigo_seccion`),
  ADD KEY `idx_seccion_estado` (`codigo_seccion`,`estado`);

--
-- Indexes for table `login_historial_alumno`
--
ALTER TABLE `login_historial_alumno`
  ADD PRIMARY KEY (`id_login_alumno`),
  ADD KEY `idx_login_alumno_usuario_fecha` (`id_usuario_alumno`,`creado_en`),
  ADD KEY `idx_login_alumno_nombre_fecha` (`nombre_usuario`,`creado_en`),
  ADD KEY `idx_login_alumno_fecha` (`creado_en`);

--
-- Indexes for table `login_historial_docente`
--
ALTER TABLE `login_historial_docente`
  ADD PRIMARY KEY (`id_login_docente`),
  ADD KEY `idx_login_docente_usuario_fecha` (`id_usuario_docente`,`creado_en`),
  ADD KEY `idx_login_docente_nombre_fecha` (`nombre_usuario`,`creado_en`),
  ADD KEY `idx_login_docente_fecha` (`creado_en`);

--
-- Indexes for table `modulo`
--
ALTER TABLE `modulo`
  ADD PRIMARY KEY (`id_modulo`),
  ADD UNIQUE KEY `uq_modulo_codigo` (`codigo_modulo`),
  ADD UNIQUE KEY `uq_modulo_nombre` (`nombre_modulo`);

--
-- Indexes for table `notificacion`
--
ALTER TABLE `notificacion`
  ADD PRIMARY KEY (`id_notificacion`),
  ADD KEY `idx_notificacion_destinatario` (`tipo_destinatario`,`id_destinatario`,`leida`,`creado_en`),
  ADD KEY `idx_notificacion_historia` (`id_historia_clinica`);

--
-- Indexes for table `odontograma`
--
ALTER TABLE `odontograma`
  ADD PRIMARY KEY (`id_odontograma`),
  ADD KEY `idx_odontograma_historia_fecha` (`id_historia_clinica`,`fecha_evaluacion`),
  ADD KEY `idx_odontograma_docente` (`id_docente_responsable`);

--
-- Indexes for table `odontograma_hallazgo`
--
ALTER TABLE `odontograma_hallazgo`
  ADD PRIMARY KEY (`id_odontograma_hallazgo`),
  ADD KEY `idx_odontograma_hallazgo_odontograma` (`id_odontograma`,`activo`),
  ADD KEY `idx_odontograma_hallazgo_catalogo` (`id_hallazgo_dental`),
  ADD KEY `fk_odontograma_hallazgo_superficie` (`id_odontograma_superficie`);

--
-- Indexes for table `odontograma_hallazgo_pieza`
--
ALTER TABLE `odontograma_hallazgo_pieza`
  ADD PRIMARY KEY (`id_odontograma_hallazgo_pieza`),
  ADD UNIQUE KEY `uq_hallazgo_pieza` (`id_odontograma_hallazgo`,`id_odontograma_pieza`),
  ADD KEY `fk_hallazgo_pieza_pieza` (`id_odontograma_pieza`);

--
-- Indexes for table `odontograma_pieza`
--
ALTER TABLE `odontograma_pieza`
  ADD PRIMARY KEY (`id_odontograma_pieza`),
  ADD UNIQUE KEY `uq_odontograma_pieza` (`id_odontograma`,`id_pieza_dental`),
  ADD KEY `fk_odontograma_pieza_pieza` (`id_pieza_dental`);

--
-- Indexes for table `odontograma_superficie`
--
ALTER TABLE `odontograma_superficie`
  ADD PRIMARY KEY (`id_odontograma_superficie`),
  ADD UNIQUE KEY `uq_odontograma_superficie` (`id_odontograma_pieza`,`superficie`);

--
-- Indexes for table `paciente`
--
ALTER TABLE `paciente`
  ADD PRIMARY KEY (`id_paciente`),
  ADD UNIQUE KEY `uq_paciente_documento` (`tipo_documento`,`numero_documento`),
  ADD KEY `idx_paciente_nombre` (`apellidos`,`nombres`),
  ADD KEY `idx_paciente_estado_atencion` (`estado_atencion`,`estado`);

--
-- Indexes for table `paciente_contacto`
--
ALTER TABLE `paciente_contacto`
  ADD PRIMARY KEY (`id_paciente_contacto`),
  ADD KEY `idx_contacto_paciente` (`id_paciente`,`estado`);

--
-- Indexes for table `paciente_familiar`
--
ALTER TABLE `paciente_familiar`
  ADD PRIMARY KEY (`id_paciente_familiar`),
  ADD UNIQUE KEY `uq_paciente_familiar` (`id_paciente`,`parentesco`);

--
-- Indexes for table `parche_aplicado`
--
ALTER TABLE `parche_aplicado`
  ADD PRIMARY KEY (`nombre`);

--
-- Indexes for table `perdida_dental`
--
ALTER TABLE `perdida_dental`
  ADD PRIMARY KEY (`id_perdida_dental`),
  ADD KEY `idx_perdida_historia_pieza` (`id_historia_clinica`,`id_pieza_dental`),
  ADD KEY `fk_perdida_pieza` (`id_pieza_dental`);

--
-- Indexes for table `periodo_academico`
--
ALTER TABLE `periodo_academico`
  ADD PRIMARY KEY (`id_periodo_academico`),
  ADD UNIQUE KEY `uq_periodo_codigo` (`codigo`),
  ADD UNIQUE KEY `uq_periodo_anio_semestre` (`anio`,`semestre`);

--
-- Indexes for table `pieza_dental`
--
ALTER TABLE `pieza_dental`
  ADD PRIMARY KEY (`id_pieza_dental`),
  ADD UNIQUE KEY `uq_pieza_fdi` (`codigo_fdi`),
  ADD KEY `idx_pieza_denticion_orden` (`denticion`,`orden_visual`);

--
-- Indexes for table `plan_quirurgico`
--
ALTER TABLE `plan_quirurgico`
  ADD PRIMARY KEY (`id_plan_quirurgico`),
  ADD KEY `idx_plan_quirurgico_historia` (`id_historia_clinica`,`estado`);

--
-- Indexes for table `plan_tratamiento`
--
ALTER TABLE `plan_tratamiento`
  ADD PRIMARY KEY (`id_plan_tratamiento`),
  ADD KEY `idx_plan_historia_estado` (`id_historia_clinica`,`estado`);

--
-- Indexes for table `plan_tratamiento_item`
--
ALTER TABLE `plan_tratamiento_item`
  ADD PRIMARY KEY (`id_plan_tratamiento_item`),
  ADD KEY `idx_plan_item_fase_estado` (`id_fase_tratamiento`,`estado`,`orden`),
  ADD KEY `fk_plan_item_tratamiento` (`id_tratamiento_dental`),
  ADD KEY `fk_plan_item_pieza` (`id_pieza_dental`);

--
-- Indexes for table `pregunta_salud`
--
ALTER TABLE `pregunta_salud`
  ADD PRIMARY KEY (`id_pregunta`),
  ADD UNIQUE KEY `uq_pregunta_numero` (`numero`),
  ADD UNIQUE KEY `uq_pregunta_orden` (`orden`);

--
-- Indexes for table `prescripcion`
--
ALTER TABLE `prescripcion`
  ADD PRIMARY KEY (`id_prescripcion`),
  ADD KEY `idx_prescripcion_reporte` (`id_reporte_operatorio`);

--
-- Indexes for table `programacion_cirugia`
--
ALTER TABLE `programacion_cirugia`
  ADD PRIMARY KEY (`id_programacion_cirugia`),
  ADD KEY `idx_programacion_plan_fecha` (`id_plan_quirurgico`,`fecha`,`estado`);

--
-- Indexes for table `pronostico_clinico`
--
ALTER TABLE `pronostico_clinico`
  ADD PRIMARY KEY (`id_pronostico_clinico`),
  ADD UNIQUE KEY `uq_pronostico_historia` (`id_historia_clinica`);

--
-- Indexes for table `protesis`
--
ALTER TABLE `protesis`
  ADD PRIMARY KEY (`id_protesis`),
  ADD KEY `idx_protesis_historia` (`id_historia_clinica`);

--
-- Indexes for table `reporte_operatorio`
--
ALTER TABLE `reporte_operatorio`
  ADD PRIMARY KEY (`id_reporte_operatorio`),
  ADD KEY `idx_reporte_plan_fecha` (`id_plan_quirurgico`,`fecha`),
  ADD KEY `fk_reporte_docente` (`id_docente_responsable`),
  ADD KEY `fk_reporte_alumno` (`id_alumno_operador`),
  ADD KEY `fk_reporte_firma_docente` (`id_archivo_firma_docente`),
  ADD KEY `fk_reporte_firma_alumno` (`id_archivo_firma_alumno`);

--
-- Indexes for table `respuesta_salud`
--
ALTER TABLE `respuesta_salud`
  ADD PRIMARY KEY (`id_respuesta_salud`),
  ADD UNIQUE KEY `uq_respuesta_historia_pregunta` (`id_historia_clinica`,`id_pregunta`),
  ADD KEY `fk_respuesta_pregunta` (`id_pregunta`);

--
-- Indexes for table `rol`
--
ALTER TABLE `rol`
  ADD PRIMARY KEY (`id_rol`),
  ADD UNIQUE KEY `uq_rol_codigo` (`codigo_rol`),
  ADD UNIQUE KEY `uq_rol_tipo_nombre` (`tipo_usuario`,`nombre_rol`),
  ADD KEY `idx_rol_tipo_estado` (`tipo_usuario`,`estado`);

--
-- Indexes for table `rol_submodulo`
--
ALTER TABLE `rol_submodulo`
  ADD PRIMARY KEY (`id_rol_submodulo`),
  ADD UNIQUE KEY `uq_rol_submodulo` (`id_rol`,`id_submodulo`),
  ADD KEY `idx_rol_submodulo_submodulo` (`id_submodulo`,`estado`);

--
-- Indexes for table `rotacion`
--
ALTER TABLE `rotacion`
  ADD PRIMARY KEY (`id_rotacion`),
  ADD KEY `idx_rotacion_grupo_periodo` (`id_grupo`,`id_periodo_academico`),
  ADD KEY `idx_rotacion_curso_periodo` (`id_curso`,`id_periodo_academico`),
  ADD KEY `fk_rotacion_periodo` (`id_periodo_academico`);

--
-- Indexes for table `rotacion_alumno`
--
ALTER TABLE `rotacion_alumno`
  ADD PRIMARY KEY (`id_rotacion_alumno`),
  ADD UNIQUE KEY `uq_rotacion_alumno` (`id_rotacion`,`id_alumno`),
  ADD KEY `fk_rotacion_alumno_alumno` (`id_alumno`);

--
-- Indexes for table `rotacion_docente`
--
ALTER TABLE `rotacion_docente`
  ADD PRIMARY KEY (`id_rotacion_docente`),
  ADD UNIQUE KEY `uq_rotacion_docente` (`id_rotacion`,`id_docente`),
  ADD KEY `fk_rotacion_docente_docente` (`id_docente`);

--
-- Indexes for table `seguimiento_quirurgico`
--
ALTER TABLE `seguimiento_quirurgico`
  ADD PRIMARY KEY (`id_seguimiento_quirurgico`),
  ADD UNIQUE KEY `uq_seguimiento_reporte_control` (`id_reporte_operatorio`,`numero_control`),
  ADD KEY `fk_seguimiento_docente` (`id_docente`),
  ADD KEY `fk_seguimiento_alumno` (`id_alumno`);

--
-- Indexes for table `signo_vital_operatorio`
--
ALTER TABLE `signo_vital_operatorio`
  ADD PRIMARY KEY (`id_signo_vital_operatorio`),
  ADD UNIQUE KEY `uq_signo_reporte_momento` (`id_reporte_operatorio`,`momento`);

--
-- Indexes for table `submodulo`
--
ALTER TABLE `submodulo`
  ADD PRIMARY KEY (`id_submodulo`),
  ADD UNIQUE KEY `uq_submodulo_modulo_codigo` (`id_modulo`,`codigo_submodulo`),
  ADD KEY `idx_submodulo_modulo` (`id_modulo`,`estado`,`orden`);

--
-- Indexes for table `usuario_alumno`
--
ALTER TABLE `usuario_alumno`
  ADD PRIMARY KEY (`id_usuario_alumno`),
  ADD UNIQUE KEY `uq_usuario_alumno_nombre` (`nombre_usuario`),
  ADD KEY `idx_usuario_alumno_alumno` (`id_alumno`,`estado`),
  ADD KEY `idx_usuario_alumno_rol` (`id_rol`,`estado`);

--
-- Indexes for table `usuario_alumno_submodulo`
--
ALTER TABLE `usuario_alumno_submodulo`
  ADD PRIMARY KEY (`id_usuario_alumno_submodulo`),
  ADD UNIQUE KEY `uq_usuario_alumno_submodulo` (`id_usuario_alumno`,`id_submodulo`),
  ADD KEY `fk_uas_submodulo` (`id_submodulo`);

--
-- Indexes for table `usuario_docente`
--
ALTER TABLE `usuario_docente`
  ADD PRIMARY KEY (`id_usuario_docente`),
  ADD UNIQUE KEY `uq_usuario_docente_nombre` (`nombre_usuario`),
  ADD KEY `idx_usuario_docente_docente` (`id_docente`,`estado`),
  ADD KEY `idx_usuario_docente_rol` (`id_rol`,`estado`);

--
-- Indexes for table `usuario_docente_submodulo`
--
ALTER TABLE `usuario_docente_submodulo`
  ADD PRIMARY KEY (`id_usuario_docente_submodulo`),
  ADD UNIQUE KEY `uq_usuario_docente_submodulo` (`id_usuario_docente`,`id_submodulo`),
  ADD KEY `fk_uds_submodulo` (`id_submodulo`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `alta_clinica`
--
ALTER TABLE `alta_clinica`
  MODIFY `id_alta_clinica` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `alumno`
--
ALTER TABLE `alumno`
  MODIFY `id_alumno` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `alumno_periodo`
--
ALTER TABLE `alumno_periodo`
  MODIFY `id_alumno_periodo` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `anamnesis`
--
ALTER TABLE `anamnesis`
  MODIFY `id_anamnesis` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `anamnesis_estado_psicologico`
--
ALTER TABLE `anamnesis_estado_psicologico`
  MODIFY `id_anamnesis_estado` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `antecedente`
--
ALTER TABLE `antecedente`
  MODIFY `id_antecedente` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `antecedente_anestesia`
--
ALTER TABLE `antecedente_anestesia`
  MODIFY `id_antecedente_anestesia` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=139;

--
-- AUTO_INCREMENT for table `antecedente_exodoncia`
--
ALTER TABLE `antecedente_exodoncia`
  MODIFY `id_antecedente_exodoncia` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=139;

--
-- AUTO_INCREMENT for table `antecedente_familiar`
--
ALTER TABLE `antecedente_familiar`
  MODIFY `id_antecedente_familiar` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=415;

--
-- AUTO_INCREMENT for table `antecedente_fisiologico`
--
ALTER TABLE `antecedente_fisiologico`
  MODIFY `id_antecedente_fisiologico` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `antecedente_habito_nocivo`
--
ALTER TABLE `antecedente_habito_nocivo`
  MODIFY `id_antecedente_habito` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `antecedente_personal`
--
ALTER TABLE `antecedente_personal`
  MODIFY `id_antecedente_personal` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `antecedente_terapeutico`
--
ALTER TABLE `antecedente_terapeutico`
  MODIFY `id_antecedente_terapeutico` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `archivo_clinico`
--
ALTER TABLE `archivo_clinico`
  MODIFY `id_archivo` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `auditoria`
--
ALTER TABLE `auditoria`
  MODIFY `id_auditoria` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=214;

--
-- AUTO_INCREMENT for table `catalogo_hallazgo_dental`
--
ALTER TABLE `catalogo_hallazgo_dental`
  MODIFY `id_hallazgo_dental` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=39;

--
-- AUTO_INCREMENT for table `catalogo_tratamiento_dental`
--
ALTER TABLE `catalogo_tratamiento_dental`
  MODIFY `id_tratamiento_dental` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `configuracion_sistema`
--
ALTER TABLE `configuracion_sistema`
  MODIFY `id_configuracion` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `consentimiento_clausula`
--
ALTER TABLE `consentimiento_clausula`
  MODIFY `id_consentimiento_clausula` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `consentimiento_informado`
--
ALTER TABLE `consentimiento_informado`
  MODIFY `id_consentimiento` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `curso`
--
ALTER TABLE `curso`
  MODIFY `id_curso` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `diagnostico`
--
ALTER TABLE `diagnostico`
  MODIFY `id_diagnostico` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `docente`
--
ALTER TABLE `docente`
  MODIFY `id_docente` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `epicrisis`
--
ALTER TABLE `epicrisis`
  MODIFY `id_epicrisis` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `estado_historia_clinica`
--
ALTER TABLE `estado_historia_clinica`
  MODIFY `id_estado_historia` smallint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `estudio_modelo`
--
ALTER TABLE `estudio_modelo`
  MODIFY `id_estudio_modelo` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `etapa_quirurgica`
--
ALTER TABLE `etapa_quirurgica`
  MODIFY `id_etapa_quirurgica` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `evolucion_clinica`
--
ALTER TABLE `evolucion_clinica`
  MODIFY `id_evolucion_clinica` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `examen_auxiliar`
--
ALTER TABLE `examen_auxiliar`
  MODIFY `id_examen_auxiliar` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `examen_clinico_general`
--
ALTER TABLE `examen_clinico_general`
  MODIFY `id_examen_clinico_general` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `examen_estomatologico`
--
ALTER TABLE `examen_estomatologico`
  MODIFY `id_examen_estomatologico` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `examen_oclusion`
--
ALTER TABLE `examen_oclusion`
  MODIFY `id_examen_oclusion` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `fase_tratamiento`
--
ALTER TABLE `fase_tratamiento`
  MODIFY `id_fase_tratamiento` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `firma_consentimiento`
--
ALTER TABLE `firma_consentimiento`
  MODIFY `id_firma_consentimiento` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `firma_seguimiento`
--
ALTER TABLE `firma_seguimiento`
  MODIFY `id_firma_seguimiento` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `grupo_academico`
--
ALTER TABLE `grupo_academico`
  MODIFY `id_grupo` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `grupo_miembro`
--
ALTER TABLE `grupo_miembro`
  MODIFY `id_grupo_miembro` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `hallazgo_estomatologico`
--
ALTER TABLE `hallazgo_estomatologico`
  MODIFY `id_hallazgo_estomatologico` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `historia_alumno`
--
ALTER TABLE `historia_alumno`
  MODIFY `id_historia_alumno` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `historia_clinica`
--
ALTER TABLE `historia_clinica`
  MODIFY `id_historia_clinica` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `historia_clinica_estado_historial`
--
ALTER TABLE `historia_clinica_estado_historial`
  MODIFY `id_historial_estado` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT for table `historia_docente`
--
ALTER TABLE `historia_docente`
  MODIFY `id_historia_docente` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `historia_seccion_estado`
--
ALTER TABLE `historia_seccion_estado`
  MODIFY `id_historia_seccion_estado` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `login_historial_alumno`
--
ALTER TABLE `login_historial_alumno`
  MODIFY `id_login_alumno` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `login_historial_docente`
--
ALTER TABLE `login_historial_docente`
  MODIFY `id_login_docente` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `modulo`
--
ALTER TABLE `modulo`
  MODIFY `id_modulo` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `notificacion`
--
ALTER TABLE `notificacion`
  MODIFY `id_notificacion` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=73;

--
-- AUTO_INCREMENT for table `odontograma`
--
ALTER TABLE `odontograma`
  MODIFY `id_odontograma` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `odontograma_hallazgo`
--
ALTER TABLE `odontograma_hallazgo`
  MODIFY `id_odontograma_hallazgo` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `odontograma_hallazgo_pieza`
--
ALTER TABLE `odontograma_hallazgo_pieza`
  MODIFY `id_odontograma_hallazgo_pieza` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `odontograma_pieza`
--
ALTER TABLE `odontograma_pieza`
  MODIFY `id_odontograma_pieza` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `odontograma_superficie`
--
ALTER TABLE `odontograma_superficie`
  MODIFY `id_odontograma_superficie` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `paciente`
--
ALTER TABLE `paciente`
  MODIFY `id_paciente` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `paciente_contacto`
--
ALTER TABLE `paciente_contacto`
  MODIFY `id_paciente_contacto` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `paciente_familiar`
--
ALTER TABLE `paciente_familiar`
  MODIFY `id_paciente_familiar` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `perdida_dental`
--
ALTER TABLE `perdida_dental`
  MODIFY `id_perdida_dental` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `periodo_academico`
--
ALTER TABLE `periodo_academico`
  MODIFY `id_periodo_academico` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `pieza_dental`
--
ALTER TABLE `pieza_dental`
  MODIFY `id_pieza_dental` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=53;

--
-- AUTO_INCREMENT for table `plan_quirurgico`
--
ALTER TABLE `plan_quirurgico`
  MODIFY `id_plan_quirurgico` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `plan_tratamiento`
--
ALTER TABLE `plan_tratamiento`
  MODIFY `id_plan_tratamiento` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=139;

--
-- AUTO_INCREMENT for table `plan_tratamiento_item`
--
ALTER TABLE `plan_tratamiento_item`
  MODIFY `id_plan_tratamiento_item` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pregunta_salud`
--
ALTER TABLE `pregunta_salud`
  MODIFY `id_pregunta` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `prescripcion`
--
ALTER TABLE `prescripcion`
  MODIFY `id_prescripcion` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `programacion_cirugia`
--
ALTER TABLE `programacion_cirugia`
  MODIFY `id_programacion_cirugia` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `pronostico_clinico`
--
ALTER TABLE `pronostico_clinico`
  MODIFY `id_pronostico_clinico` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `protesis`
--
ALTER TABLE `protesis`
  MODIFY `id_protesis` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `reporte_operatorio`
--
ALTER TABLE `reporte_operatorio`
  MODIFY `id_reporte_operatorio` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `respuesta_salud`
--
ALTER TABLE `respuesta_salud`
  MODIFY `id_respuesta_salud` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `rol`
--
ALTER TABLE `rol`
  MODIFY `id_rol` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `rol_submodulo`
--
ALTER TABLE `rol_submodulo`
  MODIFY `id_rol_submodulo` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=59;

--
-- AUTO_INCREMENT for table `rotacion`
--
ALTER TABLE `rotacion`
  MODIFY `id_rotacion` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `rotacion_alumno`
--
ALTER TABLE `rotacion_alumno`
  MODIFY `id_rotacion_alumno` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `rotacion_docente`
--
ALTER TABLE `rotacion_docente`
  MODIFY `id_rotacion_docente` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `seguimiento_quirurgico`
--
ALTER TABLE `seguimiento_quirurgico`
  MODIFY `id_seguimiento_quirurgico` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `signo_vital_operatorio`
--
ALTER TABLE `signo_vital_operatorio`
  MODIFY `id_signo_vital_operatorio` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=415;

--
-- AUTO_INCREMENT for table `submodulo`
--
ALTER TABLE `submodulo`
  MODIFY `id_submodulo` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `usuario_alumno`
--
ALTER TABLE `usuario_alumno`
  MODIFY `id_usuario_alumno` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `usuario_alumno_submodulo`
--
ALTER TABLE `usuario_alumno_submodulo`
  MODIFY `id_usuario_alumno_submodulo` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `usuario_docente`
--
ALTER TABLE `usuario_docente`
  MODIFY `id_usuario_docente` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `usuario_docente_submodulo`
--
ALTER TABLE `usuario_docente_submodulo`
  MODIFY `id_usuario_docente_submodulo` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

-- --------------------------------------------------------

--
-- Structure for view `vista_accesos_rol`
--
DROP TABLE IF EXISTS `vista_accesos_rol`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY INVOKER VIEW `vista_accesos_rol`  AS SELECT `r`.`id_rol` AS `id_rol`, `r`.`codigo_rol` AS `codigo_rol`, `r`.`nombre_rol` AS `nombre_rol`, `r`.`tipo_usuario` AS `tipo_usuario`, `m`.`id_modulo` AS `id_modulo`, `m`.`codigo_modulo` AS `codigo_modulo`, `m`.`nombre_modulo` AS `nombre_modulo`, `s`.`id_submodulo` AS `id_submodulo`, `s`.`codigo_submodulo` AS `codigo_submodulo`, `s`.`nombre_submodulo` AS `nombre_submodulo` FROM (((`rol_submodulo` `rs` join `rol` `r` on(((`r`.`id_rol` = `rs`.`id_rol`) and (`r`.`estado` = 1)))) join `submodulo` `s` on(((`s`.`id_submodulo` = `rs`.`id_submodulo`) and (`s`.`estado` = 1)))) join `modulo` `m` on(((`m`.`id_modulo` = `s`.`id_modulo`) and (`m`.`estado` = 1)))) WHERE (`rs`.`estado` = 1) ;

-- --------------------------------------------------------

--
-- Structure for view `vista_historia_resumen`
--
DROP TABLE IF EXISTS `vista_historia_resumen`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY INVOKER VIEW `vista_historia_resumen`  AS SELECT `h`.`id_historia_clinica` AS `id_historia_clinica`, `h`.`numero_historia` AS `numero_historia`, `h`.`id_paciente` AS `id_paciente`, `p`.`id_periodo_academico` AS `id_periodo_academico`, `p`.`codigo` AS `periodo_academico`, `p`.`anio` AS `anio`, `p`.`semestre` AS `semestre`, `e`.`id_estado_historia` AS `id_estado_historia`, `e`.`codigo` AS `codigo_estado`, `e`.`nombre` AS `estado_actual`, `h`.`fecha_apertura` AS `fecha_apertura`, `h`.`fecha_cierre` AS `fecha_cierre`, `h`.`creado_en` AS `creado_en`, `h`.`actualizado_en` AS `actualizado_en` FROM ((`historia_clinica` `h` join `periodo_academico` `p` on((`p`.`id_periodo_academico` = `h`.`id_periodo_academico`))) join `estado_historia_clinica` `e` on((`e`.`id_estado_historia` = `h`.`id_estado_historia`))) ;

-- --------------------------------------------------------

--
-- Structure for view `vista_usuarios_sistema`
--
DROP TABLE IF EXISTS `vista_usuarios_sistema`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY INVOKER VIEW `vista_usuarios_sistema`  AS SELECT `ua`.`id_usuario_alumno` AS `id_usuario`, 'ALUMNO' AS `tipo_usuario`, `ua`.`id_alumno` AS `id_actor`, concat(`a`.`nombres`,' ',`a`.`apellidos`) AS `nombre_completo`, `a`.`tipo_documento` AS `tipo_documento`, `a`.`numero_documento` AS `numero_documento`, `ua`.`nombre_usuario` AS `nombre_usuario`, `ua`.`id_rol` AS `id_rol`, `r`.`codigo_rol` AS `codigo_rol`, `r`.`nombre_rol` AS `nombre_rol`, `ua`.`estado` AS `estado`, `ua`.`ultimo_inicio_sesion` AS `ultimo_inicio_sesion`, `ua`.`bloqueado_hasta` AS `bloqueado_hasta` FROM ((`usuario_alumno` `ua` join `alumno` `a` on((`a`.`id_alumno` = `ua`.`id_alumno`))) join `rol` `r` on((`r`.`id_rol` = `ua`.`id_rol`)))union all select `ud`.`id_usuario_docente` AS `id_usuario`,'DOCENTE' AS `tipo_usuario`,`ud`.`id_docente` AS `id_actor`,concat(`d`.`nombres`,' ',`d`.`apellidos`) AS `nombre_completo`,`d`.`tipo_documento` AS `tipo_documento`,`d`.`numero_documento` AS `numero_documento`,`ud`.`nombre_usuario` AS `nombre_usuario`,`ud`.`id_rol` AS `id_rol`,`r`.`codigo_rol` AS `codigo_rol`,`r`.`nombre_rol` AS `nombre_rol`,`ud`.`estado` AS `estado`,`ud`.`ultimo_inicio_sesion` AS `ultimo_inicio_sesion`,`ud`.`bloqueado_hasta` AS `bloqueado_hasta` from ((`usuario_docente` `ud` join `docente` `d` on((`d`.`id_docente` = `ud`.`id_docente`))) join `rol` `r` on((`r`.`id_rol` = `ud`.`id_rol`)))  ;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `alta_clinica`
--
ALTER TABLE `alta_clinica`
  ADD CONSTRAINT `fk_alta_reporte` FOREIGN KEY (`id_reporte_operatorio`) REFERENCES `reporte_operatorio` (`id_reporte_operatorio`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `alumno_periodo`
--
ALTER TABLE `alumno_periodo`
  ADD CONSTRAINT `fk_alumno_periodo_alumno` FOREIGN KEY (`id_alumno`) REFERENCES `alumno` (`id_alumno`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_alumno_periodo_periodo` FOREIGN KEY (`id_periodo_academico`) REFERENCES `periodo_academico` (`id_periodo_academico`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `anamnesis`
--
ALTER TABLE `anamnesis`
  ADD CONSTRAINT `fk_anamnesis_historia` FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica` (`id_historia_clinica`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `anamnesis_estado_psicologico`
--
ALTER TABLE `anamnesis_estado_psicologico`
  ADD CONSTRAINT `fk_anamnesis_estado_anamnesis` FOREIGN KEY (`id_anamnesis`) REFERENCES `anamnesis` (`id_anamnesis`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `antecedente`
--
ALTER TABLE `antecedente`
  ADD CONSTRAINT `fk_antecedente_historia` FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica` (`id_historia_clinica`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `antecedente_anestesia`
--
ALTER TABLE `antecedente_anestesia`
  ADD CONSTRAINT `fk_antecedente_anestesia_historia` FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica` (`id_historia_clinica`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `antecedente_exodoncia`
--
ALTER TABLE `antecedente_exodoncia`
  ADD CONSTRAINT `fk_antecedente_exodoncia_historia` FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica` (`id_historia_clinica`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_antecedente_exodoncia_pieza` FOREIGN KEY (`id_pieza_dental`) REFERENCES `pieza_dental` (`id_pieza_dental`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `antecedente_familiar`
--
ALTER TABLE `antecedente_familiar`
  ADD CONSTRAINT `fk_antecedente_familiar_historia` FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica` (`id_historia_clinica`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `antecedente_fisiologico`
--
ALTER TABLE `antecedente_fisiologico`
  ADD CONSTRAINT `fk_antecedente_fisiologico_historia` FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica` (`id_historia_clinica`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `antecedente_habito_nocivo`
--
ALTER TABLE `antecedente_habito_nocivo`
  ADD CONSTRAINT `fk_habito_antecedente_personal` FOREIGN KEY (`id_antecedente_personal`) REFERENCES `antecedente_personal` (`id_antecedente_personal`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `antecedente_personal`
--
ALTER TABLE `antecedente_personal`
  ADD CONSTRAINT `fk_antecedente_personal_historia` FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica` (`id_historia_clinica`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `antecedente_terapeutico`
--
ALTER TABLE `antecedente_terapeutico`
  ADD CONSTRAINT `fk_antecedente_terapeutico_historia` FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica` (`id_historia_clinica`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `archivo_clinico`
--
ALTER TABLE `archivo_clinico`
  ADD CONSTRAINT `fk_archivo_historia` FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica` (`id_historia_clinica`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `consentimiento_clausula`
--
ALTER TABLE `consentimiento_clausula`
  ADD CONSTRAINT `fk_clausula_consentimiento` FOREIGN KEY (`id_consentimiento`) REFERENCES `consentimiento_informado` (`id_consentimiento`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `consentimiento_informado`
--
ALTER TABLE `consentimiento_informado`
  ADD CONSTRAINT `fk_consentimiento_docente` FOREIGN KEY (`id_docente_informante`) REFERENCES `docente` (`id_docente`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_consentimiento_historia` FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica` (`id_historia_clinica`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `diagnostico`
--
ALTER TABLE `diagnostico`
  ADD CONSTRAINT `fk_diagnostico_historia` FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica` (`id_historia_clinica`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `epicrisis`
--
ALTER TABLE `epicrisis`
  ADD CONSTRAINT `fk_epicrisis_reporte` FOREIGN KEY (`id_reporte_operatorio`) REFERENCES `reporte_operatorio` (`id_reporte_operatorio`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `estudio_modelo`
--
ALTER TABLE `estudio_modelo`
  ADD CONSTRAINT `fk_estudio_modelo_historia` FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica` (`id_historia_clinica`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `etapa_quirurgica`
--
ALTER TABLE `etapa_quirurgica`
  ADD CONSTRAINT `fk_etapa_plan_quirurgico` FOREIGN KEY (`id_plan_quirurgico`) REFERENCES `plan_quirurgico` (`id_plan_quirurgico`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `evolucion_clinica`
--
ALTER TABLE `evolucion_clinica`
  ADD CONSTRAINT `fk_evolucion_historia` FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica` (`id_historia_clinica`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `examen_auxiliar`
--
ALTER TABLE `examen_auxiliar`
  ADD CONSTRAINT `fk_examen_auxiliar_archivo` FOREIGN KEY (`id_archivo`) REFERENCES `archivo_clinico` (`id_archivo`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_examen_auxiliar_historia` FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica` (`id_historia_clinica`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `examen_clinico_general`
--
ALTER TABLE `examen_clinico_general`
  ADD CONSTRAINT `fk_examen_general_historia` FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica` (`id_historia_clinica`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `examen_estomatologico`
--
ALTER TABLE `examen_estomatologico`
  ADD CONSTRAINT `fk_examen_estomatologico_historia` FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica` (`id_historia_clinica`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `examen_oclusion`
--
ALTER TABLE `examen_oclusion`
  ADD CONSTRAINT `fk_examen_oclusion_historia` FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica` (`id_historia_clinica`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `fase_tratamiento`
--
ALTER TABLE `fase_tratamiento`
  ADD CONSTRAINT `fk_fase_plan` FOREIGN KEY (`id_plan_tratamiento`) REFERENCES `plan_tratamiento` (`id_plan_tratamiento`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `firma_consentimiento`
--
ALTER TABLE `firma_consentimiento`
  ADD CONSTRAINT `fk_firma_consentimiento` FOREIGN KEY (`id_consentimiento`) REFERENCES `consentimiento_informado` (`id_consentimiento`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_firma_consentimiento_archivo` FOREIGN KEY (`id_archivo`) REFERENCES `archivo_clinico` (`id_archivo`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `firma_seguimiento`
--
ALTER TABLE `firma_seguimiento`
  ADD CONSTRAINT `fk_firma_seguimiento_alumno` FOREIGN KEY (`id_alumno`) REFERENCES `alumno` (`id_alumno`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_firma_seguimiento_archivo` FOREIGN KEY (`id_archivo`) REFERENCES `archivo_clinico` (`id_archivo`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_firma_seguimiento_control` FOREIGN KEY (`id_seguimiento_quirurgico`) REFERENCES `seguimiento_quirurgico` (`id_seguimiento_quirurgico`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_firma_seguimiento_docente` FOREIGN KEY (`id_docente`) REFERENCES `docente` (`id_docente`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `grupo_miembro`
--
ALTER TABLE `grupo_miembro`
  ADD CONSTRAINT `fk_grupo_miembro_alumno` FOREIGN KEY (`id_alumno`) REFERENCES `alumno` (`id_alumno`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_grupo_miembro_grupo` FOREIGN KEY (`id_grupo`) REFERENCES `grupo_academico` (`id_grupo`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `hallazgo_estomatologico`
--
ALTER TABLE `hallazgo_estomatologico`
  ADD CONSTRAINT `fk_hallazgo_estomatologico_examen` FOREIGN KEY (`id_examen_estomatologico`) REFERENCES `examen_estomatologico` (`id_examen_estomatologico`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `historia_alumno`
--
ALTER TABLE `historia_alumno`
  ADD CONSTRAINT `fk_historia_alumno_alumno` FOREIGN KEY (`id_alumno`) REFERENCES `alumno` (`id_alumno`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_historia_alumno_historia` FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica` (`id_historia_clinica`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `historia_clinica`
--
ALTER TABLE `historia_clinica`
  ADD CONSTRAINT `fk_historia_estado` FOREIGN KEY (`id_estado_historia`) REFERENCES `estado_historia_clinica` (`id_estado_historia`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_historia_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `paciente` (`id_paciente`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_historia_periodo` FOREIGN KEY (`id_periodo_academico`) REFERENCES `periodo_academico` (`id_periodo_academico`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `historia_clinica_estado_historial`
--
ALTER TABLE `historia_clinica_estado_historial`
  ADD CONSTRAINT `fk_historial_estado_catalogo` FOREIGN KEY (`id_estado_historia`) REFERENCES `estado_historia_clinica` (`id_estado_historia`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_historial_estado_historia` FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica` (`id_historia_clinica`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `historia_docente`
--
ALTER TABLE `historia_docente`
  ADD CONSTRAINT `fk_hd_docente` FOREIGN KEY (`id_docente`) REFERENCES `docente` (`id_docente`) ON DELETE RESTRICT,
  ADD CONSTRAINT `fk_hd_historia` FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica` (`id_historia_clinica`) ON DELETE RESTRICT;

--
-- Constraints for table `historia_seccion_estado`
--
ALTER TABLE `historia_seccion_estado`
  ADD CONSTRAINT `fk_seccion_estado_historia` FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica` (`id_historia_clinica`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `login_historial_alumno`
--
ALTER TABLE `login_historial_alumno`
  ADD CONSTRAINT `fk_login_alumno_usuario` FOREIGN KEY (`id_usuario_alumno`) REFERENCES `usuario_alumno` (`id_usuario_alumno`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `login_historial_docente`
--
ALTER TABLE `login_historial_docente`
  ADD CONSTRAINT `fk_login_docente_usuario` FOREIGN KEY (`id_usuario_docente`) REFERENCES `usuario_docente` (`id_usuario_docente`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `notificacion`
--
ALTER TABLE `notificacion`
  ADD CONSTRAINT `fk_notificacion_historia` FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica` (`id_historia_clinica`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `odontograma`
--
ALTER TABLE `odontograma`
  ADD CONSTRAINT `fk_odontograma_docente` FOREIGN KEY (`id_docente_responsable`) REFERENCES `docente` (`id_docente`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_odontograma_historia` FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica` (`id_historia_clinica`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `odontograma_hallazgo`
--
ALTER TABLE `odontograma_hallazgo`
  ADD CONSTRAINT `fk_odontograma_hallazgo_catalogo` FOREIGN KEY (`id_hallazgo_dental`) REFERENCES `catalogo_hallazgo_dental` (`id_hallazgo_dental`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_odontograma_hallazgo_odontograma` FOREIGN KEY (`id_odontograma`) REFERENCES `odontograma` (`id_odontograma`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_odontograma_hallazgo_superficie` FOREIGN KEY (`id_odontograma_superficie`) REFERENCES `odontograma_superficie` (`id_odontograma_superficie`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `odontograma_hallazgo_pieza`
--
ALTER TABLE `odontograma_hallazgo_pieza`
  ADD CONSTRAINT `fk_hallazgo_pieza_hallazgo` FOREIGN KEY (`id_odontograma_hallazgo`) REFERENCES `odontograma_hallazgo` (`id_odontograma_hallazgo`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_hallazgo_pieza_pieza` FOREIGN KEY (`id_odontograma_pieza`) REFERENCES `odontograma_pieza` (`id_odontograma_pieza`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `odontograma_pieza`
--
ALTER TABLE `odontograma_pieza`
  ADD CONSTRAINT `fk_odontograma_pieza_odontograma` FOREIGN KEY (`id_odontograma`) REFERENCES `odontograma` (`id_odontograma`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_odontograma_pieza_pieza` FOREIGN KEY (`id_pieza_dental`) REFERENCES `pieza_dental` (`id_pieza_dental`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `odontograma_superficie`
--
ALTER TABLE `odontograma_superficie`
  ADD CONSTRAINT `fk_odontograma_superficie_pieza` FOREIGN KEY (`id_odontograma_pieza`) REFERENCES `odontograma_pieza` (`id_odontograma_pieza`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `paciente_contacto`
--
ALTER TABLE `paciente_contacto`
  ADD CONSTRAINT `fk_contacto_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `paciente` (`id_paciente`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `paciente_familiar`
--
ALTER TABLE `paciente_familiar`
  ADD CONSTRAINT `fk_paciente_familiar_paciente` FOREIGN KEY (`id_paciente`) REFERENCES `paciente` (`id_paciente`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `perdida_dental`
--
ALTER TABLE `perdida_dental`
  ADD CONSTRAINT `fk_perdida_historia` FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica` (`id_historia_clinica`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_perdida_pieza` FOREIGN KEY (`id_pieza_dental`) REFERENCES `pieza_dental` (`id_pieza_dental`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `plan_quirurgico`
--
ALTER TABLE `plan_quirurgico`
  ADD CONSTRAINT `fk_plan_quirurgico_historia` FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica` (`id_historia_clinica`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `plan_tratamiento`
--
ALTER TABLE `plan_tratamiento`
  ADD CONSTRAINT `fk_plan_historia` FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica` (`id_historia_clinica`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `plan_tratamiento_item`
--
ALTER TABLE `plan_tratamiento_item`
  ADD CONSTRAINT `fk_plan_item_fase` FOREIGN KEY (`id_fase_tratamiento`) REFERENCES `fase_tratamiento` (`id_fase_tratamiento`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_plan_item_pieza` FOREIGN KEY (`id_pieza_dental`) REFERENCES `pieza_dental` (`id_pieza_dental`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_plan_item_tratamiento` FOREIGN KEY (`id_tratamiento_dental`) REFERENCES `catalogo_tratamiento_dental` (`id_tratamiento_dental`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `prescripcion`
--
ALTER TABLE `prescripcion`
  ADD CONSTRAINT `fk_prescripcion_reporte` FOREIGN KEY (`id_reporte_operatorio`) REFERENCES `reporte_operatorio` (`id_reporte_operatorio`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `programacion_cirugia`
--
ALTER TABLE `programacion_cirugia`
  ADD CONSTRAINT `fk_programacion_plan` FOREIGN KEY (`id_plan_quirurgico`) REFERENCES `plan_quirurgico` (`id_plan_quirurgico`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `pronostico_clinico`
--
ALTER TABLE `pronostico_clinico`
  ADD CONSTRAINT `fk_pronostico_historia` FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica` (`id_historia_clinica`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `protesis`
--
ALTER TABLE `protesis`
  ADD CONSTRAINT `fk_protesis_historia` FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica` (`id_historia_clinica`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `reporte_operatorio`
--
ALTER TABLE `reporte_operatorio`
  ADD CONSTRAINT `fk_reporte_alumno` FOREIGN KEY (`id_alumno_operador`) REFERENCES `alumno` (`id_alumno`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_reporte_docente` FOREIGN KEY (`id_docente_responsable`) REFERENCES `docente` (`id_docente`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_reporte_firma_alumno` FOREIGN KEY (`id_archivo_firma_alumno`) REFERENCES `archivo_clinico` (`id_archivo`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_reporte_firma_docente` FOREIGN KEY (`id_archivo_firma_docente`) REFERENCES `archivo_clinico` (`id_archivo`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_reporte_plan` FOREIGN KEY (`id_plan_quirurgico`) REFERENCES `plan_quirurgico` (`id_plan_quirurgico`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `respuesta_salud`
--
ALTER TABLE `respuesta_salud`
  ADD CONSTRAINT `fk_respuesta_historia` FOREIGN KEY (`id_historia_clinica`) REFERENCES `historia_clinica` (`id_historia_clinica`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_respuesta_pregunta` FOREIGN KEY (`id_pregunta`) REFERENCES `pregunta_salud` (`id_pregunta`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `rol_submodulo`
--
ALTER TABLE `rol_submodulo`
  ADD CONSTRAINT `fk_rol_submodulo_rol` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_rol_submodulo_submodulo` FOREIGN KEY (`id_submodulo`) REFERENCES `submodulo` (`id_submodulo`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `rotacion`
--
ALTER TABLE `rotacion`
  ADD CONSTRAINT `fk_rotacion_curso` FOREIGN KEY (`id_curso`) REFERENCES `curso` (`id_curso`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_rotacion_grupo` FOREIGN KEY (`id_grupo`) REFERENCES `grupo_academico` (`id_grupo`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_rotacion_periodo` FOREIGN KEY (`id_periodo_academico`) REFERENCES `periodo_academico` (`id_periodo_academico`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `rotacion_alumno`
--
ALTER TABLE `rotacion_alumno`
  ADD CONSTRAINT `fk_rotacion_alumno_alumno` FOREIGN KEY (`id_alumno`) REFERENCES `alumno` (`id_alumno`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_rotacion_alumno_rotacion` FOREIGN KEY (`id_rotacion`) REFERENCES `rotacion` (`id_rotacion`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `rotacion_docente`
--
ALTER TABLE `rotacion_docente`
  ADD CONSTRAINT `fk_rotacion_docente_docente` FOREIGN KEY (`id_docente`) REFERENCES `docente` (`id_docente`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_rotacion_docente_rotacion` FOREIGN KEY (`id_rotacion`) REFERENCES `rotacion` (`id_rotacion`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `seguimiento_quirurgico`
--
ALTER TABLE `seguimiento_quirurgico`
  ADD CONSTRAINT `fk_seguimiento_alumno` FOREIGN KEY (`id_alumno`) REFERENCES `alumno` (`id_alumno`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_seguimiento_docente` FOREIGN KEY (`id_docente`) REFERENCES `docente` (`id_docente`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_seguimiento_reporte` FOREIGN KEY (`id_reporte_operatorio`) REFERENCES `reporte_operatorio` (`id_reporte_operatorio`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `signo_vital_operatorio`
--
ALTER TABLE `signo_vital_operatorio`
  ADD CONSTRAINT `fk_signo_reporte` FOREIGN KEY (`id_reporte_operatorio`) REFERENCES `reporte_operatorio` (`id_reporte_operatorio`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `submodulo`
--
ALTER TABLE `submodulo`
  ADD CONSTRAINT `fk_submodulo_modulo` FOREIGN KEY (`id_modulo`) REFERENCES `modulo` (`id_modulo`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `usuario_alumno`
--
ALTER TABLE `usuario_alumno`
  ADD CONSTRAINT `fk_usuario_alumno_alumno` FOREIGN KEY (`id_alumno`) REFERENCES `alumno` (`id_alumno`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_usuario_alumno_rol` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `usuario_alumno_submodulo`
--
ALTER TABLE `usuario_alumno_submodulo`
  ADD CONSTRAINT `fk_uas_submodulo` FOREIGN KEY (`id_submodulo`) REFERENCES `submodulo` (`id_submodulo`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_uas_usuario` FOREIGN KEY (`id_usuario_alumno`) REFERENCES `usuario_alumno` (`id_usuario_alumno`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `usuario_docente`
--
ALTER TABLE `usuario_docente`
  ADD CONSTRAINT `fk_usuario_docente_docente` FOREIGN KEY (`id_docente`) REFERENCES `docente` (`id_docente`) ON DELETE RESTRICT ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_usuario_docente_rol` FOREIGN KEY (`id_rol`) REFERENCES `rol` (`id_rol`) ON DELETE RESTRICT ON UPDATE CASCADE;

--
-- Constraints for table `usuario_docente_submodulo`
--
ALTER TABLE `usuario_docente_submodulo`
  ADD CONSTRAINT `fk_uds_submodulo` FOREIGN KEY (`id_submodulo`) REFERENCES `submodulo` (`id_submodulo`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_uds_usuario` FOREIGN KEY (`id_usuario_docente`) REFERENCES `usuario_docente` (`id_usuario_docente`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
