# `CU-ALM-14` — Consultar movimientos de mermas

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ALM-14` |
| Nombre | Consultar movimientos de mermas. |
| Actor | Administrador del sistema del área Sistemas. |
| Disparador | Necesita localizar o revisar movimientos de mermas y abre la opción de consulta correspondiente. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Flujo principal | 1. **Actor:** abre la opción para consultar movimientos de mermas **(ver E1)**.<br>2. **Nexus:** comprueba su autorización y muestra los filtros disponibles.<br>3. **Actor:** define los criterios que necesita y solicita aplicarlos **(ver A1)**.<br>4. **Nexus:** presenta la información autorizada y la opción **Exportar Excel**. Además, consulta la información necesaria en la base de datos **(ver EBD)**.<br>5. **Actor:** selecciona **Exportar Excel**; termina `CU-ALM-14` y con esa selección dispara `CU-ALM-15` Generar reporte de movimientos de mermas. |
| Flujos alternativos | **A1 — Permanecer en la consulta (después del paso 3):**<br>1. **Nexus:** actualiza la tabla y el total sin modificar datos.<br>2. **Actor:** revisa los resultados o cambia los criterios.<br>3. **Nexus:** conserva la consulta disponible; termina el caso de uso. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso.<br>**EBD — Error de base de datos o de conexión (durante el paso 4 del flujo principal):**<br>1. **Nexus:** detecta que no puede consultar o guardar la información, revierte cualquier cambio parcial y comunica que la operación no se completó.<br>2. **Actor:** recibe el aviso, conserva los datos capturados cuando existe un formulario y decide reintentar más tarde o terminar el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Consulta autorizada sin modificar datos.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-REP-001`. |
