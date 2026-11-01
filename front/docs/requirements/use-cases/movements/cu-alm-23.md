# `CU-ALM-23` — Consultar movimientos de consumibles

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ALM-23` |
| Nombre | Consultar movimientos de consumibles. |
| Actor | Administrador del sistema del área Sistemas. |
| Disparador | Necesita localizar o revisar movimientos de consumibles y abre la opción de consulta correspondiente. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor es Administrador del sistema del área Sistemas y cuenta con el permiso para consultar movimientos de inventario. |
| Flujo principal | 1. **Actor:** abre la opción para consultar movimientos de consumibles **(ver E1)**.<br>2. **Nexus:** comprueba su autorización y muestra los filtros disponibles; obtiene únicamente movimientos de consumibles y presenta la información autorizada y la opción **Exportar Excel** **(ver EOP)** **(ver A1)**.<br>3. **Actor:** revisa los resultados y los datos de los registros que necesita consultar. |
| Flujos alternativos | **A1 — Cambiar los criterios de consulta (después del paso 2):**<br>1. **Actor:** modifica la búsqueda, los filtros, el orden o la página con los controles disponibles.<br>2. **Nexus:** carga los resultados del criterio elegido, conserva el alcance autorizado y no modifica registros; continúa en el paso 3 del flujo principal. |
| Acciones de la pantalla | **Exportar Excel**: [CU-ALM-24](cu-alm-24.md) |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** rechaza la solicitud, comunica el motivo y no presenta información ni ejecuta cambios fuera de la autorización del actor; termina el caso de uso.<br>**EOP — Consulta no disponible (durante el paso 2):**<br>1. **Nexus:** muestra el fallo de carga y la opción de reintentar; no modifica registros.<br>2. **Actor:** pulsa **Reintentar**, continuando en el paso 2 del flujo principal, o abandona la consulta y termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Consulta autorizada sin modificar datos.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-REP-001`, `RF-REP-011`. |

Familia: [objetivos y realización](index.md).

## Diagramas de realización

- [Movimientos: filtros dependientes e historial](../../../architecture/views/processes/08-movements-and-reports/01-movement-filters.md).
- [2. Consulta y guardado de registros](../../../architecture/views/processes/02-shared-runtime/01-list-and-record-save.md).
