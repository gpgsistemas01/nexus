# `CU-CAT-18` — Consultar unidad de medida

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-18` |
| Nombre | Consultar unidad de medida. |
| Actor | Administrador del sistema del área Sistemas. |
| Disparador | Selecciona **Unidades de medida** en el submenú **Catálogos auxiliares**. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor tiene autorización para administrar catálogos y pertenece al contexto administrativo autorizado. |
| Flujo principal | 1. **Actor:** selecciona **Unidades de medida** en el submenú **Catálogos auxiliares** **(ver E1)**.<br>2. **Nexus:** comprueba la autorización del actor para consultar Unidades de medida y muestra su tabla **(ver EOP)**; presenta **Nueva unidad de medida** como acción opcional para registrar una unidad de medida. **(ver A1)**<br>3. **Actor:** revisa los resultados y finaliza la consulta sin necesidad de crear, modificar ni exportar registros. |
| Flujos alternativos | **A1 — Cambiar los criterios de consulta (después del paso 2):**<br>1. **Actor:** modifica la búsqueda, los filtros, el orden o la página con los controles disponibles.<br>2. **Nexus:** carga los resultados del criterio elegido, conserva el alcance autorizado y no modifica registros; continúa en el paso 3 del flujo principal. |
| Acciones de la pantalla | **Editar registro** en el registro seleccionado: [CU-CAT-20](cu-cat-20.md)<br>**Nueva unidad de medida**: [CU-CAT-19](cu-cat-19.md) |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** rechaza la solicitud, comunica el motivo y no presenta información ni ejecuta cambios fuera de la autorización del actor; termina el caso de uso.<br>**EOP — Consulta no disponible (durante el paso 2):**<br>1. **Nexus:** muestra el fallo de carga y la opción de reintentar; no modifica registros.<br>2. **Actor:** pulsa **Reintentar**, continuando en el paso 2 del flujo principal, o abandona la consulta y termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La tabla muestra exclusivamente las entradas de Unidades de medida.<br>2. **Fallo:** No se exponen datos ni modelos no autorizados.<br>**Alcance:** esta consulta no modifica registros. |
| Requisitos relacionados | `RF-CAT-022`, `RN-001`, `RN-006`. |

Familia: [objetivos y realización](index.md).

## Diagramas de realización

- [2. Consulta y guardado de registros](../../../architecture/views/processes/02-shared-runtime/01-list-and-record-save.md).
