# `CU-ENT-11` — Cancelar consumible de una compra

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ENT-11` |
| Nombre | Cancelar consumible de una compra. |
| Actor | Personal de almacén o Administrador del sistema. |
| Disparador | Determina que debe anular consumible de una compra y solicita la cancelación. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso operativo.<br>3. La compra y el detalle activo existen.<br>4. El detalle se encuentra en un estado que admite cancelación. |
| Flujo principal | 1. **Actor:** selecciona un detalle activo y solicita cancelarlo **(ver E1)**.<br>2. **Nexus:** identifica el detalle y solicita confirmación.<br>3. **Actor:** pulsa **Cancelar detalle** en la confirmación **(ver A1)**.<br>4. **Nexus:** valida que el detalle siga activo y que la existencia recibida pueda revertirse **(ver E2)**; cancela el detalle, revierte existencia, movimiento y totales y confirma el resultado **(ver EOP)**. |
| Flujos alternativos | **A1 — Conservar el detalle (durante el paso 3):**<br>1. **Actor:** descarta la confirmación.<br>2. **Nexus:** cierra la solicitud y conserva el detalle, la existencia y los totales sin cambios; termina el caso de uso. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1 o durante el paso 4):**<br>1. **Nexus:** rechaza la solicitud, comunica el motivo y no presenta información ni ejecuta cambios fuera de la autorización del actor; termina el caso de uso.<br>**E2 — Detalle no cancelable o existencia insuficiente (durante el paso 4):**<br>1. **Nexus:** informa que el detalle no es cancelable o que falta existencia para revertirlo; conserva detalle, documento, existencia, movimientos y totales sin cambios parciales; termina el caso de uso.<br>**EOP — Operación no confirmada (durante el paso 4):**<br>1. **Nexus:** comunica que no pudo confirmar el resultado y no anuncia éxito; conserva la captura cuando el formulario sigue disponible. Termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** El detalle queda cancelado.<br>2. **Éxito:** La existencia recibida por el detalle queda revertida.<br>3. **Éxito:** El movimiento y los totales reflejan la cancelación.<br>4. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-REC-008`, `RN-002`, `RN-012`, `RN-017`. |

Familia: [objetivos y realización](index.md).

## Diagramas de realización

- [Compra: cancelación y reintento explícito](../../../architecture/views/processes/06-purchases/04-purchase-cancel.md).
