# Modelo de casos de uso

## Alcance y notación

Este modelo representa objetivos del negocio y forma parte de los requisitos.
Arquitectura lo utiliza como referencia para la vista de escenarios; las llamadas
entre componentes y los detalles de implementación pertenecen a sus procesos.

Los objetivos están descritos íntegramente en las [94 fichas locales](../use-cases/index.md).
Las figuras agrupan objetivos por recurso dentro del límite Nexus. La
[leyenda visual](../../architecture/views/diagram-reading.md#casos-de-uso) define la
notación y la convención de enlaces de acceso desde consulta. Las
[responsabilidades de los actores](../requirements-specification/03-actors-and-system-responsibilities.md)
y las fichas de cada objetivo precisan permisos y alcance.

La notación `usecase-beta` requiere Mermaid 12. Cada figura es un corte del mismo
sistema. Los óvalos conservan el ID y omiten el nombre del recurso cuando el límite
del sistema ya lo identifica; las fichas mantienen el nombre completo.

## Áreas funcionales

- [Acceso y sesión](01-access.md).
- [Personas y usuarios](02-identity.md).
- [Inventario](03-inventory.md).
- [Movimientos](04-movements.md).
- [Clientes y proveedores](05-directory.md).
- [Catálogos administrables](06-catalogs.md).
- [Compras](07-purchases.md).
- [Salidas](08-issues.md).
- [Altas desde selectores](09-contextual-creation.md).
