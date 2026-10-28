# Diseño de pruebas: Acceso, sesión y navegación

La [guía de diseño](../02-test-design.md) define las tablas DP y sus relaciones con los casos. Esta ficha agrupa condiciones del mismo dominio o contrato.

## Pruebas y diseño de los casos

La estrategia está en el [plan de pruebas](../01-test-plan.md); la suite pertenece
a `front/tests/` y se ejecuta desde `front/`. Se usa Vitest, Vue Test Utils y jsdom.
Las pruebas importan `describe`, `it` y `expect`, siguiendo la suite existente; usan
archivos `*Test.ts`. Los componentes se desmontan tras cada caso.

La coordinación compartida de las páginas se comprueba en
`tests/unit/shared/composables/listInteractionTest.ts` y
`tests/unit/app/pageAccessTest.ts`, además de los recorridos de navegador existentes.
No se retiran las pruebas de campos, payloads ni versiones de cada módulo.

`tests/unit/shared/http/apiClientTest.ts` comprueba también la transición de
renovación concurrente → `502 Bad Gateway` → backend disponible → reintento
explícito. El error conserva su estado 502 y la siguiente renovación acepta el
`200 text/plain OK` real de Express; no se convierte una caída del proxy en
credenciales inválidas ni se reenvía una escritura por un fallo de red.

`tests/e2e/sessionRecovery.spec.ts` ejercita el router, Axios y la administración de
cookies HttpOnly de Chromium con respuestas HTTP simuladas. No demuestra la validez
criptográfica de JWT ni sustituye las integraciones de Express/Prisma.

| ID de diseño | Requisito / riesgo | Nivel y técnica | Condición que se cubrirá | Casos asociados |
| --- | --- | --- | --- | --- |
| `DP-VUE-SESSION-001` | pérdida de renovación automática de sesión | Navegador; transición access token rechazado → refresh válido/inválido | 401 de `/me` dispara un único refresh; el texto `OK` y Set-Cookie permiten repetir la consulta sin login. Un refresh 401 abre el login con destino y sin bucle. | [CP-VUE-SESSION-001-01](../cases/cp-vue-session-001-01.md) |
| `DP-VUE-SESSION-002` | reintento sin resultado ni contexto | Navegador; servidor/refresh 502 → reintento fallido/servidor recuperado y decisiones de permiso | Se conserva ruta, query y fragmento incluso al recargar la pantalla de error. El botón informa espera y fallo, evita duplicados y recupera la ruta original. Revalidar permisos vuelve al módulo solicitado. | [CP-VUE-SESSION-002-01](../cases/cp-vue-session-002-01.md) |
| `DP-VUE-SESSION-003` | retorno externo o cíclico | Unitario, `tests/unit/app/protectedDestinationTest.ts`; particiones de destino | Sólo se conservan rutas protegidas registradas; externos, arrays, rutas desconocidas, login y error vuelven a la entrada autorizada. | [protectedDestinationTest.ts](../../../tests/unit/app/protectedDestinationTest.ts) |

| ID de diseño | Requisito / riesgo | Nivel y técnica | Condición que se cubrirá | Casos asociados |
| --- | --- | --- | --- | --- |
| `DP-VUE-LIST-001` | búsqueda, filtros y editor compartidos | Unitario con `usePagedList` real; transiciones de página/filtros y decisiones de permiso | Buscar vuelve a página 1; repetir actualiza una sola vez; cambiar sólo área conserva búsqueda/orden/tamaño. Dos páginas no comparten captura. Cerrar no recarga, recuperar un conflicto recarga sin confirmar éxito y guardar cierra/recarga/confirma. Abrir reevalúa permisos. | [listInteractionTest.ts](../../../tests/unit/shared/composables/listInteractionTest.ts) |
| `DP-VUE-ACCESS-001` | salida de páginas protegidas | Router en memoria y sesión/Axios reales con transporte simulado; particiones 401/403/red/400/500 | Un 401 conserva ruta, query y fragmento para volver tras el login; un 403 abre acceso denegado. Los otros errores conservan la página y los permisos reflejan la sesión vigente. | [pageAccessTest.ts](../../../tests/unit/app/pageAccessTest.ts); [routerTest.ts](../../../tests/unit/app/routerTest.ts) |

| Riesgo observable | Nivel y técnica | Resultado esperado |
| --- | --- | --- |
| Perder el acceso al entrar directamente | Router en memoria; particiones `/` y `/inicio-sesion` | Ambas abren el login operativo. |
| Quedar atrapado en una dirección inválida | Transición ruta desconocida → enlace de retorno | Se recupera el login. |
| Navegar a rutas no registradas | Router en memoria; particiones `/inicio`, `/comparar/login/vuetify` y `/ejemplo` | Muestran página no encontrada y conservan la recuperación al login. |

