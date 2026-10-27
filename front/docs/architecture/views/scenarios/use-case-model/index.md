# Modelo de casos de uso

## Alcance y notación

Los objetivos están descritos íntegramente en las [94 fichas locales](../../../../requirements/use-cases/index.md).
Las figuras los agrupan por recurso dentro del límite Nexus. Un caso representa un
objetivo del actor; ni una petición de API ni un helper son actores. Las asociaciones
son líneas sin punta; la generalización tiene triángulo hacia el actor general;
include/extend se conservan sólo donde la relación funcional está especificada.
Los diagramas no representan secuencias de ejecución ni conceden permisos.

La notación `usecase-beta` requiere Mermaid 12. Cada figura muestra una parte del mismo
sistema, sin crear sistemas distintos por página. Los actores y precondiciones se
comprueban de nuevo en cada objetivo. Las relaciones de navegación se describen en
el catálogo de pantallas y no se interpretan como include/extend.

## Áreas funcionales

- [Acceso y sesión](01-access.md).
- [Personas y usuarios](02-identity.md).
- [Inventario](03-inventory.md).
- [Movimientos](04-movements.md).
- [Clientes y proveedores](05-directory.md).
- [Catálogos administrables](06-catalogs.md).
- [Compras](07-purchases.md).
- [Salidas](08-issues.md).
