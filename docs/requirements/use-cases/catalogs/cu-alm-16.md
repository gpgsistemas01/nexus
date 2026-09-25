# `CU-ALM-16` — Generar reporte de movimientos de mermas

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ALM-16` |
| Nombre | Generar reporte de movimientos de mermas. |
| Actor | Administrador del sistema del área Sistemas. |
| Disparador | Desde `CU-ALM-15` Consultar movimientos de mermas, selecciona **Exportar Excel** con los filtros que necesita conservar. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Flujo principal | 1. **Nexus:** después de que el actor selecciona la exportación desde la consulta de origen, abre el modal **Exportar reporte** y muestra las opciones aplicables **(ver E1)**.<br>2. **Actor:** conserva o ajusta los filtros, incluye las opciones disponibles y confirma.<br>3. **Nexus:** vuelve a comprobar autorización y parámetros y prepara la información de movimientos de mermas; genera el archivo de Excel e inicia su descarga; si no hay datos, informa que el resultado está vacío. Además, consulta la información necesaria en la base de datos **(ver EBD)**. |
| Excepciones | **E1 — Exportación rechazada (después del disparador):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso.<br>**EBD — Error de base de datos o de conexión (durante el paso 3 del flujo principal):**<br>1. **Nexus:** detecta que no puede consultar o guardar la información, revierte cualquier cambio parcial y comunica que la operación no se completó.<br>2. **Actor:** recibe el aviso, conserva los datos capturados cuando existe un formulario y decide reintentar más tarde o terminar el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Archivo Excel con filtros, columnas y cálculos propios del reporte.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-REP-002`, `RF-REP-004`, `RF-REP-005`. |
