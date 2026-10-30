# Contrato de la API

## Datos generales del documento

| Versión documental | Versión del sistema | Estado | Fecha | Responsable |
| --- | --- | --- | --- | --- |
| 1.0 | 1.0.0 | En revisión | 2026-10-30 | Equipo Nexus |

## Propósito y uso

La [especificación OpenAPI 3.1](openapi.json) es la referencia procesable de
métodos, rutas, parámetros, cuerpos, respuestas y autenticación. Sus fuentes modulares se
organizan por dominio bajo `docs/architecture/openapi/`; la exportación las resuelve en
un solo archivo para herramientas externas. El contrato describe lo que recibe y
devuelve el servidor, con independencia de la interfaz que lo consuma.

La organización de servicios, repositorios y transacciones se explica en la
[referencia interna del backend](../views/development/backend-technical-documentation/index.md)
y sus [procesos](../views/processes/index.md).

## Cobertura del contrato

OpenAPI agrupa las operaciones en cuatro fuentes procesables:

| Área HTTP | Operaciones y contratos propietarios |
| --- | --- |
| [`auth`](paths/auth.json) | Inicio, consulta y renovación de sesión; esquemas de autenticación. |
| [`sales`](paths/sales.json) | Clientes y su exportación. |
| [`warehouse`](paths/warehouse.json) | Materiales, mermas, proveedores, entradas, salidas, devoluciones, inventario, catálogos operativos y reportes. |
| [`admin`](paths/admin.json) | Personas, usuarios, accesos, movimientos, catálogos administrables y reportes administrativos. |

Los [esquemas comunes](components/common-schemas.json) y las
[respuestas compartidas](components/responses.json) se reutilizan mediante `$ref`.
La exportación resuelve las referencias en un archivo autocontenido.

`npm run docs:check` resuelve las referencias y compara los métodos y rutas publicados
con el [mapa generado desde el código](../views/development/code-map.md). Informa el total
de operaciones y detecta rutas ausentes o definiciones obsoletas. La correspondencia
de cada campo y condición se revisa con los validadores, DTO, controladores y pruebas;
la comprobación de rutas no demuestra por sí sola esa coincidencia.

Al cambiar una operación, actualice su definición OpenAPI, sus esquemas reutilizados
y las pruebas relacionadas. Este capítulo mantiene las reglas compartidas; el detalle
de parámetros y respuestas de cada operación permanece en OpenAPI.

## Reglas contractuales complementarias

### Autenticación y sesión

La sesión utiliza cookies `HttpOnly`: `accessToken` para operaciones protegidas y
`refreshToken` para renovar el acceso. Se emiten con `SameSite=Lax` y, en producción,
`Secure`; un cliente HTTP debe conservar y reenviar las cookies correspondientes.
Los tokens no se devuelven como campos JSON.

| Paso | Solicitud | Resultado y uso |
| --- | --- | --- |
| Iniciar sesión | `POST /api/auth/login`, JSON con `name` y `password` | `200` con `code=SUCCESS_LOGIN` y cookies de sesión. |
| Consultar la cuenta | `GET /api/auth/me`, con `accessToken` | `200` con `user`, incluida la información de acceso vigente. |
| Renovar el acceso | `POST /api/auth/refresh`, con `refreshToken` | `200`, cuerpo de texto `OK` y nuevas cookies. No exige un access token válido. |
| Cerrar la sesión actual | `POST /cerrar-sesion` | Borra las cookies y responde con una redirección `302` a `/inicio-sesion`. Es una ruta web, fuera del inventario `/api`; no existe `/api/auth/logout`. |

El login admite texto de 1 a 50 caracteres por credencial. El usuario se recorta en
sus extremos; la contraseña conserva todos sus caracteres. La política de
creación o cambio de contraseña no se exige al iniciar sesión. Una captura inválida
devuelve `400 VALIDATION_ERROR`; credenciales rechazadas devuelven `401 LOGIN_ERROR`,
igual para una cuenta inexistente o una contraseña incorrecta.

Un `401` en una operación protegida permite intentar la renovación y repetir la
petición si ésta tiene éxito. El `401` del propio login rechaza las credenciales;
el de refresh rechaza la renovación. Ninguno debe iniciar un bucle de refresh.
Un fallo de red o servidor no confirma que las credenciales hayan sido rechazadas.

### Paginación de listados

Los listados paginados y selectores admiten `start` entero entre
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
| `400` | `RECORD_ID_INVALID` | El identificador de ruta no tiene un formato UUID admitido. Corrija el UUID recibido; el rechazo es global y no contiene errores de campos del body. |
| `500` | `SERVER_ERROR` | Ocurrió un fallo interno no controlado. El detalle técnico se registra en el servidor y no forma parte de la respuesta pública. |
| `503` | `DATABASE_TABLE_MISSING` | Falta una tabla requerida por la versión desplegada. El administrador del despliegue debe revisar las migraciones pendientes. |
| `503` | `DATABASE_COLUMN_MISSING` | Falta una columna requerida por la versión desplegada. El administrador del despliegue debe revisar las migraciones pendientes. |
| `503` | `PRISMA_CLIENT_OUT_OF_SYNC` | El cliente Prisma desplegado no corresponde al esquema requerido. El administrador del despliegue debe regenerarlo antes de reintentar. |

