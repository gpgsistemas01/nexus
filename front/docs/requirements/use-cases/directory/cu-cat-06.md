# `CU-CAT-06` — Crear cliente

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-06` |
| Nombre | Crear cliente. |
| Actor | Personal de almacén o Administrador del sistema. |
| Relaciones entre casos | Extiende `CU-CAT-05` en **Acciones sobre los resultados** (después del paso 4, flujo A4) bajo la condición: elección del Administrador del sistema desde el listado independiente y permiso de alta. Al completar o cancelar la operación retorna al paso 5 de la consulta. Extiende `CU-SAL-02`, `CU-SAL-09` y `CU-SAL-16` en la selección de cliente del alta, y `CU-SAL-03`, `CU-SAL-10` y `CU-SAL-17` en la selección editable del encabezado (paso 3). Requiere permiso de alta; al confirmar, devuelve el cliente seleccionado. |
| Disparador | Selecciona **Nuevo cliente** desde `CU-CAT-05` Consultar clientes o pulsa **Registrar cliente** desde el selector de una salida autorizada. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con los permisos de lectura y alta.<br>3. Si pertenece a Almacén, tiene abierta una salida con selección editable de cliente; la página independiente corresponde a Sistemas. |
| Flujo principal | 1. **Actor:** desde Sistemas selecciona **Nuevo cliente** en el listado, o desde una salida autorizada busca en **Cliente** y pulsa **Registrar cliente** cuando no encuentra el registro **(ver E1)**.<br>2. **Nexus:** muestra el mismo formulario reutilizable con el cliente inicialmente activo.<br>3. **Actor:** captura el nombre, revisa la casilla **Activo** y confirma **(ver A1)**.<br>4. **Nexus:** comprueba que la información sea válida; registra el cliente y muestra la confirmación. Si el origen fue el listado de Sistemas, lo actualiza; si fue el selector de una salida, agrega y selecciona el cliente creado sin conceder acceso al listado independiente **(ver EOP)**. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** valida la información capturada, detecta datos incompletos o que no cumplen las reglas del caso y señala qué debe corregirse, sin registrar cambios.<br>2. **Actor:** corrige la información indicada y vuelve a confirmar; continúa en el paso 4 del flujo principal. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso.<br>**EOP — Operación no completada (durante el paso 4 del flujo principal):**<br>1. **Nexus:** no puede completar la operación, comunica el fallo y conserva la información anterior sin cambios parciales.<br>2. **Actor:** recibe el aviso, conserva los datos capturados cuando existe un formulario y decide reintentar más tarde o terminar el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** El cliente queda registrado con el estado elegido.<br>2. **Éxito contextual:** Si el alta comenzó en una salida, el cliente queda seleccionado en ese formulario y el actor no obtiene acceso a la vista independiente.<br>3. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-CAT-013`. |

Familia: [objetivos y realización](index.md).

## Diagramas de realización

- [Directorio: alta, edición y retorno de opción](../../../architecture/views/processes/03-catalogs-and-directory/02-directory-save.md).
