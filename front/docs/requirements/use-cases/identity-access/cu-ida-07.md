# `CU-IDA-07` — Editar usuario y acceso

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-IDA-07` |
| Nombre | Editar usuario y acceso. |
| Actor | Administrador del sistema. |
| Disparador | Detecta datos que debe corregir en una cuenta o su acceso y selecciona **Editar registro** en `CU-IDA-05` Consultar usuarios. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de edición.<br>3. El registro objetivo existe.<br>4. El registro se encuentra en un estado que admite los cambios solicitados. |
| Flujo principal | 1. **Actor:** selecciona **Editar registro** sobre la cuenta **(ver E1)**.<br>2. **Nexus:** muestra Usuario, Área y Rol actuales; presenta Persona vinculada como consulta y mantiene la contraseña fuera de esta edición.<br>3. **Actor:** modifica los datos permitidos y pulsa **Actualizar** **(ver A1)**.<br>4. **Nexus:** valida autorización, formato, identidad y asignación; guarda los cambios, actualiza el listado y muestra la confirmación **(ver EOP)** **(ver E2)**. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** señala los campos que no cumplen las reglas y conserva la captura sin guardar cambios.<br>2. **Actor:** corrige los campos y pulsa **Actualizar**; continúa en el paso 4 del flujo principal. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1 o durante el paso 4):**<br>1. **Nexus:** rechaza la solicitud, comunica el motivo y no presenta información ni ejecuta cambios fuera de la autorización del actor; termina el caso de uso.<br>**EOP — Operación no confirmada (durante el paso 4):**<br>1. **Nexus:** comunica que no pudo confirmar el resultado y no anuncia éxito; conserva la captura cuando el formulario sigue disponible. Termina el caso de uso.<br>**E2 — El registro cambió durante la captura (durante el paso 4):**<br>1. **Nexus:** rechaza el guardado por versión desactualizada, conserva la captura sin sobrescribir los datos vigentes y bloquea otro envío; muestra **Cerrar y actualizar listado**.<br>2. **Actor:** pulsa **Cerrar y actualizar listado** para consultar el estado vigente.<br>3. **Nexus:** cierra el formulario y actualiza la consulta; termina el caso de uso. Una nueva edición comienza desde el paso 1 con el registro actualizado. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Actualización conjunta de cuenta y asignación.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-IAM-005`. |

Familia: [objetivos y realización](index.md).

## Diagramas de realización

- [Cuenta, edición y contraseña](../../../architecture/views/processes/04-identity/02-user-account.md).
