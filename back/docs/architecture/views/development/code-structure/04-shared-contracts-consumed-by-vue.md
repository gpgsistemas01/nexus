# 4. Contratos compartidos consumidos por Vue

El cliente Vue llama a la API mediante sus servicios de módulo y el cliente HTTP
compartido. Los tipos y reglas puras que se publican a ambos entornos viven en
`back/src/shared`; Vite incorpora únicamente los módulos permitidos para el cliente.

El contrato HTTP se define en [OpenAPI](../../../openapi/index.md). La API no confía
en validaciones de interfaz: rutas, middleware, validators y DTO comprueban la entrada
antes de ejecutar servicios y persistencia. Los detalles de composición, estado y
transporte del consumidor pertenecen a la
[arquitectura Vue](../../../../../../front/docs/architecture/index.md).
