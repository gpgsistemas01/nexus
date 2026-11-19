# `CU-ALM-27` — Editar artículo

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ALM-27` |
| Nombre | Editar artículo. |
| Actor | Personal de almacén o Administrador del sistema con `material-catalogs:manage`. |
| Disparador | Selecciona **Editar** en un artículo de `CU-ALM-25`. |
| Precondiciones | 1. El actor inició sesión y tiene `material-catalogs:manage`.<br>2. El artículo existe. |
| Flujo principal | 1. **Nexus:** presenta la versión consultada y los datos editables.<br>2. **Actor:** modifica los campos habilitados y selecciona **Actualizar**.<br>3. **Nexus:** valida y guarda usando la versión consultada.<br>4. **Nexus:** confirma y actualiza la tabla de Artículos. |
| Flujos alternativos | **A1 — Artículo sin proveedores vinculados:** permite editar nombre, tipo, presentación, unidad, medidas aplicables y stock mínimo. Los documentos registrados conservan sus especificaciones.<br>**A2 — Artículo con proveedor vinculado:** permite editar sólo nombre y stock mínimo; protege tipo, presentación, unidad y medidas.<br>**A3 — Conflicto de versión:** conserva la captura y solicita actualizar la información antes de volver a guardar. |
| Excepciones | **E1 — Artículo inexistente o datos inválidos:** Nexus rechaza la actualización sin modificar el artículo. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** se actualizan sólo los datos admitidos; las ofertas, existencias e historia se conservan.<br>2. **Fallo:** no hay cambios parciales. |
| Requisitos relacionados | `RF-CAT-030`, `RF-VUE-006`, `RD-VUE-002`, `RN-027`, `RN-030` a `RN-032`. |
