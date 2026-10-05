# `CU-ALM-20` — Retirar consumible

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ALM-20` |
| Nombre | Retirar consumible. |
| Actor | Personal de almacén o Administrador del sistema. |
| Disparador | Solicita eliminar la oferta mostrada en `CU-ALM-17`. |
| Precondiciones | 1. El actor inició sesión.<br>2. Cuenta con `materials:write`.<br>3. La oferta pertenece a un consumible existente. |
| Flujo principal | 1. **Actor:** selecciona **Eliminar registro** sobre una oferta **(ver E1)**.<br>2. **Nexus:** muestra la confirmación compartida e identifica que se retirará la relación del proveedor, no un movimiento de stock.<br>3. **Actor:** confirma el retiro **(ver A1)**.<br>4. **Nexus:** comprueba que la oferta pertenezca a una identidad `CONSUMABLE`, que exista y que no tenga historia operativa protegida; elimina la oferta y elimina la identidad sólo cuando no conserva otras ofertas **(ver A2)** **(ver EBD)**.<br>5. **Nexus:** informa el resultado y refresca `CU-ALM-17`. |
| Flujos alternativos | **A1 — Cancelar confirmación (después del paso 3):** el actor cancela; Nexus cierra el aviso y conserva identidad, oferta y existencia.<br>**A2 — Historia protegida, oferta inexistente o tipo distinto (durante el paso 4):** Nexus rechaza la operación completa, informa la causa y conserva identidad, ofertas, existencia e historial sin eliminación parcial. |
| Excepciones | **E1 — Acceso rechazado:** Nexus no presenta ni ejecuta el retiro.<br>**EBD — Error de base de datos:** la transacción revierte cualquier eliminación iniciada. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** la oferta deja de estar disponible y la identidad sólo desaparece si no conserva otras ofertas.<br>2. **Fallo:** identidad, oferta, existencia e historial permanecen sin cambios. |
| Requisitos relacionados | `RF-CAT-028`, `RN-007`, `RN-034`. |
