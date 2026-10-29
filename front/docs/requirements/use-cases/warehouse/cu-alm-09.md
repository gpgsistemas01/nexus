# `CU-ALM-09` — Consultar mermas

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ALM-09` |
| Nombre | Consultar mermas. |
| Actor | Usuario autorizado de área operativa, Personal de almacén o Administrador del sistema. |
| Disparador | Necesita localizar o revisar mermas y abre la opción de consulta correspondiente. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta del recurso. |
| Flujo principal | 1. **Actor:** abre la opción para consultar mermas **(ver E1)**.<br>2. **Nexus:** comprueba su autorización y muestra la consulta con sus criterios disponibles.<br>3. **Actor:** define los criterios que necesita y solicita aplicarlos.<br>4. **Nexus:** obtiene la información disponible **(ver EOP)** y presenta el listado con sus existencias, la acción de alta autorizada para registrar una merma y la opción **Descargar Excel**. **(ver A1)**<br>5. **Actor:** revisa los resultados y finaliza la consulta sin necesidad de crear, modificar ni exportar registros. |
| Flujos alternativos | **A1 — Cambiar los criterios de consulta (después del paso 4):**<br>1. **Actor:** cambia la búsqueda, los filtros, el orden o la página mediante los controles disponibles.<br>2. **Nexus:** actualiza los resultados autorizados sin modificar registros; continúa en el paso 5 del flujo principal. |
| Acciones de la pantalla | **Editar** en el registro seleccionado: [CU-ALM-11](cu-alm-11.md)<br>**Ajustar stock** en el registro seleccionado: [CU-ALM-12](cu-alm-12.md)<br>**Descargar Excel**: [CU-ALM-14](cu-alm-14.md)<br>**Agregar stock** en la merma seleccionada: [CU-ALM-13](cu-alm-13.md)<br>**Nueva merma**: [CU-ALM-10](cu-alm-10.md) |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso.<br>**EOP — Operación no completada (durante el paso 4 del flujo principal):**<br>1. **Nexus:** detecta que no puede obtener la información necesaria, comunica que la consulta no se completó y no modifica datos.<br>2. **Actor:** recibe el aviso y decide reintentar más tarde o terminar el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Listado de existencias de merma.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada.<br>**Alcance:** esta consulta no modifica registros. |
| Requisitos relacionados | `RF-CAT-004`, `RF-WST-001`. |

Familia: [objetivos y realización](index.md).

## Diagramas de realización

- [2. Consulta y guardado de registros](../../../architecture/views/processes/02-shared-runtime/01-list-and-record-save.md).
