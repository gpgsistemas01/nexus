# `CU-ALM-19` — Editar consumible

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ALM-19` |
| Nombre | Editar consumible. |
| Actor | Personal de almacén o Administrador del sistema. |
| Disparador | Selecciona **Editar** sobre una fila de `CU-ALM-17`. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor tiene autorización para mantener el catálogo de consumibles.<br>3. El consumible y la oferta seleccionada existen. |
| Flujo principal | 1. **Actor:** selecciona **Editar registro** sobre una oferta **(ver E1)**.<br>2. **Nexus:** comprueba que el artículo sea un consumible, carga nombre, stock mínimo, costo máximo y estado y mantiene proveedor, presentación, unidad, tipo y existencia fuera de edición.<br>3. **Actor:** modifica uno o más campos admitidos y pulsa **Guardar** **(ver A1)**.<br>4. **Nexus:** comprueba que los datos sean válidos y que el artículo siga clasificado como consumible; actualiza como una sola operación los campos compartidos de la identidad y los propios de la oferta seleccionada **(ver A2)** **(ver EOP)**; confirma, cierra el formulario y actualiza el listado de consumibles sin ajustar stock **(ver E2)**. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** señala los campos que no cumplen las reglas y conserva la captura sin guardar cambios.<br>2. **Actor:** corrige los campos y pulsa **Guardar**; continúa en el paso 4 del flujo principal.<br>**A2 — Identidad duplicada o recurso no válido (durante el paso 4):**<br>1. **Nexus:** informa el motivo del rechazo y conserva el artículo, sus ofertas, existencia e historia sin cambios parciales; termina el caso de uso. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1 o durante el paso 4):**<br>1. **Nexus:** rechaza la solicitud, comunica el motivo y no presenta información ni ejecuta cambios fuera de la autorización del actor; termina el caso de uso.<br>**EOP — Operación no confirmada (durante el paso 4):**<br>1. **Nexus:** comunica que no pudo confirmar el resultado y no anuncia éxito; conserva la captura cuando el formulario sigue disponible. Termina el caso de uso.<br>**E2 — El registro cambió durante la captura (durante el paso 4):**<br>1. **Nexus:** rechaza el guardado por versión desactualizada, conserva la captura sin sobrescribir los datos vigentes y bloquea otro envío; muestra **Cerrar y actualizar inventario**.<br>2. **Actor:** pulsa **Cerrar y actualizar inventario** para consultar el estado vigente.<br>3. **Nexus:** cierra el formulario y actualiza la consulta; termina el caso de uso. Una nueva edición comienza desde el paso 1 con el registro actualizado. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** se guardan sólo los cambios admitidos, sin modificar existencia ni tipo.<br>2. **Fallo:** no se producen cambios parciales. |
| Requisitos relacionados | `RF-CAT-027`, `RN-023`, `RN-027`, `RN-030`, `RN-031`, `RN-034`. |

Familia: [objetivos y realización](index.md).

## Diagramas de realización

- [Selección dependiente y escritura de inventario](../../../architecture/views/processes/05-warehouse/01-inventory-selection-write.md).
