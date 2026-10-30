# Vista lógica

Esta vista describe colaboradores del cliente, estructuras de datos en memoria y
estados de interacción. Cada familia reúne su índice, figuras, fuentes y lectura.

| Familia | Pregunta | Contenido |
| --- | --- | --- |
| [Componentes](components/index.md) | ¿Quién depende de quién y qué responsabilidad conserva? | Cortes por dominio y composición visual compartida. |
| [Clases, interfaces y tipos](class-and-type-models/index.md) | ¿Cómo se estructuran y relacionan los datos? | Modelos curados por responsabilidad, variantes y multiplicidades. |
| [Referencia TypeScript](type-reference/index.md) | ¿Cuál es la firma completa de cada contrato propio? | Inventario generado de TS/SFC, miembros y relaciones locales. |
| [Estado y ciclo de vida](states/index.md) | ¿Qué evento cambia el modo y bajo qué condición? | Propietarios, guardado, lectura, acciones documentales y captura recuperable. |

## Límites y documentos relacionados

El [dominio conceptual](../../../requirements/domain-model/index.md) define conceptos
del negocio. Los modelos de esta vista son sus proyecciones en el navegador: un array
`details` no es una relación SQL y una interfaz no implica una clase instanciada.
Las [secuencias](../processes/index.md) explican el orden de las colaboraciones.

| Preocupación transversal | Fuente propietaria |
| --- | --- |
| Datos intercambiados, errores y sesión HTTP | [Contratos del cliente](../../contracts/index.md). |
| Reglas de estilo, foco y accesibilidad | [Estándar de interfaz](../../interface-standards.md). |
| Normalización, reglas públicas y salida segura | [Integración de reglas públicas](../development/input-handling.md) y [estándar de seguridad](../../security-standards.md). |
| Organización del código y mecanismos reutilizados | [Desarrollo y patrones](../development/index.md). |

La [guía visual](../diagram-reading.md) concentra la notación. Cada figura conserva
sus fuentes y condiciones particulares.
