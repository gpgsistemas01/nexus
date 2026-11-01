# `CU-CAT-08` — Generar reporte de clientes

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-08` |
| Nombre | Generar reporte de clientes. |
| Actor | Administrador del sistema. |
| Disparador | Desde `CU-CAT-05` Consultar clientes, selecciona la opción para generar el reporte con los filtros que necesita conservar. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Flujo principal | 1. **Actor:** aplica la búsqueda y los filtros admitidos en la consulta y pulsa **Exportar Excel** **(ver E1)**.<br>2. **Nexus:** vuelve a comprobar autorización y parámetros, obtiene los registros de clientes conforme a la consulta aplicada, sin limitarse a la página visible **(ver EOP)**; genera el archivo de Excel e inicia la descarga. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** rechaza la solicitud, comunica el motivo y no presenta información ni ejecuta cambios fuera de la autorización del actor; termina el caso de uso.<br>**EOP — No se pudo generar o descargar el reporte (durante el paso 2):**<br>1. **Nexus:** comunica el fallo y no presenta la respuesta como un Excel válido; conserva la consulta y, si estaba abierto, el diálogo de alcance.<br>2. **Actor:** vuelve a pulsar **Exportar Excel**, continuando en el paso 2, o cierra el diálogo/abandona la consulta y termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Archivo Excel con filtros, columnas y cálculos propios del reporte.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-REP-002`, `RF-REP-004`. |

Familia: [objetivos y realización](index.md).

## Diagramas de realización

- [Reportes: alcance, archivo y error recuperable](../../../architecture/views/processes/08-movements-and-reports/02-reports.md).
