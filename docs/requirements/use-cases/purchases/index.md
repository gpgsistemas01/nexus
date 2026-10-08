# Casos de uso — ENT

Materiales y consumibles tienen casos de uso independientes porque el actor consulta
compras, recibe artículos, corrige detalles y genera reportes en contextos separados.
Una compra incorpora las cantidades recibidas a la existencia de su proveedor y conserva
la historia de sus correcciones y cancelaciones. El registro del documento, sus detalles,
sus existencias y sus movimientos debe quedar completo, sin cambios parciales.

### Grupo funcional ENT — Compras de inventario

| Identificador | Caso de uso específico | Evidencia funcional |
| --- | --- | --- |
| `CU-ENT-01` | Consultar compras de material | Listado y detalle sin modificar inventario. |
| `CU-ENT-02` | Crear compra de material | Compra, alta contextual de materiales no catalogados, detalles, existencias y movimientos registrados sin cambios parciales. |
| `CU-ENT-03` | Editar compra de material | Edición de encabezado y detalles admitidos. |
| `CU-ENT-04` | Corregir material de una compra | Corrección de cantidad o costo con historial. |
| `CU-ENT-05` | Cancelar material de una compra | Cancelación del detalle y reversión de inventario. |
| `CU-ENT-06` | Generar reporte de compras de material | Archivo Excel con filtros, columnas y cálculos propios del reporte. |
| `CU-ENT-07` | Consultar compras de consumible | Listado y detalle de consumibles sin modificar inventario. |
| `CU-ENT-08` | Crear compra de consumible | Compra, alta contextual de consumibles, existencias y movimientos registrados sin cambios parciales. |
| `CU-ENT-09` | Editar compra de consumible | Edición de encabezado y detalles admitidos. |
| `CU-ENT-10` | Corregir consumible de una compra | Corrección de cantidad o costo con historial. |
| `CU-ENT-11` | Cancelar consumible de una compra | Cancelación del detalle y reversión de inventario. |
| `CU-ENT-12` | Generar reporte de compras de consumible | Archivo Excel delimitado al contexto de consumibles. |



## Fichas específicas

### Grupo funcional ENT — Compras de material

Cada ficha describe un objetivo del actor, sus condiciones y sus efectos sobre el negocio. Los objetivos se mantienen separados aunque compartan información o reglas.

## Fichas por caso de uso

- [`CU-ENT-01` — Consultar compras de material](cu-ent-01.md)
- [`CU-ENT-02` — Crear compra de material](cu-ent-02.md)
- [`CU-ENT-03` — Editar compra de material](cu-ent-03.md)
- [`CU-ENT-04` — Corregir material de una compra](cu-ent-04.md)
- [`CU-ENT-05` — Cancelar material de una compra](cu-ent-05.md)
- [`CU-ENT-06` — Generar reporte de compras de material](cu-ent-06.md)
- [`CU-ENT-07` — Consultar compras de consumible](cu-ent-07.md)
- [`CU-ENT-08` — Crear compra de consumible](cu-ent-08.md)
- [`CU-ENT-09` — Editar compra de consumible](cu-ent-09.md)
- [`CU-ENT-10` — Corregir consumible de una compra](cu-ent-10.md)
- [`CU-ENT-11` — Cancelar consumible de una compra](cu-ent-11.md)
- [`CU-ENT-12` — Generar reporte de compras de consumible](cu-ent-12.md)
