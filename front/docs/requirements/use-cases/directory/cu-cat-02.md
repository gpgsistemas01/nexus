# `CU-CAT-02` — Crear proveedor

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-02` |
| Nombre | Crear proveedor. |
| Actor | Personal de almacén o Administrador del sistema. |
| Relaciones entre casos | Extiende `CU-ENT-02` y `CU-ENT-08` en su selección de proveedor (paso 3, A6), y `CU-ALM-02`/`CU-ALM-18` en la selección de proveedor (paso 3, A4), si el actor tiene permiso de alta. Reanuda la captura y selecciona el proveedor creado sólo si está activo. El alta desde `CU-CAT-01` corresponde al listado independiente de Sistemas. |
| Disparador | Selecciona **Nuevo proveedor** desde `CU-CAT-01` Consultar proveedores con acceso de Sistemas, o pulsa **Registrar proveedor** desde el selector de una operación autorizada. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con los permisos de lectura y alta.<br>3. Si pertenece a Almacén, tiene abierta una operación que permite registrar proveedores desde su selector; la página independiente corresponde a Sistemas. |
| Flujo principal | 1. **Actor:** desde Sistemas selecciona **Nuevo proveedor** en el listado, o desde una operación autorizada busca en **Proveedor** y pulsa **Registrar proveedor** cuando no encuentra el registro **(ver E1)**.<br>2. **Nexus:** muestra el mismo formulario reutilizable con la casilla **Activo** seleccionada inicialmente.<br>3. **Actor:** captura razón social y nombre comercial, revisa el estado y selecciona **Guardar** **(ver A1)**.<br>4. **Nexus:** valida la información capturada; registra el proveedor y muestra la confirmación. Si el origen fue el listado de Sistemas, lo actualiza; si fue un selector operativo, agrega y selecciona el proveedor creado si está activo **(ver A2)** sin conceder acceso al listado independiente **(ver EOP)**. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** señala los campos que no cumplen las reglas y conserva la captura sin guardar cambios.<br>2. **Actor:** corrige los campos y pulsa **Guardar**; continúa en el paso 4 del flujo principal.<br>**A2 — Alta inactiva desde un selector (durante el retorno del paso 4):**<br>1. **Nexus:** conserva el proveedor creado como inactivo, retoma el formulario principal e informa que no puede seleccionarlo para una operación nueva; mantiene la selección previa. Termina el alta y devuelve el control al punto de selección de su caso de origen. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1 o durante el paso 4):**<br>1. **Nexus:** rechaza la solicitud, comunica el motivo y no presenta información ni ejecuta cambios fuera de la autorización del actor; termina el caso de uso.<br>**EOP — Operación no confirmada (durante el paso 4):**<br>1. **Nexus:** comunica que no pudo confirmar el resultado y no anuncia éxito; conserva la captura cuando el formulario sigue disponible. Termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** El proveedor queda registrado con los datos y el estado elegidos.<br>2. **Éxito contextual:** Si el alta comenzó en un selector operativo, el proveedor activo queda seleccionado en el formulario de origen; si se creó inactivo, se conserva la selección previa. El alta no concede acceso a la vista independiente.<br>3. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-CAT-010`. |

Familia: [objetivos y realización](index.md).

## Diagramas de realización

- [Directorio: alta, edición y retorno de opción](../../../architecture/views/processes/03-catalogs-and-directory/02-directory-save.md).
