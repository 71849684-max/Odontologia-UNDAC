# Odontologia-UNDAC

Sistema clínico-académico para la Facultad de Odontología de la UNDAC. Gestiona pacientes,
historias clínicas, odontograma y la gestión académica de cursos, grupos y rotaciones.

Los roles son `administrador`, `docente` y `alumno`. El alumno registra historia clínica;
el docente la valida y supervisa; el administrador gestiona usuarios, permisos y configuración.

## Estructura

- `backend/` — API Laravel 13 (PHP 8.3)
- `frontend/` — SPA React 19 con Vite 8
- `docs/` — especificaciones y planes de implementación
- `bd_clinica_undac.sql` — esquema de referencia de MySQL

Todo el código, los nombres de archivo, los identificadores y los mensajes visibles al
usuario están en español. No traduzcas nada al inglés.

## Comandos

```bash
# backend (ejecutar desde backend/)
composer setup      # install + copia .env + key:generate
composer dev         # php artisan serve
composer test        # php artisan test
vendor/bin/pint --test   # revisar estilo sin escribir

# frontend (ejecutar desde frontend/)
npm run dev
npm run test         # vitest run
npm run test:watch
npm run build
```

## Backend

### Arquitectura

Cada contexto de dominio vive en `backend/app/{Contexto}/`. Hoy hay tres, con dos estilos
distintos. Sigue el del contexto donde trabajas, no inventes un tercero.

**`Identidad` usa arquitectura hexagonal.** Es el contexto más completo y el patrón de
referencia:

```
Identidad/
├── Dominio/
│   ├── Cuenta.php                  entidad
│   ├── ClaveCuenta.php             valor objeto
│   ├── ContextoOperacion.php       valor objeto (actor, IP, trazabilidad)
│   ├── Contratos/                  PUERTOS: interfaces puras
│   └── Excepciones/                errores de negocio
├── Aplicacion/
│   └── {Feature}/                  casos de uso, uno por archivo
│       ├── Acceso/  Usuarios/  Permisos/
│       ├── Configuracion/  Auditoria/  Administracion/
├── Infraestructura/
│   ├── Persistencia/               Repositorio*Eloquent y Repositorio*Sql
│   │   └── Eloquent/               modelos (Usuario, Rol, Persona)
│   └── Acceso/                     VerificadorContrasenaHash, GestorSesionLaravel...
└── Http/
    ├── Controladores/
    ├── Solicitudes/                Form Requests
    ├── Middleware/
    └── ContextoDesdePeticion.php
```

**`Clinica` y `Academico` usan clases de servicio**, sin puertos ni adaptadores todavía:

```
Clinica/
├── Pacientes/ServicioPacientes.php
├── Odontograma/ServicioOdontograma.php
├── Historias/ServicioHistorias.php
├── Expediente/ServicioExpediente.php
├── Soporte/Valores.php
└── Http/
    ├── Controladores/
    ├── Middleware/AsegurarSubmodulo.php
    └── RespondeOperacion.php
```

### Reglas de capas

El flujo es siempre `Http → Aplicacion → Dominio → Infraestructura`. Un controlador nunca
habla con Eloquent. Un caso de uso recibe sus dependencias por constructor inyectada con
`private readonly`, nunca por facade ni `app()`.

```php
class CrearUsuario
{
    public function __construct(
        private readonly RepositorioUsuarios $usuarios,
        private readonly RegistradorAuditoria $auditoria,
    ) {}

    public function ejecutar(array $datos, int $idOperador, ContextoOperacion $contexto): array
    {
        // ...
    }
}
```

El método de un caso de uso se llama `ejecutar`. Devuelve el payload serializado como
`array`, no la entidad. La serialización es responsabilidad del repositorio mediante
`serializar($entidad): array`.

### Puertos

Los contratos de `Dominio/Contratos/` son interfaces sin dependencia de Laravel. Declara
tipos con PHPDoc cuando el array tiene forma conocida:

```php
/**
 * @param  array{q?: string, rol?: string, estado?: mixed}  $filtros
 * @return list<array<string, mixed>>
 */
public function listar(array $filtros): array;
```

