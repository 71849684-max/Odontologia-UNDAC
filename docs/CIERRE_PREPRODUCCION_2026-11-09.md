# Implementación del cierre de preproducción

Implementación del plan del 8 de noviembre, terminada el 9 de noviembre de 2026 (America/Lima). Base de código `28266271` más los cambios locales de esta entrega. Por indicación del usuario, producción se entrega como plantilla y la carga se mide localmente con datos sintéticos. No hubo despliegue externo ni actualización de la base clínica de trabajo.

## Cambios realizados

- PHP mínimo 8.4.1, referencia y CI en 8.5; dependencias Symfony afectadas actualizadas desde Composer. Instalación limpia del lock en un directorio separado, validación del manifiesto y requisitos de plataforma aprobados. Las auditorías de Composer y npm no informan vulnerabilidades en esta ejecución.
- Esquema aislado reproducible con delimitadores, ocho triggers, vistas INVOKER, restricciones y catálogos permitidos. Excluye cuentas, pacientes, historias, auditoría y notificaciones operativas. Las tres bases de pruebas se recrearon con el esquema saneado. El preparador rechaza bases parciales o sin marcador de saneamiento. PHPUnit fuerza su destino y lo verifica antes de iniciar las transacciones de prueba; se rechazan bases operativas y DB_URL.
- Aplicador de parches: los conflictos de datos y restricciones dejan de ignorarse; las columnas, índices y claves foráneas ya existentes deben corresponder al parche antes de registrarlo. Reaplicación comprobada sobre las bases aisladas y ensayo de rechazo de duplicados/definiciones incompatibles. El diagnóstico de instalación revisa también presencia de tablas, columnas y marcadores de parche.
- Contador anual con bloqueo dentro de la transacción, inicialización numérica y unicidad conservada. Cobertura de 999→1000→1001, año nuevo, historias inactivas/huecos y reversión de altas fallidas. Veinte procesos con conexiones separadas confirmaron veinte códigos únicos.
- En producción, el registro clínico exige confirmación del servidor. Se retiró la lectura/escritura clínica de `localStorage`; un fallo inicial no muestra una copia antigua. Los cambios no enviados permanecen en memoria con aviso y botón «Reintentar guardado». La revocación bloquea la ficha y el desmontaje cancela guardados en cola. Cerrar sesión retira inmediatamente la sesión de la interfaz. La recuperación de borradores heredados requiere conciliación autorizada; no se purgaron silenciosamente.
- Datos de pruebas de docentes corregidos para respetar la asignación vigente; protección de revisión conservada. Regresiones de navegador para fallos de red, reintento/recarga y cambio de usuario en el mismo navegador, con cookies y CSRF reales. Solo se interrumpen solicitudes para provocar fallos; no se simulan respuestas exitosas.
- Contraste corregido en cinco elementos del modo claro usando tokens; revisión visual en claro/oscuro y móvil. Referencias visuales actualizadas tras revisar los cambios intencionales. Escala de capas conservada.
- Workflow actualizado con PHP 8.5, auditorías, Pint, preparación saneada, pruebas, correlativos concurrentes, tokens, compilación y ambos navegadores. Plantillas de entorno y Nginx/PHP-FPM, diagnóstico, guía de instalación, respaldo, restauración y reversión disponibles.

El SQL recibido conserva SHA-256 `70cf7588e7b9525a501d188c865d99116a6640957122af3b7c31a618f08150bd`. Se guardó una copia privada excluida de Git; no se transformó el archivo aportado ni se importaron sus datos operativos en las bases de pruebas.

## Comprobaciones finales

| Comprobación | Resultado local |
| --- | --- |
| Laravel / MySQL | 151 pruebas aprobadas; 1.076 aserciones |
| Vitest | 262 pruebas aprobadas en 33 archivos |
| Chromium | 22 recorridos aprobados |
| Firefox | 22 recorridos aprobados |
| Pint global | Aprobado |
| Composer validate / requisitos | Aprobados |
| Composer audit / npm audit | Sin avisos de vulnerabilidad |
| Tokens y capas | Aprobado; siete colores clínicos inventariados, ninguna capa numérica fuera de escala |
| Compilación | Aprobada; entrada y precargas: 87.876 bytes gzip |
| Correlativo concurrente | 20 conexiones, 20 altas, 20 códigos únicos |
| Restauración sintética | 83 tablas con conteos iguales, 1.000 historias, adjunto sintético con hash idéntico; parches reaplicados |
| Diagnóstico de copia restaurada | 83 tablas, 3 vistas, 8 triggers, sin fallos |

