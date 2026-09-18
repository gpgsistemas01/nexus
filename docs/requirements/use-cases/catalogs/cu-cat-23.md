# `CU-CAT-23` — Crear motivo de ajuste

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-23` |
| Nombre | Crear motivo de ajuste. |
| Actor y disparador | **Actor:** Administrador del sistema del área Sistemas. **Disparador:** selecciona **Nuevo motivo de ajuste** en `CU-CAT-22` Consultar motivo de ajuste. |
| Participación de actor y sistema | **Actor:** captura y confirma una nueva entrada de Motivos de ajuste.<br>**Nexus:** autoriza, limita los campos, valida, crea y refresca la tabla. |
| Precondiciones | 1. El actor inició sesión y cuenta con autorización para administrar catálogos.<br>2. La pantalla seleccionada corresponde exactamente a **Motivos de ajuste**. |
| Flujo principal | 1. **Administrador:** abre la pantalla **Motivos de ajuste** y selecciona **Nuevo motivo de ajuste** **(ver E1)**.<br>2. **Nexus:** presenta únicamente los campos **Nombre** y **Activo**.<br>3. **Administrador:** captura los datos y selecciona **Guardar** **(ver A1)**.<br>4. **Nexus:** revisa la información y crea la entrada de Motivos de ajuste.<br>5. **Nexus:** confirma y refresca la tabla de Motivos de ajuste. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** señala los campos requeridos sin crear la entrada.<br>2. **Administrador:** corrige y vuelve a confirmar; continúa en el paso 4. |
| Excepciones | **E1 — Acceso, recurso o entrada rechazados:**<br>1. **Nexus:** rechaza la operación sin exponer otro catálogo ni producir cambios parciales.<br>2. **Administrador:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La nueva entrada de Motivos de ajuste queda registrada y visible.<br>2. **Fallo:** No se crea ninguna entrada. |
| Requisitos relacionados | `RF-CAT-023`, `RN-001`, `RN-006`. |
