# `CU-ENT-01` — Consultar compras de material

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ENT-01` |
| Nombre | Consultar compras de material. |
| Actor | Personal de almacén o Administrador del sistema. |
| Disparador | Necesita localizar o revisar compras de material y abre la opción de consulta correspondiente. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta del recurso. |
| Flujo principal | 1. **Actor:** abre la opción para consultar compras de material **(ver E1)**.<br>2. **Nexus:** comprueba su autorización y muestra la consulta con sus criterios disponibles; obtiene la información disponible y presenta la información autorizada y, si tiene permiso, la acción para registrar una compra **(ver EOP)** **(ver A1)**.<br>3. **Actor:** revisa los resultados y los datos de los registros que necesita consultar. |
| Flujos alternativos | **A1 — Cambiar los criterios de consulta (después del paso 2):**<br>1. **Actor:** modifica la búsqueda, los filtros, el orden o la página con los controles disponibles.<br>2. **Nexus:** carga los resultados del criterio elegido, conserva el alcance autorizado y no modifica registros; continúa en el paso 3 del flujo principal. |
| Acciones de la pantalla | **Editar compra** en el documento seleccionado: [CU-ENT-03](cu-ent-03.md)<br>abre los detalles de la compra seleccionada y pulsa **Corregir detalle** en un detalle: [CU-ENT-04](cu-ent-04.md)<br>abre los detalles de la compra seleccionada y pulsa **Cancelar detalle** en un detalle: [CU-ENT-05](cu-ent-05.md)<br>**Exportar Excel**: [CU-ENT-06](cu-ent-06.md)<br>**Nueva compra**: [CU-ENT-02](cu-ent-02.md) |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** rechaza la solicitud, comunica el motivo y no presenta información ni ejecuta cambios fuera de la autorización del actor; termina el caso de uso.<br>**EOP — Consulta no disponible (durante el paso 2):**<br>1. **Nexus:** muestra el fallo de carga y la opción de reintentar; no modifica registros.<br>2. **Actor:** pulsa **Reintentar**, continuando en el paso 2 del flujo principal, o abandona la consulta y termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Listado y detalle sin modificar inventario.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada.<br>**Alcance:** esta consulta no modifica registros. |
| Requisitos relacionados | `RF-REC-001`. |

Familia: [objetivos y realización](index.md).

## Diagramas de realización

- [Compra: lectura y preparación de detalles](../../../architecture/views/processes/06-purchases/01-purchase-read-lines.md).
