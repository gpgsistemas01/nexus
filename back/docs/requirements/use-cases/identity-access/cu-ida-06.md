# `CU-IDA-06` — Crear usuario y asignar acceso

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-IDA-06` |
| Nombre | Crear usuario y asignar acceso. |
| Actor | Administrador del sistema. |
| Disparador | Selecciona la acción principal para crear un usuario desde `CU-IDA-05` Consultar usuarios. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de alta.<br>3. Existen los datos relacionados requeridos para completar el registro. |
| Flujo principal | 1. **Actor:** abre la opción para crear usuario y asignar acceso **(ver E1)**.<br>2. **Nexus:** muestra el formulario con nombre de usuario, contraseña, persona asociada cuando corresponde, área, rol y estado activo.<br>3. **Actor:** captura los datos de la cuenta, selecciona el área y el rol que determinan su acceso y confirma **(ver A1)**.<br>4. **Nexus:** valida autorización, obligatoriedad, formato, identidad y relaciones; registra el usuario y su asignación de acceso, actualiza el listado y muestra la confirmación **(ver EOP)**. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** valida la información capturada, detecta datos incompletos o que no cumplen las reglas del caso y señala qué debe corregirse, sin registrar cambios.<br>2. **Actor:** corrige la información indicada y vuelve a confirmar; continúa en el paso 4 del flujo principal. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso.<br>**EOP — Operación no completada (durante el paso 4 del flujo principal):**<br>1. **Nexus:** no puede completar la operación, comunica el fallo y conserva la información anterior sin cambios parciales.<br>2. **Actor:** recibe el aviso, conserva los datos capturados cuando existe un formulario y decide reintentar más tarde o terminar el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Alta conjunta de cuenta y asignación.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-IAM-004`. |
