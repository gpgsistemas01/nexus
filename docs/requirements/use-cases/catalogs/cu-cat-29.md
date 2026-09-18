# `CU-CAT-29` — Crear rol

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-29` |
| Nombre | Crear rol. |
| Actor y disparador | **Actor:** Administrador del sistema del área Sistemas. **Disparador:** selecciona **Nuevo rol** en `CU-CAT-28` Consultar rol. |
| Participación de actor y sistema | **Actor:** captura y confirma una nueva entrada de Roles.<br>**Nexus:** autoriza, limita los campos, valida, crea y refresca la tabla. |
| Precondiciones | 1. El actor inició sesión y cuenta con autorización para administrar catálogos.<br>2. La pantalla seleccionada corresponde exactamente a **Roles**. |
| Flujo principal | 1. **Administrador:** abre la pantalla **Roles** y selecciona **Nuevo rol** **(ver E1)**.<br>2. **Nexus:** presenta los campos **Nombre** y **Activo**.<br>3. **Administrador:** captura los datos y selecciona **Guardar** **(ver A1)**.<br>4. **Nexus:** revisa la información y crea la entrada de Roles.<br>5. **Nexus:** confirma y refresca la tabla de Roles. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** señala los campos requeridos sin crear la entrada.<br>2. **Administrador:** corrige y vuelve a confirmar; continúa en el paso 4. |
| Excepciones | **E1 — Acceso, recurso o entrada rechazados:**<br>1. **Nexus:** rechaza la operación sin exponer otro catálogo ni producir cambios parciales.<br>2. **Administrador:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La nueva entrada de Roles queda registrada y visible.<br>2. **Fallo:** No se crea ninguna entrada. |
| Requisitos relacionados | `RF-CAT-023`, `RN-001`, `RN-006`. |
