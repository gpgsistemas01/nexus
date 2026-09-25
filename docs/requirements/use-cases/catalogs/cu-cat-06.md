# `CU-CAT-06` — Crear cliente

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-06` |
| Nombre | Crear cliente. |
| Actor | Personal de almacén o Administrador del sistema. |
| Disparador | Selecciona **Nuevo cliente** desde `CU-CAT-05` Consultar clientes o desde el selector de cliente de una salida autorizada. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de alta.<br>3. Existen los datos relacionados requeridos para completar el registro. |
| Flujo principal | 1. **Actor:** selecciona **Nuevo cliente** desde el listado independiente o desde el selector de una salida **(ver E1)**.<br>2. **Nexus:** muestra el mismo formulario reutilizable con el cliente inicialmente activo.<br>3. **Actor:** captura el nombre, revisa la casilla **Activo** y confirma **(ver A1)**.<br>4. **Nexus:** comprueba que la información sea válida; registra el cliente y muestra la confirmación. Si el origen fue el listado de Sistemas, lo actualiza; si fue el selector de una salida, agrega y selecciona el cliente creado sin conceder acceso al listado independiente. Además, guarda los cambios de la operación en la base de datos **(ver EBD)**. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** valida la información capturada, detecta campos incompletos, formatos incorrectos, relaciones no permitidas o cantidades fuera de las reglas del caso y los señala sin registrar cambios.<br>2. **Actor:** corrige la información indicada y vuelve a confirmar; continúa en el paso 4 del flujo principal. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso.<br>**EBD — Error de base de datos o de conexión (durante el paso 4 del flujo principal):**<br>1. **Nexus:** detecta que no puede consultar o guardar la información, revierte cualquier cambio parcial y comunica que la operación no se completó.<br>2. **Actor:** recibe el aviso, conserva los datos capturados cuando existe un formulario y decide reintentar más tarde o terminar el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** El cliente queda registrado con el estado elegido.<br>2. **Éxito contextual:** Si el alta comenzó en una salida, el cliente queda seleccionado en ese formulario y el actor no obtiene acceso a la vista independiente.<br>3. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-CAT-013`. |
