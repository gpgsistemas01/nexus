# `CU-CAT-12` — Cambiar estado de proveedor

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-12` |
| Nombre | Cambiar estado de proveedor. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** necesita activar o desactivar un proveedor y selecciona **Editar registro** en `CU-CAT-09` Consultar proveedores. |
| Participación de actor y sistema | **Actor:** selecciona el registro, modifica datos y confirma.<br>**Nexus:** presenta valores vigentes, valida, actualiza y comunica el resultado. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de edición.<br>3. El proveedor objetivo existe. |
| Flujo principal | 1. **Nexus:** abre el mismo formulario utilizado para editar el proveedor **(ver E1)**.<br>2. **Nexus:** muestra sus datos actuales y la casilla **Activo**.<br>3. **Actor:** marca o desmarca **Activo** y selecciona **Actualizar** **(ver A1)**.<br>4. **Nexus:** valida los datos y actualiza el proveedor como parte de la edición.<br>5. **Nexus:** refresca el listado y confirma el cambio de estado. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** valida la información capturada, detecta campos incompletos, formatos incorrectos, relaciones no permitidas o cantidades fuera de las reglas del caso y los señala sin registrar cambios.<br>2. **Actor:** corrige la información indicada y vuelve a confirmar; continúa en el paso 4 del flujo principal. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Activación o desactivación del proveedor.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-CAT-011`. |
