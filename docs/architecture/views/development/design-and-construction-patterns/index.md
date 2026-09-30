# Patrones de diseño y construcción aplicados

## Contenido

1. [1. Registro de catálogos con lista blanca](01-registration-of-catalogs-with-checklist-allowlist.md)
2. [2. Alcance de la revisión](02-scope-of-the-review.md)
3. [3. Resumen de patrones confirmados](03-summary-of-patterns-confirmed.md)
4. [4. Catálogo visual de patrones aplicados](04-catalog-visual-of-patterns-applied.md)
5. [5. Monolito modular por dominio y arquitectura por capas](05-monolith-modular-by-domain-and-architecture-by-layers.md)
6. [6. Pipeline de middleware](06-pipeline-of-middleware.md)
7. [7. DTO funcional y políticas declarativas](07-dto-functional-and-policies-declarative.md)
8. [8. Factory functions y composición de aplicaciones](08-factory-functions-and-composition-of-applications.md)
9. [9. Contexto transaccional y consistencia atómica](09-context-transactional-and-consistency-atomic.md)
10. [10. Publicación de eventos de inventario](10-publication-of-events-of-inventory.md)
11. [11. Audit Trail transversal](11-audit-trail-cross-cutting.md)
12. [12. Composición y propiedad de componentes visuales](12-composition-and-ownership-of-components-visual.md)
13. [13. Orden de métodos por comportamiento](13-order-of-methods-by-behavior.md)
14. [14. Patrones de construcción de pruebas](14-patterns-of-construction-of-tests.md)
15. [15. Mantenimiento](15-maintenance.md)

## Cobertura visual y refactorizaciones

Los patrones y la reutilización sí admiten representación visual cuando el diagrama
responde una pregunta estructural o dinámica comprobable. No se crea, en cambio, un
“diagrama de refactorización” por cada cambio: una refactorización es una transformación
del código, no una vista arquitectónica estable. Se representa su **resultado vigente**
o, si existe una migración aprobada todavía en curso, un antes/después explícitamente
rotulado como actual y objetivo.

| Preocupación | Vista canónica | Decisión de representación |
| --- | --- | --- |
| Forma de los patrones aplicados | [Catálogo visual](04-catalog-visual-of-patterns-applied.md) | Conserva estructura, pipeline, construcción, coordinación transaccional y test harness; no se repite en cada capítulo textual. |
| Reutilización CRUD y de interfaz | [Vista de reutilización](../code-diagrams/06-view-of-reuse-crud-and-interface.md) | Muestra la pieza común, sus configuradores/consumidores y la variación que sigue perteneciendo al dominio. |
| Componentes compartidos entre frontend y backend | [Componentes y reutilización](../../logical/01-components-and-reuse.md) | Expone fronteras y conexiones estables; las secuencias por caso muestran el orden de ejecución. |
| Composición de componentes visuales | [Composición y propiedad](12-composition-and-ownership-of-components-visual.md) | Se documenta con tablas y vistas locales sólo cuando aclaran ownership, ciclo de vida o contrato DOM. |
| Extracción o consolidación realizada | [Perspectiva de realización](../code-diagrams/06-view-of-reuse-crud-and-interface.md#perspectiva-de-realización-de-la-reutilización) | El diagrama presenta la estructura resultante y sus consumidores; el historial del cambio permanece en Git. |
| Refactorización propuesta | No crea una vista por defecto. | Sólo merece un diagrama actual/objetivo cuando existe una decisión aprobada, impacto entre componentes y una transición que deba coordinarse. |

Por tanto, la revisión no requiere otra familia de diagramas. Al cambiar un patrón o una
abstracción reutilizada se actualiza la vista canónica anterior, sus consumidores y las
pruebas; una lista de archivos movidos o pasos mecánicos de edición queda fuera de la
documentación arquitectónica.
