# `CU-ALM-04` — Retirar material

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ALM-04` |
| Nombre | Retirar material. |
| Actor y disparador | **Actor:** Personal de almacén o Administrador del sistema. **Disparador:** determina que debe retirar material y solicita la eliminación. |
| Participación de actor y sistema | **Actor:** solicita y confirma el retiro.<br>**Nexus:** comprueba historia y relaciones, ejecuta sólo el retiro permitido e informa el resultado. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de retiro.<br>3. El recurso objetivo existe.<br>4. El recurso se encuentra en un estado que permite retirarlo. |
| Flujo principal | 1. **Actor:** selecciona un material y solicita retirarlo **(ver E1)**.<br>2. **Nexus:** identifica el material y solicita confirmar la eliminación.<br>3. **Actor:** confirma que desea retirarlo.<br>4. **Nexus:** comprueba si el material tiene historia protegida o relaciones con proveedores **(ver A1)**.<br>5. **Nexus:** elimina la relación proveedor-material y, cuando no quedan otras relaciones ni historia protegida, elimina también la identidad del material; después actualiza el listado y confirma el retiro. |
| Flujos alternativos | **A1 — Material con historia o relaciones protegidas (después del paso 4):**<br>1. **Actor:** revisa el conflicto y las relaciones que Nexus informa.<br>2. **Nexus:** conserva la identidad, la existencia y la historia del material sin efectuar una eliminación parcial.<br>3. **Actor:** reconoce que el material no puede retirarse en esas condiciones; termina el caso de uso. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La relación seleccionada deja de estar disponible y la identidad sólo se elimina si no conserva otras relaciones ni historia protegida.<br>2. **Fallo:** La identidad, las relaciones, la existencia y la historia permanecen sin cambios; no se produce un retiro parcial ni se expone información no autorizada. |
| Requisitos relacionados | `RF-CAT-008`, `RN-007`. |
