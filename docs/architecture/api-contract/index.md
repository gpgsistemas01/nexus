# Contrato de la API

OpenAPI es la referencia procesable de solicitudes y respuestas. Las rutas registradas,
validadores, DTO, controladores y pruebas permiten contrastarla; el mapa generado aporta
el inventario, pero ninguno de esos artefactos reemplaza por sí solo el contrato.

## Capítulos

1. [1. Cómo documentar una ruta API](01-how-document-a-route-api.md).
2. [2. Exportación mensual de reportes](02-export-monthly-of-reports.md).
3. [3. Decisión](03-decision.md).
4. [4. Precisión de valores decimales](04-precision-of-values-decimal.md).
5. [5. Relaciones de inventario en el cliente web](05-relationships-of-inventory-in-the-client-web.md).
6. [6. Presentación de conflictos en el cliente web](06-presentation-of-conflicts-in-the-client-web.md).

Como recordatorio, todo cambio HTTP actualiza la operación, sus componentes reutilizados
y sus pruebas en la misma modificación. `npm run docs:check` valida el contrato; Swagger
UI sólo lo visualiza y debe permanecer deshabilitado o protegido en producción.
