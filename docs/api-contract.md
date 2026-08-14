# Contrato de la API

## Decisión

**Sí conviene adoptar OpenAPI, pero Swagger no sustituye la documentación de
arquitectura.** OpenAPI documentaría el contrato HTTP —rutas, parámetros, payloads,
respuestas, errores y autenticación—; Swagger UI sería sólo una interfaz para consultar
y probar ese contrato.

Nexus todavía no publica un contrato OpenAPI. El
[mapa generado](generated/code-map.md) inventaría los métodos y rutas reales, pero no
pretende inferir esquemas desde `express-validator`, DTO, controllers y servicios. Una
especificación que sólo liste endpoints daría una falsa sensación de cobertura.

## Propuesta simple

1. Crear un contrato OpenAPI 3.1 versionado, comenzando por un CRUD completo y sus
   errores; clientes o proveedores son mejores candidatos que un flujo transaccional.
2. Reutilizar componentes de esquema para paginación, errores, identificadores y
   respuestas comunes. No copiar el mismo payload entre operaciones o dominios.
3. Validar el contrato en CI y agregar pruebas de integración relacionadas con el CRUD
   documentado, siguiendo [la estrategia de pruebas](service-test-coverage.md).
4. Publicar Swagger UI sólo como visualizador del contrato. En producción debe quedar
   deshabilitado o protegido si revela operaciones internas.
5. Migrar el siguiente recurso únicamente cuando el anterior describa solicitudes,
   respuestas y errores reales. No declarar la API completa de una vez con esquemas
   incompletos.

## Cuándo implementarlo

Priorizar OpenAPI cuando exista al menos una de estas necesidades:

- integración con otro sistema o equipo;
- generación de clientes o pruebas de contrato;
- consumidores que no pueden leer el código del servidor;
- necesidad de probar endpoints desde una interfaz controlada.

Mientras la aplicación web sea el único consumidor, no es un bloqueo operativo. Aun
así, el contrato aporta valor y debe incorporarse incrementalmente en lugar de intentar
generarlo automáticamente desde rutas que no contienen toda la semántica.

## Fuente de verdad actual

Hasta adoptar OpenAPI, se consulta en este orden:

1. [mapa generado](generated/code-map.md) para métodos y rutas;
2. `src/routes/api/` para middleware, permisos y validadores;
3. `src/validators/`, `src/dtos/` y controllers para entradas y respuestas;
4. pruebas de integración para comportamiento observable y persistencia.
