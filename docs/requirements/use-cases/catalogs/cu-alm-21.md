# `CU-ALM-21` — Ajustar existencia de consumible

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ALM-21` |
| Nombre | Ajustar existencia de consumible. |
| Actor | Administrador del sistema. |
| Disparador | Abre **Ajustar existencia** desde `CU-ALM-17`. |
| Precondiciones | 1. El actor inició sesión como Administrador del sistema.<br>2. El actor tiene autorización para ajustar existencias de consumibles.<br>3. El consumible y su oferta existen. |
| Flujo principal | 1. **Actor:** selecciona **Ajustar stock** sobre una oferta **(ver E1)**.<br>2. **Nexus:** comprueba el permiso exclusivo, carga la existencia actual y muestra proveedor, nueva cantidad, motivo y observaciones.<br>3. **Actor:** captura una cantidad no negativa, selecciona el motivo, agrega las observaciones requeridas y confirma **(ver A1)**.<br>4. **Nexus:** vuelve a comprobar que el consumible y su oferta existan y pertenezcan al catálogo de consumibles; calcula saldos y diferencia y registra como una sola operación existencia, ajuste, actor y movimiento **(ver A2)** **(ver EOP)**; confirma el nuevo saldo, cierra el diálogo y actualiza el listado de consumibles. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** señala la cantidad, el motivo o las observaciones que deben corregirse y conserva el diálogo sin alterar la existencia.<br>2. **Actor:** corrige y confirma; continúa en el paso 3 del flujo principal, o cancela y termina el caso de uso.<br>**A2 — Consumible inexistente o artículo de otra clasificación (durante el paso 4):**<br>1. **Nexus:** informa el rechazo y no registra un ajuste ni un movimiento.<br>2. **Actor:** recibe el aviso; termina el caso de uso. |
| Excepciones | **E1 — Acceso rechazado:** Nexus no habilita el ajuste.<br>**EOP — Operación no completada:** Nexus conserva la existencia anterior y no registra un ajuste ni un movimiento parcial. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** la existencia refleja el ajuste y conserva motivo, actor y movimiento.<br>2. **Fallo:** la existencia permanece sin cambios. |
| Requisitos relacionados | `RF-CAT-029`, `RF-ADJ-001`, `RF-ADJ-002`, `RN-002`, `RN-005`, `RN-011`, `RN-013`, `RN-030`. |