Cuando agregas un caso de uso, define o amplía el puerto en `Dominio/Contratos/` primero y
luego su implementación en `Infraestructura/Persistencia/`. Elige el sufijo según el mecanismo:
`...Eloquent` si usa modelos de Eloquent, `...Sql` si construye consultas a mano.

### Errores de negocio

Las excepciones de `Dominio/Excepciones/` llevan un `campo` público. Ese campo es la clave
con la que el frontend ubica el error en el input correspondiente.

```php
throw new OperacionNoPermitida('nombreUsuario', 'El nombre de usuario ya está en uso.');
```

El controlador la convierte en error de validación de Laravel:

```php
try {
    $payload = $this->crearUsuario->ejecutar($solicitud->validated(), $operador->clave(), $contexto);
} catch (OperacionNoPermitida $excepcion) {
    throw ValidationException::withMessages([$excepcion->campo => $excepcion->getMessage()]);
}
```

En `Clinica` no repitas ese bloque en cada acción. Usa el trait `RespondeOperacion`, que
llama a `$this->operacion(fn () => ...)`. Además traduce los `SIGNAL` de MySQL
(SQLSTATE `45000` o código `1644`) a un error de validación con clave `datos`. Si una regla
ya vive en un trigger de la base de datos, deja que la base la imponga y captúrala ahí.

### Auditoría

Todo caso de uso que modifique datos registra al final, con el mismo `ContextoOperacion`
que recibió:

```php
$this->auditoria->registrar($contexto, 'usuario_docente', $cuenta->clave(), 'CREAR', null, $serializado);
```

### Rutas

`backend/routes/api.php` agrupa por módulo, y cada grupo lleva su middleware. Los códigos de
módulo van en mayúsculas y coinciden con `PERMISOS_USUARIO` del frontend.

| Middleware | Ejemplo | Protege |
| --- | --- | --- |
| `auth` | sobre todo el grupo privado | sesión iniciada |
| `usuario.activo` | junto a `auth` | cuenta no bloqueada |
| `acceso:MAYUSCULA` | `acceso:PACIENTES`, `acceso:HISTORIAS`, `acceso:CURSOS` | permiso del módulo |
| `rol:ADMINISTRADOR` | grupo `admin/` | rol administrador |

Todo endpoint nuevo de administración nace dentro del grupo `admin`. Usa verbos y nombres
de ruta en español (`pacientes.index`, `historias.expediente.update`).

## Frontend

### Estructura

```
frontend/src/
├── principal.jsx                    punto de entrada
├── css/app.css                      importa tailwindcss y todas las hojas de estilo
├── aplicacion/
│   ├── servicios/                   capa HTTP y adaptadores de datos
│   ├── paginas/                     *App.jsx de cada vista
│   ├── formularios/                 un directorio por característica
│   │   ├── compartidos/             controles clínicos reutilizables
│   │   ├── {feature}/{Modulo}Section.jsx
│   │   └── {feature}/{feature}.config.mjs
│   ├── disenos/                     AppLayout.jsx, DisenoPanel.jsx
│   ├── configuracion/               permisos.js, menuPorRol.js
│   ├── componentes/                 panel/, modulos/
│   └── pruebas/                     pruebas globales y setup de Vitest
```

Los nombres de archivo van en español. Componentes en PascalCase (`Odontograma.jsx`),
el resto en camelCase (`clienteHttp.js`). Una sección clínica siempre termina en
`Section.jsx`.

### Capa de servicios

`servicioClinico.js`, `servicioAutenticacion.js` y compañía no hacen `fetch` a mano. Usan
`clienteHttp`, que maneja la cookie `XSRF-TOKEN`, el reintento tras un `419` y la clase
`ErrorHttp` con `estado`, `errores` y `cuerpo`.

Cada función de servicio que consulta el servidor empieza con `sinRedEnPrueba()`. Vitest
corre sin red, y esa línea hace que una prueba que olvide el mock falle en vez de colgar:

