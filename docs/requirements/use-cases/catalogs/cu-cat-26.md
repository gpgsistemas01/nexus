# `CU-CAT-26` — Editar estado de cumplimiento

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-26` |
| Nombre | Editar estado de cumplimiento. |
| Actor | Administrador del sistema del área Sistemas. |
| Disparador | Selecciona **Editar registro** en la pantalla **Estados de cumplimiento**. |
| Precondiciones | 1. El actor inició sesión y cuenta con autorización para administrar catálogos.<br>2. La entrada existe en **Estados de cumplimiento**. |
| Flujo principal | 1. **Actor:** abre **Estados de cumplimiento** y selecciona **Editar registro** en una fila **(ver E1)**.<br>2. **Nexus:** presenta los valores existentes de **Nombre** y **Activo**.<br>3. **Actor:** modifica los datos y selecciona **Actualizar** **(ver A1)**.<br>4. **Nexus:** revisa la información y actualiza la entrada de Estados de cumplimiento; confirma y refresca la tabla de Estados de cumplimiento. Además, guarda los cambios de la operación en la base de datos **(ver EBD)**. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** señala los campos requeridos y conserva la entrada sin cambios.<br>2. **Actor:** corrige y vuelve a confirmar; continúa en el paso 4. |
| Excepciones | **E1 — Acceso, recurso o entrada rechazados (después del paso 1):**<br>1. **Nexus:** rechaza la operación sin exponer otro catálogo ni producir cambios parciales.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso.<br>**EBD — Error de base de datos o de conexión (durante el paso 4 del flujo principal):**<br>1. **Nexus:** detecta que no puede consultar o guardar la información, revierte cualquier cambio parcial y comunica que la operación no se completó.<br>2. **Actor:** recibe el aviso, conserva los datos capturados cuando existe un formulario y decide reintentar más tarde o terminar el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La entrada de Estados de cumplimiento conserva los cambios admitidos.<br>2. **Fallo:** La entrada conserva su estado anterior. |
| Requisitos relacionados | `RF-CAT-024`, `RN-001`, `RN-006`. |
