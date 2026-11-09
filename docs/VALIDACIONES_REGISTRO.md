# Validaciones básicas de registro

Las altas se validan en el servidor antes de persistir. Los formularios principales adelantan los errores de formato; una petición directa continúa protegida. Los errores se devuelven como 422 con la clave del campo y un mensaje en español.

| Registro | Validación mínima |
| --- | --- |
| Usuarios | Campos obligatorios y límites existentes, rol válido, documento DNI/CE/PAS, DNI de 8 dígitos, otros documentos de 4 a 20 caracteres, correo y teléfono opcionales con formato válido. Se conserva el usuario de acceso existente, sin obligarlo a ser un correo. |
| Pacientes | Nombres y apellido paterno, documento, fechas de nacimiento válidas y no futuras, sexo válido, teléfonos y correos opcionales, límites de textos y observaciones. Se conservan las comprobaciones existentes de duplicidad. |
| Apertura de historia | Paciente existente válido o documento y nombres del paciente nuevo. No se exige volver a registrar el documento de un paciente seleccionado. Se validan fechas y datos de contacto enviados. |
| Borrador clínico | Cada sección debe ser un arreglo; estados de sección conocidos, formatos básicos de identificación y contacto, números clínicos no negativos. Se admite coma decimal. Los campos clínicos opcionales pueden permanecer vacíos y no se recortan secciones por incorporar validaciones puntuales. |
| Seguimientos | Fecha válida, hora de 00:00 a 23:59, segundos opcionales, detalle limitado y reglas de estado existentes. |
| Periodos, cursos y grupos | Campos obligatorios y límites de código, nombre, semestre y descripción; fechas y orden de fechas existentes. Los formularios limitan las longitudes antes del envío. |
| Rotaciones | Grupo, curso y periodo existentes y positivos, fechas válidas y ordenadas. |
| Miembros y participantes académicos | Hasta 100 elementos por petición, identificadores con formato correcto y sin repetidos, personas existentes y fechas de membresía ordenadas. El lote se guarda en una transacción: cualquier error revierte los elementos anteriores de la misma petición. |
| Archivos y odontograma | Se conservan las validaciones existentes de tamaño, tipo, estructura, versión y reglas clínicas. |
| Permisos y configuración | Se conservan las reglas existentes de referencias válidas, duplicados, tipos y límites de valores. |

Los teléfonos opcionales admiten de 7 a 15 dígitos, con espacios, +, guiones y paréntesis. No se limita a un único formato de país. Los nombres no tienen restricciones artificiales de alfabeto, para permitir tildes, apóstrofes y nombres compuestos.

Las validaciones no reemplazan permisos, autorización de historias ni restricciones de la base de datos. No se modifican los datos ya guardados ni se obliga a completar todo el expediente para autoguardar.

## Verificación

`ValidacionesRegistroTest` comprueba formatos y errores 422 en los controladores reales sin insertar datos; también verifica que los campos adicionales del borrador no se pierdan. `LotesAcademicosValidacionTest` usa SQLite en memoria para comprobar reversión de lotes y fechas. El frontend cubre documentos, contacto, fechas y el botón de crear historia desde el formulario de paciente.

La integración completa con el esquema y los triggers MySQL necesita la base exclusiva `bd_clinica_undac_test`, actualmente ausente. No se ejecutan pruebas de escritura contra la base clínica local.
