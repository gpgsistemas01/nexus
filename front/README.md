# Nexus · Frontend

Cliente web de Nexus para consultar inventario, registrar compras y salidas y operar
materiales, consumibles y mermas según los permisos de la cuenta. Incluye catálogos,
Personas, Usuarios, Clientes, Proveedores, Movimientos y reportes autorizados.

La aplicación usa Vue 3, TypeScript, Composition API (`<script setup>`) y Vite.
El login en `/inicio-sesion` usa Vuetify y VeeValidate y consume la API del sistema.
La [descripción del producto](docs/requirements/vision-scope-and-requirements/03-product-description.md)
presenta su uso operativo y el [alcance](docs/requirements/vision-scope-and-requirements/06-current-scope.md)
identifica las capacidades vigentes.

## Iniciar sesión

Abre `http://localhost:5173/inicio-sesion` con Express ejecutándose en el puerto 3000.
Vite dirige la API y el cierre de sesión al backend mediante un proxy del mismo origen.
El menú agrupa Almacén, [Compras](docs/architecture/views/development/frontend-technical-documentation/06-purchases.md), [Salidas](docs/architecture/views/development/frontend-technical-documentation/07-issues.md), [Movimientos](docs/architecture/views/development/frontend-technical-documentation/05-movements.md), [Identidad y acceso y Directorio comercial](docs/architecture/views/development/frontend-technical-documentation/04-identity-and-directory.md)
y los seis [Catálogos](docs/architecture/views/development/frontend-technical-documentation/03-catalogs.md),
con enlaces filtrados por permiso.
Usa una cuenta existente: al autenticar se abre el primer módulo permitido; una
cuenta exclusiva de Catálogos entra a Áreas. Consulta
[diseño, validación y sesión](docs/architecture/views/development/frontend-technical-documentation/01-authentication.md), y [configuración del proxy](docs/development/03-build-and-deployment.md).

## Desarrollo

Para preparar una copia desde cero, configurar `.env`, generar Prisma y arrancar
ambas aplicaciones en terminales separadas, sigue la
[guía de inicio paso a paso](docs/development/01-getting-started.md). Los comandos siguientes son
el resumen del frontend; la [documentación Vue](docs/index.md) conserva los criterios
y las fuentes de cada guía.

Usa Node.js 24.15.0 o superior de la rama 24, Node.js 22.22.2 o superior de la rama 22,
o Node.js 26.12.1 o superior de la rama 26.
Las herramientas de pruebas están fijadas a versiones compatibles; instala con `npm ci`
para conservar esa combinación.
Desde la raíz del repositorio:

```bash
cd front
npm ci
npm run dev
```

