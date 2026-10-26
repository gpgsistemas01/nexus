# 2. Registro selectivo de casos de prueba Vue

## Alcance y convenciones

Estas fichas concretan casos existentes de riesgo de captura, sesión, concurrencia
y documentos. Los IDs son documentales y enlazan el archivo y título ejecutable;
no se renombra cada test ni se crea otra copia de sus aserciones. Los grupos
`CP-VUE-CAT-002` y `CP-VUE-ISS-002` conservan su identidad; los sufijos distinguen
condiciones con oráculos independientes.

Los datos son fixtures públicas, no cuentas ni credenciales reales. Cada ejecutable
prepara su escenario; estas fichas no requieren ejecutar antes otra ficha. En Playwright
cada test dispone de contexto/página aislados, rutas simuladas y estado nuevo del
harness. Se destruyen al terminar; no hay limpieza SQL. En las unitarias se
desmontan componentes y restauran dobles según `tests/setup.ts` y los hooks del caso.
Los resultados esperados siguientes **no** son resultados de ejecución `EP-*`.

<a id="cp-vue-aut-001"></a>

## CP-VUE-AUT-001: captura de login y credencial histórica

| Campo | Especificación |
| --- | --- |
| Requisito y diseño | `RF-AUT-001`, `CU-AUT-01`, `DP-VAL-002`. Particiones vacío/rechazado/válido y transición de reintento. |
| Precondiciones | Chromium con `mockWarehouse`, ruta `/inicio-sesion` y lista de solicitudes vacía. API y cuenta simuladas. |
| Datos | Nombre `" usuario "`; contraseña rechazada `" legado "` y luego `" válida "`. Las comillas delimitan los valores, no se capturan; cada uno contiene un espacio al inicio y otro al final. Recordar usuario activado. |
| Acción | Abrir y mover foco sin editar; enviar vacío; completar y enviar la credencial rechazada; cambiar la contraseña y reenviar. |
| Resultado esperado | Antes de enviar no hay errores iniciales; vacío muestra errores y no solicita login. Las solicitudes contienen nombre `usuario` y las contraseñas con sus espacios intactos. Rechazo muestra el mensaje genérico; éxito abre Materiales y conserva únicamente `nexus.rememberedUser=usuario` en almacenamiento local. Al volver al login la contraseña está vacía. La cookie de respuesta simulada es HttpOnly. |
| Fuente y limpieza | [login.spec.ts](../../tests/e2e/login.spec.ts), `login: captura inválida, rechazo genérico y reintento con cookies hacia materiales`. Aislamiento Playwright. No comprueba hash, cuenta real ni emisión JWT. |

<a id="cp-vue-session-001-01"></a>

## CP-VUE-SESSION-001-01: renovación transparente

| Campo | Especificación |
| --- | --- |
| Requisito y diseño | `RF-AUT-002`, soporte de casos protegidos; `DP-VUE-SESSION-001`. Transición acceso vencido → renovación → lectura válida. |
| Precondiciones y datos | `sessionScenario` instala cookies HttpOnly de fixture: acceso vencido y renovación disponible. Destino `/directorio/clientes?consulta=Ana#tabla`; refresh responde texto `OK` y Set-Cookie. |
| Acción | Abrir directamente el destino protegido. |
| Resultado esperado | Una llamada POST a refresh y dos lecturas de `/me`; se presenta Clientes sin pasar por login y se conserva query/fragmento. El navegador almacena `accessToken=renewed-fixture` como HttpOnly. |
| Fuente y limpieza | [sessionRecovery.spec.ts](../../tests/e2e/sessionRecovery.spec.ts), `sesión: un access token vencido se renueva automáticamente mediante la cookie HttpOnly`. Aislamiento Playwright. No demuestra validez criptográfica ni rotación persistente. |

<a id="cp-vue-session-002-01"></a>

## CP-VUE-SESSION-002-01: recuperar un refresh con 502

