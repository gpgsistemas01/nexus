# `CU-IDA-06` — Crear usuario y asignar acceso

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-IDA-06` |
| Nombre | Crear usuario y asignar acceso. |
| Actor | Administrador del sistema. |
| Disparador | Selecciona la acción principal para crear un usuario desde `CU-IDA-05` Consultar usuarios. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de alta.<br>3. Existen los datos relacionados requeridos para completar el registro. |
| Flujo principal | 1. **Actor:** abre la opción para crear usuario y asignar acceso **(ver E1)**.<br>2. **Nexus:** muestra el formulario con Usuario, Contraseña, Área y Rol.<br>3. **Actor:** captura los datos de la cuenta, selecciona el área y el rol que determinan su acceso y pulsa **Guardar** **(ver A1)**.<br>4. **Nexus:** valida autorización, obligatoriedad, formato, identidad y relaciones; registra el usuario y su asignación de acceso, actualiza el listado y muestra la confirmación **(ver EOP)**. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** señala los campos que no cumplen las reglas y conserva la captura sin guardar cambios.<br>2. **Actor:** corrige los campos y pulsa **Guardar**; continúa en el paso 4 del flujo principal. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1 o durante el paso 4):**<br>1. **Nexus:** rechaza la solicitud, comunica el motivo y no presenta información ni ejecuta cambios fuera de la autorización del actor; termina el caso de uso.<br>**EOP — Operación no confirmada (durante el paso 4):**<br>1. **Nexus:** comunica que no pudo confirmar el resultado y no anuncia éxito; conserva la captura cuando el formulario sigue disponible. Termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Alta conjunta de cuenta y asignación.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-IAM-004`. |

Familia: [objetivos y realización](index.md).

## Diagramas de realización

- [Cuenta, edición y contraseña](../../../architecture/views/processes/04-identity/02-user-account.md).
