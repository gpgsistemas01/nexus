# `CU-ALM-21` — Ajustar existencia de consumible

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ALM-21` |
| Nombre | Ajustar existencia de consumible. |
| Actor | Administrador del sistema. |
| Disparador | Abre **Ajustar stock** desde `CU-ALM-17`. |
| Precondiciones | 1. El actor inició sesión como Administrador del sistema.<br>2. El actor tiene autorización para ajustar existencias de consumibles.<br>3. El consumible y su oferta existen. |
| Flujo principal | 1. **Actor:** selecciona **Ajustar stock** sobre una oferta **(ver E1)**.<br>2. **Nexus:** comprueba el permiso exclusivo, carga la existencia actual y muestra proveedor, nueva cantidad, motivo y observaciones.<br>3. **Actor:** captura en **Nuevo stock** el saldo final no negativo, no la diferencia, selecciona el motivo, agrega las observaciones requeridas y pulsa **Guardar** **(ver A1)**.<br>4. **Nexus:** vuelve a comprobar que el consumible y su oferta existan y pertenezcan al catálogo de consumibles; calcula saldos y diferencia y registra como una sola operación existencia, ajuste, actor y movimiento **(ver A2)** **(ver EOP)**; confirma el nuevo saldo, cierra el diálogo y actualiza el listado de consumibles **(ver E2)**. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** señala los campos que no cumplen las reglas y conserva la captura sin guardar cambios.<br>2. **Actor:** corrige los campos y pulsa **Guardar**; continúa en el paso 4 del flujo principal.<br>**A2 — Consumible u oferta no válidos (durante el paso 4):**<br>1. **Nexus:** informa el motivo del rechazo y conserva el artículo, sus ofertas, existencia e historia sin cambios parciales; termina el caso de uso. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1 o durante el paso 4):**<br>1. **Nexus:** rechaza la solicitud, comunica el motivo y no presenta información ni ejecuta cambios fuera de la autorización del actor; termina el caso de uso.<br>**EOP — Operación no confirmada (durante el paso 4):**<br>1. **Nexus:** comunica que no pudo confirmar el resultado y no anuncia éxito; conserva la captura cuando el formulario sigue disponible. Termina el caso de uso.<br>**E2 — El registro cambió durante la captura (durante el paso 4):**<br>1. **Nexus:** rechaza el guardado por versión desactualizada, conserva la captura sin sobrescribir los datos vigentes y bloquea otro envío; muestra **Cerrar y actualizar inventario**.<br>2. **Actor:** pulsa **Cerrar y actualizar inventario** para consultar el estado vigente.<br>3. **Nexus:** cierra el formulario y actualiza la consulta; termina el caso de uso. Una nueva edición comienza desde el paso 1 con el registro actualizado. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** la existencia refleja el ajuste y conserva motivo, actor y movimiento.<br>2. **Fallo:** la existencia permanece sin cambios. |
| Requisitos relacionados | `RF-CAT-029`, `RF-ADJ-001`, `RF-ADJ-002`, `RN-002`, `RN-005`, `RN-011`, `RN-013`, `RN-030`. |

Familia: [objetivos y realización](index.md).

## Diagramas de realización

- [Selección dependiente y escritura de inventario](../../../architecture/views/processes/05-warehouse/01-inventory-selection-write.md).
