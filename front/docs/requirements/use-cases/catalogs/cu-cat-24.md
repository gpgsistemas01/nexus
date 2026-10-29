# `CU-CAT-24` — Consultar estado de cumplimiento

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-24` |
| Nombre | Consultar estado de cumplimiento. |
| Actor | Administrador del sistema del área Sistemas. |
| Disparador | Selecciona **Estados de cumplimiento** en el submenú **Catálogos auxiliares**. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor tiene autorización para administrar catálogos y pertenece al contexto administrativo autorizado. |
| Puntos de extensión | **Acciones sobre los resultados**, después del paso 2: `CU-CAT-26` (A2), `CU-CAT-25` (A3). Se activan por elección del actor con el permiso y las condiciones de su caso. El retorno normal es el paso 3; consultar no exige ejecutar ninguna extensión. |
| Flujo principal | 1. **Actor:** selecciona **Estados de cumplimiento** en el submenú **Catálogos auxiliares** **(ver E1)**.<br>2. **Nexus:** comprueba la autorización del actor para consultar Estados de cumplimiento y muestra su tabla **(ver EOP)**; presenta **Nuevo estado de cumplimiento** como acción opcional para registrar un estado de cumplimiento. **(ver A1)** **(ver A2)** **(ver A3)**<br>3. **Actor:** revisa los resultados y finaliza la consulta sin necesidad de crear, modificar ni exportar registros. |
| Flujos alternativos | **A1 — Cambiar los criterios de consulta (después del paso 2):**<br>1. **Actor:** cambia la búsqueda, los filtros, el orden o la página mediante los controles disponibles.<br>2. **Nexus:** actualiza los resultados autorizados sin modificar registros; continúa en el paso 3 del flujo principal.<br>**A2 — Editar estado de cumplimiento (después del paso 2):**<br>1. **Actor:** pulsa **Editar registro** en el registro seleccionado.<br>2. **Nexus:** comprueba precondiciones y autorización y ejecuta la extensión `CU-CAT-26`; al finalizar o cancelar, conserva la consulta, actualiza sus datos cuando corresponde y continúa en el paso 3 del flujo principal. Un rechazo que invalida el acceso sigue la excepción E1.<br>**A3 — Crear estado de cumplimiento (después del paso 2):**<br>1. **Actor:** pulsa **Nuevo estado de cumplimiento**.<br>2. **Nexus:** comprueba precondiciones y autorización y ejecuta la extensión `CU-CAT-25`; al finalizar o cancelar, conserva la consulta, actualiza sus datos cuando corresponde y continúa en el paso 3 del flujo principal. Un rechazo que invalida el acceso sigue la excepción E1. |
| Excepciones | **E1 — Acceso, recurso o entrada rechazados (después del paso 1):**<br>1. **Nexus:** rechaza la operación sin exponer otro catálogo ni producir cambios parciales.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso.<br>**EOP — Operación no completada (durante el paso 2 del flujo principal):**<br>1. **Nexus:** detecta que no puede obtener la información necesaria, comunica que la consulta no se completó y no modifica datos.<br>2. **Actor:** recibe el aviso y decide reintentar más tarde o terminar el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La tabla muestra exclusivamente las entradas de Estados de cumplimiento.<br>2. **Fallo:** No se exponen datos ni modelos no autorizados.<br>**Alcance:** la consulta por sí misma no cambia datos. Si se ejecuta una extensión de escritura, sus efectos se rigen por las postcondiciones de ese caso. |
| Requisitos relacionados | `RF-CAT-022`, `RN-001`, `RN-006`. |

Familia: [objetivos y realización](index.md).

## Diagramas de realización

- [2. Consulta y guardado de registros](../../../architecture/views/processes/02-shared-runtime/01-list-and-record-save.md).