Los errores operativos de dominio pueden aportar otros códigos para `401`, `403`,
`404`, `409` o `500`; cada operación referencia la respuesta correspondiente y el
cliente debe tratar el código como identificador, no el texto como contrato.

En salidas de merma, HTTP 409 distingue `WASTE_ISSUE_STATE_CONFLICT` (ya no hay
detalles pendientes), `WASTE_ISSUE_DUPLICATE_WASTE` (merma repetida en el documento) y
`WASTE_ISSUE_WASTE_UNAVAILABLE` (merma inexistente o inactiva). La ausencia de estados
requeridos es una configuración incompleta: devuelve HTTP 500 con
`WASTE_ISSUE_FULFILLMENT_STATUS_NOT_FOUND`.

### Exportación mensual de reportes

Las exportaciones devuelven XLSX si tienen éxito y errores JSON si fallan antes
de iniciar la descarga. El consumidor debe distinguir ambos tipos de respuesta,
incluso si solicita un archivo binario. Si la transferencia ya comenzó y falla,
se interrumpe la conexión; no se escribe JSON dentro de un XLSX parcial. La generación,
limpieza de temporales y medición pertenecen a la
[guía de rendimiento del servidor](../../testing/backend-performance.md).

Los endpoints de exportación de compras, salidas y movimientos aceptan
`monthlyReport=true`. En ese modo ignoran los filtros aplicados al listado y consultan
el mes actual de México de forma predeterminada. El parámetro opcional `reportMonth`,
con formato `AAAA-MM`, permite consultar un mes calendario específico; un valor
ausente o inválido conserva el comportamiento seguro del mes actual.

Fuera del modo mensual, se aplican los filtros admitidos por el reporte solicitado.

### Captura del número de proyecto

