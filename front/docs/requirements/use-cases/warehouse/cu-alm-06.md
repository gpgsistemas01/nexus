# `CU-ALM-06` — Generar reporte de inventario de materiales

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ALM-06` |
| Nombre | Generar reporte de inventario de materiales. |
| Actor | Personal de almacén o Administrador del sistema. |
| Disparador | Desde `CU-ALM-01`, necesita descargar el inventario de materiales. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Flujo principal | 1. **Actor:** revisa la consulta y selecciona en **Incluir en Excel** uno de los alcances **Activos o con stock**, **Activos** o **Con stock** y pulsa **Descargar Excel** **(ver E1)**.<br>2. **Nexus:** vuelve a comprobar autorización y parámetros, consulta la búsqueda por nombre, el tipo Material y el alcance; incluye todos sus proveedores aunque la tabla tenga uno seleccionado **(ver EOP)** y genera el archivo de Excel; inicia su descarga sin modificar inventario. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** rechaza la solicitud, comunica el motivo y no presenta información ni ejecuta cambios fuera de la autorización del actor; termina el caso de uso.<br>**EOP — No se pudo generar o descargar el reporte (durante el paso 2):**<br>1. **Nexus:** comunica el fallo y no presenta la respuesta como un Excel válido; conserva la consulta y, si estaba abierto, el diálogo de alcance.<br>2. **Actor:** vuelve a pulsar **Descargar Excel**, continuando en el paso 2, o cierra el diálogo/abandona la consulta y termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Archivo Excel con filtros, columnas y cálculos propios del reporte.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-REP-002`, `RF-REP-004`, `RF-REP-008`. |

Familia: [objetivos y realización](index.md).

## Diagramas de realización

- [Reportes: alcance, archivo y error recuperable](../../../architecture/views/processes/08-movements-and-reports/02-reports.md).
