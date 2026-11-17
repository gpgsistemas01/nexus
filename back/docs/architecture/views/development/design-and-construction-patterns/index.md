# Patrones de diseño y construcción de la API

## Propósito y relación con las referencias técnicas

Esta colección explica decisiones aplicadas al servidor HTTP: el problema que resuelven,
su implementación, variantes y límites. Los mapas de módulos pertenecen a las
[referencias técnicas de la API](../backend-technical-documentation/index.md); los
contratos de sus núcleos y configuradores, a [reutilización](../reuse-and-refactoring/index.md).
La estructura de Vue pertenece a la documentación del frontend.

Los capítulos iniciales identifican soluciones confirmadas; los siguientes explican
arquitectura y mecanismos de la API. El [estándar de codificación](../../../coding-standards/index.md)
conserva las reglas normativas de estilo y organización.

Por cada decisión se mantiene una figura que explique configuración o colaboración.
Cuando el mapa de un módulo o de reutilización ya responde la pregunta, se enlaza esa
fuente. Las secuencias de procesos complementan la explicación temporal.

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
12. [12. Orden de métodos por comportamiento](12-order-of-methods-by-behavior.md)
13. [13. Patrones de construcción de pruebas](13-patterns-of-construction-of-tests.md)
14. [14. Mantenimiento](14-maintenance.md)
15. [15. Principios SOLID en funciones y módulos](15-solid-principles.md)

## Cobertura visual

Cada patrón confirmado de la API tiene un diagrama canónico o un capítulo de detalle.
Los capítulos textuales conservan definición, límites y reglas de construcción; no
repiten la colaboración que ya explica el diagrama enlazado.

| Patrón o preocupación | Diagrama canónico | Capítulo de detalle |
| --- | --- | --- |
| Registro seguro de catálogos | [`DIA-ARQ-CAT-001`](08-catalog-registry-and-allowlist.md#diagrama-del-patrón-de-catálogos-administrables) | [Registro con lista blanca](08-catalog-registry-and-allowlist.md) |
| Monolito modular y capas | [`DIA-PAT-EST-001`](03-patterns-in-code.md#estructura-por-dominio-capas-y-fronteras) | [Arquitectura por capas](04-modular-monolith-and-layers.md) |
| Pipeline, DTO y políticas | [`DIA-PAT-FRO-001`](03-patterns-in-code.md#pipeline-dto-y-políticas-declarativas) | [Pipeline](05-middleware-pipeline.md) y [DTO/políticas](06-dtos-adapters-and-policies.md) |
| Factories y composición | [`DIA-PAT-CON-001`](03-patterns-in-code.md#factories-y-composición-sobre-herencia) | [Factory functions](07-factories-and-application-composition.md) |
| Transacción, eventos y auditoría | [`DIA-PAT-DIN-001`](03-patterns-in-code.md#transacción-eventos-y-auditoría) | [Transacción](09-context-transactional-and-consistency-atomic.md), [eventos](10-publication-of-events-of-inventory.md) y [auditoría](11-audit-trail-cross-cutting.md) |
| Orden de métodos | [`DIA-PAT-ORD-001`](12-order-of-methods-by-behavior.md) | [Orden por comportamiento](12-order-of-methods-by-behavior.md) |
| Test harness | [`DIA-PAT-TST-001`](03-patterns-in-code.md#test-harness-configurable) | [Construcción de pruebas](13-patterns-of-construction-of-tests.md) |
| Adaptación de detalles | [`DIA-PAT-DAT-001`](06-dtos-adapters-and-policies.md#diagrama-del-contrato-de-datos-de-los-detalles) | [DTO y adaptadores](06-dtos-adapters-and-policies.md) |
| Políticas declarativas | [`DIA-PAT-POL-001`](06-dtos-adapters-and-policies.md#aplicación-de-políticas-declarativas) | [Evaluación y consumidores](06-dtos-adapters-and-policies.md#aplicación-de-políticas-declarativas) |
| Propagación del contexto transaccional | [`DIA-PAT-TX-001`](09-context-transactional-and-consistency-atomic.md#aplicación-del-contexto-en-una-entrada) | [Límite real de una entrada](09-context-transactional-and-consistency-atomic.md) |
| Publicación y suscriptores | [`DIA-PAT-EVT-001`](10-publication-of-events-of-inventory.md) | [Eventos de inventario](10-publication-of-events-of-inventory.md) |
| Audit Trail | [`DIA-BE-SEQ-006`](../../processes/shared-runtime-behavior/01-write-audit.md#secuencia-transversal-de-auditoría-de-escrituras) | [Auditoría](11-audit-trail-cross-cutting.md) |
| Reutilización de endpoints y servicios | [Requests y servicios](../reuse-and-refactoring/index.md) | [Resultado de la revisión](../reuse-and-refactoring/04-refactoring-and-extension.md#resultado-de-la-revisión-de-cobertura-visual) |
| Refactorización y extracción | [`DIA-PAT-REF-001`](../reuse-and-refactoring/04-refactoring-and-extension.md) | [Resultado vigente y criterios](../reuse-and-refactoring/04-refactoring-and-extension.md) |
| Responsabilidades y sustitución funcional | [`DIA-SOLID-LECT-001`](15-solid-principles.md#colaboradores-de-lectura-y-contrato-de-sustitución) | [Evaluación SOLID](15-solid-principles.md); son principios, no otro patrón. |
| Entradas y respuestas seguras | [`DIA-SEC-FRO-001`](../../../coding-standards/09-errors-security-audit-and-logging.md#fronteras-de-una-escritura-de-formulario) | [Estándar de seguridad de la API](../../../coding-standards/09-errors-security-audit-and-logging.md). |

Cada explicación conecta problema, implementación, contrato, configuradores, consumidores
y límites. La refactorización tiene una representación de extracción y una guía de
revisión en [refactorización y extensión](../reuse-and-refactoring/04-refactoring-and-extension.md); se representa el resultado
vigente o, si existe una migración aprobada, un antes/después rotulado como actual y
objetivo. Al cambiar un patrón se actualizan su diagrama canónico, consumidores y
pruebas; el historial mecánico de archivos permanece en Git.
