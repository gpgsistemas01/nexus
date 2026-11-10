# Contrato de la API

[OpenAPI](openapi.json) define campos, formatos y respuestas HTTP. Esta guía recoge
las reglas que dependen del estado o del inventario consultado. La adaptación de
formularios pertenece a los [contratos de Vue](../../../../front/docs/architecture/contracts/index.md).

## Reglas contractuales complementarias

### Autenticación y sesión

| Operación | Autenticación | Respuesta correcta |
| --- | --- | --- |
| `POST /api/auth/login` | Credenciales JSON `name` y `password`. | `200`, `SUCCESS_LOGIN` y cookies. |
| `GET /api/auth/me` | Cookie `accessToken`. | `200` con `user` y acceso vigente. |
| `POST /api/auth/refresh` | Cookie `refreshToken`; no requiere access token válido. | `200`, texto `OK` y cookies renovadas. |

Las cookies son `HttpOnly`, `SameSite=Lax` y `Secure` en producción. Los tokens no
se devuelven en JSON. El cierre usa `POST /cerrar-sesion`, una ruta web que también
consume Vue; no existe `/api/auth/logout`.

Login admite 1–50 caracteres por credencial: recorta el usuario y conserva la
contraseña exacta, sin aplicar la política de creación de claves. Datos inválidos
responden `400 VALIDATION_ERROR`; usuario inexistente o contraseña incorrecta,
`401 LOGIN_ERROR`.

Ante un `401` protegido, renovar y repetir una vez si tiene éxito. El `401` de
login o refresh termina ese intento; no inicia otro refresh. Una caída de red o
servidor no demuestra credenciales inválidas.

### Paginación de listados

| Parámetro | Comportamiento |
| --- | --- |
| `start` | Entero 0–2147483647; formato inválido o fuera de rango usa 0. |
| `length` | Predeterminado 10; máximo efectivo 100; negativo usa 0. Cero devuelve sólo conteos. |
| Formatos inválidos | Arrays, objetos, fracciones, `25abc` o enteros no seguros usan el valor predeterminado. |

La respuesta incluye `data`, `recordsTotal` y `recordsFiltered`. Avance según las
filas recibidas. OpenAPI declara búsqueda y orden de cada ruta. Los XLSX
recorren todos los resultados admitidos, sin el límite de una página.

### Errores globales y códigos públicos

| HTTP / código | Interpretación |
| --- | --- |
| `400 VALIDATION_ERROR` | Campos inválidos en `errors`; un ID de detalle inválido aparece en `errors.details`. Corregir y enviar. |
| `400 RECORD_ID_INVALID` | UUID de ruta inválido; rechazo global, sin errores por campo del cuerpo. |
| `401` / `403` | Sesión inválida o permiso insuficiente, según la operación. |
| `404` y código del recurso | Registro no disponible para ese contexto; no divulga datos. |
| `409` y código de dominio | Conflicto de estado, identidad, versión o clave. Revisar antes de repetir. |
| `409 INVENTORY_PIECE_QUANTITY_REQUIRED` | Cantidad fraccionaria para presentación PIEZA/PIEZAS. Corregir el valor; el servidor no lo redondea. |
| `500 SERVER_ERROR` | Fallo interno; el detalle técnico queda en el servidor. |
| `503 DATABASE_TABLE_MISSING` / `DATABASE_COLUMN_MISSING` | El despliegue requiere revisar migraciones. |
| `503 PRISMA_CLIENT_OUT_OF_SYNC` | El despliegue requiere regenerar Prisma. |

Use `code` como identificador; el texto del mensaje no es un contrato. Las respuestas
compartidas de OpenAPI incluyen estructura y ejemplos.

En salidas de merma, `409` distingue `WASTE_ISSUE_STATE_CONFLICT` (sin pendientes),
`WASTE_ISSUE_DUPLICATE_WASTE` (merma repetida) y `WASTE_ISSUE_WASTE_UNAVAILABLE`
(inexistente/inactiva). Una configuración incompleta de estados responde
`500 WASTE_ISSUE_FULFILLMENT_STATUS_NOT_FOUND`.

### Exportación mensual de reportes

| Modo | Alcance |
| --- | --- |
| Ordinario | Filtros admitidos por el reporte; sin paginación. |
| `monthlyReport=true` | Mes completo; ignora los filtros del listado. |
| `reportMonth=AAAA-MM` | Elige mes en modo mensual; ausente o inválido usa el mes actual de Ciudad de México. |

