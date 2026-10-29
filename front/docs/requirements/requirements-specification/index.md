# Especificación de requisitos

## Propósito y alcance

El cliente permite acceso y cierre de sesión, inventario de Materiales/Consumibles/
Mermas, seis catálogos auxiliares, Personas/Usuarios, Clientes/Proveedores, Compras,
Salidas, Movimientos y reportes. Usuario registrado, Personal de almacén y Administrador
del sistema participan conforme a permisos de sus asignaciones; aparecer como actor
no concede una autorización adicional.

## Orden de lectura

1. [Propósito y alcance](01-purpose-and-scope.md).
2. [Convenciones, estados y aceptación](02-conventions.md).
3. [Actores y responsabilidades](03-actors-and-system-responsibilities.md).
4. [Catálogo por ámbito](catalog/index.md): las 165 obligaciones del producto, con sus criterios identificados y estados.
5. [Trazabilidad de requisitos](05-requirement-traceability-rules.md).
6. [Modos, precondiciones y efectos](06-operation-modes-and-effects.md).
7. [Obligaciones específicas del cliente](client-specification.md): navegación, captura, recuperación, datos y construcción.
8. [Interfaces y condiciones de operación](07-interfaces-and-operating-conditions.md): intercambios, dependencias, supuestos y límites de compatibilidad.
9. [Verificación y aceptación](08-verification-and-acceptance.md): escenarios críticos, comprobación de las 31 obligaciones Vue y datos necesarios para aceptar una entrega.

La [visión](../vision-scope-and-requirements/index.md) explica los límites de alto nivel.
Las [fichas de casos de uso](../use-cases/index.md) desarrollan cada objetivo y el
[modelo de dominio](../domain-model/index.md) conserva conceptos y estados. El
[glosario](../business-glossary.md) fija el significado de los términos compartidos.

## Lectura de estados y aceptación

El estado de una regla de producto describe su disponibilidad en Nexus, no el resultado
de la suite Vue. Un requisito modelado o fuera de alcance no acredita una pantalla.
La especificación del cliente describe las capacidades implementadas y criterios que
se verifican por sus contratos. La [cobertura](../../testing/04-use-case-coverage.md)
identifica el alcance real de cada evidencia y los efectos que necesitan API/base reales.

Las reglas son observables y trazables; una regla no se reemplaza por el nombre de un
archivo. Los campos admitidos, la versión leída, el contexto fijo y la normalización
conservan sus contratos. La aceptación registra responsable, revisión, condiciones y
evidencia; estas fuentes permanecen En revisión.
