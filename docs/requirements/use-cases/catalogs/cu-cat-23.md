# `CU-CAT-23` — Consultar inventario de mermas

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-23` |
| Nombre | Consultar inventario de mermas. |
| Actor y disparador | **Actor:** Usuario con permiso sobre el reporte o consulta. **Disparador:** necesita localizar o revisar inventario de mermas y abre la opción de consulta correspondiente. |
| Participación de actor y sistema | **Actor:** abre la consulta, define criterios y selecciona registros.<br>**Nexus:** autoriza, presenta filtros y devuelve sólo la información permitida. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Flujo principal | 1. **Actor:** abre la opción para consultar inventario de mermas **(ver E1)**.<br>2. **Nexus:** comprueba su autorización y muestra los filtros disponibles.<br>3. **Actor:** define los criterios que necesita y solicita aplicarlos **(ver A1)**.<br>4. **Nexus:** presenta la información autorizada y la opción **Exportar Excel**.<br>5. **Actor:** selecciona **Exportar Excel**; termina `CU-CAT-23` y con esa selección dispara `CU-CAT-24` Generar reporte de mermas. |
| Flujos alternativos | **A1 — Permanecer en la consulta (después del paso 3):**<br>1. **Nexus:** actualiza la tabla y el total sin modificar datos.<br>2. **Actor:** revisa los resultados o cambia los criterios.<br>3. **Nexus:** conserva la consulta disponible; termina el caso de uso. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Consulta autorizada sin modificar datos.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-REP-001`. |
