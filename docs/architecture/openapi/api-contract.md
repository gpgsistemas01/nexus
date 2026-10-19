# Contrato de la API

La [especificación OpenAPI 3.1](openapi.json) es la referencia procesable de
métodos, rutas, parámetros, cuerpos, respuestas y autenticación. Sus fuentes modulares se
organizan por dominio bajo `docs/architecture/openapi/`; la exportación las resuelve en
un solo archivo para herramientas externas.

Las rutas registradas en `src/routes/api` son la fuente de la superficie HTTP y el
[mapa generado](../views/development/code-map.md) permite contrastarlas. Validadores, DTO,
controladores y pruebas verifican el comportamiento implementado. Cuando cambia una
operación, se actualizan su definición OpenAPI, sus componentes reutilizados y las
pruebas relacionadas; `npm run docs:check` comprueba que las operaciones registradas y
publicadas permanezcan sincronizadas.

## Cobertura del contrato

Las reglas curadas de este documento **no son las únicas operaciones documentadas**.
Sólo conservan semántica transversal que OpenAPI no explica por sí solo. El contrato
completo se divide en cuatro fuentes procesables:

| Área HTTP | Operaciones y contratos propietarios |
| --- | --- |
| [`auth`](paths/auth.json) | Inicio, consulta y renovación de sesión; esquemas de autenticación. |
| [`sales`](paths/sales.json) | Clientes y su exportación. |
| [`warehouse`](paths/warehouse.json) | Materiales, mermas, proveedores, entradas, salidas, devoluciones, inventario, catálogos operativos y reportes. |
| [`admin`](paths/admin.json) | Personas, usuarios, accesos, movimientos, catálogos administrables y reportes administrativos. |

Los esquemas reutilizables viven en `docs/architecture/openapi/components/` —por
ejemplo, [esquemas comunes](components/common-schemas.json) y
[respuestas compartidas](components/responses.json)— y el documento raíz enlaza
cada `Path Item` mediante `$ref`. `npm run docs:check` resuelve esas referencias y
compara cada método/ruta con el mapa generado; por eso no se agrega una tabla manual de
endpoints en Markdown. La salida de esa validación informa el total de operaciones
cubiertas y detecta tanto rutas ausentes como definiciones obsoletas.

## Reglas contractuales complementarias

### Errores globales y códigos públicos

Los errores globales conservan un `code` estable para que la interfaz y soporte
identifiquen la causa sin mostrar detalles internos del servidor. Las respuestas
compartidas de OpenAPI documentan su estructura y ejemplos. En particular:

| HTTP | `code` | Significado y recuperación |
| --- | --- | --- |
| `400` | `RECORD_ID_INVALID` | El identificador del recurso no tiene un formato UUID admitido. Actualice el listado y vuelva a abrir la acción. No se representa como un campo de captura. |
| `500` | `SERVER_ERROR` | Ocurrió un fallo interno no controlado. El detalle técnico se registra en el servidor y no forma parte de la respuesta pública. |
| `503` | `DATABASE_TABLE_MISSING` | Prisma informó `P2021`: falta una tabla requerida. Operaciones debe revisar y aplicar las migraciones pendientes antes de reintentar. |
| `503` | `DATABASE_COLUMN_MISSING` | Prisma informó `P2022`: falta una columna requerida. Operaciones debe revisar y aplicar las migraciones pendientes antes de reintentar. |
| `503` | `PRISMA_CLIENT_OUT_OF_SYNC` | `PrismaClientValidationError` rechazó un argumento o campo que forma parte del esquema vigente; se debe regenerar el cliente Prisma del despliegue. |

Los errores operativos de dominio pueden aportar otros códigos para `401`, `403`,
`404`, `409` o `500`; cada operación referencia la respuesta correspondiente y el
cliente debe tratar el código como identificador, no el texto como contrato.

En salidas de merma, HTTP 409 distingue `WASTE_ISSUE_STATE_CONFLICT` (ya no hay
detalles pendientes), `WASTE_ISSUE_DUPLICATE_WASTE` (merma repetida en el documento) y
`WASTE_ISSUE_WASTE_UNAVAILABLE` (merma inexistente o inactiva). La ausencia de estados
requeridos es una configuración incompleta: devuelve HTTP 500 con
`WASTE_ISSUE_FULFILLMENT_STATUS_NOT_FOUND`. Estos códigos se declaran en
`errorMap.wasteIssue` y tienen traducción en `apiMessages.js`; los servicios no reciben
mensajes visibles para decidir qué conflicto comunicar.

