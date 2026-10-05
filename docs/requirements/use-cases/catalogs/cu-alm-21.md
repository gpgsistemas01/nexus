# `CU-ALM-21` — Ajustar existencia de consumible

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ALM-21` |
| Nombre | Ajustar existencia de consumible. |
| Actor | Administrador del sistema. |
| Disparador | Abre **Ajustar existencia** desde `CU-ALM-17`. |
| Precondiciones | 1. El actor inició sesión como Administrador del sistema.<br>2. Cuenta con `materials:adjust-stock`.<br>3. El consumible y su oferta existen. |
| Flujo principal | 1. **Actor:** selecciona **Ajustar stock** sobre una oferta **(ver E1)**.<br>2. **Nexus:** comprueba el permiso exclusivo, carga la existencia actual y muestra proveedor, nueva cantidad, motivo y observaciones.<br>3. **Actor:** captura una cantidad no negativa, selecciona el motivo, agrega las observaciones requeridas y confirma **(ver A1)**.<br>4. **Nexus:** vuelve a comprobar que identidad y oferta existan y sean `CONSUMABLE`; calcula saldos y diferencia y registra atómicamente existencia, ajuste, actor y movimiento **(ver A2)** **(ver EBD)**.<br>5. **Nexus:** confirma el nuevo saldo, cierra el diálogo y refresca `CU-ALM-17`. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):** Nexus señala cantidad, motivo u observaciones, conserva el diálogo y no altera el saldo.<br>**A2 — Recurso inexistente o de otro tipo (durante el paso 4):** Nexus rechaza la operación y no crea ajuste ni movimiento. |
| Excepciones | **E1 — Acceso rechazado:** Nexus no habilita el ajuste.<br>**EBD — Error de base de datos:** la transacción revierte ajuste, movimiento y existencia. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** la existencia refleja el ajuste y conserva motivo, actor y movimiento.<br>2. **Fallo:** la existencia permanece sin cambios. |
| Requisitos relacionados | `RF-CAT-029`, `RF-ADJ-001`, `RF-ADJ-002`, `RN-002`, `RN-005`, `RN-011`, `RN-013`, `RN-030`. |
