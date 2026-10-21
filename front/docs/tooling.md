# Herramientas del frontend

## Decisiones aplicadas

La base usa Vue 3, Vue Router 4 y Vite, con TypeScript estricto. `vue-tsc` comprueba
componentes y módulos; ESLint analiza errores comunes de JavaScript/TypeScript y Vue.
El preset de Vue es `essential`, orientado a errores, sin imponer formato cosmético.
Las reglas de presentación impiden imports de HTTP, stores, páginas, validadores
y VeeValidate, además de fetch/XMLHttpRequest y almacenamiento local mediante
globales o window/globalThis. No sustituyen la revisión de dependencias indirectas.

Se admiten Node.js `^22.13.0 || ^24.14.1 || ^26.12.1`. Para mantener compatibilidad con Node
24.14.1 se fijan jsdom 29.1.1 y Vue Test Utils 2.4.6: las ramas posteriores agregaban
requisitos más altos de Node mediante dependencias de pruebas. No basta con bajar
`engines`; se verifica la compatibilidad de todo el lockfile y la instalación con
`npm ci --include=dev --engine-strict`, además de lint, pruebas y build.
CI comprueba el frontend con Node 24.14.1 y 26.12.1 para detectar regresiones del
mínimo existente y de la nueva rama admitida. No se cambian los pins de pruebas
por el solo hecho de admitir Node 26.
El setup de pruebas enlaza localStorage/sessionStorage con los objetos reales de
jsdom antes de cada caso y restaura los globals al terminar. Así Vitest 4 no conserva
por accidente el Storage nativo de Node 26 en una prueba del navegador. Las pruebas
de almacenamiento del login conservan sus mismas aserciones y el mismo alcance.
El backend conserva sus herramientas y versiones de Node documentadas por separado.
Las versiones exactas se registran en `package-lock.json` y se instalan con `npm ci`.

### Aviso de obsolescencia de glob

La instalación puede mostrar `npm warn deprecated glob@10.5.0`. La cadena actual
es `@vue/test-utils@2.4.6 → js-beautify@1.15.4 → glob@10.5.0`; pertenece a las
herramientas de pruebas, no a VeeValidate ni al código del login. Comprueba su
origen con `npm explain glob` desde `front/`.

El aviso de obsolescencia del mantenedor y `npm audit` son comprobaciones distintas:
`found 0 vulnerabilities` significa que la auditoría no encontró avisos aplicables
al árbol instalado en ese momento; no convierte una versión obsoleta en mantenida.

Vue Test Utils 2.5.1 usa js-beautify 2.x y glob 13.x, pero js-beautify 2.0.3 también
incorpora nopt 10.0.1, que requiere Node `^22.22.2 || ^24.15.0 || >=26.0.0`.
Esa actualización no es compatible con el mínimo actual de Node 24.14.1. Se conserva
el pin de Vue Test Utils hasta revisar conjuntamente la versión mínima de Node,
CI, la instalación con engines estrictos y las pruebas. No se fuerza un glob de
otra versión mayor sólo para ocultar el aviso ni se agrega como dependencia directa.

## Tipos y editor

`tsconfig.json` referencia tres entornos: aplicación (DOM/Vite), configuración (Node)
y pruebas (DOM/Node). El código de navegador no recibe por accidente las variables
globales de Node. Los archivos de estado incremental se guardan en `node_modules/.tmp`.
Las importaciones con `.js` resuelven al fuente `.ts`; los componentes usan `.vue`.

`npm run type-check` ejecuta `vue-tsc --build`. `npm run build` lo ejecuta antes de
Vite y falla si hay errores. `npm run dev` mantiene el comportamiento rápido de Vite:
no promete comprobar todos los tipos. En desarrollo usa Vue - Official en VS Code
o `npm run type-check:watch` en una segunda terminal. No se añadió un overlay extra.

El repositorio recomienda Vue - Official y ESLint mediante `.vscode/extensions.json`.
VS Code solicita instalar las extensiones; el repositorio no las instala automáticamente.
Si tienes Vetur activo, desactívalo en este proyecto Vue 3 para evitar diagnósticos duplicados.

