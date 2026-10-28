# Modelo de casos de uso

## Alcance y notación

Los objetivos están descritos íntegramente en las [94 fichas locales](../../../../requirements/use-cases/index.md).
Las figuras agrupan objetivos por recurso dentro del límite Nexus. La
[leyenda visual](../../diagram-reading.md#casos-de-uso) explica actores, óvalos,
asociación, generalización y extensiones. Las líneas simples vinculan al actor con
sus objetivos; los recorridos de navegación pertenecen al catálogo de pantallas.

La notación `usecase-beta` requiere Mermaid 12. Cada figura es un corte del mismo
sistema. Actores, precondiciones y permisos se comprueban en la ficha de cada objetivo.

| Actor | Participación representada |
| --- | --- |
| Usuario registrado | Inicio y cierre de sesión. |
| Usuario de área operativa | Consulta de inventario y consulta/alta/edición de salidas dentro de su alcance. |
| Personal de almacén | Operaciones admitidas de almacén y documentos, incluidos surtido/devolución según permiso. |
| Administrador del sistema | Participación heredada de Almacén y objetivos administrativos específicos. |

La jerarquía común está en [Acceso](01-access.md#autenticación): el actor operativo
especializa Usuario registrado y conserva asociaciones propias, sin heredar gestión de
Almacén. El alcance por área se describe en la
[selección de destino](../../processes/07-issues/04-department-scope.md).

## Áreas funcionales

- [Acceso y sesión](01-access.md).
- [Personas y usuarios](02-identity.md).
- [Inventario](03-inventory.md).
- [Movimientos](04-movements.md).
- [Clientes y proveedores](05-directory.md).
- [Catálogos administrables](06-catalogs.md).
- [Compras](07-purchases.md).
- [Salidas](08-issues.md).
