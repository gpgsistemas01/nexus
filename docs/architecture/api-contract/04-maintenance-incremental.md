# 4. Mantenimiento incremental

1. Reutilizar componentes de esquema para paginación, errores, identificadores y
   respuestas comunes. No copiar el mismo payload entre operaciones o dominios.
2. Validar el contrato con `npm run docs:check` y agregar pruebas de integración
   relacionadas con el CRUD documentado, siguiendo
   [la estrategia de pruebas](../../testing/service-test-coverage.md).
3. Publicar Swagger UI sólo como visualizador del contrato. En producción debe quedar
   deshabilitado o protegido si revela operaciones internas.
4. Actualizar en una misma modificación la operación, sus componentes reutilizables y
   las pruebas cuando cambie el contrato HTTP.
