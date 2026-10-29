# `CU-ALM-07` — Consultar movimientos de materiales

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ALM-07` |
| Nombre | Consultar movimientos de materiales. |
| Actor | Administrador del sistema del área Sistemas. |
| Disparador | Necesita localizar o revisar movimientos de materiales y abre la opción de consulta correspondiente. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor es Administrador del sistema del área Sistemas y cuenta con el permiso para consultar movimientos de inventario. |
| Puntos de extensión | **Acciones sobre los resultados**, después del paso 4: `CU-ALM-08` (A2). Se activan por elección del actor con el permiso y las condiciones de su caso. El retorno normal es el paso 5; consultar no exige ejecutar ninguna extensión. |
| Flujo principal | 1. **Actor:** abre la opción para consultar movimientos de materiales **(ver E1)**.<br>2. **Nexus:** comprueba su autorización y muestra los filtros disponibles.<br>3. **Actor:** define los criterios que necesita y solicita aplicarlos.<br>4. **Nexus:** obtiene la información disponible **(ver EOP)** y presenta la información autorizada y la opción **Exportar Excel**. **(ver A1)** **(ver A2)**<br>5. **Actor:** revisa los resultados y finaliza la consulta sin necesidad de crear, modificar ni exportar registros. |
| Flujos alternativos | **A1 — Cambiar los criterios de consulta (después del paso 4):**<br>1. **Actor:** cambia la búsqueda, los filtros, el orden o la página mediante los controles disponibles.<br>2. **Nexus:** actualiza los resultados autorizados sin modificar registros; continúa en el paso 5 del flujo principal.<br>**A2 — Generar reporte de movimientos de materiales (después del paso 4):**<br>1. **Actor:** pulsa **Exportar Excel**.<br>2. **Nexus:** comprueba precondiciones y autorización y ejecuta la extensión `CU-ALM-08`; al finalizar o cancelar, conserva la consulta, actualiza sus datos cuando corresponde y continúa en el paso 5 del flujo principal. Un rechazo que invalida el acceso sigue la excepción E1. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso.<br>**EOP — Operación no completada (durante el paso 4 del flujo principal):**<br>1. **Nexus:** detecta que no puede obtener la información necesaria, comunica que la consulta no se completó y no modifica datos.<br>2. **Actor:** recibe el aviso y decide reintentar más tarde o terminar el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Consulta autorizada sin modificar datos.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-REP-001`. |

Familia: [objetivos y realización](index.md).

## Diagramas de realización

- [Movimientos: filtros dependientes e historial](../../../architecture/views/processes/08-movements-and-reports/01-movement-filters.md).
- [2. Consulta y guardado de registros](../../../architecture/views/processes/02-shared-runtime/01-list-and-record-save.md).
