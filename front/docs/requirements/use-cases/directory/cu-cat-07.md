# `CU-CAT-07` — Editar cliente

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-07` |
| Nombre | Editar cliente. |
| Actor | Administrador del sistema. |
| Disparador | Detecta datos que debe corregir en un cliente y selecciona su acción de edición. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de edición.<br>3. El registro objetivo existe.<br>4. El registro se encuentra en un estado que admite los cambios solicitados. |
| Flujo principal | 1. **Actor:** selecciona cliente y abre la edición **(ver E1)**.<br>2. **Nexus:** muestra el nombre y el estado actuales.<br>3. **Actor:** modifica el nombre o la casilla **Activo** y pulsa **Actualizar** **(ver A1)**.<br>4. **Nexus:** comprueba que la información sea válida; guarda los cambios, actualiza el listado y muestra la confirmación **(ver EOP)** **(ver E2)**. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** señala los campos que no cumplen las reglas y conserva la captura sin guardar cambios.<br>2. **Actor:** corrige los campos y pulsa **Actualizar**; continúa en el paso 4 del flujo principal. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1 o durante el paso 4):**<br>1. **Nexus:** rechaza la solicitud, comunica el motivo y no presenta información ni ejecuta cambios fuera de la autorización del actor; termina el caso de uso.<br>**EOP — Operación no confirmada (durante el paso 4):**<br>1. **Nexus:** comunica que no pudo confirmar el resultado y no anuncia éxito; conserva la captura cuando el formulario sigue disponible. Termina el caso de uso.<br>**E2 — El registro cambió durante la captura (durante el paso 4):**<br>1. **Nexus:** rechaza el guardado por versión desactualizada, conserva la captura sin sobrescribir los datos vigentes y bloquea otro envío; muestra **Cerrar y actualizar listado**.<br>2. **Actor:** pulsa **Cerrar y actualizar listado** para consultar el estado vigente.<br>3. **Nexus:** cierra el formulario y actualiza la consulta; termina el caso de uso. Una nueva edición comienza desde el paso 1 con el registro actualizado. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** El cliente conserva el nombre y estado elegidos; si queda inactivo, ya no se ofrece en salidas nuevas y mantiene su historia.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-CAT-014`. |

Familia: [objetivos y realización](index.md).

## Diagramas de realización

- [Directorio: alta, edición y retorno de opción](../../../architecture/views/processes/03-catalogs-and-directory/02-directory-save.md).
