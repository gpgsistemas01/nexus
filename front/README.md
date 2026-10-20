# Nexus · Frontend

Base de Vue 3 con TypeScript, componentes `.vue`, Composition API (`<script setup>`)
y Vite, creada con la plantilla oficial `create-vite`. Incluye un comparador de login con MDB Vue, Vuetify y PrimeVue. Los módulos
operativos de Nexus todavía se sirven mediante EJS en `back/`.

## Comparar los tres candidatos

Abre `http://localhost:5173/inicio`. Hay tres botones: **MDB Vue**, **Vuetify** y
**PrimeVue**. Cada uno muestra componentes reales de esa biblioteca, con el mismo
formulario de usuario/contraseña. Prueba enviar vacío, escribir, mostrar/ocultar la
contraseña y enviar los campos completos. No se realiza autenticación, almacenamiento
ni llamadas a la API. Se conserva el vocabulario del login EJS: nombre de usuario,
no correo electrónico. Sólo se comprueba captura obligatoria para comparar la UI;
no se duplican ni sustituyen las reglas definitivas de autenticación del backend.

La selección queda en la URL (`/inicio?ui=vuetify`, por ejemplo). Cada variante se
carga en un iframe de la misma aplicación para aislar los estilos de las tres
bibliotecas. Un enlace permite abrirla por separado. Son candidatos en evaluación;
no se propone mantener las tres bibliotecas en el producto final.

Si ves la plantilla anterior, revisa que estés en `features`, ejecuta `npm ci` en
`front/` y reinicia `npm run dev`. Vite usa el puerto 5173 con `strictPort`: si está
ocupado avisa en lugar de abrir silenciosamente otro puerto. Los cambios de estructura
y herramientas previos no cambiaban la apariencia de la plantilla.

## Desarrollo

Usa Node.js 24.14.1 o superior de la rama 24, o Node.js 22.13 o superior de la rama 22.
Las herramientas de pruebas están fijadas a versiones compatibles; instala con `npm ci`
para conservar esa combinación.
Desde la raíz del repositorio:

```bash
cd front
npm ci
npm run dev
```

Abre la URL que muestra Vite en la terminal. Express se inicia por separado desde
`back/` con `npm run dev`. Esta base todavía no integra la API ni la autenticación.

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

Se instaló `vue-router@4` con `npm install vue-router@4` desde `front/`.
Al clonar el repositorio basta con `npm ci`; la dependencia está en el lockfile.

- `/` redirige a `/inicio`.
- `/inicio` muestra el comparador y sus tres botones.
- `/comparar/login/mdb`, `/comparar/login/vuetify` y `/comparar/login/primevue`
  muestran las variantes aisladas.
- `/ejemplo` conserva la demostración inicial del contador.
- Una URL desconocida muestra la página no encontrada con un enlace al inicio.

`main.ts` registra el router con `.use(createAppRouter())`. `App.vue` usa
`RouterView`, y las páginas se cargan bajo demanda. Para agregar una página, crea
su contenedor en el módulo correspondiente y registra su ruta en
`src/app/router/index.ts`. Usa `RouterLink` para enlaces internos o `router.push`
para navegar desde una operación. Un enlace HTML normal se mantiene para sitios externos.

En desarrollo usa `npm run dev` y abre `/inicio`. También puedes entrar directamente
a esa dirección o recargarla. Para producción, el servidor debe devolver `index.html`
al solicitar una ruta de la aplicación:

- Nginx: lo configura `nginx.conf`.
- Vercel: lo configura `front/vercel.json`, usando `front` como Root Directory.
- Render Static Site: agrega en Redirects/Rewrites la fuente `/*`, destino
  `/index.html` y acción **Rewrite**.

La página no encontrada se renderiza en el navegador; el fallback del servidor puede
responder HTTP 200. No hay autenticación ni guardas de sesión todavía. Cuando se
integren, la autorización definitiva seguirá en Express.

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

Consulta [las herramientas y el alcance de las pruebas](docs/tooling.md).

## Arquitectura

Se aplica contenedor/presentación, composición con composables y organización por
módulos. Consulta [decisiones, límites y migración de EJS](docs/architecture.md).

## Pruebas de navegador

Desde `front/`, instala el navegador una vez y ejecuta:

```bash
npx playwright install chromium
npm run test:e2e
```

En Linux, si faltan dependencias del sistema, usa `npx playwright install --with-deps chromium`.
Playwright inicia Vite cuando hace falta. El puerto 5173 debe estar libre o servir
esta misma copia del proyecto. En entornos con Chromium ya instalado puedes definir
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` con la ruta del ejecutable. CI instala su navegador.
Los casos comprueban cada variante, la ausencia de llamadas API y el ancho móvil.

## Estructura

- `src/App.vue`: muestra la página activa mediante `RouterView`.
- `src/app/router/index.ts`: rutas y carga diferida de páginas.
- `src/app/pages/NotFoundPage.vue`: página para direcciones desconocidas.
- `src/modules/uiComparison/pages/`: contenedores del comparador y de cada variante.
- `src/modules/uiComparison/components/`: tres formularios y encabezado de presentación.
- `src/modules/uiComparison/composables/`: estado y comportamiento común del login de prueba.
- `src/app/plugins/`: proveedores visuales cargados sólo en el documento correspondiente.
- `src/modules/welcome/pages/`: contenedor del ejemplo del contador.
- `src/modules/welcome/components/`: presentación con props y eventos.
- `src/modules/welcome/composables/`: estado y acciones del ejemplo.
- `src/main.ts`: arranque de Vue.
- `public/`: archivos estáticos sin transformar.
- `vite.config.ts`: integración de Vue con Vite.

Vue gestiona la interfaz; Vite proporciona el servidor de desarrollo y la compilación.
Vue Router maneja las URLs con historial HTML5. No se añadió un gestor de estado global.
Las variables `VITE_*` son públicas al compilar: nunca contienen claves privadas ni
credenciales de PostgreSQL.

El Dockerfile de la raíz sigue construyendo exclusivamente `back/`; `front/` está
excluido mediante `.dockerignore`. En Vercel, el proyecto de frontend puede usar Root
Directory `front`, Build Command `npm run build` y Output Directory `dist`.

## Docker para VPS o pruebas locales

Desde la raíz del repositorio:

```bash
docker build -t nexus-front ./front
docker run --rm --name nexus-front -p 8080:80 nexus-front
```

Abre `http://localhost:8080`. El contexto de construcción es `front/`, no la raíz.
Docker instala las dependencias del lockfile y ejecuta `npm run build`; no necesitas
crear `dist/` manualmente. La imagen final contiene Nginx y los archivos compilados,
sin Node.js ni el servidor de desarrollo de Vite.

`front/.dockerignore` excluye dependencias locales, compilaciones previas y `.env`.
`nginx.conf` permite recargar rutas de la aplicación y devuelve 404 para recursos
inexistentes bajo `/assets/`. No configura un proxy a Express: la integración con
la API y su autenticación siguen pendientes.

Las variables `VITE_*` se incorporan al compilar, no al arrancar Nginx. Pasarlas con
`docker run -e` no cambia una compilación existente. Este Dockerfile no configura
variables del API todavía; cuando se conecte el frontend habrá que definir ese contrato.

El Dockerfile de la raíz y Docker Compose siguen construyendo únicamente el backend.
Vercel utiliza la compilación de Vite directamente, sin este Dockerfile.
