# 7. Cuándo diagramar y cuándo referenciar

Se agrega o modifica un diagrama cuando una relación entre participantes, una secuencia,
una transición de estado o un límite resulta difícil de verificar sólo con prosa. Se
prefiere una referencia cuando la vista existente ya responde la misma pregunta, aunque
el nuevo flujo sea otro consumidor del patrón.

Ejemplos vigentes que deben enlazarse antes de crear otra vista:

- contexto, contenedores, despliegue, componentes y recorrido general en
  [arquitectura y vistas web](../architecture-and-web-views/02-architecture-of-the-system.md);
- superficie HTTP, colaboración de dominios, petición real y reutilización CRUD en
  [diagramas del código](../code-diagrams/02-pattern-of-organization-of-the-views.md);
- dependencias reales entre áreas en el
  [mapa generado](../../generated/code-map.md#dependencias-entre-áreas);
- entidades y cardinalidades en el
  [esquema generado de base de datos](../../generated/database-schema.md);
- flujos funcionales y estados en los
  [diagramas de requisitos](../../requirements/diagrams/index.md).

No se crea un diagrama por endpoint, tabla o función. Cuando un caso sí requiere una
vista dinámica, ésta se limita a ese `CU-*` y no se generaliza para representar otros
casos mediante nombres alternativos o participantes sustituibles. Tampoco se presenta
una propuesta como arquitectura vigente: una vista futura identifica explícitamente su
estado y no se mezcla con el recorrido implementado.
