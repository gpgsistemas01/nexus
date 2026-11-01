# `CU-IDA-03` — Editar persona

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-IDA-03` |
| Nombre | Editar persona. |
| Actor | Personal de almacén o Administrador del sistema. |
| Disparador | Detecta datos que debe corregir en una persona y selecciona su acción de edición. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de edición.<br>3. El registro objetivo existe.<br>4. El registro se encuentra en un estado que admite los cambios solicitados. |
| Flujo principal | 1. **Actor:** selecciona una persona y abre la edición **(ver E1)**.<br>2. **Nexus:** muestra el nombre y la tabla de responsabilidades actuales, con las acciones permitidas.<br>3. **Actor:** modifica el nombre, elimina una responsabilidad existente o selecciona un área y un rol y selecciona **Agregar** para incorporar una responsabilidad nueva **(ver A1)**.<br>4. **Nexus:** valida la responsabilidad nueva cuando corresponde y refleja la adición o eliminación en la tabla sin guardar todavía los cambios.<br>5. **Actor:** repite las operaciones necesarias, revisa las filas de la tabla y selecciona **Actualizar**.<br>6. **Nexus:** valida autorización, formato, identidad y todas las responsabilidades **(ver A2)**; guarda la persona y reemplaza sus asignaciones como una sola operación, actualiza el listado y muestra la confirmación **(ver EOP)** **(ver E2)**. |
| Flujos alternativos | **A1 — Área o rol inválidos o área repetida (después del paso 3):**<br>1. **Nexus:** señala la selección inválida o el área repetida y no agrega la responsabilidad a la tabla.<br>2. **Actor:** corrige la selección y pulsa **Agregar**; continúa en el paso 4 del flujo principal.<br>**A2 — Datos finales inválidos (durante el paso 6):**<br>1. **Nexus:** señala el nombre o las responsabilidades que deben corregirse y conserva el formulario y la tabla sin guardar cambios.<br>2. **Actor:** corrige el nombre o ajusta las filas mediante Área, Rol, **Agregar** y **Quitar asignación**; revisa la tabla y pulsa **Actualizar**; continúa en el paso 6 del flujo principal. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1 o durante el paso 6):**<br>1. **Nexus:** rechaza la solicitud, comunica el motivo y no presenta información ni ejecuta cambios fuera de la autorización del actor; termina el caso de uso.<br>**EOP — Operación no confirmada (durante el paso 6):**<br>1. **Nexus:** comunica que no pudo confirmar el resultado y no anuncia éxito; conserva la captura cuando el formulario sigue disponible. Termina el caso de uso.<br>**E2 — El registro cambió durante la captura (durante el paso 6):**<br>1. **Nexus:** rechaza el guardado por versión desactualizada, conserva la captura sin sobrescribir los datos vigentes y bloquea otro envío; muestra **Cerrar y actualizar listado**.<br>2. **Actor:** pulsa **Cerrar y actualizar listado** para consultar el estado vigente.<br>3. **Nexus:** cierra el formulario y actualiza la consulta; termina el caso de uso. Una nueva edición comienza desde el paso 1 con el registro actualizado. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Actualización de datos y asignaciones de persona.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-IAM-008`. |

Familia: [objetivos y realización](index.md).

## Diagramas de realización

- [Personas y responsabilidades](../../../architecture/views/processes/04-identity/01-person-responsibilities.md).
