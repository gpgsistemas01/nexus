# 5. Contratos entre capas

Vue coordina captura y presentación; su transporte envía JSON, multipart o peticiones
de descarga según el [contrato HTTP](../../../openapi/api-contract.md).
Express autentica, autoriza y valida la entrada antes de delegar en el controller.
El DTO normaliza los campos admitidos; el servicio resuelve pertenencia, estado y
reglas, y ejecuta las escrituras relacionadas con un único cliente transaccional.

Las respuestas y errores conservan sus códigos públicos. El cliente no determina
roles, saldos, importes persistidos ni permisos. Los helpers públicos sólo permiten
una vista previa de la captura. Las consultas paginadas y los reportes conservan el
contexto de su endpoint.

La implementación se localiza en la [referencia backend](../backend-technical-documentation/index.md)
y la [referencia de contratos Vue](../../../../../../front/docs/architecture/contracts/client-contracts.md).
