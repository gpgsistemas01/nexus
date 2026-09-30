# Vistas arquitectónicas

## Organización 4+1

El [documento de arquitectura](../index.md) es la entrada del conjunto. Esta carpeta
organiza sus representaciones mediante la adaptación 4+1 de Nexus: una vista responde
una pregunta arquitectónica y enlaza los artefactos que la contestan.

| Vista | Pregunta | Entrada |
| --- | --- | --- |
| [Escenarios (+1)](scenarios/index.md) | ¿Qué objetivo del actor condiciona la solución y cómo navega por ella? | Casos de uso, navegación web y trazabilidad. |
| [Lógica](logical/index.md) | ¿Qué dominios, componentes, estados y datos colaboran? | Componentes, relaciones y persistencia. |
| [Procesos](processes/index.md) | ¿En qué orden ocurre una colaboración y dónde se toman decisiones? | Recorrido general, secuencias y vistas dinámicas. |
| [Desarrollo](development/index.md) | ¿Cómo se organiza, implementa y reutiliza el código? | Referencias técnicas, diagramas, patrones y mapa generado. |
| [Física](physical/index.md) | ¿Dónde se ejecuta y despliega la solución? | Contexto, contenedores e infraestructura. |

## Artefactos de apoyo fuera de las vistas

No todo documento de arquitectura es una vista. Las referencias y reglas transversales
permanecen fuera de `views/` porque se consultan desde varias perspectivas:

- [Contrato de la API](../api-contract/index.md) y [OpenAPI](../openapi/openapi.json):
  interfaz HTTP compartida por escenarios, procesos y desarrollo.
- [Matriz de trazabilidad](../traceability-matrix/index.md): correspondencia entre
  requisitos, vistas, implementación y pruebas.
- [Inventario](../diagram-inventory/index.md) y
  [convenciones de diagramas](../diagram-conventions/index.md): identificación y notación.
- [Estándar de codificación](../coding-standards/index.md): reglas de construcción del
  código, no descripción de la solución.

Así, `views/` contiene todo artefacto cuyo propósito principal es representar el sistema;
la raíz de `architecture/` conserva las referencias, correspondencias y estándares que
apoyan varias vistas sin pertenecer a una sola.
