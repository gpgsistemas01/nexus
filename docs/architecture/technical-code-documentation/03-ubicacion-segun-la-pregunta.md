# 3. Ubicación según la pregunta

Antes de escribir, se identifica qué necesita comprender la persona lectora. La
respuesta se agrega al artefacto propietario o se enlaza desde él; no se copia en varios
documentos.

| Pregunta técnica | Ubicación propietaria | Uso de diagramas |
| --- | --- | --- |
| ¿Qué responsabilidad tiene una capa, dominio o componente y cómo colabora? | [Arquitectura y catálogo de vistas web](../architecture-and-web-views/index.md) para contexto y componentes; [diagramas vigentes del código](../code-diagrams/index.md) para estructura, dinámica y reutilización. | Actualizar la vista Mermaid existente si cambia su semántica; crear otra sólo si responde una pregunta diferente. |
| ¿Qué patrón se reutiliza y dónde están sus puntos de extensión? | [Patrones de diseño y construcción](../design-and-construction-patterns/index.md). | Enlazar su diagrama canónico o agregar una vista que evidencie el patrón sin enumerar cada consumidor. |
| ¿Qué rutas e importaciones existen realmente? | [Mapa generado del código](../../generated/code-map.md). | Regenerar con `npm run docs:architecture`; no mantener a mano otro inventario. |
| ¿Qué modelos, campos y relaciones persisten? | [Esquema generado](../../generated/database-schema.md), [diccionario técnico](../../generated/data-dictionary.md) y `prisma/schema.prisma`. | Enlazar el diagrama entidad-relación generado; las decisiones de acceso permanecen en la [familia de datos](../../data/index.md). |
| ¿Cuál es el contrato HTTP observable? | [Contrato de la API](../api-contract/index.md); el mapa generado localiza los endpoints registrados. | Un flujo de secuencia puede enlazar el contrato, pero no repetir todas sus respuestas y errores. |
| ¿Por qué existe el comportamiento y qué regla satisface? | [Requisitos](../../requirements/index.md) y su [matriz de operaciones](../../requirements/requirements-operations-matrix.md). | Enlazar los diagramas funcionales existentes; no inferir actores o reglas desde nombres de funciones. |
| ¿Cómo se comprueba el comportamiento? | [Estrategia](../../testing/service-test-coverage.md), [plan de pruebas](../../testing/test-plan.md) y pruebas bajo `tests`. | Los diagramas pueden localizar el límite probado, pero la prueba ejecutable conserva la evidencia. |
| ¿Qué decisión local no resulta evidente al leer una función? | Comentario próximo al código o JSDoc, de acuerdo con el [estándar de codificación](../coding-standards/10-comentarios-y-documentacion.md). | Enlazar una vista estable sólo si aporta contexto; no insertar Mermaid en archivos JavaScript. |
