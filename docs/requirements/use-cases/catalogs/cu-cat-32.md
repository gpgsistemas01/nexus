# `CU-CAT-32` — Editar rol

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-32` |
| Nombre | Editar rol. |
| Actor y disparador | **Actor:** Administrador del sistema del área Sistemas. **Disparador:** selecciona **Editar registro** en la pantalla **Roles**. |
| Participación de actor y sistema | **Actor:** modifica y confirma una entrada de Roles.<br>**Nexus:** autoriza, limita los campos, valida, actualiza y refresca la tabla. |
| Precondiciones | 1. El actor inició sesión y cuenta con autorización para administrar catálogos.<br>2. La entrada existe en **Roles**. |
| Flujo principal | 1. **Administrador:** abre **Roles** y selecciona **Editar registro** en una fila **(ver E1)**.<br>2. **Nexus:** presenta los valores existentes de **Nombre** y **Activo**.<br>3. **Administrador:** modifica los datos y selecciona **Actualizar** **(ver A1)**.<br>4. **Nexus:** revisa la información y actualiza la entrada de Roles.<br>5. **Nexus:** confirma y refresca la tabla de Roles. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** señala los campos requeridos y conserva la entrada sin cambios.<br>2. **Administrador:** corrige y vuelve a confirmar; continúa en el paso 4. |
| Excepciones | **E1 — Acceso, recurso o entrada rechazados:**<br>1. **Nexus:** rechaza la operación sin exponer otro catálogo ni producir cambios parciales.<br>2. **Administrador:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La entrada de Roles conserva los cambios admitidos.<br>2. **Fallo:** La entrada conserva su estado anterior. |
| Requisitos relacionados | `RF-CAT-024`, `RN-001`, `RN-006`. |