Éxito devuelve XLSX; un fallo previo a la transferencia, JSON. Si la descarga ya
comenzó, se interrumpe la conexión sin insertar JSON en el archivo parcial. La
[guía de rendimiento](../../testing/backend-performance.md) explica generación y temporales.

### Captura del número de proyecto

Texto de hasta 10 caracteres, recortado y sin controles internos. Conserva signos
permitidos; un control inválido responde `PROJECT_NUMBER_INVALID_FORMAT` por campo.
Para **GPG INTERNO** debe coincidir con el número configurado para el área: alta y
edición de encabezado rechazan configuración ausente o valor diferente.

### Precisión de valores decimales

| Dato | Enteros / decimales de captura |
| --- | --- |
| Existencias, cantidades y medidas | 8 / 2. |
| Stock mínimo opcional | 12 / 2. |
| Costos monetarios | 8 / 6. |
| Peso unitario de merma | 3 / 2. |
| Históricos y conversiones | Pueden conservar 6 decimales; no se redondean retroactivamente. |
| Largo calculado de merma | Se redondea a 2 decimales. |

Un decimal adicional se rechaza, no se redondea. Stock inicial, mínimo y ajuste
admiten cero; mínimo vacío/nulo se omite. El costo máximo admite cero sólo en el alta
inicial; editar o utilizar el inventario requiere un costo positivo. Entradas, devoluciones y
medidas son positivas; los detalles de compra/salida de material o consumible
exigen cantidad por presentación desde 1.

**PIEZA/PIEZAS:** stock mínimo, stock inicial, ajustes y cantidades de compra,
corrección, solicitud, surtido, entrada y devolución deben ser enteros. La API
obtiene la presentación de la base de datos; una etiqueta enviada por el cliente
no cambia la regla. Costos, medidas y cantidades convertidas admiten sus decimales.
No se modifican ni redondean registros históricos al consultarlos.

Rollo recibe total completo con cono, total sobrante y un cono compartido; los
pesos totales superan al cono, que admite cero. El origen debe ser material en m².
Guarda los pesos, el neto y las medidas finales. `sampleLengthM` y
`sampleNetWeightKg` se conservan en históricos y quedan nulos en altas nuevas;
la referencia actual es el peso del rollo completo capturado en la merma.
Los esquemas precisan propiedades y límites.

### Contextos de compras y salidas

