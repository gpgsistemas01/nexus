# `CU-IDA-04` — Generar reporte de personas

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-IDA-04` |
| Nombre | Generar reporte de personas. |
| Actor | Personal de almacén o Administrador del sistema. |
| Disparador | Desde `CU-IDA-01` Consultar personas, selecciona la opción para generar el reporte con los filtros que necesita conservar. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Flujo principal | 1. **Actor:** aplica la búsqueda y los filtros que necesita para el reporte.<br>2. **Nexus:** actualiza la consulta y habilita la exportación cuando el filtro de rol está vacío **(ver A1)**.<br>3. **Actor:** pulsa **Exportar Excel** **(ver E1)**.<br>4. **Nexus:** vuelve a comprobar autorización y parámetros, obtiene los registros de personas conforme a la consulta aplicada, sin limitarse a la página visible **(ver EOP)**; genera el archivo de Excel e inicia la descarga. |
| Flujos alternativos | **A1 — Consulta con filtro de rol (durante el paso 2):**<br>1. **Nexus:** mantiene deshabilitada la exportación mientras el filtro de rol esté aplicado.<br>2. **Actor:** retira el filtro de rol y aplica la consulta; puede conservar el filtro de área.<br>3. **Nexus:** actualiza los resultados y habilita **Exportar Excel**; continúa en el paso 3 del flujo principal. |
| Excepciones | **E1 — Acceso rechazado (después del paso 3):**<br>1. **Nexus:** rechaza la solicitud, comunica el motivo y no presenta información ni ejecuta cambios fuera de la autorización del actor; termina el caso de uso.<br>**EOP — No se pudo generar o descargar el reporte (durante el paso 4):**<br>1. **Nexus:** comunica el fallo y no presenta la respuesta como un Excel válido; conserva la consulta y, si estaba abierto, el diálogo de alcance.<br>2. **Actor:** vuelve a pulsar **Exportar Excel**, continuando en el paso 4, o cierra el diálogo/abandona la consulta y termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Archivo Excel con filtros, columnas y cálculos propios del reporte.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-REP-002`, `RF-REP-004`. |

Familia: [objetivos y realización](index.md).

## Diagramas de realización

- [Reportes: alcance, archivo y error recuperable](../../../architecture/views/processes/08-movements-and-reports/02-reports.md).