La apertura clínica desde un contexto de navegador independiente pasó la meta local de cuatro segundos en ambos navegadores. No se añade otra fragmentación sin evidencia de necesidad: las vistas ya se cargan por separado; el chunk clínico sigue alrededor de 612 kB sin comprimir. Medirlo nuevamente con equipos y red clínicos antes de atribuirle capacidad de producción.

## Carga local

Equipo: Windows 10.0.26300, Intel Core i5-10300H, ocho procesadores lógicos y 24 GB de RAM. PHP 8.5.8 con servidor Artisan de un proceso, MySQL 8.4.3 compartido y k6 2.3.0 en el mismo equipo; conexión de bucle local. Datos: 48 cuentas, 45 operadores y 1.000 historias sintéticas con propietarios separados, estados y tamaños de anamnesis distintos.

Campaña mixta continua: incremento hasta 40 usuarios virtuales, cinco minutos de fase estable y descenso posterior; intervalo de 30 segundos entre iteraciones. No se relajaron autenticación, CSRF, revisión ni límites de acceso.

| Operación, fase estable | p95 | Meta inicial | Muestras |
| --- | --- | --- | --- |
| Listado | 558,8 ms | < 800 ms | 386 |
| Lectura | 470,0 ms | < 1.200 ms | 386 |
| Autoguardado | 639,5 ms | < 700 ms | 388 |

La campaña continua pasó todos sus umbrales y no registró errores HTTP ni 5xx. El informe de carga conserva además medianas, p99, máximos, comprobaciones e integridad. La verificación posterior de las 1.000 historias aprobó sus marcadores de propietario e historia.

Se conservan también resultados que no pasaron: los humos de autoguardado y mixto con cinco usuarios y escrituras cada segundo excedieron tiempos (p95 de autoguardado de 1.202,1 y 1.072,9 ms). Son perfiles de escritura distintos del intervalo nominal de 30 segundos y con muestras pequeñas; no se ocultan ni se presentan como aprobados. La primera campaña nominal sufrió una pausa prolongada del equipo y una comprobación fallida; no se usa como referencia válida. La segunda campaña se ejecutó de forma continua y pasó. Una tercera campaña complementaria capturó recursos y posteriormente también quedó interrumpida: sus latencias no se consideran válidas como referencia. Hubo otras comprobaciones locales en el equipo durante parte de los ensayos.

En la medición complementaria, antes de la interrupción se obtuvieron 134 muestras válidas por proceso entre 08:41:37 y 08:47:06 UTC. CPU normalizada al equipo: PHP media 4,12 %, máxima 7,87 %; MySQL media 4,45 %, máxima 18,50 %. Memoria máxima: PHP 49,20 MB y MySQL 438,75 MB. MySQL comparte servidor con otras bases. Windows ocultaba el tiempo de CPU del servicio: se corrigió el medidor para usar los contadores del sistema y distinguir datos no disponibles de cero. Estas muestras corresponden al ensayo complementario, no a toda la campaña continua aprobada. No se acredita con ellas el límite de CPU del futuro servidor.

Estos resultados son exploratorios del entorno local. No acreditan 40 usuarios en producción, ráfagas de guardado cada segundo, ni equivalencia con Apache/PHP-FPM. Los límites de p95 no implican que cada solicitud haya quedado por debajo de la meta. La campaña representativa debe repetirse con el servidor definitivo y la concurrencia acordada con la facultad.

## Evidencias y siguientes pasos operativos

Resultados sin registros clínicos ni credenciales: `docs/evidencias/cierre-preproduccion-2026-11-09/`. Los informes completos de Playwright, manifiestos, respaldos y trazas permanecen privados y fuera de Git.

Antes de utilizar el nuevo código en una base existente, suspender aperturas, respaldar base y archivos, aplicar `php artisan clinica:parches` y ejecutar `php artisan clinica:verificar`. La base local de trabajo todavía necesita el nuevo parche del contador; no se actualizó automáticamente como efecto de las pruebas. No importar el dump completo para actualizarla.

La ejecución externa del workflow de GitHub queda pendiente: se verificaron sus controles localmente, pero no se publicó una rama ni se atribuye una ejecución remota exitosa al pipeline. El servidor/dominio, revisión de borradores antiguos, respaldo operativo restaurable y piloto con responsables quedan para la preparación operativa descrita en `docs/DESPLIEGUE.md`. Las plantillas no fueron activadas en ningún servidor.
