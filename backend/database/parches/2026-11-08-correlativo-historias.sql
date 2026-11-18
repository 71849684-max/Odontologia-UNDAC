CREATE TABLE IF NOT EXISTS historia_correlativo (
    anio SMALLINT UNSIGNED NOT NULL PRIMARY KEY,
    ultimo BIGINT UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO historia_correlativo (anio, ultimo)
SELECT CAST(SUBSTRING(numero_historia, 4, 4) AS UNSIGNED), MAX(CAST(SUBSTRING(numero_historia, 9) AS UNSIGNED))
FROM historia_clinica WHERE numero_historia REGEXP '^HC-[0-9]{4}-[0-9]+$'
GROUP BY CAST(SUBSTRING(numero_historia, 4, 4) AS UNSIGNED)
ON DUPLICATE KEY UPDATE ultimo = GREATEST(historia_correlativo.ultimo, VALUES(ultimo));
