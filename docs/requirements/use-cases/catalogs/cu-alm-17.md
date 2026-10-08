# `CU-ALM-17` — Consultar consumibles

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ALM-17` |
| Nombre | Consultar consumibles. |
| Actor | Personal de almacén o Administrador del sistema. |
| Disparador | Abre el módulo **Consumibles**. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor tiene autorización para consultar consumibles. |
| Flujo principal | 1. **Actor:** abre **Almacén → Consumibles** **(ver E1)**.<br>2. **Nexus:** comprueba la autorización y muestra las ofertas de consumibles con su proveedor, existencia, stock mínimo, presentación y unidad, sin mezclar materiales **(ver EOP)**.<br>3. **Actor:** captura una búsqueda, elige un proveedor o combina ambos criterios y solicita filtrar.<br>4. **Nexus:** muestra los consumibles que cumplen los criterios, el total y las acciones que el actor está autorizado a realizar **(ver A1)** **(ver A2)** **(ver A3)** **(ver A4)** **(ver A5)** **(ver EOP)**.<br>5. **Actor:** selecciona **Nuevo consumible**; termina la consulta e inicia `CU-ALM-18` Crear consumible. |
| Flujos alternativos | **A1 — Permanecer en la consulta (después del paso 4):**<br>1. **Actor:** revisa el resultado o cambia los criterios.<br>2. **Nexus:** conserva la consulta disponible; si cambia los criterios, continúa en el paso 3 del flujo principal; si sólo revisa el resultado, termina el caso de uso.<br>**A2 — Editar consumible (después del paso 4):**<br>1. **Actor:** selecciona **Editar registro** en una oferta; termina la consulta.<br>2. **Nexus:** inicia `CU-ALM-19` y comprueba las condiciones de edición.<br>**A3 — Retirar consumible (después del paso 4):**<br>1. **Actor:** selecciona **Eliminar registro** en una oferta; termina la consulta.<br>2. **Nexus:** inicia `CU-ALM-20` y comprueba las condiciones de retiro.<br>**A4 — Ajustar existencia (después del paso 4, sólo para el Administrador del sistema):**<br>1. **Actor:** selecciona **Ajustar existencia**; termina la consulta.<br>2. **Nexus:** inicia `CU-ALM-21` y comprueba la autorización exclusiva y las condiciones del ajuste.<br>**A5 — Generar reporte (después del paso 4):**<br>1. **Actor:** selecciona **Exportar Excel**; termina la consulta.<br>2. **Nexus:** inicia `CU-ALM-22` con los criterios seleccionados y comprueba las condiciones del reporte. |
| Excepciones | **E1 — Acceso rechazado:** Nexus rechaza la consulta sin exponer información no autorizada.<br>**EOP — Consulta no disponible:** Nexus comunica que no pudo completar la consulta y no modifica inventario. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** la tabla contiene sólo ofertas de consumibles que el actor está autorizado a consultar.<br>2. **Fallo:** no se modifican existencias ni relaciones. |
| Requisitos relacionados | `RF-CAT-025`, `RN-034`. |
