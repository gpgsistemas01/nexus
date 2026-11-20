# `CU-ALM-04` — Retirar oferta de material

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ALM-04` |
| Nombre | Retirar oferta de material. |
| Actor | Personal de almacén o Administrador del sistema. |
| Disparador | Solicita retirar una oferta de proveedor desde Existencias de materiales. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de retiro.<br>3. El recurso objetivo existe.<br>4. El recurso se encuentra en un estado que permite retirarlo. |
| Flujo principal | 1. **Actor:** selecciona **Eliminar** en una oferta cuyo stock es cero y sin compras, salidas ni otros registros de inventario **(ver E1)**.<br>2. **Nexus:** muestra el proveedor y advierte que sólo retirará la oferta; conserva el artículo y los documentos históricos.<br>3. **Actor:** pulsa **Confirmar eliminación** **(ver A1)**.<br>4. **Nexus:** comprueba que la oferta existe, que su stock es cero y que no hay registros de inventario para ese artículo y proveedor; elimina sólo la relación proveedor-artículo, actualiza el listado y confirma **(ver E2, E3 y EOP)**. |
| Flujos alternativos | **A1 — Cancelar el retiro (en el paso 3):**<br>1. **Actor:** pulsa **Cancelar** en la confirmación.<br>2. **Nexus:** cierra el aviso y conserva el artículo, la oferta y la existencia; termina el caso de uso. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1 o durante el paso 4):**<br>1. **Nexus:** rechaza la solicitud, comunica el motivo y no presenta información ni ejecuta cambios fuera de la autorización del actor; termina el caso de uso.<br>**E2 — Existencia distinta de cero (durante el paso 4):**<br>1. **Nexus:** rechaza el retiro porque la oferta aún tiene saldo; conserva el artículo, la oferta y el historial.<br>**E3 — Existe historial (durante el paso 4):**<br>1. **Nexus:** rechaza el retiro y permite desactivar la oferta desde **Editar existencia**.<br>**EOP — Operación no confirmada (durante el paso 4):**<br>1. **Nexus:** comunica que no pudo confirmar el resultado y no anuncia éxito; conserva la captura cuando el formulario sigue disponible. Termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** la oferta deja de estar disponible; la identidad del artículo y sus documentos históricos se conservan, incluso al retirar la última oferta.<br>2. **Fallo:** ante un rechazo, artículo, oferta, existencia e historia permanecen sin cambios. |
| Requisitos relacionados | `RF-CAT-008`, `RN-007`. |

Familia: [objetivos y realización](index.md).

## Diagramas de realización

- [Selección dependiente y escritura de inventario](../../../architecture/views/processes/05-warehouse/01-inventory-selection-write.md).
