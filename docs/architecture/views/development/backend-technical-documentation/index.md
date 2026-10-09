# Documentación técnica del backend

Esta referencia explica la estructura de código de cada módulo: archivos propietarios,
imports, dependencias compartidas y contratos internos. Los mapas muestran módulos ES;
las flechas son dependencias entre grupos de archivos, no pasos de un CRUD.

## Capítulos

1. [Responsabilidades y contratos](01-catalog-complete-of-records-backend.md).
2. [Cobertura de mapas por módulo](02-module-code-maps.md).
3. [Código compartido y cobertura del transporte](03-shared-code-and-coverage.md).
4. [Autenticación](04-authentication-code.md).
5. [Personas](05-persons-code.md).
6. [Usuarios](06-users-code.md).
7. [Clientes](07-clients-code.md).
8. [Proveedores](08-suppliers-code.md).
9. [Materiales](09-materials-code.md).
10. [Consumibles](10-consumables-code.md).
11. [Mermas](11-wastes-code.md).
12. [Entradas: materiales y consumibles](12-goods-receipts-code.md).
13. [Salidas: materiales y consumibles](13-goods-issues-code.md).
14. [Salidas de mermas](14-waste-issues-code.md).
15. [Consulta de movimientos](15-movements-code.md).
16. [Catálogos administrables](16-catalogs-code.md).

Los mecanismos comunes se explican una vez en [reutilización](../reuse-and-refactoring/index.md)
y [patrones](../design-and-construction-patterns/index.md). Las secuencias, actividades
y estados pertenecen a [procesos](../../processes/index.md); el contrato HTTP está en
OpenAPI y la trazabilidad requisito–caso–prueba en la vista lógica. El
[mapa generado](../code-map.md) conserva el inventario exacto de rutas e imports.
