# Contratos HTTP consumidos por el cliente Vue

## Propósito y frontera

Esta referencia describe solicitudes, respuestas y errores de los servicios del
cliente. Sus fuentes son los adaptadores de `shared/http` y los servicios/mappers
de cada dominio. Los [contratos de formularios](form-and-event-contracts.md)
definen los intercambios internos de la interfaz.

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
| Personas | `GET/POST /api/admin/persons`, edición `PUT /:id`. Nombre completo y `accesses` con pares área/rol; consulta con `includeAccesses=true` y filtros de área/rol. |
| Usuarios | `GET/POST /api/admin/users`; edición `PATCH /:id`; contraseña `PATCH /:id/password`. Alta incluye contraseña; editar datos no la reenvía; ambos modos de edición conservan versión. |
| Clientes | `GET/POST /api/sales/clients`, edición `PUT /:id`. Nombre/Activo y versión al editar. |
| Proveedores | `GET/POST /api/warehouse/suppliers`, edición `PUT /:id`. Razón social, nombre comercial, Activo y versión al editar. |
| Inventario | Base `/api/warehouse/materials`, `/consumables` o `/wastes`: GET lista, POST alta, PATCH `/:id` metadatos, PATCH `/:id/stock` ajuste. POST `/:id/stock-additions` es entrada de merma; DELETE usa la identidad de la relación admitida para baja. |
| Compras | Base `/api/warehouse/goods-receipts/materials` o `/consumables`: listado, lectura por ID, alta y edición a través de `purchaseService`; corrección/cancelación de detalle conserva su operación y confirmación propias. |
| Salidas | Base `/api/warehouse/goods-issues/materials`, `/consumables` o `/api/warehouse/waste-issues`: GET listado/ID, POST alta, PATCH edición; `/:id/header` para encabezado y `/:id/details` para surtido. Devolución: PATCH `/:id/details/:detailId/returns`. |
| Reportes | Servicios del recurso construyen filtros/alcance y llaman `requestExcel`. La paginación se elimina. Los endpoints y diferencias de alcance permanecen en cada servicio de reporte. |

La tabla describe contratos existentes del cliente, no habilita todas las acciones para todos los recursos o cuentas. Por ejemplo, la UI de merma no presenta una baja genérica de material ni un formulario de stock inicial de compra.

## Página de datos y selección remota

El contrato paginado incluye `data`, `recordsTotal` y `recordsFiltered`. `requestPage` exige arrays y conteos enteros seguros no negativos antes de presentar la tabla. `recordParams`/adaptadores traducen página y tamaño a `start`/`length`, búsqueda y orden reconocidos por el servidor.

Los servicios adaptan las filas de opciones a `LookupItem`, definido en el
[modelo de páginas y selectores](../views/logical/class-and-type-models/02-shared-contracts.md#páginas-y-opciones-remotas).
La paginación del control se desarrolla en la
[secuencia de selección remota](../views/processes/02-shared-runtime/03-remote-lookup.md).

## Escrituras y confirmación

El payload se construye por recurso y operación. Una fila leída no se envía completa como captura. `confirmMutation` exige el código de éxito esperado; una respuesta genérica, de otro recurso u omitida no confirma la escritura. El mensaje se obtiene del catálogo público por código y se presenta como texto.

Los lectores de registros comprueban ID, versión, campos y estado necesarios; los mappers de documentos comprueban estructura y recurso. TypeScript sólo comprueba código estático: el JSON real requiere estas verificaciones. No se inventa costo cero, versión o detalle vacío para encubrir una respuesta incompleta.

| Metadato | Uso y regla del cliente |
| --- | --- |
| `expectedVersion` | Versión leída al abrir la operación; se envía para condicionar la escritura del registro versionado. |
| `expectedMaterialVersion` | Conserva la versión del artículo cuando Inventario distingue artículo y relación con proveedor. |
| `operationId` | Se conserva junto al payload de altas/entradas recuperables de merma; identifica el reintento de la misma intención. |
| `creationContext=goodsReceipt` | Alta de artículo desde Compras; proveedor fijado y sin captura inicial de stock/costo. |
| Campos de consulta/derivados | Se omiten del request donde la operación no los admite como captura. |

Catálogos, Personas, Usuarios, Directorio e Inventario envían versiones en las
operaciones que lo requieren. Los mappers actuales de Compra/Salida no añaden
`expectedVersion`: sus escrituras identifican documento, modo y detalles admitidos.
Los [modelos de tipos por dominio](../views/logical/class-and-type-models/index.md)
localizan las variantes y transformaciones de cada payload.

## Sesión y errores

`apiClient` comparte una renovación pendiente ante respuestas `401` de solicitudes
protegidas. Marca cada original con `hasRetried` y la reenvía una sola vez después
del refresh. `requiresAuth: false` excluye login y refresh de esa recuperación;
otros estados HTTP no activan el reintento automático. Una cancelación se propaga
como tal antes de normalizar errores.

| Respuesta o condición | Contrato expuesto al consumidor |
| --- | --- |
| Error HTTP con cuerpo JSON | `ApiError` conserva `status`, `code`, `fieldErrors` y `meta`; el mensaje usa el catálogo público o un fallback. |
| `errors[field]` con código reconocido | Se convierte en `fieldErrors[field]`; las entradas sin código reconocido no producen un mensaje de campo. |
| `409` con `RECORD_VERSION_CONFLICT` | El código conserva la distinción entre conflicto de versión y otros rechazos. |
| `WASTE_ALREADY_EXISTS` | `meta.operationRejected` y `meta.waste` transportan el contexto que evalúa la recuperación de merma. |
| Red o timeout sin respuesta HTTP | `ApiError` con `status = 0` y `code = NETWORK_ERROR`. |
| `502` del proxy o del refresh | Se conserva como error HTTP; no confirma la petición original. |
| JSON no admitido, registro incompleto o código de éxito diferente | `apiClient`, lector o mapper rechaza el resultado antes de publicar una confirmación. |

Login traduce los rechazos mediante `LoginRequestError`: distingue `401`, `400`,
`429`, `NETWORK_ERROR` e `INVALID_RESPONSE`. Sus ramas se muestran en la
[secuencia de acceso](../views/processes/01-session/02-login.md#catchcause-en-loginrequest).

Los servicios reciben `AbortSignal`. La presentación y recuperación de los fallos
pertenecen al [ciclo de vida](../views/logical/state-and-lifecycle.md) y a las
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
[pageRequest](../../../src/shared/http/pageRequest.ts),
[recordParams](../../../src/shared/http/recordParams.ts),
[recordContract](../../../src/shared/http/recordContract.ts) y
[requestExcel](../../../src/shared/http/requestExcel.ts). La
[referencia de código](../views/development/code-reference.md) localiza los servicios.
La [revisión de cambios](../../development/04-change-review.md) reúne consumidores y
evidencia; el [estándar de seguridad](../security-standards.md) define la salida segura.
