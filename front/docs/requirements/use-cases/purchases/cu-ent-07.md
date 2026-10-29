# `CU-ENT-07` — Consultar compras de consumible

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ENT-07` |
| Nombre | Consultar compras de consumible. |
| Actor | Personal de almacén o Administrador del sistema. |
| Disparador | Necesita localizar o revisar compras de consumible y abre la opción de consulta correspondiente. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta del recurso. |
| Flujo principal | 1. **Actor:** abre la opción para consultar compras de consumible **(ver E1)**.<br>2. **Nexus:** comprueba su autorización y muestra la consulta con sus criterios disponibles.<br>3. **Actor:** define los criterios que necesita y solicita aplicarlos.<br>4. **Nexus:** obtiene la información disponible **(ver EOP)** y presenta la información autorizada y, si tiene permiso, la acción para registrar una compra. **(ver A1)**<br>5. **Actor:** revisa los resultados y finaliza la consulta sin necesidad de crear, modificar ni exportar registros. |
| Flujos alternativos | **A1 — Cambiar los criterios de consulta (después del paso 4):**<br>1. **Actor:** cambia la búsqueda, los filtros, el orden o la página mediante los controles disponibles.<br>2. **Nexus:** actualiza los resultados autorizados sin modificar registros; continúa en el paso 5 del flujo principal. |
| Acciones de la pantalla | **Editar compra** en el documento seleccionado: [CU-ENT-09](cu-ent-09.md)<br>abre los detalles de la compra seleccionada y pulsa **Corregir detalle** en un detalle: [CU-ENT-10](cu-ent-10.md)<br>abre los detalles de la compra seleccionada y pulsa **Cancelar detalle** en un detalle: [CU-ENT-11](cu-ent-11.md)<br>**Exportar Excel**: [CU-ENT-12](cu-ent-12.md)<br>**Nueva compra**: [CU-ENT-08](cu-ent-08.md) |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso.<br>**EOP — Operación no completada (durante el paso 4 del flujo principal):**<br>1. **Nexus:** detecta que no puede obtener la información necesaria, comunica que la consulta no se completó y no modifica datos.<br>2. **Actor:** recibe el aviso y decide reintentar más tarde o terminar el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Listado y detalle sin modificar inventario.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada.<br>**Alcance:** esta consulta no modifica registros. |
| Requisitos relacionados | `RF-REC-001`. |

Familia: [objetivos y realización](index.md).

## Diagramas de realización

- [Compra: lectura y preparación de detalles](../../../architecture/views/processes/06-purchases/01-purchase-read-lines.md).
