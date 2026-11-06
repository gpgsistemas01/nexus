# `CU-ALM-03` — Editar material

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ALM-03` |
| Nombre | Editar material. |
| Actor | Personal de almacén o Administrador del sistema. |
| Disparador | Detecta datos que debe corregir en un material y selecciona su acción de edición. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de edición.<br>3. El registro objetivo existe.<br>4. El registro se encuentra en un estado que admite los cambios solicitados. |
| Flujo principal | 1. **Actor:** selecciona material y abre la edición **(ver E1)**.<br>2. **Nexus:** muestra los valores actuales; bloquea proveedor, presentación, unidad y dimensiones, y habilita nombre, stock mínimo, costo máximo y estado de la oferta.<br>3. **Actor:** modifica los datos admitidos y pulsa **Actualizar** **(ver A1)**.<br>4. **Nexus:** valida autorización, formato, identidad y relaciones **(ver A2)**; actualiza los datos compartidos del material y el costo y estado de la oferta seleccionada, actualiza el listado y muestra la confirmación **(ver EOP)** **(ver E2)**. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** señala los campos que no cumplen las reglas y conserva la captura sin guardar cambios.<br>2. **Actor:** corrige los campos y pulsa **Actualizar**; continúa en el paso 4 del flujo principal.<br>**A2 — El nombre produce una identidad existente (durante el paso 4):**<br>1. **Nexus:** compara nombre, presentación, unidad y dimensiones; informa que la identidad ya existe y conserva el material, su oferta y la captura sin guardar cambios.<br>2. **Actor:** corrige el nombre y pulsa **Actualizar**; continúa en el paso 4 del flujo principal. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1 o durante el paso 4):**<br>1. **Nexus:** rechaza la solicitud, comunica el motivo y no presenta información ni ejecuta cambios fuera de la autorización del actor; termina el caso de uso.<br>**EOP — Operación no confirmada (durante el paso 4):**<br>1. **Nexus:** comunica que no pudo confirmar el resultado y no anuncia éxito; conserva la captura cuando el formulario sigue disponible. Termina el caso de uso.<br>**E2 — El registro cambió durante la captura (durante el paso 4):**<br>1. **Nexus:** rechaza el guardado por versión desactualizada, conserva la captura sin sobrescribir los datos vigentes y bloquea otro envío; muestra **Cerrar y actualizar inventario**.<br>2. **Actor:** pulsa **Cerrar y actualizar inventario** para consultar el estado vigente.<br>3. **Nexus:** cierra el formulario y actualiza la consulta; termina el caso de uso. Una nueva edición comienza desde el paso 1 con el registro actualizado. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** El nombre y stock mínimo compartidos se reflejan en todas las ofertas del material; el costo máximo y el estado cambian sólo en la oferta seleccionada.<br>2. **Éxito al desactivar:** la oferta conserva la identidad del material, relaciones, stock e historia; queda excluida de operaciones nuevas, pero los detalles de salidas ya comprometidos pueden terminar de surtirse.<br>3. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-CAT-007`, `RN-023`, `RN-024`, `RN-027`, `RN-030` a `RN-032`. |

Los pesos para registrar merma se capturan en Mermas.

Familia: [objetivos y realización](index.md).

## Diagramas de realización

- [Selección dependiente y escritura de inventario](../../../architecture/views/processes/05-warehouse/01-inventory-selection-write.md).