| Campo | Especificación |
| --- | --- |
| Requisito y diseño | `RF-AUT-002`; riesgo de confundir indisponibilidad con credenciales inválidas, `DP-VUE-SESSION-002`. Transición 401 → refresh 502 → reintento explícito. |
| Precondiciones y datos | `sessionScenario` nuevo, con acceso vencido y cookie de renovación de fixture; destino `/directorio/clientes?consulta=Ana#tabla`. El primer refresh devuelve 502 y después se cambia la respuesta a 200. |
| Acción | Abrir el destino; observar la pantalla de sesión no disponible; habilitar el refresh y pulsar Volver a comprobar el acceso. |
| Resultado esperado | Se muestra recuperación después del fallo. Antes del clic hay un refresh; al recuperar se presenta Clientes y el contador total es dos. No se exige capturar credenciales de nuevo. |
| Fuente y limpieza | [sessionRecovery.spec.ts](../../tests/e2e/sessionRecovery.spec.ts), `sesión: un 502 del refresh se puede recuperar sin volver a capturar credenciales`. Aislamiento Playwright. El fallo y la recuperación son simulados. |

<a id="cp-vue-cat-002-01"></a>

## CP-VUE-CAT-002-01: conflicto de versión en un catálogo

| Campo | Especificación |
| --- | --- |
| Requisito y diseño | `RF-CAT-024`, `CU-CAT-14`; riesgo de sobrescribir una captura antigua, `DP-VUE-CAT-002`. Transición edición → 409 → lectura nueva → edición. |
| Precondiciones | `mockCatalogs`, catálogo Roles y registro de fixture con `version=7`; permisos de administración simulados. |
| Datos | Primera captura `Mi captura`; servidor simulado cambia el nombre y versión a 8 y responde `RECORD_VERSION_CONFLICT`. Segunda captura `Segunda captura`. |
| Acción | Editar/enviar; cerrar mediante Cerrar y actualizar catálogo; abrir otra edición y enviar. |
| Resultado esperado | La primera solicitud conserva `expectedVersion=7`. El rechazo conserva el texto y deshabilita Actualizar; no hay reenvío automático. La lectura muestra el registro actualizado; la siguiente solicitud usa versión 8 y se confirma. |
| Fuente y limpieza | [catalogs.spec.ts](../../tests/e2e/catalogs.spec.ts), `catálogos: conflicto conserva captura, impide reenvío y exige nueva lectura`. Estado en memoria del harness nuevo por test. No comprueba UPDATE condicionado ni persistencia real. |

<a id="cp-vue-com-003-01"></a>

## CP-VUE-COM-003-01: confirmar una corrección de compra

| Campo | Especificación |
| --- | --- |
| Requisito y diseño | `RF-REC-002`, `CU-ENT-04`; `DP-VUE-COM-003`. Decisiones cancelar/confirmar sobre la misma captura. |
| Precondiciones y datos | `mockPurchases`, compra `COM-001`, detalle Lona activo con cantidad 2 y costo por presentación 100. Captura de corrección: cantidad 1, costo 100. |
| Acción | Consultar la compra; abrir Corregir detalle; capturar 1; abrir confirmación y cancelar; volver a confirmar aceptando. |
| Resultado esperado | La consulta no ofrece Guardar; la estimación muestra `$116`. Cancelar no genera solicitud ni pierde el diálogo. Confirmar genera una solicitud a `/details/:id/corrections` con `{ quantity: 1, costPerUnitType: 100 }`, conserva la consulta y presenta el mensaje de éxito. |
| Fuente y limpieza | [purchases.spec.ts](../../tests/e2e/purchases.spec.ts), tramo de corrección de `compras: consulta, corrección y cancelación explícita conservan el historial`. El mismo test contiene aserciones adicionales de cancelación, fuera de esta ficha. Aislamiento Playwright; no verifica stock/historial SQL ni el cálculo persistido. |

<a id="cp-vue-iss-002-01"></a>

## CP-VUE-ISS-002-01: surtir un detalle seleccionado

