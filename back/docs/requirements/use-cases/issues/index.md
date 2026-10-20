# Casos de uso — SAL

### Grupo funcional SAL — Salidas de material, merma y consumible

| Identificador | Caso de uso específico | Evidencia funcional |
| --- | --- | --- |
| `CU-SAL-01` | Consultar salidas de material | Consulta sin modificar existencias. |
| `CU-SAL-02` | Crear salida de material | Creación pendiente sin descontar existencias. |
| `CU-SAL-03` | Editar encabezado de salida de material | Edición de los campos admitidos. |
| `CU-SAL-04` | Editar detalles de material de una salida | Actualización de detalles todavía modificables. |
| `CU-SAL-05` | Surtir material | Descuento de existencia y registro de movimiento. |
| `CU-SAL-06` | Devolver material surtido | Reintegro de existencia y movimiento inverso. |
| `CU-SAL-07` | Generar reporte de salidas de material | Archivo Excel con filtros, columnas y cálculos propios del reporte. |
| `CU-SAL-08` | Consultar salidas de merma | Consulta sin modificar existencias. |
| `CU-SAL-09` | Crear salida de merma | Creación pendiente sin descontar existencias. |
| `CU-SAL-10` | Editar encabezado de salida de merma | Edición de los campos admitidos. |
| `CU-SAL-11` | Editar detalles de merma de una salida | Actualización de detalles todavía modificables. |
| `CU-SAL-12` | Surtir merma | Descuento de existencia y registro de movimiento. |
| `CU-SAL-13` | Devolver merma surtida | Reintegro de existencia y movimiento inverso. |
| `CU-SAL-14` | Generar reporte de salidas de merma | Archivo Excel con filtros, columnas y cálculos propios del reporte. |
| `CU-SAL-15` | Consultar salidas de consumible | Consulta sin modificar existencias. |
| `CU-SAL-16` | Crear salida de consumible | Creación pendiente sin descontar existencias. |
| `CU-SAL-17` | Editar encabezado de salida de consumible | Edición de los campos admitidos del encabezado. |
| `CU-SAL-18` | Editar detalles de consumible de una salida | Actualización de detalles todavía modificables. |
| `CU-SAL-19` | Surtir consumible | Descuento de existencia y registro de movimiento. |
| `CU-SAL-20` | Devolver consumible surtido | Reintegro de existencia y movimiento inverso. |
| `CU-SAL-21` | Generar reporte de salidas de consumible | Archivo Excel limitado al contexto de consumibles. |

Registrar una salida expresa lo solicitado y no descuenta existencias. Surtir registra
la entrega; devolver repone lo recibido de vuelta y conserva la historia de la salida.
Los efectos corresponden al recurso y proveedor que identifica cada detalle.

## Fichas por caso de uso

- [`CU-SAL-01` — Consultar salidas de material](cu-sal-01.md)
- [`CU-SAL-02` — Crear salida de material](cu-sal-02.md)
- [`CU-SAL-03` — Editar encabezado de salida de material](cu-sal-03.md)
- [`CU-SAL-04` — Editar detalles de material de una salida](cu-sal-04.md)
- [`CU-SAL-05` — Surtir material](cu-sal-05.md)
- [`CU-SAL-06` — Devolver material surtido](cu-sal-06.md)
- [`CU-SAL-07` — Generar reporte de salidas de material](cu-sal-07.md)
- [`CU-SAL-08` — Consultar salidas de merma](cu-sal-08.md)
- [`CU-SAL-09` — Crear salida de merma](cu-sal-09.md)
- [`CU-SAL-10` — Editar encabezado de salida de merma](cu-sal-10.md)
- [`CU-SAL-11` — Editar detalles de merma de una salida](cu-sal-11.md)
- [`CU-SAL-12` — Surtir merma](cu-sal-12.md)
- [`CU-SAL-13` — Devolver merma surtida](cu-sal-13.md)
- [`CU-SAL-14` — Generar reporte de salidas de merma](cu-sal-14.md)
- [`CU-SAL-15` — Consultar salidas de consumible](cu-sal-15.md)
- [`CU-SAL-16` — Crear salida de consumible](cu-sal-16.md)
- [`CU-SAL-17` — Editar encabezado de salida de consumible](cu-sal-17.md)
- [`CU-SAL-18` — Editar detalles de consumible de una salida](cu-sal-18.md)
- [`CU-SAL-19` — Surtir consumible](cu-sal-19.md)
- [`CU-SAL-20` — Devolver consumible surtido](cu-sal-20.md)
- [`CU-SAL-21` — Generar reporte de salidas de consumible](cu-sal-21.md)
