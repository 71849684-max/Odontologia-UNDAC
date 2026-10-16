-- Si un alumno tiene denegado PACIENTES como excepciÃ³n de usuario pero su rol
-- sÃ­ lo incluye, se restaura el acceso del rol (quita la denegaciÃ³n errÃ³nea).
DELETE uas
FROM usuario_alumno_submodulo uas
INNER JOIN submodulo s ON s.id_submodulo = uas.id_submodulo AND s.codigo_submodulo = 'PACIENTES'
WHERE uas.permitido = 0
  AND EXISTS (
    SELECT 1
    FROM usuario_alumno ua
    INNER JOIN rol_submodulo rs
      ON rs.id_rol = ua.id_rol
     AND rs.id_submodulo = uas.id_submodulo
     AND rs.estado = 1
    WHERE ua.id_usuario_alumno = uas.id_usuario_alumno
      AND ua.estado = 1
  );