Abre la URL que muestra Vite en la terminal. Express se inicia por separado desde
`back/` con `npm run dev`. Para otro destino del proxy define `BACKEND_PROXY_TARGET`
en `front/.env.local` y reinicia Vite; hay un ejemplo en `.env.example`.
La [preparación del archivo local](docs/development/01-getting-started.md#configurar-frontenvlocal-para-vue)
explica desde qué carpeta copiarlo, los valores permitidos, la prioridad y los
cambios de desarrollo a producción. `.env.example` es la plantilla; la copia
ignorada `.env.local` es la que utiliza Vite.
Vite usa el puerto 5173 con `strictPort`: si está ocupado avisa en lugar de abrir
silenciosamente otro puerto.

## Dependencias no resueltas en Vite

Si aparece `Failed to resolve import "vee-validate"` o `Failed to run dependency
scan`, Vite no encuentra una dependencia importada por el login en esa copia
local. `vee-validate@^4.15.1` está declarado en `front/package.json` y fijado en
`front/package-lock.json`; la instalación de `back/` no instala lo necesario para
Vue. Las líneas `dependencies optimized` de otras bibliotecas no corrigen ese fallo.

Detén Vite con Ctrl+C. Desde la raíz del repositorio:

```bash
npm --prefix front ci --include=dev
npm --prefix front ls vee-validate --depth=0
npm --prefix front run dev -- --force
```

La instalación debe terminar correctamente y `ls` debe mostrar `vee-validate`
sin errores de dependencia ausente. `--force` rehace la caché de optimización al
arrancar Vite; no instala paquetes. No basta con recargar la pestaña del navegador.

Si `vee-validate` no aparece en los dos archivos de paquetes, comprueba que estás
en la rama `features` actualizada y en la misma copia que está ejecutando Vite.
Si `npm ci` falla o la dependencia sigue ausente, conserva su salida completa
para diagnosticar la instalación antes de volver a arrancar el servidor. No agregues
la dependencia al backend ni modifiques su versión para ocultar el error.

La ubicación y preparación de `.env`, dependencias, cachés y cliente Prisma están
en [archivos locales ignorados](../README.md#archivos-locales-ignorados-y-cambio-de-estructura).

## Compilación y vista previa

Desde `front/`:

```bash
npm run build
npm run preview
```

`build` genera `front/dist/`. `preview` permite revisar localmente esa compilación;
para producción se publican los archivos de `dist/` mediante el proveedor o servidor
estático elegido. El servidor de desarrollo de Vite no es el servidor de producción.

También puedes ejecutar desde la raíz, sin cambiar de directorio:

```bash
npm --prefix front ci
npm --prefix front run dev
npm --prefix front run build
```

## Navegación con Vue Router

Vue Router 5 se mantiene en `front/package.json` y `front/package-lock.json`.
Al clonar el repositorio basta con `npm ci`; la dependencia está en el lockfile.

- `/` redirige a `/inicio-sesion`, el login operativo.
- `/almacen` selecciona el primer módulo permitido para la cuenta.
- `/almacen/materiales`, `/almacen/consumibles` y `/almacen/mermas` son los módulos
  operativos, con sesión y permisos obtenidos de Express.
- `/salidas/materiales`, `/salidas/consumibles` y `/salidas/mermas` permiten solicitar, surtir y devolver; `/salidas` abre la primera variante autorizada. Consulta [modos y contratos](docs/architecture/views/development/frontend-technical-documentation/07-issues.md).
- `/compras/materiales` y `/compras/consumibles` permiten gestionar compras; `/compras` abre la primera variante autorizada. Consulta [campos y contratos](docs/architecture/views/development/frontend-technical-documentation/06-purchases.md).
- `/catalogos` abre Áreas; sus seis rutas requieren `catalogs:manage`. Consulta
  [campos, endpoints y arquitectura](docs/architecture/views/development/frontend-technical-documentation/03-catalogs.md).
- `/identidad/personas` y `/identidad/usuarios` mantienen formularios distintos.
- `/directorio/clientes` y `/directorio/proveedores` mantienen los registros comerciales.
- `/identidad` y `/directorio` seleccionan el primer módulo permitido de su sección.
- Una URL desconocida muestra la página no encontrada con un enlace al inicio.

`main.ts` crea la sesión, la proporciona y registra el router con esa instancia. `App.vue` usa
`RouterView`, y las páginas se cargan bajo demanda. Para agregar una página, crea
su contenedor en el módulo correspondiente y registra su ruta en
`src/app/router/index.ts`. Usa `RouterLink` para enlaces internos o `router.push`
para navegar desde una operación. Un enlace HTML normal se mantiene para sitios externos.

En desarrollo usa `npm run dev` y abre `/inicio-sesion`. También puedes entrar directamente
a esa dirección o recargarla. Para producción, el servidor debe devolver `index.html`
al solicitar una ruta de la aplicación:

- Nginx: lo configura `nginx.conf`.
- Vercel: `front/vercel.json` configura el fallback SPA al desplegar con `front`
  como Root Directory. El proxy de `/api` y `/cerrar-sesion` hacia Express debe
  configurarse antes del fallback para usar la autenticación.
- Render Static Site: agrega en Redirects/Rewrites la fuente `/*`, destino
  `/index.html` y acción **Rewrite**.

La página no encontrada se renderiza en el navegador; el fallback del servidor puede
responder HTTP 200. El fallback debe ir después de los rewrites de API y cierre de sesión para
que el login funcione en producción. La autorización definitiva permanece en Express;
las guardas de las rutas protegidas comprueban la sesión y orientan la navegación, sin sustituir
los controles del servidor. `/almacen` resuelve al cliente mediante Vue Router.

Consulta [operaciones, reutilización y límites de Almacén](docs/architecture/views/development/frontend-technical-documentation/02-warehouse.md).

## Herramientas y comprobaciones

| Comando desde `front/` | Función |
| --- | --- |
| `npm run dev` | Servidor de desarrollo con actualización automática. |
| `npm run type-check` | Comprueba tipos de componentes, código, pruebas y configuración. |
| `npm run type-check:watch` | Mantiene la comprobación de tipos en otra terminal durante el desarrollo. |
| `npm run lint` | Detecta problemas con ESLint; no modifica archivos. |
| `npm run lint:fix` | Corrige los problemas que ESLint puede resolver automáticamente. |
| `npm run test:unit` | Ejecuta pruebas de componentes y navegación una vez. |
| `npm run check` | Ejecuta ESLint, pruebas y build con comprobación de tipos. |

`npm run build` ejecuta `vue-tsc` antes de compilar: un error de tipos impide generar
la nueva entrega. `npm run build-only` sólo compila y no sustituye la validación.
Vite no hace comprobación completa de tipos al ejecutar `dev`; usa Vue - Official
en VS Code y/o `type-check:watch` en otra terminal para obtener los diagnósticos.
Las extensiones recomendadas son **Vue - Official** y **ESLint**. La configuración
versionada apunta ESLint a `front/` cuando abres el repositorio en VS Code.

Consulta [las herramientas](docs/development/02-tooling.md),
[el diseño y los casos de prueba](docs/testing/index.md) y
[las decisiones de tablas, selectores, modales y HTTP](docs/architecture/views/logical/ui-and-http.md).

## Arquitectura

Se aplica contenedor/presentación, composición con composables y organización por
módulos. Consulta [decisiones y responsabilidades de Vue](docs/architecture/views/development/code-structure.md).

## Pruebas de navegador

La [guía de archivos y credenciales de pruebas](docs/testing/06-test-files-and-credentials.md)
explica la preparación de cada nivel, qué archivos se crean y qué significan los
resultados. Unitarias y navegador con API simulada no necesitan cuentas de Nexus.

Desde `front/`, instala el navegador una vez y ejecuta:

```bash
npx playwright install chromium
npm run test:e2e
```

En Linux, si faltan dependencias del sistema, usa `npx playwright install --with-deps chromium`.
Playwright inicia Vite cuando hace falta. El puerto 5173 debe estar libre o servir
esta misma copia del proyecto. En entornos con Chromium ya instalado puedes definir
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` con la ruta del ejecutable. CI instala su navegador.
Los casos comprueban login, Almacén, Compras, Salidas, Movimientos, Catálogos, Identidad y Directorio, con validación,
permisos, errores, envío, cookies, reintento, almacenamiento y ancho móvil. Las
respuestas de API se simulan; no se usa una base de datos real.

## Pruebas de sistema

Las pruebas de sistema se ejecutan con `npm run test:e2e:system` desde `front/`
o `npm --prefix front run test:e2e:system` desde la raíz. Requieren las dependencias
de ambas aplicaciones y PostgreSQL aislado/migrado: sigue la
[preparación y limpieza](docs/testing/05-system-tests.md). Este comando inicia
Express en 3107 y Vite en 5175; no reutiliza los procesos normales de desarrollo.
La suite `test:e2e` conserva sus respuestas API simuladas y no requiere una base.

Las conexiones PostgreSQL aisladas se configuran como variables de la terminal o
CI, según la guía de preparación. El setup genera las cuentas y contraseñas de
Nexus que usará la prueba; no se configuran en los archivos de manuales.

## Documentación propia y publicación

`front/docs` contiene especificación, casos de uso Vue, arquitectura, patrones con
modelos generales y casos aplicados, módulos, estándar de código, plan/casos de
prueba, inicio y despliegue. Las referencias al servidor complementan ese contenido.

Desde la raíz:

```bash
npm --prefix front run docs:generate
npm --prefix front run docs:check
npm --prefix front run docs:export -- inicio ambos
npm --prefix front run docs:export -- completo ambos
```

La referencia se genera desde SFC/TypeScript. Se pueden publicar `inicio`, `requisitos`,
`casos-de-uso`, `arquitectura`, `estandar`, `referencia`, `pruebas`, `operacion` y
`gobierno`, por ejemplo `npm --prefix front run docs:export -- pruebas pdf`.
El [catálogo](docs/publications.json) mantiene el orden; `docs:check` detecta fuentes sin ubicación.

El completo conserva `front/build/docs/docx/arquitectura/frontend-vue.docx` y
`front/build/docs/pdf/arquitectura/frontend-vue.pdf`; cada tema añade su nombre al
archivo, por ejemplo `frontend-vue-pruebas.pdf`. El motor requiere Pandoc/LibreOffice
para exportar. Consulta la [preparación](docs/governance/02-generation-and-publication.md).
Estas fuentes, herramientas y artefactos permanecen fuera del contenedor de producción.

El [manual de usuario Vue](docs/user-manual/index.md) tiene procedimientos y capturas
propios. Se publica aparte del libro técnico:

La [guía para generar manuales por cuenta](docs/governance/07-manual-accounts-and-files.md)
reúne la preparación de credenciales, los comandos, los resultados y la recuperación
de errores. Cada cuenta recibe sus propias capturas y las tareas permitidas por su acceso.

Para la fuente completa de referencia, desde la raíz:

```bash
npm --prefix front run docs:screenshots
npm --prefix front run docs:check
npm --prefix front run docs:manual -- ambos
```

Las capturas requieren Chromium de Playwright y usan datos ficticios, con escrituras
API bloqueadas. El [procedimiento](docs/governance/05-user-manual.md) explica preparación
y revisión. El manual queda en `front/build/docs/docx/manuales-vue/manual-usuario.docx`
y `front/build/docs/pdf/manuales-vue/manual-usuario.pdf`, fuera del despliegue.

## Estructura

- `docs/index.md`: entrada a las guías técnicas de Vue, con sus fuentes y criterios documentales.
- `docs/user-manual/`: manual de las pantallas Vue para operadores, con procedimientos y capturas; publicación independiente en DOCX/PDF.
- `docs/requirements/`, `docs/architecture/`, `docs/development/`, `docs/testing/` y `docs/governance/`: colecciones con índice y capítulos propios. El paquete `arquitectura frontend-vue` publica estas mismas fuentes en DOCX/PDF; consulta [su validación](docs/index.md#mantenimiento-y-publicación).
- `src/App.vue`: muestra la página activa mediante `RouterView`.
- `src/app/router/index.ts`: rutas y carga diferida de páginas.
- `src/app/pages/NotFoundPage.vue`: página para direcciones desconocidas.
- `src/modules/auth/`: login, composable de formulario y adaptador HTTP.
- `src/modules/movements/`: historiales de materiales, consumibles y mermas, filtros y reportes.
- `src/modules/warehouse/`: contenedores, componentes, composables y servicios de Almacén.
- `src/modules/identity/`: Personas y Usuarios, con responsabilidades y credenciales separadas.
- `src/modules/directory/`: Clientes y Proveedores.
- `src/shared/components/`: tablas, diálogos y selectores remotos de los módulos.
- `src/shared/composables/`: paginación, captura, consultas de opciones y exportación.
- `src/shared/http/`: Axios, interceptores y contratos de transporte compartidos por los módulos.
- `src/app/layouts/` y `src/app/components/`: distribución general y menú de vistas Vue.
- `src/app/plugins/vuetify.ts`: proveedor visual y temas de login y Almacén.
- `src/main.ts`: arranque de Vue.
- `public/`: archivos estáticos sin transformar.
- `vite.config.ts`: integración de Vue con Vite.

Los alias `@nexus/login-validation`, `@nexus/form-validation` y `@nexus/api-messages` reutilizan módulos
públicos de `back/`. Conserva el repositorio completo al compilar; no copies sólo
`front/` a un directorio aislado. No se importan servicios ni secretos del backend.

Vue gestiona la interfaz; Vite proporciona el servidor de desarrollo y la compilación.
Vue Router maneja las URLs con historial HTML5. La sesión se comparte mediante provide/inject; formularios y listados mantienen estado por instancia.
Las variables `VITE_*` son públicas al compilar: nunca contienen claves privadas ni
credenciales de PostgreSQL.

El Dockerfile de la raíz sigue construyendo exclusivamente `back/`; `front/` está
excluido mediante `.dockerignore`. La documentación se mantiene en `front/docs` y
se versiona en Git. `front/Dockerfile.dockerignore` la excluye del contexto del
frontend; la imagen final sólo recibe `dist` y la configuración de Nginx. No
copies las guías a `public/`, porque Vite publicaría esos archivos en `dist`.
En Vercel, el proyecto de frontend puede usar Root
Directory `front`, Build Command `npm run build` y Output Directory `dist`,
permitiendo fuentes fuera de Root Directory. El login también requiere los rewrites
hacia Express descritos en [la guía del login](docs/development/03-build-and-deployment.md).

## Docker para VPS o pruebas locales

Desde la raíz del repositorio:

```bash
docker build -f front/Dockerfile -t nexus-front .
docker run --rm --name nexus-front --network nexus -p 8080:80 -e BACKEND_UPSTREAM=http://backend:3000 nexus-front
```

Abre `http://localhost:8080`. El contexto de construcción es la raíz; la red `nexus`
debe existir y el contenedor Express debe tener el alias `backend` en ella.
Docker instala las dependencias del lockfile y ejecuta `npm run build`; no necesitas
crear `dist/` manualmente. La imagen final contiene Nginx y los archivos compilados,
sin Node.js ni el servidor de desarrollo de Vite.

`front/Dockerfile.dockerignore` permite únicamente el frontend y los módulos públicos
necesarios, excluyendo dependencias locales, compilaciones previas y `.env`.
`nginx.conf` permite recargar rutas de la aplicación y devuelve 404 para recursos
inexistentes bajo `/assets/`. El proxy a Express usa `BACKEND_UPSTREAM` al iniciar
Nginx; consulta los detalles de red y despliegue en [la guía de construcción](docs/development/03-build-and-deployment.md).

Las variables `VITE_*` se incorporan al compilar, no al arrancar Nginx. Pasarlas con
`docker run -e` no cambia una compilación existente. Este Dockerfile no configura
credenciales del API. `BACKEND_UPSTREAM` es una variable de Nginx, independiente de Vite.

El Dockerfile de la raíz y Docker Compose siguen construyendo únicamente el backend.
Vercel utiliza la compilación de Vite directamente, sin este Dockerfile.

## Contratos TypeScript completos

La [referencia generada de tipos](docs/architecture/views/logical/type-reference/index.md)
complementa los diagramas curados con todos los contratos declarados de TS/SFC,
miembros, uniones y dependencias. Desde `front/`:

```bash
npm run docs:generate
npm run docs:check
npm run docs:export -- tipos ambos
```
