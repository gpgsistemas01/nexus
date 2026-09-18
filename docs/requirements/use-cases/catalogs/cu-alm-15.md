# `CU-ALM-15` — Generar reporte de movimientos de mermas

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ALM-15` |
| Nombre | Generar reporte de movimientos de mermas. |
| Actor y disparador | **Actor:** Usuario con permiso sobre el reporte o consulta. **Disparador:** desde `CU-ALM-14` Consultar movimientos de mermas, selecciona **Exportar Excel** con los filtros que necesita conservar. |
| Participación de actor y sistema | **Actor:** define filtros y solicita la exportación.<br>**Nexus:** autoriza, consolida la información y entrega el archivo. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Flujo principal | 1. **Nexus:** después de que el actor selecciona la exportación desde la consulta de origen, abre el modal **Exportar reporte** y muestra las opciones aplicables **(ver E1)**.<br>2. **Actor:** conserva o ajusta los filtros, incluye las opciones disponibles y confirma.<br>3. **Nexus:** vuelve a comprobar autorización y parámetros y prepara la información de movimientos de mermas.<br>4. **Nexus:** genera el archivo de Excel e inicia su descarga; si no hay datos, informa que el resultado está vacío. |
| Excepciones | **E1 — Exportación rechazada (después del disparador):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Archivo Excel con filtros, columnas y cálculos propios del reporte.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-REP-002`, `RF-REP-004`, `RF-REP-005`. |
