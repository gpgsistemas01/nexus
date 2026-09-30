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
| Adaptación de detalles | [Diagrama del contrato](15-maintenance.md#diagrama-del-contrato-de-datos-de-los-detalles) | [Mantenimiento](15-maintenance.md) |

Una refactorización no genera un diagrama por defecto: se representa el resultado
vigente o, si existe una migración aprobada, un antes/después rotulado como actual y
objetivo. Al cambiar un patrón se actualizan su diagrama canónico, consumidores y
pruebas; el historial mecánico de archivos permanece en Git.