| Operación | Cuerpo de captura |
| --- | --- |
| Alta / edición de compra | `supplierId`, `receivedById`, `isInvoiced`, `invoice` cuando corresponde, `receptionDate`, `observations` y detalles con `materialId`, `quantity`, `costPerUnitType`. En edición, `details` es opcional y sólo agrega partidas. |
| Corregir compra | `quantity` positiva, hasta la cantidad registrada, y `costPerUnitType` positivo. Debe cambiar al menos uno. |
| Cancelar partida de compra | Sin cuerpo. El documento y la partida se identifican en la ruta. |
| Alta / edición de solicitud | Encabezado con cliente, asesor, área, solicitante, proyecto, fecha y observaciones. Los detalles usan `materialId` + `supplierId` o `wasteId`, y `quantity`. |
| Editar encabezado de salida | Sólo los campos del encabezado; sin `details`. |
| Surtir | Detalles con `id`, `isSupplied`, `projectConvertedQuantity` y el par `quantityToSupply` / `expectedSuppliedQuantity`. Véase [Entregas](#entregas-de-salidas). |
| Devolver | `returnQuantity`; `observations` es opcional. La cantidad debe ser positiva y no superar el saldo entregado. |

Los esquemas `*Request` de [OpenAPI](openapi.json) precisan campos obligatorios y
opcionales. Folios, estados de documentos, movimientos, importes y saldos resultantes los calcula
el servidor; no se aceptan como instrucciones del cliente. `newStock` es la excepción
de captura: indica el saldo objetivo de un ajuste y el servidor calcula su diferencia.

En lectura, los decimales persistidos pueden ser cadenas JSON. Una partida de compra
devuelve `status: ACTIVE | CANCELED`, no `isCancelled`. La devolución responde con
`goodsIssueReturn` o `wasteIssueReturn`, sus acumulados `currentTotalReturnedQuantity`
y `newTotalReturnedQuantity`, el detalle actualizado y `code`; `returnQuantity` es
un campo del request. Vue confirma el código y consulta otra vez el documento.

La ruta fija materiales o consumibles; cuerpo y query no cambian el contexto.
Consultas, reportes y escrituras verifican cabecera y detalles del mismo tipo,
según la [regla de separación](../../requirements/requirements-specification/06-operation-modes-and-effects.md#separación-de-compras-y-salidas).

Los listados omiten `details`; en compras siempre devuelven `observations`, incluso
`null`. Antes de editar, surtir o devolver, consulte por ID con el mismo acceso.
Altas y ediciones completas requieren detalles; editar sólo encabezado permite
omitirlos, pero no enviar un array vacío.

### Concurrencia y reintentos

| Metadato | Uso |
| --- | --- |
| `expectedVersion` | Versión leída al preparar una edición o ajuste versionado. |
| `expectedMaterialVersion` | Versión adicional de la identidad de material/consumible. |
| `operationId` | UUID v4 conservado por captura y actor en alta y entrada de merma. |

| Condición | Resultado o recuperación |
| --- | --- |
| Versión anterior | `409 RECORD_VERSION_CONFLICT`. Actualizar lectura y revisar captura; no sustituir la versión justo antes del envío. |
| Merma, misma clave/cuerpo | Recupera el recibo original sin otra entrada; conservar ambos si el resultado es incierto. |
| Merma, misma clave/otro cuerpo | `409 OPERATION_KEY_CONFLICT`. |
| Merma, `meta.operationRejected=true` | Confirma reversión del intento. Un rechazo previo de autenticación/validación o un conflicto de clave no demuestra esa reversión. |
| `WASTE_ALREADY_EXISTS` | `meta.waste` identifica la merma para una entrada adicional. Recuperar una creación propia confirmada devuelve éxito, sin este conflicto. |
| Surtir/cancelar | Impide repetir una transición consumida; no recupera su respuesta original. |
| Devolución parcial | Repetir puede registrar otra mientras quede saldo; no tiene recibo por clave. |
| Compra sin factura, ampliación de detalles o salida nueva | Repetir puede crear otro documento o movimiento; no tiene recibo persistente. |

### Alcance de áreas de Salidas

`GET /api/admin/departments?context=issues` devuelve áreas según la sesión. Auxiliar
y Coordinador de Almacén y Administrador del sistema consultan/registran para todas;
las demás cuentas autorizadas se limitan a sus áreas en listados, conteos, reportes
y lectura por ID, en los tres recursos.

Alta/cambio a área ajena responde `403 FORBIDDEN`; un ID ajeno, `404`. La edición
comprueba también el área original antes de modificar. El servidor obtiene permisos
y alcance de fuentes propias; surtido y devolución requieren sus permisos independientes.

### Entregas de Salidas

En `PATCH /:id/details`, cada detalle seleccionado puede enviar `quantityToSupply`
y `expectedSuppliedQuantity`: entrega física actual y acumulado consultado. Ambos
se envían juntos. El servidor bloquea el documento, comprueba el acumulado y el
pendiente, y actualiza detalles y movimientos por lote en una sola transacción.
No se añaden consultas por cada detalle.

| Resultado | Regla |
| --- | --- |
| Parcial / completo | El detalle acumula lo entregado y queda completo al cubrir su cantidad solicitada. |
| Proyecto | `projectConvertedQuantity` es el total del proyecto en la unidad de conversión; se conserva sin acumular y la diferencia puede ser negativa. |
| Captura anterior | `409 RECORD_VERSION_CONFLICT`; no se repite la entrega. Consultar de nuevo antes de preparar otro envío. |
| Cantidad fuera del pendiente | `409 ISSUE_SUPPLY_QUANTITY_CONFLICT`, sin cambios de inventario. |
| Cliente sin los dos campos nuevos | Conserva la entrega de todo el pendiente del detalle seleccionado. |

### Identificadores y datos de escritura

El servidor comprueba existencia, pertenencia y estado. Rechaza tipos incorrectos
antes de normalizar: arrays como ID, booleanos como nombre o `2abc` como cantidad.
Recorta textos válidos y normaliza observaciones ausentes/nulas a vacío.

| Texto | Longitud máxima |
| --- | --- |
| Persona / cliente | 255. |
| Material / merma / razón social | 200. |
| Nombre comercial | 100. |
| Observaciones | 500. |

Las fechas deben existir en el calendario. Los accesos exigen al menos una fila
con área y rol UUID v4, sin repetir área aunque cambie la capitalización.
`creationContext=goodsReceipt` permite omitir costo/stock inicial sólo en el alta;
no exime datos de edición o ajuste. Surtido admite booleanos y textos `true`/`false`,
conservando `false` como falso.

### Códigos de éxito

Los códigos están en `src/shared/constants/apiSuccessCodes.js`. Compruebe el código
de la operación y sus datos antes de anunciar éxito; no fabrique códigos por prefijo.
Refresh devuelve texto y las descargas, XLSX: no todas las respuestas contienen `code`.
