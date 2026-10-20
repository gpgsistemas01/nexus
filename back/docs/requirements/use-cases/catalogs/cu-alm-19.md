# `CU-ALM-19` — Editar consumible

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ALM-19` |
| Nombre | Editar consumible. |
| Actor | Personal de almacén o Administrador del sistema. |
| Disparador | Selecciona **Editar** sobre un renglón de `CU-ALM-17`. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor tiene autorización para mantener el catálogo de consumibles.<br>3. El consumible y la oferta seleccionada existen. |
| Flujo principal | 1. **Actor:** selecciona **Editar registro** sobre una oferta **(ver E1)**.<br>2. **Nexus:** comprueba que el artículo sea un consumible, carga nombre, stock mínimo, costo máximo y estado y mantiene proveedor, presentación, unidad, tipo y existencia fuera de edición.<br>3. **Actor:** modifica uno o más campos admitidos y confirma **(ver A1)**.<br>4. **Nexus:** comprueba que los datos sean válidos y que el artículo siga clasificado como consumible; actualiza como una sola operación los campos compartidos de la identidad y los propios de la oferta seleccionada **(ver A2)** **(ver EOP)**; confirma, cierra el formulario y actualiza el listado de consumibles sin ajustar stock. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** indica qué datos deben corregirse y conserva el formulario sin modificar el consumible ni su oferta.<br>2. **Actor:** corrige y confirma; continúa en el paso 3 del flujo principal, o cancela y termina el caso de uso.<br>**A2 — Artículo duplicado, inexistente o de otra clasificación (durante el paso 4):**<br>1. **Nexus:** informa el conflicto y conserva los datos anteriores y la existencia.<br>2. **Actor:** recibe el aviso; termina el caso de uso. |
| Excepciones | **E1 — Acceso rechazado:** Nexus no habilita la edición.<br>**EOP — Operación no completada:** Nexus conserva los datos anteriores del consumible y de su oferta, sin cambios parciales. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** se guardan sólo los cambios admitidos, sin modificar existencia ni tipo.<br>2. **Fallo:** no se producen cambios parciales. |
| Requisitos relacionados | `RF-CAT-027`, `RN-023`, `RN-027`, `RN-030`, `RN-031`, `RN-034`. |
