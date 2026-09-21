# `CU-IDA-08` — Cambiar contraseña de usuario

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-IDA-08` |
| Nombre | Cambiar contraseña de usuario. |
| Actor | Administrador del sistema. |
| Disparador | Necesita renovar la credencial de una cuenta y abre la edición de contraseña. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de cambio de credencial.<br>3. La cuenta objetivo existe. |
| Flujo principal | 1. **Actor:** selecciona un usuario y abre «Editar contraseña» **(ver E1)**.<br>2. **Nexus:** muestra el formulario de nueva contraseña sin exponer la credencial actual.<br>3. **Actor:** captura y confirma la nueva contraseña **(ver A1)**.<br>4. **Nexus:** valida la credencial, la cifra y reemplaza el valor anterior; cierra el formulario y confirma la actualización. Además, guarda los cambios de la operación en la base de datos **(ver EBD)**. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** valida la información capturada, detecta campos incompletos, formatos incorrectos, relaciones no permitidas o cantidades fuera de las reglas del caso y los señala sin registrar cambios.<br>2. **Actor:** corrige la información indicada y vuelve a confirmar; continúa en el paso 4 del flujo principal. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso.<br>**EBD — Error de base de datos o de conexión (durante el paso 4 del flujo principal):**<br>1. **Nexus:** detecta que no puede consultar o guardar la información, revierte cualquier cambio parcial y comunica que la operación no se completó.<br>2. **Actor:** recibe el aviso, conserva los datos capturados cuando existe un formulario y decide reintentar más tarde o terminar el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Actualización cifrada de la credencial.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-IAM-006`. |
