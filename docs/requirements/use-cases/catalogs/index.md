# Casos de uso — ALM y CAT

### Grupo funcional ALM — Almacén

| Identificador | Caso de uso específico | Evidencia funcional |
| --- | --- | --- |
| `CU-ALM-01` | Consultar materiales | Listado de materiales, ofertas de proveedor y existencias. |
| `CU-ALM-02` | Crear material | Alta con presentación, unidad y relaciones válidas. |
| `CU-ALM-03` | Editar material | Actualización de datos generales admitidos. |
| `CU-ALM-04` | Retirar material | Retiro condicionado por la historia operativa. |
| `CU-ALM-05` | Ajustar existencia de material | Ajuste trazable de inventario. |
| `CU-ALM-06` | Generar reporte de inventario de materiales | Archivo Excel con filtros, columnas y cálculos propios del reporte. |
| `CU-ALM-07` | Consultar movimientos de materiales | Consulta autorizada sin modificar datos. |
| `CU-ALM-08` | Generar reporte de movimientos de materiales | Archivo Excel con filtros, columnas y cálculos propios del reporte. |
| `CU-ALM-09` | Consultar mermas | Listado de existencias de merma. |
| `CU-ALM-10` | Registrar merma | Alta desde una plantilla material-proveedor. |
| `CU-ALM-11` | Editar merma | Actualización sin alterar su identidad física. |
| `CU-ALM-12` | Ajustar existencia de merma | Ajuste trazable de inventario de merma. |
| `CU-ALM-13` | Generar reporte de mermas | Archivo Excel con filtros, columnas y cálculos propios del reporte. |
| `CU-ALM-14` | Consultar movimientos de mermas | Consulta autorizada sin modificar datos. |
| `CU-ALM-15` | Generar reporte de movimientos de mermas | Archivo Excel con filtros, columnas y cálculos propios del reporte. |

### Grupo funcional CAT — Catálogos

| Identificador | Caso de uso específico | Evidencia funcional |
| --- | --- | --- |
| `CU-CAT-01` | Consultar proveedores | Listado de proveedores autorizados. |
| `CU-CAT-02` | Crear proveedor | Alta con código e identidad válidos. |
| `CU-CAT-03` | Editar proveedor | Actualización de datos admitidos. |
| `CU-CAT-04` | Cambiar estado de proveedor | Activación o desactivación del proveedor. |
| `CU-CAT-05` | Generar reporte de proveedores | Archivo Excel con filtros, columnas y cálculos propios del reporte. |
| `CU-CAT-06` | Consultar clientes | Listado de clientes autorizados. |
| `CU-CAT-07` | Crear cliente | Alta con asesor opcional válido. |
| `CU-CAT-08` | Editar cliente | Actualización de datos y asesor opcional. |
| `CU-CAT-09` | Generar reporte de clientes | Archivo Excel con filtros, columnas y cálculos propios del reporte. |
| `CU-CAT-10` | Consultar área | Pantalla y listado independiente de Áreas, restringidos al administrador. |
| `CU-CAT-11` | Crear área | Alta de área con los campos permitidos. |
| `CU-CAT-12` | Editar área | Actualización de área con los campos permitidos. |
| `CU-CAT-13` | Consultar rol | Pantalla y listado independiente de Roles, restringidos al administrador. |
| `CU-CAT-14` | Crear rol | Alta de rol con los campos permitidos. |
| `CU-CAT-15` | Editar rol | Actualización de rol con los campos permitidos. |
| `CU-CAT-16` | Consultar presentación | Pantalla y listado independiente de Presentaciones, restringidos al administrador. |
| `CU-CAT-17` | Crear presentación | Alta de presentación con los campos permitidos. |
| `CU-CAT-18` | Editar presentación | Actualización de presentación con los campos permitidos. |
| `CU-CAT-19` | Consultar unidad de medida | Pantalla y listado independiente de Unidades de medida, restringidos al administrador. |
| `CU-CAT-20` | Crear unidad de medida | Alta de unidad de medida con los campos permitidos. |
| `CU-CAT-21` | Editar unidad de medida | Actualización de unidad de medida con los campos permitidos. |
| `CU-CAT-22` | Consultar motivo de ajuste | Pantalla y listado independiente de Motivos de ajuste, restringidos al administrador. |
| `CU-CAT-23` | Crear motivo de ajuste | Alta de motivo de ajuste con los campos permitidos. |
| `CU-CAT-24` | Editar motivo de ajuste | Actualización de motivo de ajuste con los campos permitidos. |
| `CU-CAT-25` | Consultar estado de cumplimiento | Pantalla y listado independiente de Estados de cumplimiento, restringidos al administrador. |
| `CU-CAT-26` | Crear estado de cumplimiento | Alta de estado de cumplimiento con los campos permitidos. |
| `CU-CAT-27` | Editar estado de cumplimiento | Actualización de estado de cumplimiento con los campos permitidos. |