Las reglas de captura y de salida segura se mantienen en
[el estándar de seguridad](../coding-standards/09-errors-security-audit-and-logging.md#qué-significa-sanitizar-en-este-proyecto).
El número de proyecto es texto de hasta 10 caracteres, recortado en los extremos y
sin caracteres de control internos; conserva sus signos permitidos. Un control
inválido devuelve `PROJECT_NUMBER_INVALID_FORMAT` por campo, sin eliminarlo para
aceptar otra referencia. Sus tres contratos de escritura se definen en
`components/warehouse-schemas.json`.

En una salida para **GPG INTERNO**, además, el número debe coincidir con el configurado
para el área de destino. Crear la salida o editar su encabezado se rechaza si no hay
número configurado para esa área o si el valor recibido es distinto. El servidor
comprueba esta relación aunque el cliente haya sugerido o bloqueado el campo.

### Precisión de valores decimales

La captura de existencias, cantidades y medidas acepta hasta **8 dígitos enteros y
2 decimales**. El stock mínimo opcional acepta **12 enteros y 2 decimales**. Los
costos monetarios conservan **8 enteros y 6 decimales**. Los históricos y conversiones
de inventario pueden conservar seis decimales; el límite de captura no los redondea
retroactivamente. La longitud calculada de merma se redondea a dos decimales.
El peso unitario de merma admite **3 enteros y 2 decimales**. Las propiedades de
cada payload y sus límites se definen en OpenAPI. Los campos históricos de largo y
neto de muestra conservan seis decimales; las altas nuevas los dejan nulos.
El alta sólo recibe el total del rollo completo con cono, el total del sobrante y el
cono compartido, con dos decimales. Se guardan el neto de merma y sus medidas finales;
el neto y largo de muestra sólo se utilizan en el cálculo. Sólo materiales en m² pueden ser su origen.

Un tercer decimal en una cantidad se rechaza; no se redondea para aceptarlo.
El stock mínimo vacío o nulo se omite; cero se conserva. Stock inicial, stock mínimo,
saldo de ajuste y costo máximo permiten cero. Entradas, devoluciones y medidas son
positivas. La cantidad por presentación de un detalle de compra o salida de material
o consumible tiene un mínimo de uno. El cono permite cero, pero los pesos totales
deben superar al cono.

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
Un `WASTE_ALREADY_EXISTS` por identidad, incluso en carrera concurrente, incluye
`meta.waste` para identificar la merma existente y permitir una entrada adicional.
Recuperar una creación propia ya confirmada responde éxito y no utiliza ese
conflicto para generar otra entrada.

Los GET de listados de compras/salidas omiten `details`. En compras, el campo
`observations` pertenece al encabezado y se devuelve tanto en listado como
por ID, incluido `null` cuando no hay texto; no depende de `includeDetails`.
Antes de editar, surtir o devolver, el cliente consulta GET por ID con la misma
autorización y contexto del listado.
Omitir la relación en un listado no permite guardar un documento vacío: las altas y
ediciones completas exigen al menos un detalle. Editar sólo el encabezado conserva
los detalles existentes y permite omitir el campo; si se envía, no acepta un array vacío.

### Alcance de áreas de Salidas

`GET /api/admin/departments?context=issues` filtra las opciones según las asignaciones
vigentes de la sesión. Auxiliar y Coordinador de Almacén, y Administrador del sistema,
consultan y registran salidas de todas las áreas. Para las demás cuentas autorizadas,
listado, conteos, reportes y lectura por ID se limitan a sus áreas. Esto aplica por
igual a Materiales, Consumibles y Mermas.

La API no acepta permisos ni alcances enviados en el payload. Alta o cambio de
destino a un área no autorizada devuelve `403 FORBIDDEN`; consulta o edición de un
ID ajeno devuelve `404` sin divulgar su contenido. En edición se comprueba también
el área original, dentro de la transacción y antes de cambiar datos. Los permisos
de surtido/devolución permanecen independientes.

### Identificadores y datos de escritura

Los errores de campos y metadatos enviados en el body responden con
`400 VALIDATION_ERROR` y un objeto `errors` por campo. Esto incluye `expectedVersion`
y `operationId` cuando la operación los exige. Un identificador de detalle con formato
inválido se informa dentro de `details`; la existencia, pertenencia y estado del
registro se comprueban en el servidor.

Un UUID de ruta válido que no identifica un registro disponible devuelve `404` y su
código de dominio, como `WASTE_NOT_FOUND` o `PERSON_NOT_FOUND`. Un UUID de ruta mal
formado devuelve `400 RECORD_ID_INVALID`, sin `errors.id`, `errors.detailId` ni detalles
SQL. Es un error global, no un rechazo de un campo del body.

La validación distingue ausencia y tipo incorrecto: un campo opcional presente con un
tipo no admitido se rechaza. Un array no es un identificador, un booleano no es un nombre
y `2abc` no es una cantidad. Los textos se recortan después de comprobar su tipo;
las observaciones ausentes o nulas de la escritura se normalizan a texto vacío.
Nombres de personas y clientes admiten 255 caracteres; materiales, mermas y razón
social, 200; nombre comercial, 100; observaciones, 500. Las fechas deben existir en el
calendario, además de cumplir el formato admitido. Los accesos requieren al menos una
fila con UUID v4 de área y rol, sin repetir área aunque cambie la capitalización del UUID.

En materiales y consumibles, `creationContext=goodsReceipt` permite omitir costo y
stock inicial sólo al crear el recurso. No exime los valores obligatorios de una
edición o un ajuste. En los detalles de surtido se admiten booleanos o los textos
`true`/`false`; el texto `false` conserva el valor falso.

La composición de validadores, normalización y DTO pertenece a la
[referencia de validadores comunes](../views/development/reuse-and-refactoring/01-backend-handlers-and-services.md#validadores-comunes-y-condiciones-de-captura).
Los errores, su formato y los códigos públicos son parte del contrato HTTP; su
presentación visual corresponde a cada cliente.

### Protección de escrituras y reintentos

| Operación | Protección vigente y límite |
| --- | --- |
| Crear merma y agregar stock | Recibo transaccional por actor y `operationId`; recupera el resultado original. |
| Ajustar saldo y editar recursos versionados | Escritura condicionada por la versión de la captura; un reintento viejo se rechaza, sin recuperar automáticamente la respuesta original. |
| Surtir y cancelar detalles | Bloqueos y comprobación transaccional del estado evitan aplicar dos veces una transición ya consumida; no equivalen a un recibo de respuesta. |
| Devolver parcialmente materiales, consumibles o merma | El saldo devuelto se bloquea y acota, pero una repetición puede aceptar otra devolución mientras quede cantidad disponible. La recuperación por clave sigue pendiente. |
| Crear compras sin factura, ampliar sus detalles o crear solicitudes de salida | Se mantienen sus reglas de identidad/estado; no hay recibo de reintento. Una captura repetida puede crear otro documento o movimiento. |

La necesidad depende del efecto repetible, no del verbo HTTP ni de que el recurso
principal sea nuevo. Extender la recuperación a estos procesos requiere un contrato
de clave conservada por captura, rechazo de otra captura con la misma clave y recibo
en la misma transacción de sus efectos. La tabla `WasteOperation` no acredita esa
cobertura para otros módulos.

### Códigos de éxito

Las operaciones que devuelven `code` usan los códigos definidos en
`src/shared/constants/apiSuccessCodes.js`. El cliente comprueba el código esperado
para la operación y los datos requeridos por su respuesta antes de anunciar éxito.
No construye códigos por prefijos ni usa el texto de un mensaje como identificador.
La renovación de sesión y las descargas tienen los tipos de respuesta específicos
que declara OpenAPI; no todas las respuestas correctas contienen un `code`.
