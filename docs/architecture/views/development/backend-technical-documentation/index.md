# Documentación técnica del backend

Referencia del servidor organizada por responsabilidades de diseño implementadas. Su
propósito es explicar límites, contratos internos, reglas, transacciones, errores y
colaboraciones que no se comprenden con una lista de archivos.

Esta sección **no mantiene otra matriz de trazabilidad por caso**. La correspondencia
entre requisito, caso, evidencia técnica y prueba pertenece a la
[vista de componentes](../../logical/01-components-and-reuse.md); la ruta y los símbolos se
consultan en el [mapa generado](../code-map.md), y el recorrido concreto de cada `CU-*`
en las [secuencias backend](../../processes/backend-code-sequences/index.md). Tampoco
repite el contrato HTTP procesable, que pertenece a OpenAPI.

## Capítulos

1. [1. Responsabilidades y contratos](01-catalog-complete-of-records-backend.md):
   responsabilidades, entradas, efectos y límites transaccionales por capacidad.
2. [2. Diagramas técnicos complementarios](02-views-technical-applied.md): sólo actividades,
   estados o coordinaciones que agregan una decisión no visible en el mapa o las
   secuencias por caso.

La integración de [Prisma y persistencia](../code-structure/06-prisma-and-persistence.md)
explica el cliente compartido, las consultas en servicios, la propagación de `tx` y
la separación entre generación del cliente y aplicación de migraciones. Los
[handlers y servicios compartidos](../reuse-and-refactoring/01-backend-handlers-and-services.md)
identifican la variación por tipo y los contratos de transporte.
