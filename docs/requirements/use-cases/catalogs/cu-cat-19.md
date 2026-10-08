# `CU-CAT-19` — Crear unidad de medida

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-19` |
| Nombre | Crear unidad de medida. |
| Actor | Administrador del sistema del área Sistemas. |
| Disparador | Selecciona **Nueva unidad de medida** en `CU-CAT-18` Consultar unidad de medida. |
| Precondiciones | 1. El actor inició sesión y tiene autorización para administrar catálogos.<br>2. La pantalla seleccionada corresponde exactamente a **Unidades de medida**. |
| Flujo principal | 1. **Actor:** abre la pantalla **Unidades de medida** y selecciona **Nueva unidad de medida** **(ver E1)**.<br>2. **Nexus:** presenta los campos **Nombre**, **Símbolo** y **Activo**.<br>3. **Actor:** captura los datos y selecciona **Guardar** **(ver A1)**.<br>4. **Nexus:** revisa la información y crea la entrada de Unidades de medida; confirma y refresca la tabla de Unidades de medida **(ver EOP)**. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** señala los campos requeridos sin crear la entrada.<br>2. **Actor:** corrige y vuelve a confirmar; continúa en el paso 4. |
| Excepciones | **E1 — Acceso, recurso o entrada rechazados (después del paso 1):**<br>1. **Nexus:** rechaza la operación sin exponer otro catálogo ni producir cambios parciales.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso.<br>**EOP — Operación no completada (durante el paso 4 del flujo principal):**<br>1. **Nexus:** no puede completar la operación, comunica el fallo y conserva la información anterior sin cambios parciales.<br>2. **Actor:** recibe el aviso, conserva los datos capturados cuando existe un formulario y decide reintentar más tarde o terminar el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La nueva entrada de Unidades de medida queda registrada y visible.<br>2. **Fallo:** No se crea ninguna entrada. |
| Requisitos relacionados | `RF-CAT-023`, `RN-001`, `RN-006`. |
