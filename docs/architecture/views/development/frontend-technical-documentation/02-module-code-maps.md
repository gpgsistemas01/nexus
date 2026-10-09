# 2. Mapas de código por módulo: frontend

Cada mapa identifica módulos ES y dependencias comprobables. Las flechas significan
**import**, nunca pasos de una operación. Un nodo agrupa archivos por responsabilidad;
la tabla enumera sus rutas. Se muestran imports entre los grupos seleccionados; las
constantes, errores y utilidades transversales se consultan en el capítulo 3.
Los casos, decisiones y estados se consultan en procesos y requisitos.

## Cobertura de módulos

| Módulo | Figura | Particularidad de implementación |
| --- | --- | --- |
| [Autenticación](04-authentication-code.md) | `DIA-FE-MOD-AUT-001` | Archivos y contratos propios. |
| [Personas](05-persons-code.md) | `DIA-FE-MOD-PER-001` | Archivos y contratos propios. |
| [Usuarios](06-users-code.md) | `DIA-FE-MOD-USR-001` | Archivos y contratos propios. |
| [Clientes](07-clients-code.md) | `DIA-FE-MOD-CLI-001` | Archivos y contratos propios. |
| [Proveedores](08-suppliers-code.md) | `DIA-FE-MOD-SUP-001` | Archivos y contratos propios. |
| [Materiales](09-materials-code.md) | `DIA-FE-MOD-MAT-001` | Archivos y contratos propios. |
| [Consumibles](10-consumables-code.md) | `DIA-FE-MOD-CON-001` | Archivos y contratos propios. |
| [Mermas](11-wastes-code.md) | `DIA-FE-MOD-WAS-001` | Archivos y contratos propios. |
| [Entradas: materiales y consumibles](12-goods-receipts-code.md) | `DIA-FE-MOD-REC-001` | Variantes material/consumable incluidas. |
| [Salidas: materiales y consumibles](13-goods-issues-code.md) | `DIA-FE-MOD-ISS-001` | Variantes material/consumable incluidas. |
| [Salidas de mermas](14-waste-issues-code.md) | `DIA-FE-MOD-WIS-001` | Archivos y contratos propios. |
| [Consulta de movimientos](15-movements-code.md) | `DIA-FE-MOD-MOV-001` | Archivos y contratos propios. |
| [Catálogos administrables](16-catalogs-code.md) | `DIA-FE-MOD-CAT-001` | Archivos y contratos propios. |


La unidad es el módulo implementado, no el caso de uso. Compras y salidas
incluyen sus dos variantes tipadas en el mismo mapa, con los archivos específicos
material/consumable enumerados. El capítulo de código compartido cubre portada,
transporte web, lecturas operativas y reportes para completar la cobertura.
