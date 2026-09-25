# `CU-CAT-02` — Crear proveedor

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-02` |
| Nombre | Crear proveedor. |
| Actor | Personal de almacén o Administrador del sistema. |
| Disparador | Selecciona **Nuevo proveedor** desde `CU-CAT-01` Consultar proveedores o desde el selector de proveedor de una operación autorizada. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de alta. |
| Flujo principal | 1. **Actor:** selecciona **Nuevo proveedor** desde el listado independiente o desde un selector operativo **(ver E1)**.<br>2. **Nexus:** muestra el mismo formulario reutilizable con la casilla **Activo** seleccionada inicialmente.<br>3. **Actor:** captura razón social, nombre comercial y teléfono, revisa el estado y selecciona **Guardar** **(ver A1)**.<br>4. **Nexus:** valida que la información sea válida; registra el proveedor y muestra la confirmación. Si el origen fue el listado de Sistemas, lo actualiza; si fue un selector operativo, agrega y selecciona el proveedor creado sin conceder acceso al listado independiente. Además, guarda los cambios de la operación en la base de datos **(ver EBD)**. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** valida la información capturada, detecta campos incompletos, formatos incorrectos, relaciones no permitidas o cantidades fuera de las reglas del caso y los señala sin registrar cambios.<br>2. **Actor:** corrige la información indicada y vuelve a confirmar; continúa en el paso 4 del flujo principal. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso.<br>**EBD — Error de base de datos o de conexión (durante el paso 4 del flujo principal):**<br>1. **Nexus:** detecta que no puede consultar o guardar la información, revierte cualquier cambio parcial y comunica que la operación no se completó.<br>2. **Actor:** recibe el aviso, conserva los datos capturados cuando existe un formulario y decide reintentar más tarde o terminar el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** El proveedor queda registrado con los datos y el estado elegidos.<br>2. **Éxito contextual:** Si el alta comenzó en un selector operativo, el proveedor queda seleccionado en el formulario de origen y el actor no obtiene acceso a la vista independiente.<br>3. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-CAT-010`. |
