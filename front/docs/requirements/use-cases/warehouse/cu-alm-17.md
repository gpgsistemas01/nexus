# `CU-ALM-17` — Consultar consumibles

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ALM-17` |
| Nombre | Consultar consumibles. |
| Actor | Usuario autorizado de área operativa, Personal de almacén o Administrador del sistema. |
| Disparador | Abre el módulo **Consumibles**. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor tiene autorización para consultar consumibles. |
| Flujo principal | 1. **Actor:** abre **Almacén → Consumibles** **(ver E1)**.<br>2. **Nexus:** comprueba la autorización y muestra las ofertas de consumibles con su proveedor, existencia, stock mínimo, presentación y unidad, sin mezclar materiales; muestra los consumibles que cumplen los criterios, el total y las acciones que el actor está autorizado a realizar **(ver EOP)** **(ver A1)**.<br>3. **Actor:** revisa los resultados y los datos de los registros que necesita consultar. |
| Flujos alternativos | **A1 — Cambiar los criterios de consulta (después del paso 2):**<br>1. **Actor:** modifica la búsqueda, los filtros, el orden o la página con los controles disponibles.<br>2. **Nexus:** carga los resultados del criterio elegido, conserva el alcance autorizado y no modifica registros; continúa en el paso 3 del flujo principal. |
| Acciones de la pantalla | **Editar** en el registro seleccionado: [CU-ALM-19](cu-alm-19.md)<br>**Eliminar** en el registro seleccionado: [CU-ALM-20](cu-alm-20.md)<br>**Ajustar stock** en el registro seleccionado: [CU-ALM-21](cu-alm-21.md)<br>**Descargar Excel**: [CU-ALM-22](cu-alm-22.md)<br>**Nuevo consumible**: [CU-ALM-18](cu-alm-18.md) |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** rechaza la solicitud, comunica el motivo y no presenta información ni ejecuta cambios fuera de la autorización del actor; termina el caso de uso.<br>**EOP — Consulta no disponible (durante el paso 2):**<br>1. **Nexus:** muestra el fallo de carga y la opción de reintentar; no modifica registros.<br>2. **Actor:** pulsa **Reintentar**, continuando en el paso 2 del flujo principal, o abandona la consulta y termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** la tabla contiene sólo ofertas de consumibles que el actor está autorizado a consultar.<br>2. **Fallo:** no se modifican existencias ni relaciones.<br>**Alcance:** esta consulta no modifica registros. |
| Requisitos relacionados | `RF-CAT-025`, `RN-034`. |

Familia: [objetivos y realización](index.md).

## Diagramas de realización

- [2. Consulta y guardado de registros](../../../architecture/views/processes/02-shared-runtime/01-list-and-record-save.md).
