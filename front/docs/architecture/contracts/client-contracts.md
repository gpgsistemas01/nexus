# Contratos HTTP consumidos por el cliente Vue

## Propósito y frontera

Esta referencia define solicitudes, respuestas y errores de `shared/http` y los
servicios/mappers. Los intercambios internos de la interfaz están en [Formularios y
eventos](form-and-event-contracts.md).

`shared/http/apiClient` es el punto HTTP compartido. Los servicios codifican los IDs
de ruta y construyen filtros mediante URLSearchParams/adaptadores compartidos.
`/salidas/materiales` es una ruta de navegación;
`/api/warehouse/goods-issues/materials` es un endpoint de datos.

Los selectores y filtros de área de Salidas consultan
`GET /api/admin/departments?context=issues`. La respuesta contiene las áreas
autorizadas para esa sesión. El servidor aplica el mismo alcance a los documentos; un ID ajeno
responde `404` y un alta o cambio de destino a un área no autorizada responde `403`.
La [especificación de actores](../../requirements/requirements-specification/03-actors-and-system-responsibilities.md)
define el alcance de cada acceso.

## Operaciones consumidas

| Área | Contrato consumido y datos relevantes |
| --- | --- |
| Acceso | `POST /api/auth/login`: `name` recortado y `password` exacta. `GET /api/auth/me`: usuario con ID, nombre y array de permisos. Renovación: `POST /api/auth/refresh`. Cierre: `POST /cerrar-sesion`. |
| Catálogos | `GET/POST /api/admin/catalogs/:catalog`; edición `PUT /:id`. Lista blanca de seis recursos; nombre/Activo y símbolo sólo en Unidad. Edición añade `expectedVersion`. |
| Personas | `GET/POST /api/admin/persons`, edición `PUT /:id`. Nombre completo y `accesses` con pares área/rol; consulta con `includeAccesses=true`, filtros `department`/`role` y `strictDepartmentFilter=true` al seleccionar un área (`false` sin ella). |
| Usuarios | `GET/POST /api/admin/users`; edición `PATCH /:id`; contraseña `PATCH /:id/password`. Alta incluye contraseña; editar datos no la reenvía; ambos modos de edición conservan versión. |
| Clientes | `GET/POST /api/sales/clients`, edición `PUT /:id`. Nombre/Activo y versión al editar. |
| Proveedores | `GET/POST /api/warehouse/suppliers`, edición `PUT /:id`. Razón social, nombre comercial, Activo y versión al editar. |
| Inventario | Base `/api/warehouse/materials`, `/consumables` o `/wastes`: GET lista, POST alta, PATCH `/:id` metadatos, PATCH `/:id/stock` ajuste. POST `/:id/stock-additions` es entrada de merma; DELETE usa la identidad de la relación admitida para baja. |
| Compras | Base `/api/warehouse/goods-receipts/materials` o `/consumables`: listado, lectura por ID, alta y edición a través de `purchaseService`; corrección/cancelación de detalle conserva su operación y confirmación propias. |
| Salidas | Base `/api/warehouse/goods-issues/materials`, `/consumables` o `/api/warehouse/waste-issues`: GET listado/ID, POST alta, PATCH edición; `/:id/header` para encabezado y `/:id/details` para surtido. Devolución: PATCH `/:id/details/:detailId/returns`. |
| Reportes | Servicios del recurso construyen filtros/alcance y llaman `requestExcel`. La paginación se elimina. Los endpoints y diferencias de alcance permanecen en cada servicio de reporte. |

Las acciones disponibles dependen del recurso y los permisos. Merma no ofrece una baja
genérica de material ni stock inicial desde compra.

