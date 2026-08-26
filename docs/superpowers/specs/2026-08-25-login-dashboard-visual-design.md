# Diseño visual de login y dashboard — Odontología UNDAC

Fecha: 25 de agosto de 2026

## Objetivo

Crear la primera capa visual del sistema de Historia Clínica Digital de Odontología UNDAC usando Laravel como contenedor del proyecto y React para el frontend. Esta entrega incluye únicamente la interfaz de inicio de sesión y un dashboard adaptable por perfil.

## Alcance

### Incluido

- Configuración mínima de React dentro del proyecto Laravel existente.
- Pantalla de inicio de sesión responsive.
- Dashboard responsive con navegación lateral y encabezado.
- Variantes visuales para administrador, docente y alumno operador.
- Datos demostrativos locales para métricas, actividad reciente y accesos rápidos.
- Interacciones estrictamente presentacionales: mostrar u ocultar contraseña, menú móvil, selección de perfil de demostración y transición visual entre login y dashboard.
- Estados visuales de carga, error, vacío y sesión expirada como componentes de muestra, sin conectarlos a servicios reales.
- Pruebas enfocadas en renderizado, accesibilidad básica y variantes visuales por perfil.

### Excluido

- Autenticación real, sesiones y recuperación de contraseña.
- Controladores, endpoints API y middleware de autorización.
- Migraciones, seeders o cambios de base de datos.
- Persistencia de roles, permisos o actividad clínica.
- CRUD de pacientes, historias clínicas u odontograma.
- Integración del odontograma temporal proporcionado en `ClinicaRamos.rar`.

## Dirección visual aprobada

La identidad combina dos direcciones:

- Base institucional clínica: azul institucional como color dominante, turquesa para acciones y estados clínicos.
- Toque académico ejecutivo: dorado usado de forma limitada en identidad, supervisión docente y elementos que requieren validación.

El resultado debe sentirse universitario, clínico, sobrio y moderno. Se evitarán gradientes excesivos, tarjetas decorativas sin función y una densidad visual innecesaria.

## Arquitectura de frontend

La interfaz se organizará en componentes React pequeños y presentacionales:

- `App`: controla únicamente qué demostración visual está visible.
- `LoginPage`: formulario visual, identidad institucional y selector de perfil de demostración.
- `DashboardPage`: compone la variante correspondiente al perfil seleccionado.
- `DashboardLayout`: sidebar, topbar y área principal responsive.
- `Sidebar`: navegación visible según el perfil de demostración.
- `DashboardHeader`: saludo, perfil y acción principal.
- `MetricCard`: métrica con semántica clínica o académica.
- `ActivityTable`: actividad reciente con estados visuales.
- `QuickActions`: accesos principales del perfil.
- `EmptyState`, `ErrorState` y `LoadingState`: ejemplos visuales reutilizables.

Los datos estarán definidos en archivos locales de configuración. No se realizarán solicitudes HTTP ni se simulará seguridad en el cliente.

## Adaptación de la estructura ASCIENTIFICOS

ASCIENTIFICOS se usa como referencia de organización, no como fuente de código. Su separación `capacliente → controllers → capalogica → capaconexion` se traduce a convenciones de Laravel y React de la siguiente manera:

| ASCIENTIFICOS | Odontología UNDAC |
|---|---|
| `capacliente/` | aplicación React completa en `resources/js/app/` |
| `resources/js` y `resources/css` | `resources/js` y `resources/css`, compilados por Vite |
| `controllers/<modulo>/` | `app/Http/Controllers/<Modulo>/` en fases futuras |
| `capalogica/<modulo>/Service.php` | `app/Services/<Modulo>/` en fases futuras |
| `capaconexion/` | configuración nativa de Laravel en `config/database.php` y variables de entorno |
| módulos paralelos por carpeta | `resources/js/features/<modulo>/` y capas Laravel equivalentes |

Para esta entrega visual se usará la siguiente estructura:

```text
resources/
├── css/
│   ├── app.css
│   └── app/
│       ├── dashboard.css
│       ├── login.css
│       └── tokens.css
├── js/
│   ├── app/
│   │   ├── components/
│   │   │   ├── dashboard/
│   │   │   └── ui/
│   │   ├── config/
│   │   │   └── roleDashboards.js
│   │   ├── layouts/
│   │   │   └── DashboardLayout.jsx
│   │   ├── pages/
│   │   │   ├── DashboardPage.jsx
│   │   │   └── LoginPage.jsx
│   │   ├── tests/
│   │   └── App.jsx
│   └── app.js
└── views/
    └── app.blade.php
```

