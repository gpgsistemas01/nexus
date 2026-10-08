# `CU-ALM-20` — Retirar consumible

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ALM-20` |
| Nombre | Retirar consumible. |
| Actor | Personal de almacén o Administrador del sistema. |
| Disparador | Solicita eliminar la oferta mostrada en `CU-ALM-17`. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor tiene autorización para mantener el catálogo de consumibles.<br>3. La oferta pertenece a un consumible existente. |
| Flujo principal | 1. **Actor:** selecciona **Eliminar registro** sobre una oferta **(ver E1)**.<br>2. **Nexus:** muestra la confirmación compartida e identifica que se retirará la relación del proveedor, no un movimiento de stock.<br>3. **Actor:** confirma el retiro **(ver A1)**.<br>4. **Nexus:** comprueba que la oferta pertenezca a un consumible, que exista y que no tenga historia operativa protegida; elimina la oferta y elimina la identidad sólo cuando no conserva otras ofertas **(ver A2)** **(ver EOP)**; informa el resultado y actualiza el listado de consumibles. |
| Flujos alternativos | **A1 — Cancelar el retiro (antes del paso 3):**<br>1. **Actor:** cancela la confirmación.<br>2. **Nexus:** cierra el aviso y conserva el consumible, la oferta y la existencia; termina el caso de uso.<br>**A2 — Historia protegida, oferta inexistente o clasificación distinta (durante el paso 4):**<br>1. **Nexus:** informa la causa del rechazo y conserva el consumible, sus ofertas, la existencia y el historial.<br>2. **Actor:** recibe el aviso; termina el caso de uso. |
| Excepciones | **E1 — Acceso rechazado:** Nexus no presenta ni ejecuta el retiro.<br>**EOP — Operación no completada:** Nexus conserva el artículo, sus ofertas y su historia sin retirar sólo una parte de la información. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** la oferta deja de estar disponible y la identidad sólo desaparece si no conserva otras ofertas.<br>2. **Fallo:** identidad, oferta, existencia e historial permanecen sin cambios. |
| Requisitos relacionados | `RF-CAT-028`, `RN-007`, `RN-034`. |
