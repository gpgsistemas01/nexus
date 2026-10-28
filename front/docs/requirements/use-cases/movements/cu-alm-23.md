# `CU-ALM-23` — Consultar movimientos de consumibles

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ALM-23` |
| Nombre | Consultar movimientos de consumibles. |
| Actor | Administrador del sistema del área Sistemas. |
| Disparador | Necesita localizar o revisar movimientos de consumibles y abre la opción de consulta correspondiente. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor es Administrador del sistema del área Sistemas y cuenta con el permiso autorización para consultar movimientos de inventario. |
| Flujo principal | 1. **Actor:** abre la opción para consultar movimientos de consumibles **(ver E1)**.<br>2. **Nexus:** comprueba su autorización y muestra los filtros disponibles.<br>3. **Actor:** define los criterios que necesita y solicita aplicarlos **(ver A1)**.<br>4. **Nexus:** obtiene únicamente movimientos de consumibles **(ver EOP)** y presenta la información autorizada y la opción **Exportar Excel**.<br>5. **Actor:** selecciona **Exportar Excel**; termina `CU-ALM-23` y con esa selección dispara `CU-ALM-24` Generar reporte de movimientos de consumibles. |
| Flujos alternativos | **A1 — Permanecer en la consulta (después del paso 3):**<br>1. **Nexus:** actualiza la tabla y el total sin modificar datos.<br>2. **Actor:** revisa los resultados o cambia los criterios.<br>3. **Nexus:** conserva la consulta disponible; termina el caso de uso. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso.<br>**EOP — Operación no completada (durante el paso 4 del flujo principal):**<br>1. **Nexus:** detecta que no puede obtener la información necesaria, comunica que la consulta no se completó y no modifica datos.<br>2. **Actor:** recibe el aviso y decide reintentar más tarde o terminar el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Consulta autorizada sin modificar datos.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-REP-001`, `RF-REP-011`. |

## Realización y verificación del cliente

La [guía de realización Vue](../../../architecture/views/development/frontend-technical-documentation/02-warehouse.md) describe captura, permisos de interfaz, contratos y propietarios del estado. La [cobertura por caso](../../../testing/04-use-case-coverage.md) identifica la evidencia y sus límites. Las pruebas de navegador de esta familia están en `warehouse.spec.ts, catalogs.spec.ts, records.spec.ts y movements.spec.ts`; la existencia del archivo no acredita por sí sola todos los pasos de esta ficha.

## Diagramas de realización

- [Movimientos: filtros dependientes e historial](../../../architecture/views/processes/08-movements-and-reports/01-movement-filters.md).
- [2. Consulta y guardado de registros](../../../architecture/views/processes/02-shared-runtime/01-list-and-record-save.md).