`loginRequest` exige el código `SUCCESS_LOGIN`; otro resultado no confirma el acceso.
La preferencia local del nombre tiene su propietario y vida útil en el
[inventario de estado](../views/logical/states/04-state-ownership-and-save.md#inventario-de-propietarios).

## Página de datos y selección remota

El contrato paginado incluye `data`, `recordsTotal` y `recordsFiltered`. `requestPage` exige arrays y conteos enteros seguros no negativos antes de presentar la tabla. `recordParams`/adaptadores traducen página y tamaño a `start`/`length`, búsqueda y orden reconocidos por el servidor.

Los servicios adaptan las filas de opciones a `LookupItem`, definido en el
[modelo de páginas y selectores](../views/logical/class-and-type-models/02-shared-contracts.md#páginas-y-opciones-remotas).
La paginación del control se desarrolla en la
[secuencia de selección remota](../views/processes/02-shared-runtime/03-remote-lookup.md).

`useRemoteLookup` carga al recibir la búsqueda del selector abierto. Reutiliza los
resultados de esa búsqueda dentro de la instancia; no comparte una caché entre
cuentas o formularios. Cambiar la dependencia o el permiso cancela la consulta y
limpia las opciones. Una alta contextual refresca su catálogo y conserva la
selección confirmada. `preload: true` se reserva a las áreas de Salidas, necesarias
para resolver su asignación y bloqueo sin interacción.

## Datos al abrir una operación

| Operación | Fuente de datos |
| --- | --- |
| Consultar, editar, surtir o devolver una salida; consultar o editar una compra | Consultar por ID al abrir. El listado es un resumen; no precargar los detalles de todos los documentos. Resolver el modo con el documento recibido. |
| Editar Catálogos, Directorio, Personas, Usuarios o Inventario | Usar la fila completa que entrega el listado, incluida su versión. Un conflicto obliga a actualizar; no sustituir la versión de una captura abierta para reenviarla. |
| Abrir una captura nueva | Crear los valores locales. Consultar las opciones que se abran y las precargas requeridas por sus reglas. |

Los datos leídos orientan la captura; la API comprueba estado, permisos y saldos al
guardar. Abrir una consulta no reserva inventario ni autoriza una escritura futura.

## Escrituras y confirmación

Construir el payload por recurso y operación, sin reenviar la fila completa.
`confirmMutation` exige el código de éxito esperado; sólo entonces se muestra su mensaje
del catálogo público, como texto.

Los lectores validan ID, versión, campos y estado; los mappers, estructura y recurso.
Estas comprobaciones validan el JSON recibido, que TypeScript no verifica en ejecución.
Una respuesta incompleta se rechaza, sin inventar costos, versiones o detalles.

En los detalles de Materiales y Consumibles, `suppliedQuantity` admite `null`
en la API y se adapta a `0` en Vue, igual que en los cálculos del servidor. Un campo
omitido o un valor no numérico sigue siendo inválido. Mermas exige el número
recibido, porque su contrato no admite `null`.

| Metadato | Uso y regla del cliente |
| --- | --- |
| `expectedVersion` | Versión leída al abrir la operación; se envía para condicionar la escritura del registro versionado. |
| `expectedMaterialVersion` | Conserva la versión del artículo cuando Inventario distingue artículo y relación con proveedor. |
| `operationId` | Se conserva junto al payload de altas/entradas recuperables de merma; identifica el reintento de la misma intención. |
| `quantityToSupply`, `expectedSuppliedQuantity` | Surtido: cantidad de esta entrega y acumulado leído del detalle. La API valida el saldo y rechaza con `RECORD_VERSION_CONFLICT` una captura cuyo acumulado ya cambió; no repite el descuento. |
| `creationContext=goodsReceipt` | Alta de artículo desde Compras; proveedor fijado y sin captura inicial de stock/costo. |
| Campos de consulta/derivados | Se omiten del request donde la operación no los admite como captura. |

Catálogos, Personas, Usuarios, Directorio e Inventario envían versiones en las
operaciones que lo requieren. Los mappers actuales de Compra/Salida no añaden
`expectedVersion`: sus escrituras identifican documento, modo y detalles admitidos.
Los [modelos de tipos por dominio](../views/logical/class-and-type-models/index.md)
localizan las variantes y transformaciones de cada payload.

## Sesión y errores

La sesión conserva `id`, `name`, `permissions` y los indicadores
`organization.isWarehouse` e `organization.isSystem` recibidos de `/api/auth/me`.
Los indicadores determinan la visibilidad de **Área** en el listado de Salidas;
si no están presentes, la columna se oculta. No sustituyen permisos ni el alcance
que aplica la API.

`apiClient` comparte una renovación pendiente ante respuestas `401` de solicitudes
protegidas. Marca cada original con `hasRetried` y la reenvía una sola vez después
del refresh. `requiresAuth: false` excluye login y refresh de la renovación ante 401.

[connectionRecovery](../../../src/shared/http/connectionRecovery.ts) permite dos
reintentos de conexión, con esperas de 500 y 1000 ms, sólo para GET/HEAD y el POST
de refresh. Aplica a errores de red/timeout y HTTP 502, 503 o 504. Conserva la
solicitud y su cancelación; el refresh sigue compartido mientras se recupera.
Login y escrituras de negocio no se reenvían por estos fallos.

El router espera el resultado de la recuperación antes de mostrar sesión no
disponible. Un refresh 401 termina en login sin reintentos de conexión. Una
cancelación se propaga como tal antes de normalizar errores.

`isReadRetryable` excluye los rechazos HTTP 400, 401, 403, 404, 405, 410 y 422 del
reintento manual de lecturas. Un cambio de estado incompatible tampoco permite
repetir la acción elegida. La [presentación de cada fallo](../interface-standards.md#carga-y-recuperación)
depende del control y de la operación, sin convertir todo error en un bloqueo global.

| Respuesta o condición | Contrato expuesto al consumidor |
| --- | --- |
| Error HTTP con cuerpo JSON | `ApiError` conserva `status`, `code`, `fieldErrors` y `meta`; el mensaje usa el catálogo público o un fallback. |
| `errors[field]` con código reconocido | Se convierte en `fieldErrors[field]`; las entradas sin código reconocido no producen un mensaje de campo. |
| `409` con `RECORD_VERSION_CONFLICT` | El código conserva la distinción entre conflicto de versión y otros rechazos. |
| `WASTE_ALREADY_EXISTS` | `meta.operationRejected` y `meta.waste` transportan el contexto que evalúa la recuperación de merma. |
| Red o timeout sin respuesta HTTP | `ApiError` con `status = 0` y `code = NETWORK_ERROR`. |
| `502/503/504` o corte de conexión en una lectura/refresh | Se intenta recuperar automáticamente dentro del límite anterior. Si persiste, conserva el último error; no confirma la petición original. |
| JSON no admitido, registro incompleto o código de éxito diferente | `apiClient`, lector o mapper rechaza el resultado antes de publicar una confirmación. |

Login traduce los rechazos mediante `LoginRequestError`: distingue `401`, `400`,
`429`, `NETWORK_ERROR` e `INVALID_RESPONSE`. Sus ramas se muestran en la
[secuencia de acceso](../views/processes/01-session/02-login.md#catchcause-en-loginrequest).

Los servicios reciben `AbortSignal`. La presentación y recuperación de los fallos
pertenecen al [ciclo de vida](../views/logical/states/04-state-ownership-and-save.md) y a las
[secuencias del proceso](../views/processes/index.md).

## Descargas

`requestExcel` exige un `Blob` cuyo tipo incluya
`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`. Un error HTTP
recibido como Blob pasa por `normalizeApiError`, que intenta leer su JSON.
Una respuesta exitosa con HTML o JSON no cumple el contrato del archivo.
Los servicios de reporte omiten paginación y construyen los filtros/alcance de su
operación. La entrega del archivo se muestra en la
[secuencia de reportes](../views/processes/08-movements-and-reports/02-reports.md).

## Fuentes técnicas

Las fuentes comunes son [apiClient](../../../src/shared/http/apiClient.ts),
[apiError](../../../src/shared/http/apiError.ts),
[readFailure](../../../src/shared/http/readFailure.ts),
[pageRequest](../../../src/shared/http/pageRequest.ts),
[recordParams](../../../src/shared/http/recordParams.ts),
[recordContract](../../../src/shared/http/recordContract.ts) y
[requestExcel](../../../src/shared/http/requestExcel.ts). La
[referencia de código](../views/development/code-reference.md) localiza los servicios.
La [revisión de cambios](../../development/04-change-review.md) reúne consumidores y
evidencia; el [estándar de seguridad](../security-standards.md) define la salida segura.
