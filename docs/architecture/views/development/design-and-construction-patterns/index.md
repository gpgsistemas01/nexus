# Patrones de diseño y construcción aplicados

## Recorrido de lectura

Los capítulos siguen la construcción del software: alcance y resumen, mapa de patrones,
capas y fronteras, mecanismos compartidos y criterios de mantenimiento. Cada mecanismo
se vincula con la implementación y los consumidores descritos en
[estructura del código](../code-structure/index.md) y
[reutilización y refactorización](../reuse-and-refactoring/index.md).

## Capítulos

1. [1. Alcance de la revisión](01-scope-and-reading-guide.md)
2. [2. Resumen de patrones confirmados](02-confirmed-patterns.md)
3. [3. Catálogo visual de patrones aplicados](03-patterns-in-code.md)
4. [4. Monolito modular por dominio y arquitectura por capas](04-modular-monolith-and-layers.md)
5. [5. Pipeline de middleware](05-middleware-pipeline.md)
6. [6. DTO funcional y políticas declarativas](06-dtos-adapters-and-policies.md)
7. [7. Factory functions y composición de aplicaciones](07-factories-and-application-composition.md)
8. [8. Registro de catálogos con lista blanca](08-catalog-registry-and-allowlist.md)
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
| Registro seguro de catálogos | [`DIA-ARQ-CAT-001..004`](08-catalog-registry-and-allowlist.md#diagrama-del-patrón-de-catálogos-administrables) | [Registro con lista blanca](08-catalog-registry-and-allowlist.md) |
| Monolito modular y capas | [`DIA-PAT-EST-001`](03-patterns-in-code.md#estructura-por-dominio-capas-y-fronteras) | [Arquitectura por capas](04-modular-monolith-and-layers.md) |
| Pipeline, DTO y políticas | [`DIA-PAT-FRO-001`](03-patterns-in-code.md#pipeline-dto-y-políticas-declarativas) | [Pipeline](05-middleware-pipeline.md) y [DTO/políticas](06-dtos-adapters-and-policies.md) |
| Factories y composición | [`DIA-PAT-CON-001`](03-patterns-in-code.md#factories-y-composición-sobre-herencia) | [Factory functions](07-factories-and-application-composition.md) |
| Transacción, eventos y auditoría | [`DIA-PAT-DIN-001`](03-patterns-in-code.md#transacción-eventos-y-auditoría) | [Transacción](09-context-transactional-and-consistency-atomic.md), [eventos](10-publication-of-events-of-inventory.md) y [auditoría](11-audit-trail-cross-cutting.md) |
| Composición y ownership visual | [`DIA-PAT-UI-001`, `DIA-PAT-OWN-001`, `DIA-PAT-DET-001` y `DIA-PAT-SEL-001`](12-composition-and-ownership-of-components-visual.md#composición-de-la-interfaz) | [Componentes visuales](12-composition-and-ownership-of-components-visual.md) |
| Orden de métodos | [`DIA-PAT-ORD-001`](13-order-of-methods-by-behavior.md) | [Orden por comportamiento](13-order-of-methods-by-behavior.md) |
| Test harness | [`DIA-PAT-TST-001`](03-patterns-in-code.md#test-harness-configurable) | [Construcción de pruebas](14-patterns-of-construction-of-tests.md) |
| Adaptación de detalles | [`DIA-PAT-DAT-001`](06-dtos-adapters-and-policies.md#diagrama-del-contrato-de-datos-de-los-detalles) | [DTO y adaptadores](06-dtos-adapters-and-policies.md) |
| Políticas declarativas | [`DIA-PAT-POL-001`](06-dtos-adapters-and-policies.md#aplicación-de-políticas-declarativas) | [Evaluación y consumidores](06-dtos-adapters-and-policies.md#aplicación-de-políticas-declarativas) |
| Propagación del contexto transaccional | [`DIA-PAT-TX-001`](09-context-transactional-and-consistency-atomic.md#aplicación-del-contexto-en-una-entrada) | [Límite real de una entrada](09-context-transactional-and-consistency-atomic.md) |
| Publicación y suscriptores | [`DIA-PAT-EVT-001`](10-publication-of-events-of-inventory.md#aplicación-entre-publicador-y-consumidores) | [Eventos de inventario](10-publication-of-events-of-inventory.md) |
| Audit Trail | [`DIA-BE-SEQ-006`](../backend-technical-documentation/02-views-technical-applied.md#secuencia-transversal-de-auditoría-de-escrituras) | [Auditoría](11-audit-trail-cross-cutting.md) |
| Reutilización de transporte, tablas y servicios | [Requests, interfaz y servicios](../reuse-and-refactoring/index.md) | [Resultado de la revisión](../reuse-and-refactoring/04-refactoring-and-extension.md#resultado-de-la-revisión-de-cobertura-visual) |
| Refactorización y extracción | [`DIA-PAT-REF-001` y `DIA-PAT-REF-002`](../reuse-and-refactoring/04-refactoring-and-extension.md) | [Resultado vigente y criterios](../reuse-and-refactoring/04-refactoring-and-extension.md) |
| Renovación coordinada de sesión | [`DIA-FE-TEC-SES-001`](../frontend-technical-documentation/02-views-technical-applied-by-flow-frontend.md#renovación-coordinada-del-transporte-http) | [Transporte HTTP compartido](../frontend-technical-documentation/02-views-technical-applied-by-flow-frontend.md#renovación-coordinada-del-transporte-http) |

Cada explicación conecta problema, implementación, contrato, configuradores, consumidores
y límites. La refactorización tiene una representación de extracción y una guía de
revisión en [refactorización y extensión](../reuse-and-refactoring/04-refactoring-and-extension.md); se representa el resultado
vigente o, si existe una migración aprobada, un antes/después rotulado como actual y
objetivo. Al cambiar un patrón se actualizan su diagrama canónico, consumidores y
pruebas; el historial mecánico de archivos permanece en Git.
