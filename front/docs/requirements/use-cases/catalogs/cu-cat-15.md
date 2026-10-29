# `CU-CAT-15` — Consultar presentación

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-15` |
| Nombre | Consultar presentación. |
| Actor | Administrador del sistema del área Sistemas. |
| Disparador | Selecciona **Presentaciones** en el submenú **Catálogos auxiliares**. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor tiene autorización para administrar catálogos y pertenece al contexto administrativo autorizado. |
| Flujo principal | 1. **Actor:** selecciona **Presentaciones** en el submenú **Catálogos auxiliares** **(ver E1)**.<br>2. **Nexus:** comprueba la autorización del actor para consultar Presentaciones y muestra su tabla **(ver EOP)**; presenta **Nueva presentación** como acción opcional para registrar una presentación. **(ver A1)**<br>3. **Actor:** revisa los resultados y finaliza la consulta sin necesidad de crear, modificar ni exportar registros. |
| Flujos alternativos | **A1 — Cambiar los criterios de consulta (después del paso 2):**<br>1. **Actor:** cambia la búsqueda, los filtros, el orden o la página mediante los controles disponibles.<br>2. **Nexus:** actualiza los resultados autorizados sin modificar registros; continúa en el paso 3 del flujo principal. |
| Acciones de la pantalla | **Editar registro** en el registro seleccionado: [CU-CAT-17](cu-cat-17.md)<br>**Nueva presentación**: [CU-CAT-16](cu-cat-16.md) |
| Excepciones | **E1 — Acceso, recurso o entrada rechazados (después del paso 1):**<br>1. **Nexus:** rechaza la operación sin exponer otro catálogo ni producir cambios parciales.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso.<br>**EOP — Operación no completada (durante el paso 2 del flujo principal):**<br>1. **Nexus:** detecta que no puede obtener la información necesaria, comunica que la consulta no se completó y no modifica datos.<br>2. **Actor:** recibe el aviso y decide reintentar más tarde o terminar el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La tabla muestra exclusivamente las entradas de Presentaciones.<br>2. **Fallo:** No se exponen datos ni modelos no autorizados.<br>**Alcance:** esta consulta no modifica registros. |
| Requisitos relacionados | `RF-CAT-022`, `RN-001`, `RN-006`. |

Familia: [objetivos y realización](index.md).

## Diagramas de realización

- [2. Consulta y guardado de registros](../../../architecture/views/processes/02-shared-runtime/01-list-and-record-save.md).
