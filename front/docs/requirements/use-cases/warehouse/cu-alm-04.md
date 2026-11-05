# `CU-ALM-04` — Retirar material

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ALM-04` |
| Nombre | Retirar material. |
| Actor | Personal de almacén o Administrador del sistema. |
| Disparador | Determina que debe retirar material y solicita la eliminación. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de retiro.<br>3. El recurso objetivo existe.<br>4. El recurso se encuentra en un estado que permite retirarlo. |
| Flujo principal | 1. **Actor:** selecciona un material y solicita retirarlo **(ver E1)**.<br>2. **Nexus:** identifica el material y solicita confirmar la eliminación.<br>3. **Actor:** pulsa **Confirmar eliminación** **(ver A2)**.<br>4. **Nexus:** comprueba si el material tiene historia protegida o relaciones con proveedores **(ver A1)**; elimina la relación proveedor-material y, cuando no quedan otras relaciones ni historia protegida, elimina también la identidad del material; después actualiza el listado y confirma el retiro **(ver EOP)**. |
| Flujos alternativos | **A1 — Historia o relaciones protegidas (durante el paso 4):**<br>1. **Nexus:** informa el motivo del rechazo y conserva el artículo, sus ofertas, existencia e historia sin cambios parciales; termina el caso de uso.<br>**A2 — Cancelar el retiro (en el paso 3):**<br>1. **Actor:** pulsa **Cancelar** en la confirmación.<br>2. **Nexus:** cierra el aviso y conserva el material, la oferta y la existencia; termina el caso de uso. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1 o durante el paso 4):**<br>1. **Nexus:** rechaza la solicitud, comunica el motivo y no presenta información ni ejecuta cambios fuera de la autorización del actor; termina el caso de uso.<br>**EOP — Operación no confirmada (durante el paso 4):**<br>1. **Nexus:** comunica que no pudo confirmar el resultado y no anuncia éxito; conserva la captura cuando el formulario sigue disponible. Termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La relación seleccionada deja de estar disponible y la identidad sólo se elimina si no conserva otras relaciones ni historia protegida.<br>2. **Fallo:** Ante un rechazo, la identidad, las relaciones, la existencia y la historia permanecen sin cambios; no se produce un retiro parcial ni se expone información no autorizada. |
| Requisitos relacionados | `RF-CAT-008`, `RN-007`. |

Familia: [objetivos y realización](index.md).

## Diagramas de realización

- [Selección dependiente y escritura de inventario](../../../architecture/views/processes/05-warehouse/01-inventory-selection-write.md).