### Exportación mensual de reportes

Las exportaciones conservan sus columnas, fórmulas, permisos y descarga HTTP. El
transporte del navegador interpreta los errores JSON incluso cuando la petición usa
`responseType: blob`, conservando código, estado y mensaje. El detalle de recursos y
medición vive en la [guía de rendimiento](../../testing/backend-performance.md).

El XLSX se escribe progresivamente en un temporal privado y se descarga al terminar.
Un fallo durante la generación conserva la respuesta JSON habitual porque todavía
no se han enviado encabezados del archivo. El temporal se elimina después de la
descarga, de un error o de una cancelación. Si la transferencia ya comenzó y falla,
se interrumpe la conexión; no se intenta escribir JSON dentro de un XLSX parcial.

Los endpoints de exportación de compras, salidas y movimientos aceptan
`monthlyReport=true`. En ese modo ignoran los filtros aplicados al listado y consultan
el mes actual de México de forma predeterminada. El parámetro opcional `reportMonth`,
con formato `AAAA-MM`, permite consultar un mes calendario específico; un valor
ausente o inválido conserva el comportamiento seguro del mes actual.

La interfaz conserva **Mes actual** como opción explícita porque es el caso de uso
principal y evita una selección innecesaria. **Otro mes** habilita un selector mensual
Flatpickr —con valor contractual `AAAA-MM`— y **Personalizado** reutiliza los filtros
aplicados al listado; así no se mezclan un periodo calendario completo y un reporte
filtrado. El selector reutiliza los mismos tokens visuales y estados habilitado, enfocado
y deshabilitado de los campos de formulario; así el periodo permanece legible dentro
del modal sin introducir una variante de estilo exclusiva para la exportación.

### Precisión de valores decimales

Precios, existencias, cantidades y medidas aceptan hasta **8 dígitos enteros y
6 decimales**, con persistencia `DECIMAL(18,6)`. El peso unitario de merma admite
**3 enteros y 2 decimales**, con persistencia `DECIMAL(5,2)`. Las propiedades de
cada payload y sus límites se definen en OpenAPI. Los campos históricos de largo y neto de muestra conservan seis decimales; las altas nuevas los dejan nulos.
El alta sólo recibe el total del rollo completo con cono, el total del sobrante y el
cono compartido, con dos decimales. Se guardan el neto de merma y sus medidas finales;
el neto y largo de muestra sólo se utilizan en el cálculo. Sólo materiales en m² pueden ser su origen.

Los validadores comprueban la entrada antes de normalizarla. El frontend conserva
la precisión del payload durante la captura y usa `formatDecimal` o
`formatCurrency` para presentar los valores de consulta con dos decimales.

Al cambiar una ruta, un payload, una respuesta o su seguridad, se actualiza la fuente
OpenAPI del área correspondiente. Este documento se actualiza únicamente cuando cambia
alguna de las reglas complementarias que explica —el periodo de los reportes o la
precisión decimal—. Así, OpenAPI conserva el contrato verificable de cada operación y
este Markdown conserva el contexto compartido que requiere explicación adicional,
incluidas las reglas de lectura, concurrencia y reintentos siguientes.

### Contextos de compras y salidas

