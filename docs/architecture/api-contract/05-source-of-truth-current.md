# 5. Fuente de verdad actual

El contrato se consulta en este orden:

1. [OpenAPI 3.1](../openapi/openapi.json) para parámetros y esquemas de solicitud y respuesta;
2. [mapa generado](../../generated/code-map.md) para el inventario de métodos y rutas;
3. `src/routes/api/` para middleware, permisos y validadores;
4. `src/validators/`, `src/dtos/` y controllers para contrastar entradas y respuestas;
5. pruebas de integración para comportamiento observable y persistencia.
