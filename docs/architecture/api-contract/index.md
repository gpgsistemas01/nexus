# Contrato de la API

OpenAPI es la referencia procesable de solicitudes y respuestas. Las rutas registradas,
validadores, DTO, controladores y pruebas permiten contrastarla; el mapa generado aporta
el inventario, pero ninguno de esos artefactos reemplaza por sí solo el contrato.

## Contenido

- [Cómo documentar una ruta API](01-how-document-a-route-api.md) y
  [decisión de OpenAPI](03-decision.md).
- Contratos particulares: [exportación mensual](02-export-monthly-of-reports.md),
  [precisión decimal](06-precision-of-values-decimal.md),
  [relaciones de inventario](07-relationships-of-inventory-in-the-client-web.md) y
  [conflictos en el cliente](08-presentation-of-conflicts-in-the-client-web.md).

Como recordatorio, todo cambio HTTP actualiza la operación, sus componentes reutilizados
y sus pruebas en la misma modificación. `npm run docs:check` valida el contrato; Swagger
UI sólo lo visualiza y debe permanecer deshabilitado o protegido en producción.
