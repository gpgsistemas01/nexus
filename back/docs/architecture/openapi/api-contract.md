# Reglas HTTP complementarias

[OpenAPI](openapi.json) es la fuente de rutas, campos, formatos y respuestas. Esta
guía resume los comportamientos HTTP que dependen del estado de la solicitud.

## Sesión

Los tokens sólo se envían en cookies `HttpOnly`; en producción, también `Secure`.
El cierre de sesión usa `POST /cerrar-sesion`; no existe `POST /api/auth/logout`.
Ante un `401` protegido, la aplicación renueva la sesión y repite una vez. Login y
refresh no inician otra renovación; un fallo de red no demuestra credenciales inválidas.
`GET /api/auth/me` devuelve `name` como nombre de usuario y agrega `personName`
cuando la cuenta está vinculada a una persona.

## Listados y reportes

`start` inválido o fuera de rango usa `0`; `length` inválido usa `10`, negativo usa `0`
y `length=0` solicita sólo conteos. El máximo de `length` es `100`.
Los XLSX no se limitan a la página actual. Con `monthlyReport=true`, el reporte usa el
mes completo e ignora filtros del listado; `reportMonth=AAAA-MM` lo selecciona. Si falta
o es inválido, usa el mes actual de Ciudad de México. Un fallo previo a transmitir el
archivo devuelve JSON; si la descarga empezó, se cierra la conexión.

## Escrituras y reintentos

Use `code` para identificar el resultado; `message` es texto de presentación.
`expectedVersion` y `expectedMaterialVersion` deben ser los valores leídos. Un valor
obsoleto responde `409 RECORD_VERSION_CONFLICT`: vuelva a consultar y revise la captura.

La creación/entrada de merma acepta `operationId`: repetir la misma clave y cuerpo
recupera el recibo; cambiar el cuerpo produce `409 OPERATION_KEY_CONFLICT`. Las demás
escrituras no garantizan recuperar una respuesta repetida; consulte el estado antes de
reintentar una solicitud cuyo resultado sea incierto.

## Conteo de existencias por Excel

La plantilla de ajuste actual usa `NEXUS_INVENTORY_V3`. En `Datos` se captura
`Stock contado` por fila. `Instrucciones!B4` contiene el motivo activo y
`Instrucciones!B5` las observaciones del documento. Ambos datos son
obligatorios cuando cambia algún saldo. Los archivos de ajuste con formato
anterior requieren descargar la plantilla actual.

El archivo se analiza en memoria. El borrador sólo conserva datos de la vista
previa y metadatos de la carga. Al confirmar un conteo, sólo los saldos físicos
distintos generan partidas y el recibo identifica el documento común en
`result.adjustment`. Las filas aplicadas conservan el folio en
`details.adjustmentReference`. Si todos los saldos coinciden, el recibo indica
que las filas quedaron sin cambios y omite `result.adjustment`. La misma clave
de confirmación recupera el recibo y el folio ya emitido, si lo hubo.

## Surtimiento parcial

En `PATCH /:id/details`, envíe juntos `quantityToSupply` y `expectedSuppliedQuantity`.
El primero es la cantidad entregada ahora; el segundo, el acumulado leído. Un acumulado
obsoleto produce `409 RECORD_VERSION_CONFLICT`; una cantidad mayor al pendiente produce
`409 ISSUE_SUPPLY_QUANTITY_CONFLICT`. Si se omiten ambos, se conserva
la compatibilidad con clientes que surten todo el pendiente seleccionado.

La cantidad para presentación `PIEZA/PIEZAS` debe ser entera según el registro del
servidor; una fracción responde `409 INVENTORY_PIECE_QUANTITY_REQUIRED`.
