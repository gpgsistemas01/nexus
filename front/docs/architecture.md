# Arquitectura del frontend Vue

## Alcance

Esta decisión aplica a `front/`, con Vue 3, TypeScript, componentes `.vue` y
Composition API. El módulo `welcome` demuestra las fronteras con la pantalla de
la plantilla. `uiComparison` compara tres bibliotecas sobre un login de prueba;
ambos siguen siendo demostraciones. El módulo `auth` incorpora el login operativo
con Vuetify, VeeValidate y la API de Express; después abre materiales EJS.
Consulta [el contrato y despliegue del login](login.md).

## Contenedores y presentación

Los contenedores en `pages/` componen la pantalla, coordinan operaciones y conectan
estado y eventos. Los componentes en `components/` reciben datos mediante props y
emiten intenciones mediante eventos. Pueden tener estado visual local; no consultan
la API ni conocen la autenticación o la persistencia.

Las props no se mutan. El propietario del estado realiza los cambios. Los eventos
usan acciones concretas, como `increment`, `save` o `edit`. No se agrega un contenedor
para cada botón: la frontera debe permitir reutilizar, entender o probar una parte.

El ejemplo ejecutable es:

```text
App.vue (RouterView)
  → app/router/index.ts
  → modules/welcome/pages/WelcomePage.vue         (contenedor)
      → composables/useWelcomeCounter.ts        (estado y acciones)
      → components/WelcomePanel.vue             (props count; evento increment)
```

Cada llamada al composable crea su propio estado. El contador es sólo el ejemplo
de la plantilla; no introduce un almacén global ni representa un flujo de negocio.

## Navegación

`main.ts` instala Vue Router 4 mediante `createAppRouter`. El router de
`src/app/router/index.ts` usa historial HTML5 con la base de Vite. Su fábrica permite
inyectar historial en memoria para comprobar navegación sin navegador.
`/` redirige a `/inicio-sesion` (LoginPage); `/inicio` conserva UiComparisonPage y
`/ejemplo` conserva WelcomePage.
`/comparar/login/:library` admite mdb, vuetify y primevue; el catch-all carga NotFoundPage. Las páginas
usan imports dinámicos para carga diferida. Esto no modifica la propiedad del estado:
las rutas eligen contenedores y éstos componen presentación y composables.

El enlace al inicio usa RouterLink. Nginx y `front/vercel.json` configuran el fallback
a index.html; para Render Static Site se documenta el rewrite equivalente en el README.
Los proveedores están en `app/plugins/uiLibraries.ts` y `vuetify.ts`.
Una guarda de preparación instala el proveedor visual requerido antes de resolver
la página, también en navegación interna desde una URL desconocida. No comprueba
sesión ni permisos: las operaciones protegidas siguen en Express/EJS.
Si falla la carga inicial, StartupErrorPage permite reintentar; no se deja un rechazo
de bootstrap sin manejar. Las respuestas HTTP se manejan en el módulo auth.

## Comparador de candidatos visuales

UiComparisonPage coordina la selección a través del query `ui`, sin capturar credenciales.
Carga LoginPreviewPage en un iframe con URL propia. Esa página usa useLoginPreview
para mantener usuario, contraseña, errores y visibilidad en memoria, y conecta props/eventos
con MdbLogin, VuetifyLogin o PrimeVueLogin. Los tres usan componentes reales de su biblioteca.
LoginHeading reutiliza presentación común sin conocer el contenedor ni la autenticación.

El aislamiento por documento impide que el CSS global de MDB, Vuetify y PrimeVue se
mezcle. `main.ts` espera la ruta e instala sólo el proveedor de la variante correspondiente
antes de montar. Los imports son diferidos. Cambiar de biblioteca reemplaza el iframe y
reinicia la captura; no se envían ni guardan credenciales. La selección sí sobrevive a la
recarga mediante la URL. Esta comparación no decide la biblioteca definitiva y no es un
benchmark de rendimiento: el laboratorio incluye tres candidatos deliberadamente.

El prototipo sólo comprueba campos obligatorios para ejercitar los estados visuales.
No sustituye los límites ni políticas del login real en Express, ni añade validadores
paralelos de negocio. Los nombres de usuario y contraseña siguen el flujo EJS existente.

## Organización por módulos

`modules/<dominio>/` agrupa páginas, componentes y lógica de la misma capacidad.
Al migrar operaciones se conservan los dominios actuales: autenticación, administración,
ventas y almacén, con materiales, compras y salidas dentro de almacén.
`pages/`, `components/` y `composables/` existen cuando hay implementación concreta;
no se crean árboles vacíos. Una pieza usada sólo en un módulo permanece en él.

Un `shared/` del frontend se incorpora cuando haya reutilización demostrada entre
módulos. No debe importar módulos de negocio. Un módulo no importa páginas o estado
privado de otro; la composición entre ellos pertenece a una pantalla contenedora o
un contrato explícito.

## Patrones combinados y límites