Se comprueba comportamiento visible, no clases CSS, funciones privadas ni estructura
interna de Vue. No hay HTTP real, base de datos ni navegador real en esta suite unitaria.
La suite Playwright en `front/tests/e2e/` verifica login y Almacén en Chromium,
incluidos permisos, reintentos y adaptación a móvil.
Los resultados se generan en `front/build/test-results/` y no se versionan.
El login operativo tiene pruebas en
`tests/unit/modules/auth/composables/useLoginFormTest.ts`,
`tests/unit/modules/auth/services/authServiceTest.ts` y
`tests/e2e/login.spec.ts`, asociados a los diseños de acceso siguientes:

| ID de diseño | Requisito / riesgo | Nivel y técnica | Condición que se cubrirá | Casos asociados |
| --- | --- | --- | --- | --- |
| `DP-VUE-AUTH-001` | RF-VUE-001/002; captura y recuperación de acceso | Unitario; particiones y fronteras de captura | El formulario con VeeValidate bloquea el envío con vacíos o longitud 51 y lo permite con 50 contando caracteres Unicode; contraseña histórica corta admitida y espacios conservados. Se aplica la regla pública del login. | [useLoginFormTest.ts](../../../tests/unit/modules/auth/composables/useLoginFormTest.ts); [login.spec.ts](../../../tests/e2e/login.spec.ts) |
| `DP-VUE-AUTH-002` | RF-VUE-001/002; captura y recuperación de acceso | Unitario y navegador con API simulada; transiciones | Captura inválida no envía; 400 muestra campo; 401 genérico, 429/red/5xx recuperables; sólo SUCCESS_LOGIN navega. Pendiente bloquea duplicados y el fallo permite reintentar sin refresh. 401/429 conservan su mensaje aunque el proxy devuelva HTML; códigos desconocidos no se muestran como mensajes de campo. | [useLoginFormTest.ts](../../../tests/unit/modules/auth/composables/useLoginFormTest.ts); [login.spec.ts](../../../tests/e2e/login.spec.ts) |
| `DP-VUE-AUTH-003` | RF-VUE-001/002; captura y recuperación de acceso | Unitario y navegador; decisiones recordar/no recordar y almacenamiento disponible/bloqueado | Sólo se guarda usuario después del éxito; nunca contraseña/tokens; recarga recupera usuario y deja contraseña vacía. Bloqueo no impide acceso. Fallo de navegación posterior no se transforma en credenciales rechazadas. | [useLoginFormTest.ts](../../../tests/unit/modules/auth/composables/useLoginFormTest.ts); [login.spec.ts](../../../tests/e2e/login.spec.ts) |
| `DP-VUE-AUTH-004` | RF-VUE-001/002; captura y recuperación de acceso | Navegador; entrada directa/recarga y particiones escritorio/móvil | Login visible a 1280/390/320 px sin desbordamiento; regreso desde ruta desconocida muestra formulario con el proveedor Vuetify instalado al arrancar. | [useLoginFormTest.ts](../../../tests/unit/modules/auth/composables/useLoginFormTest.ts); [login.spec.ts](../../../tests/e2e/login.spec.ts) |
| `DP-VUE-AUTH-005` | RF-VUE-001/002; captura y recuperación de acceso | Unitario; transición envío pendiente → desmontaje → respuesta tardía | Se aborta el transporte y no se navega ni persiste una preferencia desde una página destruida. | [useLoginFormTest.ts](../../../tests/unit/modules/auth/composables/useLoginFormTest.ts); [login.spec.ts](../../../tests/e2e/login.spec.ts) |
| `DP-VUE-AUTH-006` | RF-VUE-001/002; captura y recuperación de acceso | Navegador; fallo al cargar módulo inicial → reintento | Se presenta StartupErrorPage y la recarga recupera el login sin un rechazo de promesa no manejado. | [useLoginFormTest.ts](../../../tests/unit/modules/auth/composables/useLoginFormTest.ts); [login.spec.ts](../../../tests/e2e/login.spec.ts) |
| `DP-VUE-AUTH-007` | RF-VUE-001/002; captura y recuperación de acceso | Navegador; acceso confirmado → fallo de carga diferida → navegación completa | Un fallo al cargar Almacén tras el login recupera su ruta por el arranque normal, sin volver a enviar credenciales ni dejar un rechazo no manejado. | [useLoginFormTest.ts](../../../tests/unit/modules/auth/composables/useLoginFormTest.ts); [login.spec.ts](../../../tests/e2e/login.spec.ts) |

Las pruebas de adaptador y composable se ubican conforme a su módulo propietario;
los límites de captura se prueban mediante el formulario y no vuelven a probar
aisladamente el validador público que ya cubre el backend.

Las pruebas de navegador simulan cookies HttpOnly y la respuesta de materiales;
demuestran el comportamiento del frontend, no autenticación ni persistencia reales.
`back/tests/unit/validators/authValidationTest.js` conserva paridad de captura y
`back/tests/integration/controllers/authControllerDbTest.js` conserva el contrato
HTTP y cookies con base aislada. No se usa la base de desarrollo para verificar Vue.
Las pruebas de backend siguen comprobando integridad y autorización.
