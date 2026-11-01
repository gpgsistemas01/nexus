# `CU-SAL-06` — Devolver material surtido

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-SAL-06` |
| Nombre | Devolver material surtido. |
| Actor | Personal de almacén o Administrador del sistema. |
| Disparador | Recibe de vuelta material surtido y abre la devolución del detalle. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso operativo.<br>3. La salida y el detalle existen.<br>4. La salida completa tiene cumplimiento `Surtido`.<br>5. El detalle conserva saldo entregado positivo. |
| Flujo principal | 1. **Actor:** abre una salida de material y selecciona un detalle surtido para devolverlo **(ver E1)**.<br>2. **Nexus:** muestra la cantidad que todavía puede devolverse.<br>3. **Actor:** captura la cantidad recibida de vuelta, registra las observaciones y selecciona «Devolver» **(ver A1)**.<br>4. **Nexus:** valida que la salida esté completamente surtida y que la cantidad positiva no exceda el saldo entregado; reintegra existencia, acumula la devolución, actualiza estados, registra el movimiento inverso y confirma **(ver EOP)**. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** señala los campos que no cumplen las reglas y conserva la captura sin guardar cambios.<br>2. **Actor:** corrige los campos y pulsa **Devolver**; continúa en el paso 4 del flujo principal. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1 o durante el paso 4):**<br>1. **Nexus:** rechaza la solicitud, comunica el motivo y no presenta información ni ejecuta cambios fuera de la autorización del actor; termina el caso de uso.<br>**EOP — Operación no confirmada (durante el paso 4):**<br>1. **Nexus:** comunica que no pudo confirmar el resultado y no anuncia éxito; conserva la captura cuando el formulario sigue disponible. Termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La existencia aumenta en la cantidad devuelta y el movimiento inverso queda registrado.<br>2. **Éxito, devolución parcial del detalle:** el detalle acumula la devolución y conserva el cumplimiento `Surtido`; no queda cancelado.<br>3. **Éxito, devolución total del detalle:** el detalle acumula la devolución y queda con cumplimiento `Cancelado`; no se ejecuta una acción adicional de cancelación.<br>4. **Éxito, agregación del encabezado:** sólo si todos los detalles tienen cumplimiento `Cancelado`, la salida queda con cumplimiento `Cancelado` y con estado documental `Cancelada`; mientras exista otro detalle no cancelado, el encabezado no se cancela.<br>5. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-ISS-003`, `RN-002`, `RN-011`, `RN-013`, `RN-014`, `RN-028`, `RN-029`. |

Familia: [objetivos y realización](index.md).

## Diagramas de realización

- [Salida: devolución por saldo leído](../../../architecture/views/processes/07-issues/03-issue-return.md).
