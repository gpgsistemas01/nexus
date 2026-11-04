# `CU-SAL-12` — Surtir merma

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-SAL-12` |
| Nombre | Surtir merma. |
| Actor | Personal de almacén o Administrador del sistema. |
| Disparador | Va a entregar merma de una solicitud pendiente y abre sus detalles. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso operativo.<br>3. La salida y el detalle existen.<br>4. El detalle conserva cantidad pendiente.<br>5. Hay existencia suficiente para surtir la cantidad solicitada. |
| Flujo principal | 1. **Actor:** abre los detalles de la salida de merma y selecciona un detalle pendiente **(ver E1)**.<br>2. **Nexus:** muestra la cantidad solicitada pendiente y la existencia disponible.<br>3. **Actor:** marca el detalle, captura **Cantidad a surtir** dentro del saldo pendiente y registra **Cantidad de proyecto** y pulsa **Surtir** **(ver A1)**.<br>4. **Nexus:** valida el estado, el detalle seleccionado y la cantidad de entrega y la existencia suficiente **(ver E2)**; admite completar un detalle histórico aunque el recurso se haya desactivado, sujeto a las demás comprobaciones; descuenta sólo la entrega indicada, acumula lo surtido, conserva el proyecto y su diferencia, y marca el detalle parcial o completo según corresponda, actualiza estados, registra el movimiento y confirma **(ver EOP)**. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** señala los campos que no cumplen las reglas y conserva la captura sin guardar cambios.<br>2. **Actor:** corrige los campos y pulsa **Surtir**; continúa en el paso 4 del flujo principal. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1 o durante el paso 4):**<br>1. **Nexus:** rechaza la solicitud, comunica el motivo y no presenta información ni ejecuta cambios fuera de la autorización del actor; termina el caso de uso.<br>**E2 — Existencia insuficiente o detalle ya atendido (durante el paso 4):**<br>1. **Nexus:** informa que la existencia es insuficiente o que el detalle ya fue atendido y rechaza el surtimiento; conserva documento, detalles, existencia y movimientos sin cambios parciales; termina el caso de uso.<br>**EOP — Operación no confirmada (durante el paso 4):**<br>1. **Nexus:** comunica que no pudo confirmar el resultado y no anuncia éxito; conserva la captura cuando el formulario sigue disponible. Termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La existencia disminuye en la cantidad surtida.<br>2. **Éxito:** El detalle acumula la cantidad surtida.<br>3. **Éxito:** Los estados de cumplimiento quedan actualizados.<br>4. **Éxito:** El movimiento de salida queda registrado.<br>5. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-WST-003`, `RF-MER-008`, `RN-002`, `RN-003`, `RN-011` a `RN-013`, `RN-015`, `RN-016`, `RN-020`, `RN-023`, `RN-033`. |

Familia: [objetivos y realización](index.md).

## Diagramas de realización

- [Salida: selección y surtido](../../../architecture/views/processes/07-issues/02-issue-supply.md).
