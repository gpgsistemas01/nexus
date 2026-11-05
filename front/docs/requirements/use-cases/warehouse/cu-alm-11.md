# `CU-ALM-11` — Editar merma

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ALM-11` |
| Nombre | Editar merma. |
| Actor | Personal de almacén o Administrador del sistema. |
| Disparador | Detecta datos que debe corregir en una merma y selecciona su acción de edición. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de edición.<br>3. El registro objetivo existe.<br>4. El registro se encuentra en un estado que admite los cambios solicitados. |
| Flujo principal | 1. **Actor:** selecciona merma y abre la edición **(ver E1)**.<br>2. **Nexus:** muestra proveedor, referencia, presentación, unidad, dimensiones y pesos en consulta; habilita Nombre, Stock mínimo, Costo máximo y Activo.<br>3. **Actor:** modifica los campos habilitados y pulsa **Guardar** **(ver A1)**.<br>4. **Nexus:** valida autorización, formato, identidad y relaciones; guarda los cambios, actualiza el listado y muestra la confirmación **(ver EOP)** **(ver E2)**. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** señala los campos que no cumplen las reglas y conserva la captura sin guardar cambios.<br>2. **Actor:** corrige los campos y pulsa **Guardar**; continúa en el paso 4 del flujo principal. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1 o durante el paso 4):**<br>1. **Nexus:** rechaza la solicitud, comunica el motivo y no presenta información ni ejecuta cambios fuera de la autorización del actor; termina el caso de uso.<br>**EOP — Operación no confirmada (durante el paso 4):**<br>1. **Nexus:** comunica que no pudo confirmar el resultado y no anuncia éxito; conserva la captura cuando el formulario sigue disponible. Termina el caso de uso.<br>**E2 — El registro cambió durante la captura (durante el paso 4):**<br>1. **Nexus:** rechaza el guardado por versión desactualizada, conserva la captura sin sobrescribir los datos vigentes y bloquea otro envío; muestra **Cerrar y actualizar inventario**.<br>2. **Actor:** pulsa **Cerrar y actualizar inventario** para consultar el estado vigente.<br>3. **Nexus:** cierra el formulario y actualiza la consulta; termina el caso de uso. Una nueva edición comienza desde el paso 1 con el registro actualizado. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Actualización sin alterar su identidad física.<br>2. **Éxito al desactivar:** la merma no puede agregarse a salidas nuevas; conserva stock e historia y puede completar detalles previamente comprometidos.<br>3. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-MER-011`, `RF-CAT-016`, `RF-CAT-017`, `RF-MER-003`, `RF-MER-005`, `RF-MER-006`, `RN-021`, `RN-023`. |

Los pesos del cono, total con cono y neto se muestran para consulta; no forman parte de los cambios admitidos (`RF-MER-011`).

Familia: [objetivos y realización](index.md).

## Diagramas de realización

- [Selección dependiente y escritura de inventario](../../../architecture/views/processes/05-warehouse/01-inventory-selection-write.md).
