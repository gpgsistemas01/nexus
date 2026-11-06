# `CU-ENT-07` — Consultar compras de consumible

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ENT-07` |
| Nombre | Consultar compras de consumible. |
| Actor | Personal de almacén o Administrador del sistema. |
| Disparador | Necesita localizar o revisar compras de consumible y abre la opción de consulta correspondiente. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta del recurso. |
| Flujo principal | 1. **Actor:** abre la opción para consultar compras de consumible **(ver E1)**.<br>2. **Nexus:** comprueba su autorización y muestra la consulta con sus criterios disponibles; obtiene la información disponible y presenta la información autorizada y, si tiene permiso, la acción para registrar una compra **(ver EOP)** **(ver A1)**.<br>3. **Actor:** revisa los resultados y los datos de los registros que necesita consultar. |
| Flujos alternativos | **A1 — Cambiar los criterios de consulta (después del paso 2):**<br>1. **Actor:** modifica la búsqueda, los filtros, el orden o la página con los controles disponibles.<br>2. **Nexus:** carga los resultados del criterio elegido, conserva el alcance autorizado y no modifica registros; continúa en el paso 3 del flujo principal. |
| Acciones de la pantalla | **Editar compra** en el documento seleccionado: [CU-ENT-09](cu-ent-09.md)<br>abre los detalles de la compra seleccionada y pulsa **Corregir detalle** en un detalle: [CU-ENT-10](cu-ent-10.md)<br>abre los detalles de la compra seleccionada y pulsa **Cancelar detalle** en un detalle: [CU-ENT-11](cu-ent-11.md)<br>**Exportar Excel**: [CU-ENT-12](cu-ent-12.md)<br>**Nueva compra**: [CU-ENT-08](cu-ent-08.md) |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** rechaza la solicitud, comunica el motivo y no presenta información ni ejecuta cambios fuera de la autorización del actor; termina el caso de uso.<br>**EOP — Consulta no disponible (durante el paso 2):**<br>1. **Nexus:** muestra el fallo de carga y la opción de reintentar; no modifica registros.<br>2. **Actor:** pulsa **Reintentar**, continuando en el paso 2 del flujo principal, o abandona la consulta y termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Listado y detalle sin modificar inventario.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada.<br>**Alcance:** esta consulta no modifica registros. |
| Requisitos relacionados | `RF-REC-001`. |

Familia: [objetivos y realización](index.md).

## Diagramas de realización

- [Compra: lectura y preparación de detalles](../../../architecture/views/processes/06-purchases/01-purchase-read-lines.md).
