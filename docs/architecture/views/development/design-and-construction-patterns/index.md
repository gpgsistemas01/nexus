# Patrones de diseño y construcción aplicados

## Recorrido de lectura

Empiece por el alcance (2), el resumen (3) y el catálogo visual (4). Después consulte el
mecanismo que necesita y termine con reutilización/refactorización (8 y 16). El registro
de catálogos (1) es una aplicación especializada, no la entrada conceptual del documento.
Los números y archivos existentes se conservan para mantener sus referencias.

| Tipo de contenido | Qué demuestra | Capítulos |
| --- | --- | --- |
| Patrón arquitectónico | Distribución de responsabilidades y dependencias. | Monolito modular y capas. |
| Mecanismo o estrategia aplicada | Contrato común, configuración y consumidores reales. | Pipeline, DTO, políticas, factories, transacción, eventos, registro y auditoría. |
| Convención de construcción | Criterio para ubicar, ordenar o extraer código. | Ownership, orden de métodos, mantenimiento y refactorización. |

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
16. [16. Refactorización y extensión](16-refactoring-and-extension.md)

## Cobertura visual

Cada patrón confirmado tiene un diagrama canónico o un capítulo visual propio. Los
capítulos textuales conservan definición, límites y reglas de construcción; no repiten
la colaboración que ya explica el diagrama enlazado.

| Patrón o preocupación | Diagrama canónico | Capítulo de detalle |
| --- | --- | --- |
| Registro seguro de catálogos | [`DIA-ARQ-CAT-001..004`](01-registration-of-catalogs-with-checklist-allowlist.md#diagrama-del-patrón-de-catálogos-administrables) | [Registro con lista blanca](01-registration-of-catalogs-with-checklist-allowlist.md) |
| Monolito modular y capas | [`DIA-PAT-EST-001`](04-catalog-visual-of-patterns-applied.md#estructura-por-dominio-capas-y-fronteras) | [Arquitectura por capas](05-monolith-modular-by-domain-and-architecture-by-layers.md) |
| Pipeline, DTO y políticas | [`DIA-PAT-FRO-001`](04-catalog-visual-of-patterns-applied.md#pipeline-dto-y-políticas-declarativas) | [Pipeline](06-pipeline-of-middleware.md) y [DTO/políticas](07-dto-functional-and-policies-declarative.md) |
| Factories y composición | [`DIA-PAT-CON-001`](04-catalog-visual-of-patterns-applied.md#factories-y-composición-sobre-herencia) | [Factory functions](08-factory-functions-and-composition-of-applications.md) |
| Transacción, eventos y auditoría | [`DIA-PAT-DIN-001`](04-catalog-visual-of-patterns-applied.md#transacción-eventos-y-auditoría) | [Transacción](09-context-transactional-and-consistency-atomic.md), [eventos](10-publication-of-events-of-inventory.md) y [auditoría](11-audit-trail-cross-cutting.md) |
| Composición y ownership visual | [`DIA-PAT-UI-001`, `DIA-PAT-OWN-001`, `DIA-PAT-DET-001` y `DIA-PAT-SEL-001`](12-composition-and-ownership-of-components-visual.md#composición-de-la-interfaz) | [Componentes visuales](12-composition-and-ownership-of-components-visual.md) |
| Orden de métodos | [`DIA-PAT-ORD-001`](13-order-of-methods-by-behavior.md) | [Orden por comportamiento](13-order-of-methods-by-behavior.md) |
| Test harness | [`DIA-PAT-TST-001`](04-catalog-visual-of-patterns-applied.md#test-harness-configurable) | [Construcción de pruebas](14-patterns-of-construction-of-tests.md) |
| Adaptación de detalles | [`DIA-PAT-DAT-001`](07-dto-functional-and-policies-declarative.md#diagrama-del-contrato-de-datos-de-los-detalles) | [DTO y adaptadores](07-dto-functional-and-policies-declarative.md) |
| Políticas declarativas | [`DIA-PAT-POL-001`](07-dto-functional-and-policies-declarative.md#aplicación-de-políticas-declarativas) | [Evaluación y consumidores](07-dto-functional-and-policies-declarative.md#aplicación-de-políticas-declarativas) |
| Propagación del contexto transaccional | [`DIA-PAT-TX-001`](09-context-transactional-and-consistency-atomic.md#aplicación-del-contexto-en-una-entrada) | [Límite real de una entrada](09-context-transactional-and-consistency-atomic.md) |
| Publicación y suscriptores | [`DIA-PAT-EVT-001`](10-publication-of-events-of-inventory.md#aplicación-entre-publicador-y-consumidores) | [Eventos de inventario](10-publication-of-events-of-inventory.md) |
| Audit Trail | [`DIA-BE-SEQ-006`](../backend-technical-documentation/02-views-technical-applied.md#secuencia-transversal-de-auditoría-de-escrituras) | [Auditoría](11-audit-trail-cross-cutting.md) |
| Reutilización de transporte, tablas y servicios | [`DIA-COD-REU-003..005`](../code-diagrams/06-view-of-reuse-crud-and-interface.md#factories-de-requests-por-contexto) | [Resultado de la revisión](16-refactoring-and-extension.md#resultado-de-la-revisión-de-cobertura-visual) |
| Refactorización y extracción | [`DIA-PAT-REF-001` y `DIA-PAT-REF-002`](16-refactoring-and-extension.md) | [Resultado vigente y criterios](16-refactoring-and-extension.md) |
| Renovación coordinada de sesión | [`DIA-FE-TEC-SES-001`](../frontend-technical-documentation/02-views-technical-applied-by-flow-frontend.md#renovación-coordinada-del-transporte-http) | [Transporte HTTP compartido](../frontend-technical-documentation/02-views-technical-applied-by-flow-frontend.md#renovación-coordinada-del-transporte-http) |

Cada explicación conecta problema, implementación, contrato, configuradores, consumidores
y límites. La refactorización tiene una representación de extracción y una guía de
revisión en el capítulo 16; se representa el resultado
vigente o, si existe una migración aprobada, un antes/después rotulado como actual y
objetivo. Al cambiar un patrón se actualizan su diagrama canónico, consumidores y
pruebas; el historial mecánico de archivos permanece en Git.
