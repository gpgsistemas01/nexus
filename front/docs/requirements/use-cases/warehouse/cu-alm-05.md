# `CU-ALM-05` — Ajustar existencia de material

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ALM-05` |
| Nombre | Ajustar existencia de material. |
| Actor | Administrador del sistema. |
| Disparador | Detecta o autoriza una diferencia de existencia de material y abre el ajuste de stock desde la consulta de materiales. |
| Precondiciones | 1. El actor inició sesión como Administrador del sistema.<br>2. El actor cuenta con el permiso para ajustar existencias de materiales.<br>3. El recurso cuya existencia se ajustará existe. |
| Flujo principal | 1. **Actor:** localiza el registro de material y pulsa **Ajustar stock** **(ver E1)**.<br>2. **Nexus:** muestra la identidad y el proveedor de consulta, **Stock actual**, **Cantidad convertida actual**, **Motivo del ajuste**, **Nuevo stock** y **Observaciones**.<br>3. **Actor:** selecciona el motivo, captura el saldo final no negativo en **Nuevo stock**, explica la corrección y pulsa **Guardar** **(ver A1)**.<br>4. **Nexus:** valida autorización, registro, versión, motivo y cantidad; establece el saldo final y registra el ajuste con su diferencia y movimiento sin cambios parciales, conservando la identidad **(ver EOP)**; confirma el resultado y actualiza la consulta **(ver E2)**. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** señala los campos que no cumplen las reglas y conserva la captura sin guardar cambios.<br>2. **Actor:** corrige los campos y pulsa **Guardar**; continúa en el paso 4 del flujo principal. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1 o durante el paso 4):**<br>1. **Nexus:** rechaza la solicitud, comunica el motivo y no presenta información ni ejecuta cambios fuera de la autorización del actor; termina el caso de uso.<br>**EOP — Operación no confirmada (durante el paso 4):**<br>1. **Nexus:** comunica que no pudo confirmar el resultado y no anuncia éxito; conserva la captura cuando el formulario sigue disponible. Termina el caso de uso.<br>**E2 — El registro cambió durante la captura (durante el paso 4):**<br>1. **Nexus:** rechaza el guardado por versión desactualizada, conserva la captura sin sobrescribir los datos vigentes y bloquea otro envío; muestra **Cerrar y actualizar inventario**.<br>2. **Actor:** pulsa **Cerrar y actualizar inventario** para consultar el estado vigente.<br>3. **Nexus:** cierra el formulario y actualiza la consulta; termina el caso de uso. Una nueva edición comienza desde el paso 1 con el registro actualizado. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La existencia del material refleja el ajuste autorizado.<br>2. **Éxito:** El ajuste queda registrado con su motivo y trazabilidad.<br>3. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-CAT-009`, `RF-ADJ-001`, `RF-ADJ-002`, `RN-002`, `RN-005`, `RN-011`, `RN-013`, `RN-030`. |

Familia: [objetivos y realización](index.md).

## Diagramas de realización

- [Selección dependiente y escritura de inventario](../../../architecture/views/processes/05-warehouse/01-inventory-selection-write.md).
