# `CU-ENT-05` — Cancelar material de una compra

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ENT-05` |
| Nombre | Cancelar material de una compra. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** determina que debe anular material de una compra y solicita la cancelación. |
| Participación de actor y sistema | **Actor:** selecciona el detalle y confirma la cancelación.<br>**Nexus:** valida y coordina la cancelación, la existencia, el movimiento y los totales. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso operativo.<br>3. La compra y el detalle activo existen.<br>4. El detalle se encuentra en un estado que admite cancelación. |
| Flujo principal | 1. **Actor:** selecciona un detalle activo y solicita cancelarlo **(ver E1)**.<br>2. **Nexus:** identifica el detalle y solicita confirmación.<br>3. **Actor:** confirma la cancelación.<br>4. **Nexus:** valida que el detalle siga activo y que la existencia recibida pueda revertirse **(ver E2)**.<br>5. **Nexus:** cancela el detalle, revierte existencia, movimiento y totales y confirma el resultado. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso.<br>**E2 — Detalle no cancelable o existencia insuficiente (después del paso 4):**<br>1. **Actor:** revisa el estado vigente del detalle o la existencia insuficiente que Nexus informa.<br>2. **Nexus:** rechaza la cancelación y conserva sin cambios el detalle, la existencia, el movimiento y los totales; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** El detalle queda cancelado.<br>2. **Éxito:** La existencia recibida por el detalle queda revertida.<br>3. **Éxito:** El movimiento y los totales reflejan la cancelación.<br>4. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-REC-008`, `RN-002`, `RN-012`, `RN-017`. |
