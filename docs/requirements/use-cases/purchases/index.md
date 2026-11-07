# Casos de uso — ENT

Materiales y consumibles tienen casos de uso independientes porque representan objetivos
visibles distintos para el actor. La implementación reutiliza la misma lógica
transaccional, pero cada listado, compra, corrección, cancelación y reporte permanece en
su contexto y conserva trazabilidad propia.

Esta separación documental **no duplica la implementación**: es una refactorización por
fachadas de contexto. Los controllers comparten sus builders y las fachadas de materiales
y consumibles delegan en los mismos servicios transaccionales, helpers de detalle,
corrección y cancelación. Los `CU-*` describen objetivos del negocio; no equivalen a una
copia del código por cada ficha.

### Grupo funcional ENT — Compras de inventario

| Identificador | Caso de uso específico | Evidencia funcional |
| --- | --- | --- |
| `CU-ENT-01` | Consultar compras de material | Listado y detalle sin modificar inventario. |
| `CU-ENT-02` | Crear compra de material | Compra, alta contextual de materiales no catalogados, detalles, existencias y movimientos transaccionales. |
| `CU-ENT-03` | Editar compra de material | Edición de encabezado y detalles admitidos. |
| `CU-ENT-04` | Corregir material de una compra | Corrección de cantidad o costo con historial. |
| `CU-ENT-05` | Cancelar material de una compra | Cancelación del detalle y reversión de inventario. |
| `CU-ENT-06` | Generar reporte de compras de material | Archivo Excel con filtros, columnas y cálculos propios del reporte. |
| `CU-ENT-07` | Consultar compras de consumible | Listado y detalle de consumibles sin modificar inventario. |
| `CU-ENT-08` | Crear compra de consumible | Compra, alta contextual de consumibles, existencias y movimientos transaccionales. |
| `CU-ENT-09` | Editar compra de consumible | Edición de encabezado y detalles admitidos. |
| `CU-ENT-10` | Corregir consumible de una compra | Corrección de cantidad o costo con historial. |
| `CU-ENT-11` | Cancelar consumible de una compra | Cancelación del detalle y reversión de inventario. |
| `CU-ENT-12` | Generar reporte de compras de consumible | Archivo Excel delimitado al contexto de consumibles. |



## Fichas específicas

### Grupo funcional ENT — Compras de material

Cada ficha representa una sola acción sobre una sola entidad. Los elementos compartidos se reutilizan en la implementación, pero no fusionan objetivos del actor.

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
