# `CU-IDA-04` — Generar reporte de personas

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-IDA-04` |
| Nombre | Generar reporte de personas. |
| Actor y disparador | **Actor:** Usuario con permiso sobre el reporte o consulta. **Disparador:** desde `CU-IDA-01` Consultar personas, selecciona la opción para generar el reporte con los filtros que necesita conservar. |
| Participación de actor y sistema | **Actor:** solicita la exportación y confirma el alcance informado.<br>**Nexus:** autoriza, consolida la información y entrega el archivo. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Flujo principal | 1. **Nexus:** después de que el actor selecciona la exportación desde la consulta de origen, abre el modal **Exportar reporte** e informa que aplicará la búsqueda, los filtros y el orden actuales **(ver E1)**.<br>2. **Actor:** revisa el alcance informado y confirma la descarga.<br>3. **Nexus:** vuelve a comprobar autorización y parámetros y prepara la información de personas.<br>4. **Nexus:** genera el archivo de Excel e inicia su descarga; si no hay datos, informa que el resultado está vacío. |
| Excepciones | **E1 — Exportación rechazada (después del disparador):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Archivo Excel con filtros, columnas y cálculos propios del reporte.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-REP-002`, `RF-REP-004`. |
