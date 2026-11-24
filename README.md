# PlataformaOva

Plataforma de aprendizaje desarrollada con Angular 22 y pnpm.

## Servidor de desarrollo

Instala las dependencias con `pnpm install` y ejecuta `pnpm start`.

- Todas las rutas de la aplicación muestran las pantallas con el sistema atómico de CSS bajo `/nuevo`.
- Las rutas antiguas redirigen a sus equivalentes en `/nuevo`; por ejemplo, `/login` redirige a `/nuevo/login`.
- La ruta `http://localhost:4200/nuevo` muestra la bienvenida y luego continúa al inicio de sesión.
- La barra de navegación permite cambiar entre tema claro y oscuro; la preferencia se guarda en el navegador y se sincroniza con las actividades locales. El contenido de servicios externos conserva su propio tema.
- Las actividades HTML de `src/assets/h5p` comparten `src/assets/css/activity-theme.css` y los mismos tokens de color que la aplicación. La actividad eXe añade `src/assets/css/h5p-exe-theme.css` sin quitar las hojas necesarias para que funcione el juego.

## Generar componentes

Ejecuta `pnpm ng generate component component-name` para crear un componente. También puedes usar `pnpm ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Compilación

Ejecuta `pnpm build` para compilar el proyecto. Los archivos generados se guardan en `dist/`.

## Pruebas unitarias

Ejecuta `pnpm test` para correr las pruebas unitarias con Karma.

## Pruebas end-to-end

Ejecuta `pnpm ng e2e` para correr pruebas end-to-end. Primero debes agregar un paquete que implemente esa plataforma de pruebas.

## Ayuda

Para más información sobre Angular CLI, ejecuta `pnpm ng help` o consulta la [referencia de Angular CLI](https://angular.dev/tools/cli).
