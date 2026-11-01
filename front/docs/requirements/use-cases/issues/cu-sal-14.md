# `CU-SAL-14` — Generar reporte de salidas de merma

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-SAL-14` |
| Nombre | Generar reporte de salidas de merma. |
| Actor | Personal de almacén o Administrador del sistema. |
| Disparador | Desde `CU-SAL-08` Consultar salidas de merma, selecciona la opción para generar el reporte con los filtros que necesita conservar. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Flujo principal | 1. **Actor:** pulsa **Exportar Excel** en la consulta de origen **(ver E1)**.<br>2. **Nexus:** abre el modal **Exportar reporte** con las opciones **Mes actual**, **Mes específico** y **Filtros aplicados en la tabla**.<br>3. **Actor:** elige el alcance, captura **Mes del reporte** si eligió un mes específico y pulsa **Descargar Excel** **(ver A1 y A2)**.<br>4. **Nexus:** vuelve a comprobar autorización y parámetros; usa los filtros aplicados si se eligió esa opción, o el mes completo sin los filtros de la tabla si se eligió un alcance mensual. Obtiene la información **(ver EOP)** de salidas de merma; genera el archivo de Excel e inicia su descarga. |
| Flujos alternativos | **A1 — Cancelar la exportación (en el paso 3, en lugar de descargar):**<br>1. **Actor:** cierra el diálogo o pulsa **Cerrar**.<br>2. **Nexus:** cierra el diálogo, conserva la consulta y no solicita el archivo; termina el caso de uso.<br>**A2 — Mes específico inválido o vacío (después del paso 3):**<br>1. **Nexus:** señala que falta un mes válido y mantiene el diálogo y el alcance elegidos sin solicitar el archivo.<br>2. **Actor:** corrige el mes o elige otro alcance y pulsa **Descargar Excel**; continúa en el paso 4 del flujo principal. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** rechaza la solicitud, comunica el motivo y no presenta información ni ejecuta cambios fuera de la autorización del actor; termina el caso de uso.<br>**EOP — No se pudo generar o descargar el reporte (durante el paso 4):**<br>1. **Nexus:** comunica el fallo y no presenta la respuesta como un Excel válido; conserva la consulta y, si estaba abierto, el diálogo de alcance.<br>2. **Actor:** vuelve a pulsar **Descargar Excel**, continuando en el paso 4, o cierra el diálogo/abandona la consulta y termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Archivo Excel con filtros, columnas y cálculos propios del reporte.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-REP-002`, `RF-REP-004`. |

Familia: [objetivos y realización](index.md).

## Diagramas de realización

- [Reportes: alcance, archivo y error recuperable](../../../architecture/views/processes/08-movements-and-reports/02-reports.md).
