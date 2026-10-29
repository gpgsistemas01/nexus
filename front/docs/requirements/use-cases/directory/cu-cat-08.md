# `CU-CAT-08` — Generar reporte de clientes

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-08` |
| Nombre | Generar reporte de clientes. |
| Actor | Administrador del sistema. |
| Relaciones entre casos | Extiende `CU-CAT-05` en **Acciones sobre los resultados** (después del paso 4, flujo A3) bajo la condición: elección del actor, permiso de reporte y criterios admitidos. Al completar o cancelar la operación retorna al paso 5 de la consulta. |
| Disparador | Desde `CU-CAT-05` Consultar clientes, selecciona la opción para generar el reporte con los filtros que necesita conservar. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Flujo principal | 1. **Actor:** aplica la búsqueda y los filtros admitidos en la consulta.<br>2. **Actor:** pulsa **Exportar Excel** **(ver E1)**.<br>3. **Nexus:** vuelve a comprobar autorización y parámetros, obtiene los registros de clientes conforme a la consulta aplicada, sin limitarse a la página visible **(ver EOP)**; genera el archivo de Excel e inicia la descarga. |
| Excepciones | **E1 — Exportación rechazada (después del paso 2):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso.<br>**EOP — Operación no completada (durante el paso 3 del flujo principal):**<br>1. **Nexus:** detecta que no puede obtener la información necesaria para el reporte, comunica el fallo y no entrega un archivo parcial ni modifica datos.<br>2. **Actor:** recibe el aviso y decide reintentar más tarde o terminar el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Archivo Excel con filtros, columnas y cálculos propios del reporte.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-REP-002`, `RF-REP-004`. |

Familia: [objetivos y realización](index.md).

## Diagramas de realización

- [Reportes: alcance, archivo y error recuperable](../../../architecture/views/processes/08-movements-and-reports/02-reports.md).
