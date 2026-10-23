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

### Paginación de listados

Los listados y selectores que usan `getDataTablePaging` admiten `start` entero entre
`0` y `2147483647`, y `length` entero entre `0` y `100`, con longitud predeterminada
`10`. Un tamaño superior se limita a `100`; uno negativo se normaliza a `0`.
`length=0` conserva los conteos sin consultar filas. Arrays, objetos, fracciones,
sufijos como `25abc` y enteros no representables con seguridad usan el valor por
defecto; un desplazamiento fuera de rango vuelve a `0`.

El consumidor avanza con el tamaño realmente recibido. Este límite no se aplica a
las exportaciones XLSX: sus repositorios recorren lotes internos, sin truncar el
reporte a la longitud de una página HTTP.

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

### Captura del número de proyecto

Las reglas de captura y de salida segura se mantienen en
[el estándar de seguridad](../coding-standards/09-errors-security-audit-and-logging.md#qué-significa-sanitizar-en-este-proyecto).
El número de proyecto es texto de hasta 10 caracteres, recortado en los extremos y
sin caracteres de control internos; conserva sus signos permitidos. Un control
inválido devuelve `PROJECT_NUMBER_INVALID_FORMAT` por campo, sin eliminarlo para
aceptar otra referencia. Sus tres contratos de escritura se definen en
`components/warehouse-schemas.json`.

### Precisión de valores decimales

La captura de existencias, cantidades y medidas acepta hasta **8 dígitos enteros y
2 decimales**. El stock mínimo opcional acepta **12 enteros y 2 decimales**. Los
costos monetarios conservan **8 enteros y 6 decimales**. Se mantiene la persistencia
`DECIMAL(18,6)` para históricos y conversiones internas de inventario, sin redondear
esos saldos mediante una migración. La longitud calculada que se incorpora al
formulario de merma se redondea a dos decimales con la misma función en front/back.
El peso unitario de merma admite
**3 enteros y 2 decimales**, con persistencia `DECIMAL(5,2)`. Las propiedades de
cada payload y sus límites se definen en OpenAPI. Los campos históricos de largo y neto de muestra conservan seis decimales; las altas nuevas los dejan nulos.
El alta sólo recibe el total del rollo completo con cono, el total del sobrante y el
cono compartido, con dos decimales. Se guardan el neto de merma y sus medidas finales;
el neto y largo de muestra sólo se utilizan en el cálculo. Sólo materiales en m² pueden ser su origen.

Los validadores comprueban el valor original y luego lo convierten a su tipo:
`toFloat`, `toBoolean`, `toDate` o el sanitizer de la lista de detalles. El controller
recibe el body tipado; los DTOs seleccionan y adaptan campos sin repetir conversiones
numéricas, booleanas o de fecha. Un tercer decimal en una cantidad no se redondea
silenciosamente para aceptarlo. El stock mínimo vacío/nulo se omite; cero se conserva.
El frontend conserva la precisión permitida del payload durante la captura y usa `formatDecimal` o
`formatCurrency` para presentar los valores de consulta con dos decimales.

`validateNumber` tiene mínimo cero; `validatePositiveNumber` exige mayor que cero.
Comparten el comprobador numérico y no necesitan dos implementaciones independientes.
Stock inicial, stock mínimo, saldo de ajuste y costo máximo permiten cero; entradas,
devoluciones y medidas son positivas. La cantidad por presentación de una partida
de compra/salida de material mantiene su mínimo de uno. El cono permite cero, pero
los pesos totales deben superar al cono.

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

Los GET de listados de compras/salidas omiten `details`. En compras, el campo
`observations` pertenece al encabezado y se devuelve tanto en listado como
por id, incluido `null` cuando no hay texto; no depende de `includeDetails`.
Antes de editar, surtir o devolver,
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

Las condiciones de aplicación no crean otra implementación del campo: `validateText`,
`validateBoolean` y `validateNumber` reciben `condition(value, { req })`, compatible con
`.if()` de Express Validator. Primero se decide si corresponde validar; después se
comprueba presencia, tipo, límites/formato y se normaliza según el campo. Texto normal,
opcional y de catálogo reutilizan la misma cadena; `maxLength` puede ser un número o
una función de la petición. La obligatoriedad conserva su significado: un campo
opcional presente con tipo incorrecto no se trata como ausente. Alta y edición de
compras comparten campos y reglas de partidas; sólo la edición admite omitir la lista.
En materiales/consumibles, `creationContext=goodsReceipt` sólo permite omitir costo y
stock inicial en el alta; edición y ajuste validan sus valores obligatorios aunque
reciban ese contexto en el body.

Las reglas de captura del navegador y del servidor comparten límites y formatos puros
en `public/js/constants/inputValidation.js`; no comparten Express, DOM ni consultas.
Ambas comprueban el tipo original antes de convertir: un array no es un identificador,
un booleano no es un nombre y `2abc` no es una cantidad. Los textos se recortan después
de comprobar su tipo; las observaciones ausentes o nulas se normalizan a texto vacío.
Nombres de personas/clientes admiten 255 caracteres; materiales/mermas y razón social,
200; nombre comercial, 100; observaciones, 500. Las fechas deben existir en el calendario,
no sólo coincidir con la forma ISO. Los accesos requieren al menos una fila con UUID v4
de área y rol, sin repetir área aunque cambie la capitalización del UUID.

Las cantidades de partidas de compra/salida de material son al menos uno; las de
merma, devolución y surtido son positivas según su proceso. El navegador conserva
el texto numérico hasta validarlo y luego prepara el payload. Al editar una compra
sin partidas nuevas omite `details`; si envía la lista, debe contener al menos una.
El formulario de encabezado de salida valida sólo el encabezado. Existencia,
pertenencia, disponibilidad, stock y concurrencia siguen siendo reglas del servicio;
esta revisión de captura no añade consultas de BD ni recorridos de existencia por fila.

El acceso también utiliza `validate`: presencia, tipo texto y máximo de 50 caracteres
por credencial; una captura inválida devuelve `400` con códigos por campo. El usuario
se recorta en sus extremos; la contraseña conserva todos sus caracteres. La política
de creación/cambio de contraseña no se exige al iniciar sesión. Si la captura es válida y las credenciales se rechazan, `loginUser` devuelve
`401` con `LOGIN_ERROR`, igual para usuario inexistente o contraseña incorrecta. Ese
rechazo no dispara una renovación de sesión en el navegador.
`authService.js` declara el login como petición pública con `requiresAuth: false`.
El cliente HTTP usa ese contexto para omitir refresh y el presentador conserva el
formulario ante el `401`. Es una opción local de Axios, no se envía en el body ni
concede permisos. `LOGIN_ERROR` sólo se traduce a «Usuario o contraseña incorrectos»
en el catálogo de mensajes; la decisión sobre credenciales permanece en `loginUser`.

Las reglas `.custom()` forman parte de las cadenas de Express, igual que `.isUUID()`
o `.isBoolean()`; no sustituyen al middleware `validate` ni envían respuestas propias.
Se usan para relaciones entre inputs y listas de partidas, sin consultas a la BD.
Sus rechazos conservan códigos de `errorMap` y el mismo `400 VALIDATION_ERROR`. En
detalles de surtido se admiten booleanos o los textos `true`/`false`; los DTOs de
materiales, consumibles y merma conservan `false`, en lugar de aplicar `Boolean()` a
un texto. Un identificador de partida con formato inválido se informa en `details`;
la existencia y pertenencia de un identificador válido se resuelven en el servicio.

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
Los mensajes de campos se normalizan una vez y se delegan a los controles existentes,
incluidas las partidas. Si un campo o metadato directo no tiene feedback visible, su
primer mensaje usa ese mismo Swal; no se recorre recursivamente el DOM para reunir
todos los rechazos ni se duplican los errores ya visibles del formulario.
Si ninguna partida tiene un control visible para mostrar su rechazo, se conserva el
aviso general de validación; no se descarta silenciosamente el error anidado.
`handleApiError` concentra la presentación por estado HTTP para todas las entradas de
UI; el transporte sólo normaliza la respuesta, incluido JSON recibido como Blob y los
fallos de renovación. Si falta una traducción local, un error de dominio conserva su
mensaje público del servicio. El presentador no vuelve a lanzar un error ya mostrado
ni restablece el submit: `useForm` realiza esa limpieza una vez en `finally`.

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

### Propietario de códigos de éxito

`src/shared/constants/apiSuccessCodes.js` define `successCodeMessages` con los
códigos existentes de las respuestas. Controllers y navegadores importan esas
constantes desde el propietario público; `messages/codeMessages.js` conserva
el mapa de errores. El cliente selecciona la constante esperada por operación
y comprueba el código recibido; no lo construye por prefijos. El catálogo
público `getSuccessMessage` conserva los textos de EJS para las notificaciones.
