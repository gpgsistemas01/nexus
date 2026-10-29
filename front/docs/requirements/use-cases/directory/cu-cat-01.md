# `CU-CAT-01` — Consultar proveedores

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-01` |
| Nombre | Consultar proveedores. |
| Actor | Administrador del sistema del área Sistemas, con permiso de consulta de la página independiente. |
| Disparador | Necesita localizar o revisar proveedores y abre la opción de consulta correspondiente. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta del recurso. |
| Flujo principal | 1. **Actor:** abre la opción para consultar proveedores **(ver E1)**.<br>2. **Nexus:** comprueba su autorización y muestra la consulta con sus criterios disponibles.<br>3. **Actor:** define los criterios que necesita y solicita aplicarlos.<br>4. **Nexus:** obtiene la información disponible **(ver EOP)** y presenta la información autorizada y, si tiene permiso, la acción para registrar un proveedor. **(ver A1)**<br>5. **Actor:** revisa los resultados y finaliza la consulta sin necesidad de crear, modificar ni exportar registros. |
| Flujos alternativos | **A1 — Cambiar los criterios de consulta (después del paso 4):**<br>1. **Actor:** cambia la búsqueda, los filtros, el orden o la página mediante los controles disponibles.<br>2. **Nexus:** actualiza los resultados autorizados sin modificar registros; continúa en el paso 5 del flujo principal. |
| Acciones de la pantalla | **Editar registro** en el registro seleccionado: [CU-CAT-03](cu-cat-03.md)<br>**Exportar Excel**: [CU-CAT-04](cu-cat-04.md)<br>**Nuevo proveedor**: [CU-CAT-02](cu-cat-02.md) |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso.<br>**EOP — Operación no completada (durante el paso 4 del flujo principal):**<br>1. **Nexus:** detecta que no puede obtener la información necesaria, comunica que la consulta no se completó y no modifica datos.<br>2. **Actor:** recibe el aviso y decide reintentar más tarde o terminar el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Listado de proveedores autorizados.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada.<br>**Alcance:** esta consulta no modifica registros. |
| Requisitos relacionados | `RF-CAT-002`. |

Familia: [objetivos y realización](index.md).

## Diagramas de realización

- [2. Consulta y guardado de registros](../../../architecture/views/processes/02-shared-runtime/01-list-and-record-save.md).
