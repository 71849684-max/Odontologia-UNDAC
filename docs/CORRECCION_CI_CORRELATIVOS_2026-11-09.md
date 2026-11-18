# Fallo de correlativos concurrentes en GitHub Actions

El registro de GitHub muestra 168 pruebas correctas y un fallo posterior en `node scripts/comprobarCorrelativo.mjs`: MySQL informa `SQLSTATE[40001]`, error 1213, al bloquear `historia_correlativo` con 20 conexiones simultáneas.

La reserva utilizaba `INSERT IGNORE` seguido de `SELECT FOR UPDATE`. Se sustituye por un upsert que adquiere el bloqueo exclusivo del contador antes de operar sobre pacientes. El contador, la creación de la historia y la asignación siguen dentro de la misma transacción, con sus reintentos y reversión ante errores.

El comprobador espera el cierre de la salida del proceso PHP, devuelve los errores por stderr con código distinto de cero y comprueba dos escenarios de 20 conexiones: año actual y año nuevo sin contador previo.

El flujo separa esta comprobación en un paso identificable, fija Ubuntu 24.04, utiliza las acciones oficiales v7 con Node.js 24 y sube los informes únicamente cuando se ejecutó el paso de navegador. Los avisos de Node.js y Ubuntu no causaron el deadlock; el aviso de archivos inexistentes se produjo porque el flujo se interrumpió antes de generar los informes.

Validación local en una instancia temporal independiente de MySQL 8.4.3, puerto 3307, con estructura y catálogos saneados: 168 pruebas correctas, 1243 aserciones y 120 aperturas correctas en tres rondas de ambos escenarios. No hubo correlativos repetidos ni bloqueos mutuos. Estilo PHP y sintaxis YAML correctos. La instancia temporal se apagó al terminar. No se utilizó la base operativa.

La ejecución remota completa queda pendiente de subir los cambios y ejecutar nuevamente GitHub Actions.

Definiciones oficiales comprobadas: [checkout v7](https://github.com/actions/checkout/blob/v7/action.yml), [setup-node v7](https://github.com/actions/setup-node/blob/v7/action.yml), [upload-artifact v7](https://github.com/actions/upload-artifact/blob/v7/action.yml).
