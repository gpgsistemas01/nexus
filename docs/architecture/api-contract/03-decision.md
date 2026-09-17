# 3. Decisión

**Nexus adopta OpenAPI, pero Swagger no sustituye la documentación de arquitectura.**
La [especificación versionada](../openapi/openapi.json) documenta el contrato HTTP —rutas,
parámetros, payloads, respuestas, errores y autenticación—; Swagger UI sería sólo una
interfaz opcional para consultar y probar ese contrato.

El contrato OpenAPI publica las 61 operaciones actuales y sus esquemas de entrada y
salida. `npm run docs:check` compara sus operaciones con el
[mapa generado](../../generated/code-map.md), de modo que una ruta nueva, eliminada o
renombrada exige actualizar ambos artefactos. La comprobación no infiere la semántica de
`express-validator`, DTO, controllers y servicios: sus cambios deben reflejarse
deliberadamente en los componentes afectados del contrato.

### Organización y exportación del contrato procesable

Las fuentes se dividen por responsabilidad bajo `docs/architecture/openapi/`:

- `openapi.json` es el punto de entrada y conserva metadatos, seguridad y referencias;
- `paths/auth.json`, `paths/admin.json`, `paths/sales.json` y `paths/warehouse.json`
  agrupan las operaciones conforme a los routers existentes;
- `components/common-schemas.json` contiene los contratos transversales y los archivos
  `*-schemas.json` de autenticación, administración, ventas y almacén conservan los
  contratos reutilizables de entrada y salida de cada dominio;
- `components/responses.json` concentra las respuestas transversales.

Esta división reduce conflictos de edición, permite revisar cada dominio por separado y
mantiene juntos los esquemas compartidos. No se divide según si una ruta devuelve JSON o
exporta Excel: el tipo de medio se declara en la respuesta de la propia operación.

La fuente modular y el artefacto publicado cumplen propósitos diferentes. Las referencias
relativas son válidas al consultar `docs/architecture/openapi/openapi.json` dentro del
repositorio; al exportar `arquitectura` —también mediante `todos`— el flujo las resuelve y
genera un único contrato autocontenido en `build/docs/openapi/openapi.json`. Ese archivo
se puede importar directamente en validadores, generadores de clientes y visualizadores
sin distribuir el árbol de fuentes.

El contrato procesable no se incrusta como miles de líneas dentro del DOCX o PDF. El
documento humano explica las reglas y el JSON resuelto se entrega por separado para
herramientas. Tanto `npm run docs:check` como la exportación recorren el mismo punto de
entrada modular, evitando mantener manualmente una segunda especificación consolidada.
