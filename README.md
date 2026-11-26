# Plataforma OVA

**Sitio publicado:** [https://lmjurado.github.io/test-angular-atomic-css/](https://lmjurado.github.io/test-angular-atomic-css/)

Plataforma académica construida con Angular 22. Conserva la experiencia visual y los recursos existentes, y organiza el acceso a datos mediante repositorios para permitir cambiar LocalStorage por un servicio remoto en una fase posterior.

## Arquitectura

- `src/app/core/models`: modelos de usuarios, contenidos y progreso.
- `src/app/core/repositories/contracts`: contratos de usuarios y autenticación.
- `src/app/core/repositories/implementations`: adaptadores locales para usuarios, autenticación y contenido.
- `src/app/core/repositories/learning.repository.ts`: contrato CRUD de módulos, temas, recursos y actividades.
- `src/app/core/repositories/progress.repository.ts`: persistencia de progreso.
- `src/app/services`: lógica de sesión, progreso y preferencias de interfaz.
- `src/app/features`: aprendizaje, autenticación y administración.
- `src/app/pages/modern/logic`: lógica de las pantallas existentes.
- `src/app/shared`: controles reutilizables, incluida la paginación.
- `src/app/css`: estilos organizados con Atomic Design.

Los componentes llaman servicios y repositorios; los adaptadores de persistencia son la única capa de la aplicación que lee o escribe los datos académicos y de usuario en LocalStorage. Las interfaces de repositorio devuelven `Promise`, de modo que una implementación remota puede sustituir los adaptadores locales mediante inyección de dependencias.

## Modelos y persistencia

Los usuarios tienen identificador, nombre, correo, rol (`ADMIN` o `STUDENT`), estado y fechas de creación y actualización. Los contenidos usan módulos y temas con identificadores únicos dentro de su módulo; cada tema contiene recursos y actividades. El progreso se guarda en una clave distinta por usuario.

Las claves nuevas usan el prefijo `plataforma-ova.*` y el esquema registra su versión. Al iniciar, se cargan los contenidos predeterminados solo cuando aún no existen datos; los usuarios anteriores se migran cuando es posible y sus contraseñas se convierten en hashes PBKDF2 con sal. No se reemplazan los cambios ya guardados. El progreso antiguo se migra al identificador del usuario que inicia sesión.

Para reiniciar los datos locales, cierra la aplicación y elimina del almacenamiento del sitio las claves `plataforma-ova.users.v1`, `plataforma-ova.session.v1`, `plataforma-ova.learning.v1`, `plataforma-ova.progress.*` y `plataforma-ova.schema-version`. Al cargar de nuevo se inicializará el contenido de demostración. Esta operación es explícita y elimina los cambios guardados localmente.

## Autenticación de demostración

La autenticación está aislada en `AuthRepository` y `UserRepository`. Las cuentas iniciales son:

| Usuario | Rol | Correo |
| --- | --- | --- |
| `Merculeaft` | ADMIN | `merculeaft@demo.local` |
| `Gabomac211` | ADMIN | `gabomac211@demo.local` |
| `123456` | STUDENT | `prueba@academia.local` |

Las claves iniciales de las cuentas administrativas son las entregadas al propietario durante la configuración; no se incluyen en este archivo ni en texto plano en el código. La cuenta de estudiante usa credenciales de demostración locales. Los hashes PBKDF2 y las sesiones permanecen en el navegador. Esta autenticación y los guards solo sirven para demostración: cualquier usuario puede alterar el almacenamiento local y no se debe usar para proteger datos o permisos en producción.

## Experiencia y rutas

Las pantallas académicas existentes están protegidas para estudiantes autenticados. El rol decide la navegación; el guard administrativo protege el área de gestión.

- Entrada y autenticación: `/nuevo/login`, `/nuevo/registro`, `/nuevo/olvido-contrasena`.
- Aprendizaje: `/nuevo/inicio`, `/nuevo/modulo/:id`, `/nuevo/modulo/:modId/tema/:topicId` y las rutas de actividad, actividad interactiva, evaluación y recursos.
- Administración: `/nuevo/admin`, `/nuevo/admin/modulos`, `/nuevo/admin/modulos/crear`, `/nuevo/admin/modulos/editar/:id`, `/nuevo/admin/temas`, `/nuevo/admin/recursos`, `/nuevo/admin/actividades` y `/nuevo/admin/usuarios`.

El panel permite gestionar módulos, temas, recursos, actividades y cuentas. Solicita confirmación antes de eliminar, y evita eliminar, desactivar o degradar al último administrador activo. El contenido H5P existente se conserva.

## Ejecutar el proyecto

Requiere Node.js compatible con Angular 22 y pnpm. Instala dependencias y ejecuta el servidor local:

```sh
pnpm install
pnpm start
```

Abre `http://localhost:4200/`. La compilación se verifica con `pnpm build` y las pruebas unitarias con `pnpm test -- --watch=false --browsers=ChromeHeadless`.

## Migración futura a Supabase o API REST

Implementa los contratos existentes con nuevos adaptadores remotos y regístralos en `CoreModule`. Los componentes y servicios de presentación conservan sus contratos; los datos locales se podrán migrar mediante un proceso versionado. Para producción, reemplaza también la autenticación de demostración por un proveedor seguro y aplica autorización del lado del servidor.
