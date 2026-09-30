# Documentación técnica del frontend

Referencia del navegador organizada por responsabilidades implementadas: composición de
pantalla, estado local, validación, reutilización y frontera HTTP. La vista estructural
compartida se mantiene en
[componentes y reutilización](../../logical/01-components-and-reuse.md).

Esta sección no duplica una matriz caso–código. La cobertura entre requisitos,
arquitectura, código y pruebas se conserva en la
[matriz transversal](../../../traceability-matrix/index.md); los archivos e imports se
localizan en el [mapa generado](../code-map.md), y cada interacción concreta se consulta
en las [secuencias frontend](../../processes/frontend-code-sequences/index.md). Quedan
fuera también los pasos normativos del actor, que pertenecen a las fichas `CU-*`, y la
forma del contrato HTTP, que pertenece a OpenAPI.

## Capítulos

1. [1. Catálogo de componentes](01-catalog-complete-of-records-frontend.md):
   responsabilidades y mecanismos reutilizables por flujo.
2. [2. Vistas técnicas aplicadas](02-views-technical-applied-by-flow-frontend.md): sólo
   dinámicas o estados de interfaz que agregan información no expresada por las
   secuencias por caso.
