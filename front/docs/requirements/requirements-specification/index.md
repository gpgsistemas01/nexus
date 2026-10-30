# Especificación de requisitos

## Propósito y alcance

Esta especificación reúne las obligaciones del producto y las específicas del
cliente Vue. Para revisar un cambio, localice el requisito, sus criterios y los
casos relacionados. Las [convenciones](02-conventions.md) explican su lectura.

## Consulta rápida de reglas y excepciones

Las reglas se definen en el catálogo. Cada ficha de caso de uso identifica el paso
que puede rechazarse, la respuesta del sistema y cómo continuar.

| Tema | Reglas y condiciones | Alternativas y excepciones |
| --- | --- | --- |
| Acceso y datos de entrada | [Autenticación, permiso y validación](catalog/05-cross-cutting-business-policies.md#acceso-y-datos-de-entrada): `RN-001`, `RN-009`, `RN-010`. [Renovación del cliente](client-specification.md#requisitos-funcionales): `RF-VUE-002`. | [Acceso y sesión](../use-cases/authentication/index.md). |
| Cambios confirmados e historia | [Documentos y trazabilidad](catalog/05-cross-cutting-business-policies.md#documentos-y-trazabilidad): atomicidad, folios, corrección, cancelación y factura. | [Compras](../use-cases/purchases/index.md). |
| Existencia, surtido y devolución | [Límites y cumplimiento](catalog/05-cross-cutting-business-policies.md#existencias-surtido-y-devolución): `RN-003`, `RN-012`–`RN-016`, `RN-028`, `RN-029`. | [Salidas](../use-cases/issues/index.md). |
| Identidad, inactividad y contexto | [Identidad y estado de registros](catalog/05-cross-cutting-business-policies.md#identidad-y-estado-de-registros): recursos repetidos, relaciones protegidas, dimensiones y separación material/consumible. | [Inventario](../use-cases/warehouse/index.md), [Catálogos](../use-cases/catalogs/index.md) y [Directorio](../use-cases/directory/index.md). |
| Identidad y cálculo de merma | [Mermas y conversiones](catalog/05-cross-cutting-business-policies.md#mermas-y-conversiones): `RN-020`, `RN-021`, `RN-022`, `RN-033`. | [Inventario y entradas de merma](../use-cases/warehouse/index.md). |
| Asesor y proyecto de GPG INTERNO | [Cliente interno](catalog/05-cross-cutting-business-policies.md#cliente-interno): `RN-019`, `RN-035`. | [Encabezado de Salidas](../use-cases/issues/index.md). |
| Conflicto de versión o respuesta incompleta | [Datos del cliente](client-specification.md#requisitos-de-datos): `RD-VUE-002`, `RD-VUE-007`; [criterios de aceptación](08-verification-and-acceptance.md#datos-y-presentación). | [Captura, rechazo y recuperación](../../architecture/views/logical/states/index.md). |

La [matriz de modos](06-operation-modes-and-effects.md) indica los campos editables
y el efecto de cada acción. Los [diagramas de procesos](../../architecture/views/processes/index.md)
muestran su realización en el código.

## Orden de lectura

1. [Propósito y alcance](01-purpose-and-scope.md).
2. [Convenciones, estados y aceptación](02-conventions.md).
3. [Actores y responsabilidades](03-actors-and-system-responsibilities.md).
4. [Catálogo por ámbito](catalog/index.md): las obligaciones del producto, con sus criterios identificados y estados.
5. [Trazabilidad de requisitos](05-requirement-traceability-rules.md).
6. [Modos, precondiciones y efectos](06-operation-modes-and-effects.md).
7. [Obligaciones específicas del cliente](client-specification.md): navegación, captura, recuperación, datos y construcción.
8. [Interfaces y condiciones de operación](07-interfaces-and-operating-conditions.md): intercambios, dependencias, supuestos y límites de compatibilidad.
9. [Verificación y aceptación](08-verification-and-acceptance.md): escenarios críticos, comprobación de las obligaciones Vue y datos necesarios para aceptar una entrega.

La [visión](../vision-scope-and-requirements/index.md) explica los límites de alto nivel.
Las [fichas de casos de uso](../use-cases/index.md) desarrollan cada objetivo y el
[modelo de dominio](../domain-model/index.md) conserva conceptos y estados. El
[glosario](../business-glossary.md) fija el significado de los términos compartidos.

## Lectura de estados y aceptación

Los [estados](02-conventions.md#22-estados) indican disponibilidad del producto;
la [cobertura](../../testing/04-use-case-coverage.md) identifica evidencia y brechas.
La [aceptación](08-verification-and-acceptance.md#información-necesaria-para-aceptar-una-entrega)
registra una decisión funcional con responsable y resultados.
