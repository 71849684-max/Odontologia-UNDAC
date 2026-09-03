# Frontend UI Changelog

Fecha: 3 de septiembre de 2026

## Alcance

Optimización exclusiva de la interfaz React/Vite del Sistema de Historia Clínica Digital Odontológica UNDAC. No se modificó backend, base de datos, endpoints ni persistencia.

## Archivos creados

- `frontend/src/aplicacion/paginas/UsuariosApp.jsx`: indicadores, búsqueda, filtro y tabla adaptable de usuarios.
- `frontend/src/aplicacion/paginas/AuditoriaApp.jsx`: bitácora mock con filtros, badges y trazabilidad.
- `frontend/src/aplicacion/paginas/ConfiguracionApp.jsx`: parámetros institucionales, clínicos, académicos y de seguridad.
- `frontend/src/aplicacion/paginas/SeguimientoApp.jsx`: agenda de seguimiento y bandeja docente de pendientes.
- `frontend/src/aplicacion/paginas/VistaNoDisponible.jsx`: estado de respaldo para impedir pantallas en blanco.

## Archivos modificados

- `frontend/src/aplicacion/Aplicacion.jsx`: mapa central de vistas, soporte para todos los IDs de menú, evento `hc:navigate`, sesión mock y salida funcional.
- `frontend/src/aplicacion/configuracion/menuPorRol.js`: acceso a nueva historia dentro de Gestión clínica para administración.
- `frontend/src/aplicacion/disenos/AppLayout.jsx`: ruta activa controlada y breadcrumbs contextuales.
- `frontend/src/aplicacion/disenos/DisenoPanel.jsx`: cierre del drawer al navegar y con tecla Escape.
- `frontend/src/aplicacion/componentes/interfaz/SidebarHC.jsx`: grupos desplegables, iconos, estado activo y atributos ARIA.
- `frontend/src/aplicacion/componentes/interfaz/HeaderBar.jsx`, `UserMenu.jsx` y `NotificationMenu.jsx`: cierre de sesión conectado, rol legible y notificaciones accesibles.
- `frontend/src/aplicacion/paginas/PaginaAcceso.jsx`: eliminación del selector de rol y detección automática mock por correo institucional.
- `frontend/src/aplicacion/paginas/DashboardApp.jsx`: saludo, contexto académico, indicadores, actividad, acciones por rol, pendientes e historias recientes.
- `frontend/src/aplicacion/paginas/PacientesApp.jsx`: resumen, búsqueda, filtro, tabla desktop/tarjetas mobile y estado vacío.
- `frontend/src/aplicacion/paginas/HistoriasApp.jsx`: indicadores, búsqueda, filtro, tabla, progreso y estado vacío.
- Hojas CSS de acceso, panel e historia clínica: tokens semánticos, responsive, drawer, tablas, dashboard y configuración.
- Pruebas de aplicación y estructura clínica: navegación activa actualizada y compatibilidad completa con Vitest.

## Archivos eliminados

Ninguno.

## Componentes reutilizados

- `AppLayout`, `DisenoPanel`, `HeaderBar`, `Breadcrumbs`, `SidebarHC`.
- `StatusBadge`, `ProgressBar`, `EstadoVacio`, `NotificationMenu`, `UserMenu`.
- Mocks existentes de pacientes, historias, usuarios y notificaciones.
- Flujo completo de `HistoriaClinica`, sus 17 secciones y su odontograma.

## Problemas encontrados y corregidos

1. Los encabezados de grupos del sidebar navegaban a IDs sin vista y dejaban el contenido vacío.
2. Los submenús estaban siempre visibles y no funcionaban como desplegables.
3. `usuarios`, `auditoria`, `configuracion`, `pendientes`, `seguimiento` y `mis-seguimientos` no tenían salida en `Aplicacion.jsx`.
4. El botón Cerrar sesión no tenía una acción conectada.
5. El login dependía de un selector manual de perfil.
6. El estado activo del sidebar no seguía la navegación iniciada desde tarjetas o botones del contenido.
7. Los breadcrumbs mostraban IDs técnicos en lugar de etiquetas contextuales.
8. La barra de filtros producía desbordamiento horizontal a 1024 px.
9. La prueba clínica basada en `node:test` no era reconocida correctamente por el runner Vitest.

## Comportamiento del acceso mock

Hasta que exista autenticación real, el perfil se infiere del correo ingresado:

- Correos que contienen `admin` o `administrador`: Administrador.
- Correos que contienen `docente`, `profesor` o `doctor`: Docente.
- Cualquier otro correo: Alumno operador.

Esta regla es exclusivamente presentacional y debe sustituirse por el rol devuelto por el backend cuando se implemente autenticación.

## Validación

- `npm test`: 4 archivos y 34 pruebas aprobadas.
- `npm run build`: compilación Vite de producción aprobada.
- Navegación verificada: Inicio, Pacientes, Historias clínicas, Nueva historia clínica, Historia clínica, Usuarios, Permisos por usuario, Auditoría, Configuración, Pendientes y Seguimiento.
- Historia clínica verificada con sus 17 secciones institucionales.
- Responsive medido en 1920, 1440, 1366, 1024, 768, 480 y 375 px sin overflow horizontal.
- Drawer móvil verificado: overlay, tecla Escape y cierre automático al seleccionar una opción.

## Pendientes de backend

- Sustituir detección mock de perfil por autenticación y autorización reales.
- Conectar CRUD de pacientes, historias y usuarios.
- Persistir permisos individuales y configuración.
- Registrar auditoría real y proteger datos clínicos.
- Implementar exportación PDF, carga de archivos, firma y notificaciones reales.
