# `CU-CAT-06` — Crear cliente

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-06` |
| Nombre | Crear cliente. |
| Actor | Personal de almacén o Administrador del sistema. |
| Relaciones entre casos | Extiende `CU-SAL-02`, `CU-SAL-09` y `CU-SAL-16` en la selección de cliente del alta, y `CU-SAL-03`, `CU-SAL-10` y `CU-SAL-17` en la selección editable del encabezado (paso 3). Requiere permiso de alta; al confirmar, reanuda la selección de cliente y selecciona el registro creado sólo si está activo. |
| Disparador | Selecciona **Nuevo cliente** desde `CU-CAT-05` Consultar clientes o pulsa **Registrar cliente** desde el selector de una salida autorizada. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con los permisos de lectura y alta.<br>3. Si pertenece a Almacén, tiene abierta una salida con selección editable de cliente; la página independiente corresponde a Sistemas. |
| Flujo principal | 1. **Actor:** desde Sistemas selecciona **Nuevo cliente** en el listado, o desde una salida autorizada busca en **Cliente** y pulsa **Registrar cliente** cuando no encuentra el registro **(ver E1)**.<br>2. **Nexus:** muestra el mismo formulario reutilizable con el cliente inicialmente activo.<br>3. **Actor:** captura el nombre, revisa la casilla **Activo** y pulsa **Guardar** **(ver A1)**.<br>4. **Nexus:** comprueba que la información sea válida; registra el cliente y muestra la confirmación. Si el origen fue el listado de Sistemas, lo actualiza; si fue el selector de una salida, agrega y selecciona el cliente creado si está activo **(ver A2)** sin conceder acceso al listado independiente **(ver EOP)**. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** señala los campos que no cumplen las reglas y conserva la captura sin guardar cambios.<br>2. **Actor:** corrige los campos y pulsa **Guardar**; continúa en el paso 4 del flujo principal.<br>**A2 — Alta inactiva desde un selector (durante el retorno del paso 4):**<br>1. **Nexus:** conserva el cliente creado como inactivo, retoma el formulario principal e informa que no puede seleccionarlo para una operación nueva; mantiene la selección previa. Termina el alta y devuelve el control al punto de selección de su caso de origen. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1 o durante el paso 4):**<br>1. **Nexus:** rechaza la solicitud, comunica el motivo y no presenta información ni ejecuta cambios fuera de la autorización del actor; termina el caso de uso.<br>**EOP — Operación no confirmada (durante el paso 4):**<br>1. **Nexus:** comunica que no pudo confirmar el resultado y no anuncia éxito; conserva la captura cuando el formulario sigue disponible. Termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** El cliente queda registrado con el estado elegido.<br>2. **Éxito contextual:** Si el alta comenzó en una salida, el cliente activo queda seleccionado en ese formulario; si se creó inactivo, se conserva la selección previa. El alta no concede acceso a la vista independiente.<br>3. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-CAT-013`. |

Familia: [objetivos y realización](index.md).

## Diagramas de realización

- [Directorio: alta, edición y retorno de opción](../../../architecture/views/processes/03-catalogs-and-directory/02-directory-save.md).