TypeScript comprueba contratos estáticos; no valida las respuestas reales de una API
ni sustituye las reglas de Express. ESLint puede corregir algunos problemas con
`npm run lint:fix`; no repara automáticamente reglas de negocio ni todos los errores de tipos.

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
`tests/unit/shared/services/apiClientTest.ts`. `tests/e2e/warehouse.spec.ts`
comprueba los componentes reales de Vuetify en Chromium. Comparte fixtures de
contratos con las unitarias, sin simular el estado reactivo del formulario.

| Diseño / casos | Nivel y técnica | Condición y resultado esperado |
| --- | --- | --- |
| `DP-VUE-WH-001` / `CP-VUE-WH-001` | Unitario y navegador; particiones de permiso y transiciones de sesión | Entrada directa y navegación entre los tres recursos; sólo lectura oculta escrituras/costos/Excel. Sin permiso rechaza la ruta; 401 vuelve al login tras un refresh fallido; fallo de sesión permite reintentar. Consultas simultáneas comparten una renovación; 403/409/5xx no reenvían escrituras. |
| `DP-VUE-WH-002` / `CP-VUE-WH-002` | Unitario y navegador; particiones por recurso/operación, fronteras y transición lectura → escritura rival → conflicto | Alta de consumible omite dimensiones; edición omite identidad/stock y conserva ambas versiones; ajuste exige motivo/stock válido y conserva la versión original. Baja usa la relación con el proveedor. Un 409 conserva captura sin reintento automático ni confirmación falsa. |
| `DP-VUE-WH-003` / `CP-VUE-WH-003` | Unitario y navegador; captura → respuesta incierta → recarga → recuperación | Rollo de 50 m, referencia neta 10 kg y merma neta 2.5 kg muestra/envía 12.5 m; envía pesos capturados sin neto ni muestras derivados. Repetir conserva cuerpo y operationId, confirma una sola captura y limpia el pendiente. Almacenamiento bloqueado impide enviar; desmontaje descarta confirmación tardía. |
| `DP-VUE-WH-004` / `CP-VUE-WH-004` | Navegador y adaptador unitario; particiones éxito/error y transiciones de filtro/página | Navegar, recargar, ver detalles y usar filtros/páginas conserva consultas al servidor; un fallo permite recuperar el listado. A 390/320 px no desborda el documento y el menú es accesible. HTML recibido como JSON o Excel no se trata como resultado válido. |

Relacionan los riesgos existentes `DP-CON-001`, `DP-CON-002`, `DP-MER-004` y
los casos `CU-ALM-01..06`, `CU-ALM-09..10`, sin sustituir sus pruebas persistentes.
`materialControllerDbTest.js`, `inventoryWriteConcurrencyDbTest.js`,
`wasteWeightDbTest.js` e `inventoryReportControllerDbTest.js` conservan la evidencia
HTTP/Prisma en una base aislada; no se usa la base de desarrollo.

## Automatización y Docker

Desde `front/`, `npm run check` ejecuta lint, pruebas y build con tipos. Desde la raíz
puedes usar `npm --prefix front run check`. CI ejecuta esos controles en pasos separados
y conserva el reporte JUnit del frontend como artefacto. No modifica los disparadores
ni las comprobaciones unitarias e integración del backend.

El Dockerfile instala las herramientas en la etapa de build, copia los tsconfig y
compila con comprobación de tipos. La imagen final contiene sólo Nginx y `dist/`.
Los casos de prueba se ejecutan en CI antes del despliegue, no en Nginx.

## Herramientas aplazadas

Vuetify y VeeValidate se usan en login y Almacén. La API usa fetch; no necesita
Axios. La sesión actual usa provide/inject por aplicación; Pinia se aplaza hasta
necesitar varios stores y sus herramientas de gestión. Zod/Yup no se agregan para reescribir las
reglas públicas del login ya existentes. Prettier no se incorpora por anticipado.
Playwright comprueba los controles reales de Vuetify. Contenedores, presentación y composables
no requieren esas dependencias adicionales.

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
