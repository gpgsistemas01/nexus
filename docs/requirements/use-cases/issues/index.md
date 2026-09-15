# Casos de uso — SAL

### Grupo funcional SAL — Salidas de material y de merma

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

La evidencia orienta la búsqueda, pero no impone una organización por casos de uso
dentro de `src`: la aplicación está organizada por capas y dominio. Las pruebas
unitarias siguen la ubicación paralela al artefacto y las integraciones CRUD permanecen
bajo `tests/integration/controllers`.


## Fichas específicas

### Grupo funcional SAL — Salidas de material y de merma

Cada ficha representa una sola acción sobre una sola entidad. Los elementos compartidos se reutilizan en la implementación, pero no fusionan objetivos del actor.

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
