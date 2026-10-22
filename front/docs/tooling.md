# Herramientas del frontend

## Decisiones aplicadas

La base usa Vue 3, Vue Router 5 y Vite, con TypeScript estricto. `vue-tsc` comprueba
componentes y módulos; ESLint analiza errores comunes de JavaScript/TypeScript y Vue.
El preset de Vue es `recommended`, con Composition API mediante `script setup`,
orden de macros y convenciones de componentes. Prettier y `.editorconfig` aplican
cuatro espacios en código Vue/TypeScript/CSS y configuración, dos en
pruebas y en el manifiesto `package.json`, comillas simples en JavaScript/TypeScript, punto y coma, LF y
un atributo por línea.
`eslint-config-prettier` evita reglas de formato que compitan con el formateador.
Se siguen las reglas de [eslint-plugin-vue](https://eslint.vuejs.org/user-guide/)
y la [configuración de Prettier](https://prettier.io/docs/configuration), adaptadas
al estándar local; Vue no impone una indentación universal.
Las reglas de presentación impiden imports de HTTP, stores, páginas, validadores
y VeeValidate, además de fetch/XMLHttpRequest y almacenamiento local mediante
globales o window/globalThis. No sustituyen la revisión de dependencias indirectas.

Se admiten Node.js `^22.22.2 || ^24.15.0 || ^26.12.1`. jsdom 30.1.3 y las
herramientas transitivas de Vue Test Utils 2.5.1 requieren al menos 22.22.2 o
24.15.0 en esas ramas. Node 26.12.1 sigue siendo válido. CI verifica el frontend
con Node 24.15.0 y 26.12.1, e instala con `npm ci --include=dev --engine-strict`.
Cambiar sólo `engines` no actualiza Node en el equipo ni valida sus dependencias.

El setup enlaza localStorage/sessionStorage con los objetos reales de jsdom antes
de cada caso y restaura los globals al terminar. Así Vitest 5 no conserva por
accidente el Storage nativo de Node 26. Se mantienen las aserciones y el alcance
de las pruebas del login.

Las versiones exactas se registran en `package-lock.json` y se instalan con `npm ci`.
Después de descargar cambios que actualicen dependencias, detén Vite y ejecuta
desde la raíz `npm --prefix front ci --include=dev`, seguido de
`npm --prefix front run dev`. Git no actualiza `node_modules`.

### Versiones y compatibilidad

- Vue Router 5.4.0 conserva el router explícito existente, las guardas y la carga
  diferida; no exige incorporar Pinia ni generación de rutas por archivos.
- Vitest 5.0.5, jsdom 30.1.3 y Vue Test Utils 2.5.1 actualizan la infraestructura
  de pruebas; no se cambia el estado aislado por prueba para optimizar tiempos.
- TypeScript 6.0.3 es compatible con `vue-tsc` y el analizador de ESLint instalado.
  TypeScript 7 queda pendiente: `@typescript-eslint/typescript-estree` declara
  soporte `>=4.8.4 <6.1.0`. El aviso de una versión mayor disponible no basta para
  adoptar un compilador que el conjunto de herramientas todavía no admite.
- `@types/node` conserva la rama 24 para comprobar las APIs del entorno mínimo
  compartido; ejecutar Node 26 no exige usar sus tipos en herramientas que también
  deben funcionar con Node 24.

### Avisos de obsolescencia

Vue Test Utils 2.5.1 usa js-beautify 2.x y glob 13.x. La actualización elimina la
cadena antigua de glob 10.5.0 sin forzar una versión mayor mediante overrides.
Comprueba el origen de cualquier aviso nuevo con `npm explain <paquete>` desde
la aplicación afectada. Un aviso de obsolescencia y una vulnerabilidad de
`npm audit` son comprobaciones distintas.

## Tipos y editor

`tsconfig.json` referencia tres entornos: aplicación (DOM/Vite), configuración (Node)
y pruebas (DOM/Node). El código de navegador no recibe por accidente las variables
globales de Node. Los archivos de estado incremental se guardan en `node_modules/.tmp`.
Las importaciones con `.js` resuelven al fuente `.ts`; los componentes usan `.vue`.

`npm run type-check` ejecuta `vue-tsc --build`. `npm run build` lo ejecuta antes de
Vite y falla si hay errores. `npm run dev` mantiene el comportamiento rápido de Vite:
no promete comprobar todos los tipos. En desarrollo usa Vue - Official en VS Code
o `npm run type-check:watch` en una segunda terminal. No se añadió un overlay extra.

`vite.config.ts` incluye los imports profundos de componentes/directivas Vuetify
en la preparación de dependencias. Así una ruta diferida no provoca una recarga
completa al descubrir esos controles durante el primer acceso después del login.

El repositorio recomienda Vue - Official y ESLint mediante `.vscode/extensions.json`.
VS Code solicita instalar las extensiones; el repositorio no las instala automáticamente.
Si tienes Vetur activo, desactívalo en este proyecto Vue 3 para evitar diagnósticos duplicados.

TypeScript comprueba contratos estáticos; no valida las respuestas reales de una API
ni sustituye las reglas de Express. ESLint puede corregir algunos problemas con
`npm run lint:fix`; no repara automáticamente reglas de negocio ni todos los errores de tipos.

Para el formato usa `npm --prefix front run format` desde la raíz, o
`npm run format` dentro de `front/`. `npm run format:check` comprueba sin modificar.
En VS Code se puede elegir la extensión Prettier como formateador de Vue y TypeScript
y activar «Format on Save»; la configuración versionada determina el resultado.
No hace falta la extensión para ejecutar los comandos ni para CI. El alcance
es código, pruebas y configuración del frontend; no reformatea EJS ni el backend.

## Pruebas y diseño de los casos

La estrategia general está en `back/docs/testing/test-plan.md`; esta suite pertenece
a `front/tests/` y se ejecuta desde `front/`. Se usa Vitest, Vue Test Utils y jsdom.
Las pruebas importan `describe`, `it` y `expect`, siguiendo la suite existente; usan
archivos `*Test.ts`. Los componentes se desmontan tras cada caso.

| Riesgo observable | Nivel y técnica | Resultado esperado |
| --- | --- | --- |
| Perder el acceso al entrar directamente | Router en memoria; particiones `/` y `/inicio-sesion` | Ambas abren el login operativo. |
| Quedar atrapado en una dirección inválida | Transición ruta desconocida → enlace de retorno | Se recupera el login. |
| Mantener accesibles demostraciones retiradas | Router en memoria; particiones `/inicio`, `/comparar/login/vuetify` y `/ejemplo` | Muestran página no encontrada y conservan la recuperación al login. |

Se comprueba comportamiento visible, no clases CSS, funciones privadas ni estructura
interna de Vue. No hay HTTP real, base de datos ni navegador real en esta suite unitaria.
La suite Playwright en `front/tests/e2e/` verifica login y Almacén en Chromium,
incluidos permisos, reintentos y adaptación a móvil.
Los resultados se generan en `front/build/test-results/` y no se versionan.
El login operativo tiene pruebas en
`tests/unit/modules/auth/composables/useLoginFormTest.ts`,
`tests/unit/modules/auth/services/authServiceTest.ts` y
`tests/e2e/login.spec.ts`, asociados al riesgo `DP-VAL-002` del backend:

| ID de diseño / casos | Nivel y técnica | Condición y resultado esperado |
| --- | --- | --- |
| `DP-VUE-AUTH-001` / `CP-VUE-AUTH-001` | Unitario; particiones y fronteras de captura | El formulario con VeeValidate bloquea el envío con vacíos o longitud 51 y lo permite con 50 contando caracteres Unicode; contraseña histórica corta admitida y espacios conservados. Se reutiliza la misma regla pública que EJS. |
| `DP-VUE-AUTH-002` / `CP-VUE-AUTH-002` | Unitario y navegador con API simulada; transiciones | Captura inválida no envía; 400 muestra campo; 401 genérico, 429/red/5xx recuperables; sólo SUCCESS_LOGIN navega. Pendiente bloquea duplicados y el fallo permite reintentar sin refresh. 401/429 conservan su mensaje aunque el proxy devuelva HTML; códigos desconocidos no se muestran como mensajes de campo. |
| `DP-VUE-AUTH-003` / `CP-VUE-AUTH-003` | Unitario y navegador; decisiones recordar/no recordar y almacenamiento disponible/bloqueado | Sólo se guarda usuario después del éxito; nunca contraseña/tokens; recarga recupera usuario y deja contraseña vacía. Bloqueo no impide acceso. Fallo de navegación posterior no se transforma en credenciales rechazadas. |
| `DP-VUE-AUTH-004` / `CP-VUE-AUTH-004` | Navegador; entrada directa/recarga y particiones escritorio/móvil | Login visible a 1280/390/320 px sin desbordamiento; regreso desde ruta desconocida muestra formulario con el proveedor Vuetify instalado al arrancar. |
| `DP-VUE-AUTH-005` / `CP-VUE-AUTH-005` | Unitario; transición envío pendiente → desmontaje → respuesta tardía | Se aborta el transporte y no se navega ni persiste una preferencia desde una página destruida. |
| `DP-VUE-AUTH-006` / `CP-VUE-AUTH-006` | Navegador; fallo al cargar módulo inicial → reintento | Se presenta StartupErrorPage y la recarga recupera el login sin un rechazo de promesa no manejado. |
| `DP-VUE-AUTH-007` / `CP-VUE-AUTH-007` | Navegador; acceso confirmado → fallo de carga diferida → navegación completa | Un fallo al cargar Almacén tras el login recupera su ruta por el arranque normal, sin volver a enviar credenciales ni dejar un rechazo no manejado. |

Las pruebas de adaptador y composable se ubican conforme a su módulo propietario;
los límites de captura se prueban mediante el formulario y no vuelven a probar
aisladamente el validador público que ya cubre el backend.

Las pruebas de navegador simulan cookies HttpOnly y la respuesta de materiales;
demuestran el comportamiento del frontend, no autenticación ni persistencia reales.
`back/tests/unit/validators/authValidationTest.js` conserva paridad de captura y
`back/tests/integration/controllers/authControllerDbTest.js` conserva el contrato
HTTP y cookies con base aislada. No se usa la base de desarrollo para verificar Vue.
Las pruebas de backend siguen comprobando integridad y autorización.

### Pruebas de Almacén

Los casos unitarios viven en `tests/unit/modules/warehouse/` y
`tests/unit/shared/http/apiClientTest.ts`. `tests/e2e/warehouse.spec.ts`
comprueba los componentes reales de Vuetify en Chromium. Comparte fixtures de
contratos con las unitarias, sin simular el estado reactivo del formulario.

| Diseño / casos | Nivel y técnica | Condición y resultado esperado |
| --- | --- | --- |
| `DP-VUE-WH-001` / `CP-VUE-WH-001` | Unitario y navegador; particiones de permiso y transiciones de sesión | Entrada directa y navegación entre los tres recursos; sólo lectura oculta escrituras/costos/Excel. Sin permiso rechaza la ruta; 401 vuelve al login tras un refresh fallido; fallo de sesión permite reintentar. Consultas simultáneas comparten una renovación; 403/409/5xx no reenvían escrituras. |
| `DP-VUE-WH-002` / `CP-VUE-WH-002` | Unitario y navegador; particiones por recurso/operación, fronteras y transición lectura → escritura rival → conflicto | Alta de consumible omite dimensiones; edición omite identidad/stock y conserva ambas versiones; ajuste exige motivo/stock válido y conserva la versión original. Baja usa la relación con el proveedor. Costo ausente exige captura explícita; cero es válido. Un 409 conserva captura sin reintento automático ni confirmación falsa. |
| `DP-VUE-WH-003` / `CP-VUE-WH-003` | Unitario y navegador; captura → respuesta incierta → recarga → recuperación | Rollo de 50 m, referencia neta 10 kg y merma neta 2.5 kg muestra/envía 12.5 m; envía pesos capturados sin neto ni muestras derivados. Repetir conserva cuerpo y operationId, confirma una sola captura y limpia el pendiente. Almacenamiento bloqueado impide enviar; desmontaje descarta confirmación tardía. |
| `DP-VUE-WH-004` / `CP-VUE-WH-004` | Navegador y adaptador unitario; particiones éxito/error y transiciones de filtro/página | Navegar, recargar, ver detalles y usar filtros/páginas conserva consultas al servidor; un fallo permite recuperar el listado. A 390/320 px no desborda el documento y el menú es accesible. HTML recibido como JSON o Excel no se trata como resultado válido. |

Relacionan los riesgos existentes `DP-CON-001`, `DP-CON-002`, `DP-MER-004` y
los casos `CU-ALM-01..06`, `CU-ALM-09..10`, sin sustituir sus pruebas persistentes.
`materialControllerDbTest.js`, `inventoryWriteConcurrencyDbTest.js`,
`wasteWeightDbTest.js` e `inventoryReportControllerDbTest.js` conservan la evidencia
HTTP/Prisma en una base aislada; no se usa la base de desarrollo.

## Automatización y Docker

Desde `front/`, `npm run check` ejecuta formato, lint, pruebas y build con tipos. Desde la raíz
puedes usar `npm --prefix front run check`. CI ejecuta esos controles en pasos separados
y conserva el reporte JUnit del frontend como artefacto. No modifica los disparadores
ni las comprobaciones unitarias e integración del backend.

El Dockerfile instala las herramientas en la etapa de build, copia los tsconfig y
compila con comprobación de tipos. La imagen final contiene sólo Nginx y `dist/`.
Los casos de prueba se ejecutan en CI antes del despliegue, no en Nginx.

## Herramientas aplazadas

Vuetify y VeeValidate se usan en login y Almacén. Login, sesión, inventario y reportes usan Axios con un único interceptor
de renovación y errores normalizados. La sesión actual usa provide/inject por aplicación; Pinia se aplaza hasta
necesitar varios stores y sus herramientas de gestión. Zod/Yup no se agregan para reescribir las
reglas públicas del login ya existentes. Prettier se incorpora para corregir y
prevenir las inconsistencias de formato observadas.
Playwright comprueba los controles reales de Vuetify. Contenedores, presentación y composables
no requieren esas dependencias adicionales.

## UI, HTTP y pruebas de contrato

La [revisión de interfaz y HTTP](ui-and-http.md) mantiene la comparación de
DataTables Vue, VDataTableServer, SweetAlert2 y los componentes ya instalados de
Vuetify, así como el mapa de responsabilidades.

Las pruebas del frontend usan rutas `/api/*` porque comprueban el contrato que
consume Vue. El adaptador simulado de Axios conserva sus transformaciones e
interceptores reales sin arrancar Express; Chromium usa componentes reales con
respuestas de API simuladas. Las pruebas HTTP/Prisma permanecen en `back/tests`.
No se importa el código privado del backend en la suite de Vue.

| Diseño / casos | Nivel y técnica | Condición y resultado esperado |
| --- | --- | --- |
| `DP-VUE-WH-005` / `CP-VUE-WH-005` | Navegador; páginas 1 → 2 fallida → reintento → 3 y selección | Un catálogo de 45 proveedores carga de 20 en 20 al llegar al final, no avanza durante un fallo, reintenta esa página y mantiene el nombre seleccionado sin repetir opciones. |
| `DP-VUE-WH-006` / `CP-VUE-WH-006` | Navegador; particiones por recurso/permiso y transiciones de orden/dispositivo | Materiales/Mermas mantienen encabezados agrupados y Consumibles sus columnas; costo/estado se ocultan sin permiso; el orden por medidas usa el índice del backend. Menú compacto/móvil sólo contiene rutas Vue e iconos SVG; Almacén agrupa los tres enlaces en un acordeón operable con teclado. En escritorio, clic abre el panel desde la barra de iconos y clic fuera vuelve a compacto; navegar y Escape cierran el panel. |
| `DP-VUE-WH-007` / `CP-VUE-WH-007` | Navegador; particiones alta/edición/ajuste y referencia actual/histórica | Proveedor, presentación, unidad, medidas y pesos de consulta siguen visibles sin hacerse editables; la merma mantiene referencia histórica y neto. Cambiar metros a piezas limpia dimensiones; limpiar filtros vuelve a la primera página sin búsqueda/proveedor. |
| `DP-VUE-WH-008` / `CP-VUE-WH-008` | Unitario y navegador; apertura → desmontaje y cancelar → confirmar → error → reintentar → éxito | Abortar antes de terminar de abrir no deja un popup global pendiente ni envía solicitudes. SweetAlert2 enfoca Cancelar; cancelar no escribe. El primer fallo conserva la confirmación, no repite automáticamente y el reintento confirma la baja por ID de relación y muestra el aviso de éxito. |
| `DP-VUE-WH-009` / `CP-VUE-WH-009` | Unitario y navegador; apertura → foco sin captura → edición → validación → envío → reapertura | Cargar catálogos o perder foco sin modificar no publica errores. Validar un campo editado no muestra errores de los campos intactos; enviar valida toda la captura. Reabrir no conserva errores anteriores. Login aplica la misma política. |
| `DP-VUE-WH-010` / `CP-VUE-WH-010` | Unitario; fronteras antes/a los 30 s y transiciones visible/oculta, modal abierto/cerrado, consulta pendiente/fallida y desmontaje | Foco no repite una lectura reciente. La recarga automática no solapa consultas ni activa la carga de la tabla; conserva filas idénticas. Pausa con modal/pestaña oculta, renueva datos vencidos al volver, admite reintento manual y descarta respuestas tras desmontar. |

Los casos `apiClientTest.ts` mantienen renovación única, límite de un reintento,
rechazo público sin refresh, errores de red sin repetición de escritura y cancelación.
`inventoryReportTest.ts` conserva por separado los parámetros del reporte y el
rechazo de HTML presentado como Excel.

## Retiro de demostraciones

Se retiran las pruebas del contador (`welcomePageTest.ts`) y del comparador
(`loginComparison.spec.ts`) porque sus pantallas dejaron de formar parte del
producto. También se reemplaza el caso de navegación al comparador por sus rutas
retiradas como páginas no encontradas. No se conserva cobertura del incremento
del contador ni de controles MDB/PrimeVue, funcionalidades eliminadas.

Los contratos vigentes de props/eventos, captura, navegación, sesión y adaptación
a móvil siguen cubiertos por las pruebas de login y Almacén indicadas arriba.
El backend conserva su suite sin cambios; este retiro no elimina pruebas de reglas
de negocio ni persistencia. Las dependencias y recursos exclusivos de las
demostraciones se eliminan del manifiesto, lockfile y compilación.

## Pruebas de Catálogos

El plan y registro general del backend siguen siendo propietarios de las pruebas
HTTP/Prisma. Estas pruebas Vue usan adaptadores Axios y API simulada en Chromium;
no ejecutan Express ni acceden a la base de datos de desarrollo.

| Diseño / casos | Nivel y técnica | Condición observable |
| --- | --- | --- |
| `DP-VUE-CAT-001` / `CP-VUE-CAT-001` | Unitario y navegador; particiones de permiso/ruta y transiciones de sesión | Las seis rutas requieren catalogs:manage. Una cuenta exclusiva llega a Áreas. Sin permiso no consulta la API administrativa; catálogo desconocido es 404. Revocar acceso durante una escritura termina en login o acceso denegado. |
| `DP-VUE-CAT-002` / `CP-VUE-CAT-002` | Unitario y navegador; fronteras vacío/máximo/máximo+1 y decisiones por campo/estado | Alta de los seis catálogos con campos permitidos, símbolo sólo en unidades y estado inactivo. Abrir/mover foco no muestra errores. PUT conserva expectedVersion; 409 conserva captura y bloquea reenvío hasta nueva lectura. No se solapan envíos ni se confirman tras desmontar. |
| `DP-VUE-CAT-003` / `CP-VUE-CAT-003` | Navegador; error → reintento → página → búsqueda → limpiar, escritorio/móvil | Búsqueda reinicia paginación, la API recibe start/length/search y un fallo permite recuperar el listado. El modal es utilizable a 390/320 px. El menú agrupa los seis enlaces y conserva apertura por clic y cierre fuera. |
| `DP-VUE-CAT-004` / `CP-VUE-CAT-004` | Adaptador unitario; particiones de respuesta válida/HTML/incompleta/código inesperado | El frontend rechaza contratos incompletos, omite claves internas y no confirma códigos inesperados. Las pruebas existentes de Almacén ejercitan los marcos compartidos tras la extracción. |

`catalogEditorTest.ts`, `catalogServiceTest.ts`, `inventoryNavigationTest.ts` y
`catalogs.spec.ts` son la especificación ejecutable. Las suites de Almacén siguen
cubriendo cabeceras agrupadas, modales, selección, filtros, versiones y recuperación
de merma; no se sustituye esa evidencia por la del formulario de Catálogos.

Los iconos del menú se importan desde `@mdi/js` en `app/icons.ts` y se renderizan
con el proveedor SVG de Vuetify. Al incorporar esta actualización se ejecuta
`npm ci --include=dev` en `front/`; no se carga una fuente de iconos por CDN.
ESLint excluye `test-results/`, una salida temporal regenerada por Playwright.
