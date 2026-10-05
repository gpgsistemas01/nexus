# `CU-ALM-19` — Editar consumible

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ALM-19` |
| Nombre | Editar consumible. |
| Actor | Personal de almacén o Administrador del sistema. |
| Disparador | Selecciona **Editar** sobre un renglón de `CU-ALM-17`. |
| Precondiciones | 1. El actor inició sesión.<br>2. Cuenta con `materials:write`.<br>3. El consumible y la oferta seleccionada existen. |
| Flujo principal | 1. **Actor:** selecciona **Editar registro** sobre una oferta **(ver E1)**.<br>2. **Nexus:** comprueba que la identidad sea `CONSUMABLE`, carga nombre, stock mínimo, costo máximo y estado y mantiene proveedor, presentación, unidad, tipo y existencia fuera de edición.<br>3. **Actor:** modifica uno o más campos admitidos y confirma **(ver A1)**.<br>4. **Nexus:** normaliza y valida los datos y la identidad dentro del tipo `CONSUMABLE`; actualiza atómicamente los campos compartidos de la identidad y los propios de la oferta seleccionada **(ver A2)** **(ver EBD)**.<br>5. **Nexus:** confirma, cierra el formulario y refresca `CU-ALM-17` sin ajustar stock. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):** Nexus identifica los campos y conserva el formulario sin modificar identidad ni oferta.<br>**A2 — Identidad duplicada, inexistente o de otro tipo (durante el paso 4):** Nexus rechaza toda la edición, informa el conflicto y conserva los valores anteriores y la existencia. |
| Excepciones | **E1 — Acceso rechazado:** Nexus no habilita la edición.<br>**EBD — Error de base de datos:** Nexus revierte material y oferta como una sola operación. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** se guardan sólo los cambios admitidos, sin modificar existencia ni tipo.<br>2. **Fallo:** no se producen cambios parciales. |
| Requisitos relacionados | `RF-CAT-027`, `RN-023`, `RN-027`, `RN-030`, `RN-031`, `RN-034`. |
