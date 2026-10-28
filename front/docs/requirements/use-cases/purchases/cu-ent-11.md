# `CU-ENT-11` — Cancelar consumible de una compra

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ENT-11` |
| Nombre | Cancelar consumible de una compra. |
| Actor | Personal de almacén o Administrador del sistema. |
| Disparador | Determina que debe anular consumible de una compra y solicita la cancelación. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso operativo.<br>3. La compra y el detalle activo existen.<br>4. El detalle se encuentra en un estado que admite cancelación. |
| Flujo principal | 1. **Actor:** selecciona un detalle activo y solicita cancelarlo **(ver E1)**.<br>2. **Nexus:** identifica el detalle y solicita confirmación.<br>3. **Actor:** confirma la cancelación.<br>4. **Nexus:** valida que el detalle siga activo y que la existencia recibida pueda revertirse **(ver E2)**; cancela el detalle, revierte existencia, movimiento y totales y confirma el resultado **(ver EOP)**. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso.<br>**E2 — Detalle no cancelable o existencia insuficiente (después del paso 4):**<br>1. **Actor:** revisa el estado vigente del detalle o la existencia insuficiente que Nexus informa.<br>2. **Nexus:** rechaza la cancelación y conserva sin cambios el detalle, la existencia, el movimiento y los totales; termina el caso de uso.<br>**EOP — Operación no completada (durante el paso 4 del flujo principal):**<br>1. **Nexus:** no puede completar la operación, comunica el fallo y conserva la información anterior sin cambios parciales.<br>2. **Actor:** recibe el aviso, conserva los datos capturados cuando existe un formulario y decide reintentar más tarde o terminar el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** El detalle queda cancelado.<br>2. **Éxito:** La existencia recibida por el detalle queda revertida.<br>3. **Éxito:** El movimiento y los totales reflejan la cancelación.<br>4. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-REC-008`, `RN-002`, `RN-012`, `RN-017`. |

## Realización y verificación del cliente

La [guía de realización Vue](../../../architecture/views/development/frontend-technical-documentation/06-purchases.md) describe captura, permisos de interfaz, contratos y propietarios del estado. La [cobertura por caso](../../../testing/04-use-case-coverage.md) identifica la evidencia y sus límites. Las pruebas de navegador de esta familia están en `purchases.spec.ts`; la existencia del archivo no acredita por sí sola todos los pasos de esta ficha.

## Diagramas de realización

- [Compra: cancelación y reintento explícito](../../../architecture/views/processes/06-purchases/04-purchase-cancel.md).
