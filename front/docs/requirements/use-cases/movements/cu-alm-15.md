# `CU-ALM-15` — Consultar movimientos de mermas

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ALM-15` |
| Nombre | Consultar movimientos de mermas. |
| Actor | Administrador del sistema del área Sistemas. |
| Disparador | Necesita localizar o revisar movimientos de mermas y abre la opción de consulta correspondiente. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor es Administrador del sistema del área Sistemas y cuenta con el permiso para consultar movimientos de inventario. |
| Flujo principal | 1. **Actor:** abre la opción para consultar movimientos de mermas **(ver E1)**.<br>2. **Nexus:** comprueba su autorización y muestra los filtros disponibles.<br>3. **Actor:** define los criterios que necesita y solicita aplicarlos.<br>4. **Nexus:** obtiene la información disponible **(ver EOP)** y presenta la información autorizada y la opción **Exportar Excel**. **(ver A1)**<br>5. **Actor:** revisa los resultados y finaliza la consulta sin necesidad de crear, modificar ni exportar registros. |
| Flujos alternativos | **A1 — Cambiar los criterios de consulta (después del paso 4):**<br>1. **Actor:** cambia la búsqueda, los filtros, el orden o la página mediante los controles disponibles.<br>2. **Nexus:** actualiza los resultados autorizados sin modificar registros; continúa en el paso 5 del flujo principal. |
| Acciones de la pantalla | **Exportar Excel**: [CU-ALM-16](cu-alm-16.md) |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso.<br>**EOP — Operación no completada (durante el paso 4 del flujo principal):**<br>1. **Nexus:** detecta que no puede obtener la información necesaria, comunica que la consulta no se completó y no modifica datos.<br>2. **Actor:** recibe el aviso y decide reintentar más tarde o terminar el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Consulta autorizada sin modificar datos; cada renglón conserva tipo, referencia de su documento de origen, cantidad y saldos para reconstruir cronológicamente la existencia.<br>2. **Éxito:** La consulta no atribuye una salida a una entrada específica porque la merma se administra como saldo fungible, no por lotes.<br>3. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-REP-001`, `RN-033`. |

Familia: [objetivos y realización](index.md).

## Diagramas de realización

- [Movimientos: filtros dependientes e historial](../../../architecture/views/processes/08-movements-and-reports/01-movement-filters.md).
- [2. Consulta y guardado de registros](../../../architecture/views/processes/02-shared-runtime/01-list-and-record-save.md).
