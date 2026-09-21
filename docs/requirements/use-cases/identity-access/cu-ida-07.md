# `CU-IDA-07` — Editar usuario y acceso

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-IDA-07` |
| Nombre | Editar usuario y acceso. |
| Actor | Administrador del sistema. |
| Disparador | Detecta datos que debe corregir en una cuenta o su acceso y selecciona **Editar registro** en `CU-IDA-05` Consultar usuarios. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de edición.<br>3. El registro objetivo existe.<br>4. El registro se encuentra en un estado que admite los cambios solicitados. |
| Flujo principal | 1. **Nexus:** abre la edición de la cuenta y su acceso **(ver E1)**; muestra los valores actuales y habilita sólo los campos permitidos.<br>2. **Actor:** modifica los datos admitidos y selecciona **Actualizar** **(ver A1)**.<br>3. **Nexus:** valida autorización, formato, identidad y relaciones; guarda los cambios, actualiza el listado y muestra la confirmación. Además, guarda los cambios de la operación en la base de datos **(ver EBD)**. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** valida la información capturada, detecta campos incompletos, formatos incorrectos, relaciones no permitidas o cantidades fuera de las reglas del caso y los señala sin registrar cambios.<br>2. **Actor:** corrige la información indicada y vuelve a confirmar; continúa en el paso 1 del flujo principal. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso.<br>**EBD — Error de base de datos o de conexión (durante el paso 3 del flujo principal):**<br>1. **Nexus:** detecta que no puede consultar o guardar la información, revierte cualquier cambio parcial y comunica que la operación no se completó.<br>2. **Actor:** recibe el aviso, conserva los datos capturados cuando existe un formulario y decide reintentar más tarde o terminar el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Actualización transaccional de cuenta y asignación.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-IAM-005`. |
