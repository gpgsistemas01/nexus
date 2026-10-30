# Especificación de requisitos

## Descripción general

El [producto](../vision-scope-and-requirements/01-product-overview.md), sus
[usuarios](../vision-scope-and-requirements/02-users-and-areas.md) y su
[alcance](../vision-scope-and-requirements/03-current-scope.md) sitúan las obligaciones
que se especifican a continuación.

## Consulta rápida de reglas y excepciones

| Busco… | Consultar |
| --- | --- |
| Quién puede realizar una acción | [Actores y responsabilidades](03-actors-and-system-responsibilities.md). |
| Qué información se conserva y qué distingue cada dato | [Datos del negocio](../vision-scope-and-requirements/03-current-scope.md#datos-y-trazabilidad) e [integridad de información](catalog/06-information-persistence-and-integrity.md). |
| Qué campos cambian y qué efecto tiene una operación | [Modos de operación](06-operation-modes-and-effects.md). |
| Cómo se comportan la navegación, captura y recuperación | [Requisitos del cliente Vue](client-specification.md). |
| Reglas de acceso, permisos y validación | [Acceso y datos de entrada](catalog/05-cross-cutting-business-policies.md#acceso-y-datos-de-entrada). |
| Stock, surtido, devolución y estado de las salidas | [Existencias y cumplimiento](catalog/05-cross-cutting-business-policies.md#existencias-surtido-y-devolución). |
| Duplicados, datos bloqueados y registros inactivos | [Identidad y estado de registros](catalog/05-cross-cutting-business-policies.md#identidad-y-estado-de-registros). |
| Mermas, pesos y conversiones | [Mermas](catalog/04-queries-reports-and-modeled-functions.md#criterios-de-captura-de-merma) y [reglas de conversión](catalog/05-cross-cutting-business-policies.md#mermas-y-conversiones). |
| Cliente interno y número de proyecto | [GPG INTERNO](catalog/05-cross-cutting-business-policies.md#cliente-interno). |
| Corrección, cancelación, folios y factura | [Compras](catalog/03-receipts-issues-and-inventory.md#criterios-de-recepción-y-corrección) y [documentos](catalog/05-cross-cutting-business-policies.md#documentos-y-trazabilidad). |
| Pasos, alternativas y recuperación de errores | [Casos de uso](../use-cases/index.md). |

## Catálogo y referencias

| Documento | Contenido |
| --- | --- |
| [Propósito y alcance](01-purpose-and-scope.md) | Qué cubre la especificación. |
| [Cómo leer los requisitos](02-conventions.md) | Identificadores, estados y redacción. |
| [Catálogo del producto](catalog/index.md) | Funciones, reglas, datos y calidad por ámbito. |
| [Mapa de relaciones](05-requirement-traceability-rules.md) | Reglas compartidas y requisitos que apoyan varios casos. |
| [Condiciones de operación](07-interfaces-and-operating-conditions.md) | Dependencias e intercambios con la API. |
| [Criterios de aceptación](08-verification-and-acceptance.md) | Condiciones concretas para revisar los recorridos del cliente. |

La [visión y alcance](../vision-scope-and-requirements/index.md) presenta el producto;
la [cobertura de pruebas](../../testing/04-use-case-coverage.md) identifica las
comprobaciones disponibles.
