# Documentación técnica del backend

Esta referencia explica la estructura de código de cada módulo: archivos propietarios,
imports, dependencias compartidas y contratos internos. Los mapas muestran módulos ES;
las flechas son dependencias entre grupos de archivos, no pasos de un CRUD.

La [organización general](../code-structure/index.md) ubica esta implementación en
el sistema. Esta referencia posee el detalle de cada módulo; [patrones](../design-and-construction-patterns/index.md)
explica las decisiones compartidas y [reutilización](../reuse-and-refactoring/index.md)
los contratos de sus núcleos. No se replican sus diagramas en cada recurso.

## Referencias transversales

1. [Responsabilidades y contratos transversales](01-catalog-complete-of-records-backend.md).
2. [Convenciones para leer los mapas](02-code-map-reading-guide.md).
3. [Código compartido y cobertura del transporte](03-shared-code-and-coverage.md).

## Módulos

Esta es la única lista de navegación de módulos de la colección. Cada enlace lleva
al mapa, los archivos, operaciones, contratos y variantes del recurso.

| Módulo | Figura |
| --- | --- |
| [Autenticación](04-authentication-code.md) | `DIA-BE-MOD-AUT-001` |
| [Personas](05-persons-code.md) | `DIA-BE-MOD-PER-001` |
| [Usuarios](06-users-code.md) | `DIA-BE-MOD-USR-001` |
| [Clientes](07-clients-code.md) | `DIA-BE-MOD-CLI-001` |
| [Proveedores](08-suppliers-code.md) | `DIA-BE-MOD-SUP-001` |
| [Materiales](09-materials-code.md) | `DIA-BE-MOD-MAT-001` |
| [Consumibles](10-consumables-code.md) | `DIA-BE-MOD-CON-001` |
| [Mermas](11-wastes-code.md) | `DIA-BE-MOD-WAS-001` |
| [Entradas: materiales y consumibles](12-goods-receipts-code.md) | `DIA-BE-MOD-REC-001` |
| [Salidas: materiales y consumibles](13-goods-issues-code.md) | `DIA-BE-MOD-ISS-001` |
| [Salidas de mermas](14-waste-issues-code.md) | `DIA-BE-MOD-WIS-001` |
| [Consulta de movimientos](15-movements-code.md) | `DIA-BE-MOD-MOV-001` |
| [Catálogos: administración y lecturas operativas](16-catalogs-code.md) | `DIA-BE-MOD-CAT-001` |

Entradas y salidas incluyen las variantes material/consumable cuando comparten núcleo.
Las lecturas operativas, reportes e infraestructura se amplían en el capítulo 3.

Los mecanismos comunes se explican una vez en [reutilización](../reuse-and-refactoring/index.md)
y [patrones](../design-and-construction-patterns/index.md). Las secuencias, actividades
y estados pertenecen a [procesos](../../processes/index.md); el contrato HTTP está en
OpenAPI y la trazabilidad requisito–caso–prueba en la vista lógica. El
[mapa generado](../code-map.md) conserva el inventario exacto de rutas e imports.