## Fichas específicas

### Grupo funcional CAT — Catálogos

Cada ficha representa una sola acción sobre una sola entidad. Los elementos compartidos se reutilizan en la implementación, pero no fusionan objetivos del actor.

## Fichas por caso de uso

### Grupo funcional ALM — Almacén

- [`CU-ALM-01` — Consultar materiales](cu-alm-01.md)
- [`CU-ALM-02` — Crear material](cu-alm-02.md)
- [`CU-ALM-03` — Editar material](cu-alm-03.md)
- [`CU-ALM-04` — Retirar material](cu-alm-04.md)
- [`CU-ALM-05` — Ajustar existencia de material](cu-alm-05.md)
- [`CU-ALM-06` — Generar reporte de inventario de materiales](cu-alm-06.md)
- [`CU-ALM-07` — Consultar movimientos de materiales](cu-alm-07.md)
- [`CU-ALM-08` — Generar reporte de movimientos de materiales](cu-alm-08.md)
- [`CU-ALM-09` — Consultar mermas](cu-alm-09.md)
- [`CU-ALM-10` — Registrar merma](cu-alm-10.md)
- [`CU-ALM-11` — Editar merma](cu-alm-11.md)
- [`CU-ALM-12` — Ajustar existencia de merma](cu-alm-12.md)
- [`CU-ALM-13` — Generar reporte de mermas](cu-alm-13.md)
- [`CU-ALM-14` — Consultar movimientos de mermas](cu-alm-14.md)
- [`CU-ALM-15` — Generar reporte de movimientos de mermas](cu-alm-15.md)

### Grupo funcional CAT — Catálogos

- [`CU-CAT-01` — Consultar proveedores](cu-cat-01.md)
- [`CU-CAT-02` — Crear proveedor](cu-cat-02.md)
- [`CU-CAT-03` — Editar proveedor](cu-cat-03.md)
- [`CU-CAT-04` — Cambiar estado de proveedor](cu-cat-04.md)
- [`CU-CAT-05` — Generar reporte de proveedores](cu-cat-05.md)
- [`CU-CAT-06` — Consultar clientes](cu-cat-06.md)
- [`CU-CAT-07` — Crear cliente](cu-cat-07.md)
- [`CU-CAT-08` — Editar cliente](cu-cat-08.md)
- [`CU-CAT-09` — Generar reporte de clientes](cu-cat-09.md)
- [`CU-CAT-10` — Consultar área](cu-cat-10.md)
- [`CU-CAT-11` — Crear área](cu-cat-11.md)
- [`CU-CAT-12` — Editar área](cu-cat-12.md)
- [`CU-CAT-13` — Consultar rol](cu-cat-13.md)
- [`CU-CAT-14` — Crear rol](cu-cat-14.md)
- [`CU-CAT-15` — Editar rol](cu-cat-15.md)
- [`CU-CAT-16` — Consultar presentación](cu-cat-16.md)
- [`CU-CAT-17` — Crear presentación](cu-cat-17.md)
- [`CU-CAT-18` — Editar presentación](cu-cat-18.md)
- [`CU-CAT-19` — Consultar unidad de medida](cu-cat-19.md)
- [`CU-CAT-20` — Crear unidad de medida](cu-cat-20.md)
- [`CU-CAT-21` — Editar unidad de medida](cu-cat-21.md)
- [`CU-CAT-22` — Consultar motivo de ajuste](cu-cat-22.md)
- [`CU-CAT-23` — Crear motivo de ajuste](cu-cat-23.md)
- [`CU-CAT-24` — Editar motivo de ajuste](cu-cat-24.md)
- [`CU-CAT-25` — Consultar estado de cumplimiento](cu-cat-25.md)
- [`CU-CAT-26` — Crear estado de cumplimiento](cu-cat-26.md)
- [`CU-CAT-27` — Editar estado de cumplimiento](cu-cat-27.md)
