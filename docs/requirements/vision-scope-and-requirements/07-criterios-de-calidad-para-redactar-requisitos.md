# 7. Criterios de calidad para redactar requisitos

Cada requisito de este documento debe cumplir simultáneamente estas condiciones antes
de considerarse aprobado:

| Condición | Regla de revisión |
| --- | --- |
| Necesario | Responde a una necesidad de un actor o a una restricción indispensable del negocio. |
| Correcto | Coincide con el comportamiento observable del código y con las restricciones de Prisma. |
| Claro y no ambiguo | Usa un sujeto y un verbo obligatorio; evita expresiones como «rápido», «adecuado», «cuando aplique» o «etcétera». |
| Atómico | Expresa una capacidad o regla verificable. Si dos comportamientos pueden aprobarse por separado, se documentan con identificadores distintos. |
| Completo | Indica actor o contexto, precondición relevante, respuesta esperada y datos afectados. |
| Consistente | No contradice otro requisito, el alcance, los estados del dominio ni la terminología `User`/`Person`. |
| Factible | Puede satisfacerse con la arquitectura y datos actuales; si requiere una decisión o desarrollo, se registra como brecha. |
| Verificable | Tiene un criterio de aceptación observable mediante una prueba, consulta de datos o inspección de configuración. |
| Trazable | Conserva un identificador estable y una referencia al código, prueba o modelo que lo sustenta. |
| Independiente de implementación | Describe el resultado de negocio; solo menciona tecnología cuando esta constituye una restricción del proyecto. |

### Plantilla y estado

La forma preferida es: **«Dado** [contexto], **cuando** [actor/evento], **el sistema
debe** [respuesta observable] **de modo que** [resultado verificable]». Los requisitos
pueden tener uno de estos estados:

- **Implementado:** existe evidencia en una ruta o servicio y en el modelo cuando hay
  persistencia.
- **Parcial:** solo una parte es accesible o verificable; se registra también como
  brecha.
- **Propuesto:** requiere validación del propietario de negocio y no se presenta como
  capacidad vigente.

El alcance siguiente incluye capacidades implementadas, parciales, modeladas o fuera
del alcance vigente. Su estado, criterios y evidencia se consultan en la especificación;
una modificación debe actualizar en el mismo cambio el enunciado, la trazabilidad y la
prueba correspondiente.