```js
export async function listarPacientes() {
    sinRedEnPrueba();
    return (await clienteHttp.obtener('/pacientes'))?.data ?? [];
}
```

Para leer el mensaje de un error usa `mensajeError(error, respaldo)`. Devuelve el primer
campo con error si el backend respondió con validaciones.

### Controles clínicos

`formularios/compartidos/ControlesClinicos.jsx` expone el vocabulario visual del historial
clínico: `Field`, `TextAreaField`, `SelectField`, `ChoiceGroup`, `CheckboxGroup`,
`CollapsibleSection`, `SectionCard`, `StatusBadge`, `ProgressBar`. `ControlesCarga.jsx`
tiene los estados de carga.

Una sección recibe `values` y `onChange`, y usa `useSection` para el acceso declarativo:

```jsx
export default function AnamnesisSection({ values, onChange }) {
    const { get, set } = useSection(values, onChange);
    return <CollapsibleSection title="Motivo de consulta" status={get('motivoConsulta') ? 'progress' : 'pending'}>
        <TextAreaField label="Motivo de consulta" value={get('motivoConsulta')} onChange={set('motivoConsulta')} rows={3} />
    </CollapsibleSection>;
}
```

Antepones las constantes de una característica en `{feature}.config.mjs` en lugar de
escribirlas dentro del JSX.

### Diseño visual

El sistema de diseño es CSS propio con variables, no utilitarios de Tailwind. Tailwind está
importado en `app.css` pero las vistas existentes usan las clases `undac-*` y `ou-*`. Sigue
esa convención en lo que ya existe.

Los tokens viven en `frontend/src/css/aplicacion/variables.css`:

- `--ou-navy-*`, `--ou-teal-*`, `--ou-gold-*` y los alias semánticos `--color-primary`,
  `--color-accent`, `--color-surface`, `--color-danger`
- `--undac-navy`, `--undac-blue`, `--undac-cyan` y su propio conjunto de aliados

No uses colores literales en componentes nuevos. Usa los alias semánticos, que son los que
sostienen el modo claro y oscuro.

La escala de `z-index` está centralizada y resuelve el conflicto entre encabezados sticky
del historial clínica y los menús superpuestos. Respétala en lugar de declarar valores
sueltos:

```
--ou-z-content 1      --ou-z-sticky 20     --ou-z-clinical-nav 60
--ou-z-header 100     --ou-z-popover 200   --ou-z-overlay 300
--ou-z-drawer 400     --ou-z-floating 500  --ou-z-toast 600     --ou-z-modal 1000
```

### Accesibilidad

Los controles usan `React.useId()` para vincular etiqueta e input, y las secciones
colapsables declaran `aria-expanded`, `aria-controls` y `role="region"`. Mantén eso en
cualquier control nuevo.

### Pruebas

Las pruebas de frontend viven en dos sitios: las globales en `aplicacion/pruebas/`, y las
de un módulo junto al propio componente (`odontograma/odontograma.test.jsx`). Sigue el
sitio que ya use el módulo donde trabajas.

## Reglas que no se negocian

1. Nada de inglés visible al usuario, en código, en rutas ni en mensajes.
2. El controlador no toca Eloquent ni construye consultas.
3. Los errores de negocio salen como `ValidationException` con la clave del campo afectado.
4. Ninguna función de servicio consulta la red sin `sinRedEnPrueba()` antes.
5. Ningún color literal donde exista un alias semántico.
6. Ningún `z-index` suelto fuera de la escala de `variables.css`.
7. La auditoría se registra en todo caso de uso que modifique datos.

## Documentación

- `docs/superpowers/specs/` — especificaciones de diseño por fecha
- `docs/superpowers/plans/` — planes de implementación por fecha
- `docs/MATRIZ_COMPONENTES.md`, `docs/MATRIZ_INTERFACES_HISTORIA_CLINICA.md`
- `docs/odontograma-nts188.md` y su nota de conformidad: reglas de la norma técnica
- `frontend/FORMULARIOS.md`

Antes de tocar la historia clínica o el odontograma, lee las especificaciones y matrices
correspondientes. Ahí están las decisiones ya tomadas.