La ruta fija el contexto de materiales o consumibles; el payload y la query
no pueden cambiarlo. Listados, reportes y escrituras verifican cabecera y
detalles del mismo tipo. Véase la [regla de separación](../../requirements/requirements-specification/06-operation-modes-and-effects.md#separación-de-compras-y-salidas).

### Versiones y reintentos de merma

Las ediciones de inventario, proveedores, clientes, personas, usuarios y catálogos
requieren `expectedVersion`; material/consumible requiere además
`expectedMaterialVersion` para su identidad compartida. El valor procede de la lectura,
no del cálculo del cliente. `409 RECORD_VERSION_CONFLICT` exige actualizar y revisar
la captura antes de repetir. Los campos de versión no son datos editables.

POST de merma y POST de stock-additions requieren `operationId` UUID v4. Se conserva
por captura y actor hasta confirmar su resultado. Repetir la misma clave/captura devuelve
el recibo original, sin otra entrada; reutilizarla para otros datos produce
`409 OPERATION_KEY_CONFLICT`. La captura no cambia mientras su resultado sea ambiguo.
Si el servicio confirma el rollback, añade `meta.operationRejected=true`; permite
corregir un pendiente. Un rechazo previo de autenticación/validación o un conflicto
de clave no acredita ese rollback y no descarta el pendiente.
El bloqueo de submit es una ayuda de interfaz; la garantía persistente está en la base.
Un `WASTE_ALREADY_EXISTS` por identidad, incluso en carrera concurrente, incluye
`meta.waste` para ofrecer el modal Agregar stock. Recuperar una creación propia ya
confirmada responde éxito y no utiliza ese conflicto para generar otra entrada.

Los GET de listados de compras/salidas omiten `details`. Antes de editar, surtir o devolver,
la interfaz consulta GET por id con la misma autorización y contexto del listado.
Omitir la relación en un listado no permite guardar un documento vacío: las altas y
ediciones completas exigen al menos una partida. Editar sólo el encabezado conserva
las partidas existentes y permite omitir el campo; si se envía, no acepta un array vacío.

### Validación de rutas y datos del modal

Los validadores de formulario revisan los campos y metadatos de `body`, incluidos
`expectedVersion` y `operationId` cuando los exige la operación. Usan
`withMessage(errorMap...)` y `validate` devuelve `400` con `errors` por campo antes del
controller. Los identificadores de ruta (`id`, `detailId` y el catálogo solicitado) se
pasan al servicio, que resuelve el registro, su pertenencia y el estado vigente con las
consultas del proceso. No se agregan validadores de formulario a una eliminación o
cancelación sin datos de captura.

Un UUID bien formado que no identifica un registro disponible conserva el `404` y el
código de dominio, como `WASTE_NOT_FOUND` o `PERSON_NOT_FOUND`. Cuando el adaptador de
PostgreSQL informa un UUID mal formado (`22P02`), `normalizeDatabaseError` lo traduce a
`400` con `code=RECORD_ID_INVALID`, sin `errors.id`, `errors.detailId` ni detalles SQL.
Esta traducción ocurre al manejar el fallo; no agrega consultas ni comprobaciones de
formato repetidas. El manejador HTTP conserva los errores operativos ya resueltos.

El navegador traduce los códigos con `apiMessages.js`. Los errores de captura y de
partidas permanecen junto a su campo; los errores globales, de metadatos sin campo
visible o de consultas sin formulario aparecen en un Swal de advertencia. El servicio
no decide cómo mostrar el aviso. Los errores globales `400` y `404` reutilizan la
presentación existente de `handleApiError`: mensaje traducido como título y contexto
adicional sólo si difiere del título. No hay un tratamiento visual por proceder de la
URL; la respuesta indica si el error es global o corresponde a campos de captura.

La base incrementa `version`. El modal conserva la versión recibida en su lectura y
la envía como `expectedVersion`, sin generarla ni reemplazarla justo antes de guardar.
Una tabla con acciones puede conservar ese metadato sin mostrarlo como columna.
Las hojas Excel mantienen sólo las columnas funcionales; no muestran versiones.

### Alcance de la idempotencia revisado

| Operación | Protección vigente y límite |
| --- | --- |
| Crear merma y agregar stock | Recibo transaccional por actor y `operationId`; recupera el resultado original. |
| Ajustar saldo y editar recursos versionados | Escritura condicionada por la versión de la captura; un reintento viejo se rechaza, sin recuperar automáticamente la respuesta original. |
| Surtir y cancelar partidas | Bloqueos y comprobación transaccional del estado evitan aplicar dos veces una transición ya consumida; no equivalen a un recibo de respuesta. |
| Devolver parcialmente materiales, consumibles o merma | El saldo devuelto se bloquea y acota, pero una repetición puede aceptar otra devolución mientras quede cantidad disponible. La recuperación por clave sigue pendiente. |
| Crear compras sin factura, ampliar sus partidas o crear solicitudes de salida | Se mantienen sus reglas de identidad/estado; no hay recibo de reintento. Una captura repetida puede crear otro documento o movimiento. |

La necesidad depende del efecto repetible, no del verbo HTTP ni de que el recurso
principal sea nuevo. Extender la recuperación a estos procesos requiere un contrato
de clave conservada por captura, rechazo de otra captura con la misma clave y recibo
en la misma transacción de sus efectos. La tabla `WasteOperation` no acredita esa
cobertura para otros módulos.