| Campo | Especificación |
| --- | --- |
| Requisito y diseño | `RF-ISS-002` / `RF-WST-003`, `CU-SAL-05` / `CU-SAL-12`; `DP-VUE-ISS-002`. Selección pendiente y cantidad de proyecto ausente/válida. |
| Precondiciones y datos | `mockIssues`, salida aprobada pendiente con detalle de cantidad 2 y permiso de surtido. Variantes navegador: Materiales/Lona y Mermas/Sobrante de lona. Cantidad de proyecto 180. |
| Acción | Abrir Surtir detalle; seleccionar el detalle; enviar sin cantidad de proyecto; capturar 180 y reenviar. |
| Resultado esperado | Encabezado bloqueado. El primer intento no genera escritura. El segundo envía sólo `details: [{ id: issueDetailId, isSupplied: true, projectConvertedQuantity: 180 }]` a `/details`; se cierra el diálogo. |
| Fuente y limpieza | [issues.spec.ts](../../tests/e2e/issues.spec.ts), tramo de surtido de `salidas materiales: edición pendiente, surtido y devolución` y `salidas mermas: edición pendiente, surtido y devolución`. Aislamiento Playwright. No demuestra descuento real ni falta de stock. |

<a id="cp-vue-iss-002-02"></a>

## CP-VUE-ISS-002-02: devolución por la interfaz

| Campo | Especificación |
| --- | --- |
| Requisito y diseño | `RF-ISS-003` / `RF-WST-006`, `RN-014`, `CU-SAL-06` / `CU-SAL-13`; `DP-VUE-ISS-002`. Frontera superior de cantidad sobre saldo leído. |
| Precondiciones y datos | Continuación del harness de salida ya surtida: cantidad entregada 2, devuelta 0. Dos escrituras previas: surtido y actualización de encabezado. Intentos de devolución 3 y 1. |
| Acción | Abrir devolución; enviar 3; corregir a 1 y enviar. |
| Resultado esperado | Abrir no muestra errores. Con 3 el contador permanece en dos solicitudes; con 1 se envía a `/returns` `{ returnQuantity: 1, observations: '' }` y se cierra el diálogo. |
| Fuente y limpieza | [issues.spec.ts](../../tests/e2e/issues.spec.ts), tramo de devolución del mismo recorrido. Aislamiento Playwright. El incremento del stock y la transacción requieren backend real. |

<a id="cp-vue-iss-002-03"></a>

## CP-VUE-ISS-002-03: precisión y reintento de devolución

| Campo | Especificación |
| --- | --- |
| Requisito y diseño | `RN-014`, representante de `CU-SAL-06`; `DP-VUE-ISS-002`. Valores frontera y transición rechazo → reintento → desmontaje. |
| Precondiciones y datos | Composable con `suppliedQuantity=2.12`, `returnedQuantity=1.1`; saldo visible 1.02. Servicio simulado rechaza una vez con `Saldo cambió` y luego confirma. |
| Acción | Enviar 1.03; enviar 1.02; repetir explícitamente; desmontar e intentar otro envío. |
| Resultado esperado | 1.03 no llama al servicio. 1.02 conserva captura y mensaje ante rechazo; el siguiente intento notifica la confirmación. Tras desmontar no hay una tercera llamada. |
| Fuente y limpieza | [issueTest.ts](../../tests/unit/modules/issues/issueTest.ts), `devolución limita por el saldo leído, conserva precisión y exige reintento explícito`, con `resource: materials`. Se desmonta el wrapper; los hooks restauran dobles. No es navegador ni persistencia, ni demuestra por sí solo las variantes merma/consumible. |

## Reproducción y resultado real

Los comandos y el ambiente se definen en [el índice de pruebas](index.md#ejecución-y-resultado).
Playwright permite seleccionar el archivo y el título con `--grep`; los nombres
anteriores son los del código, no nuevos casos que deban implementarse.
Para aceptar un resultado se conserva su evidencia `EP-*` con revisión/ambiente,
fecha, comando, estado y discrepancias. No se atribuye un resultado aprobado por
la mera existencia de estas fichas.
