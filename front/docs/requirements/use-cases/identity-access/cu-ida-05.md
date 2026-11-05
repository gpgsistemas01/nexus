# `CU-IDA-05` — Consultar usuarios

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-IDA-05` |
| Nombre | Consultar usuarios. |
| Actor | Administrador del sistema. |
| Disparador | Necesita localizar o revisar usuarios y abre la opción de consulta correspondiente. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta del recurso. |
| Flujo principal | 1. **Actor:** abre la opción para consultar usuarios **(ver E1)**.<br>2. **Nexus:** comprueba su autorización y muestra la consulta con sus criterios disponibles; obtiene la información disponible y presenta la información autorizada y, si tiene permiso, la acción para registrar un usuario **(ver EOP)** **(ver A1)**.<br>3. **Actor:** revisa los resultados y los datos de los registros que necesita consultar. |
| Flujos alternativos | **A1 — Cambiar los criterios de consulta (después del paso 2):**<br>1. **Actor:** modifica la búsqueda, los filtros, el orden o la página con los controles disponibles.<br>2. **Nexus:** carga los resultados del criterio elegido, conserva el alcance autorizado y no modifica registros; continúa en el paso 3 del flujo principal. |
| Acciones de la pantalla | **Editar registro** en el registro seleccionado: [CU-IDA-07](cu-ida-07.md)<br>**Cambiar contraseña** en el usuario seleccionado: [CU-IDA-08](cu-ida-08.md)<br>**Exportar Excel**: [CU-IDA-09](cu-ida-09.md)<br>**Nuevo usuario**: [CU-IDA-06](cu-ida-06.md) |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** rechaza la solicitud, comunica el motivo y no presenta información ni ejecuta cambios fuera de la autorización del actor; termina el caso de uso.<br>**EOP — Consulta no disponible (durante el paso 2):**<br>1. **Nexus:** muestra el fallo de carga y la opción de reintentar; no modifica registros.<br>2. **Actor:** pulsa **Reintentar**, continuando en el paso 2 del flujo principal, o abandona la consulta y termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Listado de cuentas y accesos.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada.<br>**Alcance:** esta consulta no modifica registros. |
| Requisitos relacionados | `RF-IAM-001`. |

Familia: [objetivos y realización](index.md).

## Diagramas de realización

- [2. Consulta y guardado de registros](../../../architecture/views/processes/02-shared-runtime/01-list-and-record-save.md).