| Patrón o mecanismo | Decisión |
| --- | --- |
| Contenedor/presentación | Aplicado en WelcomePage y WelcomePanel. Props hacia abajo y eventos hacia arriba. |
| Composición mediante composables | Aplicada en useWelcomeCounter. Reutiliza comportamiento reactivo sin acoplarlo al marcado. |
| Organización por módulos | Aplicada en modules/welcome. Cada dominio agrupa sus responsabilidades. |
| Servicios y adaptadores HTTP | `auth/services/authService.ts` envía credenciales mediante fetch y traduce el contrato de errores existente. No lee tokens ni renueva sesión al fallar el login. |
| Estado compartido con Pinia | Pendiente hasta que varias pantallas necesiten un propietario común, como sesión y permisos de presentación. Los formularios mantienen estado local por defecto. |
| Slots | Se usarán cuando un componente necesite composición de contenido. No se añade una abstracción sin consumidor. |

No se impone Atomic Design, una arquitectura hexagonal completa ni un bus global
de eventos. Agregar carpetas y capas no sustituye responsabilidades claras.

## Adaptación del frontend EJS

LoginPage conserva fondo, tarjeta y disposición del login EJS. LoginForm presenta
controles Vuetify mediante props/eventos; useLoginForm conecta las reglas públicas
a VeeValidate y controla estado, errores y envío. “Recordar usuario” nunca persiste
contraseñas y no cambia la duración de las cookies. No se agrega Pinia para este
formulario local. La navegación posterior es completa hacia materiales EJS.

Las reglas del login se mantienen en `back/src/public/js/utils/validations/loginValidation.js`,
importadas directamente por el formulario EJS. Vite y TypeScript las resuelven mediante
alias junto con los mensajes públicos. Esto exige conservar las fuentes compartidas
al compilar y usar la raíz como contexto del Dockerfile frontend. La imagen final
contiene sólo assets y Nginx. El backend continúa construyéndose por separado.

- `back/src/views/pages` se transforma en páginas y composición Vue; los parciales
  reutilizables de `views/shared` orientan los componentes visuales.
- `public/js/pages`, formularios y modales se adaptan al estado reactivo y al ciclo
  de vida de Vue. No se copia el control manual del mismo DOM junto al renderizado Vue.
- `public/js/application` puede conservar adaptadores puros y coordinación independientes
  del DOM. Los servicios HTTP requieren importar sus dependencias y configurar el origen
  de la API, incluyendo la renovación de sesión.
- `public/js/ui/forms/formUI.js` usa eventos, selectores y plugins: su `useForm` no
  es un composable Vue y necesita adaptación, no sólo un cambio de carpeta.
- Las dependencias de DataTables y Select2 se sustituyen o encapsulan controlando montaje,
  actualización y limpieza. Un plugin y Vue no deben administrar simultáneamente el mismo DOM.
- Se conservan los contratos de errores, expectedVersion y operationId cuando correspondan.
  El backend valida permisos, reglas y valores derivados aunque la interfaz los anticipe.
- Las reglas públicas de `back/src/shared` deben conservar un propietario único; no se
  duplican como otra copia en `front/src/shared`. Un paquete común requerirá ajustar
  dependencias y contextos de construcción. No se publica código privado del backend.

## Convenciones y validación

Componentes `.vue` en PascalCase, composables `useNombre.ts` y funciones con exports
nombrados. Imports relativos de módulos con `.js` (resuelto al fuente `.ts` por TypeScript/Vite);
componentes con `.vue`. Se usa `<script setup lang="ts">` y props/eventos tipados. El formato y los nombres se rigen por el
[estándar de codificación](../../back/docs/architecture/coding-standards/index.md),
incluida su sección de Vue/TypeScript; no se define un estándar paralelo aquí.
Los componentes de presentación no importan clientes HTTP ni almacenes de sesión.
Las suscripciones, temporizadores y plugins se liberan al desmontar cuando corresponda.

Cada migración debe comprobar el flujo visible, carga/error/vacío y permisos, y mantener
la validación del servidor. Vitest cubre funciones y composables; pruebas de componentes
observan props, eventos y comportamiento; una prueba de navegador valida recorridos
representativos. Vitest y Vue Test Utils ejecutan los casos de navegación y estado visible en
`front/tests/`, con jsdom y limpieza al terminar cada prueba. No constituyen una
prueba de navegador real. Los comandos y la selección de herramientas se mantienen
en [la guía de herramientas](tooling.md). CI ejecuta ESLint, pruebas y compilación con tipos.

## Referencias

- [Composables de Vue](https://vuejs.org/guide/reusability/composables.html).
- [Props](https://vuejs.org/guide/components/props.html) y [eventos de componentes](https://vuejs.org/guide/components/events.html).
- [Gestión de estado](https://vuejs.org/guide/scaling-up/state-management.html).
- ISO/IEC 25010:2023 sirve para acordar criterios de calidad; ISO/IEC/IEEE 42010:2022,
  para describir decisiones y dependencias. Ninguna exige estas carpetas ni convierte
  su adopción en conformidad automática.
