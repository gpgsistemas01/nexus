# `CU-ALM-22` — Generar reporte de inventario de consumibles

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ALM-22` |
| Nombre | Generar reporte de inventario de consumibles. |
| Actor | Personal de almacén o Administrador del sistema. |
| Relaciones entre casos | Extiende `CU-ALM-17` en **Acciones sobre los resultados** (después del paso 4, flujo A5) bajo la condición: elección del actor, permiso de reporte y criterios admitidos. Al completar o cancelar la operación retorna al paso 5 de la consulta. |
| Disparador | Desde `CU-ALM-17`, necesita descargar el inventario de consumibles. |
| Precondiciones | 1. El actor inició sesión.<br>2. Cuenta con el permiso de consulta o reporte correspondiente. |
| Flujo principal | 1. **Actor:** revisa la consulta y selecciona en **Incluir en Excel** uno de los alcances **Activos o con stock**, **Activos** o **Con stock**.<br>2. **Actor:** pulsa **Descargar Excel** **(ver E1)**.<br>3. **Nexus:** vuelve a comprobar autorización y parámetros, consulta la búsqueda por nombre, el tipo Consumible y el alcance; incluye todos sus proveedores aunque la tabla tenga uno seleccionado **(ver EOP)** y genera el archivo de Excel; inicia su descarga sin modificar inventario. |
| Excepciones | **E1 — Exportación no autorizada (después del paso 2):** Nexus rechaza la solicitud sin exponer datos.<br>**EOP — Error de consulta o generación (durante el paso 3):** Nexus informa el fallo y no entrega un archivo parcial; el actor conserva la consulta y puede reintentar la descarga. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** se descarga un archivo limitado a consumibles y al alcance elegido.<br>2. **Fallo:** no se modifica inventario ni se entrega un archivo parcial. |
| Requisitos relacionados | `RF-CAT-025`, `RF-REP-002`, `RF-REP-004`, `RF-REP-008`, `RF-REP-010`. |

Familia: [objetivos y realización](index.md).

## Diagramas de realización

- [Reportes: alcance, archivo y error recuperable](../../../architecture/views/processes/08-movements-and-reports/02-reports.md).