La carpeta `composer/app/` seguirá reservada para el backend PHP de Laravel. La capa cliente equivalente a ASCIENTIFICOS será `composer/resources/js/app/`. El archivo `composer/public/index.php` ya es el punto de entrada HTTP oficial de Laravel y no se reemplazará; `app.blade.php` y `resources/js/app.js` serán los puntos de entrada de la interfaz React.

Los módulos posteriores conservarán el paralelismo por dominio observado en ASCIENTIFICOS. Por ejemplo, Historia Clínica, Personas y Odontograma tendrán carpetas de frontend propias y, cuando se autorice la lógica, controladores y servicios Laravel equivalentes.

No se copiarán artefactos del comprimido que no forman parte de la arquitectura: `vendor`, `.idea`, archivos de configuración local, volcados SQL, comprobantes, registros de error, herramientas MCP o datos sensibles.

## Pantalla de inicio de sesión

En escritorio se usará una composición dividida:

- Panel institucional con identidad de Odontología UNDAC, mensaje principal y referencia a la clínica universitaria.
- Panel de formulario con correo institucional, contraseña, opción de recordar y enlace visual de recuperación.

En móvil, el panel institucional se compactará sobre el formulario. El botón de acceso permitirá avanzar a la demostración del dashboard sin validar credenciales. El selector de perfil estará identificado explícitamente como control de demostración para no confundirse con una función definitiva.

## Dashboard adaptable por perfil

### Administrador

- Métricas: usuarios activos, historias registradas, actividad reciente y alertas.
- Navegación: resumen, usuarios y roles, historias clínicas, pacientes, auditoría y configuración.
- Acción principal: registrar usuario.

### Docente

- Métricas: alumnos asignados, historias por revisar, firmas pendientes y controles del día.
- Navegación: resumen, alumnos, historias supervisadas, validaciones, seguimientos y auditoría académica.
- Acción principal: revisar pendientes.

### Alumno operador

- Métricas: historias activas, pendientes de validación, controles del día y registros incompletos.
- Navegación: resumen, historias clínicas, pacientes, seguimientos y recursos clínicos.
- Acción principal: nueva historia clínica.

Los accesos a módulos aún no desarrollados serán elementos visuales sin navegación funcional.

## Adaptabilidad y accesibilidad

- Sidebar persistente en escritorio y panel desplegable en móvil.
- Tablas convertidas en listas legibles cuando el ancho sea reducido.
- Controles con etiquetas visibles, estados de foco y contraste suficiente.
- Navegación operable con teclado en las interacciones presentacionales.
- Iconos acompañados de texto cuando comuniquen una acción.
- Respeto por preferencias de movimiento reducido.

## Manejo visual de estados

Los estados no representarán respuestas reales del servidor. Se crearán variantes demostrativas para definir el lenguaje visual futuro:

- Cargando: skeletons discretos.
- Vacío: mensaje contextual y acción sugerida.
- Error: aviso claro sin exponer detalles técnicos.
- Sesión expirada: modal o aviso de retorno al login, únicamente como muestra.

## Estrategia de pruebas

- Verificar que login y dashboard se rendericen sin errores.
- Verificar que cada perfil muestre su navegación, métricas y acción principal correspondientes.
- Verificar la transición demostrativa entre login y dashboard.
- Verificar controles accesibles mediante nombre y rol.
- Ejecutar la compilación de producción de Vite.
- Revisar visualmente escritorio y móvil en el navegador.

## Referencia futura de odontograma

El archivo `ClinicaRamos.rar` se conserva como referencia conceptual para una fase posterior. Contiene dentición permanente y temporal con nomenclatura FDI, cinco superficies por pieza, observaciones y estados clínicos por pieza o superficie. Su futura implementación será reescrita como componentes React con un modelo de datos explícito; no se copiará el código PHP/jQuery ni se integrará en esta entrega.

## Criterios de aceptación

- La aplicación presenta una pantalla de login pulida y responsive.
- Desde el modo de demostración puede visualizarse el dashboard de los tres perfiles.
- Cada perfil cambia navegación, métricas, actividad y acción principal.
- La identidad aprobada se mantiene consistente en ambas pantallas.
- No existen cambios de lógica de negocio, autenticación, API o base de datos.
- La compilación frontend y las pruebas de componentes definidas pasan correctamente, y la revisión visual confirma el comportamiento responsive.
