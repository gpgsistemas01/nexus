# Contrato de la API

La [especificación OpenAPI 3.1](../openapi/openapi.json) es la referencia procesable de
métodos, rutas, parámetros, cuerpos, respuestas y autenticación. Sus fuentes modulares se
organizan por dominio bajo `docs/architecture/openapi/`; la exportación las resuelve en
un solo archivo para herramientas externas.

Las rutas registradas en `src/routes/api` son la fuente de la superficie HTTP y el
[mapa generado](../views/development/code-map.md) permite contrastarlas. Validadores,
DTO, controladores y pruebas verifican el comportamiento implementado. Cuando cambia
una operación, se actualizan su definición OpenAPI, sus componentes reutilizados y las
pruebas relacionadas; `npm run docs:check` comprueba que las operaciones registradas y
publicadas permanezcan sincronizadas.

## Reglas contractuales complementarias

1. [Exportación mensual de reportes](01-export-monthly-of-reports.md): parámetros y
   selección del periodo para las descargas mensuales.
2. [Precisión de valores decimales](02-precision-of-values-decimal.md): precisión
   aceptada y diferencia entre transporte, persistencia y presentación.

Las reglas de negocio permanecen en requisitos, la estructura persistente en Prisma y
la coordinación interna en las referencias técnicas. Este documento no repite tutoriales
de JSON, criterios personales para redactar fichas ni detalles de presentación del
cliente web.
