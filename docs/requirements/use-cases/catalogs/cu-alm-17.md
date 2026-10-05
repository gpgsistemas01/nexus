# `CU-ALM-17` — Consultar consumibles

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ALM-17` |
| Nombre | Consultar consumibles. |
| Actor | Personal de almacén o Administrador del sistema. |
| Disparador | Abre el módulo **Consumibles**. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con `materials:read`. |
| Flujo principal | 1. **Actor:** abre **Almacén → Consumibles** **(ver E1)**.<br>2. **Nexus:** comprueba el permiso, consulta únicamente ofertas cuya identidad está clasificada como `CONSUMABLE` y muestra proveedor, existencia, stock mínimo, presentación y unidad; no muestra dimensiones ni mezcla materiales regulares.<br>3. **Actor:** captura un término de búsqueda, elige un proveedor o combina ambos criterios y solicita filtrar **(ver A1)**.<br>4. **Nexus:** aplica búsqueda, proveedor, orden y paginación al mismo contexto `CONSUMABLE`, actualiza totales y tabla y presenta sólo las acciones permitidas de alta, edición, retiro, ajuste y exportación **(ver A2)** **(ver EBD)**. |
| Flujos alternativos | **A1 — Limpiar o continuar la consulta (después del paso 3):**<br>1. **Actor:** limpia los criterios o conserva el resultado actual.<br>2. **Nexus:** restablece o mantiene la tabla sin modificar datos ni existencias; termina el caso.<br>**A2 — Iniciar otra operación (después del paso 4):**<br>1. **Actor:** selecciona alta, edición, retiro, ajuste o exportación.<br>2. **Nexus:** termina la consulta e inicia `CU-ALM-18`, `CU-ALM-19`, `CU-ALM-20`, `CU-ALM-21` o `CU-ALM-22`, que vuelve a comprobar sus propias precondiciones; la selección no constituye `«include»` ni `«extend»`. |
| Excepciones | **E1 — Acceso rechazado:** Nexus rechaza la consulta sin exponer información no autorizada.<br>**EBD — Error de base de datos o conexión:** Nexus comunica que no pudo completar la consulta y no modifica inventario. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** la tabla contiene sólo ofertas `CONSUMABLE` autorizadas.<br>2. **Fallo:** no se modifican existencias ni relaciones. |
| Requisitos relacionados | `RF-CAT-025`, `RN-034`. |
