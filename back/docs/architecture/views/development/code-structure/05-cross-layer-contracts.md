# 5. Contratos entre capas

La frontera de la API está definida por el [contrato HTTP](../../../openapi/api-contract.md):
los consumidores envían JSON o archivos y reciben respuestas JSON, errores o descargas.
Express autentica, autoriza y valida la entrada antes de delegar en el controller. El
DTO normaliza los campos admitidos; el servicio resuelve pertenencia, estado y reglas,
y ejecuta las escrituras relacionadas con un único cliente transaccional.

Las respuestas y errores conservan sus códigos públicos. Los datos del cliente no
determinan roles, saldos, importes persistidos ni permisos. Los módulos puros de
`src/shared` ayudan a alinear tipos o cálculos publicados, pero no sustituyen la
validación del servidor. Las consultas paginadas y los reportes conservan el contexto
de su endpoint.

La implementación se localiza en la [referencia backend](../backend-technical-documentation/index.md)
y la [referencia de contratos Vue](../../../../../../front/docs/architecture/contracts/client-contracts.md).
